import { ClientGrpc, Client } from '@nestjs/microservices';
import { OnModuleInit, HttpStatus, Logger, Inject } from '@nestjs/common';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  TwoFactorOtpDto,
  UpdateProfileDto,
  CheckUsernameDto,
  CheckEmailDto,
  RefreshTokenDto,
  GoogleLoginDto,
  AppleLoginDto,
  SendEmailotpDto,
  UploadProfilePictureDto,
  GetUsersDto,
  GetUserByIdDto,
} from './dto/user.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from './user-svc.options';
import * as appleSignin from 'apple-signin-auth';
import { join } from 'path';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, GetUserId } from 'src/guards/auth.guards';
import {
  LoginUserDef,
  Users,
  RefreshTokenDef,
  SendOtpDef,
  MessageDef,
  UploadProfilePictureDef,
  VerifyEmailResponseDef,
  GetBalanceDef,
} from './typeDef/resolver-type';
import { ListUsersDef } from 'src/admin/typeDef/resolver-type';
import { HelperService } from 'src/helper/helper.service';
import { UserServiceInterface } from 'src/_proto/interfaces/user.interface';

/**
 * UserResolver is responsible for handling incoming graphQL requests specific to user microservice and returning responses to the client.
 * @category User
 */
@Resolver((of) => Users)
export class UserResolver implements OnModuleInit {
  /**
   * @param responseHandlerService
   * @param logger winston logger instance.
   * @param helperService
   */
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private helperService: HelperService,
  ) {}

  /**
   * gRPC client instance for user microservice
   */
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  /**
   * it is called once this module has been initialized. Here we create instances of our microservices.
   */
  onModuleInit() {
    this.userService =
      this.userServiceClient.getService<UserServiceInterface>('UserService');
  }

  /**
   * Mutation - login - it is used to login user account.
   * It calls validateUserByPassword on user microservice.
   * @param loginUserDto login credentials of user.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => LoginUserDef, { name: 'login' })
  async login(@Args('input') loginUserDto: LoginUserDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - login - for ${JSON.stringify(loginUserDto)}`,
      );
      const data = await this.userService
        .validateUserByPassword(loginUserDto)
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - Login- for ${JSON.stringify(loginUserDto)} - ${e}`,
      );
      console.log(e);
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - createUser - it is for creating new user account.
   * It calls create on user microservice.
   * @param createUserDto new user information.
   * @returns new created user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => LoginUserDef, { name: 'createUser' })
  async create(@Args('input') createUserDto: CreateUserDto) {
    this.logger.log(
      'info',
      `APT-GATEWAY - create - for ${JSON.stringify(createUserDto)}`,
    );
    try {
      const data = await this.userService.create(createUserDto).toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - create - for ${JSON.stringify(createUserDto)} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - twoFactorOtp - sends one time password to user's email address for 2 factor authentication.
   * It calls twoFactorOtp on user microservice.
   * @param email address of user.
   * @returns message and expiration time for OTP.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => SendOtpDef, { name: 'twoFactorOtp' })
  async twoFactorOtp(@Args('input') { email }: TwoFactorOtpDto) {
    try {
      this.logger.log('info', `APT-GATEWAY - two-factor-otp - for ${email}`);
      const data = await this.userService.twoFactorOtp({ email }).toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - two-factor-otp - for ${email}- ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - twoFactorVerify - used to verify the OTP sent to user's email address for 2 factor authentication.
   * It calls twoFactorVerify on user microservice.
   * @param twoFactorOtpDto email address of user and OTP.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => LoginUserDef, { name: 'twoFactorVerify' })
  async twoFactorVerify(@Args('input') twoFactorOtpDto: TwoFactorOtpDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - two-factor-verify - for ${JSON.stringify(
          twoFactorOtpDto,
        )}`,
      );
      const data = await this.userService
        .twoFactorVerify(twoFactorOtpDto)
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - two-factor-verify - for ${JSON.stringify(
          twoFactorOtpDto,
        )}- ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - googleLogin - used to login into user account using google authentication. It returns the user if already exists otherwise creates a new user using user information from google.
   * It calls googleLogin on user microservice.
   * @param gUser user information from google auth.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => LoginUserDef, { name: 'googleLogin' })
  async googleAuthRedirect(@Args('input') gUser: GoogleLoginDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - Google-redirect - for ${JSON.stringify(gUser)}`,
      );
      const data = await this.userService.googleLogin(gUser).toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - Google-redirect - for ${JSON.stringify(gUser)}- ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - appleLogin - used to login into user account using apple authentication. It returns the user if already exists otherwise creates a new user using user information fetched from apple.
   * It calls appleLogin on user microservice.
   * @param appleLoginDto code and id_token from apple for authentication.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => LoginUserDef, { name: 'appleLogin' })
  async appleLogin(@Args('input') appleLoginDto: AppleLoginDto) {
    try {
      this.logger.log(
        'info',
        `APPLE_LOGIN_DTO  ${JSON.stringify(appleLoginDto)}`,
      );
      const data = await this.userService
        .appleLogin({
          id_token: appleLoginDto.id_token,
          code: appleLoginDto.code,
        })
        .toPromise();

      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - apple-redirect - for ${JSON.stringify(
          appleLoginDto,
        )}- ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - appleRefreshToken - used to get a new authentication token using the refresh token for apple authentication.
   * It performs the calls to apple auth servers.
   * @param refreshTokenDto refresh token.
   * @returns new authentication and refresh token information.
   * @throws BadRequestException - "invalid refresh token" - if refresh token is invalid.
   */
  @Mutation((returns) => RefreshTokenDef, { name: 'appleRefreshToken' })
  async appleRefreshToken(@Args('input') refreshTokenDto: RefreshTokenDto) {
    try {
      this.logger.log(
        'info',
        `APPLE_REFRESH_TOKEN_DTO  ${JSON.stringify(refreshTokenDto)}`,
      );

      const refreshToken = refreshTokenDto.refreshToken;
      const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyIdentifier: process.env.APPLE_KEY_IDENTIFIER || 'eXaunmL',
        privateKeyPath: join(
          __dirname,
          `../../../secrets/${process.env.APPLE_RSA_KEY_NAME}`,
        ),
      });

      const options = {
        clientID: process.env.APPLE_CLIENT_ID,
        clientSecret,
      };
      const result: any = await appleSignin.refreshAuthorizationToken(
        refreshToken,
        options,
      );
      const token = result.id_token;

      const data = await appleSignin.verifyIdToken(
        token,
        process.env.APPLE_CLIENT_ID,
      );
      const expiresIn = data.exp;
      return {
        token,
        message: 'token refreshed successfully',
        expiresIn,
        refreshToken,
      };
    } catch (e) {
      this.logger.log(
        'info',
        `APPLE_REFRESH_TOKEN_DTO  ${JSON.stringify(refreshTokenDto)}`,
      );
      await this.responseHandlerService.response(
        'invalid refresh token',
        HttpStatus.BAD_REQUEST,
        null,
      );
    }
  }

  /**
   * Mutation - uploadUserProfilePicture - It stores the profile picture URL for a user.
   * It calls uploadProfilePicture on user microservice.
   * It requires authentication.
   * @param profileImageUrl  URL of the profile picture.
   * @param user user information of logged in user.
   * @returns message response.
   * @throws BadRequestException - "please send file" - if no profile image URL is sent.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => UploadProfilePictureDef, {
    name: 'uploadUserProfilePicture',
  })
  @Auth()
  async uploadFile(
    @GetUserId() user,
    @Args('input') { profileImageUrl }: UploadProfilePictureDto,
  ) {
    this.logger.log(
      'info',
      `APT-GATEWAY - uploadFile called by user ${user.email}`,
    );
    if (!profileImageUrl) {
      this.logger.log(
        'error',
        `APT-GATEWAY - No file sent by user ${user.email}`,
      );
      await this.responseHandlerService.response(
        { error: 'please send file' },
        HttpStatus.BAD_REQUEST,
        null,
      );
    }

    try {
      this.logger.log(
        'error',
        `APT-GATEWAY - No file sent by user ${user.email}`,
      );
      const data = await this.userService
        .uploadProfilePicture({
          user: user,
          fileUrl: profileImageUrl,
        })
        .toPromise();
      data.profileImageUrl = profileImageUrl;
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - No file sent by user ${user.email}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - sendEmailOtp - send OTP on email for email verification.
   * It calls sendEmailOtp on user microservice.
   * It requires authentication.
   * @param email  email address of user.
   * @param user user information of logged in user.
   * @returns message response and OTP expiration time.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => SendOtpDef, { name: 'sendEmailOtp' })
  @Auth()
  async sendEmailOtp(
    @GetUserId() user,
    @Args('input') { email }: SendEmailotpDto,
  ) {
    this.logger.log(
      'error',
      `APT-GATEWAY - send-email-otp - for ${JSON.stringify(user)} ${email}`,
    );
    try {
      const data = await this.userService
        .sendEmailOtp({ user: user, email })
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - send-email-otp - for ${JSON.stringify(
          user,
        )} ${email} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - verifyEmailOtp - verify the OTP sent on email for email verification.
   * It calls verifyEmailOtp on user microservice.
   * It requires authentication.
   * @param otpDto  email address of user and OTP.
   * @param user user information of logged in user.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => VerifyEmailResponseDef, { name: 'verifyEmailOtp' })
  @Auth()
  async verifyEmailOtp(
    @GetUserId() user,
    @Args('input') otpDto: TwoFactorOtpDto,
  ) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - verify-email-otp - for ${JSON.stringify(
          user,
        )} ${JSON.stringify(otpDto)}`,
      );
      const data = await this.userService
        .verifyEmailOtp({
          user: user,
          otp: otpDto.otp,
          email: otpDto.email,
        })
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - verify-email-otp - for ${JSON.stringify(
          user,
        )} ${JSON.stringify(otpDto)} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - forgotPasswordOtp - send OTP on email for password resetting.
   * It calls forgotPasswordOtp on user microservice.
   * It requires authentication.
   * @param email  email address of user.
   * @returns message response and OTP expiration time.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => SendOtpDef, { name: 'forgotPasswordOtp' })
  async forgotPasswordOtp(@Args('input') { email }: SendEmailotpDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - forgot-password-otp - for ${email}`,
      );
      const data = await this.userService
        .forgotPasswordOtp({ email })
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - forgot-password-otp - for ${email} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - getLoggedInUser - returns the logged in user object.
   * It requires authentication.
   * @param user user information of logged in user.
   * @returns User object.
   */
  @Query((returns) => Users, { name: 'getLoggedInUser' })
  @Auth()
  async getLoggedInUser(@GetUserId() user) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - get-loggedin-user - for ${JSON.stringify(user)}`,
      );
      const data = await this.helperService.serializeUser(user);

      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - get-loggedin-user - for ${JSON.stringify(user)} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - resetPassword - it is used to reset password using current password.
   * It calls resetPassword on user microservice.
   * It requires authentication.
   * @param resetPasswordDto  current and new password.
   * @param user user information of logged in user.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => MessageDef, { name: 'resetPassword' })
  @Auth()
  async resetPassword(
    @GetUserId() user,
    @Args('input') resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - reset-password - for ${user} and ${JSON.stringify(
          resetPasswordDto,
        )}`,
      );
      const data = await this.userService
        .resetPassword({
          user: user,
          newPassword: resetPasswordDto.newPassword,
          currentPassword: resetPasswordDto.currentPassword,
        })
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - reset-password - for ${user} and ${JSON.stringify(
          resetPasswordDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - forgotPassword - it is used to verify the OTP for forget password and reset the user's password.
   * It calls forgotPasswordVerify on user microservice.
   * @param forgotPasswordDto  email, OTP and the new password.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => MessageDef, { name: 'forgotPassword' })
  async forgotPassword(@Args('input') forgotPasswordDto: ForgotPasswordDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - forgot-password - for ${JSON.stringify(
          forgotPasswordDto,
        )}`,
      );
      const data = await this.userService
        .forgotPasswordVerify(forgotPasswordDto)
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - forgot-password - for ${JSON.stringify(
          forgotPasswordDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - updateProfile - updates user profile information.
   * It calls updateProfile on user microservice.
   * It requires authentication.
   * @param updateProfileDto user details to be updated.
   * @param user user information of logged in user.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
  @Mutation((returns) => MessageDef, { name: 'updateProfile' })
  @Auth()
  async updateProfile(
    @GetUserId() user,
    @Args('input') updateProfileDto: UpdateProfileDto,
  ) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - update-profile - for ${JSON.stringify(
          user,
        )} ${JSON.stringify(updateProfileDto)}`,
      );
      if (!user) {
        await this.responseHandlerService.response(
          { error: 'Unauthorized' },
          HttpStatus.UNAUTHORIZED,
          null,
        );
      }
      const dto = JSON.parse(JSON.stringify(updateProfileDto));
      dto.user = user;
      const data = await this.userService.updateProfile(dto).toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - update-profile - for ${JSON.stringify(
          user,
        )} ${JSON.stringify(updateProfileDto)} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - checkEmail - used to check if the email address is unique .
   * It calls checkEmail on user microservice.
   * It requires authentication.
   * @param checkEmailDto user id and new email to be updated.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => MessageDef, { name: 'checkEmail' })
  @Auth()
  async checkEmail(@Args('input') checkEmailDto: CheckEmailDto) {
    this.logger.log(
      'error',
      `APT-GATEWAY - check-email - for ${JSON.stringify(checkEmailDto)}`,
    );
    try {
      const data = await this.userService.checkEmail(checkEmailDto).toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - check-email - for ${JSON.stringify(
          checkEmailDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);

      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - checkUsername - used to check if the user name is unique .
   * It calls checkUsername on user microservice.
   * @param checkUsernameDto user name to be checked.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => MessageDef, { name: 'checkUsername' })
  async checkUsername(@Args('input') checkUsernameDto: CheckUsernameDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - check-username - for ${JSON.stringify(
          checkUsernameDto,
        )}`,
      );
      const data = await this.userService
        .checkUsername(checkUsernameDto)
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - check-username - for ${JSON.stringify(
          checkUsernameDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - getUsersByFilters - used to fetch a list of users.
   * It calls getUsersByFilters on user microservice.
   * @param getUsersDto filter options for users.
   * @returns array of users and count of users.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => ListUsersDef, { name: 'getUsersByFilters' })
  async getUsersByFilters(@Args('input') getUsersDto: GetUsersDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - get users - for ${JSON.stringify(getUsersDto)}`,
      );
      const data = await this.userService
        .getUsersByFilters(getUsersDto)
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - getUsersByFilters - for ${JSON.stringify(
          getUsersDto,
        )} - ${e}`,
      );

      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - getBalance - used to fetch a balance of logged in user.
   * It calls getBalance on user microservice.
   * @param user user information of logged in user.
   * @returns balance information.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => GetBalanceDef, { name: 'getBalance' })
  @Auth()
  async getBalance(@GetUserId() user) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - get-Balance - for ${JSON.stringify(user)}`,
      );
      const data = await this.userService
        .getBalance({ userId: user._id })
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - get-Balance - for ${JSON.stringify(user)} - ${e}`,
      );

      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - getUserById - used to fetch a user by id.
   * It calls getUserById on user microservice.
   * @param getUserByIdDto user id.
   * @returns user object.
   * @throws error received from user service in HTTP format.
   */
  @Query((returns) => Users, { name: 'getUserById' })
  async getUserById(@Args('input') getUserByIdDto: GetUserByIdDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - getUserById - for ${JSON.stringify(getUserByIdDto)}`,
      );

      const data: any = await this.userService
        .getUserById({ ...getUserByIdDto })
        .toPromise();
      return data;
    } catch (e) {
      console.log(e);

      this.logger.log(
        'error',
        `APT-GATEWAY - getUserById - for ${JSON.stringify(
          getUserByIdDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }
}

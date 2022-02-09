/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ClientGrpc, Client } from '@nestjs/microservices';
import {
  OnModuleInit,
  NotFoundException,
  Header,
  HttpStatus,
  UseGuards,
  Logger,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  OtpDto,
  TwoFactorOtpDto,
  UpdateProfileDto,
  CheckUsernameDto,
  CheckEmailDto,
  RefreshTokenDto,
  GoogleLoginDto,
  AppleLoginDto,
  SendEmailotpDto,
  UploadProfilePictureDto,
  UpdateUserDto,
  GetUsersDto,
  GetUserByIdDto,
} from './dto/user.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Role } from 'src/guards/role.enum';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from './user-svc.options';
import { AuthGuard } from '@nestjs/passport';
import * as appleSignin from 'apple-signin-auth';
import { join } from 'path';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Roles, GetUserId } from 'src/guards/auth.guards';
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
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { GraphQLScalarType, GraphQLError } from 'graphql';
import { UserServiceInterface } from 'src/_proto/interfaces/user.interface';

@Resolver((of) => Users)
export class UserResolver implements OnModuleInit {
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private helperService: HelperService,
  ) {}

  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService =
      this.userServiceClient.getService<UserServiceInterface>('UserService');
  }

  // Login
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

  // createuser --> create - user.user.ts - user-msc
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

  // send otp
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

  // two factor auth
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

  // google login
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

  //user/apple-redirect
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

  // refresh token
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

  // uploadprofilepicture --> update - user.user.ts - user-msc
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

  // send otp
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

  // verify email
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

  // otp for forgot password
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

  // fetch logged in user
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

  // reset password
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

  // forgot password
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

  // updateProfile --> update - user.user.ts - user-msc
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

  // check email
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

  // check username
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

  // fetchfilteredusers --> fetch - user.user.ts - user-msc
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

  // getbalance --> get - user.user.ts - user-msc
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

  // fetchuserbyid --> fetch - user.user.ts - user-msc
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

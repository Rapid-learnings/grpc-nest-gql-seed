import { Controller, Inject, Logger, HttpStatus } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { UserService } from "./user.service";
import { LoginUserDto } from "./dto/user.dto";

import { ResponseHandlerService } from "src/helper/response-handler.service";
import * as grpc from "grpc";
const GrpcStatus = grpc.status;

/**
 * UserController is responsible for handling gRPC incoming requests specific to user Service in user.proto and returning responses to the client.
 * it is responsible for defining method handlers for RPC service functions declared in UserService in user.proto.
 * @category User
 */
@Controller()
export class UserController {
  /**
   * @param logger winston logger instance.
   * @param userService
   * @param responseHandlerService
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private userService: UserService,
    private readonly responseHandlerService: ResponseHandlerService
  ) {
    logger.debug("");
    this.userService.createAdmin();
  }

  /**
   * Method Handler for "create" method of UserService in user.proto.
   * it is for creating new user account.
   * @param createUserDto new user information.
   * @returns new created user and authentication token information.
   */
  @GrpcMethod("UserService", "create")
  async create(createUserDto) {
    return await this.userService.signup(createUserDto);
  }

  /**
   * Method Handler for "findOneByEmailOrUsername" method of UserService in user.proto.
   * finds the user with given email or username.
   * @param attempt username or email address of user.
   * @returns the user with given email or username.
   * @throws UnauthorizedException - "Unauthorized" - if user is not found.
   */
  @GrpcMethod("UserService", "findOneByEmailOrUsername")
  async findOneByEmailOrUsername(attempt) {
    const data = await this.userService.findOneByEmailOrUsername(
      attempt.emailOrUsername
    );
    if (!data) {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        GrpcStatus.UNAUTHENTICATED,
        null
      );
    }
    return data;
  }

  /**
   * Method Handler for "findOneById" method of UserService in user.proto.
   * finds the user with given id.
   * @param attempt id of user.
   * @returns the user with given id.
   * @throws UnauthorizedException - "Unauthorized" - if user is not found.
   */
  @GrpcMethod("UserService", "findOneById")
  async findOneById(attempt) {
    const data = await this.userService.findOneById(attempt.id);
    if (!data) {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        GrpcStatus.UNAUTHENTICATED,
        null
      );
    }
    return data;
  }

  /**
   * Method Handler for "validateUserByJwt" method of UserService in user.proto.
   * valdates the given JWT payload and returns user object with new payload.
   * @param payload JWT payload.
   * @returns new JWT token and expiration time with user object.
   */
  @GrpcMethod("UserService", "validateUserByJwt")
  async validateUserByJwt(payload) {
    return await this.userService.validateUserByJwt(payload);
  }

  /**
   * Method Handler for "validateUserByPassword" method of UserService in user.proto.
   * it is used to login user account.
   * @param loginUserDto login credentials of user.
   * @returns user and authentication token information.
   */
  @GrpcMethod("UserService", "validateUserByPassword")
  async validateUserByPassword(loginUserDto: LoginUserDto) {
    return await this.userService.validateUserByPassword(loginUserDto);
  }

  /**
   * Method Handler for "twoFactorOtp" method of UserService in user.proto.
   * sends one time password to user's email address for 2 factor authentication.
   * @param email address of user.
   * @returns message and expiration time for OTP.s
   */
  @GrpcMethod("UserService", "twoFactorOtp")
  async twoFactorOtp({ email }) {
    return await this.userService.twoFactorOtp(email);
  }

  /**
   * Method Handler for "twoFactorVerify" method of UserService in user.proto.
   * used to verify the OTP sent to user's email address for 2 factor authentication.
   * @param twoFactorOtpDto email address of user and OTP.
   * @returns user and authentication token information.
   */
  @GrpcMethod("UserService", "twoFactorVerify")
  async twoFactorVerify(twoFactorOtpDto) {
    return await this.userService.twoFactorVerify(twoFactorOtpDto);
  }

  /**
   * Method Handler for "googleLogin" method of UserService in user.proto.
   * used to login into user account using google authentication. It returns the user if already exists otherwise creates a new user using user information from google.
   * @param gUser user information from google auth.
   * @returns user and authentication token information.
   */
  @GrpcMethod("UserService", "googleLogin")
  async googleLogin(gUser) {
    return this.userService.googleLogin(gUser);
  }

  /**
   * Method Handler for "twoFactorVerify" method of UserService in user.proto.
   * send OTP on email for email verification.
   * @param email  email address of user.
   * @param user user information of logged in user.
   * @returns message response and OTP expiration time.
   */
  @GrpcMethod("UserService", "sendEmailOtp")
  async sendEmailOtp({ user, email }) {
    return await this.userService.sendEmailOtp(user, email);
  }

  /**
   * Method Handler for "verifyEmailOtp" method of UserService in user.proto.
   * verify the OTP sent on email for email verification.
   * @param email  email address of user.
   * @param user user information of logged in user.
   * @param otp OTP to be verified.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
  @GrpcMethod("UserService", "verifyEmailOtp")
  async verifyEmailOtp({ user, otp, email }) {
    return await this.userService.verifyEmailOtp(user, otp, email);
  }

  /**
   * Method Handler for "forgotPasswordOtp" method of UserService in user.proto.
   * send OTP on email for password resetting.
   * @param email  email address of user.
   * @returns message response and OTP expiration time.
   */
  @GrpcMethod("UserService", "forgotPasswordOtp")
  async forgotPasswordOtp({ email }) {
    return await this.userService.forgotPasswordOtp(email);
  }

  /**
   * Method Handler for "resetPassword" method of UserService in user.proto.
   * it is used to reset password using current password.
   * @param resetPasswordDto  current, new password and user information of logged in user.
   * @returns message response.
   */
  @GrpcMethod("UserService", "resetPassword")
  async resetPassword({ user, newPassword, currentPassword }) {
    return await this.userService.resetPassword(user, {
      newPassword,
      currentPassword,
    });
  }

  /**
   * Method Handler for "checkEmail" method of UserService in user.proto.
   * used to check if the email address is unique.
   * @param checkEmailDto user id and new email to be updated.
   * @returns message response.
   */
  @GrpcMethod("UserService", "checkEmail")
  async checkEmail(checkEmailDto) {
    return await this.userService.checkEmail(checkEmailDto);
  }

  /**
   * Method Handler for "checkUsername" method of UserService in user.proto.
   * used to check if the user name is unique .
   * @param checkUsernameDto user name to be checked.
   * @returns message response.
   */
  @GrpcMethod("UserService", "checkUsername")
  async checkUsername(checkUsernameDto) {
    return await this.userService.checkUsername(checkUsernameDto);
  }

  /**
   * Method Handler for "forgotPasswordVerify" method of UserService in user.proto.
   * it is used to verify the OTP for forget password and reset the user's password.
   * @param forgotPasswordDto  email, OTP and the new password.
   * @returns message response.
   */
  @GrpcMethod("UserService", "forgotPasswordVerify")
  async forgotPasswordVerify(forgotPasswordDto) {
    return await this.userService.forgotPasswordVerify(forgotPasswordDto);
  }

  /**
   * Method Handler for "updateProfile" method of UserService in user.proto.
   * updates user profile information.
   * @param updateProfileDto user details to be updated.
   * @returns message response.
   */
  @GrpcMethod("UserService", "updateProfile")
  async updateProfile(updateProfileDto) {
    try {
      return await this.userService.updateProfile(
        updateProfileDto.user,
        updateProfileDto
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Method Handler for "uploadProfilePicture" method of UserService in user.proto.
   * It stores the profile picture URL for a user.
   * @param profilePicDto  URL of the profile picture and user information of logged in user.
   * @returns message response.
   */
  @GrpcMethod("UserService", "uploadProfilePicture")
  async uploadProfilePicture(profilePicDto) {
    return await this.userService.uploadProfilePicture(
      profilePicDto.user,
      profilePicDto
    );
  }

  /**
   * Method Handler for "appleLogin" method of UserService in user.proto.
   * used to login into user account using apple authentication. It returns the user if already exists otherwise creates a new user using user information fetched from apple.
   * @param appleLoginDto code and id_token from apple for authentication.
   * @returns user and authentication token information.
   */
  @GrpcMethod("UserService", "appleLogin")
  async appleLogin(appleLoginDto) {
    return await this.userService.appleLogin(appleLoginDto);
  }

  /**
   * Method Handler for "findOneByAppleId" method of UserService in user.proto.
   * returns the user with given appleId.
   * @param attempt appleId of user.
   * @returns the user with given appleId.
   * @throws UnauthorizedException - "Unauthorized" - if not user is found for given appleId.
   */
  @GrpcMethod("UserService", "findOneByAppleId")
  async findOneByAppleId(attempt) {
    const data = await this.userService.findOneByAppleId(attempt.appleId);
    if (!data) {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        GrpcStatus.UNAUTHENTICATED,
        null
      );
    }
    return data;
  }

  /**
   * Method Handler for "listUsers" method of UserService in user.proto.
   * used to fetch a list of users.
   * It calls getUsersByFilters on user microservice.
   * @param listUsersDto filter options for users.
   * @returns array of users and count of users.
   */
  @GrpcMethod("UserService", "listUsers")
  async listUsers(listUsersDto) {
    try {
      return await this.userService.listUsers(listUsersDto);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Method Handler for "kycCreateApplicant" method of UserService in user.proto.
   * it is used for for creating kyc applicant on Onfido.
   * @param kycApplicantDto information of user.
   * @returns user object with kyc application id.
   */
  @GrpcMethod("UserService", "kycCreateApplicant")
  async kycCreateApplicant(kycApplicantDto) {
    return await this.userService.kycCreateApplicant(kycApplicantDto);
  }

  /**
   * Method Handler for "findByKycIdAndUpdate" method of UserService in user.proto.
   * finds the user with given kycApplicantId and updates it.
   * @param attempt kycApplicantId of user.
   * @returns the updated user with given kycApplicantId.
   */
  @GrpcMethod("UserService", "findByKycIdAndUpdate")
  async findByKycIdAndUpdate(findByKycIdAndUpdateDto) {
    return await this.userService.findByKycIdAndUpdate(findByKycIdAndUpdateDto);
  }

  /**
   * Method Handler for "healthCheck" method of UserService in user.proto.
   * checks if the user service is running properly.
   * @returns response message - "User service is up and running!"
   */
  @GrpcMethod("UserService", "healthCheck")
  async healthCheck(healthCheckDto) {
    return await this.userService.healthCheck(healthCheckDto);
  }

  /**
   * Method Handler for "balanceUpdate" method of UserService in user.proto.
   * updates the user balance.
   * @param balanceUpdateDto new balance to be updated and user information.
   * @returns response message
   */
  @GrpcMethod("UserService", "balanceUpdate")
  async balanceUpdate(balanceUpdateDto) {
    return await this.userService.balanceUpdate(balanceUpdateDto);
  }

  /**
   * Method Handler for "getBalance" method of UserService in user.proto.
   * used to fetch a balance of logged in user.
   * @param getBalanceDto user information of logged in user.
   * @returns balance information.
   * @throws error received from user service in HTTP format.
   */
  @GrpcMethod("UserService", "getBalance")
  async getBalance(getBalanceDto) {
    return await this.userService.getBalance(getBalanceDto);
  }

  /**
   * Method Handler for "getUsersByFilters" method of UserService in user.proto.
   * used to fetch a list of users.
   * @param getUsersDto filter options for users.
   * @returns array of users and count of users.
   * @throws error received from user service in HTTP format.
   */
  @GrpcMethod("UserService", "getUsersByFilters")
  async getUsersByFilters(getUsersDto) {
    return await this.userService.getUsersByFilters(getUsersDto);
  }

  /**
   * Method Handler for "getUserById" method of UserService in user.proto.
   * used to fetch a user by id.
   * @param getUserByIdDto user id.
   * @returns user object.
   */
  @GrpcMethod("UserService", "getUserById")
  async getUserById(getUserByIdDto) {
    try {
      return await this.userService.getUserById(getUserByIdDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Method Handler for "updateWithheldBalance" method of UserService in user.proto.
   * it updates the user withheld balance for given user.
   * @param updateWithheldBalanceDto new balance and user information.
   * @returns message response.
   */
  @GrpcMethod("UserService", "updateWithheldBalance")
  async updateWithheldBalance(updateWithheldBalanceDto) {
    try {
      return await this.userService.updateWithheldBalance(
        updateWithheldBalanceDto
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

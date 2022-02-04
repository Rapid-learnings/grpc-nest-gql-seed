/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Inject, Logger, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserService } from './user.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  OtpDto,
  TwoFactorOtpDto,
} from './dto/user.dto';

import { HelperService } from 'src/helper/helper.service';
import { ResponseHandlerService } from 'src/helper/response-handler.service';

@Controller()
export class UserController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private userService: UserService,
    private readonly responseHandlerService: ResponseHandlerService,
    private readonly helperService: HelperService,
  ) {
    logger.debug('');
    this.userService.createAdmin();
  }

  @GrpcMethod('UserService', 'create')
  async create(createUserDto) {
    return await this.userService.signup(createUserDto);
  }

  @GrpcMethod('UserService', 'findOneByEmailOrUsername')
  async findOneByEmailOrUsername(attempt) {
    const data = await this.userService.findOneByEmailOrUsername(
      attempt.emailOrUsername,
    );
    if (!data) {
      await this.responseHandlerService.response(
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
        null,
      );
    }
    return data;
  }

  @GrpcMethod('UserService', 'findOneById')
  async findOneById(attempt) {
    const data = await this.userService.findOneById(attempt.id);
    if (!data) {
      await this.responseHandlerService.response(
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
        null,
      );
    }
    return data;
  }

  @GrpcMethod('UserService', 'validateUserByJwt')
  async validateUserByJwt(payload) {
    return await this.userService.validateUserByJwt(payload);
  }

  @GrpcMethod('UserService', 'validateUserByPassword')
  async validateUserByPassword(loginUserDto: LoginUserDto) {
    return await this.userService.validateUserByPassword(loginUserDto);
  }

  @GrpcMethod('UserService', 'twoFactorOtp')
  async twoFactorOtp({ email }) {
    return await this.userService.twoFactorOtp(email);
  }

  @GrpcMethod('UserService', 'twoFactorVerify')
  async twoFactorVerify(twoFactorOtpDto) {
    return await this.userService.twoFactorVerify(twoFactorOtpDto);
  }

  @GrpcMethod('UserService', 'googleLogin')
  async googleLogin(gUser) {
    return this.userService.googleLogin(gUser);
  }

  @GrpcMethod('UserService', 'sendEmailOtp')
  async sendEmailOtp({ user, email }) {
    return await this.userService.sendEmailOtp(user, email);
  }

  @GrpcMethod('UserService', 'verifyEmailOtp')
  async verifyEmailOtp({ user, otp, email }) {
    return await this.userService.verifyEmailOtp(user, otp, email);
  }

  @GrpcMethod('UserService', 'forgotPasswordOtp')
  async forgotPasswordOtp({ email }) {
    return await this.userService.forgotPasswordOtp(email);
  }

  @GrpcMethod('UserService', 'resetPassword')
  async resetPassword({ user, newPassword, currentPassword }) {
    return await this.userService.resetPassword(user, {
      newPassword,
      currentPassword,
    });
  }

  @GrpcMethod('UserService', 'checkEmail')
  async checkEmail(checkEmailDto) {
    return await this.userService.checkEmail(checkEmailDto);
  }

  @GrpcMethod('UserService', 'checkUsername')
  async checkUsername(checkUsernameDto) {
    return await this.userService.checkUsername(checkUsernameDto);
  }

  @GrpcMethod('UserService', 'forgotPasswordVerify')
  async forgotPasswordVerify(forgotPasswordDto) {
    return await this.userService.forgotPasswordVerify(forgotPasswordDto);
  }

  @GrpcMethod('UserService', 'updateProfile')
  async updateProfile(updateProfileDto) {
    try {
      return await this.userService.updateProfile(
        updateProfileDto.user,
        updateProfileDto,
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('UserService', 'uploadProfilePicture')
  async uploadProfilePicture(profilePicDto) {
    return await this.userService.uploadProfilePicture(
      profilePicDto.user,
      profilePicDto,
    );
  }

  @GrpcMethod('UserService', 'appleLogin')
  async appleLogin(appleLoginDto) {
    return await this.userService.appleLogin(appleLoginDto);
  }

  @GrpcMethod('UserService', 'findOneByAppleId')
  async findOneByAppleId(attempt) {
    const data = await this.userService.findOneByAppleId(attempt.appleId);
    if (!data) {
      await this.responseHandlerService.response(
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
        null,
      );
    }
    return data;
  }

  // for Admin will import the userService(listUsers)
  @GrpcMethod('UserService', 'listUsers')
  async listUsers(listUsersDto) {
    try {
      return await this.userService.listUsers(listUsersDto);
    } catch (e) {
      throw e;
    }
  }

  @GrpcMethod('UserService', 'kycCreateApplicant')
  async kycCreateApplicant(kycApplicantDto) {
    return await this.userService.kycCreateApplicant(kycApplicantDto);
  }

  @GrpcMethod('UserService', 'findByKycIdAndUpdate')
  async findByKycIdAndUpdate(findByKycIdAndUpdateDto) {
    return await this.userService.findByKycIdAndUpdate(findByKycIdAndUpdateDto);
  }

  @GrpcMethod('UserService', 'healthCheck')
  async healthCheck(healthCheckDto) {
    return await this.userService.healthCheck(healthCheckDto);
  }

  @GrpcMethod('UserService', 'balanceUpdate')
  async balanceUpdate(balanceUpdateDto) {
    return await this.userService.balanceUpdate(balanceUpdateDto);
  }

  @GrpcMethod('UserService', 'getBalance')
  async getBalance(getBalanceDto) {
    return await this.userService.getBalance(getBalanceDto);
  }

  @GrpcMethod('UserService', 'getUsersByFilters')
  async getUsersByFilters(getUsersDto) {
    return await this.userService.getUsersByFilters(getUsersDto);
  }

  @GrpcMethod('UserService', 'getUserById')
  async getUserById(getUserByIdDto) {
    try {
      return await this.userService.getUserById(getUserByIdDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('UserService', 'updateWithheldBalance')
  async updateWithheldBalance(updateWithheldBalanceDto) {
    try {
      return await this.userService.updateWithheldBalance(
        updateWithheldBalanceDto,
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

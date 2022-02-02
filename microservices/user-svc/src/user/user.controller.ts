/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Inject, Logger, HttpStatus } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { UserService } from "./user.service";
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  OtpDto,
  TwoFactorOtpDto,
} from "./dto/user.dto";

import { HelperService } from "src/helper/helper.service";
import { ResponseHandlerService } from "src/helper/response-handler.service";

@Controller()
export class UserController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private userService: UserService,
    private readonly responseHandlerService: ResponseHandlerService,
    private readonly helperService: HelperService
  ) {
    logger.debug("");
    this.userService.createAdmin();
  }

  @GrpcMethod("UserService", "validateUserByPassword")
  async validateUserByPassword(loginUserDto: LoginUserDto) {
    return await this.userService.validateUserByPassword(loginUserDto);
  }

  @GrpcMethod("UserService", "findOneByEmailOrUsername")
  async findOneByEmailOrUsername(attempt) {
    const data = await this.userService.findOneByEmailOrUsername(
      attempt.emailOrUsername
    );
    if (!data) {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        null
      );
    }
    return data;
  }

  @GrpcMethod("UserService", "create")
  async create(createUserDto) {
    return await this.userService.signup(createUserDto);
  }

  @GrpcMethod("UserService", "healthCheck")
  async healthCheck(healthCheckDto) {
    return await this.userService.healthCheck(healthCheckDto);
  }

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

  @GrpcMethod("UserService", "listUsers")
  async listUsers(listUsersDto) {
    try {
      return await this.userService.listUsers(listUsersDto);
    } catch (e) {
      throw e;
    }
  }
}

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Inject, Logger, HttpStatus } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { AdminService } from "./admin.service";
import { HelperService } from "src/helper/helper.service";
import { ResponseHandlerService } from "src/helper/response-handler.service";
import { error } from "winston";

@Controller()
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private adminService: AdminService,
    private readonly responseHandlerService: ResponseHandlerService,
    private readonly helperService: HelperService
  ) {
    logger.debug("");
  }

  @GrpcMethod("AdminService", "listUsers")
  async listUsers(listUsersDto) {
    try {
      return await this.adminService.listUsers(listUsersDto);
    } catch (e) {}
  }
  @GrpcMethod("AdminService", "updateUser")
  async updateUser(updateUserDto) {
    try {
      return await this.adminService.updateUser(updateUserDto);
    } catch (e) {
      throw e;
    }
  }

  @GrpcMethod("AdminService", "updatePlatformConstant")
  async updatePlatformConstant(updatePlatformConstantDto) {
    try {
      return await this.adminService.updatePlatformConstant(
        updatePlatformConstantDto
      );
    } catch (e) {}
  }

  @GrpcMethod("AdminService", "getPlatformConstant")
  async getPlatformConstant(getPlatformConstantDto) {
    try {
      return await this.adminService.getPlatformConstant();
    } catch (e) {}
  }

  @GrpcMethod("AdminService", "healthCheck")
  async healthCheck(healthCheckDto) {
    return await this.adminService.healthCheck(healthCheckDto);
  }
}

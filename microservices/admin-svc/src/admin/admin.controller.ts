/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Inject, Logger, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AdminService } from './admin.service';

/**
 * AdminController is responsible for handling gRPC incoming requests specific to admin Service in admin.proto and returning responses to the client.
 * it is responsible for defining method handlers for RPC service functions declared in AdminService in admin.proto.
 * @category Admin
 */
@Controller()
export class AdminController {
  /**
   * @param logger winston logger instance.
   * @param adminService
   */ constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private adminService: AdminService,
  ) {
    logger.debug('');
  }

  /**
   * Method Handler for "listUsers" method of AdminService in admin.proto.
   * used to fetch a list of users.
   * @param listUsersDto filter options for users.
   * @returns array of users and count of users.
   */
  @GrpcMethod('AdminService', 'listUsers')
  async listUsers(listUsersDto) {
    try {
      return await this.adminService.listUsers(listUsersDto);
    } catch (e) {}
  }

  /**
   * Method Handler for "updateUser" method of AdminService in admin.proto.
   * updates user profile information..
   * @param updateUserDto user details to be updated.
   * @returns message response.
   */
  @GrpcMethod('AdminService', 'updateUser')
  async updateUser(updateUserDto) {
    try {
      return await this.adminService.updateUser(updateUserDto);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Method Handler for "healthCheck" method of AdminService in user.proto.
   * checks if the admin service is running properly.
   * @returns response message - "Admin service is up and running!"
   */
  @GrpcMethod('AdminService', 'healthCheck')
  async healthCheck(healthCheckDto) {
    return await this.adminService.healthCheck(healthCheckDto);
  }
}

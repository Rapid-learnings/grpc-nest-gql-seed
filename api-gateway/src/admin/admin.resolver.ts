/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { Express } from 'express';
import { Auth, Roles, GetUserId } from 'src/guards/auth.guards';

import { OnModuleInit, HttpStatus, Logger, Inject } from '@nestjs/common';
import { ListUsersDto, UpdateUserDto } from './dto/admin.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { AdminServiceClientOptions } from './admin-svc.options';
import { Admins, ListUsersDef, UpdateUserDef } from './typeDef/resolver-type';
import { Role } from 'src/guards/role.enum';
import { AdminServiceInterface } from 'src/_proto/interfaces/admin.interface';

/**
 * UserResolver is responsible for handling incoming graphQL requests specific to user microservice and returning responses to the client.
 * @category Admin
 */
@Resolver((of) => Admins)
export class AdminResolver implements OnModuleInit {
  /**
   * @param responseHandlerService
   * @param logger winston logger instance.
   */
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * gRPC client instance for admin microservice
   */
  @Client(AdminServiceClientOptions)
  private readonly AdminServiceClient: ClientGrpc;

  private adminService: any;

  /**
   * it is called once this module has been initialized. Here we create instances of our microservices.
   */
  onModuleInit() {
    this.adminService =
      this.AdminServiceClient.getService<AdminServiceInterface>('AdminService');
  }

  /**
   * Query - getUsersByFilters - used to fetch a list of users.
   * It calls getUsersByFilters on admin microservice. Only admin and sub admin can access this API.
   * @param listUsersDto filter options for users.
   * @returns array of users and count of users.
   * @throws error received from admin service in HTTP format.
   */
  @Query((returns) => ListUsersDef, { name: 'Users' })
  @Roles(Role.Superadmin, Role.Subadmin)
  @Auth()
  async listUsers(
    @GetUserId() user,
    @Args('input') listUsersDto: ListUsersDto,
  ): Promise<ListUsersDef> {
    this.logger.log(
      'info',
      `APT-GATEWAY - list-users - for ${JSON.stringify(listUsersDto)}`,
    );
    try {
      const data = await this.adminService.listUsers(listUsersDto).toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - list-users - for ${JSON.stringify(listUsersDto)} - ${e}`,
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
   * Mutation - updateUser - updates user profile information.
   * It calls updateUser on admin microservice.
   * It requires authentication. Only admin and sub admin can access this API.
   * @param updateUserDto user details to be updated.
   * @param user user information of logged in user.
   * @returns message response.
   * @throws error received from admin service in HTTP format.
   */
  @Mutation((returns) => UpdateUserDef, { name: 'updateUser' })
  @Roles(Role.Superadmin, Role.Subadmin)
  @Auth()
  async updateUser(
    @GetUserId() user,
    @Args('input') updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(
      'info',
      `APT-GATEWAY - update-users - for ${JSON.stringify(updateUserDto)}`,
    );

    if (updateUserDto.userId === user._id) {
      await this.responseHandlerService.response(
        { error: 'Admin cannot update self' },
        HttpStatus.FORBIDDEN,
        null,
      );
    }

    if (updateUserDto.role && user.role !== Role.Superadmin) {
      await this.responseHandlerService.response(
        { error: 'only admin can change role' },
        HttpStatus.FORBIDDEN,
        null,
      );
    }
    try {
      const data = await this.adminService
        .updateUser(updateUserDto)
        .toPromise();
      return data;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - update-users - for ${JSON.stringify(
          updateUserDto,
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

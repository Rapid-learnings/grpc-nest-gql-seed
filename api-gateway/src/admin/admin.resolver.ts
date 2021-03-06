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

@Resolver((of) => Admins)
export class AdminResolver implements OnModuleInit {
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Client(AdminServiceClientOptions)
  private readonly AdminServiceClient: ClientGrpc;

  private adminService: any;

  onModuleInit() {
    this.adminService =
      this.AdminServiceClient.getService<AdminServiceInterface>('AdminService');
  }

  // listuser --> list - admin.admin.ts -  admin-msc
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

  // updateuser --> update - admin.admin.ts -  admin-msc
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

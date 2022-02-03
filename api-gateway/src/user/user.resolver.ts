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
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Role } from 'src/guards/role.enum';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from './user-svc.options';
import { AuthGuard } from '@nestjs/passport';
import * as appleSignin from 'apple-signin-auth';
import { join } from 'path';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Roles, GetUserId } from 'src/user/guards/auth.guards';
import { LoginUserDef, Users } from './typeDef/resolver-type';
import { ListUsersDef } from 'src/admin/typeDef/resolver-type';
import { HelperService } from 'src/helper/helper.service';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { GraphQLScalarType, GraphQLError } from 'graphql';

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
    this.userService = this.userServiceClient.getService<any>('UserService');
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
}

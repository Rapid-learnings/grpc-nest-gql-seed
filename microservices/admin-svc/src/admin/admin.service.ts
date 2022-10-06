import {
  Injectable,
  HttpStatus,
  OnModuleInit,
  HttpService,
  Inject,
  Logger,
} from '@nestjs/common';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { ClientGrpc, Client } from '@nestjs/microservices';

import { UserServiceClientOptions } from './svc.options';
import * as grpc from 'grpc';
const GrpcStatus = grpc.status;

/**
 * This service contain contains methods and business logic related to admin.
 * @category Admin
 */
@Injectable()
export class AdminService implements OnModuleInit {
  private sentryService: any;

  /**
   * @param logger winston logger instance.
   * @param helperService
   * @param responseHandlerService
   * @param sentryClient sentry client.
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly responseHandlerService: ResponseHandlerService,
    private httpService: HttpService,
    @InjectSentry() private readonly sentryClient: SentryService,
  ) {
    this.sentryService = sentryClient.instance();
  }

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
    this.userService = this.userServiceClient.getService<any>('UserService'); // creating grpc client for user service
  }

  /**
   * used to fetch a list of users.
   * @param listUsersDto filter options for users.
   * @returns array of users and count of users.
   * @throws NotFoundException - "users not found" - in case user is not found.
   */
  async listUsers(listUsersDto) {
    let response = null;
    try {
      response = await this.httpService
        .post(`${process.env.BASE_URL}/admin/listUsers/`, {
          userId: listUsersDto.userId,
          limit: listUsersDto.limit,
          offset: listUsersDto.offset,
          sortBy: listUsersDto.sortBy,
          sortOrder: listUsersDto.sortOrder,
          status: listUsersDto.status,
          isBlocked: listUsersDto.isBlocked,
          role: listUsersDto.role,
          twoFactorAuth: listUsersDto.twoFactorAuth,
          isProfileUpdated: listUsersDto.isProfileUpdated,
          isEmailVerified: listUsersDto.isEmailVerified,
          name: listUsersDto.name,
          email: listUsersDto.email,
          username: listUsersDto.username,
          mobile: listUsersDto.mobile,
        })
        .toPromise();
    } catch (e) {
      await this.sentryService.captureException(e);
      const { error, statusCode } = e.response.data;
      await this.responseHandlerService.response(
        error,
        statusCode,
        GrpcStatus.UNKNOWN,
        null,
      );
    }
    const users = response.data.data.users;
    const totalUsers = response.data.data.totalUsers;
    // check if user exists
    if (!users) {
      await this.responseHandlerService.response(
        'users not found',
        HttpStatus.NOT_FOUND,
        GrpcStatus.NOT_FOUND,
        null,
      );
    }
    return {
      users,
      totalUsers,
    };
  }

  /**
   * updates user profile information..
   * @param updateUserDto user details to be updated.
   * @returns message response.
   * @throws NotFoundException - "users not found" - in case user is not found.
   */
  async updateUser(updateUserDto) {
    let response = null;
    try {
      response = await this.httpService
        .post(`${process.env.BASE_URL}/admin/updateUser/`, {
          isBlocked: updateUserDto.isBlocked,
          userId: updateUserDto.userId,
          email: updateUserDto.email,
          first_name: updateUserDto.first_name,
          last_name: updateUserDto.last_name,
          username: updateUserDto.username,
          profileImageUrl: updateUserDto.profileImageUrl,
          status: updateUserDto.status,
          mobile: updateUserDto.mobile,
          role: updateUserDto.role,
        })
        .toPromise();
    } catch (e) {
      await this.sentryService.captureException(e);
      const { error, statusCode } = e.response.data;
      await this.responseHandlerService.response(
        error,
        statusCode,
        GrpcStatus.UNKNOWN,
        null,
      );
    }
    const user = response.data.data.user;
    const message = response.data.data.message;
    // check if user exists
    if (!user) {
      await this.responseHandlerService.response(
        'users not found',
        HttpStatus.NOT_FOUND,
        GrpcStatus.NOT_FOUND,
        null,
      );
    }
    return {
      user,
      message,
    };
  }

  /**
   * checks if the admin service is running properly.
   * @returns response message - "Admin service is up and running!"
   */
  async healthCheck(healthCheckDto) {
    return {
      message: 'Admin service is up and running!',
    };
  }
}

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

@Injectable()
export class AdminService implements OnModuleInit {
  private sentryService: any;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly responseHandlerService: ResponseHandlerService,
    private httpService: HttpService,
    @InjectSentry() private readonly sentryClient: SentryService,
  ) {
    this.sentryService = sentryClient.instance();
  }

  // declaring client variables for gRPC client
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService'); // creating grpc client for user service
  }

  // list all users
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
      await this.responseHandlerService.response(error, statusCode, null);
    }
    const users = response.data.data.users;
    const totalUsers = response.data.data.totalUsers;
    // check if user exists
    if (!users) {
      await this.responseHandlerService.response(
        'users not found',
        HttpStatus.NOT_FOUND,
        null,
      );
    }
    return {
      users,
      totalUsers,
    };
  }

  // update user
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
      await this.responseHandlerService.response(error, statusCode, null);
    }
    const user = response.data.data.user;
    const message = response.data.data.message;
    // check if user exists
    if (!user) {
      await this.responseHandlerService.response(
        'users not found',
        HttpStatus.NOT_FOUND,
        null,
      );
    }
    return {
      user,
      message,
    };
  }

  // health function
  async healthCheck(healthCheckDto) {
    return {
      message: 'Admin service is up and running!',
    };
  }
}

import { ClientGrpc, Client } from '@nestjs/microservices';
import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/admin.dto';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from '../user/user-svc.options';
import { AdminServiceClientOptions } from './admin-svc.options';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserServiceInterface } from 'src/_proto/interfaces/user.interface';
import { AdminServiceInterface } from 'src/_proto/interfaces/admin.interface';

/**
 * AdminController is responsible for handling incoming requests specific to User and returning responses to the client.
 * It creates a route - "/admin"
 * @category Admin
 */
@Controller('admin')
export class AdminController implements OnModuleInit {
  /**
   * @param responseHandlerService
   * @param logger winston logger instance.
   */
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * gRPC client instance for user microservice
   */
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

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
    this.userService =
      this.userServiceClient.getService<UserServiceInterface>('UserService');
    this.adminService =
      this.AdminServiceClient.getService<AdminServiceInterface>('AdminService');
  }

  /**
   * Post API - "/updateUser" - updates user profile information..
   * It calls updateProfile on user microservice.
   * @param updateUserDto user details to be updated.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
  @Post('updateUser')
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    this.logger.log(
      'info',
      `APT-GATEWAY - update-user rest-api - for ${JSON.stringify(
        updateUserDto,
      )}`,
    );
    try {
      const dto: any = updateUserDto;
      dto.user = { _id: updateUserDto.userId };
      dto.isAdmin = true;
      const data = await this.userService.updateProfile(dto).toPromise();
      return await this.responseHandlerService.response(null, null, data);
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - update-user rest-api - for ${JSON.stringify(
          updateUserDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      //throw e;
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  /**
  /**
   * Post API - "/listUsers" - used to fetch a list of users.
   * It calls getUsersByFilters on user microservice.
   * @param listUsersDto filter options for users.
   * @returns array of users and count of users.
   * @throws error received from user service in HTTP format.
   */
  @Post('listUsers')
  async listUsers(@Body() listUsersDto) {
    this.logger.log(
      'error',
      `APT-GATEWAY - list-users - for ${JSON.stringify(listUsersDto)}`,
    );
    try {
      const data = await this.userService.listUsers(listUsersDto).toPromise();
      return await this.responseHandlerService.response(null, null, data);
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
   * Get API - "/health" - checks if the admin service is running properly.
   * It calls healthCheck on admin microservice.
   * @returns response message - "admin service is up and running!"
   * @throws error received from admin service in HTTP format.
   */
  @Get('health')
  async health() {
    this.logger.log(
      'error',
      `APT-GATEWAY - health - for 
      )}`,
    );
    try {
      const data = await this.adminService
        .healthCheck({ message: 'hi' })
        .toPromise();
      return data.message;
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - health - for 
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

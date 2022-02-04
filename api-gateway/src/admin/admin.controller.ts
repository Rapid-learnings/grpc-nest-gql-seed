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
@Controller('admin')
export class AdminController implements OnModuleInit {
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  @Client(AdminServiceClientOptions)
  private readonly AdminServiceClient: ClientGrpc;

  private adminService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService');
    this.adminService = this.AdminServiceClient.getService<any>('AdminService');
  }

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

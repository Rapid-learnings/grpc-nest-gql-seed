import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  HttpStatus,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { ClientGrpc, Client } from '@nestjs/microservices';
import { AdminServiceClientOptions } from './admin-svc.options';
import { HelperService } from 'src/helper/helper.service';

@Injectable()
export class Admin2Service {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private helperService: HelperService,
  ) {}

  @Client(AdminServiceClientOptions)
  private readonly adminServiceClient: ClientGrpc;

  private adminService: any;

  onModuleInit() {
    this.adminService = this.adminServiceClient.getService<any>('AdminService');
  }

  async getPlatformConstant() {
    const data = await this.adminService.getPlatformConstant({}).toPromise();
    return data.platformConstant;
  }
}

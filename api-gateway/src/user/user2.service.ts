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
import { UserServiceClientOptions } from './user-svc.options';
import { HelperService } from 'src/helper/helper.service';

@Injectable()
export class User2Service {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private helperService: HelperService,
  ) {}

  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService');
  }

  async findOneByEmailOrUsername(emailOrUsername) {
    const data = await this.userService
      .findOneByEmailOrUsername({ emailOrUsername })
      .toPromise();
    return data;
  }

  async findOneByAppleId(appleId) {
    const data = await this.userService
      .findOneByAppleId({ appleId })
      .toPromise();
    return data;
  }

  async findOneById(id) {
    let data = await this.userService.findOneById({ id }).toPromise();
    data = await this.helperService.serializeUser(data);
    return data;
  }

  async validateUserByJwt(payload) {
    const data = await this.userService.validateUserByJwt(payload).toPromise();
    return data;
  }

  async searchUsers(searchUsersDto) {
    const data = await this.userService.searchUsers(searchUsersDto).toPromise();
    return data;
  }
}

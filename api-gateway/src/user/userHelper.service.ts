import { Injectable, Logger, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ClientGrpc, Client } from '@nestjs/microservices';

import { UserServiceClientOptions } from './user-svc.options';
import { HelperService } from 'src/helper/helper.service';
import { UserServiceInterface } from 'src/_proto/interfaces/user.interface';

/**
 * User2Service is responsible for providing access to certain function in user microservice to be used in different parts of API Gateway.
 * @category User
 */
@Injectable()
export class User2Service {
  /**
   *
   * @param logger instance of winston logger
   * @param helperService
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private helperService: HelperService,
  ) {}

  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService =
      this.userServiceClient.getService<UserServiceInterface>('UserService');
  }

  /**
   * It calls findOneByEmailOrUsername on user microservice.
   * @param emailOrUsername username or email address of user.
   * @returns the user with given email or username.
   * @throws error received from user service in HTTP format.
   */
  async findOneByEmailOrUsername(emailOrUsername) {
    const data = await this.userService
      .findOneByEmailOrUsername({ emailOrUsername })
      .toPromise();
    return data;
  }

  /**
   * returns the user with given appleId.
   * It calls findOneByAppleId on user microservice.
   * @param appleId appleId of user.
   * @returns the user with given appleId.
   */
  async findOneByAppleId(appleId) {
    const data = await this.userService
      .findOneByAppleId({ appleId })
      .toPromise();
    return data;
  }

  /**
   * returns the user with given userId.
   * It calls findOneById on user microservice.
   * @param id userId of user.
   * @returns the user with given userId.
   */
  async findOneById(id) {
    let data = await this.userService.findOneById({ id }).toPromise();
    data = await this.helperService.serializeUser(data);
    return data;
  }

  /**
   * returns the user with given appleId.
   * It calls validateUserByJwt on user microservice.
   * @param payload JWT payload.
   * @returns new JWT token and expiration time.
   */
  async validateUserByJwt(payload) {
    const data = await this.userService.validateUserByJwt(payload).toPromise();
    return data;
  }

  /**
   * returns the list of users.
   * It calls searchUsers on user microservice.
   * @param searchUsersDto search user options.
   * @returns new JWT token and expiration time.
   */
  async searchUsers(searchUsersDto) {
    const data = await this.userService.searchUsers(searchUsersDto).toPromise();
    return data;
  }
}

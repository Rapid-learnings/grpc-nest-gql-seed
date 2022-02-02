/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import { ClientGrpc, Client } from '@nestjs/microservices';
import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  OnModuleInit,
  NotFoundException,
  Header,
  HttpStatus,
  UseGuards,
  Logger,
  Inject,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  OtpDto,
  TwoFactorOtpDto,
  UpdateProfileDto,
  CheckUsernameDto,
  CheckEmailDto,
  RefreshTokenDto,
  KycApplicantDto,
  KycVerificationDto,
} from './dto/user.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Role } from 'src/guards/role.enum';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from './user-svc.options';
import { User2Service } from './user2.service';
import { GeetestService, GeetestVerifyGuard } from 'nestjs-geetest';
import { Auth, Roles, GetUserId } from 'src/guards/rest-auth.guard';
import { Onfido, Region, Applicant, OnfidoApiError } from '@onfido/api';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController implements OnModuleInit {
  private onfido: any;

  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private user2Service: User2Service,
    private readonly geetestService: GeetestService,
  ) {
    this.onfido = new Onfido({
      apiToken: process.env.ONFIDO_API_TOKEN,
      // Supports Region.EU, Region.US and Region.CA
      region: Region.EU,
    });
  }

  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService');
  }

  @Post('/login')
  async login(@Body() loginUserDto) {
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

  @Post('/create')
  async create(@Body() createUserDto) {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - create - for ${JSON.stringify(createUserDto)}`,
      );
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

  @Get('health')
  async health() {
    this.logger.log(
      'error',
      `APT-GATEWAY - health - for 
      )}`,
    );
    try {
      const data = await this.userService
        .healthCheck({ message: 'hi' })
        .toPromise();
      return data.message;
    } catch (e) {
      console.log(e);
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

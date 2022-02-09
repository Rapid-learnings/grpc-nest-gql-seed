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
  UpdateUserDto,
} from './dto/user.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Role } from 'src/guards/role.enum';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from './user-svc.options';
import { AuthGuard } from '@nestjs/passport';
import * as appleSignin from 'apple-signin-auth';
import { join } from 'path';
import { User2Service } from './userHelper.service';
import {
  GeetestService,
  GeetestVerifyGuard,
  GeetestRegisterResultInterface,
} from 'nestjs-geetest';
import { Auth, Roles, GetUserId } from 'src/guards/rest-auth.guard';
import { Onfido, Region, Applicant, OnfidoApiError } from '@onfido/api';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserServiceInterface } from 'src/_proto/interfaces/user.interface';
import {
  LoginUserDef,
  MessageDef,
  Users,
  UpdateUserDef,
} from './typeDef/resolver-type';

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
    this.userService =
      this.userServiceClient.getService<UserServiceInterface>('UserService');
  }

  @Get('/register-captcha')
  async register(@Req() req): Promise<GeetestRegisterResultInterface> {
    this.logger.log('info', `APT-GATEWAY - register-captcha `);
    const data = await this.geetestService.register({
      t: Date.now().toString(),
    });
    return data;
  }

  @Post('/login')
  @UseGuards(GeetestVerifyGuard)
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginUserDef> {
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
  @UseGuards(GeetestVerifyGuard)
  async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserDto> {
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

  @Post('/kyc')
  @Auth()
  @UseInterceptors(FileInterceptor('document'))
  async kycVerification(
    @GetUserId() user,
    @UploadedFile() file: Express.Multer.File,
    @Body() kycVerificationDto: KycVerificationDto,
  ): Promise<MessageDef> {
    if (user.kyc_counter && user.kyc_counter >= 1) {
      await this.responseHandlerService.response(
        { error: 'you have reached maximum attempts' },
        HttpStatus.NOT_ACCEPTABLE,
        null,
      );
    }

    if (!(user.email && user.first_name && user.last_name)) {
      await this.responseHandlerService.response(
        { error: 'you must provide email, first_name and last_name' },
        HttpStatus.NOT_ACCEPTABLE,
        null,
      );
    }

    const extension = file.originalname.split('.').reverse()[0];

    if (!['pdf', 'png', 'jpg', 'jpeg'].includes(extension)) {
      this.logger.log(
        'error',
        `APT-GATEWAY - upload/image - only files with extension .${extension}`,
      );
      await this.responseHandlerService.response(
        {
          error:
            'only files with extension - .pdf, .png, .jpeg and .jpg are allowed',
        },
        HttpStatus.BAD_REQUEST,
        null,
      );
    }
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - kycVerification - for ${JSON.stringify(user, null, 2)}`,
      );
      if (!user.kyc_applicant_id) {
        const res = await this.userService
          .kycCreateApplicant({ userId: user._id })
          .toPromise();
        user = res.user;
      }

      const createdDocument = await this.onfido.document.upload({
        applicantId: user.kyc_applicant_id,
        file: {
          contents: file.buffer,
          filepath: 'image.' + extension,
          contentType: file.mimetype,
        },
        type: kycVerificationDto.documentType,
      });
      let webhook: any = null;
      const webhooks = await this.onfido.webhook.list();
      if (webhooks.length > 0) {
        webhook = webhooks[0];
      } else {
        webhook = await this.onfido.webhook.create({
          url: 'https://ao.vrynt.io/api/v1/user/kyc-webhook',
        });
      }

      const check = await this.onfido.check.create({
        applicantId: user.kyc_applicant_id,
        reportNames: ['document'],
        webhookIds: [webhook.id],
      });
      const message = await this.userService
        .findByKycIdAndUpdate({
          kyc_applicant_id: user.kyc_applicant_id,
          kyc_status: 'under_review',
          incrementKycCounter: true,
        })
        .toPromise();
      return {
        message: 'kyc verification started',
      };
    } catch (e) {
      this.logger.log(
        'error',
        `APT-GATEWAY - kycVerification - for ${JSON.stringify(user)} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  @Post('/kyc-webhook')
  async kycVerificationWebhook(@Body() webhookDto) {
    this.logger.log(
      'info',
      `======== WEBHOOK DTO ${JSON.stringify(webhookDto, null, 2)}`,
    );
    if (webhookDto.payload.resource_type === 'check') {
      const check = await this.onfido.check.find(webhookDto.payload.object.id);
      if (check.result === 'clear') {
        const message = await this.userService
          .findByKycIdAndUpdate({
            kyc_applicant_id: check.applicantId,
            kyc_status: 'approved',
          })
          .toPromise();
        this.logger.log(
          'info',
          `======== WEBHOOK DTO ${JSON.stringify(message, null, 2)}`,
        );
      } else {
        await this.userService
          .findByKycIdAndUpdate({
            kyc_applicant_id: check.applicantId,
            kyc_status: 'rejected',
          })
          .toPromise();
      }
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

  @Post('findOneByEmailOrUsername')
  async findOneByEmailOrUsername(
    @Body('emailOrUsername') emailOrUsername,
  ): Promise<Users> {
    this.logger.log(
      'info',
      `APT-GATEWAY - find-One-by-email-or-username - for `,
    );
    const data = await this.userService
      .findOneByEmailOrUsername({ emailOrUsername })
      .toPromise();
    return data;
  }

  async findOneByAppleId(appleId): Promise<Users> {
    const data = await this.userService
      .findOneByAppleId({ appleId })
      .toPromise();
    return data;
  }

  async validateUserByJwt(payload) {
    const data = await this.userService.validateUserByJwt(payload).toPromise();
    return data;
  }

  @Post('updateProfile')
  async updateUser(@Body() updateUserDto): Promise<UpdateUserDef> {
    this.logger.log(
      'info',
      `APT-GATEWAY - update-profile - for ${JSON.stringify(updateUserDto)}`,
    );
    updateUserDto.user = await this.user2Service.findOneById(
      updateUserDto.userId,
    );
    const data = await this.userService
      .updateProfile(updateUserDto)
      .toPromise();
    return data;
  }
}

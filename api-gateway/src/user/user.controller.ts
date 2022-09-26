import { ClientGrpc, Client } from '@nestjs/microservices';
import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  OnModuleInit,
  HttpStatus,
  UseGuards,
  Logger,
  Inject,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  GeetestService,
  GeetestVerifyGuard,
  GeetestRegisterResultInterface,
} from 'nestjs-geetest';
import { Onfido, Region } from '@onfido/api';
import { FileInterceptor } from '@nestjs/platform-express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { UserServiceClientOptions } from './user-svc.options';
import {
  CreateUserDto,
  LoginUserDto,
  KycVerificationDto,
} from './dto/user.dto';
import { User2Service } from './userHelper.service';
import { Auth, GetUserId } from 'src/guards/rest-auth.guard';
import { UserServiceInterface } from 'src/_proto/interfaces/user.interface';
import {
  LoginUserDef,
  MessageDef,
  Users,
  UpdateUserDef,
} from './typeDef/resolver-type';

/**
 * UserController is responsible for handling incoming requests specific to user microservice and returning responses to the client.
 * It creates a route - "/user"
 * @category User
 */
@Controller('user')
export class UserController implements OnModuleInit {
  /**
   * onfido instance
   */
  private onfido: any;

  /**
   *
   * @param responseHandlerService
   * @param logger instance of winston logger
   * @param user2Service
   * @param geetestService geetest captcha service from "nestjs-geetest"
   */
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
    this.userService =
      this.userServiceClient.getService<UserServiceInterface>('UserService');
  }

  /**
   * Get API - "/register-captcha" - registers a new geetest captcha which is required to be performed before login and signup.
   * It calls register on geetest service.
   * @returns new geetest captcha and challege code
   */
  @Get('/register-captcha')
  async register(): Promise<GeetestRegisterResultInterface> {
    this.logger.log('info', `APT-GATEWAY - register-captcha `);
    const data = await this.geetestService.register({
      t: Date.now().toString(),
    });
    return data;
  }

  /**
   * Post API - "/login" - it is used to login user account.
   * It calls validateUserByPassword on user microservice.
   * It requires Geetest captcha verification.
   * @param loginUserDto login credentials of user.
   * @returns user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
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

  /**
   * Post API - "/create" - it is for creating new user account.
   * It calls create on user microservice.
   * It requires Geetest captcha verification.
   * @param createUserDto new user information.
   * @returns new created user and authentication token information.
   * @throws error received from user service in HTTP format.
   */
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

  /**
   * Post API - "/kyc" - it is used for kyc verification for user account using Onfido kyc services.
   * It calls kycCreateApplicant on user microservice.
   * @param file kyc document file
   * @param kycVerificationDto information of kyc document.
   * @returns response message.
   * @throws error received from user service in HTTP format.
   * @throws NotAcceptableException - "you have reached maximum attempts" - if user has exceeded maximum attempts.
   * @throws NotAcceptableException - "you must provide email, first_name and last_name" - if user has not set email, first name or last name as they are required for kyc verification on Onfido.
   */
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

  /**
   * Post API - "/kyc-webhook" - it is a webhook hit by onfido upon verification of a kyc document. It sends the information whether the verification is approved or rejected.
   * It calls findByKycIdAndUpdate on user microservice.
   * @param webhookDto request body sent by onfido.
   * @throws error received from user service in HTTP format.
   */
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

  /**
   * Get API - "/health" - checks if the user service is running properly.
   * It calls healthCheck on user microservice.
   * @returns response message - "User service is up and running!"
   * @throws error received from user service in HTTP format.
   */
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

  /**
   * Post API - "/findOneByEmailOrUsername" - returns the user with given email or username.
   * It calls findOneByEmailOrUsername on user microservice.
   * @param emailOrUsername username or email address of user.
   * @returns the user with given email or username.
   * @throws error received from user service in HTTP format.
   */
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

  /**
   * returns the user with given appleId.
   * It calls findOneByAppleId on user microservice.
   * @param appleId appleId of user.
   * @returns the user with given appleId.
   * @throws error received from user service in HTTP format.
   */
  async findOneByAppleId(appleId): Promise<Users> {
    const data = await this.userService
      .findOneByAppleId({ appleId })
      .toPromise();
    return data;
  }

  /**
   * valdates the given JWT payload and returns user object with new payload.
   * It calls validateUserByJwt on user microservice.
   * @param payload JWT payload.
   * @returns new JWT token and expiration time.
   * @throws error received from user service in HTTP format  with user object.
   */
  async validateUserByJwt(payload) {
    const data = await this.userService.validateUserByJwt(payload).toPromise();
    return data;
  }

  /**
   * Post API - "/updateProfile" - updates user profile information..
   * It calls updateProfile on user microservice.
   * @param updateUserDto user details to be updated.
   * @returns message response.
   * @throws error received from user service in HTTP format.
   */
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

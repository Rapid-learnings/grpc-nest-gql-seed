/* eslint-disable @typescript-eslint/no-empty-function */
import { ClientGrpc, Client } from '@nestjs/microservices';
import { Express } from 'express';
import {
  Controller,
  Req,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Inject,
} from '@nestjs/common';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { HelperService } from 'src/helper/helper.service';
import { UserServiceClientOptions } from 'src/user/user-svc.options';
import { FileInterceptor } from '@nestjs/platform-express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { Auth } from 'src/guards/rest-auth.guard';

@Controller('upload')
export class UploadController {
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService');
  }

  constructor(
    private responseHandlerService: ResponseHandlerService,
    private helperService: HelperService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post('image')
  @Auth()
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      this.logger.log('error', `APT-GATEWAY - upload/image - No file sent`);
      await this.responseHandlerService.response(
        { error: 'please send file' },
        HttpStatus.BAD_REQUEST,
        null,
      );
    }

    const extension = file.originalname.split('.').reverse()[0];

    if (!['jpeg', 'png', 'jpg'].includes(extension)) {
      this.logger.log(
        'error',
        `APT-GATEWAY - upload/image - only files with extension .${extension}`,
      );
      await this.responseHandlerService.response(
        {
          error: 'only files with extension - .jpeg, .png and .jpg are allowed',
        },
        HttpStatus.BAD_REQUEST,
        null,
      );
    }

    const fileUrl = await this.helperService.uploadFile(file, 'profile');
    if (!fileUrl) {
      this.logger.log(
        'error',
        `APT-GATEWAY - No File returned by AWS for user ${req.user.email}`,
      );
      await this.responseHandlerService.response(
        { error: 'internal server error' },
        500,
        null,
      );
    }
    const data: any = {
      profileImageUrl: fileUrl.Location,
      message: 'file uploaded successfully',
    };
    return await this.responseHandlerService.response(null, null, data);
  }
}

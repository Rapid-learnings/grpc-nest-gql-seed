/* eslint-disable @typescript-eslint/no-empty-function */
import { ClientGrpc, Client } from '@nestjs/microservices';
import { Express } from 'express';
import {
  Controller,
  Req,
  Get,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Inject,
  Body,
} from '@nestjs/common';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { HelperService } from 'src/helper/helper.service';
import { UserServiceClientOptions } from 'src/user/user-svc.options';
import { FileInterceptor } from '@nestjs/platform-express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Library } from 'src/library/library.interface';
import { Auth, Roles, GetUserId } from 'src/guards/rest-auth.guard';

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
    @InjectModel('Library') private libraryModel: Model<Library>,
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

  @Post('libraryImage')
  @UseInterceptors(FileInterceptor('image'))
  async uploadLibraryImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!req.body.modelId) {
      await this.responseHandlerService.response(
        { error: 'modelId is missing' },
        HttpStatus.BAD_REQUEST,
        null,
      );
    }
    if (!req.body.name) {
      await this.responseHandlerService.response(
        { error: 'name is missing' },
        HttpStatus.BAD_REQUEST,
        null,
      );
    }
    if (!file) {
      this.logger.log(
        'error',
        `APT-GATEWAY - upload/libraryImage - No file sent`,
      );
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
    this.logger.log(
      'info',
      `APT-GATEWAY - uploadlibraryFile called for ${JSON.stringify(file)}`,
    );
    let fileUrl;
    try {
      fileUrl = await this.helperService.uploadFile(file, 'library');
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
    } catch (error) {
      this.logger.debug(
        `#API-gateway - error occur in uploading library image. Error: ${error.message} Stack: ${error.Stack}`,
      );
      await this.responseHandlerService.response(
        {
          error: `Error occur in uploading library image. Error: ${error.message}`,
        },
        500,
        null,
      );
    }

    const data: any = {
      imageURL: fileUrl.Location,
      modelId: req.body.modelId,
      name: req.body.name,
    };
    try {
      this.logger.log(
        'info',
        `#API-gateway - saving library image in DB for model: ${data.modelId}}`,
      );
      const createLibraryImage = new this.libraryModel(data);
      await createLibraryImage.save();
      return await this.responseHandlerService.response(null, null, {
        message: `Library image uploaded successfully for model: ${data.modelId}`,
      });
    } catch (error) {
      this.logger.debug(
        `#API-Gateway error occue in saving image in DB for model: ${data.modelId}`,
      );
      await this.responseHandlerService.response(
        { error: { message: error.message, stack: error.Stack } },
        500,
        null,
      );
    }
  }
}

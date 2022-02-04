import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { HelperModule } from '../helper/helper.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [HelperModule, UserModule],
  controllers: [UploadController],
})
export class UploadModule {}

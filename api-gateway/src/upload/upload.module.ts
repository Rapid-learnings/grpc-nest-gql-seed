import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { HelperModule } from '../helper/helper.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { librarySchema } from 'src/library/library.schema';
@Module({
  imports: [
    HelperModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Library', schema: librarySchema }]),
  ],
  controllers: [UploadController],
})
export class UploadModule {}

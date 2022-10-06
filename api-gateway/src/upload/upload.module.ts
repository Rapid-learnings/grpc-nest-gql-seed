import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { HelperModule } from '../helper/helper.module';
import { UserModule } from '../user/user.module';
/**
 * It is a feature module where we keep the controller, service and other code related to file upload functionalities.
 * Here, feature modules imported are - HelperModule and UserModule.
 * @category Upload
 */
@Module({
  imports: [HelperModule, UserModule],
  controllers: [UploadController],
})
export class UploadModule {}

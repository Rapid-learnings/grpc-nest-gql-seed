import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { UserModule } from '../user/user.module';
import { AdminResolver } from './admin.resolver';
import { AdminController } from './admin.controller';

/**
 * It is a feature module where we keep the controller, service and other code related to admin microservice and  we import other modules and configure modules and packages that are being used in this module.
 *
 * Here, feature modules imported are - HelperModule and UserModule.
 * @category Admin
 */
@Module({
  imports: [HelperModule, UserModule],
  providers: [AdminResolver],
  exports: [AdminResolver],
  controllers: [AdminController],
})
export class AdminModule {}

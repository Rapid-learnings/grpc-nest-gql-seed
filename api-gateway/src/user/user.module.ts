import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { HelperModule } from '../helper/helper.module';
import { UserResolver } from './user.resolver';
import { User2Service } from './userHelper.service';
import { GeetestModule } from 'nestjs-geetest';

/**
 * It is a feature module where we keep the controller, service and other code related to user microservice and  we import other modules and configure modules and packages that are being used in this module.
 *
 * Here, feature modules imported are - HelperModule.
 * Other modules imported are: GeetestModule - it enables us to setup Geetest captcha service in our application
 * @category User
 */
@Module({
  imports: [
    HelperModule,
    GeetestModule.forRoot({
      geetestId: process.env.GEETEST_ID,
      geetestKey: process.env.GEETEST_KEY,
    }),
  ],
  controllers: [UserController],
  providers: [UserResolver, User2Service],
  exports: [UserResolver, User2Service],
})
export class UserModule {}

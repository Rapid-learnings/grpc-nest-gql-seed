import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { HelperModule } from '../helper/helper.module';
import { UserResolver } from './user.resolver';
import { User2Service } from './user2.service';
import { GeetestModule } from 'nestjs-geetest';
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

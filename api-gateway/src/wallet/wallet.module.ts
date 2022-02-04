// import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { UserModule } from '../user/user.module';
import { WalletResolver } from './wallet.resolver';
import { WalletController } from './wallet.controller';
@Module({
  imports: [HelperModule, UserModule],
  controllers: [WalletController],
  providers: [WalletResolver],
  exports: [WalletResolver],
})
export class WalletModule {}

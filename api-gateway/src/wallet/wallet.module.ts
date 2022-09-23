import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { UserModule } from '../user/user.module';
import { WalletResolver } from './wallet.resolver';
import { WalletController } from './wallet.controller';

/**
 * It is a feature module where we keep the controller, service and other code related to wallet microservice and  we import other modules and configure modules and packages that are being used in this module.
 *
 * Here, feature modules imported are - HelperModule and UserModule.
 * @category Wallet
 */
@Module({
  imports: [HelperModule, UserModule],
  controllers: [WalletController],
  providers: [WalletResolver],
  exports: [WalletResolver],
})
export class WalletModule {}

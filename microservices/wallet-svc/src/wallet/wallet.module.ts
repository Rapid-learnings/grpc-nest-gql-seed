import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HelperModule } from '../helper/helper.module';
import { paymentSchema } from './wallet.schema';

/**
 * It is a feature module where we keep the controller, service and other code related to wallet functionalities and  we import other modules and configure modules and packages that are being used in this module.
 *
 * Here, feature modules imported are - HelperModule.
 * Other modules are - MongooseModule: here we setup the payment collection and it's schema.
 * @category Wallet
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Payment',
        schema: paymentSchema,
      },
    ]),
    HelperModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}

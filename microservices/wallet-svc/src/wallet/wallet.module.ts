import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HelperModule } from '../helper/helper.module';
import { paymentSchema } from './wallet.schema';
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

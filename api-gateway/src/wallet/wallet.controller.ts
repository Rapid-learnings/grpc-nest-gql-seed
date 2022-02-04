import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  OnModuleInit,
  HttpStatus,
  Param,
  Logger,
  Inject,
  Redirect,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { WalletServiceClientOptions } from './wallet-svc.options';
import * as coinbase from 'coinbase-commerce-node';
import { User2Service } from 'src/user/user2.service';

@Controller('wallet')
export class WalletController implements OnModuleInit {
  private coinbaseWebhook: any;
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private user2Service: User2Service,
  ) {
    this.coinbaseWebhook = coinbase.Webhook;
  }

  @Client(WalletServiceClientOptions)
  private readonly WalletServiceClient: ClientGrpc;

  private walletService: any;

  onModuleInit() {
    this.walletService =
      this.WalletServiceClient.getService<any>('WalletService');
  }

  @Get('stripe/refresh/:id')
  @Redirect()
  async stripeRefreshAccountLink(@Param('id') userId) {
    const user = await this.user2Service.findOneById(userId);
    if (!user) {
      await this.responseHandlerService.response(
        { error: 'user not found' },
        HttpStatus.NOT_FOUND,
        null,
      );
    }

    if (!user.stripe_account_id) {
      await this.responseHandlerService.response(
        { error: 'not connected stripe account found' },
        HttpStatus.NOT_FOUND,
        null,
      );
    }

    const data = await this.walletService
      .stripeCreateAccountLinks({
        accountId: user.stripe_account_id,
        userId: user._id,
      })
      .toPromise();

    return {
      url: data.url,
    };
  }

  @Get('health')
  async health() {
    try {
      const data = await this.walletService
        .healthCheck({ message: 'hi' })
        .toPromise();
      return data.message;
    } catch (e) {
      console.log(e);
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }

  @Post('cbwebhook')
  async cbWebhook(@Body() webhookDto, @Req() req) {
    this.logger.log(
      'info',
      `#API-Gateway web hook coinbase: ${JSON.stringify(webhookDto)}`,
    );
    try {
      const coinbaseEvent = webhookDto.event;
      const data = await this.walletService
        .topUpWalletConfirm({
          transactionStatus: coinbaseEvent.type,
          transaction_hash: coinbaseEvent.data.id,
          paymentMethod: 'COINBASE',
        })
        .toPromise();
      return data;
    } catch (e) {
      console.log(e);
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }
}

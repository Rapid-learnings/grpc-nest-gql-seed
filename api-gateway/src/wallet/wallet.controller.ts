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
import { User2Service } from 'src/user/userHelper.service';
import { WalletServiceInterface } from 'src/_proto/interfaces/wallet.interface';
import {
  TopUpWalletConfirmDef,
  stripeRefreshAccountLinkDef,
} from './typeDef/resolver-type';

/**
 * WalletController is responsible for handling incoming requests specific to wallet microservice and returning responses to the client.
 * It creates a route - "/wallet"
 * @category Wallet
 */
@Controller('wallet')
export class WalletController implements OnModuleInit {
  private coinbaseWebhook: any;

  /**
   *
   * @param responseHandlerService
   * @param logger logger instance from winston
   * @param user2Service
   */
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private user2Service: User2Service,
  ) {
    this.coinbaseWebhook = coinbase.Webhook;
  }

  /**
   * gRPC client instance for wallet microservice
   */
  @Client(WalletServiceClientOptions)
  private readonly WalletServiceClient: ClientGrpc;

  private walletService: any;

  /**
   * it is called once this module has been initialized. Here we create instances of our microservices.
   */
  onModuleInit() {
    this.walletService =
      this.WalletServiceClient.getService<WalletServiceInterface>(
        'WalletService',
      );
  }

  /**
   * Get API - "/stripe/refresh/:id" - creates new account link for stripe account of the given user and then redirects to that link.
   * It calls stripeCreateAccountLinks on wallet microservice.
   * @param userId user id
   * @returns new account URL
   * @throws NotFoundException - "user not found" - if user with this id is not found.
   * @throws NotFoundException - "no connected stripe account found" - if the user account does not have any stripe account.
   */
  @Get('stripe/refresh/:id')
  @Redirect()
  async stripeRefreshAccountLink(
    @Param('id') userId: string,
  ): Promise<stripeRefreshAccountLinkDef> {
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
        { error: 'no connected stripe account found' },
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

  /**
   * Get API - "/health" - checks if the wallet service is running properly.
   * It calls healthCheck on wallet microservice.
   * @returns response message - "Wallet service is up and running!"
   * @throws error received from wallet service in HTTP format.
   */
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

  /**
   * Post API - "/cbwebhook" - it is a webhook that is hit by coinbase for any event emitted regarding payments.
   * It calls topUpWalletConfirm on wallet microservice.
   * @param webhookDto request body sent by coinbase
   * @param req HTTP request object.
   * @returns message response - "transaction confirmed - success"
   * @throws error received from wallet service in HTTP format.
   */
  @Post('cbwebhook')
  async cbWebhook(
    @Body() webhookDto,
    @Req() req,
  ): Promise<TopUpWalletConfirmDef> {
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

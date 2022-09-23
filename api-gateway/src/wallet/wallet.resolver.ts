/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { Auth, GetUserId } from 'src/guards/auth.guards';

import { OnModuleInit, HttpStatus, Logger, Inject } from '@nestjs/common';
import {
  createchargeDto,
  CreatePaymentIntentDto,
  CreateStripeAccountDto,
  CheckBalanceDto,
  TopUpWalletDto,
  TopUpWalletConfirmDto,
  ListTransactionsDto,
} from './dto/wallet.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { WalletServiceClientOptions } from './wallet-svc.options';
import {
  Wallets,
  createchargeDef,
  createStripeAccountDef,
  CreatePaymentIntentDef,
  CheckBalanceDef,
  TopUpWalletDef,
  TopUpWalletConfirmDef,
  ListTransactionsDef,
} from './typeDef/resolver-type';
import { WalletServiceInterface } from 'src/_proto/interfaces/wallet.interface';

/**
 * WalletResolver is responsible for handling incoming graphQL requests specific to wallet microservice and returning responses to the client.
 * @category Wallet
 */
@Resolver((of) => Wallets)
export class WalletResolver implements OnModuleInit {
  /**
   * @param responseHandlerService
   * @param logger logger instance from winston
   */
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  /**
   * gRPC client instance for user microservice
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
   * Mutation - createCharge - creates charge in coinbase that can be used to complete payment.
   * It calls createCharge on wallet microservice.
   * @param createChargeDto information related to the payment.
   * @returns information about created charge object.
   * @throws error received from wallet service in HTTP format.
   */
  @Mutation((returns) => createchargeDef, { name: 'createCharge' })
  async createCharge(@Args('input') createChargeDto: createchargeDto) {
    try {
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create charge API.`,
      );
      const data = await this.walletService
        .createCharge(createChargeDto)
        .toPromise();
      this.logger.debug(`#APIGATEWAY - Charge created successfully.`);
      return data;
    } catch (error) {
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create charge API. - ${error}`,
      );
      error.details = JSON.parse(error.details);
      await this.responseHandlerService.response(
        error.details,
        error.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - createStripeAccount - creates account link for creating the new stripe account for given user.
   * It calls createStripeAccount on wallet microservice.
   * It requires authentication.
   * @param user user information of logged in user.
   * @param createStripeAccountDto stripe account return URL.
   * @returns account onboarding URL and message response.
   * @throws error received from wallet service in HTTP format.
   */
  @Mutation((returns) => createStripeAccountDef, {
    name: 'createStripeAccount',
  })
  @Auth()
  async createStripeAccount(
    @Args('input') createStripeAccountDto: CreateStripeAccountDto,
    @GetUserId() user,
  ) {
    try {
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create stripe account API.`,
      );
      const data = await this.walletService
        .createStripeAccount({
          user,
          return_url: createStripeAccountDto.returnUrl,
        })
        .toPromise();
      this.logger.debug(`#APIGATEWAY - stripe account created successfully.`);
      return data;
    } catch (error) {
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create stripe account API. - ${error}`,
      );
      error.details = JSON.parse(error.details);
      await this.responseHandlerService.response(
        error.details,
        error.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - createPaymentIntent - creates stripe payment intent for the logged in user.
   * It calls createPaymentIntent on wallet microservice.
   * It requires authentication.
   * @param user user information of logged in user.
   * @param createPaymentIntentDto payment information like amount.
   * @returns client_secret - unique id for the created payment intent.
   * @throws error received from wallet service in HTTP format.
   * @throws NotFoundException - "stripe account not found" - if the user account does not have any stripe account.
   */
  @Mutation((returns) => CreatePaymentIntentDef, {
    name: 'createPaymentIntent',
  })
  @Auth()
  async createPaymentIntent(
    @GetUserId() user,
    @Args('input') createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    this.logger.debug(
      `#APIGATEWAY - calling wallet service. Create createPaymentIntent API.`,
    );
    if (!user.stripe_account_id) {
      await this.responseHandlerService.response(
        { error: 'stripe account not found' },
        HttpStatus.NOT_FOUND,
        null,
      );
    }
    try {
      const data = await this.walletService
        .createPaymentIntent({
          stripe_account_id: user.stripe_account_id,
          amount: createPaymentIntentDto.amount,
        })
        .toPromise();
      this.logger.debug(`#APIGATEWAY - createPaymentIntent  successfully.`);
      return data;
    } catch (error) {
      console.log(error);
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create createPaymentIntent API. - ${error}`,
      );
      error.details = JSON.parse(error.details);
      await this.responseHandlerService.response(
        error.details,
        error.details.statusCode,
        null,
      );
    }
  }

  /**
   * Query - checkBalance - it is used for checking user balance.
   * It calls checkBalance on wallet microservice.
   * It requires authentication.
   * @param user user information of logged in user.
   * @param checkBalanceDto currency options to check balance for asset code
   * @returns asset balance information.
   * @throws error received from wallet service in HTTP format.
   */
  @Query((returns) => CheckBalanceDef, {
    name: 'checkBalance',
  })
  @Auth()
  async checkBalance(
    @GetUserId() user,
    @Args('input') checkBalanceDto: CheckBalanceDto,
  ) {
    try {
      this.logger.log(
        'info',
        `#APIGATEWAY - calling wallet service. Create checkBalance API - ${JSON.stringify(
          checkBalanceDto,
        )}`,
      );

      const data = await this.walletService
        .checkBalance({ ...checkBalanceDto, userId: user._id })
        .toPromise();
      this.logger.log('info', `#APIGATEWAY - checkBalance  successfully.`);
      return data;
    } catch (error) {
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create checkBalance API. - ${error}`,
      );
      error.details = JSON.parse(error.details);
      await this.responseHandlerService.response(
        error.details,
        error.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - topUpWallet - it is used to add balance to the platform wallet by making a payment through coinbase or stripe.
   * It calls topUpWallet on wallet microservice.
   * It requires authentication.
   * @param user user information of logged in user.
   * @param topUpWalletDto top up payment information like amount.
   * @returns client secret for stripe payment or charge information for coinbase charge created.
   * @throws error received from wallet service in HTTP format.
   */
  @Mutation((returns) => TopUpWalletDef, {
    name: 'topUpWallet',
  })
  @Auth()
  async topUpWallet(
    @GetUserId() user,
    @Args('input') topUpWalletDto: TopUpWalletDto,
  ) {
    try {
      this.logger.log(
        'info',
        `#APIGATEWAY - calling walleta service. Create topUpWallet API - ${JSON.stringify(
          topUpWalletDto,
        )}`,
      );

      const data = await this.walletService
        .topUpWallet({ ...topUpWalletDto, userId: user._id })
        .toPromise();
      this.logger.log('info', `#APIGATEWAY - topUpWallet  successfully.`);
      return data;
    } catch (error) {
      console.log(error);
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create topUpWallet API. - ${error}`,
      );
      error.details = JSON.parse(error.details);
      await this.responseHandlerService.response(
        error.details,
        error.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - topUpWalletConfirm - It is used to confirm the payment once transaction is completed on the frontend.
   * It calls topUpWalletConfirm on wallet microservice.
   * It requires authentication.
   * @param topUpWalletConfirmDto transaction information like id and hash.
   * @param user user information of logged in user.
   * @returns response message.
   * @throws error received from wallet service in HTTP format.
   */
  @Mutation((returns) => TopUpWalletConfirmDef, {
    name: 'topUpWalletConfirm',
  })
  @Auth()
  async topUpWalletConfirm(
    @GetUserId() user,
    @Args('input') topUpWalletConfirmDto: TopUpWalletConfirmDto,
  ) {
    try {
      this.logger.log(
        'info',
        `#APIGATEWAY - calling walleta service. Create topUpWalletConfirm API - ${JSON.stringify(
          topUpWalletConfirmDto,
        )}`,
      );

      const data = await this.walletService
        .topUpWalletConfirm({ ...topUpWalletConfirmDto, userId: user._id })
        .toPromise();
      this.logger.log(
        'info',
        `#APIGATEWAY - topUpWalletConfirm  successfully.`,
      );
      return data;
    } catch (error) {
      console.log(error);
      this.logger.debug(
        `#APIGATEWAY - calling wallet service. Create topUpWalletConfirm API. - ${error}`,
      );
      error.details = JSON.parse(error.details);
      await this.responseHandlerService.response(
        error.details,
        error.details.statusCode,
        null,
      );
    }
  }

  /**
   * Mutation - listTransactions - it is used to get list of all transactions for a user.
   * It calls topUpWalletConfirm on wallet microservice.
   * It requires authentication.
   * @param user user information of logged in user.
   * @param listTransactionsDto filter options for transactions.
   * @returns array of transactions and count of transactions.
   * @throws error received from wallet service in HTTP format.
   */
  @Query((returns) => ListTransactionsDef, { name: 'listTransactions' })
  @Auth()
  async listTransactions(
    @GetUserId() user,
    @Args('input') listTransactionsDto: ListTransactionsDto,
  ): Promise<ListTransactionsDef> {
    try {
      this.logger.log(
        'info',
        `APT-GATEWAY - list-Transactions - for ${JSON.stringify(
          listTransactionsDto,
        )}`,
      );
      const dto: any = listTransactionsDto;
      dto.user = user;
      const data: any = await this.walletService
        .listTransactions({ ...dto, userId: user._id })
        .toPromise();
      return data;
    } catch (e) {
      console.log(e);
      this.logger.log(
        'error',
        `APT-GATEWAY - list-Transactions - for ${JSON.stringify(
          listTransactionsDto,
        )} - ${e}`,
      );
      e.details = JSON.parse(e.details);
      await this.responseHandlerService.response(
        e.details,
        e.details.statusCode,
        null,
      );
    }
  }
}

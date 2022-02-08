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

@Resolver((of) => Wallets)
export class WalletResolver implements OnModuleInit {
  constructor(
    private responseHandlerService: ResponseHandlerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Client(WalletServiceClientOptions)
  private readonly WalletServiceClient: ClientGrpc;

  private walletService: any;

  onModuleInit() {
    this.walletService =
      this.WalletServiceClient.getService<WalletServiceInterface>(
        'WalletService',
      );
  }

  // createCharge --> create - wallet.wallet.ts - wallet-msc
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

  // createStripeAccount --> create - wallet.wallet.ts - wallet-msc
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

  // createPaymentIntent --> create - wallet.wallet.ts - wallet-msc
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

  // checkBalance --> check - wallet.wallet.ts - wallet-msc
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

  // topUpWallet --> topup - wallet.wallet.ts -  wallet-msc
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

  // topupConfirmation --> topUp - wallet.wallet.ts - wallet-msc
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

  // listtransaction --> list - wallet.wallet.ts - wallet-msc
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

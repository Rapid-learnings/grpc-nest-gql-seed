import { Controller, Inject, Logger, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WalletService } from './wallet.service';
import { createChargeDto } from './dto/wallet.dto';

@Controller()
export class WalletController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private walletService: WalletService,
  ) {}

  @GrpcMethod('WalletService', 'hello')
  async hello(createUserDto) {
    return await this.walletService.hello(createUserDto);
  }

  @GrpcMethod('WalletService', 'createCharge')
  async createCahrge(createChargeDto) {
    this.logger.debug(
      `#wallet - create charge api called with data ${JSON.stringify(
        createChargeDto,
      )}`,
    );
    return await this.walletService.createCharge(createChargeDto);
  }

  @GrpcMethod('WalletService', 'createStripeAccount')
  async createStripeAccount(createStripeAccountDto) {
    this.logger.debug(
      `#wallet - create stripe account api called with data ${JSON.stringify(
        createStripeAccountDto,
      )}`,
    );
    return await this.walletService.createStripeAccount(createStripeAccountDto);
  }

  @GrpcMethod('WalletService', 'stripeCreateAccountLinks')
  async stripeCreateAccountLinks(createAccountLinksDto) {
    this.logger.debug(
      `#wallet - create account link api called with data ${JSON.stringify(
        createAccountLinksDto,
      )}`,
    );

    return await this.walletService.stripeCreateAccountLinks(
      createAccountLinksDto.accountId,
      createAccountLinksDto.userId,
      `${process.env.BASE_URL}/wallet/stripe/return/${createAccountLinksDto.userId}`,
    );
  }

  @GrpcMethod('WalletService', 'createPaymentIntent')
  async createPaymentIntent(paymentIntentDto) {
    this.logger.debug(
      `#wallet - create account link api called with data ${JSON.stringify(
        paymentIntentDto,
      )}`,
    );

    try {
      const { client_secret } = await this.walletService.createPaymentIntent(
        paymentIntentDto,
      );
      return {
        client_secret,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('WalletService', 'healthCheck')
  async healthCheck(healthCheckDto) {
    return await this.walletService.healthCheck(healthCheckDto);
  }

  @GrpcMethod('WalletService', 'checkBalance')
  async checkBalance(checkBalanceDto) {
    return await this.walletService.checkBalance(checkBalanceDto);
  }

  @GrpcMethod('WalletService', 'debit')
  async debit(debitDto) {
    try {
      return await this.walletService.debit(debitDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @GrpcMethod('WalletService', 'topUpWallet')
  async topUpWallet(topUpWalletDto) {
    try {
      return await this.walletService.topUpWallet(topUpWalletDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('WalletService', 'topUpWalletConfirm')
  async topUpWalletConfirm(topUpWalletConfirmDto) {
    try {
      return await this.walletService.topUpWalletConfirm(topUpWalletConfirmDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('WalletService', 'createOrUpdateTransaction')
  async createOrUpdateTransaction(transactionDto) {
    try {
      const data = await this.walletService.createOrUpdateTransaction(
        transactionDto,
      );
      return data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('WalletService', 'listTransactions')
  async listTransactions(listTransactionsDto) {
    try {
      return await this.walletService.listTransactions(listTransactionsDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('WalletService', 'calculateRevenueGeneratedFromFees')
  async calculateRevenueGeneratedFromFees(listTransactionsDto) {
    try {
      return await this.walletService.calculateRevenueGeneratedFromFees();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

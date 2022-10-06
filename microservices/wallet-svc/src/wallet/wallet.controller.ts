import { Controller, Inject, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WalletService } from './wallet.service';

/**
 * WalletController is responsible for handling gRPC incoming requests specific to wallet Service in wallet.proto and returning responses to the client.
 * it is responsible for defining method handlers for RPC service functions declared in WalletService in wallet.proto.
 * @category Wallet
 */
@Controller()
export class WalletController {
  /**
   * @param logger winston logger instance.
   * @param walletService
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private walletService: WalletService,
  ) {}

  /**
   * Method Handler for "hello" method in wallet.proto. It was created for testing the connections of wallet microservice with API Gateway.
   * @param createUserDto contains message string.
   * @returns Hello message.
   */
  @GrpcMethod('WalletService', 'hello')
  async hello(createUserDto) {
    return await this.walletService.hello(createUserDto);
  }

  /**
   * Method Handler for "createCharge" method of WalletService in wallet.proto.
   * creates charge in coinbase that can be used to complete payment.
   * @param createChargeDto information related to the payment.
   * @returns information about created charge object.
   */
  @GrpcMethod('WalletService', 'createCharge')
  async createCahrge(createChargeDto) {
    this.logger.debug(
      `#wallet - create charge api called with data ${JSON.stringify(
        createChargeDto,
      )}`,
    );
    return await this.walletService.createCharge(createChargeDto);
  }

  /**
   * Method Handler for "createStripeAccount" method of WalletService in wallet.proto.
   * creates account link for creating the new stripe account for given user.
   * @param createStripeAccountDto stripe_account_id and id of user.
   * @returns new stripe account URL
   */
  @GrpcMethod('WalletService', 'createStripeAccount')
  async createStripeAccount(createStripeAccountDto) {
    this.logger.debug(
      `#wallet - create stripe account api called with data ${JSON.stringify(
        createStripeAccountDto,
      )}`,
    );
    return await this.walletService.createStripeAccount(createStripeAccountDto);
  }

  /**
   * Method Handler for "stripeCreateAccountLinks" method of WalletService in wallet.proto.
   * creates account link for creating the new stripe account for given user.
   * @param createAccountLinksDto stripe account return URL.
   * @returns account onboarding URL and message response.
   */
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

  /**
   * Method Handler for "createPaymentIntent" method of WalletService in wallet.proto.
   * creates stripe payment intent for the logged in user.
   * @param paymentIntentDto payment information like amount..
   * @returns client_secret - unique id for the created payment intent.
   */
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

  /**
   * Method Handler for "createPaymentIntent" method of WalletService in wallet.proto.
   * states that the wallet service is running properly.
   * @param healthCheckDto some message string.
   * @returns response message - "Wallet service is up and running!"
   */
  @GrpcMethod('WalletService', 'healthCheck')
  async healthCheck(healthCheckDto) {
    return await this.walletService.healthCheck(healthCheckDto);
  }

  /**
   * Method Handler for "checkBalance" method of WalletService in wallet.proto.
   * it is used for checking user balance.
   * @param checkBalanceDto currency options to check balance for asset code.
   * @returns asset balance information.
   */
  @GrpcMethod('WalletService', 'checkBalance')
  async checkBalance(checkBalanceDto) {
    return await this.walletService.checkBalance(checkBalanceDto);
  }

  /**
   * Method Handler for "debit" method of WalletService in wallet.proto.
   * it is used for debit some amount of user balance.
   * @param debitDto currency options and amount balance to debit.
   * @returns asset balance information.
   */
  @GrpcMethod('WalletService', 'debit')
  async debit(debitDto) {
    try {
      return await this.walletService.debit(debitDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Method Handler for "topUpWallet" method of WalletService in wallet.proto.
   * it is used to add balance to the platform wallet by making a payment through coinbase or stripe.
   * @param topUpWalletDto top up payment information like amount and user information.
   * @returns client secret for stripe payment or charge information for coinbase charge created.
   */
  @GrpcMethod('WalletService', 'topUpWallet')
  async topUpWallet(topUpWalletDto) {
    try {
      return await this.walletService.topUpWallet(topUpWalletDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Method Handler for "topUpWalletConfirm" method of WalletService in wallet.proto.
   * It is used to confirm the payment once transaction is completed on the frontend.
   * @param topUpWalletConfirmDto transaction information like id and hash and userId.
   * @returns response message.
   */
  @GrpcMethod('WalletService', 'topUpWalletConfirm')
  async topUpWalletConfirm(topUpWalletConfirmDto) {
    try {
      return await this.walletService.topUpWalletConfirm(topUpWalletConfirmDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Method Handler for "createOrUpdateTransaction" method of WalletService in wallet.proto.
   * it creates a new transaction object or updates an existing one.
   * @param transactionDto details of the transaction to be created or updated.
   * @returns the new or updated transaction object and response message.
   */
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

  /**
   * Method Handler for "listTransactions" method of WalletService in wallet.proto.
   * it is used to get list of all transactions for a user.
   * @param listTransactionsDto filter options for transactions and logged in uderId.
   * @returns array of transactions and count of transactions.
   */
  @GrpcMethod('WalletService', 'listTransactions')
  async listTransactions(listTransactionsDto) {
    try {
      return await this.walletService.listTransactions(listTransactionsDto);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Method Handler for "calculateRevenueGeneratedFromFees" method of WalletService in wallet.proto.
   * it calculates the total generated revenue from completed payments.
   * @returns the total generated revenue.
   */
  @GrpcMethod('WalletService', 'calculateRevenueGeneratedFromFees')
  async calculateRevenueGeneratedFromFees({}) {
    try {
      return await this.walletService.calculateRevenueGeneratedFromFees();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

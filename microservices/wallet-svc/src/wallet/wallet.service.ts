import { Injectable, HttpStatus, Logger, Inject } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as axios from 'axios';
import { Payment } from './wallet.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { UserServiceClientOptions } from './svc.options';
import * as grpc from 'grpc';
const GrpcStatus = grpc.status;

const paymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};
let stripe = null;
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class WalletService {
  private sentryService: any;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectModel('Payment') private paymentModel: Model<Payment>,
    private readonly helperService: HelperService,
    private readonly responseHandlerService: ResponseHandlerService,
    @InjectSentry() private readonly sentryClient: SentryService,
  ) {
    //eslint-disable-next-line @typescript-eslint/no-var-requires
    this.sentryService = sentryClient.instance();
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }

  // declaring client variables for gRPC client
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService'); // creating grpc client for user service
  }

  async hello(helloDto) {
    return {
      message: 'HELLO! ' + helloDto.message,
    };
  }

  //coinbase API Functions
  // creating coinbase charge
  async charge(createChargeData: any) {
    const headers = {
      'X-CC-Api-Key': process.env.COINBASE_API_KEY,
      'Content-Type': 'application/json',
      'X-CC-Version': '2018-03-22',
    };
    return new Promise((resolve, reject) => {
      try {
        // calling coinbase webhook
        axios.default
          .post(process.env.CREATE_CHARGE_URL, createChargeData, {
            headers: headers,
          })
          .then((data) => {
            this.logger.debug(
              `#wallet - charge created successfully. Data : ${data.data}`,
            );
            resolve(data); // returning the created charge
          })
          .catch((error) => {
            this.sentryService.captureException(error);
            this.logger.debug(
              `#wallet - error occur in creating charge coinbase API. Error : ${error.message}, ${error.stack}`,
            );
            reject(error);
          });
      } catch (error) {
        this.sentryService.captureException(error);
        reject(error);
      }
    });
  }

  async createChargeinDB(chargeData) {
    this.logger.debug(
      `creating charge entry in DB - ${JSON.stringify(chargeData)}`,
    );
    try {
      // creating a transaction record in DB for the coinbase charge
      const createcharge = new this.paymentModel(chargeData);
      const charge = await createcharge.save();
      this.logger.debug(`charge created in DB. ID - ${chargeData.id}`);
      return charge;
    } catch (error) {
      await this.sentryService.captureException(error);
      this.logger.debug(
        `error occur in creating chargein db. Error - ${error.message} stack - ${error.stack}`,
      );
      throw error;
    }
  }

  // create charge
  async createCharge(createChargeDto) {
    this.logger.debug(
      `create charge function called with data: ${JSON.stringify(
        createChargeDto,
      )}. Calling coinbase commerce function.`,
    );
    try {
      // creating charge for collection and saving it to the db
      const randomUnique = new Date().getTime();
      createChargeDto.id = randomUnique;
      createChargeDto.status = paymentStatus.PENDING;
      this.logger.debug(
        `creating charge  in DB for collection - ${createChargeDto.collectionId}`,
      );
      const createchargeObj = {
        id: randomUnique,
        platform: createChargeDto.platform,
        kind: createChargeDto.kind,
        status: paymentStatus.PENDING,
        amount_in: createChargeDto.amount,
        amount_fee: createChargeDto.fee,
        from: createChargeDto.userId,
        asset_code: createChargeDto.asset_code,
      };
      const createchargeinDB = await this.createChargeinDB(createchargeObj);
      this.logger.debug(
        `charge created in DB successfully. Data - ${JSON.stringify(
          createchargeinDB,
        )}`,
      );
      const createChargeObj = {
        name: createChargeDto.chargeName,
        description: createChargeDto.chargeDescription,
        pricing_type: 'fixed_price',
        local_price: { amount: '0.3', currency: 'USD' },
      };
      const createcharge = await this.charge(createChargeObj);
      this.logger.debug(
        `charge created successfully. Data - ${JSON.stringify(
          createChargeObj,
        )}`,
      );
      return createcharge;
    } catch (error) {
      await this.sentryService.captureException(error);
      this.logger.debug(
        `error occur in creating charge. Error - ${error.message} stack - ${error.stack}`,
      );
      await this.responseHandlerService.response(
        error,
        HttpStatus.NOT_ACCEPTABLE,
        GrpcStatus.UNAUTHENTICATED,
        null,
      );
    }
  }

  // Stripe account link
  async stripeCreateAccountLinks(stripeAccountId, userId, return_url) {
    // creating URL to redirect the user to, for stripe onboarding process
    const accountLinks = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.BASE_URL}/wallet/stripe/refresh/${userId}`,
      return_url,
      type: 'account_onboarding',
    });
    return accountLinks;
  }

  // create stripe account if not already created
  async createStripeAccount({ user, return_url }) {
    try {
      let accountLinks: any = null;
      // if user already has a stripe account, create account onboarding links and return them
      if (user.stripe_account_id) {
        accountLinks = await this.stripeCreateAccountLinks(
          user.stripe_account_id,
          user._id,
          return_url,
        );
        return {
          accountLink: accountLinks.url,
          message: 'account already exists! account link created successfully',
        };
      }
      // creating new account
      const account = await stripe.accounts.create({
        type: 'standard',
      });
      // string the new stripe account id in userId
      axios.default
        .post(process.env.BASE_URL + '/user/updateProfile', {
          userId: user._id,
          stripe_account_id: account.id,
        })
        .then((res) => {
          console.log('response', res);
        })
        .catch((err) => {
          this.sentryService.captureException(err);
          console.log('error', err);
        });
      // create links for account onboarding
      accountLinks = await this.stripeCreateAccountLinks(
        account.id,
        user._id,
        return_url,
      );

      return {
        accountLink: accountLinks.url, // return the link so user can be redirected to this URL
        message: 'new stripe account created successfully',
      };
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(
        e,
        HttpStatus.NOT_ACCEPTABLE,
        GrpcStatus.UNAUTHENTICATED,
        null,
      );
    }
  }

  // create payment intent for stripe
  async createPaymentIntent({ stripe_account_id, amount }) {
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types: ['card'],
      amount: parseInt((amount * 100).toString()), // covert amount to x 100 for stripe
      currency: 'usd',
      application_fee_amount: 100, // optional
      transfer_data: {
        destination: stripe_account_id,
      },
      description: 'payment intent for stripe',
    });
    return paymentIntent;
  }

  // health funtion
  async healthCheck(healthCheckDto) {
    return {
      message: 'Wallet service is up and running!',
    };
  }

  // return wallet balances for a user
  async checkBalance(checkBalanceDto) {
    try {
      // fetching balance for user via userid and assigning balance if it doesn't exist
      const user = await this.userService
        .findOneById({ id: checkBalanceDto.userId })
        .toPromise();
      let balance = null;
      // find the balance a selected
      if (user.balance && user.balance.length > 0) {
        balance = user.balance.find(
          (obj) => obj.assetCode === checkBalanceDto.assetCode,
        );
      }
      // returning 0 if no balance yet
      if (!balance) {
        balance = {
          assetCode: checkBalanceDto.assetCode,
          amount: 0,
        };
      }
      return balance;
    } catch (error) {
      await this.sentryService.captureException(error);
      await this.responseHandlerService.response(
        error,
        HttpStatus.NOT_ACCEPTABLE,
        GrpcStatus.UNAUTHENTICATED,
        null,
      );
    }
  }

  async debit(debitDto) {
    // update Transaction in pending state
    try {
      // setting new amount in user wallet
      await this.userService
        .balanceUpdate({
          userId: debitDto.userId,
          amount: debitDto.amount,
          assetCode: debitDto.assetCode,
        })
        .toPromise();
      // update transaction status in succss state
      return { message: `Balance updated successfully` };
    } catch (error) {
      await this.sentryService.captureException(error);
      await this.responseHandlerService.response(
        error,
        HttpStatus.NOT_ACCEPTABLE,
        GrpcStatus.UNAUTHENTICATED,
        null,
      );
    }
  }

  // create or update transaction
  async createOrUpdateTransaction(transactionDto) {
    // fetching transaction using transaction id
    let transaction;
    if (transactionDto._id) {
      transaction = await this.paymentModel.findOne({
        _id: transactionDto._id,
      });

      if (!transaction) {
        await this.responseHandlerService.response(
          'transaction not found',
          HttpStatus.NOT_FOUND,
          GrpcStatus.NOT_FOUND,
          null,
        );
      }
      // updating values from DTO

      if (transactionDto.reference_number) {
        transactionDto.reference = transactionDto.reference_number;
      }

      transaction = await this.paymentModel.findByIdAndUpdate(
        transactionDto._id,
        transactionDto,
      );
      return { transaction, message: 'transaction updated' };
    } else {
      // create a new transaction using the DTO
      const newTransaction = new this.paymentModel(transactionDto);
      const transaction = await newTransaction.save();
      return { transaction, message: 'transaction created' };
    }
  }
  // function to convert Amount to Two Decimal Places
  async convertAmountToTwoDecimalPlaces(amount) {
    amount = amount.toString();
    if (amount.indexOf('.') === -1) {
      return amount;
    } else {
      return amount.slice(0, amount.indexOf('.') + 3);
    }
  }

  // top up wallet
  async topUpWallet(topUpWalletDto) {
    const user = await this.userService
      .findOneById({
        id: topUpWalletDto.userId,
      })
      .toPromise();

    // converting number to 2 decimal places only
    topUpWalletDto.amount = await this.convertAmountToTwoDecimalPlaces(
      topUpWalletDto.amount,
    );

    const transactionObj = {
      from: user._id,
      asset_code: 'BTC',
      type: 'credit',
      platform: 'web',
      amount_in: topUpWalletDto.amount,
      status: paymentStatus.PENDING,
    };
    topUpWalletDto.amount = Number(topUpWalletDto.amount);

    if (topUpWalletDto.paymentMethod === 'STRIPE') {
      // for STRIPE

      // make sure user has a stripe account
      if (!user.stripe_account_id) {
        await this.responseHandlerService.response(
          'stripe account not found',
          HttpStatus.NOT_FOUND,
          GrpcStatus.UNAUTHENTICATED,
          null,
        );
      }
      // creating payment intent for requested amount
      const paymentIntent = await this.createPaymentIntent({
        stripe_account_id: user.stripe_account_id,
        amount: topUpWalletDto.amount,
      });

      const { client_secret } = paymentIntent;
      // create a new transaction
      const { transaction } = await this.createOrUpdateTransaction({
        ...transactionObj,
        transaction_hash: paymentIntent.id,
        kind: 'STRIPE',
      });

      return {
        client_secret, // client secret for stripe used by frontend to complete payment
        transactionId: transaction._id, // transaction ID
        message: 'stripe payment initiated for topUpWallet',
      };
    } else if (topUpWalletDto.paymentMethod === 'COINBASE') {
      // create new charge
      const createChargeObj = {
        name: `top-up wallet ${user.email}`,
        description: `top-up wallet user - ${user.email} amount - ${topUpWalletDto.amount}`,
        pricing_type: 'fixed_price',
        local_price: { amount: topUpWalletDto.amount, currency: 'USD' },
      };

      let createdCharge: any = await this.charge(createChargeObj);
      createdCharge = createdCharge.data.data;
      // create a new transaction
      const { transaction } = await this.createOrUpdateTransaction({
        ...transactionObj,
        transaction_hash: createdCharge.id,
        kind: 'COINBASE',
      });
      return {
        coinbase_charge_url: createdCharge.hosted_url, // coinbase charge URL to make payment
        client_secret: createdCharge.code, // coinbase charge code to make payment
        transactionId: transaction._id, // transaction ID
        message: 'coinbase payment initiated for topUpWallet',
      };
    }
  }
  // fetch coinbase charge object using ID
  async retrieveCharge(id) {
    const headers = {
      'X-CC-Api-Key': process.env.COINBASE_API_KEY,
      'Content-Type': 'application/json',
      'X-CC-Version': '2018-03-22',
    };
    // calling coinbase API to fetch charge
    const res: any = await new Promise((resolve, reject) => {
      axios.default
        .get(process.env.CREATE_CHARGE_URL + id, {
          headers: headers,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          this.sentryService.captureException(error);
          console.log(error);
          reject(error);
        });
    });

    return res.data.data;
  }

  // wallet top-up confirmation
  async topUpWalletConfirm(topUpWalletConfirmDto) {
    if (topUpWalletConfirmDto.paymentMethod === 'STRIPE') {
      // fetch user
      const user = await this.userService
        .findOneById({
          id: topUpWalletConfirmDto.userId,
        })
        .toPromise();

      const transaction_hash = topUpWalletConfirmDto.transaction_hash;
      // to fetch transaction using transaction id
      const transaction = await this.paymentModel.findOne({
        _id: topUpWalletConfirmDto.transactionId,
        transaction_hash,
        from: user._id,
      });

      // check for transaction if it exist
      if (!transaction) {
        await this.responseHandlerService.response(
          'transaction not found',
          HttpStatus.NOT_FOUND,
          GrpcStatus.NOT_FOUND,
          null,
        );
      }
      // to check if payment is already confirmed
      if (transaction.status === paymentStatus.COMPLETED) {
        await this.responseHandlerService.response(
          'transaction already confirmed',
          HttpStatus.NOT_ACCEPTABLE,
          GrpcStatus.UNAUTHENTICATED,
          null,
        );
      }
      // checking if transaction status is success on stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(
        transaction.transaction_hash,
      );
      if (paymentIntent.status === 'succeeded') {
        transaction.status = paymentStatus.COMPLETED;
        // updatin user wallet balance
        const { amount: currAmount } = await this.checkBalance({
          userId: transaction.from,
          assetCode: 'BTC',
        });

        const updateBalanceResponse = await this.userService
          .balanceUpdate({
            userId: transaction.from,
            amount: Number(transaction.amount_in) + Number(currAmount),
            assetCode: transaction.asset_code,
          })
          .toPromise();
        await transaction.save();
        return {
          message: 'transaction confirmed - success',
        };
      } else {
        await this.responseHandlerService.response(
          'payment not completed',
          HttpStatus.NOT_ACCEPTABLE,
          GrpcStatus.UNAUTHENTICATED,
          null,
        );
      }
    } else {
      // updating transaction hash
      const transaction_hash = topUpWalletConfirmDto.transaction_hash;
      const transaction = await this.paymentModel.findOne({
        transaction_hash,
      });
      const chargeData = await this.retrieveCharge(transaction_hash);

      // to check whether the transaction exists
      if (!transaction || !chargeData) {
        await this.responseHandlerService.response(
          'transaction not found',
          HttpStatus.NOT_FOUND,
          GrpcStatus.NOT_FOUND,
          null,
        );
      }

      // to check if payment is already confirmed
      if (transaction.status === paymentStatus.COMPLETED) {
        await this.responseHandlerService.response(
          'transaction already confirmed',
          HttpStatus.NOT_ACCEPTABLE,
          GrpcStatus.UNAUTHENTICATED,
          null,
        );
      }

      if (
        ['charge:confirmed', 'charge:failed', 'charge:delayed'].includes(
          topUpWalletConfirmDto.transactionStatus,
        )
      ) {
        // if charge failed
        if (topUpWalletConfirmDto.transactionStatus === 'charge:failed') {
          if (
            chargeData.timeline[chargeData.timeline.length - 1].status ===
            'EXPIRED' // if expired
          ) {
            transaction.status = paymentStatus.EXPIRED;
            await transaction.save(); // set transaction in DB as expired
            await this.responseHandlerService.response(
              'payment not completed',
              HttpStatus.NOT_ACCEPTABLE,
              GrpcStatus.UNAUTHENTICATED,
              null,
            );
          }

          // to check whether the payment is completed or not
          if (chargeData.payments.length === 0) {
            // if no payment, set transaction in DB as failed
            transaction.status = paymentStatus.FAILED;
            await transaction.save();
            await this.responseHandlerService.response(
              'payment not completed',
              HttpStatus.NOT_ACCEPTABLE,
              GrpcStatus.UNAUTHENTICATED,
              null,
            );
          }
        }
        // there is any payment then add the payment amount to user's walletg
        const creditBalance =
          chargeData.payments[chargeData.payments.length - 1].value.local
            .amount;

        transaction.status = paymentStatus.COMPLETED;

        const { amount: currAmount } = await this.checkBalance({
          userId: transaction.from,
          assetCode: 'BTC',
        });

        const updateBalanceResponse = await this.userService
          .balanceUpdate({
            userId: transaction.from,
            amount: Number(creditBalance) + Number(currAmount),
            assetCode: transaction.asset_code,
          })
          .toPromise();
        await transaction.save();
        return {
          message: 'transaction confirmed - success',
        };
      } else {
        await this.responseHandlerService.response(
          'payment not completed',
          HttpStatus.NOT_ACCEPTABLE,
          GrpcStatus.UNAUTHENTICATED,
          null,
        );
      }

      return {
        message: 'transaction confirmed - success',
      };
    }
  }

  // list transactions
  async listTransactions(listTransactionsDto) {
    const matches: any = {};
    let projection: any = {};
    if (!listTransactionsDto.user) {
      projection = {
        minNumOfComponentsForNFT: 0,
        initialPrice: 0,
        priceIncrement: 0,
      };
    }

    // filters for listing transactions
    if (listTransactionsDto.kind) {
      matches.kind = listTransactionsDto.kind;
    }

    if (listTransactionsDto.type) {
      matches.type = listTransactionsDto.type;
    }

    if (listTransactionsDto.status) {
      matches.status = listTransactionsDto.status;
    }

    if (listTransactionsDto.asset_code) {
      matches.asset_code = listTransactionsDto.asset_code;
    }

    if (listTransactionsDto.refunded) {
      matches.refunded = listTransactionsDto.refunded;
    }

    if (listTransactionsDto.platform) {
      matches.platform = listTransactionsDto.platform;
    }
    // query to fetch transaction records for the logged in user only
    matches['$or'] = [
      { from: listTransactionsDto.userId },
      { to: listTransactionsDto.userId },
    ];

    const sort: any = {};
    // sort
    if (listTransactionsDto.sortBy) {
      sort[listTransactionsDto.sortBy] = listTransactionsDto.sortOrder || -1;
    } else {
      sort['createdAt'] = -1;
    }
    // limit and skip - pagination
    const limit = parseInt(listTransactionsDto.limit || 10);
    let offset = parseInt(listTransactionsDto.offset || 10) - limit;
    if (offset < 0) {
      offset = 0;
    }
    let totalTransactions = null;
    let transactions: any = [];
    try {
      // fetching the transaction records
      totalTransactions = await this.paymentModel.count(matches);
      transactions = await this.paymentModel
        .find(matches, projection)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .lean();
      await transactions;
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(
        e,
        HttpStatus.NOT_FOUND,
        GrpcStatus.NOT_FOUND,
        null,
      );
    }

    // check is transaction exists
    if (transactions.length === 0) {
      await this.responseHandlerService.response(
        'no transactions found',
        HttpStatus.NOT_FOUND,
        GrpcStatus.NOT_FOUND,
        null,
      );
    }
    // populating each record with user
    transactions = await Promise.all(
      transactions.map(async (transaction) => {
        transaction.fromUser = await this.getUserPerTransaction(
          transaction.from,
        );

        transaction.toUser = await this.getUserPerTransaction(transaction.to);

        return transaction;
      }),
    );

    return { totalTransactions, transaction: transactions };
  }

  // fetch user for using userId
  async getUserPerTransaction(id) {
    try {
      return await this.userService
        .getUserById({ id: id.toString() })
        .toPromise();
    } catch (e) {
      await this.sentryService.captureException(e);
      return null;
    }
  }

  // calculate revenue generated from fees
  async calculateRevenueGeneratedFromFees() {
    try {
      // aggregation to find totalsum of fee amount from all completed transactions
      const data: any = await this.paymentModel.aggregate([
        {
          $match: { status: 'COMPLETED' },
        },
        {
          $group: {
            _id: null,
            TotalSum: {
              $sum: {
                $toDouble: '$amount_fee',
              },
            },
          },
        },
      ]);

      return { revenueGeneratedFromFees: data[0].TotalSum };
    } catch (err) {
      await this.sentryService.captureException(err);
      console.log(err);
      await this.responseHandlerService.response(
        'revenueGeneratedFromFees not found',
        HttpStatus.NOT_FOUND,
        GrpcStatus.NOT_FOUND,
        null,
      );
    }
  }
}

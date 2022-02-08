import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Users } from 'src/user/typeDef/resolver-type';

@ObjectType()
export class Wallets {
  @Field({ nullable: true, description: 'tells wallet name' })
  name: string;
}

@ObjectType()
export class HelloDef2 {
  @Field({ nullable: true, description: 'tells message' })
  message?: string;
}

@ObjectType()
export class createchargeDef {
  @Field({ nullable: true, description: 'tells id' })
  id?: string;

  @Field({ nullable: true, description: 'tells chargeName' })
  chargeName?: string;

  @Field({ nullable: true, description: 'tells chargeName' })
  chargeDescription?: string;

  @Field({ nullable: true, description: 'tells pricing_type' })
  pricing_type?: string;

  @Field({ nullable: true, description: 'tells kind' })
  kind?: string;

  @Field({ nullable: true, description: 'tells amount' })
  amount?: string;

  @Field({ nullable: true, description: 'tells fee' })
  fee?: string;

  @Field({ nullable: true, description: 'tells asset_code' })
  asset_code?: string;

  @Field({ nullable: true, description: 'tells from' })
  from?: string;

  @Field({ nullable: true, description: 'tells the platform' })
  platform?: string;

  @Field({ nullable: true, description: 'tells the created time' })
  createdAt?: string;
}

@ObjectType()
export class createStripeAccountDef {
  @Field({
    nullable: true,
    description: 'tells the message after stripe creation',
  })
  message?: string;

  @Field({ nullable: true, description: 'tells about accountLink' })
  accountLink?: string;
}

@ObjectType()
export class CreatePaymentIntentDef {
  @Field({ nullable: true, description: 'tells the client_secret' })
  client_secret?: string;
}

@ObjectType()
export class CheckBalanceDef {
  @Field({ nullable: true, description: 'tells the client_secret' })
  amount?: number;

  @Field({ nullable: true, description: 'tells the client_secret' })
  assetCode?: string;

  @Field({ nullable: true, description: 'tells the withheld amount' })
  withheldAmount?: string;
}

@ObjectType()
export class TopUpWalletDef {
  @Field({
    nullable: true,
    description: 'tells the client_secret for stripe or charge id for coinbase',
  })
  client_secret?: string;

  @Field({
    nullable: true,
    description: 'tells the coinbase charge url for coinbase',
  })
  coinbase_charge_url?: string;

  @Field({ nullable: true, description: 'tells the transactionId' })
  transactionId?: string;

  @Field({ nullable: true, description: 'tells message' })
  message?: string;
}

@ObjectType()
export class TopUpWalletConfirmDef {
  @Field({ nullable: true, description: 'tells message' })
  message?: string;
}

@ObjectType()
export class Transaction {
  @Field({ nullable: true, description: 'tells id' })
  id: string;

  @Field({ nullable: true, description: 'tells transaction reference_number' })
  reference_number: string;

  @Field({ nullable: true, description: 'tells transaction kind' })
  kind: string;

  @Field({ nullable: true, description: 'tells transaction status' })
  status: string;

  @Field({ nullable: true, description: 'tells transaction status_eta' })
  status_eta: string;

  @Field({ nullable: true, description: 'tells transaction amount_in' })
  amount_in: string;

  @Field({ nullable: true, description: 'tells transaction amount_out' })
  amount_out: string;

  @Field({ nullable: true, description: 'tells transaction amount_fee' })
  amount_fee: string;

  @Field({ nullable: true, description: 'tells transaction transaction_hash' })
  transaction_hash: string;

  @Field({ nullable: true, description: 'tells transaction transaction_memo' })
  transaction_memo: string;

  @Field({ nullable: true, description: 'tells transaction refunded' })
  refunded: string;

  @Field({ nullable: true, description: 'tells transaction from' })
  from: string;

  @Field({ nullable: true, description: 'tells transaction to' })
  to: string;

  @Field({ nullable: true, description: 'tells transaction asset_code' })
  asset_code: string;

  @Field({ nullable: true, description: 'tells transaction platform' })
  platform: string;

  @Field({ nullable: true, description: 'tells transaction message' })
  message: string;

  @Field({ nullable: true, description: 'tells transaction type' })
  type: string;

  @Field(() => Users, {
    nullable: true,
    description: 'tells from-user information',
  })
  fromUser?: Users;

  @Field(() => Users, {
    nullable: true,
    description: 'tells to-user information',
  })
  toUser?: Users;

  @Field({ nullable: true, description: 'Transaction _id' })
  readonly _id: string;

  @Field({ nullable: true, description: 'createdAt' })
  readonly createdAt: string;
}

@ObjectType()
export class ListTransactionsDef {
  @Field((type) => Int)
  totalTransactions: number;

  @Field(() => [Transaction], { nullable: true, description: 'transactions' })
  transaction: Transaction[];
}

export class stripeRefreshAccountLinkDef {
  url: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Field, InputType, Float, Int } from '@nestjs/graphql';

@InputType()
export class HelloDto2 {
  @Field({ nullable: true, description: 'message' })
  @IsString()
  @IsNotEmpty()
  readonly message: string;
}

@InputType()
export class createchargeDto {
  @Field({ nullable: true, description: 'enter id' })
  readonly id?: string;

  @Field({ nullable: true, description: 'enter chargeName' })
  readonly chargeName?: string;

  @Field({ nullable: true, description: 'tells about chargeDescription' })
  readonly chargeDescription?: string;

  @Field({ nullable: true, description: 'enter pricing_type' })
  readonly pricing_type?: string;

  @Field({ nullable: true, description: 'enter kind' })
  readonly kind?: string;

  @Field({ nullable: true, description: 'enter amount' })
  readonly amount?: string;

  @Field({ nullable: true, description: 'enter fee' })
  readonly fee?: string;

  @Field({ nullable: true, description: 'enter asset_code' })
  readonly asset_code?: string;

  @Field({ nullable: true, description: 'enter from' })
  readonly from?: string;

  @Field({ nullable: true, description: 'enter the platform' })
  readonly platform?: string;

  @Field({ nullable: true, description: 'tells the created time' })
  readonly createdAt?: string;
}

@InputType()
export class CreatePaymentIntentDto {
  @Field(() => Float, { nullable: true, description: 'enter the amount' })
  @IsNotEmpty()
  readonly amount: number;
}

@InputType()
export class CreateStripeAccountDto {
  @Field({ nullable: true, description: 'enter the returnUrl' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly returnUrl: string;
}

enum AssetCode {
  VPC = 'VPC',
}

@InputType()
export class CheckBalanceDto {
  @Field({ nullable: true, description: 'enter the returnUrl' })
  @IsOptional()
  @IsEnum(AssetCode)
  @IsNotEmpty()
  readonly assetCode: string;
}

@InputType()
export class TopUpWalletDto {
  @Field({
    nullable: true,
    description: 'enter the payment method - STRIPE || COINBASE',
  })
  @IsNotEmpty()
  @IsString()
  readonly paymentMethod: string;

  @Field(() => Float, { nullable: true, description: 'enter the amount' })
  @IsNotEmpty()
  readonly amount?: number;
}

@InputType()
export class TopUpWalletConfirmDto {
  @Field({
    nullable: true,
    description: 'enter the payment method - STRIPE || COINBASE',
  })
  @IsNotEmpty()
  @IsString()
  readonly paymentMethod: string;

  @Field({ nullable: true, description: 'enter the transaction_hash' })
  @IsNotEmpty()
  @IsString()
  readonly transaction_hash: string;

  @Field({ nullable: true, description: 'enter the transactionId' })
  @IsNotEmpty()
  @IsString()
  readonly transactionId: string;
}

enum Transactionkind {
  Coinbase = 'COINBASE',
  Stripe = 'STRIPE',
  Wallet = 'WALLET',
}

enum Transactiontype {
  Debit = 'debit',
  credit = 'credit',
}

enum Transactionstatus {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Rejected = 'REJECTED',
}

enum Transactionasset_code {
  Vpc = 'VPC',
  Vc = 'VC',
}

enum Transactionplatform {
  Web = 'web',
  Android = 'android',
  Ios = 'ios',
}

@InputType()
export class ListTransactionsDto {
  @Field({
    nullable: true,
    description: 'Transaction Kind',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(Transactionkind)
  readonly kind: string;

  @Field({
    nullable: true,
    description: 'enter sortBy - name, status, updatedAt, createdAt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sortBy: string;

  @Field((type) => Int, {
    nullable: true,
    description: 'enter sort Order -> (-1 for descending & 1 for ascending)',
  })
  @IsOptional()
  @IsNumber()
  readonly sortOrder: number;

  @Field((type) => Int, { nullable: true, description: 'enter limit' })
  @IsOptional()
  @IsNumber()
  readonly limit: number;

  @Field((type) => Int, { nullable: true, description: 'enter offset' })
  @IsOptional()
  @IsNumber()
  readonly offset: number;

  @Field({
    nullable: true,
    description: 'Transaction Type',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(Transactiontype)
  readonly type: string;

  @Field({
    nullable: true,
    description: 'Transaction Status',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(Transactionstatus)
  readonly status: string;

  @Field({
    nullable: true,
    description: 'Transaction Asset_code',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(Transactionasset_code)
  readonly asset_code: string;

  @Field({
    nullable: true,
    description: 'Transaction refunded',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsBoolean()
  readonly refunded: boolean;

  @Field({
    nullable: true,
    description: 'Transaction Platform',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(Transactionplatform)
  readonly platform: string;
}

@InputType()
export class ClaimVryntCreditDto {
  @Field({ nullable: true, description: 'enter the assetCode' })
  @IsString()
  @IsNotEmpty()
  readonly assetCode: string;

  @Field({ nullable: false, description: 'enter the amount' })
  @IsString()
  @IsNotEmpty()
  readonly amount: string;
}

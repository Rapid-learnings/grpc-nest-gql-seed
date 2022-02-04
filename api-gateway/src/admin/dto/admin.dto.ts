import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  Matches,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Role } from 'src/guards/role.enum';
import { Field, Int, Float, InputType } from '@nestjs/graphql';
import { type } from 'os';

@InputType()
@InputType()
export class ListUsersDto {
  @Field({ nullable: true, description: "user's userId" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @Field({
    nullable: true,
    description:
      'enter sortBy - name, email, username, mobile, createdAt, updatedAt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sortBy: string;

  @Field({
    nullable: true,
    description: 'enter sortOrder -> (-1 for descending & 1 for ascending)',
  })
  @IsOptional()
  @IsNumber()
  readonly sortOrder: number;

  @Field({ nullable: true, description: 'limit' })
  @IsOptional()
  @IsNumber()
  readonly limit: number;

  @Field({ nullable: true, description: 'offset' })
  @IsOptional()
  @IsNumber()
  readonly offset: number;

  @Field({ nullable: true, description: "user's role" })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: string;

  @Field({ nullable: true, description: "user's name" })
  @IsOptional()
  @IsString()
  readonly name: string;

  @Field({ nullable: true, description: "user's email" })
  @IsOptional()
  @IsString()
  readonly email: string;

  @Field({ nullable: true, description: "user's username" })
  @IsOptional()
  @IsString()
  readonly username: string;

  @Field({ nullable: true, description: "user's mobile number" })
  @IsOptional()
  @IsString()
  readonly mobile: string;
}

enum RoleForUpdate {
  Subadmin = 'subadmin',
  User = 'user',
  Superadmin = 'superadmin',
}

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true, description: "user's userId" })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @Field({ nullable: true, description: "user's first_name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @Field({ nullable: true, description: "user's last_name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @Field({ nullable: true, description: "user's email" })
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @Field({ nullable: true, description: "user's username" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @Field({ nullable: true, description: "user's mobile" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly mobile: string;

  @Field({ nullable: true, description: "user's status" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly status: string;

  @Field({ nullable: true, description: "user's role" })
  @IsOptional()
  @IsEnum(RoleForUpdate)
  @IsString()
  @IsNotEmpty()
  readonly role: string;
}

@InputType()
export class UpdatePlatformConstantDto {
  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Direct market place Distribution to VRYNT Proceeds pool',
  })
  @IsOptional()
  @IsNumber()
  readonly DirectmarketplaceDistributiontoVRYNTProceedspool: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Direct Market place Ditribution to Artists Proceeds Pool',
  })
  @IsOptional()
  @IsNumber()
  readonly DirectMarketplaceDitributiontoArtistsProceedsPool: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Consumer Marketplace Distribution to VRYNT Proceeds Pool components',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Consumer Marketplace Distribution to Artists Proceeds Pool components',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Consumer Marketplace Distribution to VRYNT Proceeds Pool',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumerMarketplaceDistributiontoVRYNTProceedsPool: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Consumer marketplace Distribution to Artist Proceeds pool NFT',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumermarketplaceDistributiontoArtistProceedspoolNFT: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for Consumer marketplace Distribution to Previous Collector Proceeds pool NFT',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'enter value for Market Liquidity Bootstrap Pool',
  })
  @IsOptional()
  @IsNumber()
  readonly MarketLiquidityBootstrapPool: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'enter value for Early gallery rewart claim',
  })
  @IsOptional()
  @IsNumber()
  readonly Earlygalleryrewartclaim: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for VRYNT Credit to VRYNT Conversion Method Treasury Funded',
  })
  @IsOptional()
  @IsNumber()
  readonly VRYNTCredittoVRYNTConversionMethodTreasuryFunded: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'enter value for VRYNT Credit to VRYNT Convertion Method Supply Funded',
  })
  @IsOptional()
  @IsNumber()
  readonly VRYNTCredittoVRYNTConvertionMethodSupplyFunded: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'enter value for VRYNT Credit Inactivity Fee',
  })
  @IsOptional()
  @IsNumber()
  readonly VRYNTCreditInactivityFee: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'enter value for Credit Purchase Component Holding',
  })
  @IsOptional()
  @IsNumber()
  readonly CreditPurchaseComponentHolding: number;

  @Field({
    nullable: true,
    description: 'toggle for Allowed Collection Creation',
  })
  @IsOptional()
  @IsBoolean()
  readonly AllowedCollectionCreation: boolean;
}

import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Users } from '../../user/typeDef/resolver-type';

@ObjectType()
export class Admins {
  @Field({ nullable: true, description: 'tells the name' })
  name: string;
}

@ObjectType()
export class PlatformConstant {
  @Field((type) => Int, {
    nullable: true,
    description:
      'tells Direct market place Distribution to VRYNT Proceeds pool',
  })
  @IsOptional()
  @IsNumber()
  readonly DirectmarketplaceDistributiontoVRYNTProceedspool: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for Direct Marketplace Ditribution to Artists Proceeds Pool',
  })
  @IsOptional()
  @IsNumber()
  readonly DirectMarketplaceDitributiontoArtistsProceedsPool: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for Consumer Marketplace Distribution to VRYNT Proceeds Pool components',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for Consumer Marketplace Distribution to Artists Proceeds Pool components',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for Consumer Marketplace Distribution to VRYNT Proceeds Pool',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumerMarketplaceDistributiontoVRYNTProceedsPool: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for Consumer marketplace Distribution to Artist Proceeds pool NFT',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumermarketplaceDistributiontoArtistProceedspoolNFT: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for Consumer marketplace Distribution to Previous Collector Proceeds pool NFT',
  })
  @IsOptional()
  @IsNumber()
  readonly ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'tells the value for Market Liquidity Bootstrap Pool',
  })
  @IsOptional()
  @IsNumber()
  readonly MarketLiquidityBootstrapPool: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'tells the value for Early gallery rewart claim',
  })
  @IsOptional()
  @IsNumber()
  readonly Earlygalleryrewartclaim: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for VRYNT Credit to VRYNT Conversion Method Treasury Funded',
  })
  @IsOptional()
  @IsNumber()
  readonly VRYNTCredittoVRYNTConversionMethodTreasuryFunded: number;

  @Field((type) => Int, {
    nullable: true,
    description:
      'tells the value for VRYNT Credit to VRYNT Convertion Method Supply Funded',
  })
  @IsOptional()
  @IsNumber()
  readonly VRYNTCredittoVRYNTConvertionMethodSupplyFunded: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'tells the value for VRYNT Credit In activity Fee',
  })
  @IsOptional()
  @IsNumber()
  readonly VRYNTCreditInactivityFee: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'tells the value for Credit Purchase Component Holding',
  })
  @IsOptional()
  @IsNumber()
  readonly CreditPurchaseComponentHolding: number;

  @Field({ nullable: true, description: 'name' })
  @IsOptional()
  @IsString()
  readonly name: string;

  @Field({
    nullable: true,
    description: 'toggle for Allowed Collection Creation',
  })
  @IsOptional()
  @IsBoolean()
  readonly AllowedCollectionCreation: boolean;
}

@ObjectType()
export class ListUsersDef {
  @Field((type) => Int)
  totalUsers: number;

  @Field(() => [Users], {
    nullable: true,
    description: "tells the user's information",
  })
  users: Users[];
}

@ObjectType()
export class UpdateUserDef {
  @Field(() => Users, {
    nullable: true,
    description: "tells the user's information",
  })
  user?: Users;

  @Field({ nullable: true, description: "tells the user's update status" })
  message: string;
}

@ObjectType()
export class UpdatePlatformConstantDef {
  @Field(() => PlatformConstant, {
    nullable: true,
    description: "tells the information for platforms's constant",
  })
  platformConstant: PlatformConstant;

  @Field({
    nullable: true,
    description: 'tells the update status for platform constant updation',
  })
  message: string;
}

@ObjectType()
export class GetPlatformConstantDef {
  @Field(() => PlatformConstant, {
    nullable: true,
    description: 'tells the information for platform constant',
  })
  platformConstant: PlatformConstant;

  @Field({
    nullable: true,
    description: 'tells the message after platform retrieval',
  })
  message: string;
}

@ObjectType()
export class DashboardVariable {
  @Field(() => Float, {
    nullable: true,
    description: 'tells the count for Unclaimed Vrynt Credit',
  })
  unclaimedVryntCredit: number;

  @Field(() => Float, {
    nullable: true,
    description: 'tells the count for Unclaimed Vrynt Platform Credit',
  })
  unclaimedVryntPlatformCredit: number;

  @Field({
    nullable: true,
    description: 'tells the count for NFTMinted',
  })
  NFTMinted: number;

  @Field({
    nullable: true,
    description: 'tells the count for NFTMinted',
  })
  revenueGeneratedFromFees: number;
}

@ObjectType()
export class GetDashboardVariableDef {
  @Field(() => DashboardVariable, {
    nullable: true,
    description: 'tells the count for dashboard Variable',
  })
  dashboardVariable: DashboardVariable;
}

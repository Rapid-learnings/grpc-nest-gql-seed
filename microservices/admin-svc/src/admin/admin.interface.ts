import { Document } from 'mongoose';
export interface PlatformConstant extends Document {
  name: string;
  DirectmarketplaceDistributiontoVRYNTProceedspool: number;
  DirectMarketplaceDitributiontoArtistsProceedsPool: number;
  ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents: number;
  ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents: number;
  ConsumerMarketplaceDistributiontoVRYNTProceedsPool: number;
  ConsumermarketplaceDistributiontoArtistProceedspoolNFT: number;
  ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT: number;
  MarketLiquidityBootstrapPool: number;
  Earlygalleryrewartclaim: number;
  VRYNTCredittoVRYNTConversionMethodTreasuryFunded: number;
  VRYNTCredittoVRYNTConvertionMethodSupplyFunded: number;
  VRYNTCreditInactivityFee: number;
  CreditPurchaseComponentHolding: number;
  AllowedCollectionCreation: boolean;
}

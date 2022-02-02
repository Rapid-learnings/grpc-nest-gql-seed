/* eslint-disable @typescript-eslint/no-unused-vars */
import * as mongoose from 'mongoose';
import { PlatformConstant } from './admin.interface';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
const responseHandlerService = new ResponseHandlerService();
export const PlatformConstantSchema = new mongoose.Schema<PlatformConstant>(
  {
    name: {
      type: String,
    },
    DirectmarketplaceDistributiontoVRYNTProceedspool: {
      type: Number,
      default: 0,
    },
    DirectMarketplaceDitributiontoArtistsProceedsPool: {
      type: Number,
      default: 0,
    },
    ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents: {
      type: Number,
      default: 0,
    },
    ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents: {
      type: Number,
      default: 0,
    },
    ConsumerMarketplaceDistributiontoVRYNTProceedsPool: {
      type: Number,
      default: 0,
    },
    ConsumermarketplaceDistributiontoArtistProceedspoolNFT: {
      type: Number,
      default: 0,
    },
    ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT: {
      type: Number,
      default: 0,
    },
    MarketLiquidityBootstrapPool: {
      type: Number,
      default: 0,
    },
    Earlygalleryrewartclaim: {
      type: Number,
      default: 0,
    },
    VRYNTCredittoVRYNTConversionMethodTreasuryFunded: {
      type: Number,
      default: 0,
    },
    VRYNTCredittoVRYNTConvertionMethodSupplyFunded: {
      type: Number,
      default: 0,
    },
    VRYNTCreditInactivityFee: {
      type: Number,
      default: 0,
    },
    CreditPurchaseComponentHolding: {
      type: Number,
      default: 0,
    },
    AllowedCollectionCreation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

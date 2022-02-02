import {
  Injectable,
  HttpStatus,
  OnModuleInit,
  HttpService,
  Inject,
  Logger,
} from "@nestjs/common";
import { HelperService } from "src/helper/helper.service";
import { ResponseHandlerService } from "src/helper/response-handler.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PlatformConstant } from "./admin.interface";
import * as axios from "axios";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";
import { ClientGrpc, Client } from "@nestjs/microservices";

import { UserServiceClientOptions } from "./svc.options";

@Injectable()
export class AdminService implements OnModuleInit {
  private sentryService: any;
  constructor(
    @InjectModel("PlatformConstant")
    private platformConstantModel: Model<PlatformConstant>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly helperService: HelperService,
    private readonly responseHandlerService: ResponseHandlerService,
    private httpService: HttpService,
    @InjectSentry() private readonly sentryClient: SentryService
  ) {
    this.sentryService = sentryClient.instance();
  }

  // declaring client variables for gRPC client
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  private walletService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>("UserService"); // creating grpc client for user service
  }

  // list all users
  async listUsers(listUsersDto) {
    let response = null;
    try {
      response = await this.httpService
        .post(`${process.env.BASE_URL}/admin/listUsers/`, {
          userId: listUsersDto.userId,
          limit: listUsersDto.limit,
          offset: listUsersDto.offset,
          sortBy: listUsersDto.sortBy,
          sortOrder: listUsersDto.sortOrder,
          status: listUsersDto.status,
          canCreateCollection: listUsersDto.canCreateCollection,
          isBlocked: listUsersDto.isBlocked,
          role: listUsersDto.role,
          twoFactorAuth: listUsersDto.twoFactorAuth,
          isProfileUpdated: listUsersDto.isProfileUpdated,
          isEmailVerified: listUsersDto.isEmailVerified,
          spendVryntPlatformCredit: listUsersDto.spendVryntPlatformCredit,
          spendViaCreditCard: listUsersDto.spendViaCreditCard,
          claimVryntToken: listUsersDto.claimVryntToken,
          name: listUsersDto.name,
          email: listUsersDto.email,
          username: listUsersDto.username,
          mobile: listUsersDto.mobile,
          metamask_id: listUsersDto.metamask_id,
        })
        .toPromise();
    } catch (e) {
      await this.sentryService.captureException(e);
      const { error, statusCode } = e.response.data;
      await this.responseHandlerService.response(error, statusCode, null);
    }
    const users = response.data.data.users;
    const totalUsers = response.data.data.totalUsers;
    // check if user exists
    if (!users) {
      await this.responseHandlerService.response(
        "users not found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    return {
      users,
      totalUsers,
    };
  }

  // health function
  async healthCheck(healthCheckDto) {
    return {
      message: "Hello!",
    };
  }

  // update user
  async updateUser(updateUserDto) {
    let response = null;
    try {
      response = await this.httpService
        .post(`${process.env.BASE_URL}/admin/updateUser/`, {
          isBlocked: updateUserDto.isBlocked,
          userId: updateUserDto.userId,
          email: updateUserDto.email,
          first_name: updateUserDto.first_name,
          last_name: updateUserDto.last_name,
          username: updateUserDto.username,
          socialTelegram: updateUserDto.socialTelegram,
          socialDiscord: updateUserDto.socialDiscord,
          socialTwitter: updateUserDto.socialTwitter,
          socialInstagram: updateUserDto.socialInstagram,
          socialYoutube: updateUserDto.socialYoutube,
          socialTiktok: updateUserDto.socialTiktok,
          socialTwitch: updateUserDto.socialTwitch,
          canCreateCollection: updateUserDto.canCreateCollection,
          spendVryntPlatformCredit: updateUserDto.spendVryntPlatformCredit,
          spendViaCreditCard: updateUserDto.spendViaCreditCard,
          claimVryntToken: updateUserDto.claimVryntToken,
          profileImageUrl: updateUserDto.profileImageUrl,
          status: updateUserDto.status,
          mobile: updateUserDto.mobile,
          role: updateUserDto.role,
        })
        .toPromise();
    } catch (e) {
      await this.sentryService.captureException(e);
      const { error, statusCode } = e.response.data;
      await this.responseHandlerService.response(error, statusCode, null);
    }
    const user = response.data.data.user;
    const message = response.data.data.message;
    // check if user exists
    if (!user) {
      await this.responseHandlerService.response(
        "users not found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    return {
      user,
      message,
    };
  }

  // update platform constant variables
  async updatePlatformConstant(updatePlatformConstantDto) {
    const platformConstants = await this.platformConstantModel.find({});

    // check for platform constants
    if (platformConstants.length > 0) {
      let platformConstant = platformConstants[0];

      // filters for platform constant
      if (
        updatePlatformConstantDto.DirectmarketplaceDistributiontoVRYNTProceedspool
      ) {
        platformConstant.DirectmarketplaceDistributiontoVRYNTProceedspool =
          updatePlatformConstantDto.DirectmarketplaceDistributiontoVRYNTProceedspool;
      }

      if (
        updatePlatformConstantDto.DirectMarketplaceDitributiontoArtistsProceedsPool
      ) {
        platformConstant.DirectMarketplaceDitributiontoArtistsProceedsPool =
          updatePlatformConstantDto.DirectMarketplaceDitributiontoArtistsProceedsPool;
      }

      if (
        updatePlatformConstantDto.ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents
      ) {
        platformConstant.ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents =
          updatePlatformConstantDto.ConsumerMarketplaceDistributiontoVRYNTProceedsPoolcomponents;
      }

      if (
        updatePlatformConstantDto.ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents
      ) {
        platformConstant.ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents =
          updatePlatformConstantDto.ConsumerMarketplaceDistributiontoArtistsProceedsPoolcomponents;
      }

      if (
        updatePlatformConstantDto.ConsumerMarketplaceDistributiontoVRYNTProceedsPool
      ) {
        platformConstant.ConsumerMarketplaceDistributiontoVRYNTProceedsPool =
          updatePlatformConstantDto.ConsumerMarketplaceDistributiontoVRYNTProceedsPool;
      }

      if (
        updatePlatformConstantDto.ConsumermarketplaceDistributiontoArtistProceedspoolNFT
      ) {
        platformConstant.ConsumermarketplaceDistributiontoArtistProceedspoolNFT =
          updatePlatformConstantDto.ConsumermarketplaceDistributiontoArtistProceedspoolNFT;
      }

      if (
        updatePlatformConstantDto.ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT
      ) {
        platformConstant.ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT =
          updatePlatformConstantDto.ConsumermarketplaceDistributiontoPreviousCollectorProceedspoolNFT;
      }

      if (updatePlatformConstantDto.MarketLiquidityBootstrapPool) {
        platformConstant.MarketLiquidityBootstrapPool =
          updatePlatformConstantDto.MarketLiquidityBootstrapPool;
      }

      if (updatePlatformConstantDto.Earlygalleryrewartclaim) {
        platformConstant.Earlygalleryrewartclaim =
          updatePlatformConstantDto.Earlygalleryrewartclaim;
      }

      if (
        updatePlatformConstantDto.VRYNTCredittoVRYNTConversionMethodTreasuryFunded
      ) {
        platformConstant.VRYNTCredittoVRYNTConversionMethodTreasuryFunded =
          updatePlatformConstantDto.VRYNTCredittoVRYNTConversionMethodTreasuryFunded;
      }

      if (
        updatePlatformConstantDto.VRYNTCredittoVRYNTConvertionMethodSupplyFunded
      ) {
        platformConstant.VRYNTCredittoVRYNTConvertionMethodSupplyFunded =
          updatePlatformConstantDto.VRYNTCredittoVRYNTConvertionMethodSupplyFunded;
      }

      if (updatePlatformConstantDto.VRYNTCreditInactivityFee) {
        platformConstant.VRYNTCreditInactivityFee =
          updatePlatformConstantDto.VRYNTCreditInactivityFee;
      }

      if (updatePlatformConstantDto.CreditPurchaseComponentHolding) {
        platformConstant.CreditPurchaseComponentHolding =
          updatePlatformConstantDto.CreditPurchaseComponentHolding;
      }

      if (
        updatePlatformConstantDto.AllowedCollectionCreation !== null &&
        updatePlatformConstantDto.AllowedCollectionCreation !== undefined
      ) {
        platformConstant.AllowedCollectionCreation =
          updatePlatformConstantDto.AllowedCollectionCreation === true
            ? true
            : false;
      }

      // saving platform constant data in db
      platformConstant = await platformConstant.save();
      return {
        platformConstant,
        message: "Platform constant updated sucessfully",
      };
    } else {
      const newPlatformConstant = new this.platformConstantModel(
        updatePlatformConstantDto
      );
      const platformConstant = await newPlatformConstant.save();
      return {
        platformConstant,
        message: "Platform constant created sucessfully",
      };
    }
  }

  // fetch platform constant
  async getPlatformConstant() {
    const platformConstants = await this.platformConstantModel.find({});

    // check if platform constant exists
    if (platformConstants.length > 0) {
      const platformConstant = platformConstants[0];
      return { platformConstant };
    } else {
      await this.responseHandlerService.response(
        "Platform Constant not found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
  }
}

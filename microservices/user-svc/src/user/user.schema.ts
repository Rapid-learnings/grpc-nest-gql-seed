import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "./user.interface";
import { Role } from "src/guards/role.enum";
import { HttpStatus } from "@nestjs/common";
import { ResponseHandlerService } from "src/helper/response-handler.service";
import * as grpc from "grpc";
const GrpcStatus = grpc.status;

const responseHandlerService = new ResponseHandlerService();
/**
 * Enum of KYC process status
 */
export enum KycStatus {
  Approved = "approved",
  Not_Applied = "not_applied",
  Rejected = "rejected",
  Under_Review = "under_review",
}

/**
 * interface for the User schema.
 * @category User
 */
export const UserSchema = new mongoose.Schema<User>(
  {
    /**
     * user's first name
     */
    first_name: {
      type: String,
    },

    /**
     * user's last name
     */
    last_name: {
      type: String,
    },

    /**
     * user's email address
     */
    email: {
      type: String,
    },

    /**
     * user's username
     */
    username: {
      type: String,
    },

    /**
     * user's password
     */
    password: {
      type: String,
      default: null,
    },

    /**
     * user's mobile
     */
    mobile: {
      type: String,
      default: null,
    },

    /**
     * user's role
     */
    role: {
      type: String,
      enum: Role,
      default: Role.User,
    },

    /**
     * user's status
     */
    status: {
      type: String,
      default: null,
    },

    /**
     * One Time Password objects
     */
    otp: {
      type: Object,
      default: null,
    },

    /**
     * is email verified ?
     */
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    /**
     * does user want two factor authentication
     */
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },

    /**
     * is user profile update?
     */
    isProfileUpdated: {
      type: Boolean,
      default: false,
    },

    /**
     * user's Discord handle
     */
    socialDiscord: {
      type: String,
      default: null,
    },

    /**
     * user's Telegram handle
     */
    socialTelegram: {
      type: String,
      default: null,
    },

    /**
     * user's Twitter handle
     */
    socialTwitter: {
      type: String,
      default: null,
    },

    /**
     * user's Instagram handle
     */
    socialInstagram: {
      type: String,
      default: null,
    },

    /**
     * user's Youtube handle
     */
    socialYoutube: {
      type: String,
      default: null,
    },

    /**
     * user's Tiktok handle
     */
    socialTiktok: {
      type: String,
      default: null,
    },

    /**
     * user's Twitch handle
     */
    socialTwitch: {
      type: String,
      default: null,
    },

    /**
     * user's profile image URL
     */
    profileImageUrl: {
      type: String,
      default: null,
    },

    /**
     * user's appleId
     */
    appleId: {
      type: String,
      default: null,
    },

    /**
     * is user blocked?
     */
    isBlocked: {
      type: Boolean,
      default: false,
    },

    /**
     * user's stripe account id
     */
    stripe_account_id: {
      type: String,
      default: null,
    },

    /**
     * user's kyc applicant id
     */
    kyc_applicant_id: {
      type: String,
      default: null,
    },

    /**
     * user's kyc status
     */
    kyc_status: {
      type: String,
      enum: KycStatus,
      default: KycStatus.Not_Applied,
    },

    /**
     * user's kyc counter
     */
    kyc_counter: {
      type: Number,
      default: 0,
    },

    /**
     * user's balance for different assets
     */
    balance: [
      {
        /**
         * asset code of the currency
         */
        assetCode: {
          type: String,
          default: null,
        },

        /**
         * amount of currency.
         */
        amount: {
          type: Number,
          default: 0,
        },

        /**
         * amount of withheld currency
         */
        withheldAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * this is called everytime before the save function is called on UserModel.
 */
UserSchema.pre("save", function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (!user.password) {
    next();
  }
  // Make sure not to rehash pwd if already hashed
  if (!user.isModified("password")) return next();

  // Generate a salt and use it to hash the user
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/**
 * Used for checking if the attemot password matches user's current password.
 */
UserSchema.methods.checkPassword = async function (attempt) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMatch = false;

  try {
    const isMatch = await bcrypt.compare(attempt, user.password);
    return isMatch;
  } catch (e) {
    await responseHandlerService.response(
      "Unauthorized",
      HttpStatus.UNAUTHORIZED,
      GrpcStatus.UNAUTHENTICATED,
      null
    );
  }
};

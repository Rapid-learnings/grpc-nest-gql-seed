import { Document } from "mongoose";
/**
 * interface for the User schema.
 * @category User
 */
export interface User extends Document {
  /**
   * user's first name
   */
  first_name: string;

  /**
   * user's last name
   */
  last_name: string;

  /**
   * user's email address
   */
  email: string;

  /**
   * user's username
   */
  username: string;

  /**
   * user's password
   */
  password: string;

  /**
   * is email verified ?
   */
  isEmailVerified: boolean;

  /**
   * does user want two factor authentication
   */
  twoFactorAuth: boolean;

  /**
   * user's role
   */
  role: string;

  /**
   * One Time Password objects
   */
  otp: any;

  /**
   * user's mobile
   */
  mobile: string;

  /**
   * user's Discord handle
   */
  socialDiscord: string;

  /**
   * user's Telegram handle
   */
  socialTelegram: string;

  /**
   * user's Twitter handle
   */
  socialTwitter: string;

  /**
   * user's Instagram handle
   */
  socialInstagram: string;

  /**
   * user's Youtube handle
   */
  socialYoutube: string;

  /**
   * user's Tiktok handle
   */
  socialTiktok: string;

  /**
   * user's Twitch handle
   */
  socialTwitch: string;

  /**
   * user's status
   */
  status: string;

  /**
   * is user profile update?
   */
  isProfileUpdated: boolean;

  /**
   * user's profile image URL
   */
  profileImageUrl: string;

  /**
   * user model method to check password
   */
  checkPassword(attempt): boolean;

  /**
   * user's appleId
   */
  appleId: string;

  /**
   * is user blocked?
   */
  isBlocked: boolean;

  /**
   * user's stripe account id
   */
  stripe_account_id: string;

  /**
   * user's kyc applicant id
   */
  kyc_applicant_id: string;

  /**
   * user's kyc status
   */
  kyc_status: string;

  /**
   * user's kyc counter
   */
  kyc_counter: number;

  /**
   * user's balance for different assets
   */
  balance: Balance[];
}

/**
 * Object to store user balance for a given asset.
 */
export interface Balance {
  /**
   * asset code of the currency
   */
  assetCode: string;

  /**
   * amount of currency.
   */
  amount: number;

  /**
   * amount of withheld currency
   */
  withheldAmount: number;
}

/**
 * Object to store OTP information
 */
export interface OTP extends Document {
  /**
   * purpose for OTP
   */
  forTask: string;

  /**
   * OTP expiration time
   */
  expiresOn: Date;

  /**
   * six digit OTP in string
   */
  otp: string;
}

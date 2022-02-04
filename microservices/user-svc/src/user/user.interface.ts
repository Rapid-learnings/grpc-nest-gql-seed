import { Document } from 'mongoose';
export interface User extends Document {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  isEmailVerified: boolean;
  twoFactorAuth: boolean;
  role: string;
  otp: any;
  mobile: string;
  socialDiscord: string;
  socialTelegram: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTiktok: string;
  socialTwitch: string;
  status: string;
  isProfileUpdated: boolean;
  profileImageUrl: string;
  checkPassword(attempt): boolean;
  appleId: string;
  isBlocked: boolean;
  stripe_account_id: string;
  kyc_applicant_id: string;
  kyc_status: string;
  kyc_counter: number;
  balance: Balance[];
}

export interface Balance {
  assetCode: string;
  amount: number;
  withheldAmount: number;
}

export interface OTP extends Document {
  forTask: string;
  expiresOn: Date;
  otp: string;
}

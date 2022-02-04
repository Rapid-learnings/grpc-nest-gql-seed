import { Document } from "mongoose";
export interface User extends Document {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  mobile: string;
  status: string;
  checkPassword(attempt): boolean;
}

export interface Balance {
  assetCode: string;
  amount: number;
  withheldAmount: number;
}

export interface GalleryCollection {
  collectionId: string;
  owned: boolean;
  transactedNft: boolean;
  transactedComponents: boolean;
}

export interface OTP extends Document {
  forTask: string;
  expiresOn: Date;
  otp: string;
}

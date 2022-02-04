import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumberString,
  Matches,
  IsBoolean,
  IsOptional,
  IsInt,
  IsEmpty,
  isEmail,
} from 'class-validator';

import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Users {
  @Field({ nullable: true, description: "user's first name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @Field({ nullable: true, description: "user's last name" })
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
  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @Field({ nullable: true, description: "user's password" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @Field({ nullable: true, description: 'tells if email is verified' })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly isEmailVerified: boolean;

  @Field({ nullable: true, description: 'toggle for two factor authorization' })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly twoFactorAuth: boolean;

  @Field({ nullable: true, description: "user's role" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly role: string;

  @Field({ nullable: true, description: "user's status" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly status: string;

  @Field({ nullable: true, description: "user's discord handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialDiscord: string;

  @Field({ nullable: true, description: "user's telegram handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTelegram: string;

  @Field({ nullable: true, description: "user's twitter handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTwitter: string;

  @Field({ nullable: true, description: "user's instagram handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialInstagram: string;

  @Field({ nullable: true, description: "user's youtube handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialYoutube: string;

  @Field({ nullable: true, description: "user's tiktok handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTiktok: string;

  @Field({ nullable: true, description: "user's twitch handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTwitch: string;

  @Field({ nullable: true, description: "user's mobile number" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly mobile: string;

  @Field({ nullable: true, description: "user's profile image url" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly profileImageUrl: string;

  @Field({ nullable: true, description: "user's unique id" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly _id: string;

  @Field({ nullable: true, description: 'user updatedAt timestamp' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly updatedAt: string;

  @Field({ nullable: true, description: 'user createdAt timestamp' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly createdAt: string;

  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly isBlocked: boolean;

  @Field({ nullable: true, description: "user's stripe account id" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly stripe_account_id: string;

  @Field({ nullable: true, description: 'flag to check if profile is updated' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly isProfileUpdated: boolean;

  @Field({ nullable: true, description: "user's kyc status" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly kyc_status: string;
}

@ObjectType()
export class LoginUserDef {
  @Field(() => Users, { nullable: true, description: 'users information' })
  @IsOptional()
  readonly user: Users;

  @Field({ nullable: true, description: 'token for authentication' })
  @IsOptional()
  @IsString()
  readonly token: string;

  @Field({ nullable: true, description: 'tells the status after login' })
  @IsOptional()
  @IsString()
  readonly message: string;

  @Field({ nullable: true, description: 'tells about token expiration' })
  @IsOptional()
  @IsString()
  readonly expiresIn: string;

  @Field({ nullable: true, description: 'to refresh token' })
  @IsOptional()
  @IsString()
  readonly refreshToken: string;
}

@ObjectType()
export class VerifyEmailResponseDef {
  @Field(() => Users, { nullable: true, description: 'users information' })
  @IsOptional()
  readonly user: Users;

  @Field({ nullable: true, description: 'token for authentication' })
  @IsOptional()
  @IsString()
  readonly token: string;

  @Field({
    nullable: true,
    description: 'tells the status after verification of email',
  })
  @IsOptional()
  @IsString()
  readonly message: string;

  @Field({ nullable: true, description: 'tells about token expiration' })
  @IsOptional()
  @IsString()
  readonly expiresIn: string;
}

@ObjectType()
export class RefreshTokenDef {
  @Field({ nullable: true, description: 'token for authentication' })
  @IsOptional()
  @IsString()
  readonly token: string;

  @Field({
    nullable: true,
    description: 'tells the status after token refresh',
  })
  @IsOptional()
  @IsString()
  readonly message: string;

  @Field({ nullable: true, description: 'tells about token expiration' })
  @IsOptional()
  @IsString()
  readonly expiresIn: string;

  @Field({ nullable: true, description: 'to refresh token' })
  @IsOptional()
  @IsString()
  readonly refreshToken: string;
}

@ObjectType()
export class SendOtpDef {
  @Field({ nullable: true, description: 'tells the status after otp refresh' })
  @IsOptional()
  @IsString()
  readonly message: string;

  @Field({ nullable: true, description: 'tells about token expiration' })
  @IsOptional()
  @IsString()
  readonly expiresIn: string;

  @Field({ nullable: true, description: 'tells about fortask' })
  @IsOptional()
  @IsString()
  readonly forTask: string;
}

@ObjectType()
export class MessageDef {
  @Field({ nullable: true, description: 'tells the status of a specific task' })
  @IsOptional()
  @IsString()
  readonly message: string;
}

@ObjectType()
export class UploadProfilePictureDef {
  @Field({ nullable: true, description: 'tells the status of upload picture' })
  @IsOptional()
  @IsString()
  readonly message: string;

  @Field({ nullable: true, description: 'tells about the profileimage url' })
  @IsOptional()
  @IsString()
  readonly profileImageUrl: string;
}

@ObjectType()
export class UpdateUserDef {
  @Field({
    defaultValue: true,
    description: 'tells the state of a specific user',
  })
  state: boolean;
}

@ObjectType()
export class Balance {
  @Field({ nullable: true, description: 'tells about the assetcode' })
  assetCode: string;

  @Field({
    nullable: true,
    description: 'tells the amount',
  })
  amount: number;
}

@ObjectType()
export class GetBalanceDef {
  @Field(() => [Balance], {
    nullable: true,
    description: 'tells balance information',
  })
  balance: Balance[];
}

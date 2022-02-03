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

  @Field({
    nullable: true,
    description: 'toggle to allow spending vrynt platform credit',
  })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly spendVryntPlatformCredit: boolean;

  @Field({ nullable: true, description: 'toggle to allow use of credit card' })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly spendViaCreditCard: boolean;

  @Field({
    nullable: true,
    description: 'toggle to allow claim of vrynt token',
  })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly claimVryntToken: boolean;

  @Field({ nullable: true, description: "user's stripe account id" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly stripe_account_id: string;

  @Field({ nullable: true, description: 'toggle to allow collection creation' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly canCreateCollection: boolean;

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

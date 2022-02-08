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
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/guards/role.enum';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field({ nullable: true, description: "enter the user's email" })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @Field({ nullable: true, description: "enter the user's username" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  }) //  /^[a-z0-9_\.]+$/.test
  readonly username: string;

  @Field({ nullable: true, description: "enter the user's first_name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @Field({ nullable: true, description: "enter the user's last_name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @Field({ nullable: true, description: "enter the user's password" })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;
}

@InputType()
export class GoogleLoginDto {
  @Field({ nullable: true, description: "enter user's firstName" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @Field({ nullable: true, description: "enter user's lastName" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @Field({ nullable: true, description: "enter user's email" })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @Field({ nullable: true, description: "enter user's imageUrl" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly imageUrl: string;

  @Field({ nullable: true, description: "enter user's accessToken" })
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;

  @Field({ nullable: true, description: "enter user's name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}

@InputType()
export class ForgotPasswordDto {
  @Field({ nullable: true, description: "enter user's email" })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @Field({ nullable: true, description: 'enter the recieved otp' })
  @IsString()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  readonly otp: string;

  @Field({ nullable: true, description: "enter user's password" })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;
}

@InputType()
export class TwoFactorOtpDto {
  @Field({ nullable: true, description: "enter user's email" })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @Field({ nullable: true, description: 'enter the recieved otp' })
  @IsOptional()
  @IsString()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  readonly otp: string;
}

@InputType()
export class LoginUserDto {
  @Field({ nullable: true, description: "enter user's email or username" })
  @IsString()
  @IsNotEmpty()
  readonly emailOrUsername: string;

  @Field({ nullable: true, description: "enter user's password" })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

@InputType()
export class OtpDto {
  @Field({ nullable: true, description: 'enter recieved otp' })
  @IsString()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  readonly otp: string;

  @Field({ nullable: true, description: "enter user's email" })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

@InputType()
export class ResetPasswordDto {
  @Field({ nullable: true, description: "enter user's current password" })
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @Field({ nullable: true, description: "enter user's new password" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly newPassword: string;
}

@InputType()
export class CheckEmailDto {
  @Field({ nullable: true, description: "enter user's userId" })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @Field({ nullable: true, description: "enter user's new Email" })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly newEmail: string;
}

@InputType()
export class CheckUsernameDto {
  @Field({ nullable: true, description: "enter user's username" })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;
}

@InputType()
export class UpdateProfileDto {
  @Field({ nullable: true, description: "enter user's username" })
  @IsString()
  @IsNotEmpty({ message: 'username is required' })
  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @Field({ nullable: true, description: "enter user's first name" })
  @IsString()
  @IsNotEmpty({ message: 'first_name is required' })
  readonly first_name: string;

  @Field({ nullable: true, description: "enter user's last name" })
  @IsString()
  @IsNotEmpty({ message: 'last_name is required' })
  readonly last_name: string;

  @Field({ nullable: true, description: "enter user's mobile number" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(15)
  readonly mobile: string;

  @Field({ nullable: true, description: "enter user's status" })
  @IsOptional()
  @IsString()
  readonly status: string;

  @Field({ nullable: true, description: "enter user's currentPassword" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @Field({ nullable: true, description: "enter user's newPassword" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly newPassword: string;

  @Field({ nullable: true, description: "enter user's socialDiscord handle" })
  @IsOptional()
  @IsString()
  readonly socialDiscord: string;

  @Field({ nullable: true, description: "enter user's socialTelegram handle" })
  @IsOptional()
  @IsString()
  readonly socialTelegram: string;

  @Field({ nullable: true, description: "enter user's socialTwitter handle" })
  @IsOptional()
  @IsString()
  readonly socialTwitter: string;

  @Field({ nullable: true, description: "enter user's socialInstagram handle" })
  @IsOptional()
  @IsString()
  readonly socialInstagram: string;

  @Field({ nullable: true, description: "enter user's socialYoutube handle" })
  @IsOptional()
  @IsString()
  readonly socialYoutube: string;

  @Field({ nullable: true, description: "enter user's socialTiktok handle" })
  @IsOptional()
  @IsString()
  readonly socialTiktok: string;

  @Field({ nullable: true, description: "enter user's socialTwitch handle" })
  @IsOptional()
  @IsString()
  readonly socialTwitch: string;

  @Field({ nullable: true, description: 'toggle for two factor authorization' })
  @IsOptional()
  @IsBoolean()
  readonly twoFactorAuth: boolean;

  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsOptional()
  @IsBoolean()
  readonly isBlocked: boolean;
}

@InputType()
export class tokenDto {
  @Field({ nullable: true, description: 'enter token' })
  @IsString()
  @IsNotEmpty()
  readonly token: number;

  @Field({ nullable: true, description: 'tells the token expiration' })
  @IsInt()
  @IsNotEmpty()
  readonly expiresIn: string;
}

@InputType()
export class SendEmailotpDto {
  @Field({ nullable: true, description: "enter user's email" })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

@InputType()
export class VerifyEmailResponseDto {
  @Field({
    nullable: true,
    description: 'tells the response after email verification',
  })
  @IsString()
  @IsNotEmpty()
  readonly message: string;

  @Field({ nullable: true, description: 'enter the token' })
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Field({ nullable: true, description: 'tells the expiration of the token' })
  @IsString()
  @IsNotEmpty()
  readonly expiresIn: string;

  @Field({ nullable: true, description: 'user info' })
  @IsString()
  @IsNotEmpty()
  readonly user: string;
}

@InputType()
export class ProfilePicDto {
  @Field({ nullable: true, description: 'enter file Url' })
  @IsString()
  @IsNotEmpty()
  readonly fileUrl: string;

  @Field({ nullable: true, description: 'user info' })
  @IsString()
  @IsNotEmpty()
  readonly user: string;
}

@InputType()
export class AppleLoginDto {
  @Field({ nullable: true, description: 'enter apple code' })
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @Field({ nullable: true, description: 'enter id token' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly id_token: string;
}

@InputType()
export class RefreshTokenDto {
  @Field({ nullable: true, description: 'to refresh token' })
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}

@InputType()
export class UploadProfilePictureDto {
  @Field({ nullable: true, description: 'enter profileimage Url' })
  @IsString()
  @IsNotEmpty()
  readonly profileImageUrl: string;
}

@InputType()
export class ListUsersDto {
  @Field({ nullable: true, description: 'enter userId' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @Field({
    nullable: true,
    description:
      'enter sortby -> name, email, username, mobile, createdAt, updatedAt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sortBy: string;

  @Field((type) => Int, {
    nullable: true,
    description: 'enter sortOrder -> (-1 for descending & 1 for ascending)',
  })
  @IsOptional()
  @IsNumber()
  readonly sortOrder: number;

  @Field((type) => Int, { nullable: true, description: ' enter limit' })
  @IsOptional()
  @IsNumber()
  readonly limit: number;

  @Field((type) => Int, { nullable: true, description: 'enter offset' })
  @IsOptional()
  @IsNumber()
  readonly offset: number;

  @Field((type) => Int, { nullable: true, description: 'enter status' })
  @IsOptional()
  @IsNumber()
  readonly status: number;

  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsOptional()
  @IsBoolean()
  readonly isBlocked: boolean;

  @Field({ nullable: true, description: 'toggle for user role' })
  @IsOptional()
  @IsString()
  readonly role: string;

  @Field({ nullable: true, description: 'toggle for two factor authorization' })
  @IsOptional()
  @IsBoolean()
  readonly twoFactorAuth: boolean;

  @Field({ nullable: true, description: 'flag to check if profile is updated' })
  @IsOptional()
  @IsBoolean()
  readonly isProfileUpdated: boolean;

  @Field({ nullable: true, description: 'tells if email is verified' })
  @IsOptional()
  @IsBoolean()
  readonly isEmailVerified: boolean;

  @Field({ nullable: true, description: "enter user's name" })
  @IsOptional()
  @IsString()
  readonly name: string;

  @Field({ nullable: true, description: "enter user's email" })
  @IsOptional()
  @IsString()
  readonly email: string;

  @Field({ nullable: true, description: "enter user's username" })
  @IsOptional()
  @IsString()
  readonly username: string;

  @Field({ nullable: true, description: "enter user's mobile" })
  @IsOptional()
  @IsString()
  readonly mobile: string;
}

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsBoolean()
  readonly isBlocked: boolean;

  @Field({ nullable: true, description: "enter user's first name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @Field({ nullable: true, description: "enter user's last name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @Field({ nullable: true, description: "enter user's email" })
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @Field({ nullable: true, description: "enter user's username" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @Field({ nullable: true, description: "enter user's mobile number" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly mobile: string;

  @Field({ nullable: true, description: "enter user's socialTelegram handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTelegram: string;

  @Field({ nullable: true, description: "enter user's socialDiscord handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialDiscord: string;

  @Field({ nullable: true, description: "enter user's profileImage Url" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly profileImageUrl: string;

  @Field({ nullable: true, description: "enter user's status" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly status: string;
}

class Address {
  @IsString()
  @IsNotEmpty()
  readonly street: string;

  @IsString()
  @IsNotEmpty()
  readonly town: string;

  @IsString()
  @IsNotEmpty()
  readonly postcode: string;

  @IsString()
  @IsNotEmpty()
  readonly country: string;
}

export class KycApplicantDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @IsString()
  @IsNotEmpty()
  readonly dob: string;

  @IsNotEmpty()
  readonly address: Address;
}

@InputType()
export class GetUsersDto {
  @Field(() => [String], { nullable: true, description: 'array of  userIds' })
  @IsOptional()
  @IsNotEmpty()
  readonly userIds: string[];

  @Field(() => [String], { nullable: true, description: 'array of  userIds' })
  @IsOptional()
  @IsNotEmpty()
  readonly names: string[];

  @Field({
    nullable: true,
    description:
      'enter sortBy - name, email, username, mobile, createdAt, updatedAt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sortBy: string;

  @Field({
    nullable: true,
    description: 'enter sortOrder -> (-1 for descending & 1 for ascending)',
  })
  @IsOptional()
  @IsNumber()
  readonly sortOrder: number;

  @Field({ nullable: true, description: 'enter limit' })
  @IsOptional()
  @IsNumber()
  readonly limit: number;

  @Field({ nullable: true, description: 'enter offset' })
  @IsOptional()
  @IsNumber()
  readonly offset: number;

  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsOptional()
  @IsBoolean()
  readonly isBlocked: boolean;

  @Field({ nullable: true, description: "user's role" })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: string;
}

export class KycVerificationDto {
  @IsString()
  @IsNotEmpty()
  readonly documentType: string;
}

@InputType()
export class GetUserByIdDto {
  @Field({ nullable: true, description: 'enter the user id' })
  @IsString()
  @IsNotEmpty()
  readonly id: string;
}

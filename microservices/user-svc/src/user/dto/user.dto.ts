import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
  IsNumberString,
  Matches,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Role } from '../../guards/role.enum';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_\.]+$/)
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  readonly otp: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;
}

export class TwoFactorOtpDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  readonly otp: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  readonly emailOrUsername: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class OtpDto {
  @IsString()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  readonly otp: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly newPassword: string;
}

export class ListUsersDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly sortBy: string;

  @IsNumber()
  readonly sortOrder: number;

  @IsNumber()
  readonly limit: number;

  @IsNumber()
  readonly offset: number;

  @IsNumber()
  readonly status: number;

  @IsBoolean()
  @IsOptional()
  readonly canCreateCollection: boolean;

  @IsBoolean()
  @IsOptional()
  readonly isBlocked: boolean;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: string;

  @IsBoolean()
  readonly twoFactorAuth: boolean;

  @IsString()
  @IsNotEmpty()
  readonly isProfileUpdated: boolean;

  @IsString()
  @IsNotEmpty()
  readonly isEmailVerified: boolean;

  @IsString()
  @IsNotEmpty()
  readonly spendVryntPlatformCredit: boolean;

  @IsString()
  @IsNotEmpty()
  readonly spendViaCreditCard: boolean;

  @IsString()
  @IsNotEmpty()
  readonly claimVryntToken: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly mobile: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly metamask_id: string;
}

export class UpdateUserDto {
  @IsBoolean()
  readonly isBlocked: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @IsString()
  @IsNotEmpty()
  readonly role: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly mobile: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTelegram: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialDiscord: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTwitter: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialInstagram: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialYoutube: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTiktok: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTwitch: string;

  @IsBoolean()
  readonly canCreateCollection: boolean;

  @IsBoolean()
  readonly spendVryntPlatformCredit: boolean;

  @IsBoolean()
  readonly spendViaCreditCard: boolean;

  @IsBoolean()
  readonly claimVryntToken: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly profileImageUrl: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly status: string;
}

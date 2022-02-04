import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
  IsNumberString,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Role } from 'src/guards/role.enum';

export class CreateUserDto {
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
  readonly name: string;

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

export class CheckEmailDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly newEmail: string;
}

export class CheckUsernameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(15)
  readonly mobile: string;

  @IsOptional()
  @IsString()
  readonly status: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly newPassword: string;

  @IsOptional()
  @IsString()
  readonly socialDiscord: string;

  @IsOptional()
  @IsString()
  readonly socialDelegram: string;

  @IsOptional()
  @IsBoolean()
  readonly TwoFactorAuth: boolean;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}

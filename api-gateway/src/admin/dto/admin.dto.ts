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
  IsNumber,
  IsNumberOptions,
} from 'class-validator';
import { Role } from 'src/guards/role.enum';
import { Field, Int, Float, InputType } from '@nestjs/graphql';
import { type } from 'os';

@InputType()
export class HelloDto {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}

@InputType()
export class ListUsersDto {
  @Field({ nullable: true, description: "user's userId" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

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

  @Field({ nullable: true, description: 'limit' })
  @IsOptional()
  @IsNumber()
  readonly limit: number;

  @Field({ nullable: true, description: 'offset' })
  @IsOptional()
  @IsNumber()
  readonly offset: number;

  @Field({ nullable: true, description: 'toggle to allow collection creation' })
  @IsOptional()
  @IsBoolean()
  readonly canCreateCollection: boolean;

  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsOptional()
  @IsBoolean()
  readonly isBlocked: boolean;

  @Field({ nullable: true, description: "user's role" })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: string;

  @Field({ nullable: true, description: 'toggle for two factor authorization' })
  @IsOptional()
  @IsBoolean()
  readonly twoFactorAuth: boolean;

  @Field({ nullable: true, description: 'flag to check if profile is updated' })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly isProfileUpdated: boolean;

  @Field({ nullable: true, description: 'tells if email is verified' })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  readonly isEmailVerified: boolean;

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

  @Field({ nullable: true, description: "user's name" })
  @IsOptional()
  @IsString()
  readonly name: string;

  @Field({ nullable: true, description: "user's email" })
  @IsOptional()
  @IsString()
  readonly email: string;

  @Field({ nullable: true, description: "user's username" })
  @IsOptional()
  @IsString()
  readonly username: string;

  @Field({ nullable: true, description: "user's mobile number" })
  @IsOptional()
  @IsString()
  readonly mobile: string;

  @Field({ nullable: true, description: "user's metamask id" })
  @IsOptional()
  @IsString()
  readonly metamask_id: string;
}

enum RoleForUpdate {
  Subadmin = 'subadmin',
  User = 'user',
  Superadmin = 'superadmin',
}

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true, description: 'toggle for disabling user' })
  @IsOptional()
  @IsBoolean()
  readonly isBlocked: boolean;

  @Field({ nullable: true, description: "user's userId" })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @Field({ nullable: true, description: "user's first_name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @Field({ nullable: true, description: "user's last_name" })
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
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'regex error',
  })
  readonly username: string;

  @Field({ nullable: true, description: "user's mobile" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly mobile: string;

  @Field({ nullable: true, description: "user's socialTelegram handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTelegram: string;

  @Field({ nullable: true, description: "user's socialDiscord handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialDiscord: string;

  @Field({ nullable: true, description: "user's socialTwitter handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTwitter: string;

  @Field({ nullable: true, description: "user's socialInstagram handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialInstagram: string;

  @Field({ nullable: true, description: "user's socialYoutube handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialYoutube: string;

  @Field({ nullable: true, description: "user's socialTiktok handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTiktok: string;

  @Field({ nullable: true, description: "user's socialTwitch handle" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly socialTwitch: string;

  @Field({ nullable: true, description: "user's canCreateCollection toggle" })
  @IsOptional()
  @IsBoolean()
  readonly canCreateCollection: boolean;

  @Field({
    nullable: true,
    description: "user's spend Vrynt Platform Credit toggle",
  })
  @IsOptional()
  @IsBoolean()
  readonly spendVryntPlatformCredit: boolean;

  @Field({ nullable: true, description: "user's spend Via Credit Card toggle" })
  @IsOptional()
  @IsBoolean()
  readonly spendViaCreditCard: boolean;

  @Field({ nullable: true, description: "user's claim Vrynt Token toggle" })
  @IsOptional()
  @IsBoolean()
  readonly claimVryntToken: boolean;

  @Field({ nullable: true, description: "user's profile Image Url" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly profileImageUrl: string;

  @Field({ nullable: true, description: "user's status" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly status: string;

  @Field({ nullable: true, description: "user's role" })
  @IsOptional()
  @IsEnum(RoleForUpdate)
  @IsString()
  @IsNotEmpty()
  readonly role: string;
}

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
  IsNumber,
  IsEnum,
} from 'class-validator';
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

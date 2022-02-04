import { IsString, IsNotEmpty } from 'class-validator';

export class createChargeDto {
  @IsString()
  @IsNotEmpty()
  readonly chargeName: string;

  @IsString()
  @IsNotEmpty()
  readonly chargeDescription: string;

  @IsString()
  @IsNotEmpty()
  readonly pricing_type: string;

  @IsString()
  @IsNotEmpty()
  readonly platform: string;

  @IsString()
  @IsNotEmpty()
  readonly kind: string;

  @IsString()
  @IsNotEmpty()
  readonly amount: string;

  @IsString()
  @IsNotEmpty()
  readonly fee: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly asset_code: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPlaySubscriptionRequestDto {
  @ApiProperty({ example: 'com.financa.walletbuddy' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  packageName: string;

  @ApiProperty({ example: 'premium_monthly' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  productId: string;

  @ApiProperty({
    description: 'Purchase token from Google Play Billing (Android).',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  purchaseToken: string;
}

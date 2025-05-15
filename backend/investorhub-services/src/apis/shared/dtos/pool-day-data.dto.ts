import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PoolDayDataDto {
  @ApiProperty({ example: '1700000000', description: 'Timestamp of the day' })
  @IsString()
  date: string;

  @ApiProperty({ example: '1500.00', description: 'Fees earned in USD for this day' })
  @IsNumberString()
  feesUSD: string;

  @ApiProperty({ example: '1000000.00', description: 'Volume in USD for this day' })
  @IsNumberString()
  volumeUSD: string;

  @ApiProperty({ example: '5000000.00', description: 'Total Value Locked in USD for this day' })
  @IsNumberString()
  tvlUSD: string;

  @ApiProperty({ example: '10.35', description: 'APR anualizado estimado com base nos dados deste dia (%)' })
  @IsOptional()
  @IsNumberString()
  apr24h?: string;
} 
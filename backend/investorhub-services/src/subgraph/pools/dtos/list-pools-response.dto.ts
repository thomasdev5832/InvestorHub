import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class TokenInfoDto {
  @ApiProperty({ example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'USDC' })
  @IsString()
  symbol: string;
}

export class UniswapPoolResponseDto {
  @ApiProperty({ example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8' })
  @IsString()
  id: string;

  @ApiProperty({ example: '3000', description: 'Fee tier in hundredths of a bip, e.g., 3000 = 0.3%' })
  @IsNumberString()
  feeTier: string;

  @ApiProperty({ example: '1000000.00', description: 'Volume negociado nas últimas 24 horas (USD)' })
  @IsNumberString()
  volumeUSD: string;

  @ApiProperty({ example: '20000000.00', description: 'Volume negociado nos últimos 30 dias (USD)' })
  @IsNumberString()
  volumeUSD30d: string;

  @ApiProperty({ example: '5000000.00', description: 'Total Value Locked em USD' })
  @IsNumberString()
  tvlUSD: string;

  @ApiProperty({ type: TokenInfoDto })
  @ValidateNested()
  @Type(() => TokenInfoDto)
  @IsObject()
  token0: TokenInfoDto;

  @ApiProperty({ type: TokenInfoDto })
  @ValidateNested()
  @Type(() => TokenInfoDto)
  @IsObject()
  token1: TokenInfoDto;

  @ApiProperty({ example: '1500.00', description: 'Taxas acumuladas em USD' })
  @IsNumberString()
  feesUSD: string;

  @ApiProperty({ example: '1700000000', description: 'Timestamp de criação do pool' })
  @IsNumberString()
  createdAtTimestamp: string;

  @ApiProperty({ example: '10.35', description: 'APR anualizado estimado com base no volume das últimas 24h (%)' })
  @IsOptional()
  @IsNumberString()
  apr24h?: string;

  @ApiProperty({ example: '0.2450', description: 'Razão entre volume de 1 dia e TVL' })
  @IsOptional()
  @IsNumberString()
  volume1dToTVL?: string;
}

export class UniswapPoolsResponseDto {
  @ApiProperty({ type: [UniswapPoolResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UniswapPoolResponseDto)
  pools: UniswapPoolResponseDto[];
}
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumberString,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PoolDayDataDto } from './pool-day-data.dto';

class TokenInfoDto {
  @ApiProperty({ example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'USDC' })
  @IsString()
  symbol: string;
}

export class UniswapPoolResponseDto {
  @ApiProperty({ example: '3000', description: 'Fee tier in hundredths of a bip, e.g., 3000 = 0.3%' })
  @IsNumberString()
  feeTier: string;

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

  @ApiProperty({ example: '1700000000', description: 'Timestamp de criação do pool' })
  @IsNumberString()
  createdAtTimestamp: string;

  @ApiProperty({ type: [PoolDayDataDto], description: 'Daily data for the pool' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoolDayDataDto)
  poolDayData: PoolDayDataDto[];
}

export class UniswapPoolsResponseDto {
  @ApiProperty({ type: [UniswapPoolResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UniswapPoolResponseDto)
  pools: UniswapPoolResponseDto[];

  @ApiProperty({ example: 22360835, description: 'Block number used for the query' })
  @IsNumberString()
  blockNumber: string;
}
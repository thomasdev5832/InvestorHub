import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenInfoDto {
  @ApiProperty({ example: 'USDC' })
  @IsString()
  symbol: string;
}

export class PoolInfoDto {
  @ApiProperty({ example: '10000' })
  @IsString()
  feeTier: string;

  @ApiProperty({ example: '0x7bea39867e4169dbe237d55c8242a8f2fcdcc387' })
  @IsString()
  id: string;

  @ApiProperty({ type: TokenInfoDto })
  token0: TokenInfoDto;

  @ApiProperty({ type: TokenInfoDto })
  token1: TokenInfoDto;

  @ApiProperty({
    example: '8997075.931661445873296074240231562',
    description: 'Valor total em USD travado neste pool',
  })
  @IsString()
  totalValueLockedUSD: string;
}
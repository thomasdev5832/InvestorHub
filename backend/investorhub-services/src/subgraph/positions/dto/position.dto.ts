import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ description: 'Token contract address' })
  id: string;

  @ApiProperty({ description: 'Token symbol (e.g., USDC, WETH)' })
  symbol: string;

  @ApiProperty({ description: 'Token name (e.g., USD Coin, Wrapped Ether)' })
  name: string;

  @ApiProperty({ description: 'Token decimals (e.g., 18 for ETH, 6 for USDC)' })
  decimals: number;
}

export class TickRangeDto {
  @ApiProperty({ description: 'Lower tick of the position range' })
  lower: number;

  @ApiProperty({ description: 'Upper tick of the position range' })
  upper: number;
}

export class PricesDto {
  @ApiProperty({ description: 'Current price of token0 in terms of token1' })
  token0: string;

  @ApiProperty({ description: 'Current price of token1 in terms of token0' })
  token1: string;
}

export class CollectedFeesDto {
  @ApiProperty({ description: 'Collected fees in token0' })
  token0: string;

  @ApiProperty({ description: 'Collected fees in token1' })
  token1: string;
}

export class PoolDto {
  @ApiProperty({ description: 'Pool contract address' })
  id: string;

  @ApiProperty({ description: 'Current price of token0 in terms of token1 in the pool' })
  token0Price: string;

  @ApiProperty({ description: 'Current price of token1 in terms of token0 in the pool' })
  token1Price: string;

  @ApiProperty({ description: 'Fee tier of the pool (e.g., 500 for 0.05%)' })
  feeTier: number;
}

export class PositionDto {
  @ApiProperty({ description: 'Position ID' })
  id: string;

  @ApiProperty({ type: TokenDto, description: 'First token in the pair' })
  token0: TokenDto;

  @ApiProperty({ type: TokenDto, description: 'Second token in the pair' })
  token1: TokenDto;

  @ApiProperty({ description: 'Amount of liquidity in the position' })
  liquidity: string;

  @ApiProperty({ description: 'Collected fees in token0' })
  collectedFeesToken0: string;

  @ApiProperty({ description: 'Collected fees in token1' })
  collectedFeesToken1: string;

  @ApiProperty({ type: PoolDto, description: 'Pool information' })
  pool: PoolDto;
}

export class PositionsResponseDto {
  @ApiProperty({ type: [PositionDto], description: 'List of positions for the wallet' })
  positions: PositionDto[];
} 
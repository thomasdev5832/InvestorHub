import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PositionHoldingsDto {
  @ApiProperty({
    description: 'The Uniswap V3 pool address',
    example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'
  })
  @IsString()
  @IsNotEmpty()
  poolAddress: string;

  @ApiProperty({
    description: 'The address that owns the positions',
    example: '0x1234567890123456789012345678901234567890'
  })
  @IsString()
  @IsNotEmpty()
  ownerAddress: string;

  @ApiProperty({
    description: 'The network identifier (e.g., eip155:11155111, eip155:84532)',
    example: 'eip155:11155111'
  })
  @IsString()
  @IsNotEmpty()
  network: string;
} 
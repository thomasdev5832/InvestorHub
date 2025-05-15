import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsNotEmpty, MinLength, MaxLength, IsEthereumAddress } from 'class-validator';

export class CreateTokenDto {
  @ApiProperty({ example: 'Ethereum', description: 'Token name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ETH', description: 'Token symbol' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  symbol: string;

  @ApiProperty({ example: 'https://example.com/eth-logo.png', description: 'Token image URL', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: '0x0000000000000000000000000000000000000000', description: 'Token address' })
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}

export class UpdateTokenDto {
  @ApiProperty({ example: 'Ethereum', description: 'Token name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'ETH', description: 'Token symbol', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  symbol?: string;

  @ApiProperty({ example: 'https://example.com/eth-logo.png', description: 'Token image URL', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class TokenResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Token ID' })
  id: string;

  @ApiProperty({ example: 'Ethereum', description: 'Token name' })
  name: string;

  @ApiProperty({ example: 'ETH', description: 'Token symbol' })
  symbol: string;

  @ApiProperty({ example: 'https://example.com/eth-logo.png', description: 'Token image URL', required: false })
  imageUrl?: string;

}

export class TokenQueryDto {
  @ApiProperty({ example: 'ETH', description: 'Token symbol to search for', required: false })
  @IsOptional()
  @IsString()
  symbol?: string;
}

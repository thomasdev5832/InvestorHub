import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UncollectedFeesDto {
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
import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PoolInfoDto } from './pool-info.dto';

export class ListPoolsResponseDto {
  @ApiProperty({ example: 'ethereum' })
  @IsString()
  network: string;

  @ApiProperty({
    example: 'USD/ETH',
  })
  @IsString()
  pair: string;

  @ApiProperty({ type: [PoolInfoDto] })
  @ValidateNested({ each: true })
  @Type(() => PoolInfoDto)
  pools: PoolInfoDto[];
}
import { IsDefined, IsString, IsEthereumAddress } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ListPoolsRequestDto {
    @ApiProperty({ example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' })
    @IsDefined()
    @IsEthereumAddress()
    @Transform(({ value }) => value.toLowerCase())
    tokenA: string;

    @ApiProperty({ example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' })
    @IsDefined()
    @IsEthereumAddress()
    @Transform(({ value }) => value.toLowerCase())
    tokenB: string;

    @ApiProperty({ example: 'ethereum' })
    @IsDefined()
    @IsString()
    network: string;

    @ApiProperty({ example: 'https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV' })
    @IsDefined()
    @IsString()
    endpoint: string;
}
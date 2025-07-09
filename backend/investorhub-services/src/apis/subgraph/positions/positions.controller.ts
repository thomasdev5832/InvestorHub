import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { IsEthereumAddress } from 'class-validator';
import { PositionsResponseDto } from './dto/position.dto';
import { ErrorResponseDto } from '../../shared/dtos/error-response.dto';

class WalletParam {
  @IsEthereumAddress()
  wallet: string;
}

@Controller('subgraph/positions')
@ApiTags('Positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) { }

  @Get(':wallet')
  @ApiOperation({ summary: 'Get all Uniswap V3 positions for a wallet' })
  @ApiParam({ name: 'wallet', description: 'Wallet address to fetch positions for', example: '0x50ec05ade8280758e2077fcbc08d878d4aef79c3' })
  @ApiResponse({
    status: 200,
    description: 'Returns all positions for the given wallet',
    type: PositionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No positions found for the wallet',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 502,
    description: 'Failed to fetch data from subgraph',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service temporarily unavailable',
    type: ErrorResponseDto,
  })
  async getPositionsForWallet(@Param() params: WalletParam): Promise<PositionsResponseDto> {
    return this.positionsService.getPositionsForWallet(params.wallet);
  }
} 
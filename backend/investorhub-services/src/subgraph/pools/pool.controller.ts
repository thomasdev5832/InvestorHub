import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PoolService } from './pool.service';
import { ListPoolsRequestDto } from './dto/list-pools-request.dto';
import { UniswapPoolsResponseDto } from './dto/list-pools-response.dto';
import { ErrorResponseDto } from '../../shared/dtos/error-response.dto';

@ApiTags('Pools')
@Controller('pools')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Post()
  @ApiOperation({ summary: 'Get pools for token pair' })
  @ApiResponse({ status: 200, description: 'Pools retrieved successfully', type: UniswapPoolsResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid token addresses', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'No pools found for the given token pair', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable', type: ErrorResponseDto })
  async getPools(@Body() body: ListPoolsRequestDto): Promise<UniswapPoolsResponseDto> {
    const { token0, token1 } = body;
    return this.poolService.fetchPoolsForTokenPair(token0, token1);
  }
}

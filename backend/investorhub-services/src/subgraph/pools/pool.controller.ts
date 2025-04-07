import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PoolService } from './pool.service';
import { ListPoolsRequestDto } from './dtos/list-pools-request.dto';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ListPoolsResponseDto } from './dtos/list-pools-response.dto';
import { ErrorResponseDto } from 'src/shared/dtos/error-response.dto';

@Controller('pool')
export class PoolController {
  constructor(private readonly subgraphService: PoolService) { }

  @Post()
  @ApiOkResponse({ type: ListPoolsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'No pools found', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto })
  async getPools(@Body() body: ListPoolsRequestDto): Promise<ListPoolsResponseDto> {
    const { tokenA, tokenB, network, endpoint } = body;
    return this.subgraphService.fetchPoolsForTokenPair(tokenA, tokenB, network, endpoint);
  }
}

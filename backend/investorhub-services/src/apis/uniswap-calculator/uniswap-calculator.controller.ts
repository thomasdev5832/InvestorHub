import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UniswapCalculatorService } from './uniswap-calculator.service';
import { PositionHoldingsDto } from './dto/position-holdings.dto';
import { UncollectedFeesDto } from './dto/uncollected-fees.dto';
import { LiquidityCalculatorDto } from './dto/liquidity-calculator.dto';

@ApiTags('Uniswap V3 Calculator')
@Controller('uniswap-calculator')
export class UniswapCalculatorController {
  private readonly logger = new Logger(UniswapCalculatorController.name);

  constructor(private readonly uniswapCalculatorService: UniswapCalculatorService) {}

  @Post('position-holdings')
  @ApiOperation({
    summary: 'Calculate position holdings',
    description: 'Calculate current token amounts in all Uniswap V3 positions for an owner'
  })
  @ApiBody({ type: PositionHoldingsDto })
  @ApiResponse({
    status: 200,
    description: 'Position holdings calculated successfully',
    schema: {
      type: 'object',
      properties: {
        ownerAddress: { type: 'string', example: '0x1234567890123456789012345678901234567890' },
        network: { type: 'string', example: 'eip155:11155111' },
        positions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tokenId: { type: 'string', example: '123' },
              poolAddress: { type: 'string', example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8' },
              inRange: { type: 'boolean', example: true },
              token0Amount: { type: 'string', example: '1000000000000000000' },
              token1Amount: { type: 'string', example: '500000000000000000' },
              token0AmountHuman: { type: 'number', example: 1.0 },
              token1AmountHuman: { type: 'number', example: 0.5 },
              token0Symbol: { type: 'string', example: 'USDC' },
              token1Symbol: { type: 'string', example: 'ETH' },
              token0Decimals: { type: 'number', example: 6 },
              token1Decimals: { type: 'number', example: 18 },
              currentTick: { type: 'number', example: 201838 },
              currentPrice: { type: 'number', example: 1.0001 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters or unsupported network'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getPositionHoldings(@Body() dto: PositionHoldingsDto) {
    this.logger.log(`Position holdings request for owner: ${dto.ownerAddress}, network: ${dto.network}`);
    return this.uniswapCalculatorService.getPositionHoldings(dto);
  }

  @Post('uncollected-fees')
  @ApiOperation({
    summary: 'Calculate uncollected fees',
    description: 'Calculate uncollected fees for all Uniswap V3 positions for an owner'
  })
  @ApiBody({ type: UncollectedFeesDto })
  @ApiResponse({
    status: 200,
    description: 'Uncollected fees calculated successfully',
    schema: {
      type: 'object',
      properties: {
        ownerAddress: { type: 'string', example: '0x1234567890123456789012345678901234567890' },
        network: { type: 'string', example: 'eip155:11155111' },
        positions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tokenId: { type: 'string', example: '123' },
              poolAddress: { type: 'string', example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8' },
              token0Fees: { type: 'string', example: '1000000' },
              token1Fees: { type: 'string', example: '500000000000000000' },
              token0FeesHuman: { type: 'number', example: 1.0 },
              token1FeesHuman: { type: 'number', example: 0.5 },
              token0Symbol: { type: 'string', example: 'USDC' },
              token1Symbol: { type: 'string', example: 'ETH' },
              token0Decimals: { type: 'number', example: 6 },
              token1Decimals: { type: 'number', example: 18 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters or unsupported network'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getUncollectedFees(@Body() dto: UncollectedFeesDto) {
    this.logger.log(`Uncollected fees request for owner: ${dto.ownerAddress}, network: ${dto.network}`);
    return this.uniswapCalculatorService.getUncollectedFees(dto);
  }

  @Post('liquidity-calculation')
  @ApiOperation({
    summary: 'Calculate liquidity',
    description: 'Analyze liquidity distribution for all Uniswap V3 positions for an owner'
  })
  @ApiBody({ type: LiquidityCalculatorDto })
  @ApiResponse({
    status: 200,
    description: 'Liquidity calculation completed successfully',
    schema: {
      type: 'object',
      properties: {
        ownerAddress: { type: 'string', example: '0x1234567890123456789012345678901234567890' },
        network: { type: 'string', example: 'eip155:11155111' },
        positions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tokenId: { type: 'string', example: '123' },
              poolAddress: { type: 'string', example: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8' },
              liquidity: { type: 'string', example: '1000000000000000000' },
              amount0: { type: 'string', example: '1000000000000000000' },
              amount1: { type: 'string', example: '500000000000000000' },
              amount0Human: { type: 'number', example: 1.0 },
              amount1Human: { type: 'number', example: 0.5 },
              token0Symbol: { type: 'string', example: 'USDC' },
              token1Symbol: { type: 'string', example: 'ETH' },
              token0Decimals: { type: 'number', example: 6 },
              token1Decimals: { type: 'number', example: 18 },
              currentTick: { type: 'number', example: 201838 },
              currentPrice: { type: 'number', example: 1.0001 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters or unsupported network'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getLiquidityCalculation(@Body() dto: LiquidityCalculatorDto) {
    this.logger.log(`Liquidity calculation request for owner: ${dto.ownerAddress}, network: ${dto.network}`);
    return this.uniswapCalculatorService.getLiquidityCalculation(dto);
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { UniswapMathService } from './uniswap-math.service';
import { PositionHoldingsDto } from './dto/position-holdings.dto';
import { UncollectedFeesDto } from './dto/uncollected-fees.dto';
import { LiquidityCalculatorDto } from './dto/liquidity-calculator.dto';
import { ERC20_ABI } from '../shared/ABIS/ERC20';
import { POSITION_MANAGER_ABI } from '../shared/ABIS/POSITION_MANAGER';
import { POOL_ABI } from '../shared/ABIS/POOL';
import { Position } from '../shared/interfaces/Positions';
import { NETWORKS_CONFIGS } from '../shared/helpers/constants';

@Injectable()
export class UniswapCalculatorService {
  private readonly logger = new Logger(UniswapCalculatorService.name);

  constructor(private readonly uniswapMathService: UniswapMathService) {}

  private getNetworkConfig(network: string) {
    const config = NETWORKS_CONFIGS[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return config;
  }

  private getProvider(network: string): ethers.JsonRpcProvider {
    const config = this.getNetworkConfig(network);
    return new ethers.JsonRpcProvider(config.providerUrl);
  }

  private getPositionManagerAddress(network: string): string {
    const config = this.getNetworkConfig(network);
    return config.positionManagerAddress;
  }

  private convertBigIntToString(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertBigIntToString(item));
    }
    
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.convertBigIntToString(obj[key]);
        }
      }
      return result;
    }
    
    return obj;
  }

  async getPositionHoldings(dto: PositionHoldingsDto) {
    try {
      this.logger.log(`Fetching position holdings for pool: ${dto.poolAddress} on network: ${dto.network}`);

      const provider = this.getProvider(dto.network);
      const positionManagerAddress = this.getPositionManagerAddress(dto.network);

      // Get pool contract
      const poolContract = new ethers.Contract(dto.poolAddress, POOL_ABI, provider);
      
      // Get position manager contract
      const positionManager = new ethers.Contract(positionManagerAddress, POSITION_MANAGER_ABI, provider);

      // Get pool data
      const [token0, token1, fee, slot0, liquidity, feeGrowthGlobal0, feeGrowthGlobal1] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.slot0(),
        poolContract.liquidity(),
        poolContract.feeGrowthGlobal0X128(),
        poolContract.feeGrowthGlobal1X128(),
      ]);

      const currentTick = Number(slot0.tick);
      const currentSqrtPriceX96 = slot0.sqrtPriceX96;

      // Get token contracts
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      // Get token data
      const [token0Decimals, token1Decimals, token0Symbol, token1Symbol] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
        token0Contract.symbol(),
        token1Contract.symbol(),
      ]);

      // Get owner's positions
      const balance = await positionManager.balanceOf(dto.ownerAddress);
      const positions: Position[] = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await positionManager.tokenOfOwnerByIndex(dto.ownerAddress, i);
          const position = await positionManager.positions(tokenId);
          
          // Check if this position belongs to the target pool
          if (position.token0.toLowerCase() === token0.toLowerCase() && 
              position.token1.toLowerCase() === token1.toLowerCase() && 
              position.fee === fee) {
            positions.push({
              tokenId: tokenId.toString(),
              tickLower: Number(position.tickLower),
              tickUpper: Number(position.tickUpper),
              liquidity: position.liquidity.toString(),
              feeGrowthInside0LastX128: position.feeGrowthInside0LastX128.toString(),
              feeGrowthInside1LastX128: position.feeGrowthInside1LastX128.toString(),
              tokensOwed0: position.tokensOwed0.toString(),
              tokensOwed1: position.tokensOwed1.toString(),
            });
          }
        } catch (error) {
          this.logger.warn(`Error fetching position ${i}: ${error.message}`);
        }
      }

      if (positions.length === 0) {
        return {
          message: 'No positions found for this pool and owner',
          positions: [],
        };
      }

      // Calculate holdings for each position
      const results: any[] = [];
      for (const position of positions) {
        const result = this.uniswapMathService.calculatePositionHoldings({
          liquidity: BigInt(position.liquidity),
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
          currentTick,
          currentSqrtPriceX96: BigInt(currentSqrtPriceX96.toString()),
          tokensOwed0: BigInt(position.tokensOwed0),
          tokensOwed1: BigInt(position.tokensOwed1),
        });

        results.push({
          tokenId: position.tokenId,
          inRange: result.inRange,
          token0Amount: result.token0Amount.toString(),
          token1Amount: result.token1Amount.toString(),
          token0AmountHuman: result.token0AmountHuman,
          token1AmountHuman: result.token1AmountHuman,
          token0Symbol,
          token1Symbol,
          token0Decimals,
          token1Decimals,
        });
      }

      return this.convertBigIntToString({
        poolAddress: dto.poolAddress,
        ownerAddress: dto.ownerAddress,
        network: dto.network,
        currentTick,
        currentPrice: Math.pow(1.0001, currentTick), // Using the formula directly
        positions: results,
      });

    } catch (error) {
      this.logger.error(`Error calculating position holdings: ${error.message}`);
      throw new Error(`Failed to calculate position holdings: ${error.message}`);
    }
  }

  async getUncollectedFees(dto: UncollectedFeesDto) {
    try {
      this.logger.log(`Fetching uncollected fees for pool: ${dto.poolAddress} on network: ${dto.network}`);

      const provider = this.getProvider(dto.network);
      const positionManagerAddress = this.getPositionManagerAddress(dto.network);

      // Get pool contract
      const poolContract = new ethers.Contract(dto.poolAddress, POOL_ABI, provider);
      
      // Get position manager contract
      const positionManager = new ethers.Contract(positionManagerAddress, POSITION_MANAGER_ABI, provider);

      // Get pool data
      const [token0, token1, fee, slot0, feeGrowthGlobal0, feeGrowthGlobal1] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.slot0(),
        poolContract.feeGrowthGlobal0X128(),
        poolContract.feeGrowthGlobal1X128(),
      ]);

      const currentTick = Number(slot0.tick);

      // Get token contracts
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      // Get token data
      const [token0Decimals, token1Decimals, token0Symbol, token1Symbol] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
        token0Contract.symbol(),
        token1Contract.symbol(),
      ]);

      // Get owner's positions
      const balance = await positionManager.balanceOf(dto.ownerAddress);
      const positions: Position[] = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await positionManager.tokenOfOwnerByIndex(dto.ownerAddress, i);
          const position = await positionManager.positions(tokenId);
          
          // Check if this position belongs to the target pool
          if (position.token0.toLowerCase() === token0.toLowerCase() && 
              position.token1.toLowerCase() === token1.toLowerCase() && 
              position.fee === fee) {
            positions.push({
              tokenId: tokenId.toString(),
              tickLower: Number(position.tickLower),
              tickUpper: Number(position.tickUpper),
              liquidity: position.liquidity.toString(),
              feeGrowthInside0LastX128: position.feeGrowthInside0LastX128.toString(),
              feeGrowthInside1LastX128: position.feeGrowthInside1LastX128.toString(),
              tokensOwed0: position.tokensOwed0.toString(),
              tokensOwed1: position.tokensOwed1.toString(),
            });
          }
        } catch (error) {
          this.logger.warn(`Error fetching position ${i}: ${error.message}`);
        }
      }

      if (positions.length === 0) {
        return {
          message: 'No positions found for this pool and owner',
          positions: [],
        };
      }

      // Calculate uncollected fees for each position
      const results: any[] = [];
      for (const position of positions) {
        // Get tick data for fee calculation
        const [tickLowerData, tickUpperData] = await Promise.all([
          poolContract.ticks(position.tickLower),
          poolContract.ticks(position.tickUpper),
        ]);

        const result = this.uniswapMathService.calculateUncollectedFees({
          liquidity: BigInt(position.liquidity),
          feeGrowthGlobal0X128: BigInt(feeGrowthGlobal0.toString()),
          feeGrowthGlobal1X128: BigInt(feeGrowthGlobal1.toString()),
          feeGrowthOutsideLower0X128: BigInt(tickLowerData.feeGrowthOutside0X128.toString()),
          feeGrowthOutsideLower1X128: BigInt(tickLowerData.feeGrowthOutside1X128.toString()),
          feeGrowthOutsideUpper0X128: BigInt(tickUpperData.feeGrowthOutside0X128.toString()),
          feeGrowthOutsideUpper1X128: BigInt(tickUpperData.feeGrowthOutside1X128.toString()),
          feeGrowthInside0LastX128: BigInt(position.feeGrowthInside0LastX128),
          feeGrowthInside1LastX128: BigInt(position.feeGrowthInside1LastX128),
          tokensOwed0: BigInt(position.tokensOwed0),
          tokensOwed1: BigInt(position.tokensOwed1),
          currentTick,
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
        });

        results.push({
          tokenId: position.tokenId,
          token0Fees: result.token0Fees.toString(),
          token1Fees: result.token1Fees.toString(),
          token0FeesHuman: result.token0FeesHuman,
          token1FeesHuman: result.token1FeesHuman,
          token0Symbol,
          token1Symbol,
          token0Decimals,
          token1Decimals,
        });
      }

      return this.convertBigIntToString({
        poolAddress: dto.poolAddress,
        ownerAddress: dto.ownerAddress,
        network: dto.network,
        positions: results,
      });

    } catch (error) {
      this.logger.error(`Error calculating uncollected fees: ${error.message}`);
      throw new Error(`Failed to calculate uncollected fees: ${error.message}`);
    }
  }

  async getLiquidityCalculation(dto: LiquidityCalculatorDto) {
    try {
      this.logger.log(`Calculating liquidity for pool: ${dto.poolAddress} on network: ${dto.network}`);

      const provider = this.getProvider(dto.network);
      const positionManagerAddress = this.getPositionManagerAddress(dto.network);

      // Get pool contract
      const poolContract = new ethers.Contract(dto.poolAddress, POOL_ABI, provider);
      
      // Get position manager contract
      const positionManager = new ethers.Contract(positionManagerAddress, POSITION_MANAGER_ABI, provider);

      // Get pool data
      const [token0, token1, fee, slot0, liquidity] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.slot0(),
        poolContract.liquidity(),
      ]);

      const currentTick = Number(slot0.tick);
      const currentSqrtPriceX96 = slot0.sqrtPriceX96;

      // Get token contracts
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      // Get token data
      const [token0Decimals, token1Decimals, token0Symbol, token1Symbol] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
        token0Contract.symbol(),
        token1Contract.symbol(),
      ]);

      // Get owner's positions
      const balance = await positionManager.balanceOf(dto.ownerAddress);
      const positions: Position[] = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await positionManager.tokenOfOwnerByIndex(dto.ownerAddress, i);
          const position = await positionManager.positions(tokenId);
          
          // Check if this position belongs to the target pool
          if (position.token0.toLowerCase() === token0.toLowerCase() && 
              position.token1.toLowerCase() === token1.toLowerCase() && 
              position.fee === fee) {
            positions.push({
              tokenId: tokenId.toString(),
              tickLower: Number(position.tickLower),
              tickUpper: Number(position.tickUpper),
              liquidity: position.liquidity.toString(),
              feeGrowthInside0LastX128: '0',
              feeGrowthInside1LastX128: '0',
              tokensOwed0: '0',
              tokensOwed1: '0',
            });
          }
        } catch (error) {
          this.logger.warn(`Error fetching position ${i}: ${error.message}`);
        }
      }

      if (positions.length === 0) {
        return {
          message: 'No positions found for this pool and owner',
          positions: [],
        };
      }

      // Calculate liquidity for each position
      const results: any[] = [];
      for (const position of positions) {
        // For liquidity calculation, we need to provide desired amounts
        // Since we're analyzing existing positions, we'll use the current liquidity
        const result = this.uniswapMathService.calculateLiquidity({
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
          amount0Desired: BigInt(position.liquidity), // Using current liquidity as desired
          amount1Desired: BigInt(position.liquidity), // Using current liquidity as desired
          currentSqrtPriceX96: BigInt(currentSqrtPriceX96.toString()),
        });

        results.push({
          tokenId: position.tokenId,
          liquidity: result.liquidity.toString(),
          amount0: result.amount0.toString(),
          amount1: result.amount1.toString(),
          amount0Human: result.amount0Human,
          amount1Human: result.amount1Human,
          token0Symbol,
          token1Symbol,
          token0Decimals,
          token1Decimals,
        });
      }

      return this.convertBigIntToString({
        poolAddress: dto.poolAddress,
        ownerAddress: dto.ownerAddress,
        network: dto.network,
        currentTick,
        currentPrice: Math.pow(1.0001, currentTick), // Using the formula directly
        positions: results,
      });

    } catch (error) {
      this.logger.error(`Error calculating liquidity: ${error.message}`);
      throw new Error(`Failed to calculate liquidity: ${error.message}`);
    }
  }
} 
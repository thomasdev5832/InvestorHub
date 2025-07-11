import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UniswapMathService {
  private readonly logger = new Logger(UniswapMathService.name);

  // Uniswap V3 Constants
  private readonly Q96 = 2n ** 96n;
  private readonly Q128 = 2n ** 128n;
  private readonly ZERO = 0n;

  /**
   * Calculate current holdings in a Uniswap V3 position
   * Based on Uniswap V3 Math Primer Part 2
   */
  calculatePositionHoldings(params: {
    liquidity: bigint;
    tickLower: number;
    tickUpper: number;
    currentTick: number;
    currentSqrtPriceX96: bigint;
    tokensOwed0: bigint;
    tokensOwed1: bigint;
  }): {
    inRange: boolean;
    token0Amount: bigint;
    token1Amount: bigint;
    token0AmountHuman: number;
    token1AmountHuman: number;
  } {
    const { liquidity, tickLower, tickUpper, currentTick, currentSqrtPriceX96, tokensOwed0, tokensOwed1 } = params;

    // Validate tick range
    if (tickLower >= tickUpper) {
      throw new Error(`Invalid tick range: tickLower (${tickLower}) must be less than tickUpper (${tickUpper})`);
    }

    // Check if position is in range
    const inRange = currentTick >= tickLower && currentTick < tickUpper;

    // Calculate token amounts
    let token0Amount: bigint;
    let token1Amount: bigint;

    try {
      if (inRange) {
        // Position is in range - calculate amounts based on current price
        const sqrtRatioAX96 = this.tickToSqrtPriceX96(tickLower);
        const sqrtRatioBX96 = this.tickToSqrtPriceX96(tickUpper);
        
        this.logger.debug(`In-range calculation: tickLower=${tickLower}, tickUpper=${tickUpper}, currentTick=${currentTick}`);
        this.logger.debug(`In-range calculation: sqrtRatioAX96=${sqrtRatioAX96}, sqrtRatioBX96=${sqrtRatioBX96}, currentSqrtPriceX96=${currentSqrtPriceX96}`);
        
        // Special handling for full-range positions
        if (tickLower === -887200 && tickUpper === 887200) {
          this.logger.debug('Full-range position detected, using special calculation');
          
          // For full-range positions, use a simpler approach based on current price
          // Calculate the current price
          const currentPrice = Number(currentSqrtPriceX96 * currentSqrtPriceX96) / Number(this.Q96 * this.Q96);
          this.logger.debug(`Current price: ${currentPrice}`);
          
          // For full-range positions, the amounts should be proportional to the current price
          // Use a simplified calculation: distribute the liquidity based on current price
          const sqrtPrice = Math.sqrt(currentPrice);
          const liquidityNumber = Number(liquidity);
          
          // Calculate token amounts based on the current price
          // This is a simplified approach for full-range positions
          const token0AmountFloat = liquidityNumber / sqrtPrice;
          const token1AmountFloat = liquidityNumber * sqrtPrice;
          
          token0Amount = BigInt(Math.floor(token0AmountFloat));
          token1Amount = BigInt(Math.floor(token1AmountFloat));
          
          this.logger.debug(`Simplified calculation: token0Amount=${token0Amount}, token1Amount=${token1Amount}`);
        } else {
          // For regular in-range positions
          // amount0 = liquidity * (sqrt(upper) - sqrt(current)) / (sqrt(upper) * sqrt(current))
          token0Amount = this.getAmount0ForLiquidity(currentSqrtPriceX96, sqrtRatioBX96, liquidity);
          
          // amount1 = liquidity * (sqrt(current) - sqrt(lower))
          token1Amount = this.getAmount1ForLiquidity(sqrtRatioAX96, currentSqrtPriceX96, liquidity);
        }
      } else {
        // Position is out of range
        if (currentTick < tickLower) {
          // Price is below range - position is all token0
          const sqrtRatioAX96 = this.tickToSqrtPriceX96(tickLower);
          const sqrtRatioBX96 = this.tickToSqrtPriceX96(tickUpper);
          
          this.logger.debug(`Below range calculation: sqrtRatioAX96=${sqrtRatioAX96}, sqrtRatioBX96=${sqrtRatioBX96}`);
          
          token0Amount = this.getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
          token1Amount = this.ZERO;
        } else {
          // Price is above range - position is all token1
          const sqrtRatioAX96 = this.tickToSqrtPriceX96(tickLower);
          const sqrtRatioBX96 = this.tickToSqrtPriceX96(tickUpper);
          
          this.logger.debug(`Above range calculation: sqrtRatioAX96=${sqrtRatioAX96}, sqrtRatioBX96=${sqrtRatioBX96}`);
          
          token0Amount = this.ZERO;
          token1Amount = this.getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
        }
      }
    } catch (error) {
      this.logger.error(`Error calculating position holdings: ${error.message}`);
      this.logger.error(`Position data: liquidity=${liquidity}, tickLower=${tickLower}, tickUpper=${tickUpper}, currentTick=${currentTick}`);
      throw error;
    }

    // Add uncollected fees
    token0Amount = token0Amount + tokensOwed0;
    token1Amount = token1Amount + tokensOwed1;

    return {
      inRange,
      token0Amount,
      token1Amount,
      token0AmountHuman: Number(token0Amount),
      token1AmountHuman: Number(token1Amount),
    };
  }

  /**
   * Calculate uncollected fees in a Uniswap V3 position
   * Based on Uniswap V3 Math Primer Part 2
   */
  calculateUncollectedFees(params: {
    liquidity: bigint;
    feeGrowthGlobal0X128: bigint;
    feeGrowthGlobal1X128: bigint;
    feeGrowthOutsideLower0X128: bigint;
    feeGrowthOutsideLower1X128: bigint;
    feeGrowthOutsideUpper0X128: bigint;
    feeGrowthOutsideUpper1X128: bigint;
    feeGrowthInside0LastX128: bigint;
    feeGrowthInside1LastX128: bigint;
    tokensOwed0: bigint;
    tokensOwed1: bigint;
    currentTick: number;
    tickLower: number;
    tickUpper: number;
  }): {
    token0Fees: bigint;
    token1Fees: bigint;
    token0FeesHuman: number;
    token1FeesHuman: number;
  } {
    const {
      liquidity,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
      feeGrowthOutsideLower0X128,
      feeGrowthOutsideLower1X128,
      feeGrowthOutsideUpper0X128,
      feeGrowthOutsideUpper1X128,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
      currentTick,
      tickLower,
      tickUpper,
    } = params;

    // Calculate fee growth inside
    const feeGrowthInside0X128 = this.getFeeGrowthInside(
      feeGrowthGlobal0X128,
      feeGrowthOutsideLower0X128,
      feeGrowthOutsideUpper0X128,
      currentTick,
      tickLower,
      tickUpper
    );

    const feeGrowthInside1X128 = this.getFeeGrowthInside(
      feeGrowthGlobal1X128,
      feeGrowthOutsideLower1X128,
      feeGrowthOutsideUpper1X128,
      currentTick,
      tickLower,
      tickUpper
    );

    // Calculate uncollected fees
    const feeGrowthInside0Delta = feeGrowthInside0X128 - feeGrowthInside0LastX128;
    const feeGrowthInside1Delta = feeGrowthInside1X128 - feeGrowthInside1LastX128;

    const uncollectedFees0 = (liquidity * feeGrowthInside0Delta) / this.Q128;
    const uncollectedFees1 = (liquidity * feeGrowthInside1Delta) / this.Q128;

    // Add already owed tokens
    const totalFees0 = uncollectedFees0 + tokensOwed0;
    const totalFees1 = uncollectedFees1 + tokensOwed1;

    return {
      token0Fees: totalFees0,
      token1Fees: totalFees1,
      token0FeesHuman: Number(totalFees0),
      token1FeesHuman: Number(totalFees1),
    };
  }

  /**
   * Calculate liquidity for a given range and amounts
   * Based on Uniswap V3 Math Primer Part 2
   */
  calculateLiquidity(params: {
    tickLower: number;
    tickUpper: number;
    amount0Desired: bigint;
    amount1Desired: bigint;
    currentSqrtPriceX96: bigint;
  }): {
    liquidity: bigint;
    amount0: bigint;
    amount1: bigint;
    amount0Human: number;
    amount1Human: number;
  } {
    const { tickLower, tickUpper, amount0Desired, amount1Desired, currentSqrtPriceX96 } = params;

    // Calculate sqrt ratios
    const sqrtRatioAX96 = this.tickToSqrtPriceX96(tickLower);
    const sqrtRatioBX96 = this.tickToSqrtPriceX96(tickUpper);

    // Calculate liquidity
    let liquidity: bigint;
    let amount0: bigint;
    let amount1: bigint;

    if (currentSqrtPriceX96 <= sqrtRatioAX96) {
      // Current price is below range - only token0
      liquidity = this.getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0Desired);
      amount0 = amount0Desired;
      amount1 = this.ZERO;
    } else if (currentSqrtPriceX96 >= sqrtRatioBX96) {
      // Current price is above range - only token1
      liquidity = this.getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1Desired);
      amount0 = this.ZERO;
      amount1 = amount1Desired;
    } else {
      // Current price is in range - calculate optimal liquidity
      const liquidity0 = this.getLiquidityForAmount0(currentSqrtPriceX96, sqrtRatioBX96, amount0Desired);
      const liquidity1 = this.getLiquidityForAmount1(sqrtRatioAX96, currentSqrtPriceX96, amount1Desired);
      liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;

      // Calculate actual amounts
      amount0 = this.getAmount0ForLiquidity(currentSqrtPriceX96, sqrtRatioBX96, liquidity);
      amount1 = this.getAmount1ForLiquidity(sqrtRatioAX96, currentSqrtPriceX96, liquidity);
    }

    return {
      liquidity,
      amount0,
      amount1,
      amount0Human: Number(amount0),
      amount1Human: Number(amount1),
    };
  }

  // Helper methods for Uniswap V3 math

  private tickToSqrtPriceX96(tick: number): bigint {
    // Check bounds - Uniswap V3 ticks are limited to [-887272, 887272]
    if (tick < -887272 || tick > 887272) {
      throw new Error(`Tick ${tick} is out of bounds. Must be between -887272 and 887272`);
    }

    // For very large tick values, use a more direct calculation
    if (Math.abs(tick) > 100000) {
      return this.tickToSqrtPriceX96Direct(tick);
    }

    const absTick = Math.abs(tick);
    let ratio = 0x1000000000000000000000000n; // 2^96

    if (absTick & 0x1) ratio = (ratio * 0xfffcb933bd6fad37aa2d162d1a594001n) / 0x1000000000000000000000000n;
    if (absTick & 0x2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) / 0x1000000000000000000000000n;
    if (absTick & 0x4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) / 0x1000000000000000000000000n;
    if (absTick & 0x8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) / 0x1000000000000000000000000n;
    if (absTick & 0x10) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) / 0x1000000000000000000000000n;
    if (absTick & 0x20) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) / 0x1000000000000000000000000n;
    if (absTick & 0x40) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) / 0x1000000000000000000000000n;
    if (absTick & 0x80) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) / 0x1000000000000000000000000n;
    if (absTick & 0x100) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) / 0x1000000000000000000000000n;
    if (absTick & 0x200) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) / 0x1000000000000000000000000n;
    if (absTick & 0x400) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) / 0x1000000000000000000000000n;
    if (absTick & 0x800) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) / 0x1000000000000000000000000n;
    if (absTick & 0x1000) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) / 0x1000000000000000000000000n;
    if (absTick & 0x2000) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) / 0x1000000000000000000000000n;
    if (absTick & 0x4000) ratio = (ratio * 0x70d869a1562d1a9b9f6b6b6b6b6b6b6b6n) / 0x1000000000000000000000000n;
    if (absTick & 0x8000) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) / 0x1000000000000000000000000n;
    if (absTick & 0x10000) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) / 0x1000000000000000000000000n;
    if (absTick & 0x20000) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) / 0x1000000000000000000000000n;
    if (absTick & 0x40000) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) / 0x1000000000000000000000000n;
    if (absTick & 0x80000) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) / 0x1000000000000000000000000n;

    if (tick > 0) ratio = (2n ** 192n) / ratio;

    // Additional check to ensure we don't return zero
    if (ratio === 0n) {
      throw new Error(`Invalid tick ${tick}: calculation resulted in zero ratio`);
    }

    return ratio;
  }

  private tickToSqrtPriceX96Direct(tick: number): bigint {
    // For very large ticks, use a simpler approach
    // Calculate the price first, then take the square root
    
    if (tick === 0) {
      return this.Q96; // 2^96
    }

    // Use the existing tickToPrice method for the calculation
    const price = this.tickToPrice(tick);
    
    // Convert price to sqrt price in Q96 format
    // sqrt(price) * 2^96
    const sqrtPrice = Math.sqrt(price);
    const sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * Number(this.Q96)));
    
    if (sqrtPriceX96 === 0n) {
      throw new Error(`Invalid tick ${tick}: direct calculation resulted in zero`);
    }
    
    return sqrtPriceX96;
  }

  private sqrtPriceX96ToPrice(sqrtPriceX96: bigint): number {
    const price = (sqrtPriceX96 * sqrtPriceX96 * (10n ** 18n)) / this.Q96 / this.Q96;
    return Number(price) / 1e18;
  }

  private tickToPrice(tick: number): number {
    return Math.pow(1.0001, tick);
  }

  private getAmount0ForLiquidity(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    liquidity: bigint
  ): bigint {
    if (sqrtRatioBX96 === 0n) {
      throw new Error('Division by zero: sqrtRatioBX96 is zero');
    }
    // amount0 = liquidity * (sqrt(upper) - sqrt(lower)) / (sqrt(upper) * sqrt(lower))
    const numerator = liquidity * (sqrtRatioBX96 - sqrtRatioAX96);
    const denominator = sqrtRatioBX96 * sqrtRatioAX96;
    
    this.logger.debug(`getAmount0ForLiquidity: liquidity=${liquidity}, sqrtRatioAX96=${sqrtRatioAX96}, sqrtRatioBX96=${sqrtRatioBX96}`);
    this.logger.debug(`getAmount0ForLiquidity: numerator=${numerator}, denominator=${denominator}, result=${numerator / denominator}`);
    
    // Check if the result would be very small (less than 1)
    if (numerator < denominator) {
      this.logger.debug(`Small result detected: numerator < denominator, using alternative calculation`);
      // For very small results, use a different approach
      // Instead of using floating point, use a scaling approach to maintain precision
      const scale = 10n ** 18n; // Use 18 decimal places for precision
      const scaledNumerator = numerator * scale;
      const result = scaledNumerator / denominator;
      this.logger.debug(`Alternative calculation result: ${result}`);
      return result;
    }
    
    return numerator / denominator;
  }

  private getAmount1ForLiquidity(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    liquidity: bigint
  ): bigint {
    const denominator = sqrtRatioBX96 - sqrtRatioAX96;
    if (denominator === 0n) {
      throw new Error('Division by zero: sqrtRatioBX96 equals sqrtRatioAX96');
    }
    const result = (liquidity * denominator) / this.Q96;
    
    this.logger.debug(`getAmount1ForLiquidity: liquidity=${liquidity}, sqrtRatioAX96=${sqrtRatioAX96}, sqrtRatioBX96=${sqrtRatioBX96}`);
    this.logger.debug(`getAmount1ForLiquidity: numerator=${liquidity * denominator}, denominator=${this.Q96}, result=${result}`);
    
    return result;
  }

  private getLiquidityForAmount0(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    amount0: bigint
  ): bigint {
    const denominator = sqrtRatioBX96 - sqrtRatioAX96;
    if (denominator === 0n) {
      throw new Error('Division by zero: sqrtRatioBX96 equals sqrtRatioAX96');
    }
    const numerator = amount0 * sqrtRatioAX96 * sqrtRatioBX96;
    return numerator / denominator;
  }

  private getLiquidityForAmount1(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    amount1: bigint
  ): bigint {
    const denominator = sqrtRatioBX96 - sqrtRatioAX96;
    if (denominator === 0n) {
      throw new Error('Division by zero: sqrtRatioBX96 equals sqrtRatioAX96');
    }
    return (amount1 * this.Q96) / denominator;
  }

  private getFeeGrowthInside(
    feeGrowthGlobal: bigint,
    feeGrowthOutsideLower: bigint,
    feeGrowthOutsideUpper: bigint,
    tickCurrent: number,
    tickLower: number,
    tickUpper: number
  ): bigint {
    let feeGrowthBelow: bigint;
    let feeGrowthAbove: bigint;

    if (tickCurrent >= tickUpper) {
      feeGrowthAbove = feeGrowthGlobal - feeGrowthOutsideUpper;
    } else {
      feeGrowthAbove = feeGrowthOutsideUpper;
    }

    if (tickCurrent >= tickLower) {
      feeGrowthBelow = feeGrowthOutsideLower;
    } else {
      feeGrowthBelow = feeGrowthGlobal - feeGrowthOutsideLower;
    }

    return feeGrowthGlobal - feeGrowthBelow - feeGrowthAbove;
  }
} 
import { createPublicClient, http, getContract, PublicClient } from 'viem';
import { sepolia } from 'viem/chains';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

// Sepolia addresses
const UNISWAP_V3_FACTORY_ADDRESS = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c' as const;
const USDT_ADDRESS = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' as const;
const USDC_ADDRESS = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238' as const;
const WETH_ADDRESS = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14' as const;
const DAI_ADDRESS = '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357' as const;
const WBTC_ADDRESS = '0x29f2d40b0605204364af54ec677bd022da425d03' as const;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Mapeamento de tokens conhecidos na Sepolia com seus decimals corretos
const KNOWN_TOKENS = {
  [USDC_ADDRESS.toLowerCase( )]: { symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  [USDT_ADDRESS.toLowerCase()]: { symbol: 'USDT', decimals: 6, name: 'Tether USD' },
  [DAI_ADDRESS.toLowerCase()]: { symbol: 'DAI', decimals: 18, name: 'Dai Stablecoin' },
  [WETH_ADDRESS.toLowerCase()]: { symbol: 'WETH', decimals: 18, name: 'Wrapped Ether' },
  [WBTC_ADDRESS.toLowerCase()]: { symbol: 'WBTC', decimals: 8, name: 'Wrapped BTC' },
} as const;

const STABLECOIN_ADDRESSES = [
  USDC_ADDRESS.toLowerCase(),
  USDT_ADDRESS.toLowerCase(), 
  DAI_ADDRESS.toLowerCase()
] as const;

const FEE_TIERS = [100, 500, 3000, 10000];

const FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'tokenA', type: 'address' },
      { internalType: 'address', name: 'tokenB', type: 'address' },
      { internalType: 'uint24', name: 'fee', type: 'uint24' },
    ],
    name: 'getPool',
    outputs: [{ internalType: 'address', name: 'pool', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const POOL_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
      { internalType: 'int24', name: 'tick', type: 'int24' },
      { internalType: 'uint16', name: '', type: 'uint16' },
      { internalType: 'uint16', name: '', type: 'uint16' },
      { internalType: 'uint8', name: '', type: 'uint8' },
      { internalType: 'bool', name: '', type: 'bool' },
      { internalType: 'uint16', name: '', type: 'uint16' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface TokenPriceResult {
  priceInUSDT: number;
  priceInUSD: number;
  tokenSymbol: string;
  tokenDecimals: number;
  poolAddress: string | null;
  feeTier: number | null;
  liquidity?: string;
  error?: string;
}

interface PoolInfo {
  price: number;
  poolAddress: string;
  fee: number;
  liquidity: bigint;
}

interface TokenInfo {
  symbol: string;
  decimals: number;
  name: string;
}

async function createSepoliaClient(): Promise<PublicClient> {
  const customRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/cwrMi-r8xEwn4gpfJy2I4';
  
  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(customRpcUrl ),
    });
    await client.getBlockNumber();
    console.log('Connected to Sepolia');
    return client;
  } catch (error) {
    console.error('Failed to connect to Sepolia RPC:', error);
    throw new Error('Failed to connect to Sepolia RPC endpoint');
  }
}

async function getTokenInfo(tokenAddress: string, client: PublicClient): Promise<TokenInfo | null> {
  try {
    // First check if it's a known token
    const knownToken = KNOWN_TOKENS[tokenAddress.toLowerCase() as keyof typeof KNOWN_TOKENS];
    if (knownToken) {
      console.log(`Using cached info for known token: ${knownToken.symbol} (${knownToken.decimals} decimals)`);
      return knownToken;
    }

    // If not known, fetch from contract
    console.log(`Fetching token info from contract: ${tokenAddress}`);
    const tokenContract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      client,
    });

    const [symbol, decimals, name] = await Promise.all([
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
      tokenContract.read.name(),
    ]);

    const tokenInfo = {
      symbol: symbol as string,
      decimals: decimals as number,
      name: name as string,
    };

    console.log(`Token info fetched: ${tokenInfo.symbol} (${tokenInfo.decimals} decimals)`);
    return tokenInfo;
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    return null;
  }
}

async function getPoolInfo(
  tokenAddress: string,
  pairAddress: string,
  tokenDecimals: number,
  pairDecimals: number,
  tokenSymbol: string,
  pairSymbol: string,
  fee: number,
  client: PublicClient
): Promise<PoolInfo | null> {
  try {
    console.log(`Checking pool: ${tokenSymbol}(${tokenDecimals}) / ${pairSymbol}(${pairDecimals}) - Fee: ${fee/10000}%`);
    
    const factoryContract = getContract({
      address: UNISWAP_V3_FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      client,
    });

    const token0 = tokenAddress.toLowerCase() < pairAddress.toLowerCase() ? tokenAddress : pairAddress;
    const token1 = tokenAddress.toLowerCase() < pairAddress.toLowerCase() ? pairAddress : tokenAddress;

    const poolAddress = await factoryContract.read.getPool([token0 as `0x${string}`, token1 as `0x${string}`, fee]);
    
    if (poolAddress === ZERO_ADDRESS) {
      console.log(`Pool not found: ${tokenSymbol}/${pairSymbol} (${fee/10000}%)`);
      return null;
    }

    const poolContract = getContract({
      address: poolAddress as `0x${string}`,
      abi: POOL_ABI,
      client,
    });

    const [slot0, token0Address, liquidity] = await Promise.all([
      poolContract.read.slot0(),
      poolContract.read.token0(),
      poolContract.read.liquidity(),
    ]);

    const sqrtPriceX96 = slot0[0];
    const tick = slot0[1];

    if (liquidity === 0n) {
      console.log(`Pool ${tokenSymbol}/${pairSymbol} has no liquidity`);
      return null;
    }

    const isToken0 = tokenAddress.toLowerCase() === token0Address.toLowerCase();

    // Create tokens with correct decimals
    const token = new Token(sepolia.id, tokenAddress, tokenDecimals, tokenSymbol);
    const pairToken = new Token(sepolia.id, pairAddress, pairDecimals, pairSymbol);

    const pool = new Pool(
      isToken0 ? token : pairToken,
      isToken0 ? pairToken : token,
      fee,
      sqrtPriceX96.toString(),
      liquidity.toString(),
      Number(tick)
    );

    const price = parseFloat((isToken0 ? pool.token0Price : pool.token1Price).toSignificant(18));

    console.log(`✓ Pool found: ${tokenSymbol}(${tokenDecimals})/${pairSymbol}(${pairDecimals}) (${fee/10000}%) - Price: ${price}, Liquidity: ${liquidity.toString()}`);

    return {
      price,
      poolAddress,
      fee,
      liquidity,
    };
  } catch (error) {
    console.error(`Error fetching pool info for ${tokenSymbol}/${pairSymbol} (${fee/10000}%):`, error);
    return null;
  }
}

async function fetchEthPriceInUSDT(client: PublicClient): Promise<number | null> {
  try {
    // Tenta a pool direta WETH/USDT
    const usdtPoolInfo = await getPoolInfo(
      WETH_ADDRESS, // Usando WETH como proxy para ETH
      USDT_ADDRESS,
      18, // Decimais do ETH
      6,  // Decimais do USDT
      'WETH',
      'USDT',
      3000, // 0.3% fee tier
      client
    );
    
    if (usdtPoolInfo) {
      console.log(`ETH price via WETH/USDT: ${usdtPoolInfo.price}`);
      return usdtPoolInfo.price;
    }

    // Fallback para WETH/USDC se a pool USDT não estiver disponível
    const usdcPoolInfo = await getPoolInfo(
      WETH_ADDRESS,
      USDC_ADDRESS,
      18,
      6,
      'WETH',
      'USDC',
      3000,
      client
    );

    if (usdcPoolInfo) {
      console.log(`ETH price via WETH/USDC: ${usdcPoolInfo.price}`);
      return usdcPoolInfo.price;
    }

    return null; // Nenhum preço ETH válido encontrado
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return null;
  }
}

export async function fetchTokenPriceInUSDT(
  tokenAddress: string,
  tokenSymbol?: string,
  tokenDecimals?: number,
  feeTiers: number[] = FEE_TIERS
): Promise<TokenPriceResult> {
  try {
    console.log(`\n🔍 Fetching real-time price for token: ${tokenAddress}`);
    
    const client = await createSepoliaClient();

    // Always fetch token info to ensure correct decimals
    let tokenInfo: TokenInfo | null = null;
    
    if (!tokenSymbol || !tokenDecimals) {
      tokenInfo = await getTokenInfo(tokenAddress, client);
      if (!tokenInfo) {
        throw new Error('Failed to fetch token information');
      }
    } else {
      // Even with parameters, validate if possible
      tokenInfo = await getTokenInfo(tokenAddress, client) || {
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        name: tokenSymbol
      };
    }

    const finalTokenSymbol = tokenInfo.symbol;
    const finalTokenDecimals = tokenInfo.decimals;

    console.log(`📋 Token confirmed: ${finalTokenSymbol} (${finalTokenDecimals} decimals)`);

    // Check if it's a stablecoin
    if (STABLECOIN_ADDRESSES.includes(tokenAddress.toLowerCase() as Lowercase<typeof STABLECOIN_ADDRESSES[number]>)) {
      console.log(`💰 Stablecoin detected: ${finalTokenSymbol}`);
      return {
        priceInUSDT: 1,
        priceInUSD: 1,
        tokenSymbol: finalTokenSymbol,
        tokenDecimals: finalTokenDecimals,
        poolAddress: null,
        feeTier: null,
      };
    }

    // Special handling for WETH/ETH
    if (tokenAddress.toLowerCase() === WETH_ADDRESS.toLowerCase() || 
        tokenAddress === ZERO_ADDRESS) {
      const ethPrice = await fetchEthPriceInUSDT(client);
      if (ethPrice) {
        return {
          priceInUSDT: ethPrice,
          priceInUSD: ethPrice,
          tokenSymbol: finalTokenSymbol,
          tokenDecimals: finalTokenDecimals,
          poolAddress: null,
          feeTier: null,
        };
      }
    }

    // Conversion pairs with correct decimals
    const conversionPairs = [
      { address: USDT_ADDRESS, symbol: 'USDT', decimals: 6 },
      { address: USDC_ADDRESS, symbol: 'USDC', decimals: 6 },
      { address: DAI_ADDRESS, symbol: 'DAI', decimals: 18 },
    ];

    // Try direct stablecoin conversion
    console.log(`🔄 Trying direct stablecoin conversion for ${finalTokenSymbol}...`);
    
    for (const stablecoin of conversionPairs) {
      const pools: PoolInfo[] = [];
      
      for (const fee of feeTiers) {
        const poolInfo = await getPoolInfo(
          tokenAddress,
          stablecoin.address,
          finalTokenDecimals,
          stablecoin.decimals,
          finalTokenSymbol,
          stablecoin.symbol,
          fee,
          client
        );
        if (poolInfo) {
          pools.push(poolInfo);
        }
      }

      if (pools.length > 0) {
        const bestPool = pools.reduce((best, current) => 
          current.liquidity > best.liquidity ? current : best
        );

        console.log(`✅ Direct conversion found: ${finalTokenSymbol}(${finalTokenDecimals})/${stablecoin.symbol}(${stablecoin.decimals}) = ${bestPool.price}`);
        
        // Nenhuma validação de preço aqui. O preço é retornado como está.
        return {
          priceInUSDT: bestPool.price,
          priceInUSD: bestPool.price,
          tokenSymbol: finalTokenSymbol,
          tokenDecimals: finalTokenDecimals,
          poolAddress: bestPool.poolAddress,
          feeTier: bestPool.fee,
          liquidity: bestPool.liquidity.toString(),
        };
      }
    }

    // Try via WETH
    console.log(`🔄 No direct stablecoin pair found for ${finalTokenSymbol}, trying via WETH...`);

    let tokenWethPool: PoolInfo | null = null;
    let wethStablecoinPool: PoolInfo | null = null;

    // Token -> WETH
    const wethPools: PoolInfo[] = [];
    for (const fee of feeTiers) {
      const poolInfo = await getPoolInfo(
        tokenAddress,
        WETH_ADDRESS,
        finalTokenDecimals,
        18, // WETH always has 18 decimals
        finalTokenSymbol,
        'WETH',
        fee,
        client
      );
      if (poolInfo) {
        wethPools.push(poolInfo);
      }
    }

    if (wethPools.length > 0) {
      tokenWethPool = wethPools.reduce((best, current) => 
        current.liquidity > best.liquidity ? current : best
      );
      console.log(`✓ Token->WETH pool found: ${finalTokenSymbol}(${finalTokenDecimals})/WETH = ${tokenWethPool.price}`);
    }

    // WETH -> Stablecoin
    for (const stablecoin of conversionPairs) {
      const stablecoinPools: PoolInfo[] = [];
      
      for (const fee of feeTiers) {
        const poolInfo = await getPoolInfo(
          WETH_ADDRESS,
          stablecoin.address,
          18, // WETH always has 18 decimals
          stablecoin.decimals,
          'WETH',
          stablecoin.symbol,
          fee,
          client
        );
        if (poolInfo) {
          stablecoinPools.push(poolInfo);
        }
      }

      if (stablecoinPools.length > 0) {
        const bestStablecoinPool = stablecoinPools.reduce((best, current) => 
          current.liquidity > best.liquidity ? current : best
        );
        
        if (!wethStablecoinPool || bestStablecoinPool.liquidity > wethStablecoinPool.liquidity) {
          wethStablecoinPool = bestStablecoinPool;
          console.log(`✓ WETH->Stablecoin pool found: WETH(18)/${stablecoin.symbol}(${stablecoin.decimals}) = ${bestStablecoinPool.price}`);
        }
      }
    }

    if (tokenWethPool && wethStablecoinPool) {
      const finalPrice = tokenWethPool.price * wethStablecoinPool.price;
      
      // Nenhuma validação de preço aqui. O preço é retornado como está.
      return {
        priceInUSDT: finalPrice,
        priceInUSD: finalPrice,
        tokenSymbol: finalTokenSymbol,
        tokenDecimals: finalTokenDecimals,
        poolAddress: tokenWethPool.poolAddress,
        feeTier: tokenWethPool.fee,
        liquidity: tokenWethPool.liquidity.toString(),
      };
    }

    console.log(`❌ No liquidity pools found for ${finalTokenSymbol}(${finalTokenDecimals})`);
    
    return {
      priceInUSDT: 0,
      priceInUSD: 0,
      tokenSymbol: finalTokenSymbol,
      tokenDecimals: finalTokenDecimals,
      poolAddress: null,
      feeTier: null,
      error: `No liquidity pools found for ${finalTokenSymbol} on Uniswap V3 Sepolia`,
    };

  } catch (error) {
    console.error(`Error fetching Sepolia price for ${tokenSymbol || tokenAddress}:`, error);
    return {
      priceInUSDT: 0,
      priceInUSD: 0,
      tokenSymbol: tokenSymbol || 'UNKNOWN',
      tokenDecimals: tokenDecimals || 18,
      poolAddress: null,
      feeTier: null,
      error: `Failed to fetch Sepolia price: ${(error as Error).message}`,
    };
  }
}

export async function fetchMultipleTokenPrices(
  tokens: Array<{address: string, symbol?: string, decimals?: number}>
): Promise<TokenPriceResult[]> {
  console.log(`\n🔄 Fetching prices for ${tokens.length} tokens...`);
  
  const promises = tokens.map((token, index) => {
    console.log(`${index + 1}/${tokens.length}: ${token.symbol || token.address}`);
    return fetchTokenPriceInUSDT(token.address, token.symbol, token.decimals);
  });
  
  const results = await Promise.all(promises);
  
  console.log(`\n📊 Results summary:`);
  results.forEach((result, index) => {
    const status = result.error ? '❌' : '✅';
    console.log(`${status} ${result.tokenSymbol}(${result.tokenDecimals}): $${result.priceInUSD}`);
  });
  
  return results;
}

export async function validateToken(tokenAddress: string): Promise<boolean> {
  try {
    const client = await createSepoliaClient();
    const tokenInfo = await getTokenInfo(tokenAddress, client);
    return tokenInfo !== null;
  } catch {
    return false;
  }
}

export async function debugTokenDecimals(tokenAddress: string): Promise<void> {
  try {
    const client = await createSepoliaClient();
    const tokenInfo = await getTokenInfo(tokenAddress, client);
    
    if (tokenInfo) {
      console.log(`\n🔍 Token Debug Info:`);
      console.log(`Address: ${tokenAddress}`);
      console.log(`Symbol: ${tokenInfo.symbol}`);
      console.log(`Name: ${tokenInfo.name}`);
      console.log(`Decimals: ${tokenInfo.decimals}`);
      console.log(`Expected unit: 1 ${tokenInfo.symbol} = 10^${tokenInfo.decimals} smallest units`);
    } else {
      console.log(`❌ Could not fetch token info for ${tokenAddress}`);
    }
  } catch (error) {
    console.error(`Error debugging token:`, error);
  }
}

import { createPublicClient, http, getContract, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

const UNISWAP_V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984' as const;
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7' as const;
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const;
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const;
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F' as const;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

const STABLECOIN_ADDRESSES = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f'  // DAI
] as const;

const FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

// Mainnet RPC URLs (usar Alchemy, Infura ou outro provedor)
const MAINNET_RPC_URLS = [
  'https://eth-mainnet.g.alchemy.com/v2/cwrMi-r8xEwn4gpfJy2I4', // URL demo - substitua pela sua chave
  'https://mainnet.infura.io/v3/demo', // URL demo - substitua pela sua chave
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com'
];

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

// Função para criar cliente com failover
async function createMainnetClient(): Promise<PublicClient> {
  // Primeiro, tenta usar variável de ambiente se existir
  const customRpcUrl = import.meta.env.VITE_MAINNET_RPC_URL;
  
  if (customRpcUrl) {
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http(customRpcUrl),
      });
      // Testa a conexão
      await client.getBlockNumber();
      return client;
    } catch (error) {
      console.warn('Custom RPC URL failed, trying fallback options:', error);
    }
  }

  // Tenta RPC URLs públicos
  for (const rpcUrl of MAINNET_RPC_URLS) {
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });
      // Testa a conexão
      await client.getBlockNumber();
      console.log(`Connected to mainnet via: ${rpcUrl}`);
      return client;
    } catch (error) {
      console.warn(`Failed to connect to ${rpcUrl}:`, error);
      continue;
    }
  }

  throw new Error('Failed to connect to any mainnet RPC endpoint');
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
    const factoryContract = getContract({
      address: UNISWAP_V3_FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      client,
    });

    const token0 = tokenAddress.toLowerCase() < pairAddress.toLowerCase() ? tokenAddress : pairAddress;
    const token1 = tokenAddress.toLowerCase() < pairAddress.toLowerCase() ? pairAddress : tokenAddress;

    const poolAddress = await factoryContract.read.getPool([token0 as `0x${string}`, token1 as `0x${string}`, fee]);
    
    if (poolAddress === ZERO_ADDRESS) {
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

    // Verifica se o pool tem liquidez suficiente
    if (liquidity === 0n) {
      console.log(`Pool ${tokenSymbol}/${pairSymbol} has no liquidity`);
      return null;
    }

    const isToken0 = tokenAddress.toLowerCase() === token0Address.toLowerCase();

    const token = new Token(mainnet.id, tokenAddress, tokenDecimals, tokenSymbol);
    const pairToken = new Token(mainnet.id, pairAddress, pairDecimals, pairSymbol);

    const pool = new Pool(
      isToken0 ? token : pairToken,
      isToken0 ? pairToken : token,
      fee,
      sqrtPriceX96.toString(),
      liquidity.toString(),
      Number(tick)
    );

    const price = parseFloat((isToken0 ? pool.token0Price : pool.token1Price).toSignificant(18));

    console.log(`Pool found: ${tokenSymbol}/${pairSymbol} (${fee/10000}%) - Price: ${price}, Liquidity: ${liquidity.toString()}`);

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

// Função para buscar informações do token automaticamente
async function getTokenInfo(tokenAddress: string, client: PublicClient): Promise<{symbol: string, decimals: number, name: string} | null> {
  try {
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

    return {
      symbol: symbol as string,
      decimals: decimals as number,
      name: name as string,
    };
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
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
    console.log(`Fetching real-time price for token: ${tokenAddress}`);
    
    const client = await createMainnetClient();
    const WBTC_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

    if (tokenAddress.toLowerCase() === WBTC_ADDRESS.toLowerCase()) {
      const wbtcUsdcPool = await getPoolInfo(
        WBTC_ADDRESS,
        USDC_ADDRESS,
        8, // WBTC decimals
        6, // USDC decimals
        'WBTC',
        'USDC',
        3000, // 0.3% fee
        client
      );

      if (wbtcUsdcPool) {
        return {
          priceInUSDT: wbtcUsdcPool.price,
          priceInUSD: wbtcUsdcPool.price,
          tokenSymbol: 'WBTC',
          poolAddress: wbtcUsdcPool.poolAddress,
          feeTier: 3000,
          liquidity: wbtcUsdcPool.liquidity.toString()
        };
      }
    }

    // Se não forneceu symbol ou decimals, busca automaticamente
    let finalTokenSymbol = tokenSymbol;
    let finalTokenDecimals = tokenDecimals;

    if (!tokenSymbol || !tokenDecimals) {
      const tokenInfo = await getTokenInfo(tokenAddress, client);
      if (tokenInfo) {
        finalTokenSymbol = finalTokenSymbol || tokenInfo.symbol;
        finalTokenDecimals = finalTokenDecimals || tokenInfo.decimals;
      } else {
        return {
          priceInUSDT: 0,
          priceInUSD: 0,
          tokenSymbol: tokenSymbol || 'UNKNOWN',
          poolAddress: null,
          feeTier: null,
          error: 'Failed to fetch token information',
        };
      }
    }

    // Casos especiais para stablecoins
    if (STABLECOIN_ADDRESSES.includes(tokenAddress.toLowerCase() as Lowercase<typeof STABLECOIN_ADDRESSES[number]>)) {
      return {
        priceInUSDT: 1,
        priceInUSD: 1,
        tokenSymbol: finalTokenSymbol!,
        poolAddress: null,
        feeTier: null,
      };
    }

    // Lista de tentativas de conversão por prioridade
    const conversionPairs = [
      { address: USDT_ADDRESS, symbol: 'USDT', decimals: 6 },
      { address: USDC_ADDRESS, symbol: 'USDC', decimals: 6 },
      { address: DAI_ADDRESS, symbol: 'DAI', decimals: 18 },
    ];

    // Primeira tentativa: conversão direta para stablecoins
    for (const stablecoin of conversionPairs) {
      const pools: PoolInfo[] = [];
      
      for (const fee of feeTiers) {
        const poolInfo = await getPoolInfo(
          tokenAddress,
          stablecoin.address,
          finalTokenDecimals!,
          stablecoin.decimals,
          finalTokenSymbol!,
          stablecoin.symbol,
          fee,
          client
        );
        if (poolInfo) {
          pools.push(poolInfo);
        }
      }

      if (pools.length > 0) {
        // Escolhe o pool com maior liquidez
        const bestPool = pools.reduce((best, current) => 
          current.liquidity > best.liquidity ? current : best
        );

        console.log(`Direct conversion: ${finalTokenSymbol}/${stablecoin.symbol} = ${bestPool.price}`);
        
        return {
          priceInUSDT: bestPool.price,
          priceInUSD: bestPool.price,
          tokenSymbol: finalTokenSymbol!,
          poolAddress: bestPool.poolAddress,
          feeTier: bestPool.fee,
          liquidity: bestPool.liquidity.toString(),
        };
      }
    }

    // Segunda tentativa: via WETH
    console.log(`No direct stablecoin pair found for ${finalTokenSymbol}, trying via WETH...`);

    let tokenWethPool: PoolInfo | null = null;
    let wethStablecoinPool: PoolInfo | null = null;

    // Busca pool Token/WETH com maior liquidez
    const wethPools: PoolInfo[] = [];
    for (const fee of feeTiers) {
      const poolInfo = await getPoolInfo(
        tokenAddress,
        WETH_ADDRESS,
        finalTokenDecimals!,
        18,
        finalTokenSymbol!,
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
    }

    // Busca pool WETH/Stablecoin com maior liquidez
    for (const stablecoin of conversionPairs) {
      const stablecoinPools: PoolInfo[] = [];
      
      for (const fee of feeTiers) {
        const poolInfo = await getPoolInfo(
          WETH_ADDRESS,
          stablecoin.address,
          18,
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
        }
      }
    }

    if (tokenWethPool && wethStablecoinPool) {
      const finalPrice = tokenWethPool.price * wethStablecoinPool.price;
      
      console.log(`Via WETH conversion: ${finalTokenSymbol}/WETH = ${tokenWethPool.price}, WETH/USD = ${wethStablecoinPool.price}, Final = ${finalPrice}`);
      
      return {
        priceInUSDT: finalPrice,
        priceInUSD: finalPrice,
        tokenSymbol: finalTokenSymbol!,
        poolAddress: tokenWethPool.poolAddress,
        feeTier: tokenWethPool.fee,
        liquidity: tokenWethPool.liquidity.toString(),
      };
    }

    return {
      priceInUSDT: 0,
      priceInUSD: 0,
      tokenSymbol: finalTokenSymbol!,
      poolAddress: null,
      feeTier: null,
      error: `No liquidity pools found for ${finalTokenSymbol} on Uniswap V3 mainnet`,
    };

  } catch (error) {
    console.error(`Error fetching mainnet price for ${tokenSymbol}:`, error);
    return {
      priceInUSDT: 0,
      priceInUSD: 0,
      tokenSymbol: tokenSymbol || 'UNKNOWN',
      poolAddress: null,
      feeTier: null,
      error: `Failed to fetch mainnet price: ${(error as Error).message}`,
    };
  }
}

// Função auxiliar para buscar múltiplos preços de tokens
export async function fetchMultipleTokenPrices(
  tokens: Array<{address: string, symbol?: string, decimals?: number}>
): Promise<TokenPriceResult[]> {
  const promises = tokens.map(token => 
    fetchTokenPriceInUSDT(token.address, token.symbol, token.decimals)
  );
  
  return Promise.all(promises);
}

// Função para validar se um endereço é um token válido
export async function validateToken(tokenAddress: string): Promise<boolean> {
  try {
    const client = await createMainnetClient();
    const tokenInfo = await getTokenInfo(tokenAddress, client);
    return tokenInfo !== null;
  } catch {
    return false;
  }
}
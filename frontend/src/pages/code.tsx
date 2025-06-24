import { ethers } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';

// Replace with actual addresses
const USDT_ADDRESS = '0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD'; // USDT on Base (assumed example)
const YOUR_TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789'; // Link on sepolia
const UNISWAP_V3_FACTORY = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'; // Uniswap V3 Factory on Base
const FEE_TIER = 3000; // 0.3%
const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com'); // Public RPC for eth sepolia

// ABI for Uniswap V3 Factory
const IUniswapV3FactoryABI = [
    'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'
];

async function main() {
    const factory = new ethers.Contract(UNISWAP_V3_FACTORY, IUniswapV3FactoryABI, provider);

    // Sort tokens to match Uniswap token0/token1 ordering
    const [tokenA, tokenB] = [YOUR_TOKEN_ADDRESS.toLowerCase(), USDT_ADDRESS.toLowerCase()].sort();
    const poolAddress = await factory.getPool(tokenA, tokenB, FEE_TIER);
    if (poolAddress === ethers.ZeroAddress) {
        throw new Error('Pool not found');
    }

    const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
    const [sqrtPriceX96] = await poolContract.slot0();

    // Square sqrtPriceX96 and scale to get price
    const priceX96 = sqrtPriceX96 ** 2n;
    const Q192 = 2n ** 192n;

    const price = Number((priceX96 * 10n ** 18n) / Q192) / 1e18;

    // Determine price direction
    const isToken0 = YOUR_TOKEN_ADDRESS.toLowerCase() === tokenA;
    if (isToken0) {
        console.log(`Price of 1 ${YOUR_TOKEN_ADDRESS} in USDT: ${price}`);
    } else {
        console.log(`Price of 1 ${YOUR_TOKEN_ADDRESS} in USDT: ${1 / price}`);
    }
}

main().catch(console.error);

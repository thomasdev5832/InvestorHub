import { ConnectedWallet } from '@privy-io/react-auth'
import Quoter from '../assets/abi/ABI_Quoter.json'
import { ethers } from 'ethers'
import { Token } from '../interfaces/token'
import { fromReadableAmount, toReadableAmount } from './convertions'
import { NETWORKS_CONFIGS } from './constants'

const AMOUNT_1 = 1;

export async function getUSDPriceQuote(wallet: ConnectedWallet, tokenIn: Token, fee: number): Promise<any> {
  const ethersProvider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
  console.log('wallet.chainId', wallet.chainId);
  const quoterContract = new ethers.Contract(
    NETWORKS_CONFIGS[wallet.chainId].quoterContract,
    Quoter.abi,
    ethersProvider
  )

  const usdToken = NETWORKS_CONFIGS[wallet.chainId].usdToken;
  const amountIn = fromReadableAmount(
    AMOUNT_1,
    tokenIn.decimals ?? 18
  ).toString();

  console.log('getUSDPriceQuote: quoterContract', quoterContract);
  console.log('getUSDPriceQuote: tokenIn', tokenIn);
  console.log('getUSDPriceQuote: USD Token', NETWORKS_CONFIGS[wallet.chainId].usdToken);
  console.log('getUSDPriceQuote: fee', fee);
  console.log('getUSDPriceQuote: amountIn', fromReadableAmount(
    AMOUNT_1,
    tokenIn.decimals ?? 18
  ).toString());

  const path = ethers.solidityPacked(
    ['address', 'uint24', 'address'],
    [tokenIn.address, BigInt(fee), usdToken.address]
  )

  const quotedAmountOut = await quoterContract.quoteExactInput.staticCall(
    path,
    amountIn
  )

  console.log('getUSDPriceQuote: quotedAmountOut', quotedAmountOut);
  return toReadableAmount(quotedAmountOut[0], usdToken.decimals ?? 18);
}

export async function getTokenPriceQuote(wallet: ConnectedWallet, tokenIn: Token, tokenOut: Token, fee: number, amountIn: number): Promise<any> {
  const ethersProvider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
  console.log('wallet.chainId', wallet.chainId);
  const quoterContract = new ethers.Contract(
    NETWORKS_CONFIGS[wallet.chainId].quoterContract,
    Quoter.abi,
    ethersProvider
  )

  const amountInFormatted = fromReadableAmount(
    amountIn,
    tokenIn.decimals ?? 18
  ).toString();

  console.log('getTokenPriceQuote: quoterContract', quoterContract);
  console.log('getTokenPriceQuote: tokenIn', tokenIn);
  console.log('getTokenPriceQuote: tokenOut', tokenOut);
  console.log('getTokenPriceQuote: fee', fee);
  console.log('getTokenPriceQuote: amountIn', amountInFormatted);

  const path = ethers.solidityPacked(
    ['address', 'uint24', 'address'],
    [tokenIn.address, BigInt(fee), tokenOut.address]
  )

  const quotedAmountOut = await quoterContract.quoteExactInput.staticCall(
    path,
    amountInFormatted
  )

  console.log('getTokenPriceQuote:quotedAmountOut', quotedAmountOut);

  // Handle the Proxy result - the first element is the amount
  const amountOut = quotedAmountOut[0];
  console.log('getTokenPriceQuote:amountOut', amountOut);

  return {amountOut: toReadableAmount(amountOut, tokenOut.decimals ?? 18), path: path};
}
import { EIP1193Provider } from '@privy-io/react-auth'
import Quoter from '../assets/abi/ABI_Quoter.json'
import { ethers } from 'ethers'
import { Token } from '../interfaces/token'
import { fromReadableAmount } from './convertions'
import { QUOTER_CONTRACT_ADDRESS } from './constants'


export async function quote(provider: EIP1193Provider, token0: Token, token1: Token, fee: number, amountIn: number): Promise<any> {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const quoterContract = new ethers.Contract(
      QUOTER_CONTRACT_ADDRESS,
      Quoter.abi,
      ethersProvider
    )

    console.log('provider', provider);
    console.log('quoterContract', quoterContract);
    console.log('token0', token0);
    console.log('token1', token1);
    console.log('fee', fee);
    console.log('amountIn', fromReadableAmount(
        amountIn,
        token0.decimals ?? 18
      ).toString());


    const path = ethers.solidityPacked(
        ['address', 'uint24', 'address'],
        [token0.address, BigInt(fee), token1.address]
    )

    const quotedAmountOut = await quoterContract.quoteExactInput.staticCall(
      path,
      fromReadableAmount(
        amountIn,
        token0.decimals ?? 18
      ).toString(),
    )
  
    return quotedAmountOut;
  }
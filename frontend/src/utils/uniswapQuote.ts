import { ConnectedWallet } from '@privy-io/react-auth'
import Quoter from '../assets/abi/ABI_Quoter.json'
import { ethers } from 'ethers'
import { Token } from '../interfaces/token'
import { fromReadableAmount } from './convertions'
import { NETWORKS_CONFIGS } from './constants'

const AMOUNT_1 = 1;

export async function getUSDPriceQuote(wallet: ConnectedWallet, token0: Token, fee: number): Promise<any> {
    const ethersProvider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
    console.log('wallet.chainId', wallet.chainId);
    const quoterContract = new ethers.Contract(
      NETWORKS_CONFIGS[wallet.chainId].quoterContract,
      Quoter.abi,
      ethersProvider
    )

    console.log('quoterContract', quoterContract);
    console.log('token0', token0);
    console.log('USD Token', NETWORKS_CONFIGS[wallet.chainId].usdToken);
    console.log('fee', fee);
    console.log('amountIn', fromReadableAmount(
      AMOUNT_1,
        token0.decimals ?? 18
      ).toString());

    const usdToken = NETWORKS_CONFIGS[wallet.chainId].usdToken;
    
    // Compare addresses and put the lesser one first (Uniswap V3 requirement)
    const isToken0First = token0.address.toLowerCase() < usdToken.address.toLowerCase();
    const firstToken = isToken0First ? token0 : usdToken;
    const secondToken = isToken0First ? usdToken : token0;

    const path = ethers.solidityPacked(
        ['address', 'uint24', 'address'],
        [firstToken.address, BigInt(fee), secondToken.address]
    )

    const quotedAmountOut = await quoterContract.quoteExactInput.staticCall(
      path,
      fromReadableAmount(
        AMOUNT_1,
        firstToken.decimals ?? 18
      ).toString(),
    )
  
    return quotedAmountOut;
  }
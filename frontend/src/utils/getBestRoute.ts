
import {
    AlphaRouter,
    SwapType,
} from '@uniswap/smart-order-router'
import { CurrencyAmount, Token, TradeType, Percent } from '@uniswap/sdk-core'
import { ethers } from 'ethers'
import { ConnectedWallet } from '@privy-io/react-auth'

export const getBestRoute = async (
    wallet: ConnectedWallet,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string
) => {
    const amount = CurrencyAmount.fromRawAmount(tokenIn, amountIn);

    const router = new AlphaRouter({
        chainId: parseInt(wallet.chainId.replace('eip155:', '')),
        provider: new ethers.BrowserProvider(await wallet.getEthereumProvider()) as any,
    });
    
    const route = await router.route(
        amount,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
            type: SwapType.SWAP_ROUTER_02, //@question Only Supports V2 and Universal Router?
            recipient: wallet.address as string,
            slippageTolerance: new Percent(100, 10_000) as Percent, //Hardcode Slippage. Update later @TODO
            deadline:  (Math.floor(Date.now() / 1000) + 900) as number,
        }
    );

    console.log('Best route:', route?.route)
    console.log('Expected output:', route?.quote.toFixed())
    console.log('Gas cost (estimate):', route?.estimatedGasUsed.toString())

    return route;
}
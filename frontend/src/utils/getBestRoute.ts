// import {
//     AlphaRouter,
// } from '@uniswap/smart-order-router'
// import { CurrencyAmount, Token as UniswapToken, TradeType } from '@uniswap/sdk-core'
// import { ethers } from 'ethers'
// import { ConnectedWallet } from '@privy-io/react-auth'
// import { Token } from '../interfaces/token'
// import { NETWORKS_CONFIGS } from './constants'



// export const getBestRoute = async (wallet: ConnectedWallet, tokenIn: Token, amountIn: string, tokenOut?: Token) => {
//     const ethersProvider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
//     console.log('wallet.chainId', wallet.chainId);
//     const router = new AlphaRouter({
//         chainId: parseInt(wallet.chainId.replace('eip155:', '')),
//         provider: ethersProvider as any,
//     });

//     const tokenInCurrency = new UniswapToken(
//         parseInt(wallet.chainId.replace('eip155:', '')),
//         tokenIn.address,
//         tokenIn.decimals ?? 18
//     );



//     const tokenOutCurrency = tokenOut ? new UniswapToken(
//         parseInt(wallet.chainId.replace('eip155:', '')),
//         tokenOut.address,
//         tokenOut.decimals ?? 18
//     ) : new UniswapToken(
//         parseInt(wallet.chainId.replace('eip155:', '')),
//         NETWORKS_CONFIGS[wallet.chainId].usdToken.address,
//         NETWORKS_CONFIGS[wallet.chainId].usdToken.decimals ?? 18
//     );
    
//     const route = await router.route(
//         CurrencyAmount.fromRawAmount(tokenInCurrency, amountIn),
//         tokenOutCurrency,
//         TradeType.EXACT_INPUT
//     );

//     console.log('Best route:', route?.route)
//     console.log('Expected output:', route?.quote.toFixed())
//     console.log('Gas cost (estimate):', route?.estimatedGasUsed.toString())

//     return route;
// }
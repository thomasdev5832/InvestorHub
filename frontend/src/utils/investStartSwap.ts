import { createWalletClient, custom, createPublicClient, http } from 'viem';
import ABI_StartSwap from '../assets/abi/ABI_StartSwap.json';
import { StartSwapParams } from '../interfaces/startswapparams';
import { ConnectedWallet } from '@privy-io/react-auth';
import { getChain } from './getchain';
import { DIAMOND_CONTRACT_ADDRESS } from './constants';

export const startSwap = async (
  wallet: ConnectedWallet,
  params: StartSwapParams
): Promise<any> => {
  try {
    const provider = await wallet.getEthereumProvider();
    const walletClient = createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: getChain(wallet.chainId),
      transport: custom(provider)
    });

    const tx = await walletClient.writeContract({
      address: DIAMOND_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI_StartSwap,
      functionName: 'startSwap',
      args: [
        params.totalAmountIn,
        params.payload,
        params.stakePayload
      ]
    });
    
    return tx;
  } catch (error) {
    console.error('Error calling startSwap:', error);
    throw error;
  }
};

export const startSwapAndWait = async (
  wallet: ConnectedWallet,
  params: StartSwapParams
): Promise<any> => {
  try {
    const provider = await wallet.getEthereumProvider();
    const walletClient = createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: getChain(wallet.chainId),
      transport: custom(provider)
    });
    
    const publicClient = createPublicClient({
      chain: getChain(wallet.chainId),
      transport: http()
    });

    console.log('Starting swap for:', params.totalAmountIn, 'payload:', params.payload, 'stakePayload:', params.stakePayload);
    console.log('Diamond contract address:', DIAMOND_CONTRACT_ADDRESS);

    const tx = await walletClient.writeContract({
      address: DIAMOND_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI_StartSwap,
      functionName: 'startSwap',
      args: [
        params.totalAmountIn,
        params.payload,
        params.stakePayload
      ]
    });
    
    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt;
  } catch (error) {
    console.error('Error in startSwapAndWait:', error);
    throw error;
  }
};

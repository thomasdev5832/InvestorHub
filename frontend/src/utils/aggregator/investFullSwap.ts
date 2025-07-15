import { createWalletClient, custom, createPublicClient, http } from 'viem';
import ABI_FullSwap from '../../assets/abi/ABI_FullSwap.json';
import { ConnectedWallet } from '@privy-io/react-auth';
import { getChain } from '../getchain';
import { DIAMOND_CONTRACT_ADDRESS } from '../constants';

// Interface for the full swap parameters
export interface FullSwapParams {
  inputToken: string;
  totalAmountIn: string;
  payload: Array<{
    path: string;
    amountInForInputToken: string;
    deadline: string;
  }>;
  stakePayload: {
    token0: string;
    token1: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    amount0Desired: string;
    amount1Desired: string;
    amount0Min: string;
    amount1Min: string;
    recipient: string;
    deadline: string;
  };
}

export const startFullSwap = async (
  wallet: ConnectedWallet,
  params: FullSwapParams
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
      abi: ABI_FullSwap,
      functionName: 'startSwap',
      args: [
        params.inputToken,
        params.totalAmountIn,
        params.payload,
        params.stakePayload
      ]
    });
    
    return tx;
  } catch (error) {
    console.error('Error calling startFullSwap:', error);
    throw error;
  }
};

export const startFullSwapAndWait = async (
  wallet: ConnectedWallet,
  params: FullSwapParams
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

    console.log('Starting full swap for:', params.totalAmountIn, 'payload:', params.payload, 'stakePayload:', params.stakePayload);
    console.log('Diamond contract address:', DIAMOND_CONTRACT_ADDRESS);

    const tx = await walletClient.writeContract({
      address: DIAMOND_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI_FullSwap,
      functionName: 'startSwap',
      args: [
        params.inputToken,
        params.totalAmountIn,
        params.payload,
        params.stakePayload
      ]
    });
    
    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt;
  } catch (error) {
    console.error('Error in startFullSwapAndWait:', error);
    throw error;
  }
};

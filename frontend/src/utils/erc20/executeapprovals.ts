import { createWalletClient, custom, createPublicClient } from 'viem';
import ERC20_ABI from '../../assets/abi/ERC-20.json';
import { ConnectedWallet } from '@privy-io/react-auth';
import { getChain } from '../getchain';
import { DIAMOND_CONTRACT_ADDRESS } from '../constants';

export interface ApprovalParams {
  tokenAddress: string;
  amount: string;
}

export const checkAllowance = async (
  tokenAddress: string,
  ownerAddress: string,
  wallet: ConnectedWallet
): Promise<bigint> => {
  try {
    const provider = await wallet.getEthereumProvider();
    const publicClient = createPublicClient({
      chain: getChain(wallet.chainId),
      transport: custom(provider)
    });

    console.log('Checking allowance for:', tokenAddress, 'owner:', ownerAddress, 'diamond:', DIAMOND_CONTRACT_ADDRESS);

    const allowance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [ownerAddress as `0x${string}`, DIAMOND_CONTRACT_ADDRESS as `0x${string}`]
    });

    return allowance as bigint;
  } catch (error) {
    console.error('Error checking allowance:', error);
    throw error;
  }
};

export const executeApproval = async (
  params: ApprovalParams,
  wallet: ConnectedWallet
): Promise<any> => {
  try {
    const provider = await wallet.getEthereumProvider();
    const walletClient = createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: getChain(wallet.chainId),
      transport: custom(provider)
    });

    console.log('Executing approval for:', params.tokenAddress, 'amount:', params.amount, 'diamond:', DIAMOND_CONTRACT_ADDRESS);

    const tx = await walletClient.writeContract({
      address: params.tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [DIAMOND_CONTRACT_ADDRESS as `0x${string}`, BigInt(params.amount)]
    });

    return tx;
  } catch (error) {
    console.error('Error executing approval:', error);
    throw error;
  }
};

export const executeApprovalAndWait = async (
  params: ApprovalParams,
  wallet: ConnectedWallet
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
      transport: custom(provider)
    });

    const tx = await walletClient.writeContract({
      address: params.tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [DIAMOND_CONTRACT_ADDRESS as `0x${string}`, BigInt(params.amount)]
    });

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt;
  } catch (error) {
    console.error('Error in executeApprovalAndWait:', error);
    throw error;
  }
};

export const checkAndExecuteApproval = async (
  tokenAddress: string,
  requiredAmount: string,
  wallet: ConnectedWallet
): Promise<{ needsApproval: boolean; txHash?: string; receipt?: any }> => {
  try {
    // Check current allowance
    const currentAllowance = await checkAllowance(
      tokenAddress,
      wallet.address,
      wallet
    );

    const requiredAmountBigInt = BigInt(requiredAmount);

    // If allowance is sufficient, no approval needed
    if (currentAllowance >= requiredAmountBigInt) {
      return { needsApproval: false };
    }

    // Execute approval
    const txHash = await executeApproval({
      tokenAddress,
      amount: requiredAmount
    }, wallet);

    return { needsApproval: true, txHash };
  } catch (error) {
    console.error('Error in checkAndExecuteApproval:', error);
    throw error;
  }
};

export const checkAndExecuteApprovalAndWait = async (
  tokenAddress: string,
  requiredAmount: string,
  wallet: ConnectedWallet
): Promise<{ needsApproval: boolean; txHash?: string; receipt?: any }> => {
  try {
    // Check current allowance
    const currentAllowance = await checkAllowance(
      tokenAddress,
      wallet.address,
      wallet
    );

    const requiredAmountBigInt = BigInt(requiredAmount);

    // If allowance is sufficient, no approval needed
    if (currentAllowance >= requiredAmountBigInt) {
      return { needsApproval: false };
    }

    // Execute approval and wait for confirmation
    const receipt = await executeApprovalAndWait({
      tokenAddress,
      amount: requiredAmount
    }, wallet);

    return { needsApproval: true, txHash: receipt.transactionHash, receipt };
  } catch (error) {
    console.error('Error in checkAndExecuteApprovalAndWait:', error);
    throw error;
  }
};

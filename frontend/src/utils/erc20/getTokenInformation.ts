import { ConnectedWallet } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { PartialToken } from '../../interfaces/token'
import ERC20_ABI from '../../assets/abi/ERC-20.json'

export async function getTokenDetails(wallet: ConnectedWallet, tokenAddress: string): Promise<PartialToken> {
  const ethersProvider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
  
  // Create contract instance
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20_ABI,
    ethersProvider
  );

  try {
    // Fetch token details in parallel
    const [symbol, decimals] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    
    // Create Token object
    const token: PartialToken = {
      symbol: symbol,
      address: tokenAddress,
      decimals: decimals
    };

    return token;
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw new Error(`Failed to fetch token details for address ${tokenAddress}: ${error}`);
  }
}

export async function getTokenBalance(wallet: ConnectedWallet, tokenAddress: string): Promise<string> {
  const ethersProvider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
  
  // Get the user's address
  const accounts = await ethersProvider.listAccounts();
  const userAddress = accounts[0];
  
  if (!userAddress) {
    throw new Error('No connected account found');
  }

  // Create contract instance
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20_ABI,
    ethersProvider
  );

  try {
    // Get token balance
    const balance = await tokenContract.balanceOf(userAddress);
    
    // Get token decimals for proper formatting
    const decimals = await tokenContract.decimals();
    
    // Convert balance to readable format (string with proper decimal places)
    const readableBalance = ethers.formatUnits(balance, decimals);
    
    return readableBalance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw new Error(`Failed to fetch token balance for address ${tokenAddress}: ${error}`);
  }
}

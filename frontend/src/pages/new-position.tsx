import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/button';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

interface Network {
    id: string;
    name: string;
    graphqlUrl: string;
}

interface Token {
    id: string;
    symbol: string;
    name: string;
    address: string;
    network: Network;
}

interface PoolDayData {
    date: number;
    feesUSD: string;
    volumeUSD: string;
    tvlUSD: string;
    apr24h: string;
}

interface Pool {
    feeTier: string;
    token0: Token;
    token1: Token;
    createdAtTimestamp: string;
    poolDayData: PoolDayData[];
}

// Example contract ABI
const contractABI = [
    {
        name: 'invest',
        type: 'function',
        inputs: [
            { name: 'amount0', type: 'uint256' },
            { name: 'amount1', type: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        name: 'approve',
        type: 'function',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
] as const;

const contractAddress = '0xContractAddress';
const token0Address = '0xYourToken0Address';
const token1Address = '0xYourToken1Address';
//const chainId = 1; // e.g., 1 for Ethereum mainnet, adjust as needed

const NewPosition: React.FC = () => {
    const { index } = useParams<{ index: string }>();
    const [pool, setPool] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [amount0, setAmount0] = useState<string>('');
    const [amount1, setAmount1] = useState<string>('');
    const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'investing' | 'success' | 'error'>('idle');

    const { wallets } = useWallets();
    const wallet = wallets.length > 0 ? wallets[0] : null;

    const marketPrice = 0.0004; // fake

    useEffect(() => {
        const fetchPool = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/pools`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch pool data: ${response.statusText}`);
                }
                const data = await response.json();
                const selectedPool = data.pools[Number(index)];
                if (!selectedPool) {
                    throw new Error('Pool not found');
                }
                setPool(selectedPool);
            } catch (err) {
                console.error('Failed to fetch pool:', err);
                setError('Failed to load pool data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchPool();
    }, [index]);

    const handleAmount0Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount0(value);
        if (value && !isNaN(Number(value))) {
            const convertedAmount1 = (Number(value) / marketPrice).toFixed(6);
            setAmount1(convertedAmount1);
        } else {
            setAmount1('');
        }
    };

    const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount1(value);
        if (value && !isNaN(Number(value))) {
            const convertedAmount0 = (Number(value) * marketPrice).toFixed(6);
            setAmount0(convertedAmount0);
        } else {
            setAmount0('');
        }
    };

    const handleInvest = async () => {
        if (!wallet) {
            setError('Please connect your wallet first.');
            return;
        }
        if (!amount0 || !amount1) {
            setError('Please enter investment amounts.');
            return;
        }

        setTxStatus('approving');
        setError(null);

        try {
            const provider = await wallet.getEthereumProvider(); // EIP-1193 provider
            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();

            // Approve token0
            const token0Contract = new ethers.Contract(token0Address, contractABI, signer);
            const tx0 = await token0Contract.approve(contractAddress, ethers.parseEther(amount0));
            await tx0.wait();
            setTxStatus('approving'); // Update to reflect ongoing approval for token1

            // Approve token1
            const token1Contract = new ethers.Contract(token1Address, contractABI, signer);
            const tx1 = await token1Contract.approve(contractAddress, ethers.parseEther(amount1));
            await tx1.wait();

            // Execute invest
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            setTxStatus('investing');
            const tx = await contract.invest(ethers.parseEther(amount0), ethers.parseEther(amount1));
            await tx.wait();

            setTxStatus('success');
            setAmount0('');
            setAmount1('');
        } catch (err) {
            setTxStatus('error');
            setError('Transaction failed. Please try again. ' + (err as Error).message);
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600"></div>
                    <span className="text-lg font-medium text-gray-700">Loading pool...</span>
                </div>
            </div>
        );
    }

    if (error || !pool) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
                    <p className="text-gray-600">{error || 'Pool not found'}</p>
                    <Link to="/dashboard/pools" className="text-sky-600 hover:underline">
                        Back to Pools
                    </Link>
                </div>
            </div>
        );
    }

    const feeTierPercentage = (Number(pool.feeTier) / 10000).toFixed(2) + '%';

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-12 bg-gray-50">
            <Link to="/dashboard/pools" className="flex items-center text-sky-600 hover:underline mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Pools
            </Link>
            <div className="bg-white rounded-xl shadow-sm border-t-2 border-sky-50 p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Start Investing</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pool Details */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pool Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Token Pair</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {pool.token0.symbol}/{pool.token1.symbol}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fee Tier</p>
                                <p className="text-lg font-medium text-gray-900">{feeTierPercentage}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Network</p>
                                <p className="text-lg font-medium text-gray-900">{pool.token0.network.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Investment Amounts */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Amounts</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{pool.token0.symbol} Amount</label>
                                <input
                                    type="number"
                                    value={amount0}
                                    onChange={handleAmount0Change}
                                    placeholder="0.0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{pool.token1.symbol} Amount</label>
                                <input
                                    type="number"
                                    value={amount1}
                                    onChange={handleAmount1Change}
                                    placeholder="0.0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Range</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Price range is set to <strong>Full range</strong>, ensuring continuous market participation across all
                            prices. <em>Custom range will be implemented in a future update.</em>
                        </p>
                        <div className="flex justify-between text-sm text-gray-600 mb-6">
                            <span>Min price: 0 {pool.token0.symbol} = 1 {pool.token1.symbol}</span>
                            <span>Max price: ∞ {pool.token0.symbol} = 1 {pool.token1.symbol}</span>
                        </div>
                    </div>
                </div>

                {/* Invest Now Button and Status */}
                <div className="mt-6">
                    {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                    {txStatus === 'success' && <p className="text-green-600 text-sm mb-2">Investment successful!</p>}
                    <Button
                        className="w-full text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-700 hover:to-sky-800 px-4 py-2 rounded-md shadow-sm"
                        onClick={handleInvest}
                        disabled={!wallet || txStatus === 'approving' || txStatus === 'investing'}
                    >
                        {txStatus === 'approving'
                            ? 'Approving...'
                            : txStatus === 'investing'
                                ? 'Investing...'
                                : wallet
                                    ? 'Invest Now'
                                    : 'Please Connect Wallet'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NewPosition;
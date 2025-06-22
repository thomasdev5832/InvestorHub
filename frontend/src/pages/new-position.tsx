import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';

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
    decimals?: number;
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

interface TokenPrices {
    token0PriceUSD: number;
    token1PriceUSD: number;
    token0PriceInToken1: number;
    token1PriceInToken0: number;
}

// Minimal ERC-20 ABI for balanceOf, symbol, and decimals
const ERC20_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Example ERC-20 tokens on Sepolia (you can add more relevant tokens)
const SEPOLIA_ERC20_TOKENS = [
    {
        address: '0x7b79995e5f793a07cc00dc120ec50ee8d1037fca', // WETH on Sepolia
        symbol: 'WETH',
    },
    {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
        symbol: 'USDC',
    },
    {
        address: '0x779877a78698a0f2ab8f4cb6f06bdbee94f28ae8', // DAI on Sepolia 
        symbol: 'DAI',
    },
    {
        address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', // LINK on Sepolia 
        symbol: 'LINK',
    },

];


const NewPosition: React.FC = () => {
    const { index } = useParams<{ index: string }>();
    const [pool, setPool] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [amount0, setAmount0] = useState<string>('');
    const [amount1, setAmount1] = useState<string>('');
    const [tokenPrices, setTokenPrices] = useState<TokenPrices | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);

    // Privy hooks for wallet connection
    const { authenticated, user } = usePrivy();
    const { wallets: privyWallets } = useWallets();

    // States for wallet balances
    const [walletNativeBalance, setWalletNativeBalance] = useState<string | null>(null);
    const [walletErc20Balances, setWalletErc20Balances] = useState<
        { symbol: string; balance: string; address: string }[]
    >([]);
    const [loadingWalletBalances, setLoadingWalletBalances] = useState(false);
    const [walletBalanceError, setWalletBalanceError] = useState<string | null>(null);


    // Helper function to validate conversions
    const validateConversion = (token0Symbol: string, token1Symbol: string, token0PriceInToken1: number, token1PriceInToken0: number) => {
        const crossCheck = token0PriceInToken1 * token1PriceInToken0;
        const tolerance = 0.01; // 1% tolerance

        if (Math.abs(crossCheck - 1) > tolerance) {
            console.warn(`Possible conversion error between ${token0Symbol}/${token1Symbol}:`, {
                token0PriceInToken1,
                token1PriceInToken0,
                crossCheck,
                shouldBe: 1,
                deviation: Math.abs(crossCheck - 1)
            });
            return false;
        }

        return true;
    };

    useEffect(() => {
        const fetchPoolData = async () => {
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
                setAmount0('');
                setAmount1('');
                setTokenPrices(null);
            } catch (err) {
                console.error('Error fetching pool data:', err);
                setError('Failed to load pool data. Please try again later. ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchPoolData();
    }, [index]);

    useEffect(() => {
        const fetchTokenPrices = async () => {
            if (!pool) return;

            setPriceLoading(true);
            setError(null);

            const token0Address = pool.token0.address.toLowerCase();
            const token1Address = pool.token1.address.toLowerCase();
            const feeTier = pool.feeTier;
            const uniswapSubgraphUrl = pool.token0.network.graphqlUrl;
            const THEGRAPH_API_KEY = import.meta.env.VITE_THEGRAPH_API_KEY;

            if (!uniswapSubgraphUrl) {
                setError('Uniswap V3 Subgraph URL not configured for this network.');
                setPriceLoading(false);
                return;
            }

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (THEGRAPH_API_KEY) {
                headers['Authorization'] = `Bearer ${THEGRAPH_API_KEY}`;
            }

            try {
                // Query to fetch individual tokens
                const tokenQuery = `
                    query GetTokens($token0: Bytes!, $token1: Bytes!) {
                        token0: token(id: $token0) {
                            id
                            symbol
                            name
                            decimals
                            derivedETH
                        }
                        token1: token(id: $token1) {
                            id
                            symbol
                            name
                            decimals
                            derivedETH
                        }
                        bundle(id: "1") {
                            ethPriceUSD
                        }
                    }
                `;

                // Query to fetch specific pool data
                const poolQuery = `
                    query GetPool($token0: Bytes!, $token1: Bytes!, $feeTier: String!) {
                        pools(
                            where: {
                                feeTier: $feeTier
                            },
                            orderBy: totalValueLockedUSD,
                            orderDirection: desc,
                            first: 20
                        ) {
                            id
                            token0 {
                                id
                                symbol
                            }
                            token1 {
                                id
                                symbol
                            }
                            token0Price
                            token1Price
                            totalValueLockedUSD
                        }
                    }
                `;

                const tokenVariables = {
                    token0: token0Address,
                    token1: token1Address
                };

                const poolVariables = {
                    token0: token0Address,
                    token1: token1Address,
                    feeTier: feeTier
                };

                // Fetch token data
                const tokenResponse = await fetch(uniswapSubgraphUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ query: tokenQuery, variables: tokenVariables }),
                });

                if (!tokenResponse.ok) {
                    throw new Error(`Failed to fetch token data: ${tokenResponse.statusText}`);
                }

                const tokenResult = await tokenResponse.json();

                if (tokenResult.errors) {
                    throw new Error('Token query errors: ' + tokenResult.errors.map((e: any) => e.message).join(', '));
                }

                // Fetch pool data
                const poolResponse = await fetch(uniswapSubgraphUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ query: poolQuery, variables: poolVariables }),
                });

                if (!poolResponse.ok) {
                    throw new Error(`Failed to fetch pool data: ${poolResponse.statusText}`);
                }

                const poolResult = await poolResponse.json();

                if (poolResult.errors) {
                    throw new Error('Pool query errors: ' + poolResult.errors.map((e: any) => e.message).join(', '));
                }

                // Process token data
                const ethPriceUSD = parseFloat(tokenResult.data.bundle?.ethPriceUSD || '0');
                const token0Data = tokenResult.data.token0;
                const token1Data = tokenResult.data.token1;

                if (!token0Data || !token1Data) {
                    throw new Error('One or both tokens not found in subgraph.');
                }

                // Calculate USD prices based on derivedETH
                const token0PriceUSD = parseFloat(token0Data.derivedETH) * ethPriceUSD;
                const token1PriceUSD = parseFloat(token1Data.derivedETH) * ethPriceUSD;

                // Find matching pool
                const matchingPool = poolResult.data.pools?.find((poolData: any) => {
                    const poolToken0 = poolData.token0.id.toLowerCase();
                    const poolToken1 = poolData.token1.id.toLowerCase();

                    return (
                        (poolToken0 === token0Address && poolToken1 === token1Address) ||
                        (poolToken0 === token1Address && poolToken1 === token0Address)
                    );
                });

                let token0PriceInToken1: number;
                let token1PriceInToken0: number;

                if (matchingPool) {
                    // Check token order in pool
                    const poolToken0Lower = matchingPool.token0.id.toLowerCase();
                    const poolToken1Lower = matchingPool.token1.id.toLowerCase();

                    if (poolToken0Lower === token0Address && poolToken1Lower === token1Address) {
                        // Same order: pool token0 = our token0
                        token0PriceInToken1 = parseFloat(matchingPool.token0Price);
                        token1PriceInToken0 = parseFloat(matchingPool.token1Price);
                    } else if (poolToken0Lower === token1Address && poolToken1Lower === token0Address) {
                        // Inverted order: pool token0 = our token1
                        token0PriceInToken1 = parseFloat(matchingPool.token1Price);
                        token1PriceInToken0 = parseFloat(matchingPool.token0Price);
                    } else {
                        // Fallback to USD prices
                        console.warn('Pool tokens do not match exactly, using USD prices');
                        token0PriceInToken1 = token0PriceUSD / token1PriceUSD;
                        token1PriceInToken0 = token1PriceUSD / token0PriceUSD;
                    }
                } else {
                    // Fallback: use USD prices to calculate conversion
                    console.warn('Specific pool not found, using USD prices for conversion');
                    if (token0PriceUSD > 0 && token1PriceUSD > 0) {
                        token0PriceInToken1 = token0PriceUSD / token1PriceUSD;
                        token1PriceInToken0 = token1PriceUSD / token0PriceUSD;
                    } else {
                        throw new Error('Unable to calculate conversion between tokens.');
                    }
                }

                // Validate calculations
                const isValidConversion = validateConversion(
                    pool.token0.symbol,
                    pool.token1.symbol,
                    token0PriceInToken1,
                    token1PriceInToken0
                );

                console.log('Processed data:', {
                    token0: {
                        symbol: token0Data.symbol,
                        priceUSD: token0PriceUSD.toFixed(4),
                        address: token0Address
                    },
                    token1: {
                        symbol: token1Data.symbol,
                        priceUSD: token1PriceUSD.toFixed(4),
                        address: token1Address
                    },
                    conversion: {
                        [`1 ${pool.token0.symbol} =`]: `${token0PriceInToken1.toFixed(8)} ${pool.token1.symbol}`,
                        [`1 ${pool.token1.symbol} =`]: `${token1PriceInToken0.toFixed(8)} ${pool.token0.symbol}`
                    },
                    validation: {
                        crossCheck: (token0PriceInToken1 * token1PriceInToken0).toFixed(6),
                        isValid: isValidConversion
                    }
                });

                setTokenPrices({
                    token0PriceUSD,
                    token1PriceUSD,
                    token0PriceInToken1,
                    token1PriceInToken0
                });

            } catch (err) {
                console.error('Error fetching token prices:', err);
                setError('Failed to load real-time prices from Uniswap V3. ' + (err as Error).message);
                setTokenPrices(null);
            } finally {
                setPriceLoading(false);
            }
        };

        if (pool) {
            fetchTokenPrices();
        }
    }, [pool]);

    // Effect to fetch wallet balances
    useEffect(() => {
        const fetchWalletBalances = async () => {
            if (!authenticated || privyWallets.length === 0) {
                setWalletNativeBalance(null);
                setWalletErc20Balances([]);
                setLoadingWalletBalances(false);
                return;
            }

            setLoadingWalletBalances(true);
            setWalletBalanceError(null);

            const connectedWallet = privyWallets[0]; // Assuming the first wallet is the primary one
            if (!connectedWallet || !connectedWallet.address) {
                setLoadingWalletBalances(false);
                return;
            }

            try {
                const publicClient = createPublicClient({
                    chain: sepolia, // Use the sepolia chain
                    transport: http(),
                });

                // Fetch native balance (ETH)
                const nativeBalanceBigInt = await publicClient.getBalance({
                    address: connectedWallet.address as `0x${string}`,
                });
                setWalletNativeBalance(formatEther(nativeBalanceBigInt));

                // Fetch ERC-20 token balances
                const erc20BalancesPromises = SEPOLIA_ERC20_TOKENS.map(async (token) => {
                    try {
                        const balance = await publicClient.readContract({
                            address: token.address as `0x${string}`,
                            abi: ERC20_ABI,
                            functionName: 'balanceOf',
                            args: [connectedWallet.address as `0x${string}`],
                        });

                        const decimals = await publicClient.readContract({
                            address: token.address as `0x${string}`,
                            abi: ERC20_ABI,
                            functionName: 'decimals',
                        });

                        return {
                            symbol: token.symbol,
                            balance: formatUnits(balance as bigint, decimals as number),
                            address: token.address,
                        };
                    } catch (erc20Error) {
                        console.warn(`Failed to fetch balance for ${token.symbol}:`, erc20Error);
                        return null; // Return null for failed fetches
                    }
                });

                const resolvedErc20Balances = (await Promise.all(erc20BalancesPromises)).filter(
                    (b) => b !== null && parseFloat(b.balance) > 0 // Filter out nulls and zero balances
                );
                setWalletErc20Balances(resolvedErc20Balances as { symbol: string; balance: string; address: string }[]);

            } catch (err) {
                console.error('Error fetching wallet balances:', err);
                setWalletBalanceError('Failed to load wallet balances. Please try again.');
            } finally {
                setLoadingWalletBalances(false);
            }
        };

        fetchWalletBalances();
    }, [authenticated, privyWallets]); // Depend on authentication status and wallets array


    // Helper function to clean and validate numeric input
    const parseNumericInput = (value: string): number => {
        if (!value || value.trim() === '') return 0;

        const cleanValue = value.replace(/[^\d.,]/g, '');

        const normalizedValue = cleanValue.replace(',', '.');

        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? 0 : parsed;
    };

    const handleAmount0Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setAmount0(inputValue);

        // Only convert if we have valid prices and a valid numeric value
        if (tokenPrices && tokenPrices.token0PriceUSD > 0 && tokenPrices.token1PriceUSD > 0) {
            const numericValue = parseNumericInput(inputValue);

            if (numericValue > 0) {
                // FIX: Calculate USD value of entered token0
                const token0ValueUSD = numericValue * tokenPrices.token0PriceUSD;

                // FIX: Calculate how many token1 tokens are needed for the same USD value
                const equivalentAmount1 = token0ValueUSD / tokenPrices.token1PriceUSD;

                // Format result with appropriate precision
                let formattedAmount1: string;
                if (equivalentAmount1 < 0.000001) {
                    formattedAmount1 = equivalentAmount1.toExponential(6);
                } else if (equivalentAmount1 < 0.01) {
                    formattedAmount1 = equivalentAmount1.toFixed(8);
                } else if (equivalentAmount1 < 1) {
                    formattedAmount1 = equivalentAmount1.toFixed(6);
                } else {
                    formattedAmount1 = equivalentAmount1.toFixed(4);
                }

                setAmount1(formattedAmount1);
            } else {
                setAmount1('');
            }
        } else {
            setAmount1('');
        }
    }, [tokenPrices]);

    const handleAmount1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setAmount1(inputValue);

        // Only convert if we have valid prices and a valid numeric value
        if (tokenPrices && tokenPrices.token0PriceUSD > 0 && tokenPrices.token1PriceUSD > 0) {
            const numericValue = parseNumericInput(inputValue);

            if (numericValue > 0) {
                // FIX: Calculate USD value of entered token1
                const token1ValueUSD = numericValue * tokenPrices.token1PriceUSD;

                // FIX: Calculate how many token0 tokens are needed for the same USD value
                const equivalentAmount0 = token1ValueUSD / tokenPrices.token0PriceUSD;

                // Format result with appropriate precision
                let formattedAmount0: string;
                if (equivalentAmount0 < 0.000001) {
                    formattedAmount0 = equivalentAmount0.toExponential(6);
                } else if (equivalentAmount0 < 0.01) {
                    formattedAmount0 = equivalentAmount0.toFixed(8);
                } else if (equivalentAmount0 < 1) {
                    formattedAmount0 = equivalentAmount0.toFixed(6);
                } else {
                    formattedAmount0 = equivalentAmount0.toFixed(4);
                }

                setAmount0(formattedAmount0);
            } else {
                setAmount0('');
            }
        } else {
            setAmount0('');
        }
    }, [tokenPrices]);

    const formatUSDValue = (amount: string, priceUSD: number) => {
        if (!amount || priceUSD === 0) return '$0.00';

        const numericAmount = parseNumericInput(amount);
        if (numericAmount === 0) return '$0.00';

        const usdValue = numericAmount * priceUSD;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(usdValue);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600 mx-auto mb-4"></div>
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
                    <p className="text-gray-600 mb-4">{error || 'Pool not found'}</p>
                    <Link to="/dashboard/pools" className="text-sky-600 hover:underline">
                        Back to Pools
                    </Link>
                </div>
            </div>
        );
    }

    const feeTierPercentage = (Number(pool.feeTier) / 10000).toFixed(2) + '%';

    // FIX: Calculate total USD value (now will be double the individual value)
    const totalUSDValue = tokenPrices ?
        (parseNumericInput(amount0) * tokenPrices.token0PriceUSD) +
        (parseNumericInput(amount1) * tokenPrices.token1PriceUSD) : 0;

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

                            {/* Current prices */}
                            {priceLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-600"></div>
                                    <span className="text-sm text-gray-500">Loading prices...</span>
                                </div>
                            ) : tokenPrices ? (

                                <div className='space-y-1'>
                                    <p className="text-sm text-gray-500">Current Prices</p>
                                    <p className="text-xs font-medium text-gray-900">{pool.token0.symbol}: {formatUSDValue('1', tokenPrices.token0PriceUSD)}</p>
                                    <p className="text-xs font-medium text-gray-900">{pool.token1.symbol}: {formatUSDValue('1', tokenPrices.token1PriceUSD)}</p>
                                </div>

                            ) : (
                                <p className="text-sm text-red-500">Error loading prices</p>
                            )}
                        </div>
                    </div>

                    {/* Investment Amounts */}
                    {/* Investment Amounts */}
                    <div>
                        {/* Wallet Balances Section */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Your Wallet Balances</h3>
                            {!authenticated ? (
                                <p className="text-gray-600 text-sm">Connect your wallet to see your balances.</p>
                            ) : loadingWalletBalances ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-600"></div>
                                    <span className="text-sm text-gray-500">Loading balances...</span>
                                </div>
                            ) : walletBalanceError ? (
                                <p className="text-sm text-red-500">{walletBalanceError}</p>
                            ) : (
                                <div className="space-y-2">
                                    {walletNativeBalance && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700 text-sm">ETH</span>
                                            <span className="text-gray-600 text-sm">
                                                {parseFloat(walletNativeBalance).toFixed(6)} ETH
                                            </span>
                                        </div>
                                    )}
                                    {walletErc20Balances.length > 0 ? (
                                        walletErc20Balances.map((token) => (
                                            <div key={token.address} className="flex justify-between items-center">
                                                <span className="font-medium text-gray-700 text-sm">{token.symbol}</span>
                                                <span className="text-gray-600 text-sm">
                                                    {parseFloat(token.balance).toFixed(6)} {token.symbol}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600 text-sm">
                                            No ERC-20 tokens found in your wallet.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Amounts</h2>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {pool.token0.symbol} Amount
                                    </label>
                                    {walletErc20Balances.some(t => t.address === pool.token0.address) && (
                                        <button
                                            onClick={() => {
                                                const token = walletErc20Balances.find(t => t.address === pool.token0.address);
                                                if (token) setAmount0(parseFloat(token.balance).toFixed(6));
                                            }}
                                            className="text-xs text-sky-600 hover:text-sky-700 hover:underline"
                                        >
                                            Use Max
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    value={amount0}
                                    onChange={handleAmount0Change}
                                    placeholder="0.0"
                                    step="any"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    disabled={!tokenPrices || priceLoading}
                                />
                                {tokenPrices && amount0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatUSDValue(amount0, tokenPrices.token0PriceUSD)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {pool.token1.symbol} Amount
                                    </label>
                                    {walletErc20Balances.some(t => t.address === pool.token1.address) && (
                                        <button
                                            onClick={() => {
                                                const token = walletErc20Balances.find(t => t.address === pool.token1.address);
                                                if (token) setAmount1(parseFloat(token.balance).toFixed(6));
                                            }}
                                            className="text-xs text-sky-600 hover:text-sky-700 hover:underline"
                                        >
                                            Use Max
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    value={amount1}
                                    onChange={handleAmount1Change}
                                    placeholder="0.0"
                                    step="any"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    disabled={!tokenPrices || priceLoading}
                                />
                                {tokenPrices && amount1 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatUSDValue(amount1, tokenPrices.token1PriceUSD)}
                                    </p>
                                )}
                            </div>

                            {totalUSDValue > 0 && (
                                <div className="bg-gray-50 p-3 rounded-lg border-2 border-sky-400">
                                    <p className="text-sm text-gray-600">Total Value:</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(totalUSDValue)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Price Range */}
                    <div className="lg:col-span-2 flex flex-col space-y-2">
                        <h2 className="text-md font-semibold text-gray-900">Price Range</h2>
                        <p className="text-sm text-gray-600">
                            The price range is set to <strong>Full Range</strong>, ensuring continuous market participation at all prices.
                            <br /><em className='font-semibold'>Custom range will be implemented in a future update.</em>
                        </p>
                        <div className="flex gap-2 text-sm text-gray-600">
                            <span>Min Price: 0</span>
                            <span>Max Price: ∞</span>
                        </div>
                    </div>
                </div>

                {/* Invest Button */}
                <div className="mt-6">
                    <Button
                        className="w-full text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-700 hover:to-sky-800 px-4 py-2 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => alert('Investment functionality will be implemented soon.')}
                        disabled={!tokenPrices || !amount0 || !amount1 || priceLoading}
                    >
                        {priceLoading ? 'Loading prices...' : 'Invest Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NewPosition;
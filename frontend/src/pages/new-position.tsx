/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { fetchTokenPriceInUSDT } from '../utils/fetchTokenPrice';
import TokenPriceDisplay from '../components/ui/token-price-display'; interface Network {
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
}interface PoolDayData {
    date: number;
    feesUSD: string;
    volumeUSD: string;
    tvlUSD: string;
    apr24h: string;
}interface Pool {
    feeTier: string;
    token0: Token;
    token1: Token;
    createdAtTimestamp: string;
    poolDayData: PoolDayData[];
}interface TokenPrices {
    token0PriceUSD: number;
    token1PriceUSD: number;
    token0PriceInToken1: number;
    token1PriceInToken0: number;
}// Minimal ERC-20 ABI for balanceOf, symbol, and decimals

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
] as const;// Example ERC-20 tokens on Sepolia (you can add more relevant tokens)

const SEPOLIA_ERC20_TOKENS = [
    {
        address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH
        symbol: 'WETH',
    },
    {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC
        symbol: 'USDC',
    },
    {
        address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT
        symbol: 'USDT',
    },
    {
        address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357', // DAI
        symbol: 'DAI',
    },
    {
        address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', // LINK
        symbol: 'LINK',
    },
    {
        address: '0x29f2D40B0605204364af54EC677bD022dA425d03', // WBTC
        symbol: 'WBTC',
        decimals: 8,
    },
    {
        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
        symbol: 'UNI',
    },
    {
        address: '0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae', // MATIC
        symbol: 'MATIC',
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

    // New states for investment input
    const [investmentAmount, setInvestmentAmount] = useState<string>('');
    const [selectedToken, setSelectedToken] = useState<string>('');

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

    const [tokenAddressInput, setTokenAddressInput] = useState<string>('');
    const [validToken, setValidToken] = useState<{ symbol: string, balance: string } | null>(null);

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

            try {
                const feeTiers = [100, 500, 3000, 10000];
                console.log('Pool data:', {
                    token0: pool.token0,
                    token1: pool.token1,
                    feeTier: pool.feeTier,
                });

                // Fetch price for token0
                const token0PriceResult = await fetchTokenPriceInUSDT(
                    pool.token0.address,
                    pool.token0.symbol,
                    pool.token0.decimals || 18,
                    feeTiers
                );

                // Fetch price for token1
                const token1PriceResult = await fetchTokenPriceInUSDT(
                    pool.token1.address,
                    pool.token1.symbol,
                    pool.token1.decimals || 18,
                    feeTiers
                );

                if (token0PriceResult.error || token1PriceResult.error) {
                    throw new Error(
                        token0PriceResult.error || token1PriceResult.error || 'Failed to fetch prices'
                    );
                }

                // Calculate conversion rates
                const token0PriceUSD = token0PriceResult.priceInUSD;
                const token1PriceUSD = token1PriceResult.priceInUSD;
                const token0PriceInToken1 = token0PriceUSD / token1PriceUSD;
                const token1PriceInToken0 = token1PriceUSD / token0PriceUSD;

                // Validate conversion
                const isValidConversion = validateConversion(
                    pool.token0.symbol,
                    pool.token1.symbol,
                    token0PriceInToken1,
                    token1PriceInToken0
                );

                console.log('Processed data:', {
                    token0: {
                        symbol: pool.token0.symbol,
                        address: pool.token0.address,
                        priceUSD: token0PriceUSD.toFixed(4),
                        feeTier: token0PriceResult.feeTier,
                        poolAddress: token0PriceResult.poolAddress,
                    },
                    token1: {
                        symbol: pool.token1.symbol,
                        address: pool.token1.address,
                        priceUSD: token1PriceUSD.toFixed(4),
                        feeTier: token1PriceResult.feeTier,
                        poolAddress: token1PriceResult.poolAddress,
                    },
                    conversion: {
                        [`1 ${pool.token0.symbol} =`]: `${token0PriceInToken1.toFixed(8)} ${pool.token1.symbol}`,
                        [`1 ${pool.token1.symbol} =`]: `${token1PriceInToken0.toFixed(8)} ${pool.token0.symbol}`,
                    },
                    validation: {
                        crossCheck: (token0PriceInToken1 * token1PriceInToken0).toFixed(6),
                        isValid: isValidConversion,
                    },
                });

                setTokenPrices({
                    token0PriceUSD,
                    token1PriceUSD,
                    token0PriceInToken1,
                    token1PriceInToken0,
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
                    chain: sepolia,
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

    // New function to handle investment amount changes
    const handleInvestmentAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setInvestmentAmount(inputValue);

        if (!validToken || !tokenPrices || !pool) {
            setAmount0('');
            setAmount1('');
            return;
        }

        const numericValue = parseNumericInput(inputValue);
        if (numericValue <= 0) {
            setAmount0('');
            setAmount1('');
            return;
        }

        // Precisamos descobrir o preço do token selecionado
        let selectedTokenPriceUSD = 0;

        if (validToken.symbol === 'ETH') {
            // Se for ETH, precisamos de um fallback caso não tenha o preço diretamente
            // Vamos assumir que ETH é o token0 ou token1, ou usar um fallback
            if (pool.token0.symbol === 'WETH' || pool.token0.symbol === 'ETH') {
                selectedTokenPriceUSD = tokenPrices.token0PriceUSD;
            } else if (pool.token1.symbol === 'WETH' || pool.token1.symbol === 'ETH') {
                selectedTokenPriceUSD = tokenPrices.token1PriceUSD;
            } else {
                // Fallback - você pode querer buscar o preço de ETH/USD separadamente
                selectedTokenPriceUSD = tokenPrices.token0PriceUSD; // Exemplo simplificado
            }
        } else {
            // Para tokens ERC-20, verificamos se é token0 ou token1 do pool
            if (validToken.symbol === pool.token0.symbol) {
                selectedTokenPriceUSD = tokenPrices.token0PriceUSD;
            } else if (validToken.symbol === pool.token1.symbol) {
                selectedTokenPriceUSD = tokenPrices.token1PriceUSD;
            } else {
                // Token não faz parte do pool - você pode querer buscar seu preço
                // Aqui vamos usar um fallback simples
                selectedTokenPriceUSD = 1; // Placeholder - implemente busca de preço real
            }
        }

        // Se não conseguimos determinar o preço, não calculamos
        if (selectedTokenPriceUSD <= 0) {
            setAmount0('');
            setAmount1('');
            return;
        }

        // Calcula total USD value to invest
        const totalUSDToInvest = numericValue * selectedTokenPriceUSD;

        // Split 50/50 entre token0 e token1
        const usdPerToken = totalUSDToInvest / 2;

        // Calcula amounts para cada token
        const token0Amount = usdPerToken / tokenPrices.token0PriceUSD;
        const token1Amount = usdPerToken / tokenPrices.token1PriceUSD;

        // Formata os amounts
        const formatAmount = (amount: number) => {
            if (amount < 0.000001) {
                return amount.toExponential(6);
            } else if (amount < 0.01) {
                return amount.toFixed(8);
            } else if (amount < 1) {
                return amount.toFixed(6);
            } else {
                return amount.toFixed(4);
            }
        };

        setAmount0(formatAmount(token0Amount));
        setAmount1(formatAmount(token1Amount));
    }, [validToken, tokenPrices, pool]);

    const handleTokenAddressInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = e.target.value.trim();
        setTokenAddressInput(address);
        setInvestmentAmount('');
        setAmount0('');
        setAmount1('');

        if (!address || address.length !== 42 || !address.startsWith('0x')) {
            setValidToken(null);
            return;
        }

        try {
            // Verifica se é ETH (endereço zero ou null address)
            if (address === '0x0000000000000000000000000000000000000000') {
                if (walletNativeBalance) {
                    setValidToken({ symbol: 'ETH', balance: walletNativeBalance });
                }
                return;
            }

            // Verifica tokens ERC-20
            const erc20Balance = walletErc20Balances.find(b =>
                b.address.toLowerCase() === address.toLowerCase());

            if (erc20Balance) {
                setValidToken({
                    symbol: erc20Balance.symbol,
                    balance: erc20Balance.balance
                });
            } else {
                setValidToken(null);
            }
        } catch (error) {
            console.error('Error validating token address:', error);
            setValidToken(null);
        }
    }, [walletNativeBalance, walletErc20Balances]);

    const handleAmount0Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setAmount0(inputValue);

        setInvestmentAmount('');

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

        // Clear investment amount when manually editing
        setInvestmentAmount('');

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

    // Get available tokens for investment input
    const getAvailableTokens = () => {
        const tokens = [];

        if (walletNativeBalance && parseFloat(walletNativeBalance) > 0) {
            tokens.push({ symbol: 'ETH', balance: walletNativeBalance });
        }

        walletErc20Balances.forEach(token => {
            if (parseFloat(token.balance) > 0) {
                tokens.push({ symbol: token.symbol, balance: token.balance });
            }
        });

        return tokens;
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

    const totalUSDValue = tokenPrices ?
        (parseNumericInput(amount0) * tokenPrices.token0PriceUSD) +
        (parseNumericInput(amount1) * tokenPrices.token1PriceUSD) : 0;

    const availableTokens = getAvailableTokens();

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-12 bg-gray-50">
            <Link to="/dashboard/pools" className="flex items-center text-sky-600 hover:underline mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Pools
            </Link>

            <div className="bg-white rounded-xl shadow-sm border-t-2 border-sky-50 p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-6">Start Investing</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pool Details */}
                    <div>
                        {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">Pool Details</h2> */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Token Pair</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {pool.token0.symbol}/{pool.token1.symbol}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fee Tier</p>
                                <p className="text-sm font-medium text-gray-900">{feeTierPercentage}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Network</p>
                                <p className="text-sm font-medium text-gray-900">{pool.token0.network.name}</p>
                            </div>

                            {/* Current prices */}
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Current Prices</p>
                                <TokenPriceDisplay
                                    tokenAddress={pool.token0.address}
                                    tokenSymbol={pool.token0.symbol}
                                    tokenDecimals={pool.token0.decimals || 18}
                                    feeTiers={[100, 500, 3000, 10000]}
                                />
                                <TokenPriceDisplay
                                    tokenAddress={pool.token1.address}
                                    tokenSymbol={pool.token1.symbol}
                                    tokenDecimals={pool.token1.decimals || 18}
                                    feeTiers={[100, 500, 3000, 10000]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Investment Amounts */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Investment amounts</h2>
                        {!authenticated && (
                            <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
                                <p className="text-sky-700 text-sm">
                                    Please connect your wallet to view investment options.
                                </p>
                            </div>
                        )}
                        {/* Investment Amount Input Section */}
                        {authenticated && availableTokens.length > 0 && (
                            <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Input Token Address from Your Wallet
                                        </label>
                                        <input
                                            type="text"
                                            value={tokenAddressInput}
                                            onChange={handleTokenAddressInput}
                                            placeholder="0x..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                                        />
                                        {tokenAddressInput && !validToken && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Token not found in your wallet or invalid address
                                            </p>
                                        )}
                                    </div>

                                    {validToken && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Amount to Invest ({validToken.symbol})
                                            </label>
                                            <input
                                                type="number"
                                                value={investmentAmount}
                                                onChange={handleInvestmentAmountChange}
                                                placeholder="0.0"
                                                step="any"
                                                min="0"
                                                max={validToken.balance}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Available: {parseFloat(validToken.balance).toFixed(6)} {validToken.symbol}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}



                        <h2 className="text-md font-semibold text-gray-900 mb-4">Investment Summary</h2>
                        <div className="space-y-4">
                            {/* Token 0 Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {pool.token0.symbol} Amount
                                </label>
                                <input
                                    type="number"
                                    value={amount0}
                                    onChange={handleAmount0Change}
                                    disabled
                                    placeholder="0.0"
                                    step="any"
                                    min="0"
                                    className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                                {tokenPrices && amount0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        ≈ {formatUSDValue(amount0, tokenPrices.token0PriceUSD)}
                                    </p>
                                )}
                            </div>

                            {/* Token 1 Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {pool.token1.symbol} Amount
                                </label>
                                <input
                                    type="number"
                                    value={amount1}
                                    onChange={handleAmount1Change}
                                    disabled
                                    placeholder="0.0"
                                    step="any"
                                    min="0"
                                    className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                                {tokenPrices && amount1 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        ≈ {formatUSDValue(amount1, tokenPrices.token1PriceUSD)}
                                    </p>
                                )}
                            </div>

                            {/* Total Value Display */}
                            {tokenPrices && (amount0 || amount1) && (
                                <div className="p-3 bg-gray-50 rounded-md border border-sky-500">
                                    <p className="text-sm text-gray-600">Total Investment Value</p>
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

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4">
                                <Button
                                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-md font-medium"
                                    disabled={!amount0 || !amount1 || !authenticated || priceLoading}
                                >
                                    {!authenticated ? 'Connect Wallet to Invest' :
                                        priceLoading ? 'Loading Prices...' :
                                            'Invest now'}
                                </Button>

                                {(!amount0 || !amount1) && !priceLoading && (
                                    <p className="text-sm text-gray-500 text-center">
                                        Enter amounts to proceed
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPosition;
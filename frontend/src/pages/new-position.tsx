/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom, createPublicClient, http, parseUnits, formatUnits, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { fetchTokenPriceInUSDT } from '../utils/fetchTokenPrice';
import TokenPriceDisplay from '../components/ui/token-price-display';
import StartSwapFacetABI from '../assets/abi/ABI_StartSwap.json';
import { solidityPacked } from 'ethers';
import toast from 'react-hot-toast';

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

interface WalletTokenBalance {
    symbol: string;
    balance: string;
    address: string;
    decimals: number;
}

interface ValidToken {
    symbol: string;
    balance: string;
    decimals: number;
    address?: string;
}

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
    },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

const SEPOLIA_ERC20_TOKENS = [
    {
        address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', // WETH
        symbol: 'WETH',
        decimals: 18
    },
    {
        address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238', // USDC
        symbol: 'USDC',
        decimals: 6
    },
    {
        address: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0', // USDT
        symbol: 'USDT',
        decimals: 6
    },
    {
        address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357', // DAI
        symbol: 'DAI',
        decimals: 18
    },
    {
        address: '0x779877a7b0d9e8603169ddbd7836e478b4624789', // LINK
        symbol: 'LINK',
        decimals: 18
    },
    {
        address: '0x29f2d40b0605204364af54ec677bd022da425d03', // WBTC
        symbol: 'WBTC',
        decimals: 8
    },
    {
        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
        symbol: 'UNI',
        decimals: 18
    },
    {
        address: '0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae', // MATIC
        symbol: 'MATIC',
        decimals: 18
    },
];

const DiamondContractAddress = '0xcB205dd75A20943905142c177d729Ec781d87dc8';

const showSuccess = (txHash: string) => {
    toast.success(
        <div className="text-center">
            <p className="font-bold">Investment completed!</p>
            <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
            >
                View transaction
            </a>
        </div>,
        {
            duration: 5000,
            position: "top-center",
        }
    );
};

// Erro
const showError = (message: string) => {
    toast.error(message, {
        position: "top-center",
    });
};

const NewPosition: React.FC = () => {
    const { index } = useParams<{ index: string }>();
    const [pool, setPool] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [amount0, setAmount0] = useState<string>('');
    const [amount1, setAmount1] = useState<string>('');
    const [tokenPrices, setTokenPrices] = useState<TokenPrices | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [investmentAmount, setInvestmentAmount] = useState<string>('');
    const { authenticated } = usePrivy();
    const { wallets: privyWallets } = useWallets();
    const [walletNativeBalance, setWalletNativeBalance] = useState<string | null>(null);
    const [walletErc20Balances, setWalletErc20Balances] = useState<WalletTokenBalance[]>([]);
    const [loadingWalletBalances, setLoadingWalletBalances] = useState(false);
    const [walletBalanceError, setWalletBalanceError] = useState<string | null>(null);
    const [tokenAddressInput, setTokenAddressInput] = useState<string>('');
    const [validToken, setValidToken] = useState<ValidToken | null>(null);
    const [tokenPricesMap, setTokenPricesMap] = useState<Record<string, number>>({});
    const [isInvesting, setIsInvesting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isAwaitingSignature, setIsAwaitingSignature] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Remove this
    console.log('loadingWalletBalances', loadingWalletBalances);
    console.log('walletBalanceError', walletBalanceError);

    const validateConversion = (token0Symbol: string, token1Symbol: string, token0PriceInToken1: number, token1PriceInToken0: number) => {
        const crossCheck = token0PriceInToken1 * token1PriceInToken0;
        const tolerance = 0.01;
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

    const fetchPoolData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pools`);
            if (!response.ok) throw new Error(`Failed to fetch pool data: ${response.statusText}`);
            const data = await response.json();
            const selectedPool = data.pools[Number(index)];
            if (!selectedPool) throw new Error('Pool not found');
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

    const fetchTokenPrices = async () => {
        if (!pool) return;
        setPriceLoading(true);
        setError(null);

        try {
            const feeTiers = [100, 500, 3000, 10000];
            const token0PriceResult = await fetchTokenPriceInUSDT(
                pool.token0.address,
                pool.token0.symbol,
                pool.token0.decimals || 18,
                feeTiers
            );
            const token1PriceResult = await fetchTokenPriceInUSDT(
                pool.token1.address,
                pool.token1.symbol,
                pool.token1.decimals || 18,
                feeTiers
            );

            if (token0PriceResult.error || token1PriceResult.error) {
                throw new Error(token0PriceResult.error || token1PriceResult.error || 'Failed to fetch prices');
            }

            const token0PriceUSD = token0PriceResult.priceInUSD;
            const token1PriceUSD = token1PriceResult.priceInUSD;
            const token0PriceInToken1 = token0PriceUSD / token1PriceUSD;
            const token1PriceInToken0 = token1PriceUSD / token0PriceUSD;

            validateConversion(pool.token0.symbol, pool.token1.symbol, token0PriceInToken1, token1PriceInToken0);

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

    const fetchWalletBalances = async () => {
        if (!authenticated || privyWallets.length === 0) {
            setWalletNativeBalance(null);
            setWalletErc20Balances([]);
            setLoadingWalletBalances(false);
            return;
        }

        setLoadingWalletBalances(true);
        setWalletBalanceError(null);

        const connectedWallet = privyWallets[0];
        if (!connectedWallet?.address) {
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

                    const decimals = token.decimals || await publicClient.readContract({
                        address: token.address as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'decimals',
                    });

                    return {
                        symbol: token.symbol,
                        balance: formatUnits(balance as bigint, decimals as number),
                        address: token.address,
                        decimals: decimals as number
                    };
                } catch (erc20Error) {
                    console.warn(`Failed to fetch balance for ${token.symbol}:`, erc20Error);
                    return null;
                }
            });

            const resolvedErc20Balances = (await Promise.all(erc20BalancesPromises))
                .filter((b): b is WalletTokenBalance => b !== null && parseFloat(b.balance) > 0);

            setWalletErc20Balances(resolvedErc20Balances);
        } catch (err) {
            console.error('Error fetching wallet balances:', err);
            setWalletBalanceError('Failed to load wallet balances. Please try again.');
        } finally {
            setLoadingWalletBalances(false);
        }
    };

    const fetchTokenUSDPrice = async (tokenAddress: string, symbol: string, decimals: number = 18): Promise<number> => {
        try {
            if (symbol === 'ETH' || symbol === 'WETH') {
                const wethPrice = await fetchTokenPriceInUSDT(
                    '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
                    'WETH',
                    18,
                    [100, 500, 3000, 10000]
                );
                return wethPrice.priceInUSD;
            }

            if (['USDT', 'USDC', 'DAI'].includes(symbol)) return 1;

            const priceResult = await fetchTokenPriceInUSDT(
                tokenAddress,
                symbol,
                decimals,
                [100, 500, 3000, 10000]
            );

            return priceResult.priceInUSD || 0;
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            return 0;
        }
    };

    const loadTokenPrices = async () => {
        if (!authenticated || privyWallets.length === 0) return;

        const prices: Record<string, number> = {};
        prices['ETH'] = await fetchTokenUSDPrice('0x0000000000000000000000000000000000000000', 'ETH');

        for (const token of walletErc20Balances) {
            prices[token.symbol] = await fetchTokenUSDPrice(
                token.address,
                token.symbol,
                token.decimals
            );
        }

        setTokenPricesMap(prices);
    };

    const parseNumericInput = (value: string): number => {
        if (!value || value.trim() === '') return 0;
        const cleanValue = value.replace(/[^\d.,]/g, '');
        const normalizedValue = cleanValue.replace(',', '.');
        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? 0 : parsed;
    };

    const handleInvestmentAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setInvestmentAmount(inputValue);

        // if (!validToken || !tokenPrices || !pool) {
        //     setAmount0('');
        //     setAmount1('');
        //     return;
        // }

        // const numericValue = parseNumericInput(inputValue);
        // if (numericValue <= 0) {
        //     setAmount0('');
        //     setAmount1('');
        //     return;
        // }

        // const selectedTokenPriceUSD = tokenPricesMap[validToken.symbol] || 0;
        // if (selectedTokenPriceUSD <= 0) {
        //     setAmount0('');
        //     setAmount1('');
        //     return;
        // }

        // const totalUSDToInvest = numericValue * selectedTokenPriceUSD;
        // const usdPerToken = totalUSDToInvest / 2;
        // const token0Amount = usdPerToken / tokenPrices.token0PriceUSD;
        // const token1Amount = usdPerToken / tokenPrices.token1PriceUSD;

        // const formatAmount = (amount: number) => {
        //     if (amount < 0.000001) return amount.toExponential(6);
        //     if (amount < 0.01) return amount.toFixed(8);
        //     if (amount < 1) return amount.toFixed(6);
        //     return amount.toFixed(4);
        // };

        // setAmount0(formatAmount(token0Amount));
        // setAmount1(formatAmount(token1Amount));

        setAmount0('3.64');
        setAmount1('0.01');
    }, [validToken, tokenPrices, pool, tokenPricesMap]);

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
            if (address === '0x0000000000000000000000000000000000000000') {
                if (walletNativeBalance) {
                    setValidToken({
                        symbol: 'ETH',
                        balance: walletNativeBalance,
                        decimals: 18
                    });
                }
                return;
            }

            const erc20Balance = walletErc20Balances.find(b =>
                b.address.toLowerCase() === address.toLowerCase());

            if (erc20Balance) {
                setValidToken({
                    symbol: erc20Balance.symbol,
                    balance: erc20Balance.balance,
                    decimals: erc20Balance.decimals || 18,
                    address: erc20Balance.address
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

        if (tokenPrices && tokenPrices.token0PriceUSD > 0 && tokenPrices.token1PriceUSD > 0) {
            const numericValue = parseNumericInput(inputValue);
            if (numericValue > 0) {
                const token0ValueUSD = numericValue * tokenPrices.token0PriceUSD;
                const equivalentAmount1 = token0ValueUSD / tokenPrices.token1PriceUSD;
                setAmount1(formatAmount(equivalentAmount1));
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
        setInvestmentAmount('');

        if (tokenPrices && tokenPrices.token0PriceUSD > 0 && tokenPrices.token1PriceUSD > 0) {
            const numericValue = parseNumericInput(inputValue);
            if (numericValue > 0) {
                const token1ValueUSD = numericValue * tokenPrices.token1PriceUSD;
                const equivalentAmount0 = token1ValueUSD / tokenPrices.token0PriceUSD;
                setAmount0(formatAmount(equivalentAmount0));
            } else {
                setAmount0('');
            }
        } else {
            setAmount0('');
        }
    }, [tokenPrices]);

    const formatAmount = (amount: number): string => {
        if (amount < 0.000001) return amount.toExponential(6);
        if (amount < 0.01) return amount.toFixed(8);
        if (amount < 1) return amount.toFixed(6);
        return amount.toFixed(4);
    };

    const formatUSDBalance = (symbol: string, balance: string): string => {
        if (!symbol || !balance) return '$0.00';

        // For stablecoins, just return the balance as USD
        if (['USDC', 'USDT', 'DAI'].includes(symbol)) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(parseFloat(balance));
        }

        const price = tokenPricesMap[symbol] || 0;
        const numericBalance = parseFloat(balance) || 0;
        const usdValue = numericBalance * price;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(usdValue);
    };

    // const formatUSDValue = (amount: string, priceUSD: number) => {
    //     if (!amount || priceUSD === 0) return '$0.00';
    //     const numericAmount = parseNumericInput(amount);
    //     if (numericAmount === 0) return '$0.00';
    //     const usdValue = numericAmount * priceUSD;
    //     return new Intl.NumberFormat('en-US', {
    //         style: 'currency',
    //         currency: 'USD',
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2
    //     }).format(usdValue);
    // };

    const getAvailableTokens = () => {
        const tokens: { symbol: string; balance: string }[] = [];
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


    const handleInvestNow = async () => {
        // Validações iniciais
        if (
            !pool ||
            !amount0 ||
            !amount1 ||
            !tokenPrices ||
            !authenticated ||
            privyWallets.length === 0 ||
            !validToken ||
            isNaN(parseFloat(investmentAmount)) ||
            parseFloat(investmentAmount) <= 0
        ) {
            alert('Please fill all fields with valid amounts and connect your wallet');
            return;
        }

        try {
            setIsInvesting(true);
            const wallet = privyWallets[0];

            // 1. Verificar e mudar de rede
            if (wallet.chainId !== sepolia.id.toString()) {
                try {
                    await wallet.switchChain(sepolia.id);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (switchError) {
                    console.error('Network switch failed:', switchError);
                    alert('Please switch to Sepolia network in your wallet');
                    return;
                }
            }

            // 2. Configurar clientes Viem
            const provider = await wallet.getEthereumProvider();
            const walletClient = createWalletClient({
                account: wallet.address as `0x${string}`,
                chain: sepolia,
                transport: custom(provider)
            });

            const publicClient = createPublicClient({
                chain: sepolia,
                transport: http()
            });

            // 3. Determinar tokens
            const isProvidingToken0 = validToken.symbol.toUpperCase() === pool.token0.symbol.toUpperCase();
            const tokenIn = validToken.address || '0x0000000000000000000000000000000000000000';
            const tokenOut = isProvidingToken0 ? pool.token1.address : pool.token0.address;

            // 4. Preparar valores
            const amountIn = parseFloat(investmentAmount);
            const parsedAmountIn = parseUnits(
                amountIn.toString(),
                validToken.decimals || 18
            );
            // const amount0In = parseFloat(amount0);
            // const parsedAmount0 = parseUnits(
            //     amount0In.toString(),
            //     pool.token0.decimals || 18
            // );
            // const amount1In = parseFloat(amount1);
            // const parsedAmount1 = parseUnits(
            //     amount1In.toString(),
            //     pool.token1.decimals || 18
            // );

            // 5. Construir payload
            const dexPayload = {
                path: solidityPacked(
                    ['address', 'uint24', 'address'],
                    [tokenIn.toLowerCase(), parseInt(pool.feeTier, 10), tokenOut.toLowerCase()]
                ),
                amountInForInputToken: 10000000000000000,
                deadline: 0 // Math.floor(Date.now() / 1000) + 300
            };

            const stakePayload = {
                token0: pool.token1.address,
                token1: pool.token0.address,
                fee: parseInt(pool.feeTier, 10),
                tickLower: -203200,
                tickUpper: -191200,
                amount0Desired: 10000000000000000,
                amount1Desired: 94000000000000000000,
                amount0Min: 0,
                amount1Min: 0,
                recipient: wallet.address,
                deadline: Math.floor(Date.now() / 1000) + 60
            };


            console.log('parsedAmountIn:', parsedAmountIn);
            console.log('dex-payload:', dexPayload);
            console.log('stake-payload:', stakePayload);

            // 6. Aprovação de token (mantido igual)
            if (tokenIn !== '0x0000000000000000000000000000000000000000') {
                setIsApproving(true);
                try {
                    const approveTx = await walletClient.writeContract({
                        address: tokenIn as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [
                            DiamondContractAddress,
                            parsedAmountIn
                        ],
                        gas: 100000n
                    });
                    await publicClient.waitForTransactionReceipt({ hash: approveTx });
                } finally {
                    setIsApproving(false);
                }
            }

            // 7. Executar swap com a nova estrutura
            setIsAwaitingSignature(true);
            let txHash;
            try {
                debugger;
                txHash = await walletClient.writeContract({
                    address: DiamondContractAddress as `0x${string}`,
                    abi: StartSwapFacetABI,
                    functionName: 'startSwap',
                    args: [
                        20000000000000000, // _totalAmountIn
                        dexPayload,               // _payload
                        stakePayload              // _stakePayload
                    ],
                    gas: 2000000n // Aumentei o limite de gás
                });
            } finally {
                setIsAwaitingSignature(false);
            }

            // 8. Esperar confirmação (mantido igual)
            setIsConfirming(true);
            try {
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: txHash,
                    timeout: 120_000
                });

                if (receipt.status === 'success') {
                    showSuccess(txHash);
                    //alert(`Investment successful!\nTX Hash: ${txHash}\n\nView on explorer: https://sepolia.etherscan.io/tx/${txHash}`);
                    //fetchPoolData();
                    //fetchWalletBalances();
                } else {
                    throw new Error('Transaction failed on-chain');
                }
            } finally {
                setIsConfirming(false);
            }

        } catch (error: any) {
            console.error('Investment error:', error);
            if (error?.code === 4001) {
                alert('Transaction rejected by user');
            } else if (error?.message?.includes('insufficient funds')) {
                alert('Insufficient balance for transaction');
            } else {
                alert(`Investment error: ${error?.message || 'Unknown error'}`);
            }
        } finally {
            setIsInvesting(false);
        }
    };

    useEffect(() => {
        fetchPoolData();
    }, [index]);

    useEffect(() => {
        if (pool) fetchTokenPrices();
    }, [pool]);

    useEffect(() => {
        fetchWalletBalances();
    }, [authenticated, privyWallets]);

    useEffect(() => {
        loadTokenPrices();
    }, [authenticated, privyWallets, walletErc20Balances]);

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
    // const totalUSDValue = tokenPrices ?
    //     (parseNumericInput(amount0) * tokenPrices.token0PriceUSD +
    //         parseNumericInput(amount1) * tokenPrices.token1PriceUSD) : 0;
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
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Current Prices</p>
                            <TokenPriceDisplay
                                tokenAddress={pool.token0.address}
                                tokenSymbol={pool.token0.symbol}
                                tokenDecimals={pool.token0.decimals || 18}
                                feeTiers={[100, 500, 3000, 10000]}
                                mockPrice={13.44}
                            />
                            <TokenPriceDisplay
                                tokenAddress={pool.token1.address}
                                tokenSymbol={pool.token1.symbol}
                                tokenDecimals={pool.token1.decimals || 18}
                                feeTiers={[100, 500, 3000, 10000]}
                                mockPrice={2442.09}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Investment amounts</h2>
                        {!authenticated && (
                            <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
                                <p className="text-sky-700 text-sm">
                                    Please connect your wallet to view investment options.
                                </p>
                            </div>
                        )}
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
                                                placeholder="0"
                                                step="any"
                                                min="0"
                                                max={validToken.balance}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Available: {parseFloat(validToken.balance).toFixed(6)} {validToken.symbol}
                                                <span className="ml-2 text-gray-400">
                                                    (Balance: {formatUSDBalance(validToken.symbol, validToken.balance)})
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <h2 className="text-md font-semibold text-gray-900 mb-4">Investment Summary</h2>
                        <div className="space-y-4">
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
                                        ≈ {24.42/*formatUSDValue(amount0, tokenPrices.token0PriceUSD)*/}
                                    </p>
                                )}
                            </div>

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
                                        ≈ {24.42/*formatUSDValue(amount1, tokenPrices.token1PriceUSD) */}
                                    </p>
                                )}
                            </div>

                            {tokenPrices && (amount0 || amount1) && (
                                <div className="p-3 bg-gray-50 rounded-md border border-sky-500">
                                    <p className="text-sm text-gray-600">Total Investment Value</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        48.84
                                        {/* {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(totalUSDValue)} */}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 pt-4">
                                <Button
                                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={
                                        !amount0 ||
                                        !amount1 ||
                                        !authenticated ||
                                        priceLoading ||
                                        isInvesting ||
                                        isApproving ||
                                        isAwaitingSignature ||
                                        isConfirming
                                    }
                                    onClick={handleInvestNow}
                                >
                                    {!authenticated ? (
                                        'Connect Wallet'
                                    ) : priceLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading prices...
                                        </span>
                                    ) : isApproving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Approving token...
                                        </span>
                                    ) : isAwaitingSignature ? (
                                        'Awaiting your signature...'
                                    ) : isConfirming ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Confirming transaction...
                                        </span>
                                    ) : isInvesting ? (
                                        'Processing...'
                                    ) : (
                                        'Invest Now'
                                    )}
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
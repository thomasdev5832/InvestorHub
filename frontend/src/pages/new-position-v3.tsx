import React, { useState, useEffect } from 'react';
import { ConnectedWallet, useWallets } from '@privy-io/react-auth';
import { Link, useParams } from 'react-router-dom';
import { calculateTickValues } from '../utils/uniswap/getTickValues';
import { PoolData } from '../interfaces/pooldata';
import { getUSDPriceQuote, getTokenPriceQuote } from '../utils/uniswap/getQuote';
import { getTokenDetails, getTokenBalance } from '../utils/erc20/getTokenInformation';
import { PartialToken, Token } from '../interfaces/token';
import { startSwapAndWait } from '../utils/aggregator/investStartSwap';
import { StartSwapParams } from '../interfaces/startswapparams';
import { checkAndExecuteApprovalAndWait } from '../utils/erc20/executeapprovals';
import { fromReadableAmount } from '../utils/convertions';
import { ArrowLeft } from 'lucide-react';

const NewPositionV3: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [poolData, setPoolData] = useState<PoolData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tickValues, setTickValues] = useState<any>(null);
    const [token0Price, setToken0Price] = useState<string | null>(null);
    const [token1Price, setToken1Price] = useState<string | null>(null);
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [customTokenDetails, setCustomTokenDetails] = useState<PartialToken | null>(null);
    const [customTokenBalance, setCustomTokenBalance] = useState<string | null>(null);
    const [customTokenUSDPrice, setCustomTokenUSDPrice] = useState<string | null>(null);
    const [investmentAmount, setInvestmentAmount] = useState<string>('');
    const [investmentQuotes, setInvestmentQuotes] = useState<{
        token0Quote?: string;
        token1Quote?: string;
        otherTokenQuote?: string;
    } | null>(null);
    const [loadingQuotes, setLoadingQuotes] = useState(false);
    const [loadingTokenInfo, setLoadingTokenInfo] = useState(false);
    const { wallets: privyWallets, ready } = useWallets();
    const [splitAmounts, setSplitAmounts] = useState<{
        token0Amount?: string;
        token1Amount?: string;
        token0USDValue?: string;
        token1USDValue?: string;
    } | null>(null);

    const fetchPoolById = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pools/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching pool by ID:', error);
            throw error;
        }
    }

    const getUSDPrice = async (connectedWallet: ConnectedWallet, token0: PartialToken, fee: number) => {
        const quoteResponse = await getUSDPriceQuote(connectedWallet, token0, fee);
        return quoteResponse;
    }

    const fetchCustomTokenInfo = async () => {
        if (!tokenAddress.trim() || !ready || privyWallets.length === 0) {
            return;
        }

        setLoadingTokenInfo(true);
        setError(null);

        try {
            // Fetch token details and balance in parallel
            const [tokenDetails, tokenBalance] = await Promise.all([
                getTokenDetails(privyWallets[0], tokenAddress.trim()),
                getTokenBalance(privyWallets[0], tokenAddress.trim())
            ]);

            setCustomTokenDetails(tokenDetails);
            setCustomTokenBalance(tokenBalance);

            // Get USD price for the custom token (using default fee tier 3000)
            try {
                const usdPrice = await getUSDPrice(privyWallets[0], tokenDetails, 3000);
                setCustomTokenUSDPrice(usdPrice);
            } catch (priceError) {
                console.warn('Could not fetch USD price for custom token:', priceError);
                setCustomTokenUSDPrice(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch token information');
            console.error('Error fetching custom token info:', err);
            setCustomTokenDetails(null);
            setCustomTokenBalance(null);
            setCustomTokenUSDPrice(null);
        } finally {
            setLoadingTokenInfo(false);
        }
    };

    const handleTokenAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomTokenInfo();
    };

    const investInPool = async () => {
        if (
            !tickValues ||
            !investmentAmount.trim() ||
            !customTokenDetails ||
            !customTokenDetails.decimals ||
            !poolData ||
            !poolData.token1.decimals ||
            !poolData.token0.decimals ||
            !ready ||
            privyWallets.length === 0
        ) {
            return;
        }

        setLoadingQuotes(true);
        setError(null);

        try {
            const investmentValue = parseFloat(investmentAmount);
            const halfInvestment = investmentValue / 2;

            // Check if the typed token matches pool tokens
            const isToken0 = customTokenDetails.address.toLowerCase() === poolData.token0.address.toLowerCase();
            const isToken1 = customTokenDetails.address.toLowerCase() === poolData.token1.address.toLowerCase();

            let quotes: {
                token0Quote?: string;
                token1Quote?: string;
                otherTokenQuote?: string;
            } = {};

            if (isToken0 || isToken1) {
                // If typed token is one of the pool tokens
                const otherToken = isToken0 ? poolData.token1 : poolData.token0;

                // Convert pool token to match Token interface
                const otherTokenFormatted: Token = {
                    ...otherToken,
                    decimals: Number(otherToken.decimals),
                };

                // Get quote for typed token as input and other token as output
                const quote = await getTokenPriceQuote(
                    privyWallets[0],
                    customTokenDetails,
                    otherTokenFormatted,
                    Number(poolData.feeTier),
                    halfInvestment
                );

                const path = quote.path;
                const amountOut = quote.amountOut;

                // Atribuir amountOut a quotes.otherTokenQuote para exibição
                quotes.otherTokenQuote = amountOut;

                const startSwapParams: StartSwapParams = {
                    totalAmountIn: fromReadableAmount(Number(investmentAmount), customTokenDetails.decimals).toString(),
                    payload: {
                        path: path,
                        amountInForInputToken: fromReadableAmount(Number(halfInvestment), customTokenDetails.decimals).toString(),
                        deadline: "0",
                    },
                    stakePayload: {
                        token0: customTokenDetails.address,
                        token1: otherToken.address,
                        fee: Number(poolData.feeTier),
                        tickLower: tickValues.minTick,
                        tickUpper: tickValues.maxTick,
                        amount0Desired: fromReadableAmount(halfInvestment, Number(otherToken.decimals)).toString(),
                        amount1Desired: (
                            BigInt(fromReadableAmount(Number(amountOut), Number(otherToken.decimals))) *
                            BigInt(85) /
                            BigInt(100)
                        ).toString(), // Slippage 15%
                        amount0Min: "0",
                        amount1Min: "0",
                        recipient: privyWallets[0].address,
                        deadline: (Math.floor(Date.now() / 1000) + 900).toString(),
                    },
                };

                await checkAndExecuteApprovalAndWait(
                    customTokenDetails.address,
                    fromReadableAmount(Number(investmentAmount), customTokenDetails.decimals).toString(),
                    privyWallets[0]
                );

                const tx = await startSwapAndWait(privyWallets[0], startSwapParams);
                console.log("Swap transaction:", tx);
            } else {
                // If typed token is not one of the pool tokens
                const token0Formatted: Token = {
                    ...poolData.token0,
                    decimals: Number(poolData.token0.decimals),
                };
                const token1Formatted: Token = {
                    ...poolData.token1,
                    decimals: Number(poolData.token1.decimals),
                };

                // Get quotes for both tokens
                const quoteToken0 = await getTokenPriceQuote(
                    privyWallets[0],
                    customTokenDetails,
                    token0Formatted,
                    Number(poolData.feeTier),
                    halfInvestment
                );

                const quoteToken1 = await getTokenPriceQuote(
                    privyWallets[0],
                    customTokenDetails,
                    token1Formatted,
                    Number(poolData.feeTier),
                    halfInvestment
                );

                quotes.token0Quote = quoteToken0.amountOut;
                quotes.token1Quote = quoteToken1.amountOut;
                console.log(`Quote for ${customTokenDetails.symbol} to ${poolData.token0.symbol}:`, quoteToken0);
                console.log(`Quote for ${customTokenDetails.symbol} to ${poolData.token1.symbol}:`, quoteToken1);
            }

            setInvestmentQuotes(quotes);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to calculate investment quotes");
            console.error("Error calculating investment quotes:", err);
            setInvestmentQuotes(null);
        } finally {
            setLoadingQuotes(false);
        }
    };

    const handleInvestmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        investInPool();
    };

    const calculateSplitAmounts = async (amount: string) => {
        if (!amount.trim() || !customTokenDetails || !poolData || !ready || privyWallets.length === 0) {
            setSplitAmounts(null);
            return;
        }

        try {
            const investmentValue = parseFloat(amount);
            if (isNaN(investmentValue) || investmentValue <= 0) {
                setSplitAmounts(null);
                return;
            }

            // 1. Calcular o valor total em USD do investimento
            const totalUSDValue = investmentValue * parseFloat(customTokenUSDPrice || '0');
            const halfUSDValue = totalUSDValue / 2;

            // 2. Verificar se o token de entrada é um dos tokens da pool
            const isToken0 = customTokenDetails.address.toLowerCase() === poolData.token0.address.toLowerCase();
            const isToken1 = customTokenDetails.address.toLowerCase() === poolData.token1.address.toLowerCase();

            if (isToken0 || isToken1) {
                // Caso 1: O token de entrada é um dos tokens da pool
                const stayToken = isToken0 ? poolData.token0 : poolData.token1;
                const swapToken = isToken0 ? poolData.token1 : poolData.token0;
                const stayTokenPrice = isToken0 ? token0Price : token1Price;
                const swapTokenPrice = isToken0 ? token1Price : token0Price;

                // 3. Calcular quanto do token de entrada manter (em quantidade)
                const stayAmount = investmentValue / 2;
                const stayUSDValue = stayAmount * parseFloat(stayTokenPrice || '0');

                // 4. Calcular quanto do outro token precisamos para igualar o valor USD
                const swapAmountUSD = halfUSDValue;
                const swapAmount = swapAmountUSD / parseFloat(swapTokenPrice || '1');

                setSplitAmounts({
                    token0Amount: isToken0 ? stayAmount.toString() : swapAmount.toString(),
                    token1Amount: isToken1 ? stayAmount.toString() : swapAmount.toString(),
                    token0USDValue: isToken0 ? stayUSDValue.toString() : swapAmountUSD.toString(),
                    token1USDValue: isToken1 ? stayUSDValue.toString() : swapAmountUSD.toString()
                });
            } else {
                // Caso 2: O token de entrada não é um dos tokens da pool
                // 5. Dividir igualmente em USD e converter para cada token
                const token0Amount = halfUSDValue / parseFloat(token0Price || '1');
                const token1Amount = halfUSDValue / parseFloat(token1Price || '1');

                setSplitAmounts({
                    token0Amount: token0Amount.toString(),
                    token1Amount: token1Amount.toString(),
                    token0USDValue: halfUSDValue.toString(),
                    token1USDValue: halfUSDValue.toString()
                });
            }
        } catch (err) {
            console.error("Error calculating split amounts:", err);
            setSplitAmounts(null);
        }
    };

    useEffect(() => {
        const loadPoolData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchPoolById();
                setPoolData(data);
                console.log('Pool data loaded:', data);
                console.log('Wallets:', privyWallets);
                console.log('Ready:', ready);
                if (ready) {
                    const provider = await privyWallets[0].getEthereumProvider();
                    const tickValuesData = await calculateTickValues(provider, data.address);
                    setTickValues(tickValuesData);
                    console.log('Tick values:', tickValuesData);
                    const token0PriceData = await getUSDPrice(privyWallets[0], data.token0, data.feeTier);
                    const token1PriceData = await getUSDPrice(privyWallets[0], data.token1, data.feeTier);
                    setToken0Price(token0PriceData);
                    setToken1Price(token1PriceData);
                    console.log('Token0 price:', token0PriceData);
                    console.log('Token1 price:', token1PriceData);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch pool data');
                console.error('Error loading pool data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPoolData();
    }, [id, ready]);

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-12 bg-gray-50">
            {loading && <div className="text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-sky-600 mx-auto mb-4"></div>
                {/* <span className="text-sm font-medium text-gray-700">Loading pool...</span> */}
            </div>}

            {error && (
                <div style={{ color: 'red', margin: '10px 0' }}>
                    Error: {error}
                </div>
            )}

            <Link to="/dashboard/pools" className="flex items-center text-sky-600 hover:underline mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Pools
            </Link>

            {poolData && (
                <div className="bg-white rounded-xl shadow-sm border-t-2 border-sky-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-2 pt-2">
                            <h1 className="text-xl font-bold text-gray-900 ml-4">Start Investing</h1>

                            <div className="space-y-2">
                                <div className='px-4'>
                                    <p className="text-sm text-gray-500">Token Pair</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {poolData.token0.symbol}/{poolData.token1.symbol}
                                    </p>
                                </div>

                                <div className='px-4'>
                                    <p className="text-sm text-gray-500">Fee Tier</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {(parseFloat(poolData.feeTier) / 10000).toFixed(2)}%
                                    </p>
                                </div>

                                {/* <p><strong>Pool ID:</strong> {poolData._id}</p>
                <p><strong>Pool Address:</strong> {poolData.address}</p>

                <p><strong>Token0:</strong> {poolData.token0.name} ({poolData.token0.symbol}) - {poolData.token0.decimals} decimals</p>
                <p><strong>Token1:</strong> {poolData.token1.name} ({poolData.token1.symbol}) - {poolData.token1.decimals} decimals</p>
                <p><strong>Created:</strong> {new Date(parseInt(poolData.createdAtTimestamp) * 1000).toLocaleString()}</p> */}

                                {poolData.poolDayData.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <h4 className="font-semibold text-gray-900">Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Total TVL</span>
                                                <p className="font-semibold">${poolData.poolDayData.slice(0, 3).reduce((sum, dayData) => sum + parseFloat(dayData.tvlUSD), 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total Volume</span>
                                                <p className="font-semibold">${poolData.poolDayData.slice(0, 3).reduce((sum, dayData) => sum + parseFloat(dayData.volumeUSD), 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total Fees</span>
                                                <p className="font-semibold">${poolData.poolDayData.slice(0, 3).reduce((sum, dayData) => sum + parseFloat(dayData.feesUSD), 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Avg APR</span>
                                                <p className="font-semibold text-green-600">{(poolData.poolDayData.slice(0, 3).reduce((sum, dayData) => sum + parseFloat(dayData.apr24h), 0) / poolData.poolDayData.slice(0, 3).length).toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-semibold text-gray-900">Current Prices</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {token0Price !== null && (
                                            <div>
                                                <span className="text-gray-500">{poolData.token0.symbol} Price</span>
                                                <p className="font-semibold">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(token0Price))}
                                                </p>
                                            </div>
                                        )}
                                        {token1Price !== null && (
                                            <div>
                                                <span className="text-gray-500">{poolData.token1.symbol} Price</span>
                                                <p className="font-semibold">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(token1Price))}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            {/* <h3 className="text-lg font-semibold text-gray-900">Custom Token Information</h3> */}
                            <form onSubmit={handleTokenAddressSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Input Token Address from Your Wallet
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tokenAddress}
                                            onChange={(e) => setTokenAddress(e.target.value)}
                                            placeholder="Enter token address (0x...)"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!tokenAddress.trim() || !ready || loadingTokenInfo}
                                            className="bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                                        >
                                            {loadingTokenInfo ? 'Loading...' : 'Insert Token Address'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {(tickValues || token0Price !== null || token1Price !== null || customTokenDetails || customTokenBalance !== null || investmentQuotes) && (
                                <div className="rounded-lg mt-4">
                                    {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Output Values</h3> */}

                                    <div className="">
                                        {/* {tickValues && (
                                            <div className="col-span-full">
                                                <h4 className="font-medium text-gray-900 mb-2">Tick Values:</h4>
                                                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
                                                    {JSON.stringify(tickValues, null, 2)}
                                                </pre>
                                            </div>
                                        )} */}

                                        {(customTokenDetails || customTokenBalance !== null) && (
                                            <div className="bg-gray-50 rounded-lg p-4 w-full">
                                                {customTokenBalance !== null && (
                                                    <div className='flex flex-col items-end'>
                                                        <span className="text-gray-500">Balance</span>
                                                        <p className="font-semibold text-right">
                                                            {parseFloat(customTokenBalance).toLocaleString()} {customTokenDetails?.symbol || 'tokens'}
                                                            {customTokenUSDPrice !== null && (
                                                                <span className="block text-sm font-semibold text-gray-600">
                                                                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                                                                        parseFloat(customTokenBalance) * parseFloat(customTokenUSDPrice)
                                                                    )}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}


                                        {/* Investment Quotes Display */}
                                        {/* {investmentQuotes && (
                                            <div>
                                                <h4>Investment Quotes:</h4>
                                                <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                                    {investmentQuotes.otherTokenQuote && (
                                                        <p><strong>Quote for {investmentAmount} {customTokenDetails?.symbol} → {parseFloat(investmentQuotes.otherTokenQuote).toFixed(Number(poolData?.token1.decimals) || 18)} {poolData?.token1.symbol}</strong></p>
                                                    )}
                                                    {investmentQuotes.token0Quote && (
                                                        <p><strong>Quote for {investmentAmount} {customTokenDetails?.symbol} → {parseFloat(investmentQuotes.token0Quote).toFixed(Number(poolData?.token0.decimals) || 18)} {poolData?.token0.symbol}</strong></p>
                                                    )}
                                                    {investmentQuotes.token1Quote && (
                                                        <p><strong>Quote for {investmentAmount} {customTokenDetails?.symbol} → {parseFloat(investmentQuotes.token1Quote).toFixed(Number(poolData?.token1.decimals) || 18)} {poolData?.token1.symbol}</strong></p>
                                                    )}
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            )}

                            {/* Investment Amount Input - Only show if token details are loaded */}
                            {customTokenDetails && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Investment Amount ({customTokenDetails.symbol})</h4>
                                    <form onSubmit={handleInvestmentSubmit} className="space-y-4">
                                        <div>
                                            {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount in
                                            </label> */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={investmentAmount}
                                                    onChange={(e) => {
                                                        setInvestmentAmount(e.target.value);
                                                        calculateSplitAmounts(e.target.value);
                                                    }}
                                                    placeholder={`Enter amount in ${customTokenDetails.symbol}`}
                                                    step="any"
                                                    min="0"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                                />
                                                <button
                                                    type="submit"
                                                    className='bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 cursor-pointer'
                                                    disabled={!investmentAmount.trim() || !ready || loadingQuotes}
                                                >
                                                    {loadingQuotes ? 'Investing...' : 'Invest Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {splitAmounts && (
                                <div className="mt-6 rounded-lg shadow-sm">
                                    <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
                                        <h3 className="text-lg font-semibold text-gray-900">Investment Summary</h3>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {/* Token Pair and Total Investment */}
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Token Pair</p>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {poolData?.token0.symbol}/{poolData?.token1.symbol}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-500">Total Investment</p>
                                                <p className="text-lg font-bold text-sky-600">
                                                    ${(parseFloat(investmentAmount || '0') * parseFloat(customTokenUSDPrice || '0')).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Allocation Breakdown */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Allocation Breakdown</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Token 0 Allocation */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">{poolData?.token0.symbol}</p>
                                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                                {parseFloat(splitAmounts?.token0Amount || '0').toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 6
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded-md text-xs font-medium">
                                                            ${parseFloat(splitAmounts?.token0USDValue || '0').toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-sky-500"
                                                                style={{ width: '50%' }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Token 1 Allocation */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">{poolData?.token1.symbol}</p>
                                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                                {parseFloat(splitAmounts?.token1Amount || '0').toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 6
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded-md text-xs font-medium">
                                                            ${parseFloat(splitAmounts?.token1USDValue || '0').toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-sky-500"
                                                                style={{ width: '50%' }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Details */}
                                        {/* <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Fee Tier</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {(parseFloat(poolData?.feeTier || '0') / 10000).toFixed(2)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Price Range</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {tickValues ? `${tickValues.minPrice} - ${tickValues.maxPrice}` : 'Loading...'}
                                                </p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            )}
        </div>
    )
}

export default NewPositionV3;

import React, { useState } from 'react';
import Button from '../ui/button';

interface Token {
    symbol: string;
    balance: string;
    decimals: number;
    address?: string;
}

interface InvestmentFormProps {
    token0Symbol: string;
    token1Symbol: string;
    onInvest: () => Promise<void>;
}

export const InvestmentForm = ({ token0Symbol, token1Symbol, onInvest }: InvestmentFormProps) => {
    // Mock data
    const [tokenAddressInput, setTokenAddressInput] = useState<string>('');
    const [validToken, setValidToken] = useState<Token | null>(null);
    const [investmentAmount, setInvestmentAmount] = useState<string>('');
    const [amount0, setAmount0] = useState<string>('0');
    const [amount1, setAmount1] = useState<string>('0');
    const [isInvesting, setIsInvesting] = useState(false);

    const handleTokenAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = e.target.value.trim();
        setTokenAddressInput(address);

        // Reset investment amount when address changes
        setInvestmentAmount('');
        setAmount0('0');
        setAmount1('0');

        // Mock validation - in a real app this would check against wallet balances
        if (address === '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238') {
            setValidToken({
                symbol: 'USDC',
                balance: '100.00',
                decimals: 6,
                address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'
            });
        } else if (address === '0x0000000000000000000000000000000000000000') {
            setValidToken({
                symbol: 'ETH',
                balance: '0.5',
                decimals: 18
            });
        } else {
            setValidToken(null);
        }
    };

    const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInvestmentAmount(value);

        // Mock calculation - in a real app this would use real price data
        if (value && parseFloat(value) > 0) {
            setAmount0((parseFloat(value) * 0.0364).toFixed(4));
            setAmount1((parseFloat(value) * 0.0001).toFixed(4));
        } else {
            setAmount0('0');
            setAmount1('0');
        }
    };

    const formatUSDBalance = (symbol: string, balance: string): string => {
        // Mock conversion - in a real app this would use real price data
        const conversionRates: Record<string, number> = {
            USDC: 1,
            USDT: 1,
            DAI: 1,
            ETH: 1800,
            WETH: 1800,
            WBTC: 42000
        };

        const rate = conversionRates[symbol] || 1;
        const usdValue = parseFloat(balance) * rate;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(usdValue);
    };

    const handleInvest = async () => {
        setIsInvesting(true);
        try {
            await onInvest();
        } finally {
            setIsInvesting(false);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Investment amounts</h2>

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

            {(validToken && (parseFloat(amount0) > 0 || parseFloat(amount1) > 0)) && (
                <>
                    <h2 className="text-md font-semibold text-gray-900 mb-4">Investment Summary</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {token0Symbol} Amount
                            </label>
                            <input
                                type="number"
                                value={amount0}
                                onChange={(e) => setAmount0(e.target.value)}
                                disabled
                                placeholder="0.0"
                                step="any"
                                min="0"
                                className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount0) * 1800)}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {token1Symbol} Amount
                            </label>
                            <input
                                type="number"
                                value={amount1}
                                onChange={(e) => setAmount1(e.target.value)}
                                disabled
                                placeholder="0.0"
                                step="any"
                                min="0"
                                className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount1) * 42000)}
                            </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md border border-sky-500">
                            <p className="text-sm text-gray-600">Total Investment Value</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(parseFloat(amount0) * 1800 + parseFloat(amount1) * 42000)}
                            </p>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!amount0 || !amount1 || isInvesting}
                                onClick={handleInvest}
                            >
                                {isInvesting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Invest Now'
                                )}
                            </Button>

                            {(!amount0 || !amount1) && (
                                <p className="text-sm text-gray-500 text-center">
                                    Enter amounts to proceed
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
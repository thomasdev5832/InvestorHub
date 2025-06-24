import React, { useState, useEffect } from 'react';
import { fetchTokenPriceInUSDT } from '../../utils/fetchTokenPrice';

interface TokenPriceDisplayProps {
    tokenAddress: string;
    tokenSymbol: string;
    tokenDecimals: number;
    feeTiers?: number[];
}

const TokenPriceDisplay: React.FC<TokenPriceDisplayProps> = ({
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    feeTiers = [100, 500, 3000, 10000],
}) => {
    const [price, setPrice] = useState<number | null>(null);
    const [feeTierUsed, setFeeTierUsed] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            setLoading(true);
            setError(null);

            const result = await fetchTokenPriceInUSDT(tokenAddress, tokenSymbol, tokenDecimals, feeTiers);

            if (result.error) {
                setError(result.error);
                setPrice(null);
                setFeeTierUsed(null);
            } else {
                const validatedPrice = result.priceInUSD;

                if (validatedPrice > 10000000) {
                    setError(`Price calculation error for ${tokenSymbol}: ${validatedPrice.toExponential(2)}`);
                    setPrice(null);
                    setFeeTierUsed(null);
                } else {
                    setPrice(validatedPrice);
                    setFeeTierUsed(result.feeTier);
                }
            }
            setLoading(false);
        };

        fetchPrice();
    }, [tokenAddress, tokenSymbol, tokenDecimals, feeTiers]);

    const formatPrice = (price: number): string => {
        if (price < 0.000001 && price > 0) {
            return price.toExponential(4);
        }
        else if (price < 0.01) {
            return price.toFixed(6);
        }
        else {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{tokenSymbol} Price</h3>
            {loading ? (
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-600"></div>
                    <span className="text-sm text-gray-500">Loading price...</span>
                </div>
            ) : error ? (
                <div className="space-y-1">
                    <p className="text-sm text-red-500">Price unavailable</p>
                    <p className="text-xs text-gray-400">{error}</p>
                </div>
            ) : price !== null ? (
                <div>
                    <p className="text-lg font-medium text-gray-900">
                        ${formatPrice(price)}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-gray-600">Price unavailable</p>
            )}
        </div>
    );
};

export default TokenPriceDisplay;
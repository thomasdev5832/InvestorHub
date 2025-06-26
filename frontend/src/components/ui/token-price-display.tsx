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

                // REMOVIDA A VALIDAÇÃO DE PREÇO ALTO AQUI
                // if (validatedPrice > 10000000) {
                //     setError(`Price calculation error for ${tokenSymbol}: ${validatedPrice.toExponential(2)}`);
                //     setPrice(null);
                //     setFeeTierUsed(null);
                // } else {
                setPrice(validatedPrice);
                setFeeTierUsed(result.feeTier);
                // }
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
            // Ajustado para permitir mais casas decimais para valores muito grandes,
            // ou você pode querer usar toExponential para valores muito grandes.
            // Para manter a formatação original para valores "normais", mas permitir grandes,
            // vamos usar Intl.NumberFormat com maxFractionDigits maior ou toFixed para grandes.
            if (price > 1000000) { // Exemplo: se o preço for muito grande, use notação científica ou mais casas
                return price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 // Ou aumente para 4, 6, etc., ou use toExponential
                });
            }
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-600 mb-2">{tokenSymbol} Price</h3>
            {loading ? (
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-600"></div>
                    <span className="text-sm text-gray-500">Loading price...</span>
                </div>
            ) : error ? (
                <div className="space-y-1">
                    <p className="text-md text-red-500">Price unavailable</p>
                    <p className="text-md text-gray-400">{error}</p>
                </div>
            ) : price !== null ? (
                <div>
                    <p className="text-xl font-medium text-gray-900">
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

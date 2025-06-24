import React, { useState, useEffect } from 'react';
import { fetchTokenPriceInUSDT } from '../../utils/fetchTokenPrice'; interface TokenPriceDisplayProps {
    tokenAddress: string;
    tokenSymbol: string;
    tokenDecimals: number;
    feeTiers?: number[];
}const TokenPriceDisplay: React.FC<TokenPriceDisplayProps> = ({
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    feeTiers = [100, 500, 3000, 10000],
}) => {
    const [price, setPrice] = useState<number | null>(null);
    const [feeTierUsed, setFeeTierUsed] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); useEffect(() => {
        const fetchPrice = async () => {
            setLoading(true);
            setError(null);

            const result = await fetchTokenPriceInUSDT(tokenAddress, tokenSymbol, tokenDecimals, feeTiers);

            if (result.error) {
                setError(result.error);
                setPrice(null);
                setFeeTierUsed(null);
            } else {
                // Validação adicional para preços irreais
                const validatedPrice = result.priceInUSD;

                // Se o preço for muito alto (provavelmente erro de cálculo), marcar como erro
                if (validatedPrice > 10000000) { // Mais de 10 milhões de dólares
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

    // Função para formatar o preço de forma inteligente
    const formatPrice = (price: number): string => {
        // Para valores muito pequenos (menor que 0.000001)
        if (price < 0.000001 && price > 0) {
            return price.toExponential(4);
        }
        // Para valores pequenos (menor que 0.01)
        else if (price < 0.01) {
            return price.toFixed(8);
        }
        // Para valores pequenos a médios (menor que 1)
        else if (price < 1) {
            return price.toFixed(6);
        }
        // Para valores médios (1 a 999)
        else if (price < 1000) {
            return price.toFixed(4);
        }
        // Para valores altos (1000 a 999,999)
        else if (price < 1000000) {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        }
        // Para valores muito altos
        else {
            return new Intl.NumberFormat('en-US', {
                notation: 'compact',
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
                        ${formatPrice(price)} USD
                    </p>
                    {/* {feeTierUsed && (
                        <p className="text-xs text-gray-500">
                            Fee Tier: {(feeTierUsed / 10000).toFixed(2)}%
                        </p>
                    )} */}
                </div>
            ) : (
                <p className="text-sm text-gray-600">Price unavailable</p>
            )}
        </div>
    );
}; export default TokenPriceDisplay;


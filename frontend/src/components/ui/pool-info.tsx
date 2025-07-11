import TokenPriceDisplay from '../ui/token-price-display';

interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    network: {
        name: string;
    };
}

interface PoolInfoProps {
    token0: Token;
    token1: Token;
    feeTier: string;
}

export const PoolInfo = ({ token0, token1, feeTier }: PoolInfoProps) => {
    const feeTierPercentage = (Number(feeTier) / 10000).toFixed(2) + '%';

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-500">Token Pair</p>
                <p className="text-xl font-bold text-gray-800">
                    {token0.symbol}/{token1.symbol}
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fee Tier</p>
                <p className="text-sm font-medium text-gray-900">{feeTierPercentage}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Network</p>
                <p className="text-sm font-medium text-gray-900">{token0.network.name}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm text-gray-500">Current Prices</p>
                <TokenPriceDisplay
                    tokenAddress={token0.address}
                    tokenSymbol={token0.symbol}
                    tokenDecimals={token0.decimals}
                    feeTiers={[100, 500, 3000, 10000]}
                    mockPrice={2442.09}
                />
                <TokenPriceDisplay
                    tokenAddress={token1.address}
                    tokenSymbol={token1.symbol}
                    tokenDecimals={token1.decimals}
                    feeTiers={[100, 500, 3000, 10000]}
                    mockPrice={13.44}
                />
            </div>
        </div>
    );
};
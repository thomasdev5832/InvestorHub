import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Crosshair, Rocket, ArrowRight } from 'lucide-react';
import Button from './button';

// Interface for pool data (aligned with the Pools component)
interface Token {
    id: string;
    symbol: string;
}

interface PoolDayData {
    date: number;
    feesUSD: string;
    volumeUSD: string;
    tvlUSD: string;
    apr24h: string;
}

interface PoolCardProps {
    feeTier: string;
    token0: Token;
    token1: Token;
    createdAtTimestamp: string;
    poolDayData: PoolDayData[];
    network?: string;
    index: number;
}

const PoolCard: React.FC<PoolCardProps> = ({
    feeTier,
    token0,
    token1,
    poolDayData,
    network,
    index,
}) => {
    // Get the most recent day's data
    const latestData = poolDayData.sort((a, b) => b.date - a.date)[0];
    const apr = latestData?.apr24h ? `${latestData.apr24h}%` : 'N/A';
    const tvl = latestData?.tvlUSD
        ? `$${Number(latestData.tvlUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : 'N/A';
    const volume = latestData?.volumeUSD
        ? `$${Number(latestData.volumeUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : 'N/A';

    // Derive risk level based on fee tier
    const riskLevel = feeTier === '100' ? 'High' : feeTier === '500' ? 'Medium' : 'Low';

    // Assign icon based on fee tier
    const icon = feeTier === '100' ? (
        <Rocket size={24} className="text-sky-600" />
    ) : feeTier === '500' ? (
        <Crosshair size={24} className="text-sky-600" />
    ) : (
        <Shield size={24} className="text-sky-600" />
    );

    // Convert fee tier to percentage
    const feeTierPercentage = (Number(feeTier) / 10000).toFixed(2) + '%';

    // Create title and description
    const title = `${token0.symbol}/${token1.symbol} (${feeTierPercentage})`;
    const description = `Liquidity pool for ${token0.symbol} and ${token1.symbol} with a ${feeTierPercentage} fee tier.`;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-sky-400 transition-all duration-300 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                {network && (
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                        {network === 'Ethereum Mainnet' ? 'ETH' : network === 'Base Mainnet' ? 'BASE' : network}
                    </span>
                )}
            </div>

            <p className="text-gray-600 text-sm mb-4">{description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <span className="text-gray-500">APR:</span>{' '}
                    <span className="font-bold text-sky-600">{apr}</span>
                </div>
                <div>
                    <span className="text-gray-500">Risk:</span>{' '}
                    <span
                        className={`font-medium ${riskLevel === 'Low'
                                ? 'text-green-600'
                                : riskLevel === 'Medium'
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                            }`}
                    >
                        {riskLevel}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500">TVL:</span>{' '}
                    <span className="font-medium">{tvl}</span>
                </div>
                <div>
                    <span className="text-gray-500">Volume (24h):</span>{' '}
                    <span className="font-medium">{volume}</span>
                </div>
            </div>

            <div className="mt-auto">
                <Link to={`/dashboard/pool/${index}`} className="w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        icon={<ArrowRight size={14} />}
                    >
                        Explore
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default PoolCard;
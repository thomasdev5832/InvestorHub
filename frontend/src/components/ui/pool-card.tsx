import React from 'react';
import { Link } from 'react-router-dom';
import Button from './button';
import { ArrowRight } from 'lucide-react';

interface PoolCardProps {
    title: string;
    description: string;
    apr: string;
    riskLevel: string;
    icon: React.ReactNode;
    featured?: boolean;
    chains: string[];
    algorithmScore: number;
    index: number;
    tvl: string;
    volume: string;
}

const PoolCard: React.FC<PoolCardProps> = ({
    title,
    description,
    apr,
    riskLevel,
    icon,
    featured,
    chains,
    algorithmScore,
    index,
    tvl,
    volume,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-sky-400 transition-all duration-300 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                {featured && (
                    <span className="bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-full">FEATURED</span>
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
                        className={`font-medium ${riskLevel === 'Low' ? 'text-green-600' : riskLevel === 'Medium' ? 'text-amber-600' : 'text-red-600'
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
                <div>
                    <span className="text-gray-500">Score:</span>{' '}
                    <span className="font-medium">{algorithmScore.toFixed(1)}/5</span>
                </div>
                <div>
                    <span className="text-gray-500">Chains:</span>{' '}
                    <span className="font-medium">{chains.join(', ')}</span>
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
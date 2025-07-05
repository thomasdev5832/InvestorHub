import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { InvestmentForm } from '../components/ui/investment-form';
import TokenPriceDisplay from '../components/ui/token-price-display';

const NewPositionLayout: React.FC = () => {

    // Mock data
    const pool = {
        token0: {
            symbol: 'WETH',
            name: 'Wrapped Ether',
            address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            decimals: 18,
            network: {
                id: '1',
                name: 'Sepolia',
                graphqlUrl: ''
            }
        },
        token1: {
            symbol: 'WBTC',
            name: 'Wrapped Bitcoin',
            address: '0x29f2d40b0605204364af54ec677bd022da425d03',
            decimals: 8,
            network: {
                id: '1',
                name: 'Sepolia',
                graphqlUrl: ''
            }
        },
        feeTier: '3000',
        createdAtTimestamp: '1234567890',
        poolDayData: []
    };

    const handleInvestNow = async () => {
        // Simulate investment
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Investment simulated successfully!');
    };

    const feeTierPercentage = (Number(pool.feeTier) / 10000).toFixed(2) + '%';

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
                                tokenDecimals={pool.token0.decimals}
                                feeTiers={[100, 500, 3000, 10000]}
                                mockPrice={1800}
                            />
                            <TokenPriceDisplay
                                tokenAddress={pool.token1.address}
                                tokenSymbol={pool.token1.symbol}
                                tokenDecimals={pool.token1.decimals}
                                feeTiers={[100, 500, 3000, 10000]}
                                mockPrice={42000}
                            />
                        </div>
                    </div>

                    <InvestmentForm
                        token0Symbol={pool.token0.symbol}
                        token1Symbol={pool.token1.symbol}
                        onInvest={handleInvestNow}
                    />
                </div>
            </div>
        </div>
    );
};

export default NewPositionLayout;
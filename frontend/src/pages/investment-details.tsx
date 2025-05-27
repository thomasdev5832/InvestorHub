import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Aperture,
    Network,
    Shield,
    Crosshair,
    Rocket,
    Info,
} from 'lucide-react';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Button from '../components/ui/button';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Interface for investment data
interface Investment {
    title: string;
    description: string;
    apr: string;
    aprRange: [number, number];
    riskLevel: 'Low' | 'Medium' | 'High';
    icon: React.ReactNode;
    chains: string[];
    algorithmScore: number;
    lockupPeriod: string;
    minInvestment: string;
    fees: string;
    liquidity: string;
    security: string[];
    tvl: string;
    historicalReturns: { [key: string]: number[] };
}

// Complete mock data for all investments
const investmentsData: Investment[] = [
    {
        title: 'Everest',
        description: 'Unshakable. Built for those who seek steady, unstoppable growth.',
        apr: '12-16%',
        aprRange: [12, 16],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Arbitrum', 'Optimism'],
        algorithmScore: 4.7,
        lockupPeriod: '3 months',
        minInvestment: '$500',
        fees: '0.5% annual management fee',
        liquidity: 'Monthly withdrawals',
        security: ['Audited by Certik', 'Multi-sig treasury', 'Bug bounty program'],
        tvl: '$89.2M',
        historicalReturns: {
            '1m': [100, 102, 105, 106],
            '3m': [100, 102, 105, 106, 108, 110, 112],
            '6m': [100, 102, 105, 106, 108, 110, 112, 115, 118, 120, 122, 125],
        },
    },
    {
        title: 'Equilibrium',
        description: 'Perfect harmony between security and performance. Designed for momentum.',
        apr: '18-25%',
        aprRange: [18, 25],
        riskLevel: 'Medium',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Solana', 'Polygon', 'Avalanche', 'Base'],
        algorithmScore: 4.9,
        lockupPeriod: '1 month',
        minInvestment: '$1,000',
        fees: '0.8% annual management fee',
        liquidity: 'Weekly withdrawals',
        security: ['Audited by OpenZeppelin', 'Insured up to $5M', '99.98% uptime'],
        tvl: '$124.5M',
        historicalReturns: {
            '1m': [100, 104, 108, 110],
            '3m': [100, 104, 108, 110, 115, 118, 120],
            '6m': [100, 104, 108, 110, 115, 118, 120, 125, 130, 135, 140, 145],
        },
    },
    {
        title: 'Liftoff',
        description: 'Unleash potential. High risk, high reward. No limits. No fear.',
        apr: '25-40%',
        aprRange: [25, 40],
        riskLevel: 'High',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Starknet', 'Sui', 'Aptos', 'Sei'],
        algorithmScore: 4.2,
        lockupPeriod: '6 months',
        minInvestment: '$2,000',
        fees: '1.2% annual management fee',
        liquidity: 'Bi-weekly withdrawals',
        security: ['Audited by Trail of Bits', 'Bug bounty program', '99.95% uptime'],
        tvl: '$56.8M',
        historicalReturns: {
            '1m': [100, 108, 115, 120],
            '3m': [100, 108, 115, 120, 125, 130, 135],
            '6m': [100, 108, 115, 120, 125, 130, 135, 140, 150, 160, 170, 180],
        },
    },
    {
        title: 'Surge',
        description: 'Ride the next wave of opportunity. Dynamic, fast, unstoppable.',
        apr: '20-30%',
        aprRange: [20, 30],
        riskLevel: 'Medium',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Binance Smart Chain', 'Fantom', 'Harmony'],
        algorithmScore: 4.5,
        lockupPeriod: '2 months',
        minInvestment: '$1,500',
        fees: '0.9% annual management fee',
        liquidity: 'Weekly withdrawals',
        security: ['Audited by Quantstamp', 'Multi-sig treasury', '99.97% uptime'],
        tvl: '$78.3M',
        historicalReturns: {
            '1m': [100, 103, 107, 109],
            '3m': [100, 103, 107, 109, 112, 115, 118],
            '6m': [100, 103, 107, 109, 112, 115, 118, 122, 127, 130, 135, 140],
        },
    },
    {
        title: 'Aegis',
        description: 'The ultimate shield. Stability you can trust. Strength you can build on.',
        apr: '8-12%',
        aprRange: [8, 12],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Polygon', 'Optimism'],
        algorithmScore: 4.8,
        lockupPeriod: '4 months',
        minInvestment: '$300',
        fees: '0.4% annual management fee',
        liquidity: 'Monthly withdrawals',
        security: ['Audited by Certik', 'Insured up to $10M', 'Bug bounty program'],
        tvl: '$95.7M',
        historicalReturns: {
            '1m': [100, 101, 103, 104],
            '3m': [100, 101, 103, 104, 106, 108, 110],
            '6m': [100, 101, 103, 104, 106, 108, 110, 112, 114, 116, 118, 120],
        },
    },
    {
        title: 'Frontier',
        description: 'Where innovation meets opportunity. Designed for pioneers.',
        apr: '30-50%',
        aprRange: [30, 50],
        riskLevel: 'High',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Aptos', 'Sui', 'Sei', 'Scroll'],
        algorithmScore: 4.0,
        lockupPeriod: '6 months',
        minInvestment: '$3,000',
        fees: '1.5% annual management fee',
        liquidity: 'Monthly withdrawals',
        security: ['Audited by OpenZeppelin', 'Bug bounty program', '99.94% uptime'],
        tvl: '$42.1M',
        historicalReturns: {
            '1m': [100, 110, 120, 125],
            '3m': [100, 110, 120, 125, 130, 140, 150],
            '6m': [100, 110, 120, 125, 130, 140, 150, 160, 170, 180, 190, 200],
        },
    },
    {
        title: 'Vortex',
        description: 'A whirlwind of returns. Fast-paced and thrilling.',
        apr: '22-35%',
        aprRange: [22, 35],
        riskLevel: 'High',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Avalanche', 'Fantom', 'Sei'],
        algorithmScore: 4.3,
        lockupPeriod: '3 months',
        minInvestment: '$2,500',
        fees: '1.0% annual management fee',
        liquidity: 'Bi-weekly withdrawals',
        security: ['Audited by Trail of Bits', 'Multi-sig treasury', '99.96% uptime'],
        tvl: '$67.4M',
        historicalReturns: {
            '1m': [100, 105, 110, 115],
            '3m': [100, 105, 110, 115, 120, 125, 130],
            '6m': [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
        },
    },
    {
        title: 'Anchor',
        description: 'Solid ground in a volatile world. Built for resilience.',
        apr: '10-14%',
        aprRange: [10, 14],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Arbitrum', 'Base'],
        algorithmScore: 4.6,
        lockupPeriod: '3 months',
        minInvestment: '$400',
        fees: '0.6% annual management fee',
        liquidity: 'Monthly withdrawals',
        security: ['Audited by Quantstamp', 'Insured up to $8M', 'Bug bounty program'],
        tvl: '$82.6M',
        historicalReturns: {
            '1m': [100, 101, 102, 103],
            '3m': [100, 101, 102, 103, 105, 107, 109],
            '6m': [100, 101, 102, 103, 105, 107, 109, 111, 113, 115, 117, 119],
        },
    },
    {
        title: 'Pulse',
        description: 'Feel the beat of the market. Dynamic and adaptive.',
        apr: '15-22%',
        aprRange: [15, 22],
        riskLevel: 'Medium',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Solana', 'Polygon', 'Optimism'],
        algorithmScore: 4.4,
        lockupPeriod: '2 months',
        minInvestment: '$800',
        fees: '0.7% annual management fee',
        liquidity: 'Weekly withdrawals',
        security: ['Audited by Certik', 'Multi-sig treasury', '99.97% uptime'],
        tvl: '$91.3M',
        historicalReturns: {
            '1m': [100, 102, 106, 108],
            '3m': [100, 102, 106, 108, 111, 114, 117],
            '6m': [100, 102, 106, 108, 111, 114, 117, 120, 123, 126, 129, 132],
        },
    },
    {
        title: 'Ignite',
        description: 'Spark explosive growth. High stakes, high rewards.',
        apr: '28-45%',
        aprRange: [28, 45],
        riskLevel: 'High',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Starknet', 'Sui', 'Scroll'],
        algorithmScore: 4.1,
        lockupPeriod: '6 months',
        minInvestment: '$2,800',
        fees: '1.3% annual management fee',
        liquidity: 'Monthly withdrawals',
        security: ['Audited by OpenZeppelin', 'Bug bounty program', '99.95% uptime'],
        tvl: '$49.9M',
        historicalReturns: {
            '1m': [100, 107, 114, 120],
            '3m': [100, 107, 114, 120, 127, 134, 140],
            '6m': [100, 107, 114, 120, 127, 134, 140, 147, 154, 161, 168, 175],
        },
    },
    {
        title: 'Horizon',
        description: 'Expand your vision. Balanced growth for the future.',
        apr: '16-20%',
        aprRange: [16, 20],
        riskLevel: 'Medium',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Binance Smart Chain', 'Avalanche', 'Harmony'],
        algorithmScore: 4.7,
        lockupPeriod: '2 months',
        minInvestment: '$900',
        fees: '0.6% annual management fee',
        liquidity: 'Weekly withdrawals',
        security: ['Audited by Quantstamp', 'Insured up to $6M', '99.98% uptime'],
        tvl: '$87.2M',
        historicalReturns: {
            '1m': [100, 103, 105, 107],
            '3m': [100, 103, 105, 107, 110, 112, 115],
            '6m': [100, 103, 105, 107, 110, 112, 115, 118, 121, 124, 127, 130],
        },
    },
];

const InvestmentDetails: React.FC = () => {
    const { index } = useParams<{ index: string }>();
    const navigate = useNavigate();
    const investment = investmentsData[Number(index)];
    const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m'>('6m');

    if (!investment) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Investment Not Found</h2>
                <p className="text-gray-600 mb-6">Explore other opportunities to find your perfect investment.</p>
                <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => navigate('/dashboard/opportunities')}
                    aria-label="Browse investments"
                >
                    Browse Investments
                </Button>
            </div>
        );
    }

    const {
        title,
        description,
        apr,
        riskLevel,
        icon,
        chains,
        algorithmScore,
        lockupPeriod,
        minInvestment,
        fees,
        liquidity,
        security,
        tvl,
        historicalReturns,
    } = investment;

    // Chart data
    const chartData = {
        labels: historicalReturns[timeRange].map((_, i) => `Week ${i + 1}`),
        datasets: [
            {
                label: 'Performance',
                data: historicalReturns[timeRange],
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#0ea5e9',
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: { parsed: { y: number } }) => `Value: ${context.parsed.y}%`,
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                grid: { color: '#f3f4f6' },
                ticks: { callback: (value: number) => `${value}%` },
            },
        },
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-start gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={<ArrowLeft size={16} />}
                        onClick={() => navigate('/dashboard/opportunities')}
                        className="hover:bg-gray-100"
                        aria-label="Back to opportunities"
                    >
                        Back
                    </Button>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-100 opacity-10" />
                        <div className="relative z-10 space-y-10">
                            {/* Overview */}
                            <div className='flex flex-col gap-4'>
                                <div className=' flex flex-row items-center gap-4' >
                                    <div className="p-5 rounded-2xl h-fit w-fit shadow-md transition duration-300 border border-gray-50 hover:border-sky-400">{icon}</div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                        <p className="text-gray-600 text-sm">{description}</p>
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mt-2">Overview</h2>
                                <div className="flex flex-col sm:flex-row gap-6">

                                    <div className="flex-1 space-y-4">

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">MINIMUM INVESTMENT</p>
                                                <p className="text-sm font-semibold text-gray-800">{minInvestment}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">LOCKUP PERIOD</p>
                                                <p className="text-sm font-semibold text-gray-800">{lockupPeriod}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">LIQUIDITY</p>
                                                <p className="text-sm font-semibold text-gray-800">{liquidity}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">FEES</p>
                                                <p className="text-sm font-semibold text-gray-800">{fees}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supported Networks */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Supported Networks</h2>
                                <div className="flex flex-wrap gap-2">
                                    {chains.map((chain) => (
                                        <span
                                            key={chain}
                                            className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1"
                                        >
                                            <Network size={12} className="text-gray-500" />
                                            {chain}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Chart */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
                                <div className="flex justify-end mb-4">
                                    {['1m', '3m', '6m'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range as '1m' | '3m' | '6m')}
                                            className={`px-3 py-1 text-sm font-medium rounded-full ${timeRange === range ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } mx-1`}
                                        >
                                            {range.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-white rounded-xl border p-4">
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Protocol Metrics */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Protocol Metrics</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">TOTAL VALUE LOCKED</p>
                                        <p className="text-sm font-semibold text-gray-800">{tvl}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">ACTIVE USERS</p>
                                        <p className="text-sm font-semibold text-gray-800">12,340</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">AVERAGE ROI (6M)</p>
                                        <p className="text-sm font-semibold text-gray-800">18.3%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">GOVERNANCE</p>
                                        <p className="text-sm font-semibold text-gray-800">Decentralized DAO</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security and Audits */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Security and Audits</h2>
                                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                    {security.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Risks and Benefits */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Risks and Benefits</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Benefits</h3>
                                        <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4">
                                            <li>
                                                {riskLevel === 'Low'
                                                    ? 'Stable returns with minimal volatility.'
                                                    : riskLevel === 'Medium'
                                                        ? 'Balanced returns with moderate growth.'
                                                        : 'High potential returns for aggressive investors.'}
                                            </li>
                                            <li>Access to networks: {chains.join(', ')}.</li>
                                            <li>Algorithm rating: {algorithmScore}/5.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Risks</h3>
                                        <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4">
                                            <li>
                                                {riskLevel === 'Low'
                                                    ? 'Lower returns compared to high-risk options.'
                                                    : riskLevel === 'Medium'
                                                        ? 'Moderate market volatility exposure.'
                                                        : 'High volatility with potential losses.'}
                                            </li>
                                            <li>Dependence on blockchain performance.</li>
                                            <li>Market risks affecting APR: {apr}.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="border-t border-gray-200 pt-6 flex gap-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-1 hover:bg-sky-700 transition-colors"
                                    icon={<ArrowRight size={16} />}
                                >
                                    Start Investing
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                    icon={<Info size={16} />}
                                    onClick={() => navigate('/learn-more')}
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">POTENTIAL RETURN</p>
                                <p className="text-lg font-bold text-sky-600">{apr}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">RISK PROFILE</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${riskLevel === 'Low'
                                            ? 'bg-green-500 w-1/3'
                                            : riskLevel === 'Medium'
                                                ? 'bg-amber-500 w-2/3'
                                                : 'bg-red-500 w-full'
                                            }`}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{riskLevel}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">ALGORITHM RATING</p>
                                <div className="flex items-center gap-1">
                                    <Aperture className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium">{algorithmScore}/5</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">TOTAL VALUE LOCKED</p>
                                <p className="text-sm font-semibold text-gray-800">{tvl}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentDetails;
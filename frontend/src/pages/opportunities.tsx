import React, { useState } from 'react';
import { Shield, Crosshair, Rocket, Grid, List, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestmentCard from '../components/ui/investment-card';
import Button from '../components/ui/button';

// Investment data
const investmentsData = [
    {
        title: 'Everest',
        description: 'Unshakable. Built for those who seek steady, unstoppable growth.',
        apy: '12-16%',
        apyRange: [12, 16],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Arbitrum', 'Optimism'],
        algorithmScore: 4.7,
    },
    {
        title: 'Equilibrium',
        description: 'Perfect harmony between security and performance. Designed for momentum.',
        apy: '18-25%',
        apyRange: [18, 25],
        riskLevel: 'Medium',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Solana', 'Polygon', 'Avalanche', 'Base'],
        algorithmScore: 4.9,
        featured: true,
    },
    {
        title: 'Liftoff',
        description: 'Unleash potential. High risk, high reward. No limits. No fear.',
        apy: '25-40%',
        apyRange: [25, 40],
        riskLevel: 'High',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Starknet', 'Sui', 'Aptos', 'Sei'],
        algorithmScore: 4.2,
    },
    {
        title: 'Surge',
        description: 'Ride the next wave of opportunity. Dynamic, fast, unstoppable.',
        apy: '20-30%',
        apyRange: [20, 30],
        riskLevel: 'Medium',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Binance Smart Chain', 'Fantom', 'Harmony'],
        algorithmScore: 4.5,
    },
    {
        title: 'Aegis',
        description: 'The ultimate shield. Stability you can trust. Strength you can build on.',
        apy: '8-12%',
        apyRange: [8, 12],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Polygon', 'Optimism'],
        algorithmScore: 4.8,
    },
    {
        title: 'Frontier',
        description: 'Where innovation meets opportunity. Designed for pioneers.',
        apy: '30-50%',
        apyRange: [30, 50],
        riskLevel: 'High',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Aptos', 'Sui', 'Sei', 'Scroll'],
        algorithmScore: 4.0,
    },
    {
        title: 'Vortex',
        description: 'A whirlwind of returns. Fast-paced and thrilling.',
        apy: '22-35%',
        apyRange: [22, 35],
        riskLevel: 'High',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Avalanche', 'Fantom', 'Sei'],
        algorithmScore: 4.3,
    },
    {
        title: 'Anchor',
        description: 'Solid ground in a volatile world. Built for resilience.',
        apy: '10-14%',
        apyRange: [10, 14],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Arbitrum', 'Base'],
        algorithmScore: 4.6,
    },
    {
        title: 'Pulse',
        description: 'Feel the beat of the market. Dynamic and adaptive.',
        apy: '15-22%',
        apyRange: [15, 22],
        riskLevel: 'Medium',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Solana', 'Polygon', 'Optimism'],
        algorithmScore: 4.4,
    },
    {
        title: 'Ignite',
        description: 'Spark explosive growth. High stakes, high rewards.',
        apy: '28-45%',
        apyRange: [28, 45],
        riskLevel: 'High',
        icon: <Rocket size={24} className="text-sky-600" />,
        chains: ['Starknet', 'Sui', 'Scroll'],
        algorithmScore: 4.1,
    },
    {
        title: 'Horizon',
        description: 'Expand your vision. Balanced growth for the future.',
        apy: '16-20%',
        apyRange: [16, 20],
        riskLevel: 'Medium',
        icon: <Crosshair size={24} className="text-sky-600" />,
        chains: ['Binance Smart Chain', 'Avalanche', 'Harmony'],
        algorithmScore: 4.7,
    },
];

// Component for list view
const InvestmentListItem: React.FC<typeof investmentsData[0]> = ({
    title,
    description,
    apy,
    riskLevel,
    icon,
    chains,
    algorithmScore,
    featured,
}) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-sky-400 transition-all duration-300">
        <div className="flex-shrink-0 mr-4">{icon}</div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {featured && (
                    <span className="bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-full">FEATURED</span>
                )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
            <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">
                    APY: <span className="font-bold text-sky-600">{apy}</span>
                </span>
                <span className="text-gray-500">
                    Risk:{' '}
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
                </span>
                <span className="text-gray-500">
                    Score: <span className="font-medium">{algorithmScore}/5</span>
                </span>
                <span className="text-gray-500">
                    Chains: <span className="font-medium">{chains.length}+</span>
                </span>
            </div>
        </div>
    </div>
);

const Opportunities: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        riskLevel: '' as '' | 'Low' | 'Medium' | 'High',
        minApy: 0,
        minScore: 0,
        selectedChain: '' as string,
        sortBy: 'default' as 'default' | 'apy-desc' | 'score-desc',
    });

    // Function to filter and sort investments
    const filteredInvestments = investmentsData
        .filter((investment) => {
            const [minApy] = investment.apyRange;
            return (
                (!filters.riskLevel || investment.riskLevel === filters.riskLevel) &&
                (minApy >= filters.minApy) &&
                (investment.algorithmScore >= filters.minScore) &&
                (!filters.selectedChain || investment.chains.includes(filters.selectedChain))
            );
        })
        .sort((a, b) => {
            if (filters.sortBy === 'apy-desc') return b.apyRange[1] - a.apyRange[1];
            if (filters.sortBy === 'score-desc') return b.algorithmScore - a.algorithmScore;
            return 0; // 'default' maintains the original order
        });

    // Handlers to update filters
    const handleRiskFilter = (risk: '' | 'Low' | 'Medium' | 'High') => {
        setFilters((prev) => ({ ...prev, riskLevel: risk }));
    };

    const handleApyFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minApy: Number(e.target.value) }));
    };

    const handleScoreFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minScore: Number(e.target.value) }));
    };

    const handleChainFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, selectedChain: e.target.value }));
    };

    const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, sortBy: e.target.value as 'default' | 'apy-desc' | 'score-desc' }));
    };

    const resetFilters = () => {
        setFilters({ riskLevel: '', minApy: 0, minScore: 0, selectedChain: '', sortBy: 'default' });
    };

    // Unique list of blockchains for the filter
    const allChains = Array.from(new Set(investmentsData.flatMap((inv) => inv.chains))).sort();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Available Investments</h1>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={<Filter size={16} />}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2"
                    >
                        Filters {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                    <div className="flex space-x-2">
                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'outline'}
                            size="sm"
                            icon={<Grid size={16} />}
                            onClick={() => setViewMode('grid')}
                            className="w-10"
                        />
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            size="sm"
                            icon={<List size={16} />}
                            onClick={() => setViewMode('list')}
                            className="w-10"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Bar (Collapsible) */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Risk Level Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                                <select
                                    value={filters.riskLevel}
                                    onChange={(e) =>
                                        handleRiskFilter(e.target.value as '' | 'Low' | 'Medium' | 'High')
                                    }
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="">All</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* Minimum APY Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min APY</label>
                                <select
                                    value={filters.minApy}
                                    onChange={handleApyFilter}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value={0}>Any</option>
                                    <option value={10}>10%+</option>
                                    <option value={20}>20%+</option>
                                    <option value={30}>30%+</option>
                                    <option value={40}>40%+</option>
                                </select>
                            </div>

                            {/* Minimum Score Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                                <select
                                    value={filters.minScore}
                                    onChange={handleScoreFilter}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value={0}>Any</option>
                                    <option value={4}>4.0+</option>
                                    <option value={4.5}>4.5+</option>
                                    <option value={4.7}>4.7+</option>
                                </select>
                            </div>

                            {/* Blockchain Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blockchain</label>
                                <select
                                    value={filters.selectedChain}
                                    onChange={handleChainFilter}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="">All</option>
                                    {allChains.map((chain) => (
                                        <option key={chain} value={chain}>
                                            {chain}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sorting */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={handleSortBy}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="default">Default</option>
                                    <option value="apy-desc">APY (High to Low)</option>
                                    <option value="score-desc">Score (High to Low)</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<X size={16} />}
                                onClick={resetFilters}
                                className="text-gray-600 hover:text-red-600"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{filteredInvestments.length}</span> of{' '}
                    <span className="font-medium">{investmentsData.length}</span> investments
                </p>
            </div>

            {filteredInvestments.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInvestments.map((investment, index) => (
                            <InvestmentCard
                                key={index}
                                title={investment.title}
                                description={investment.description}
                                apy={investment.apy}
                                riskLevel={investment.riskLevel}
                                icon={investment.icon}
                                featured={investment.featured}
                                chains={investment.chains}
                                algorithmScore={investment.algorithmScore}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredInvestments.map((investment, index) => (
                            <InvestmentListItem
                                key={index}
                                title={investment.title}
                                description={investment.description}
                                apy={investment.apy}
                                apyRange={investment.apyRange}
                                riskLevel={investment.riskLevel}
                                icon={investment.icon}
                                featured={investment.featured}
                                chains={investment.chains}
                                algorithmScore={investment.algorithmScore}
                            />
                        ))}
                    </div>
                )
            ) : (
                <p className="text-center text-gray-600">No investments match your filters.</p>
            )}
        </div>
    );
};

export default Opportunities;
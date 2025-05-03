import React, { useState } from 'react';
import { Shield, Crosshair, Rocket, Grid, List, Filter, ChevronDown, ChevronUp, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestmentCard from '../components/ui/investment-card';
import Button from '../components/ui/button';
import { Link } from 'react-router-dom';

// Investment data
const investmentsData = [
    {
        title: 'Everest',
        description: 'Unshakable. Built for those who seek steady, unstoppable growth.',
        apr: '12-16%',
        aprRange: [12, 16],
        riskLevel: 'Low',
        icon: <Shield size={24} className="text-sky-600" />,
        chains: ['Ethereum', 'Arbitrum', 'Optimism'],
        algorithmScore: 4.7,
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
        featured: true,
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
    },
];

// Component for list view
const InvestmentListItem: React.FC<typeof investmentsData[0] & { index: number }> = ({
    title,
    description,
    apr,
    riskLevel,
    icon,
    chains,
    algorithmScore,
    featured,
    index,
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
                    APR: <span className="font-bold text-sky-600">{apr}</span>
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
            <div className="mt-4">
                <Link to={`/dashboard/investment/${index}`} className="w-full sm:w-auto flex">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        icon={<ArrowRight size={14} />}
                    >
                        Explore
                    </Button>
                </Link>
            </div>
        </div>
    </div>
);

const Opportunities: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        riskLevel: '' as '' | 'Low' | 'Medium' | 'High',
        minApr: 0,
        minScore: 0,
        selectedChain: '' as string,
        sortBy: '' as '' | 'default' | 'apr-desc' | 'apr-asc' | 'score-desc' | 'score-asc',
        keyword: '' as string,
    });

    // Function to filter and sort investments
    const filteredInvestments = investmentsData
        .filter((investment) => {
            const [minApr] = investment.aprRange;

            const keywordMatch = filters.keyword
                ? investment.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                investment.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                investment.chains.some(chain => chain.toLowerCase().includes(filters.keyword.toLowerCase()))
                : true;

            return (
                keywordMatch &&
                (!filters.riskLevel || investment.riskLevel === filters.riskLevel) &&
                (minApr >= filters.minApr) &&
                (investment.algorithmScore >= filters.minScore) &&
                (!filters.selectedChain || investment.chains.includes(filters.selectedChain))
            );
        })
        .sort((a, b) => {
            if (filters.sortBy === 'apr-desc') return b.aprRange[1] - a.aprRange[1];
            if (filters.sortBy === 'apr-asc') return a.aprRange[1] - b.aprRange[1];
            if (filters.sortBy === 'score-desc') return b.algorithmScore - a.algorithmScore;
            if (filters.sortBy === 'score-asc') return a.algorithmScore - b.algorithmScore;
            return 0; // 'default' maintains the original order
        });

    // Handlers to update filters
    const handleRiskFilter = (risk: '' | 'Low' | 'Medium' | 'High') => {
        setFilters((prev) => ({ ...prev, riskLevel: risk }));
    };

    const handleAprFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minApr: Number(e.target.value) }));
    };

    const handleScoreFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minScore: Number(e.target.value) }));
    };

    const handleChainFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, selectedChain: e.target.value }));
    };

    const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, sortBy: e.target.value as 'default' | 'apr-desc' | 'apr-asc' | 'score-desc' | 'score-asc' }));
    };

    const handleKeywordFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, keyword: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ riskLevel: '', minApr: 0, minScore: 0, selectedChain: '', sortBy: 'default', keyword: '' });
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
                        className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="flex items-start gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2">
                            {/* Keyword Filter */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Search</label>
                                <input
                                    type="text"
                                    value={filters.keyword}
                                    onChange={handleKeywordFilter}
                                    placeholder="Title, chain..."
                                    className="border border-gray-200 rounded-md px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50"
                                />
                            </div>

                            {/* Risk Level Filter */}
                            <div className="flex flex-col min-w-[90px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Risk</label>
                                <div className="relative">
                                    <select
                                        value={filters.riskLevel}
                                        onChange={(e) => handleRiskFilter(e.target.value as '' | 'Low' | 'Medium' | 'High')}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="">All</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Minimum APR Filter */}
                            <div className="flex flex-col min-w-[90px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Min APR</label>
                                <div className="relative">
                                    <select
                                        value={filters.minApr}
                                        onChange={handleAprFilter}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value={0}>Any</option>
                                        <option value={10}>10%+</option>
                                        <option value={20}>20%+</option>
                                        <option value={30}>30%+</option>
                                        <option value={40}>40%+</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Minimum Score Filter */}
                            <div className="flex flex-col min-w-[90px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Min Score</label>
                                <div className="relative">
                                    <select
                                        value={filters.minScore}
                                        onChange={handleScoreFilter}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value={0}>Any</option>
                                        <option value={4}>4.0+</option>
                                        <option value={4.5}>4.5+</option>
                                        <option value={4.7}>4.7+</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Blockchain Filter */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Chain</label>
                                <div className="relative">
                                    <select
                                        value={filters.selectedChain}
                                        onChange={handleChainFilter}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="">All</option>
                                        {allChains.map((chain) => (
                                            <option key={chain} value={chain}>
                                                {chain}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Sorting */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Sort By</label>
                                <div className="relative">
                                    <select
                                        value={filters.sortBy}
                                        onChange={handleSortBy}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="default">Default</option>
                                        <option value="apr-desc">APR ↓</option>
                                        <option value="apr-asc">APR ↑</option>
                                        <option value="score-asc">Score ↑</option>
                                        <option value="score-desc">Score ↓</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex flex-col self-end">

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<X size={12} />}
                                    onClick={resetFilters}
                                    className="text-gray-500 hover:text-red-500 border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50"
                                >
                                    Clear
                                </Button>
                            </div>
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
                                apr={investment.apr}
                                riskLevel={investment.riskLevel}
                                icon={investment.icon}
                                featured={investment.featured}
                                chains={investment.chains}
                                algorithmScore={investment.algorithmScore}
                                index={index}
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
                                apr={investment.apr}
                                aprRange={investment.aprRange}
                                riskLevel={investment.riskLevel}
                                icon={investment.icon}
                                featured={investment.featured}
                                chains={investment.chains}
                                algorithmScore={investment.algorithmScore}
                                index={index}
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
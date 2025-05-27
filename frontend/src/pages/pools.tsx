/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Shield, Crosshair, Rocket, Grid, List, Filter, ChevronDown, ChevronUp, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PoolCard from '../components/ui/pool-card';
import Button from '../components/ui/button';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interface for pool data
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

interface Pool {
    feeTier: string;
    token0: Token;
    token1: Token;
    createdAtTimestamp: string;
    poolDayData: PoolDayData[];
}

// Interface for API response
interface PoolsResponse {
    pools: Pool[];
    blockNumber: string;
}

// Component for list view
const PoolListItem: React.FC<Pool & { index: number }> = ({
    feeTier,
    token0,
    token1,
    poolDayData,
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

    // Derive risk level based on fee tier (customize as needed)
    const riskLevel = feeTier === '100' ? 'High' : feeTier === '500' ? 'Medium' : feeTier === '3000' ? 'Low' : 'Low';

    // Assign icon based on fee tier
    const icon =
        feeTier === '100' ? (
            <Rocket size={24} className="text-sky-600" />
        ) : feeTier === '500' ? (
            <Crosshair size={24} className="text-sky-600" />
        ) : (
            <Shield size={24} className="text-sky-600" />
        );

    // Convert fee tier to percentage
    const feeTierPercentage = (Number(feeTier) / 10000).toFixed(2) + '%';

    return (
        <div className="sm:w-5xl flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-sky-400 transition-all duration-300">
            <div className="flex-shrink-0 mr-4">{icon}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {token0.symbol}/{token1.symbol} ({feeTierPercentage})
                    </h3>
                    {feeTier === '500' && (
                        <span className="bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-full">FEATURED</span>
                    )}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                    Liquidity pool for {token0.symbol} and {token1.symbol} with a {feeTierPercentage} fee tier.
                </p>
                <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-500">
                        APR: <span className="font-bold text-sky-600">{apr}</span>
                    </span>
                    <span className="text-gray-500">
                        Risk:{' '}
                        <span
                            className={`font-medium ${riskLevel === 'Low' ? 'text-green-600' : riskLevel === 'Medium' ? 'text-amber-600' : 'text-red-600'
                                }`}
                        >
                            {riskLevel}
                        </span>
                    </span>
                    <span className="text-gray-500">
                        TVL: <span className="font-medium">{tvl}</span>
                    </span>
                    <span className="text-gray-500">
                        Volume (24h): <span className="font-medium">{volume}</span>
                    </span>
                </div>
                <div className="mt-4">
                    <Link to={`/dashboard/pool/${index}`} className="w-full sm:w-auto flex">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" icon={<ArrowRight size={14} />}>
                            Explore
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const Pools: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        riskLevel: '' as '' | 'Low' | 'Medium' | 'High',
        minApr: 0,
        minTvl: 0,
        feeTier: '' as '' | '100' | '500' | '3000' | '10000',
        sortBy: '' as '' | 'default' | 'apr-desc' | 'apr-asc' | 'tvl-desc' | 'tvl-asc',
        keyword: '' as string,
    });

    // Fetch pools from API
    useEffect(() => {
        const fetchPools = async () => {
            try {
                const response = await axios.post<PoolsResponse>('http://localhost:3000/pools', {
                    token0: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    token1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                });
                setPools(response.data.pools);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch pools. Please try again.');
                setLoading(false);
            }
        };
        fetchPools();
    }, []);

    // Function to filter and sort pools
    const filteredPools = pools
        .filter((pool) => {
            const latestData = pool.poolDayData.sort((a, b) => b.date - a.date)[0];
            const apr = latestData?.apr24h ? Number(latestData.apr24h) : 0;
            const tvl = latestData?.tvlUSD ? Number(latestData.tvlUSD) : 0;

            const riskLevel = pool.feeTier === '100' ? 'High' : pool.feeTier === '500' ? 'Medium' : 'Low';

            const keywordMatch = filters.keyword
                ? pool.token0.symbol.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                pool.token1.symbol.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                ((Number(pool.feeTier) / 10000).toFixed(2) + '%').includes(filters.keyword.toLowerCase())
                : true;

            return (
                keywordMatch &&
                (!filters.riskLevel || riskLevel === filters.riskLevel) &&
                (apr >= filters.minApr) &&
                (tvl >= filters.minTvl) &&
                (!filters.feeTier || pool.feeTier === filters.feeTier)
            );
        })
        .sort((a, b) => {
            const aLatest = a.poolDayData.sort((x, y) => y.date - x.date)[0];
            const bLatest = b.poolDayData.sort((x, y) => y.date - x.date)[0];
            const aApr = aLatest?.apr24h ? Number(aLatest.apr24h) : 0;
            const bApr = bLatest?.apr24h ? Number(bLatest.apr24h) : 0;
            const aTvl = aLatest?.tvlUSD ? Number(aLatest.tvlUSD) : 0;
            const bTvl = bLatest?.tvlUSD ? Number(bLatest.tvlUSD) : 0;

            if (filters.sortBy === 'apr-desc') return bApr - aApr;
            if (filters.sortBy === 'apr-asc') return aApr - bApr;
            if (filters.sortBy === 'tvl-desc') return bTvl - aTvl;
            if (filters.sortBy === 'tvl-asc') return aTvl - bTvl;
            return 0; // 'default' maintains the original order
        });

    // Handlers to update filters
    const handleRiskFilter = (risk: '' | 'Low' | 'Medium' | 'High') => {
        setFilters((prev) => ({ ...prev, riskLevel: risk }));
    };

    const handleAprFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minApr: Number(e.target.value) }));
    };

    const handleTvlFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minTvl: Number(e.target.value) }));
    };

    const handleFeeTierFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, feeTier: e.target.value as '' | '100' | '500' | '3000' | '10000' }));
    };

    const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: e.target.value as 'default' | 'apr-desc' | 'apr-asc' | 'tvl-desc' | 'tvl-asc',
        }));
    };

    const handleKeywordFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, keyword: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ riskLevel: '', minApr: 0, minTvl: 0, feeTier: '', sortBy: 'default', keyword: '' });
    };

    if (loading) {
        return <div className="text-center text-gray-600">Loading pools...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Available Pools</h1>
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
                                    placeholder="Token, fee tier..."
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
                                        <option value={5}>5%+</option>
                                        <option value={10}>10%+</option>
                                        <option value={15}>15%+</option>
                                        <option value={20}>20%+</option>
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

                            {/* Minimum TVL Filter */}
                            <div className="flex flex-col min-w-[90px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Min TVL</label>
                                <div className="relative">
                                    <select
                                        value={filters.minTvl}
                                        onChange={handleTvlFilter}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value={0}>Any</option>
                                        <option value={1000000}>$1M+</option>
                                        <option value={10000000}>$10M+</option>
                                        <option value={100000000}>$100M+</option>
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

                            {/* Fee Tier Filter */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Fee Tier</label>
                                <div className="relative">
                                    <select
                                        value={filters.feeTier}
                                        onChange={handleFeeTierFilter}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="">All</option>
                                        <option value="100">0.01%</option>
                                        <option value="500">0.05%</option>
                                        <option value="3000">0.30%</option>
                                        <option value="10000">1.00%</option>
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
                                        <option value="tvl-desc">TVL ↓</option>
                                        <option value="tvl-asc">TVL ↑</option>
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
                    Showing <span className="font-medium">{filteredPools.length}</span> of{' '}
                    <span className="font-medium">{pools.length}</span> pools
                </p>
            </div>

            {filteredPools.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPools.map((pool, index) => {
                            const latestData = pool.poolDayData.sort((a, b) => b.date - a.date)[0];
                            const apr = latestData?.apr24h ? `${latestData.apr24h}%` : 'N/A';
                            const tvl = latestData?.tvlUSD
                                ? `$${Number(latestData.tvlUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                                : 'N/A';
                            const volume = latestData?.volumeUSD
                                ? `$${Number(latestData.volumeUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                                : 'N/A';
                            const riskLevel = pool.feeTier === '100' ? 'High' : pool.feeTier === '500' ? 'Medium' : 'Low';
                            const icon =
                                pool.feeTier === '100' ? (
                                    <Rocket size={24} className="text-sky-600" />
                                ) : pool.feeTier === '500' ? (
                                    <Crosshair size={24} className="text-sky-600" />
                                ) : (
                                    <Shield size={24} className="text-sky-600" />
                                );
                            const feeTierPercentage = (Number(pool.feeTier) / 10000).toFixed(2) + '%';

                            return (
                                <PoolCard
                                    key={index}
                                    title={`${pool.token0.symbol}/${pool.token1.symbol} (${feeTierPercentage})`}
                                    description={`Liquidity pool for ${pool.token0.symbol} and ${pool.token1.symbol} with a ${feeTierPercentage} fee tier.`}
                                    apr={apr}
                                    riskLevel={riskLevel}
                                    icon={icon}
                                    featured={pool.feeTier === '500'}
                                    chains={['Ethereum']} // Assuming Ethereum; adjust if chain data is available
                                    algorithmScore={Number(latestData?.apr24h) / 5} // Simplified score; adjust as needed
                                    index={index}
                                    tvl={tvl}
                                    volume={volume}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPools.map((pool, index) => (
                            <PoolListItem key={index} {...pool} index={index} />
                        ))}
                    </div>
                )
            ) : (
                <p className="text-center text-gray-600">No pools match your filters.</p>
            )}
        </div>
    );
};

export default Pools;
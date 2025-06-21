/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/button';
import { Link } from 'react-router-dom';

interface Network {
    id: string;
    name: string;
    graphqlUrl: string;
}

interface Token {
    id: string;
    symbol: string;
    name: string;
    address: string;
    network: Network;
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

const PoolListItem: React.FC<Pool & { index: number }> = ({
    feeTier,
    token0,
    token1,
    poolDayData,
    index,
}) => {
    const latestData = poolDayData && poolDayData.length > 0
        ? poolDayData.sort((a, b) => b.date - a.date)[0]
        : { apr24h: '0', tvlUSD: '0', volumeUSD: '0' };
    const apr = latestData.apr24h ? `${parseFloat(latestData.apr24h).toFixed(2)}%` : 'N/A';
    const tvl = latestData.tvlUSD
        ? `$${Number(latestData.tvlUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : 'N/A';
    const volume = latestData.volumeUSD
        ? `$${Number(latestData.volumeUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : 'N/A';
    const networkName = token0.network?.name || 'Unknown';
    const feeTierPercentage = (Number(feeTier) / 10000).toFixed(2) + '%';

    return (
        <div className="bg-white rounded-xl shadow-sm border-t-2 border-sky-50 hover:shadow-md transition-all duration-300 p-4 mb-2">
            <div className="mb-1.5">
                <h3 className="text-base font-bold text-gray-900">
                    {token0.symbol}/{token1.symbol}
                </h3>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto">
                <div className="min-w-[100px]">
                    <span className="text-[10px] font-medium text-gray-500 uppercase hidden sm:block">APR (24h)</span>
                    <p className="text-sm font-semibold text-emerald-600 truncate">{apr}</p>
                </div>
                <div className="min-w-[100px] border-l border-gray-200 pl-3">
                    <span className="text-[10px] font-medium text-gray-500 uppercase hidden sm:block">TVL</span>
                    <p className="text-sm font-semibold text-gray-800 truncate">{tvl}</p>
                </div>
                <div className="min-w-[100px] border-l border-gray-200 pl-3">
                    <span className="text-[10px] font-medium text-gray-500 uppercase hidden sm:block">FEE TIER</span>
                    <p className="text-sm font-semibold text-gray-800 truncate">{feeTierPercentage}</p>
                </div>
                <div className="min-w-[100px] border-l border-gray-200 pl-3">
                    <span className="text-[10px] font-medium text-gray-500 uppercase hidden sm:block">Volume (24h)</span>
                    <p className="text-sm font-semibold text-gray-800 truncate">{volume}</p>
                </div>
                <div className="min-w-[100px] border-l border-gray-200 pl-3">
                    <span className="text-[10px] font-medium text-gray-500 uppercase hidden sm:block">Network</span>
                    <p className="text-sm font-semibold text-gray-800 truncate">{networkName}</p>
                </div>
                <Link to={`/dashboard/new-position/${index}`} className="inline-flex ml-3">
                    <Button
                        size="sm"
                        className="text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-700 hover:to-sky-800 px-3 py-1.5 rounded-md shadow-sm"
                        icon={<ArrowRight size={12} />}
                    >
                        Invest
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const Pools: React.FC = () => {
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const poolsPerPage = 10;

    useEffect(() => {
        const fetchAllPools = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/pools`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch pools: ${response.statusText}`);
                }
                const data = await response.json();
                setPools(data.pools || []);
            } catch (err) {
                console.error('Failed to fetch pools:', err);
                setError('Failed to load pool data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllPools();
    }, []);

    const indexOfLastPool = currentPage * poolsPerPage;
    const indexOfFirstPool = indexOfLastPool - poolsPerPage;
    const currentPools = pools.slice(indexOfFirstPool, indexOfLastPool);
    const totalPages = Math.ceil(pools.length / poolsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-flex items-center space-x-3 mb-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600"></div>
                        <span className="text-lg font-medium text-gray-700">Loading pools...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-12 bg-gray-50">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pools</h1>
                <div className="text-sm text-gray-500">
                    {pools.length} pools available
                </div>
            </div>
            {pools.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pools Found</h3>
                    <p className="text-gray-500">No liquidity pools are available at the moment.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {currentPools.map((pool, idx) => (
                            <PoolListItem
                                key={`${pool.token0.id}-${pool.token1.id}-${pool.feeTier}-${pool.createdAtTimestamp}`}
                                {...pool}
                                index={indexOfFirstPool + idx}
                            />
                        ))}
                    </div>
                    {/* Componente de Paginação */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {indexOfFirstPool + 1} to {Math.min(indexOfLastPool, pools.length)} of {pools.length} pools
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="p-2"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                {getPageNumbers().map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={currentPage === page ? 'primary' : 'outline'}
                                        onClick={() => goToPage(page)}
                                        className={`w-10 h-10 ${currentPage === page
                                            ? 'bg-sky-600 text-white'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Pools;
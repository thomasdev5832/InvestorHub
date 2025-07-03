/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/button';
import PoolListItem from '../components/ui/pool-list-item';
import { Pool } from '../interfaces/pool';


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
                        {currentPools.map((pool) => (
                            <PoolListItem
                                key={`${pool.token0.id}-${pool.token1.id}-${pool.feeTier}-${pool.createdAtTimestamp}`}
                                _id={pool._id}
                                feeTier={pool.feeTier}
                                token0={pool.token0}
                                token1={pool.token1}
                                poolDayData={pool.poolDayData}
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
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../components/ui/button';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Interface for pool data (same as in Pools.tsx)
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

interface PoolsResponse {
    pools: Pool[];
    blockNumber: string;
}

const PoolDetails: React.FC = () => {
    const { index } = useParams<{ index: string }>();
    const navigate = useNavigate();
    const [pool, setPool] = useState<Pool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof PoolDayData | null;
        direction: 'asc' | 'desc' | null;
    }>({ key: null, direction: null });

    // Fetch pool data
    const fetchPool = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post<PoolsResponse>('http://localhost:3000/pools', {
                token0: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                token1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            });
            const poolIndex = Number(index);
            if (poolIndex >= 0 && poolIndex < response.data.pools.length) {
                setPool(response.data.pools[poolIndex]);
            } else {
                setError('Pool not found.');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch pool details. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPool();
    }, [index]);

    // Handle table sorting
    const handleSort = (key: keyof PoolDayData) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (loading) {
        return (
            <div className="text-center text-gray-600 py-10">
                <p>Loading pool details...</p>
            </div>
        );
    }

    if (error || !pool) {
        return (
            <div className="text-center text-red-600 py-10">
                <p>{error || 'Pool not found.'}</p>
                <Button
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw size={16} />}
                    onClick={fetchPool}
                    className="mt-4 px-4 py-2"
                >
                    Retry
                </Button>
            </div>
        );
    }

    const feeTierPercentage = (Number(pool.feeTier) / 10000).toFixed(2) + '%';
    const latestData = pool.poolDayData.sort((a, b) => b.date - a.date)[0];
    const apr = latestData?.apr24h ? `${latestData.apr24h}%` : 'N/A';
    const tvl = latestData?.tvlUSD
        ? `$${Number(latestData.tvlUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : 'N/A';
    const volume = latestData?.volumeUSD
        ? `$${Number(latestData.volumeUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : 'N/A';
    const riskLevel = pool.feeTier === '100' ? 'High' : pool.feeTier === '500' ? 'Medium' : 'Low';

    // Format creation timestamp
    const createdAt = new Date(Number(pool.createdAtTimestamp) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Summary metrics
    const avgApr =
        pool.poolDayData.length > 0
            ? (
                pool.poolDayData.reduce((sum, data) => sum + Number(data.apr24h), 0) / pool.poolDayData.length
            ).toFixed(2) + '%'
            : 'N/A';
    const totalFees = pool.poolDayData
        .reduce((sum, data) => sum + Number(data.feesUSD), 0)
        .toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
    const peakTvl = Math.max(...pool.poolDayData.map((data) => Number(data.tvlUSD))).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    // Chart data for APR history
    const chartData = {
        labels: pool.poolDayData
            .sort((a, b) => a.date - b.date)
            .map((data) => new Date(data.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'APR (24h) %',
                data: pool.poolDayData.sort((a, b) => a.date - b.date).map((data) => Number(data.apr24h)),
                fill: false,
                borderColor: 'rgb(56, 189, 248)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 12, // Smaller font for mobile
                    },
                },
            },
            title: {
                display: true,
                text: 'Historical APR (24h)',
                font: {
                    size: 16, // Smaller title on mobile
                },
            },
            tooltip: {
                callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'APR (%)',
                    font: {
                        size: 12,
                    },
                },
                ticks: {
                    font: {
                        size: 10, // Smaller ticks on mobile
                    },
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 12,
                    },
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                    maxRotation: 45,
                    minRotation: 45, // Rotate labels for better fit on mobile
                },
            },
        },
    };

    // Sorted table data
    const sortedData = [...pool.poolDayData].sort((a, b) => {
        if (!sortConfig.key || !sortConfig.direction) return b.date - a.date; // Default sort by date descending
        const aValue = Number(a[sortConfig.key]);
        const bValue = Number(b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {pool.token0.symbol}/{pool.token1.symbol} ({feeTierPercentage})
                </h1>
                <Button
                    variant="outline"
                    size="sm"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => navigate('/dashboard/pools')}
                    className="w-full sm:w-auto px-4 py-2"
                >
                    Back to Pools
                </Button>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Average APR</h3>
                    <p className="mt-1 text-lg sm:text-2xl font-semibold text-sky-600">{avgApr}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Fees</h3>
                    <p className="mt-1 text-lg sm:text-2xl font-semibold text-sky-600">{totalFees}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Peak TVL</h3>
                    <p className="mt-1 text-lg sm:text-2xl font-semibold text-sky-600">{peakTvl}</p>
                </div>
            </div>

            {/* Pool Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Pool Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Fee Tier:</span>{' '}
                        <span className="font-medium">{feeTierPercentage}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">APR (24h):</span>{' '}
                        <span className="font-bold text-sky-600">{apr}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Risk Level:</span>{' '}
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
                        <span className="text-gray-500">Created:</span>{' '}
                        <span className="font-medium">{createdAt}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-500">Tokens:</span>{' '}
                        <span className="font-medium">
                            {pool.token0.symbol} ({pool.token0.id.slice(0, 6)}...) / {pool.token1.symbol} (
                            {pool.token1.id.slice(0, 6)}...)
                        </span>
                    </div>
                </div>
            </div>

            {/* APR Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">APR History</h2>
                <div className="h-64 sm:h-80">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Historical Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Historical Data</h2>
                {/* Desktop: Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table
                        className="min-w-full divide-y divide-gray-200"
                        aria-label="Historical pool data"
                    >
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('date')}
                                >
                                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                </th>
                                <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('apr24h')}
                                >
                                    APR (24h) {sortConfig.key === 'apr24h' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                </th>
                                <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('tvlUSD')}
                                >
                                    TVL (USD) {sortConfig.key === 'tvlUSD' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                </th>
                                <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('volumeUSD')}
                                >
                                    Volume (USD) {sortConfig.key === 'volumeUSD' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                </th>
                                <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('feesUSD')}
                                >
                                    Fees (USD) {sortConfig.key === 'feesUSD' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedData.map((data, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(data.date * 1000).toLocaleDateString('en-US')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{data.apr24h}%</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        ${Number(data.tvlUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        ${Number(data.volumeUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        ${Number(data.feesUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile: Cards */}
                <div className="sm:hidden space-y-4">
                    {sortedData.map((data, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            aria-label={`Historical data for ${new Date(data.date * 1000).toLocaleDateString('en-US')}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(data.date * 1000).toLocaleDateString('en-US')}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">APR:</span>{' '}
                                    <span className="font-medium">{data.apr24h}%</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">TVL:</span>{' '}
                                    <span className="font-medium">
                                        ${Number(data.tvlUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Volume:</span>{' '}
                                    <span className="font-medium">
                                        ${Number(data.volumeUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Fees:</span>{' '}
                                    <span className="font-medium">
                                        ${Number(data.feesUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PoolDetails;
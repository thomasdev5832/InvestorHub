/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { PieChart, DollarSign, TrendingUp, Network } from 'lucide-react';
import { motion } from 'framer-motion';
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

// Mock portfolio data (unchanged)
const portfolioData = {
    availableBalance: 3200,
    totalInvested: 48500,
    totalProfitLoss: 6720,
    averageAPR: 22.3,
    investments: [
        {
            name: 'Everest Yield',
            amount: 12000,
            profitLoss: 1800,
            apr: 15,
            network: 'Ethereum',
            history: {
                '1M': [12000, 12150, 12300, 12500, 13000],
                '3M': [12000, 11900, 12100, 12250, 12400, 12600, 12800, 13000, 13200],
                '6M': [12000, 11850, 12000, 12150, 12300, 12500, 12700, 12900, 13100, 13200, 13400, 13800],
                'Max': [12000, 11950, 12050, 12100, 12200, 12350, 12500, 12650, 12800, 12950, 13100, 13250, 13400, 13600, 13800],
            },
        },
        {
            name: 'Equilibrium Pool',
            amount: 8500,
            profitLoss: 2200,
            apr: 28,
            network: 'Polygon',
            history: {
                '1M': [8500, 8700, 8900, 9200, 9500],
                '3M': [8500, 8600, 8750, 8900, 9000, 9100, 9300, 9500, 9700],
                '6M': [8500, 8450, 8600, 8700, 8800, 8900, 9100, 9300, 9400, 9500, 9600, 9700],
                'Max': [8500, 8400, 8450, 8550, 8650, 8750, 8850, 8950, 9050, 9150, 9250, 9350, 9450, 9550, 9700],
            },
        },
        {
            name: 'Liftoff Staking',
            amount: 6000,
            profitLoss: 900,
            apr: 35,
            network: 'Starknet',
            history: {
                '1M': [6000, 6100, 6200, 6300, 6500],
                '3M': [6000, 6050, 6100, 6150, 6200, 6250, 6300, 6400, 6500],
                '6M': [6000, 5950, 6000, 6050, 6100, 6150, 6200, 6300, 6350, 6400, 6450, 6500],
                'Max': [6000, 5950, 5980, 6020, 6050, 6100, 6150, 6200, 6250, 6300, 6350, 6400, 6450, 6500, 6500],
            },
        },
        {
            name: 'Aqua Farming',
            amount: 15000,
            profitLoss: 1500,
            apr: 10,
            network: 'Binance Smart Chain',
            history: {
                '1M': [15000, 15100, 15200, 15300, 15450],
                '3M': [15000, 14950, 15050, 15150, 15200, 15250, 15300, 15400, 15450],
                '6M': [15000, 14900, 14950, 15000, 15050, 15100, 15150, 15250, 15300, 15350, 15400, 15450],
                'Max': [15000, 14850, 14900, 14950, 15000, 15050, 15100, 15150, 15200, 15250, 15300, 15350, 15400, 15450, 15450],
            },
        },
        {
            name: 'Nebula Vault',
            amount: 5000,
            profitLoss: 250,
            apr: 8,
            network: 'Avalanche',
            history: {
                '1M': [5000, 5050, 5100, 5150, 5200],
                '3M': [5000, 5020, 5050, 5070, 5100, 5120, 5150, 5170, 5200],
                '6M': [5000, 4980, 5000, 5020, 5050, 5070, 5100, 5120, 5150, 5170, 5180, 5200],
                'Max': [5000, 4970, 4980, 4990, 5000, 5020, 5050, 5070, 5100, 5120, 5150, 5170, 5180, 5190, 5200],
            },
        },
        {
            name: 'Thunder Hub',
            amount: 2000,
            profitLoss: 1060,
            apr: 50,
            network: 'Solana',
            history: {
                '1M': [2000, 2200, 2400, 2600, 2800],
                '3M': [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800],
                '6M': [2000, 2050, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2750, 2800, 3060],
                'Max': [2000, 2020, 2050, 2100, 2150, 2200, 2250, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3060],
            },
        },
    ],
};

const Portfolio: React.FC = () => {
    const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);
    const [timeFrame, setTimeFrame] = useState<'1M' | '3M' | '6M' | 'Max'>('6M');

    const openModal = (investment: any) => {
        setSelectedInvestment(investment);
    };

    const closeModal = () => {
        setSelectedInvestment(null);
    };

    const getCurrentValue = (history: number[]) => history[history.length - 1];
    const getCurrentPortfolioValue = () => portfolioData.investments.reduce((sum, inv) => sum + getCurrentValue(inv.history[timeFrame]), 0);
    const getProfitLossPercentage = () => {
        const currentValue = getCurrentPortfolioValue();
        const initialValue = portfolioData.totalInvested;
        return (((currentValue - initialValue) / initialValue) * 100).toFixed(2);
    };

    const chartData = {
        labels:
            timeFrame === '1M'
                ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
                : timeFrame === '3M'
                    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
                    : timeFrame === '6M'
                        ? ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                        : ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Year 14', 'Year 15'],
        datasets: portfolioData.investments.map((inv) => ({
            label: inv.name,
            data: inv.history[timeFrame],
            borderColor:
                inv.name === 'Everest Yield'
                    ? '#38bdf8'
                    : inv.name === 'Equilibrium Pool'
                        ? '#facc15'
                        : inv.name === 'Liftoff Staking'
                            ? '#fb923c'
                            : inv.name === 'Aqua Farming'
                                ? '#10b981'
                                : inv.name === 'Nebula Vault'
                                    ? '#8b5cf6'
                                    : '#ef4444',
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(
                    0,
                    inv.name === 'Everest Yield'
                        ? 'rgba(56, 189, 248, 0.3)'
                        : inv.name === 'Equilibrium Pool'
                            ? 'rgba(250, 204, 21, 0.3)'
                            : inv.name === 'Liftoff Staking'
                                ? 'rgba(251, 146, 60, 0.3)'
                                : inv.name === 'Aqua Farming'
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : inv.name === 'Nebula Vault'
                                        ? 'rgba(139, 92, 246, 0.3)'
                                        : 'rgba(239, 68, 68, 0.3)'
                );
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            pointShadowBlur: 10,
            pointShadowColor: 'rgba(0, 0, 0, 0.2)',
        })),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#1f2937',
                    font: { size: 12, family: 'Inter, sans-serif' }, // Smaller on mobile
                    padding: 10, // Reduced to save space
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#38bdf8',
                borderWidth: 1,
                padding: 8, // Reduced on mobile
            },
            title: {
                display: false,
                text: 'Portfolio Performance Over Time',
                color: '#1f2937',
                font: { size: 16, family: 'Inter, sans-serif', weight: "bold" as const },
                padding: { top: 0, bottom: 10 },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 10, family: 'Inter, sans-serif' } }, // Smaller on mobile
            },
            y: {
                grid: { color: '#e5e7eb', borderDash: [5, 5] },
                ticks: {
                    color: '#6b7280',
                    font: { size: 10, family: 'Inter, sans-serif' }, // Smaller on mobile
                    callback: function(this: any, value: string | number) {
                        return `$${Number(value).toLocaleString()}`;
                    },
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'linear' as const,
        },
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Enhanced Header */}
            {/* <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Portfolio</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Available Balance</p>
                            <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                ${portfolioData.availableBalance.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => console.log('Add Funds clicked')}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                                Add Funds
                            </button>
                            <button
                                onClick={() => console.log('Withdraw clicked')}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Portfolio Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
            >
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Current Portfolio Value</p>
                            <p className="text-2xl sm:text-3xl font-bold text-sky-600">${getCurrentPortfolioValue().toLocaleString()}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                                Initial: ${portfolioData.totalInvested.toLocaleString()}
                            </p>
                        </div>
                        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Profit / Loss</p>
                            <p
                                className={`text-lg sm:text-2xl font-bold ${portfolioData.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}
                            >
                                {portfolioData.totalProfitLoss >= 0 ? '+' : '-'}$
                                {Math.abs(portfolioData.totalProfitLoss).toLocaleString()} (
                                {portfolioData.totalProfitLoss >= 0 ? '+' : '-'}
                                {Math.abs(parseFloat(getProfitLossPercentage()))}%)
                            </p>
                        </div>
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Average APR</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{portfolioData.averageAPR}%</p>
                        </div>
                        <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
                    </div>
                </div>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Portfolio Performance</h2>
                    <select
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value as '1M' | '3M' | '6M' | 'Max')}
                        className="border border-gray-300 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors w-full sm:w-auto"
                    >
                        <option value="1M">1 Month</option>
                        <option value="3M">3 Months</option>
                        <option value="6M">6 Months</option>
                        <option value="Max">Max</option>
                    </select>
                </div>
                <div className="h-72 sm:h-96">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </motion.div>

            {/* Investments List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Investments</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {portfolioData.investments.map((investment) => (
                        <div
                            key={investment.name}
                            className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                            onClick={() => openModal(investment)}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                                <div className="flex items-center">
                                    <div className="bg-sky-100 p-2 rounded-full mr-2 sm:mr-3">
                                        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{investment.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500">Current Value</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                        ${getCurrentValue(investment.history[timeFrame]).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500">Profit / Loss</p>
                                    <p
                                        className={`text-xs sm:text-sm font-semibold ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {investment.profitLoss >= 0 ? '+' : '-'}$
                                        {Math.abs(investment.profitLoss).toLocaleString()}
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-medium text-gray-500">APR</p>
                                    <p className="text-sm font-semibold text-gray-900">{investment.apr}%</p>
                                </div>
                                <div className="hidden md:flex md:items-center">
                                    <p className="text-xs font-medium text-gray-500">Network</p>
                                    <div className="flex items-center ml-1">
                                        <Network className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1" />
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{investment.network}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Modal */}
            {selectedInvestment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{selectedInvestment.name} Details</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none text-lg sm:text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Initial Investment:{' '}
                                    <span className="font-medium">${selectedInvestment.amount.toLocaleString()}</span>
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Current Value:{' '}
                                    <span className="font-medium">${getCurrentValue(selectedInvestment.history[timeFrame]).toLocaleString()}</span>
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Profit / Loss:{' '}
                                    <span className={`font-medium ${selectedInvestment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedInvestment.profitLoss >= 0 ? '+' : '-'}$
                                        {Math.abs(selectedInvestment.profitLoss).toLocaleString()} (
                                        {(((getCurrentValue(selectedInvestment.history[timeFrame]) - selectedInvestment.amount) / selectedInvestment.amount) * 100).toFixed(2)}%)
                                    </span>
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    APR: <span className="font-medium">{selectedInvestment.apr}%</span>
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Network: <span className="font-medium">{selectedInvestment.network}</span>
                                </p>
                            </div>
                            <div className="mt-3 sm:mt-4">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Performance Snapshot ({timeFrame})</h4>
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-md space-y-1 sm:space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-600">Start:</span>
                                        <span className="font-medium text-gray-900">${selectedInvestment.history[timeFrame][0].toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-600">Peak:</span>
                                        <span className="font-medium text-gray-900">${Math.max(...selectedInvestment.history[timeFrame]).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-600">Current:</span>
                                        <span className="font-medium text-gray-900">${getCurrentValue(selectedInvestment.history[timeFrame]).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between gap-2">
                            <button
                                onClick={() => console.log(`Unstake ${selectedInvestment.name}`)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            >
                                Unstake
                            </button>
                            <button
                                onClick={() => console.log(`Increase investment for ${selectedInvestment.name}`)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                                Increase Investment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Portfolio;
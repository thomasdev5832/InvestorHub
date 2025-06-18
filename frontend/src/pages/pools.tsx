/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../components/ui/button';
import { Link } from 'react-router-dom';

// Interface para token e pool
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
    network?: string;
}

interface ApiToken {
    id: string;
    name: string;
    symbol: string;
    address: string;
    network: {
        id: string;
        name: string;
        graphqlUrl: string;
    };
}

interface ApiPool {
    feeTier: string;
    token0: {
        id: string;
        symbol: string;
    };
    token1: {
        id: string;
        symbol: string;
    };
    createdAtTimestamp: string;
    poolDayData: {
        date: number;
        feesUSD: string;
        volumeUSD: string;
        tvlUSD: string;
        apr24h: string;
    }[];
}

// Componente para item da lista
const PoolListItem: React.FC<Pool & { index: number }> = ({
    feeTier,
    token0,
    token1,
    poolDayData,
    network,
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
    const networkName = network || 'Unknown';

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
                <Link to={`/dashboard/pool/${index}`} className="inline-flex ml-3">
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

    useEffect(() => {
        const fetchAllPools = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Buscar todos os tokens
                const tokensResponse = await fetch('http://localhost:3000/tokens');
                if (!tokensResponse.ok) {
                    throw new Error(`Failed to fetch tokens: ${tokensResponse.statusText}`);
                }
                const allTokens: ApiToken[] = await tokensResponse.json();
                console.log(`[DEBUG] Total tokens fetched: ${allTokens.length}`);

                // 2. Agrupar tokens por rede
                const tokensByNetwork: Record<string, ApiToken[]> = {};
                allTokens.forEach(token => {
                    const networkName = token.network.name || 'Unknown';
                    if (!tokensByNetwork[networkName]) {
                        tokensByNetwork[networkName] = [];
                    }
                    tokensByNetwork[networkName].push(token);
                });
                console.log(`[DEBUG] Tokens grouped by network:`, Object.keys(tokensByNetwork));

                // 3. Buscar pools para cada rede
                const allPools: Pool[] = [];

                for (const [networkName, networkTokens] of Object.entries(tokensByNetwork)) {
                    console.log(`[DEBUG] Processing network: ${networkName}, tokens: ${networkTokens.length}`);

                    // Gerar combinações únicas de pares por rede
                    const tokenPairs: { token0: string; token1: string }[] = [];
                    for (let i = 0; i < networkTokens.length; i++) {
                        for (let j = i + 1; j < networkTokens.length; j++) {
                            const token0Addr = networkTokens[i].address.toLowerCase();
                            const token1Addr = networkTokens[j].address.toLowerCase();
                            // Ordenar os endereços para garantir consistência
                            const [t0, t1] = token0Addr < token1Addr
                                ? [token0Addr, token1Addr]
                                : [token1Addr, token0Addr];
                            tokenPairs.push({ token0: t0, token1: t1 });
                        }
                    }
                    console.log(`[DEBUG] Generated ${tokenPairs.length} token pairs for ${networkName}`);

                    // Buscar pools para cada par na rede atual
                    for (const pair of tokenPairs) {
                        try {
                            const response = await fetch('http://localhost:3000/pools', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    token0: pair.token0,
                                    token1: pair.token1,
                                }),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                const networkPools: Pool[] = (data.pools || []).map((pool: ApiPool) => ({
                                    feeTier: pool.feeTier || '3000',
                                    token0: {
                                        id: pool.token0.id.toLowerCase(),
                                        symbol: pool.token0.symbol || 'UNKNOWN',
                                    },
                                    token1: {
                                        id: pool.token1.id.toLowerCase(),
                                        symbol: pool.token1.symbol || 'UNKNOWN',
                                    },
                                    createdAtTimestamp: pool.createdAtTimestamp || '0',
                                    poolDayData: pool.poolDayData || [],
                                    network: networkName, // Garantir que a rede está incluída
                                }));
                                console.log(`[DEBUG] Fetched ${networkPools.length} pools for pair ${pair.token0}/${pair.token1} in ${networkName}`);
                                allPools.push(...networkPools);
                            }
                        } catch (err) {
                            console.warn(`Error fetching pools for pair in ${networkName}:`, err);
                        }
                    }
                }

                // Deduplicar apenas pools com os mesmos tokens, fee tier E rede
                const uniquePools = allPools.filter(
                    (pool, index, self) =>
                        index ===
                        self.findIndex(
                            p =>
                                p.token0.id === pool.token0.id &&
                                p.token1.id === pool.token1.id &&
                                p.feeTier === pool.feeTier &&
                                p.network === pool.network // Considerar a rede na deduplicação
                        )
                );

                console.log(`[DEBUG] Total unique pools: ${uniquePools.length}`);
                setPools(uniquePools);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch pools:', err);
                setError('Failed to load pool data. Please try again later.');
                setLoading(false);
            }
        };

        fetchAllPools();
    }, []);

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
                <div className="space-y-4">
                    {pools.map((pool, index) => (
                        <PoolListItem
                            key={`${pool.token0.id}-${pool.token1.id}-${pool.feeTier}-${pool.createdAtTimestamp}-${pool.network}`}
                            {...pool}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Pools;
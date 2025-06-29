export interface PoolData {
    _id: string;
    feeTier: string;
    address: string;
    token0: {
        id: string;
        name: string;
        symbol: string;
        address: string;
        decimals: string;
        network: {
            id: string;
            name: string;
            graphqlUrl: string;
        };
    };
    token1: {
        id: string;
        name: string;
        symbol: string;
        address: string;
        decimals: string;
        network: {
            id: string;
            name: string;
            graphqlUrl: string;
        };
    };
    createdAtTimestamp: string;
    poolDayData: Array<{
        date: string;
        feesUSD: string;
        volumeUSD: string;
        tvlUSD: string;
        apr24h: string;
    }>;
}
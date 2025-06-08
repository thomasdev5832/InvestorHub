export interface UniswapPoolResponseDto {
  id: string;
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
    date: string;
    feesUSD: string;
    volumeUSD: string;
    tvlUSD: string;
    apr24h: string;
    poolHourData: {
      volumeUSD: string;
      tvlUSD: string;
      feesUSD: string;
      periodStartUnix: string;
    }[];
  }[];
}

export interface UniswapPoolsResponseDto {
  pools: UniswapPoolResponseDto[];
  blockNumber: string;
} 
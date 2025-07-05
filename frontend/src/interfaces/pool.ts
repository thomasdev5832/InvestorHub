import { Token } from "./token";
import { PoolDayData } from "./pooldaydata";

export interface Pool {
    _id: string;
    feeTier: string;
    token0: Token;
    token1: Token;
    createdAtTimestamp: string;
    poolDayData: PoolDayData[];
}

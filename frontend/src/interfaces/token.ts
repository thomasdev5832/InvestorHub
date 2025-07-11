import { Network } from "./network";

export interface Token {
    id: string;
    symbol: string;
    name: string;
    address: string;
    network: Network;
    decimals: number;
}

export interface PartialToken {
    symbol: string;
    address: string;
    decimals: number;
}
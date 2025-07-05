import { sepolia, baseSepolia } from "viem/chains";

export function getChain(chainId: string) {
    switch (chainId) {
        case "epi:11155111":
            return sepolia;
        case "epi:84532":
            return baseSepolia;
        default:
            return sepolia;
    }
}
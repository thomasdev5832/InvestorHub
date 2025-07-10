import { NetworkConfig } from "../interfaces/NetworkConfig";

export const NETWORKS_CONFIGS: Record<string, NetworkConfig> = {
    "eip155:11155111": {
        positionManagerAddress: "0x1238536071E1c677A632429e3655c799b22cDA52",
        providerUrl: "https://eth-sepolia.api.onfinality.io/public"
    },
    "eip155:84532": {
        positionManagerAddress: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
        providerUrl: "https://sepolia.base.org"
    },
    "eip155:1": {
        positionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        providerUrl: "https://eth.llamarpc.com"
    }
}
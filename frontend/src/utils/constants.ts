export const QUOTER_CONTRACT_ADDRESS = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3'

interface NetworkConfig {
    usdToken: {
        address: string;
        decimals: number;
    };
    quoterContract: string;
}

export const NETWORKS_CONFIGS: Record<string, NetworkConfig> = {
    "eip155:11155111": {
        usdToken: {
            address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
            decimals: 6,
        },
        quoterContract: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3"
    },
    "eip155:84532": {
        usdToken: {
            address: '0x0000000000000000000000000000000000000000',
            decimals: 6,
        },
        quoterContract: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27"
    }
}
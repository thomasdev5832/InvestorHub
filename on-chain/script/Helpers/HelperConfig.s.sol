// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 } from "forge-std/Script.sol";
import { Vm } from "forge-std/Vm.sol";

// import { DevOpsTools } from "@cyfrin/src/DevOpsTools.sol";

contract HelperConfig is Script {
    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/
    struct NetworkConfig {
        address admin;
        address multisig;
        address ownership;
        address cut;
        address loupe;
        address diamond;
        address initializer; //@question is needed? TODO: Ensure this initializer is needed.
        DexSpecifications dex;
        StakingSpecifications stake;
    }

    struct DexSpecifications{
        address routerUniV3;
    }

    struct StakingSpecifications{
        address aavePool;
        address compoundController;
        address uniswapFactory;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    // Magic Number Removal
    uint256 constant LOCAL_CHAIN_ID = 31337;

    // Local network state variables
    NetworkConfig public s_localNetworkConfig;
    mapping(uint256 chainId => NetworkConfig) public s_networkConfigs;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error HelperConfig__InvalidChainId();


    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    constructor() {
        // Not initiating any chain on constructor
        // networkConfigs[BASE_SEPOLIA_CHAIN_ID] = getSepoliaEthConfig();
        // networkConfigs[BASE_MAINNET_CHAIN_ID] = getMainnetEthConfig();
    }

    function getConfig() public returns (NetworkConfig memory) {
        return getConfigByChainId(block.chainid);
    }

    function setConfig(uint256 chainId, NetworkConfig memory networkConfig) public {
        s_networkConfigs[chainId] = networkConfig;
    }

    function getConfigByChainId(uint256 chainId) public returns (NetworkConfig memory) {
        if (s_networkConfigs[chainId].diamond != address(0)) {
            return s_networkConfigs[chainId];
        } else if (chainId == LOCAL_CHAIN_ID) {
            return getOrCreateAnvilEthConfig();
        } else {
            revert HelperConfig__InvalidChainId();
        }
    }

    function getMainnetBaseConfig() public view returns (NetworkConfig memory mainnetNetworkConfig) {
        mainnetNetworkConfig = NetworkConfig({
            admin: vm.envAddress("ADMIN_MAINNET_PUBLIC_KEY"),
            multisig: address(0),
            ownership: address(0),
            cut: address(0),
            loupe: address(0),
            diamond: address(0),
            initializer: address(0),
            dex: DexSpecifications({
                routerUniV3: address(0)
            }),
            stake: StakingSpecifications({
                aavePool: address(0),
                compoundController: address(0),
                uniswapFactory: address(0)
            })
        });
    }

    function getSepoliaBaseConfig() public view returns (NetworkConfig memory sepoliaNetworkConfig) {
        sepoliaNetworkConfig = NetworkConfig({
            admin: vm.envAddress("ADMIN_TESTNET_PUBLIC_KEY"),
            multisig: address(0),
            ownership: address(0),
            cut: address(0),
            loupe: address(0),
            diamond: address(0),
            initializer: address(0),
            dex: DexSpecifications({
                routerUniV3: address(0)
            }),
            stake: StakingSpecifications({
                aavePool: address(0),
                compoundController: address(0),
                uniswapFactory: address(0)
            })
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
        // Check to see if we set an active network config
        if (s_localNetworkConfig.diamond != address(0)) {
            return s_localNetworkConfig;
        }

        s_localNetworkConfig = NetworkConfig({
            admin: address(1),
            multisig: address(77),
            ownership: address(0),
            cut: address(0),
            loupe: address(0),
            diamond: address(0),
            initializer: address(0),
            dex: DexSpecifications({
                routerUniV3: address(0)
            }),
            stake: StakingSpecifications({
                aavePool: address(0),
                compoundController: address(0),
                uniswapFactory: address(0)
            })
        });

        return s_localNetworkConfig;
    }
}
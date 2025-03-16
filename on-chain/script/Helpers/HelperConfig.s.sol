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
        address uniswapV3PositionManager;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    // Magic Number Removal
    uint256 constant LOCAL_CHAIN_ID = 31337;
    uint256 constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint256 constant BASE_MAINNET_CHAIN_ID = 8453;

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
        s_networkConfigs[BASE_SEPOLIA_CHAIN_ID] = getSepoliaBaseConfig();
        s_networkConfigs[BASE_MAINNET_CHAIN_ID] = getMainnetBaseConfig();
    }

    function getConfig() public returns (NetworkConfig memory) {
        return getConfigByChainId(block.chainid);
    }

    function setConfig(uint256 chainId, NetworkConfig memory networkConfig) public {
        s_networkConfigs[chainId] = networkConfig;
    }

    function getConfigByChainId(uint256 _chainId) public returns (NetworkConfig memory) {
        if (_chainId != LOCAL_CHAIN_ID) {
            return s_networkConfigs[_chainId];
        } else if(s_networkConfigs[_chainId].diamond != address(0)) {
            return s_networkConfigs[_chainId];
        } else if (_chainId == LOCAL_CHAIN_ID) {
            return getOrCreateAnvilEthConfig();
        } else {
            revert HelperConfig__InvalidChainId();
        }
    }

    function getMainnetBaseConfig() public view returns (NetworkConfig memory mainnetNetworkConfig) {
        mainnetNetworkConfig = NetworkConfig({
            admin: vm.envAddress("ADMIN_TESTNET_PUBLIC_KEY"),
            multisig: vm.envAddress("MULTISIG_TESTNET_FAKE_ADDRESS"),
            ownership: address(0),
            cut: address(0),
            loupe: address(0),
            diamond: address(0),
            initializer: address(0),
            dex: DexSpecifications({
                routerUniV3: 0x2626664c2603336E57B271c5C0b26F421741e481
            }),
            stake: StakingSpecifications({
                aavePool: address(0),
                compoundController: address(0),
                uniswapFactory: address(0),
                uniswapV3PositionManager: 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1
            })
        });
    }

    function getSepoliaBaseConfig() public view returns (NetworkConfig memory sepoliaNetworkConfig) {
        sepoliaNetworkConfig = NetworkConfig({
            admin: vm.envAddress("ADMIN_TESTNET_PUBLIC_KEY"),
            multisig: 0x430d63511142f22534eAda6C50B5d183771F2390, //Burner Wallet to Forked Tests
            ownership: address(0),
            cut: address(0),
            loupe: address(0),
            diamond: address(0),
            initializer: address(0),
            dex: DexSpecifications({
                routerUniV3: 0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4
            }),
            stake: StakingSpecifications({
                aavePool: address(0),
                compoundController: address(0),
                uniswapFactory: address(0),
                uniswapV3PositionManager: 0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2
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
                uniswapFactory: address(0),
                uniswapV3PositionManager: address(0)
            })
        });

        return s_localNetworkConfig;
    }
}
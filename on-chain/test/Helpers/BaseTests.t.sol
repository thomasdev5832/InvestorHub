// // SPDX-License-Identifier: UNLICENSED
// pragma solidity 0.8.26;

// ///Foundry 
// import {Test, console} from "forge-std/Test.sol";

// ///Protocol Scripts
// import { HelperConfig } from "script/Helpers/HelperConfig.sol";
// import { DeployInit } from "script/DeployInit.s.sol";

// //--> Vault
// import { VaultAutomation } from "src/vault/VaultAutomation.sol";

// ///Protocol Base Contracts
// import { Diamond } from "src/Diamond.sol";
// import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";
// import { DiamondLoupeFacet } from "src/diamond/DiamondLoupeFacet.sol";
// import { OwnershipFacet } from "src/diamond/OwnershipFacet.sol";

// ///Protocol Upgrade Initializers
// import { DiamondInitializer } from "src/upgradeInitializers/DiamondInitializer.sol";
// import { DiamondMultiInit } from "src/upgradeInitializers/DiamondMultiInit.sol";

// //Protocol Facet Contracts
// import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
// import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

// contract BaseTests is Test {
//     ///Instantiate Scripts
//     HelperConfig public s_helperConfig;
//     HelperConfig public s_helperConfigArb;
//     DeployInit public s_deploy;
    
//     ///Instantiate Contracts
//     //->Base
//     Diamond public s_diamond;
//     DiamondCutFacet public s_cut;
//     DiamondLoupeFacet public s_loupe;
//     OwnershipFacet public s_ownership;
//     //->Arb
//     Diamond public s_diamondArb;
//     DiamondCutFacet public s_cutArb;
//     DiamondLoupeFacet public s_loupeArb;
//     OwnershipFacet public s_ownershipArb;

//     ///Instantiate Upgrade Initializers
//     DiamondInitializer public s_initializer;
//     DiamondMultiInit public s_multi;

//     ///Proxied Interfaces
//     OwnershipFacet public s_ownershipWrapper;
//     DiamondCutFacet public s_cutWrapper;
//     DiamondLoupeFacet public s_loupeWrapper;
//     //->Base
//     IStartSwapFacet public s_uniSwapWrapper;
//     IStartPositionFacet public s_uniStakeWrapper;
//     //->Arb
//     IStartSwapFacet public s_uniSwapWrapperArb;
//     IStartPositionFacet public s_uniStakeWrapperArb;

//     ///Addresses
//     address constant s_owner = address(1);
//     address constant s_ownerCandidate = address(17);
//     address constant s_user02 = address(2);
//     address constant s_user03 = address(3);
//     address constant s_user04 = address(4);
//     address constant s_user05 = address(5);
//     address s_multiSig = vm.envAddress("MULTISIG_TESTNET_FAKE_ADDRESS");

//     ///Utils - Fake Addresses
//     address uniswapRouter = makeAddr("uniswapRouter");

//     function setUp() public virtual {
//         //1. Deploys DeployInit script
//         s_deploy = new DeployInit();

//         //3. Deploy Base Contracts
//         (
//             s_helperConfig,
//             s_diamond
//         ) = s_deploy.run();
        
//         //4. Deploy Facets
//         s_startSwapScript.run(s_helperConfig);
//         s_startPositionScript.run(s_helperConfig);

//         //5. Wrap the proxy with Facets
//         s_ownershipWrapper = OwnershipFacet(address(s_diamond));
//         s_cutWrapper = DiamondCutFacet(address(s_diamond));
//         s_loupeWrapper = DiamondLoupeFacet(address(s_diamond));
//         s_uniSwapWrapper = IStartSwapFacet(address(s_diamond));
//     }
    
// }

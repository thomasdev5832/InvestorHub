// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Foundry 
import {Test, console} from "forge-std/Test.sol";

///Protocol Scripts
import { HelperConfig } from "script/Helpers/HelperConfig.s.sol";
import { DeployInit } from "script/DeployInit.s.sol";

//--> Dex
import { StartSwapScript } from "script/Facets/UniswapV3/dex/StartSwapScript.s.sol";
import { StartSwapScriptV3 } from "script/Facets/UniswapV3/dex/StartSwapScriptV3.s.sol";
import { StartFullSwapScript } from "script/Facets/UniswapV3/dex/StartFullSwapScript.s.sol";
import { StartFullSwapScriptV3 } from "script/Facets/UniswapV3/dex/StartFullSwapScriptV3.s.sol";
//--> Stake
import { StartPositionScript } from "script/Facets/UniswapV3/stake/StartPositionScript.s.sol";
import { StartPositionAfterSwapScript } from "script/Facets/UniswapV3/stake/StartPositionAfterSwapScript.s.sol";
import { CollectFeesScript } from "script/Facets/UniswapV3/stake/CollectFeesScript.s.sol";
import { DecreaseLiquidityScript } from "script/Facets/UniswapV3/stake/DecreaseLiquidityScript.s.sol";
import { IncreaseLiquidityScript } from "script/Facets/UniswapV3/stake/IncreaseLiquidityScript.s.sol";

///Protocol Base Contracts
import { Diamond } from "src/Diamond.sol";
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "src/diamond/DiamondLoupeFacet.sol";
import { OwnershipFacet } from "src/diamond/OwnershipFacet.sol";

///Protocol Upgrade Initializers
import { DiamondInitializer } from "src/upgradeInitializers/DiamondInitializer.sol";
import { DiamondMultiInit } from "src/upgradeInitializers/DiamondMultiInit.sol";

//Protocol Facet Contracts
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

contract BaseTests is Test {
    ///Instantiate Scripts
    HelperConfig public s_helperConfig;
    HelperConfig public s_helperConfigArb;
    DeployInit public s_deploy;
    //--> Dex
    StartSwapScript public s_startSwapScript;
    StartSwapScriptV3 public s_startSwapScriptV3;
    StartFullSwapScript public s_startFullSwapScript;
    StartFullSwapScriptV3 public s_startFullSwapScriptV3;
    //--> Stake
    //-> base
    StartPositionScript public s_startPositionScript;
    StartPositionAfterSwapScript public s_startPositionAfterSwapScript;
    CollectFeesScript public s_collectFeesScript;
    DecreaseLiquidityScript public s_decreaseLiquidityScript;
    IncreaseLiquidityScript public s_increaseLiquidityScript;
    //-> Arb
    StartPositionScript public s_startPositionScriptArb;
    StartPositionAfterSwapScript public s_startPositionAfterSwapScriptArb;
    CollectFeesScript public s_collectFeesScriptArb;
    DecreaseLiquidityScript public s_decreaseLiquidityScriptArb;
    IncreaseLiquidityScript public s_increaseLiquidityScriptArb;
    
    ///Instantiate Contracts
    //->Base
    Diamond public s_diamond;
    DiamondCutFacet public s_cut;
    DiamondLoupeFacet public s_loupe;
    OwnershipFacet public s_ownership;
    //->Arb
    Diamond public s_diamondArb;
    DiamondCutFacet public s_cutArb;
    DiamondLoupeFacet public s_loupeArb;
    OwnershipFacet public s_ownershipArb;

    ///Instantiate Upgrade Initializers
    DiamondInitializer public s_initializer;
    DiamondMultiInit public s_multi;

    ///Proxied Interfaces
    OwnershipFacet public s_ownershipWrapper;
    DiamondCutFacet public s_cutWrapper;
    DiamondLoupeFacet public s_loupeWrapper;
    //->Base
    IStartSwapFacet public s_uniSwapWrapper;
    IStartPositionFacet public s_uniStakeWrapper;
    //->Arb
    IStartSwapFacet public s_uniSwapWrapperArb;
    IStartPositionFacet public s_uniStakeWrapperArb;

    ///Addresses
    address constant s_owner = address(1);
    address constant s_ownerCandidate = address(17);
    address constant s_user02 = address(2);
    address constant s_user03 = address(3);
    address constant s_user04 = address(4);
    address constant s_user05 = address(5);
    address s_multiSig = vm.envAddress("MULTISIG_TESTNET_FAKE_ADDRESS");

    ///Utils - Fake Addresses
    address uniswapRouter = makeAddr("uniswapRouter");

    function setUp() public virtual {
        //1. Deploys DeployInit script
        s_deploy = new DeployInit();
        s_startSwapScript = new StartSwapScript();
        s_startPositionScript = new StartPositionScript();
        s_startPositionAfterSwapScript = new StartPositionAfterSwapScript();
        
        //2. Deploy Initializer
        s_initializer = new DiamondInitializer();

        //3. Deploy Base Contracts
        (
            s_helperConfig,
            s_ownership,
            s_cut,
            s_loupe,
            s_diamond,
        ) = s_deploy.run();
        
        //4. Deploy Facets
        s_startSwapScript.run(s_helperConfig);
        s_startPositionScript.run(s_helperConfig);
        s_startPositionAfterSwapScript.run(s_helperConfig);

        //5. Wrap the proxy with Facets
        s_ownershipWrapper = OwnershipFacet(address(s_diamond));
        s_cutWrapper = DiamondCutFacet(address(s_diamond));
        s_loupeWrapper = DiamondLoupeFacet(address(s_diamond));
        s_uniSwapWrapper = IStartSwapFacet(address(s_diamond));
    }

    
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Foundry 
import {Test, console} from "forge-std/Test.sol";

///Protocol Scripts
import { HelperConfig } from "script/Helpers/HelperConfig.s.sol";
import { DeployInit } from "script/DeployInit.s.sol";
import { StartSwapScript } from "script/Facets/UniswapV3/StartSwapScript.s.sol";
import { StartPositionScript } from "script/Facets/UniswapV3/StartPositionScript.s.sol";
import { StartSwapScriptV3 } from "script/Facets/UniswapV3/StartSwapScriptV3.s.sol";

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

contract BaseTests is Test {
    //Instantiate Scripts
    HelperConfig public s_helperConfig;
    DeployInit public s_deploy;
    StartSwapScript public s_startSwapScript;
    StartPositionScript public s_startPositionScript;
    StartSwapScriptV3 public s_startSwapScriptV3;
    
    //Instantiate Contracts
    Diamond public s_diamond;
    DiamondCutFacet public s_cut;
    DiamondLoupeFacet public s_loupe;
    OwnershipFacet public s_ownership;

    //Instantiate Upgrade Initializers
    DiamondInitializer public s_initializer;
    DiamondMultiInit public s_multi;

    //Proxied Interfaces
    OwnershipFacet public s_ownershipWrapper;
    DiamondCutFacet public s_cutWrapper;
    DiamondLoupeFacet public s_loupeWrapper;
    IStartSwapFacet public s_uniSwapWrapper;

    //Addresses
    address constant s_owner = address(1);
    address constant s_ownerCandidate = address(17);
    address constant s_multiSig = address(77);
    address constant s_user02 = address(2);
    address constant s_user03 = address(3);
    address constant s_user04 = address(4);
    address constant s_user05 = address(5);

    //Utils - Fake Addresses
    address uniswapRouter = makeAddr("uniswapRouter");

    function setUp() public virtual {
        //1. Deploys DeployInit script
        s_deploy = new DeployInit();
        s_startSwapScript = new StartSwapScript();
        s_startPositionScript = new StartPositionScript();
        
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

        //5. Wrap the proxy with Facets
        s_ownershipWrapper = OwnershipFacet(address(s_diamond));
        s_cutWrapper = DiamondCutFacet(address(s_diamond));
        s_loupeWrapper = DiamondLoupeFacet(address(s_diamond));
        s_uniSwapWrapper = IStartSwapFacet(address(s_diamond));
    }

    
}

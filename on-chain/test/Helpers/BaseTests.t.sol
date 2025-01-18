// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Foundry 
import {Test, console} from "forge-std/Test.sol";

///Protocol Scripts
import { HelperConfig } from "../../script/Helpers/HelperConfig.s.sol";
import { DeployInit } from "../../script/DeployInit.s.sol";

///Protocol Base Contracts
import { Diamond } from "../../src/Diamond.sol";
import { DiamondCutFacet } from "../../src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "../../src/diamond/DiamondLoupeFacet.sol";
import { OwnershipFacet } from "../../src/diamond/OwnershipFacet.sol";

///Protocol Upgrade Initializers
import { DiamondInitializer } from "../../src/upgradeInitializers/DiamondInitializer.sol";
import { DiamondMultiInit } from "../../src/upgradeInitializers/DiamondMultiInit.sol";

//Protocol Facet Contracts
import { Uniswap } from "../../src/facets/Uniswap.sol";
import { Test1Facet } from "../../src/facets/Test1Facet.sol";
import { Test2Facet } from "../../src/facets/Test2Facet.sol";

contract BaseTests is Test {
    //Instantiate Scripts
    HelperConfig public s_helperConfig;
    DeployInit public s_deploy;
    
    //Instantiate Contracts
    Diamond public s_diamond;
    DiamondCutFacet public s_cut;
    DiamondLoupeFacet public s_loupe;
    OwnershipFacet public s_ownership;

    //Instantiate Upgrade Initializers
    DiamondInitializer public s_initializer;
    DiamondMultiInit public s_multi;

    //Instantiate Facet's
    Uniswap public s_uni;
    Test1Facet public s_one;
    Test2Facet public s_two;

    //Proxied Interfaces
    DiamondCutFacet public s_cutProxy;
    DiamondLoupeFacet public s_loupeProxy;
    Uniswap public s_uniProxy;
    Test1Facet public s_oneProxy;
    Test2Facet public s_twoProxy;

    //Addresses
    address s_admin = address(1);
    address s_multiSig = address(77);
    address s_user02 = address(2);
    address s_user03 = address(3);
    address s_user04 = address(4);
    address s_user05 = address(5);

    //Utils - Fake Addresses
    address uniswapRouter = makeAddr("uniswapRouter");

    function setUp() public {
        //1. Deploys DeployInit script
        s_deploy = new DeployInit();
        
        //2. Deploy Initializer
        s_initializer = new DiamondInitializer();

        //3. Deploy Base Contracts
        (
            s_helperConfig,
            s_ownership,
            s_cut,
            s_loupe,
            s_diamond
        ) = s_deploy.run();
        
        //4. Deploy Facets
        s_uni = new Uniswap(
            address(s_diamond),
            uniswapRouter,
            s_multiSig
        );

        //5. Wrap the proxy with Facets
        s_cutProxy = DiamondCutFacet(address(s_diamond));
        s_loupeProxy = DiamondLoupeFacet(address(s_diamond));
        s_uniProxy = Uniswap(address(s_diamond));
        s_oneProxy = Test1Facet(address(s_diamond));
        s_twoProxy = Test2Facet(address(s_diamond));
    }
}

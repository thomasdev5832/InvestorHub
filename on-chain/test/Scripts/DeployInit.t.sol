//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Foundry Stuff
import { Test, console } from "forge-std/Test.sol";

//Script to Test
import { DeployInit } from "script/DeployInit.s.sol";
import { HelperConfig } from "script/Helpers/HelperConfig.s.sol";

//Protocol's Contracts
import { OwnershipFacet } from "src/diamond/OwnershipFacet.sol";
import { DiamondCutFacet} from "src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "src/diamond/DiamondLoupeFacet.sol";
import { Diamond } from "src/Diamond.sol";
import { DiamondInitializer } from "src/upgradeInitializers/DiamondInitializer.sol";

contract DeployInitTest is Test {
    ///Script To be tested
    HelperConfig s_helperConfig;
    DeployInit s_deploy;

    //Protocol that should be deployed
    OwnershipFacet s_ownership;
    DiamondCutFacet s_cut;
    DiamondLoupeFacet s_loupe;
    Diamond s_diamond;
    DiamondInitializer s_initializer;

    //Diamond Wrappers
    OwnershipFacet s_ownershipWrapper;
    DiamondCutFacet s_cutWrapper;
    DiamondLoupeFacet s_loupeWrapper;
    DiamondInitializer s_initWrapper;

    //Test utils
    address s_owner = address(1);

    function setUp() external {
        s_deploy = new DeployInit();
        (
            s_helperConfig,
            s_ownership,
            s_cut,
            s_loupe,
            s_diamond,
            s_initializer
        ) = s_deploy.run();

        s_ownershipWrapper = OwnershipFacet(address(s_diamond));
        s_cutWrapper = DiamondCutFacet(address(s_diamond));
        s_loupeWrapper = DiamondLoupeFacet(address(s_diamond));
        s_initWrapper = DiamondInitializer(address(s_diamond));
    }

    //Checking Deployments
    function test_ifContractsWereDeployedCorrectly() external view {
        assertTrue(address(s_helperConfig) != address(0));
        assertTrue(address(s_ownership) != address(0));
        assertTrue(address(s_diamond) != address(0));
        assertTrue(address(s_cut) != address(0));
        assertTrue(address(s_loupe) != address(0));
    }

    //Checking Initializations
    //There is nothing critical to be initialized in here.
    //@question Is there a problem with the double initialization?
    //Normally it should revert
    function test_diamondInitializedCorrectly() external {
        vm.prank(s_owner);
        vm.expectRevert();
        s_initWrapper.init();
    }
}
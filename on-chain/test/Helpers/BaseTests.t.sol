// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Foundry 
import {Test, console} from "forge-std/Test.sol";

///Protocol Scripts
import { HelperConfig } from "script/helpers/HelperConfig.sol";
import { DeployInit } from "script/DeployInit.s.sol";

contract BaseTests is Test {
    ///Instantiate Environment Storage
    HelperConfig helperConfig;
    HelperConfig.NetworkConfig c;

    ///Global Diamond address;
    address public d;

    ///Addresses
    address constant ownerCandidate = address(17);
    address constant user02 = address(2);
    address constant user03 = address(3);

    function setUp() public virtual {
        //1. Deploys DeployInit script
        DeployInit deploy = new DeployInit();

        //2. Deploy Contracts and Initiate Facets
        (
            helperConfig,
            d
        ) = deploy.run();
        //Set the configs to a global variable
        c = helperConfig.getConfig();

        vm.label(ownerCandidate, "OWNER_CANDIDATE");
        vm.label(user02, "USER02");
        vm.label(user03, "USER03");
    }
    
}

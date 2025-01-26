//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Foundry Stuff
import { console } from "forge-std/Console.sol";

//Helpers
import { BaseTests } from "./BaseTests.t.sol";

//Scripts
import { DeployInit } from "script/DeployInit.s.sol";

//Protocol contracts
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "src/diamond/DiamondLoupeFacet.sol";
import { IUniswapFacet  } from "src/interfaces/IUniswapFacet.sol";

contract ForkedHelper is BaseTests {

    string BASE_SEP_RPC_URL = vm.envString("BASE_SEP_RPC_URL");
    string BASE_RPC_URL = vm.envString("BASE_RPC_URL");
    uint256 baseSepolia;
    uint256 baseMainnet;

    function setUp() public override {
        //Create Forked Environment
        baseSepolia = vm.createFork(BASE_SEP_RPC_URL);
        baseMainnet = vm.createFork(BASE_RPC_URL);
        //Select the fork will be used
        vm.selectFork(baseSepolia);

        s_deploy = new DeployInit();

        (,,,,s_diamond,) = s_deploy.run();

        IUniswapFacet uni = IUniswapFacet(address(s_diamond));
    }
}
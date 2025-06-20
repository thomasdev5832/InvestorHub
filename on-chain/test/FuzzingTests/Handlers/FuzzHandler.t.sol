//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Foundry Stuff
import { Test } from "forge-std/Test.sol";

//Scripts
import { DeployInit } from "script/DeployInit.s.sol";

//Protocol Contracts
import { Diamond } from "src/Diamond.sol";

//Protocol Interfaces
import { IDiamond } from "src/interfaces/IDiamond.sol";
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";
import { IDiamondLoupe } from "src/interfaces/IDiamondLoupe.sol";
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";

contract FuzzHandler is Test {
    //Deploy Script Instance
    DeployInit s_deploy;

    //Contracts Instances
    Diamond s_diamond;
    IDiamondCut s_cutWrapper;
    IDiamondLoupe s_loupeWrapper;

    function setUp() external {
        s_deploy = new DeployInit();

        (,s_diamond) = s_deploy.run();

        s_cutWrapper = IDiamondCut(address(s_diamond));
        s_loupeWrapper = IDiamondLoupe(address(s_diamond));
    }

    //Test something
}
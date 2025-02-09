// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Test Base
import {BaseTests} from "test/Helpers/BaseTests.t.sol";

//Scripts
import { StartSwapScript } from "script/Facets/UniswapV3/StartSwapScript.s.sol";

//Contract Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

contract StartSwapScriptTest is BaseTests {

    ///@notice many empty info. Need to update when with internet and do some sanity checks.
    function test_addUniswapFacet() public {
        //Cast the diamond address as Uniswap to call uniswap functions.
        IStartSwapFacet uni = IStartSwapFacet(address(s_diamond));

        IStartSwapFacet.DexPayload memory dexPayload;
        INonFungiblePositionManager.MintParams memory stakePayload;

        //Revert because I am passing fake payloads
        vm.expectRevert();
        uni.startSwap(dexPayload, stakePayload);
    }
}
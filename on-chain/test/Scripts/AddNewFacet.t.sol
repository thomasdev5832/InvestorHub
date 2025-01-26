// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Test Base
import {BaseTests} from "test/Helpers/BaseTests.t.sol";

//Scripts
import { AddNewFacet } from "script/Facets/AddNewFacet.s.sol";

//Contract Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";
import { IUniswapFacet } from "src/interfaces/IUniswapFacet.sol";

contract AddNewFacetTest is BaseTests {

    ///@notice many empty info. Need to update when with internet and do some sanity checks.
    function test_addUniswapFacet() public {
        //Deploy the NewFacet Script
        AddNewFacet facet = new AddNewFacet();
        //Run the Script - No need to return anything
        facet.run(s_helperConfig);
        //Cast the diamond address as Uniswap to call uniswap functions.
        IUniswapFacet uni = IUniswapFacet(address(s_diamond));

        //Revert because I am passing fakeAddresses
        vm.expectRevert();
        uni.startPosition("");
    }
}
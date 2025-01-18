// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { BaseTests } from "../Helpers/BaseTests.t.sol";
import { IDiamondCut } from "../../src/interfaces/IDiamondCut.sol";

contract DiamondUnit is BaseTests {

    function test_ifContractsWereDeployedCorrectly() external view {
        assertTrue(address(s_helperConfig) != address(0));
        assertTrue(address(s_ownership) != address(0));
        assertTrue(address(s_diamond) != address(0));
        assertTrue(address(s_cut) != address(0));
        assertTrue(address(s_loupe) != address(0));
    }

    function test_addUniswapFacet() public {
        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = s_uni.startPosition.selector;
        selectors[1] = s_uni.endPosition.selector;

        IDiamondCut.FacetCut memory cut = IDiamondCut.FacetCut({
            facetAddress: address(s_uni),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory firstDiamondCutInput = new IDiamondCut.FacetCut[](1);        
        firstDiamondCutInput[0] = cut;

        vm.prank(s_admin);
        s_cutProxy.diamondCut(
            firstDiamondCutInput,
            address(0),
            ""
        );
    }
}
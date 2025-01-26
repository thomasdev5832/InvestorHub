// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Test helpers
import { BaseTests } from "test/Helpers/BaseTests.t.sol";

//Protocol Contracts
import { OwnershipFacet } from "src/diamond/OwnershipFacet.sol";
import { Diamond } from "src/Diamond.sol";

//Protocols Facets
import { UniswapFacet } from "src/facets/UniswapFacet.sol";

//Protocol Lib
import { LibDiamond } from "src/libraries/LibDiamond.sol";

//Protocol Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";


contract DiamondUnit is BaseTests {

    /*////////////////////////////////////////
                    Ownership Facet
    ////////////////////////////////////////*/
    ///@notice `transferOwnership` revert When Caller is not Owner
    function test_transferOwnershipRevertBecauseOfCallerIsNotOwner() public{
        vm.expectRevert(abi.encodeWithSelector(LibDiamond.LibDiamond_NotContractOwner.selector, address(this), s_owner));
        s_ownershipWrapper.transferOwnership(s_ownerCandidate);
    }

    ///@notice `transferOwnership` propose transfers and emit and event
    function test_transferOwnershipAndGetCandidateOwner() public {
        vm.prank(s_owner);
        vm.expectEmit();
        emit OwnershipFacet.OwnershipFacet_OwnershipTransferProposed(s_ownerCandidate, s_owner);
        s_ownershipWrapper.transferOwnership(s_ownerCandidate);

        assertEq(s_ownershipWrapper.ownerCandidate(), s_ownerCandidate);
    }

    ///@notice `claimOwnership revert when caller is not the candidate
    function test_claimOwnershipRevertWhenTheCallerIsNotTheCandidate() public{
        //calls the test above to not repeat logic
        test_transferOwnershipAndGetCandidateOwner();
        
        vm.expectRevert(abi.encodeWithSelector(
            OwnershipFacet.OwnershipFacet_NotTheOwnerCandidate.selector,
            address(this),
            s_ownerCandidate
        ));
        s_ownershipWrapper.claimOwnership();
    }

    ///@notice `claimOwnership`transfers owner powers to `s_ownerCandidate`
    function test_claimOwnershipTransfersOwnerCorrectly() public {
        test_transferOwnershipAndGetCandidateOwner();

        vm.prank(s_ownerCandidate);
        vm.expectEmit();
        ///@notice repeats s_ownerCandidate because one is the candidate address e the second is the updated owner
        emit OwnershipFacet.OwnershipFacet_OwnershipTransferred(s_ownerCandidate, s_ownerCandidate);
        s_ownershipWrapper.claimOwnership();
    }

    ///@notice query owner @dev Must never revert
    function test_getOwner() public view {
        assertEq(s_ownershipWrapper.owner(), s_owner);
    }


    /*////////////////////////////////////////
                Diamond Cut Facet
    ////////////////////////////////////////*/
    ///@notice `diamondCut` revert when the caller is not the owner
    function test_diamondCutRevertWhenCallerIsNotOwner() public {
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);

        vm.expectRevert(abi.encodeWithSelector(LibDiamond.LibDiamond_NotContractOwner.selector, address(this), s_owner));
        s_cutWrapper.diamondCut(
            cut,
            address(0),
            ""
        );
    }

    ///@notice `diamondCut` revert when owner tries to remove core facet
    //@question how to revert trying to remove a core function? TODO
    function test_diamondCutRevertsWhenTryToRemoveCoreFacet() public{
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = IDiamondCut.diamondCut.selector;
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = IDiamondCut.FacetCut(
            address(0),
            IDiamondCut.FacetCutAction.Remove,
            selectors
        );

        vm.prank(s_owner);
        vm.expectRevert(abi.encodeWithSelector(LibDiamond.LibDiamond_CannotRemoveImmutableFunction.selector, IDiamondCut.diamondCut.selector));
        s_cutWrapper.diamondCut(
            cut,
            address(0),
            ""
        );
    }

    ///@notice `diamondCut`revert because receive valid initialization address
    //but no initialization data
    function test_diamondCutRevertBecauseReceiveInitializationAddressButNoData() public {
        //Deploys the new facet
        UniswapFacet uni = new UniswapFacet(
            address(s_diamond),
            uniswapRouter,
            s_multiSig
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = UniswapFacet.startPosition.selector;
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = IDiamondCut.FacetCut(
            address(uni),
            IDiamondCut.FacetCutAction.Add,
            selectors
        );

        vm.prank(s_owner);
        vm.expectRevert(abi.encodeWithSelector(LibDiamond.LibDiamond_ValidAddressButEmptyCalldata.selector, address(s_diamond), ""));
        s_cutWrapper.diamondCut(cut, address(s_diamond), "");
    }

    ///@notice `diamondCut`revert because receive empty address
    //but valid initialization data
    function test_diamondCutRevertBecauseReceiveEmptyInitializationAddressButValidData() public {
        //Deploys the new facet
        UniswapFacet uni = new UniswapFacet(
            address(s_diamond),
            uniswapRouter,
            s_multiSig
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = UniswapFacet.startPosition.selector;
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = IDiamondCut.FacetCut(
            address(uni),
            IDiamondCut.FacetCutAction.Add,
            selectors
        );

        vm.prank(s_owner);
        vm.expectRevert(abi.encodeWithSelector(LibDiamond.LibDiamond_AddressZeroButNotEmptyCalldata.selector, address(0), abi.encodePacked(address(s_diamond))));
        s_cutWrapper.diamondCut(cut, address(0), abi.encodePacked(address(s_diamond)));
    }

    ///@notice `diamondCut` adds new facet to the diamond
    function test_diamondCutAddUniswapFacetToDiamond() public {
        //Deploys the new facet
        UniswapFacet uni = new UniswapFacet(
            address(s_diamond),
            uniswapRouter,
            s_multiSig
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = UniswapFacet.startPosition.selector;
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = IDiamondCut.FacetCut(
            address(uni),
            IDiamondCut.FacetCutAction.Add,
            selectors
        );

        vm.prank(s_owner);
        vm.expectEmit();
        emit LibDiamond.LibDiamond_DiamondCut(cut, address(0), "");
        s_cutWrapper.diamondCut(cut, address(0), "");
    }

    ///@notice replace one facet with another
    function test_diamondCutReplaceUniswapFacetToDiamond() public {
        test_diamondCutAddUniswapFacetToDiamond();
        //Deploys the new facet
        UniswapFacet uni = new UniswapFacet(
            address(s_diamond),
            uniswapRouter,
            s_multiSig
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = UniswapFacet.startPosition.selector;
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = IDiamondCut.FacetCut(
            address(uni),
            IDiamondCut.FacetCutAction.Replace,
            selectors
        );

        vm.prank(s_owner);
        vm.expectEmit();
        emit LibDiamond.LibDiamond_DiamondCut(cut, address(0), "");
        s_cutWrapper.diamondCut(cut, address(0), "");
    }

    ///@notice removes a facet from the protocol
    function test_diamondCutRemovesUniswapFacet() external {
        
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = UniswapFacet.startPosition.selector;
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = IDiamondCut.FacetCut(
            address(0),
            IDiamondCut.FacetCutAction.Remove,
            selectors
        );

        vm.expectEmit();
        emit LibDiamond.LibDiamond_DiamondCut(cut, address(0), "");
        vm.prank(s_owner);
        s_cutWrapper.diamondCut(
            cut,
            address(0),
            ""
        );
    }
}
///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///@notice helper config that contains network information
import { HelperConfig } from "script/helpers/HelperConfig.sol";

///@notice Facet to add facets to the Diamond
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";

///@notice Diamond Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";

abstract contract UpdateFacetHelper{

    /**
        @notice This function will receive a function selector that must
        be equal to an other function selector already added to the diamond
        it will query the "old" facet address and remove it.
        Adding the new one after, using the same selector.
        Basically updating the implementation.
        @param _config the local environment variable
        @param _facet the address for the new implementation facet
        @param _selectors the function selectors to be integrated
        @param _initializer the address of the diamond to initialize the faucet state
        @param _calldata the function + params to be executed
    */
    function updateFacetHelper(
        HelperConfig.NetworkConfig memory _config,
        address _facet,
        bytes4[] memory _selectors,
        address _initializer,
        bytes memory _calldata
    ) public {
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(_facet),
            action: IDiamondCut.FacetCutAction.Replace,
            functionSelectors: _selectors
        });
        
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        cut[0] = facetCut;

        DiamondCutFacet(_config.diamond).diamondCut(
            cut,
            _initializer,
            _calldata
        );
    }
}
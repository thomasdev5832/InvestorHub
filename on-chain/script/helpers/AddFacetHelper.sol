///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///@notice helper config that contains network information
import { HelperConfig } from "script/helpers/HelperConfig.sol";

///@notice Facet to add facets to the Diamond
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";

///@notice Diamond Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";

abstract contract AddFacetHelper{

    function _addFacet(
        HelperConfig.NetworkConfig memory _config,
        address _facet,
        bytes4[] memory _selectors,
        address _initializer,
        bytes memory _calldata
    ) internal {
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(_facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: _selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(_config.diamond).diamondCut(
            cuts,
            _initializer,
            _calldata
        );
    }
}
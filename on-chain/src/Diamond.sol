// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/******************************************************************************\
* Authors: Nick Mudge (https://twitter.com/mudgen)
*
* Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "./libraries/LibDiamond.sol";
import {DiamondCutFacet} from "./diamond/DiamondCutFacet.sol";
import {DiamondLoupeFacet} from "./diamond/DiamondLoupeFacet.sol";
import {OwnershipFacet} from "./diamond/OwnershipFacet.sol";
import {AppStorage} from "./storage/AppStorage.sol";
import {IDiamondCut} from "./interfaces/IDiamondCut.sol";
import {IDiamondLoupe} from "./interfaces/IDiamondLoupe.sol";

contract Diamond {
    AppStorage internal s;

    receive() external payable {}

    constructor(
        address _contractOwner,
        address diamondCutFacet,
        address diamondLoupeFacet
    ) payable {
        //Set Diamonds `owner`
        LibDiamond._setContractOwner(_contractOwner);
        LibDiamond._addDiamondFunctions(diamondCutFacet, diamondLoupeFacet);
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        //Get Diamond Storage
        assembly {
            ds.slot := position
        }
        //Get Facet from Function Selector
        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");
        //Execute external function using delegatecall and return any data
        assembly {
            //Copy func. selector and any arguments
            calldatacopy(0, 0, calldatasize())
            //Execute function call using the specific facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            //Recover any return value
            returndatacopy(0, 0, returndatasize())
            //Return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
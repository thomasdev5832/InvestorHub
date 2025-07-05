// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
import {AppStorage} from "src/storage/AppStorage.sol";

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/
import {LibDiamond} from "./libraries/LibDiamond.sol";

/**
    @title Core Diamond Proxy Contract of InvestorHub structure
    @author 77 Innovation Labs IH Team
    @notice This is a minimal MVP for Chainlink Chromion Hackathon
    @dev This implementation updates require statements for custom errors for optimization purposes
    @custom:pattern-author Nick Mudge(https://twitter.com/mudgen) is the Pattern Author
*/
contract Diamond {
    ///@notice temporary-ish internal storage to manage 2Step Ownership transfers.
    AppStorage internal s;

    ///@notice error emitted when the function signature is not whitelisted
    error Diamond_FunctionDoesNotExist(bytes4 invalidFunctionSignature);

    //@question Do we need this?
    receive() external payable {}

    /*
        *@notice payable constructor to reduce deployment costs
    */
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
        if(facet == address(0)) revert Diamond_FunctionDoesNotExist(msg.sig);

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
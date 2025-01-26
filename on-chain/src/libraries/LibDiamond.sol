/*
 SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.20;
/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import {IDiamondLoupe} from "../interfaces/IDiamondLoupe.sol";

library LibDiamond {
    // Storage Slot for the Diamond Storage
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.diamond.storage");

    /*//////////////////////////////////////
                    TYPES
    ///////////////////////////////////// */
    struct FacetAddressAndPosition {
        address facetAddress;
        uint96 functionSelectorPosition; // position in facetFunctionSelectors.functionSelectors array
    }

    struct FacetFunctionSelectors {
        bytes4[] functionSelectors;
        uint256 facetAddressPosition; // position of facetAddress in facetAddresses array
    }

    struct DiamondStorage {
        // maps function selector to the facet address and
        // the position of the selector in the facetFunctionSelectors.selectors array
        mapping(bytes4 => FacetAddressAndPosition) selectorToFacetAndPosition;
        // maps facet addresses to function selectors
        mapping(address => FacetFunctionSelectors) facetFunctionSelectors;
        // facet addresses
        address[] facetAddresses;
        // Used to query if a contract implements an interface.
        // Used to implement ERC-165.
        mapping(bytes4 => bool) supportedInterfaces;
        // owner of the contract
        address contractOwner;
    }

    /*/////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////// */
    event LibDiamond_OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event LibDiamond_DiamondCut(IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata);

    /*/////////////////////////////////////////////////////
                            ERRORS
    //////////////////////////////////////////////////// */
    error LibDiamond_NoSelectorsGivenToAdd();
    error LibDiamond_NotContractOwner(address _user, address _contractOwner);
    error LibDiamond_NoSelectorsProvidedForFacetForCut(address _facetAddress);
    error LibDiamond_CannotAddSelectorsToZeroAddress(bytes4[] _selectors);
    error LibDiamond_NoBytecodeAtAddress(address _contractAddress);
    error LibDiamond_IncorrectFacetCutAction(uint8 _action);
    error LibDiamond_CannotAddFunctionToDiamondThatAlreadyExists(bytes4 _selector);
    // error LibDiamond_CannotReplaceFunctionsFromFacetWithZeroAddress(bytes4[] _selectors); TODO: Check why this is unused
    // error LibDiamond_CannotReplaceImmutableFunction(bytes4 _selector); TODO: Check why this is unused
    error LibDiamond_CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet(bytes4 _selector);
    // error LibDiamond_CannotReplaceFunctionThatDoesNotExists(bytes4 _selector); TODO: Check why this is unused
    error LibDiamond_RemoveFacetAddressMustBeZeroAddress(address _facetAddress);
    // error LibDiamond_CannotRemoveFunctionThatDoesNotExist(bytes4 _selector); TODO: Check why this is unused
    error LibDiamond_CannotRemoveImmutableFunction(bytes4 _selector);
    error LibDiamond_InitializationFunctionReverted(address _initializationContractAddress, bytes _calldata);
    error LibDiamond_AddressZeroButNotEmptyCalldata(address init, bytes _calldata);
    error LibDiamond_ValidAddressButEmptyCalldata(address init, bytes _calldata);
    error LibDiamond_CannotRemoveFunctionFromNonExistentFacet();


    /*/////////////////////////////////////////////////////
                            FUNCTIONS
    //////////////////////////////////////////////////// */

    /**
        *@notice internal function to update the contract owner
    */
    function _setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = _diamondStorage();
        address previousOwner = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit LibDiamond_OwnershipTransferred(previousOwner, _newOwner);
    }

    function _addDiamondFunctions(address _diamondCutFacet, address _diamondLoupeFacet) internal {
        //Create a new FaceCut struct[]
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](2);
        //Creates a new bytes4[] for function selectors
        bytes4[] memory functionSelectors = new bytes4[](1);
        //Add a specific selector to the array recently created
        functionSelectors[0] = IDiamondCut.diamondCut.selector;
        //Build a FaceCut struct with the input data
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _diamondCutFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: functionSelectors
        });
        //Create a new instance of bytes4[] functionSelectors
        functionSelectors = new bytes4[](5);
        //Add function selectors
        functionSelectors[0] = IDiamondLoupe.facets.selector;
        functionSelectors[1] = IDiamondLoupe.facetFunctionSelectors.selector;
        functionSelectors[2] = IDiamondLoupe.facetAddresses.selector;
        functionSelectors[3] = IDiamondLoupe.facetAddress.selector;
        functionSelectors[4] = IERC165.supportsInterface.selector;
        
        //Creates new FaceCut struct and add Loupe infos from input and interface
        cut[1] = IDiamondCut.FacetCut({
            facetAddress: _diamondLoupeFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: functionSelectors
        });
        _diamondCut(cut, address(0), "");
    }

    // Internal function version of diamondCut
    function _diamondCut(
        IDiamondCut.FacetCut[] memory _diamondFacetCut,
        address _init,
        bytes memory _calldata
    ) internal {
        uint256 numberOfFacets = _diamondFacetCut.length;
        for (uint256 facetIndex; facetIndex < numberOfFacets; facetIndex++) {
            IDiamondCut.FacetCutAction action = _diamondFacetCut[facetIndex].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                _addFunctions(
                    _diamondFacetCut[facetIndex].facetAddress,
                    _diamondFacetCut[facetIndex].functionSelectors
                );
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                _replaceFunctions(
                    _diamondFacetCut[facetIndex].facetAddress,
                    _diamondFacetCut[facetIndex].functionSelectors
                );
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                _removeFunctions(
                    _diamondFacetCut[facetIndex].facetAddress,
                    _diamondFacetCut[facetIndex].functionSelectors
                );
            } else {
                revert LibDiamond_IncorrectFacetCutAction(uint8(action));
            }
        }
        emit LibDiamond_DiamondCut(_diamondFacetCut, _init, _calldata);
        _initializeDiamondCut(_init, _calldata);
    }

    function _addFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        if(_facetAddress == address(0)) revert LibDiamond_CannotAddSelectorsToZeroAddress(_functionSelectors);
        if(_functionSelectors.length == 0) revert LibDiamond_NoSelectorsGivenToAdd();

        DiamondStorage storage ds = _diamondStorage();
        uint96 selectorPosition = uint96(
            ds.facetFunctionSelectors[_facetAddress].functionSelectors.length
        );

        // add new facet address if it does not exist
        if (selectorPosition == 0) {
            _addFacet(ds, _facetAddress);
        }

        uint256 numberOfSelectors = _functionSelectors.length;
        for (uint256 selectorIndex; selectorIndex < numberOfSelectors; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            
            if(oldFacetAddress != address(0)) revert LibDiamond_CannotAddFunctionToDiamondThatAlreadyExists(selector);
            
            _addFunction(ds, selector, selectorPosition, _facetAddress);
            selectorPosition++;
        }
    }

    function _replaceFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        if(_functionSelectors.length == 0) revert LibDiamond_NoSelectorsProvidedForFacetForCut(_facetAddress);
        DiamondStorage storage ds = _diamondStorage();
        if(_facetAddress == address(0)) revert LibDiamond_CannotAddSelectorsToZeroAddress(_functionSelectors);
        uint96 selectorPosition = uint96(
            ds.facetFunctionSelectors[_facetAddress].functionSelectors.length
        );
        // add new facet address if it does not exist
        if (selectorPosition == 0) {
            _addFacet(ds, _facetAddress);
        }
        uint256 numberOfSelectors = _functionSelectors.length;
        for (uint256 selectorIndex; selectorIndex < numberOfSelectors; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            
            if(oldFacetAddress == _facetAddress) revert LibDiamond_CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet(selector);

            _removeFunction(ds, oldFacetAddress, selector);
            _addFunction(ds, selector, selectorPosition, _facetAddress);
            selectorPosition++;
        }
    }

    function _removeFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        if(_functionSelectors.length == 0) revert LibDiamond_NoSelectorsProvidedForFacetForCut(_facetAddress);
        if(_facetAddress != address(0)) revert LibDiamond_RemoveFacetAddressMustBeZeroAddress(_facetAddress);
        
        DiamondStorage storage ds = _diamondStorage();
        
        uint256 numberOfSelectors = _functionSelectors.length;
        for (uint256 selectorIndex; selectorIndex < numberOfSelectors; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            _removeFunction(ds, oldFacetAddress, selector);
        }
    }

    function _addFacet(DiamondStorage storage ds, address _facetAddress) internal {
        _enforceHasContractCode(_facetAddress);
        ds.facetFunctionSelectors[_facetAddress].facetAddressPosition = ds.facetAddresses.length;
        ds.facetAddresses.push(_facetAddress);
    }

    function _addFunction(
        DiamondStorage storage ds,
        bytes4 _selector,
        uint96 _selectorPosition,
        address _facetAddress
    ) internal {
        ds.selectorToFacetAndPosition[_selector].functionSelectorPosition = _selectorPosition;
        ds.facetFunctionSelectors[_facetAddress].functionSelectors.push(_selector);
        ds.selectorToFacetAndPosition[_selector].facetAddress = _facetAddress;
    }

    function _removeFunction(
        DiamondStorage storage ds,
        address _facetAddress,
        bytes4 _selector
    ) internal {
        if(_facetAddress == address(0)) revert LibDiamond_CannotRemoveFunctionFromNonExistentFacet();
        // an immutable function is a function defined directly in a diamond
        if(_facetAddress == address(this)) revert LibDiamond_CannotRemoveImmutableFunction(_selector);
        // replace selector with last selector, then delete last selector
        uint256 selectorPosition = ds
            .selectorToFacetAndPosition[_selector]
            .functionSelectorPosition;
        uint256 lastSelectorPosition = ds
            .facetFunctionSelectors[_facetAddress]
            .functionSelectors
            .length - 1;
        // if not the same then replace _selector with lastSelector
        if (selectorPosition != lastSelectorPosition) {
            bytes4 lastSelector = ds.facetFunctionSelectors[_facetAddress].functionSelectors[
                lastSelectorPosition
            ];
            ds.facetFunctionSelectors[_facetAddress].functionSelectors[
                selectorPosition
            ] = lastSelector;
            ds.selectorToFacetAndPosition[lastSelector].functionSelectorPosition = uint96(
                selectorPosition
            );
        }
        // delete the last selector
        ds.facetFunctionSelectors[_facetAddress].functionSelectors.pop();
        delete ds.selectorToFacetAndPosition[_selector];

        // if no more selectors for facet address then delete the facet address
        if (lastSelectorPosition == 0) {
            // replace facet address with last facet address and delete last facet address
            uint256 lastFacetAddressPosition = ds.facetAddresses.length - 1;
            uint256 facetAddressPosition = ds
                .facetFunctionSelectors[_facetAddress]
                .facetAddressPosition;
            if (facetAddressPosition != lastFacetAddressPosition) {
                address lastFacetAddress = ds.facetAddresses[lastFacetAddressPosition];
                ds.facetAddresses[facetAddressPosition] = lastFacetAddress;
                ds
                    .facetFunctionSelectors[lastFacetAddress]
                    .facetAddressPosition = facetAddressPosition;
            }
            ds.facetAddresses.pop();
            delete ds.facetFunctionSelectors[_facetAddress].facetAddressPosition;
        }
    }

    //@question this function initiate new facets?
    //TODO add OZ initializer in here to block double initialization
    function _initializeDiamondCut(address _init, bytes memory _calldata) internal {
        if (_init == address(0)) {
            if(_calldata.length > 0) revert LibDiamond_AddressZeroButNotEmptyCalldata(_init, _calldata);
        } else {
            if(_calldata.length == 0) revert LibDiamond_ValidAddressButEmptyCalldata(_init, _calldata);

            if (_init != address(this)) {
                _enforceHasContractCode(_init);
            }
            (bool success, bytes memory error) = _init.delegatecall(_calldata);
            if (!success) {
                if (error.length > 0) {
                    // bubble up error
                    /// @solidity memory-safe-assembly
                    assembly {
                        let returndata_size := mload(error)
                        revert(add(32, error), returndata_size)
                    }
                } else {
                    revert LibDiamond_InitializationFunctionReverted(_init, _calldata);
                }
            }
        }
    }

    /*//////////////////////////////////////
                    VIEW & PURE
    ///////////////////////////////////// */
    //TODO: Turn into Modifier to avoid {jump opcode}
    function _enforceHasContractCode(address _contract) internal view {
        uint256 contractSize;
        assembly {
            contractSize := extcodesize(_contract)
        }
        if(contractSize == 0) revert LibDiamond_NoBytecodeAtAddress(_contract);
    }

    //TODO: Turn into Modifier to avoid {jump opcode}
    function _enforceIsOwnerOrContract() internal view {
        if(msg.sender != _diamondStorage().contractOwner) revert LibDiamond_NotContractOwner(msg.sender, _diamondStorage().contractOwner);
    }

    //TODO: Turn into Modifier to avoid {jump opcode}
    function _enforceIsContractOwner() internal view {
        if(msg.sender != _diamondStorage().contractOwner) {
            revert LibDiamond_NotContractOwner(msg.sender, _diamondStorage().contractOwner);
        }
    }
    
    function _contractOwner() internal view returns (address contractOwner_) {
        contractOwner_ = _diamondStorage().contractOwner;
    }

    /**
        *@notice function to get the exact Diamond Storage slot
        *@return ds the Storage pointer for the Diamond Storage slot
    */
    function _diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
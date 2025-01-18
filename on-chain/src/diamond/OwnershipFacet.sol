// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com>, Twitter/Github: @mudgen
* EIP-2535 Diamonds
/******************************************************************************/

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {AppStorage} from "../storage/AppStorage.sol";

contract OwnershipFacet {
    AppStorage internal s;

    /// EVENTS ///
    event OwnershipFacet_OwnershipTransferred(address indexed previousOwner, address indexed newOwner); //@audit-info

    /// ERRORS ///
    error OwnershipFacet_NotTheOwnerCandidate(address user, address owner);

    function transferOwnership(address _newOwner) external {
        LibDiamond._enforceIsContractOwner();
        //@question Why use this:
        s.owner = _newOwner;
        //And not this?
        // LibDiamond.setContractOwner(_newOwner);
    }

    function claimOwnership() external {
        if(msg.sender != s.owner) revert OwnershipFacet_NotTheOwnerCandidate(msg.sender, s.owner);
        LibDiamond._setContractOwner(msg.sender);
        delete s.owner;
    }

    function owner() external view returns (address _owner) {
        _owner = LibDiamond._contractOwner();
    }

    function ownerCandidate() external view returns (address _ownerCandidate) {
    ///@question Why this?
        _ownerCandidate = s.owner;
    }
}
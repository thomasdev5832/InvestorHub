// SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {AppStorage} from "../storage/AppStorage.sol";

contract OwnershipFacet {
    AppStorage internal s;

    /// EVENTS ///
    event OwnershipFacet_OwnershipTransferred(address indexed previousOwner, address indexed newOwner); //@audit-info

    /// ERRORS ///
    error OwnershipFacet_NotTheOwnerCandidate(address user, address owner);

    function transferOwnership(address _newOwner) external {
        LibDiamond.enforceIsContractOwner();
        s.owner = _newOwner;
    }

    function claimOwnership() external {
        if(msg.sender != s.owner) revert OwnershipFacet_NotTheOwnerCandidate(msg.sender, s.owner);
        LibDiamond.setContractOwner(msg.sender);
        delete s.owner;
    }

    function owner() external view returns (address owner) {
        _owner = LibDiamond.contractOwner();
    }

    function ownerCandidate() external view returns (address _ownerCandidate) {
        _ownerCandidate = s.owner;
    }
}
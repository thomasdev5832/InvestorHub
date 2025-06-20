// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
import {AppStorage} from "../storage/AppStorage.sol";

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/
import {LibDiamond} from "../libraries/LibDiamond.sol";

/**
    @title Core Diamond Proxy Contract of InvestorHub structure
    @author 77 Innovation Labs IH Team
    @notice This is a minimal MVP for Chainlink Chromion Hackathon
    @dev This implementation updates require statements for custom errors for optimization purposes
*/
contract OwnershipFacet {
    /*///////////////////////////////////
                State variables
    ///////////////////////////////////*/
    ///@notice temporary-ish internal storage to manage 2Step Ownership transfers.
    AppStorage internal s;

    /*///////////////////////////////////
                    Events
    ///////////////////////////////////*/
    event OwnershipFacet_OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OwnershipFacet_OwnershipTransferProposed(address newOwner, address owner);

    /*///////////////////////////////////
                    Errors
    ///////////////////////////////////*/
    error OwnershipFacet_NotTheOwnerCandidate(address user, address owner);

    /*///////////////////////////////////
                  Functions
    ///////////////////////////////////*/
    function transferOwnership(address _newOwner) external {
        LibDiamond._enforceIsContractOwner();
        s.owner = _newOwner;
        emit OwnershipFacet_OwnershipTransferProposed(_newOwner, LibDiamond._contractOwner());
    }

    function claimOwnership() external {
        if(msg.sender != s.owner) revert OwnershipFacet_NotTheOwnerCandidate(msg.sender, s.owner);
        LibDiamond._setContractOwner(msg.sender);
        
        emit OwnershipFacet_OwnershipTransferred(s.owner, msg.sender);

        delete s.owner;
    }

    /*///////////////////////////////////
                View & Pure
    ///////////////////////////////////*/
    function owner() external view returns (address owner_) {
        owner_ = LibDiamond._contractOwner();
    }

    function ownerCandidate() external view returns (address ownerCandidate_) {
        ownerCandidate_ = s.owner;
    }
}
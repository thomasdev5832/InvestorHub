///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*/////////////////////////////
            Imports
/////////////////////////////*/
//TODO: Add Ownable Upgradeable

contract VaultAutomationStorage {
    /*///////////////////////////////////
                Variables
    ///////////////////////////////////*/
    //TODO implement the Struct Pattern Storage
    struct RequestInfo{
        address token;
        uint256 amount;
        bool isFulfilled;
    }

    ///@notice variable to store the automation forwarded address
    address s_forwarder;

    ///@notice mapping to store requests information
    mapping(bytes32 requestId => RequestInfo) public s_requestStorage;

    constructor(address _owner) {}
}
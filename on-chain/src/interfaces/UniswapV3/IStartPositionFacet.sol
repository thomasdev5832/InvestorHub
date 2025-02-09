///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IStartPositionFacet {

    struct StakePayload{
        address receiverAddress;
        address firstToken;
        address secondToken;
        uint256 firstTokenAmount; ///@notice final amount to deposit
        uint256 secondTokenAmount; ///@notice final amount to deposit
    }

    function endPosition(StakePayload memory _stakePayload) external;
}
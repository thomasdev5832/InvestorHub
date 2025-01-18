///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IUniswap {
    function startPosition(bytes memory _payload/*, Staking memory _stakePayload*/) external;
    function endPosition() external;
}
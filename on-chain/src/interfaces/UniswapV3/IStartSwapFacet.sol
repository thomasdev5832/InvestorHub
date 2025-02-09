///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IStartSwapFacet {
    struct DexPayload{
        bytes pathOne;
        bytes pathTwo;
        address tokenIn;
        uint256 totalAmountIn;
        uint256 amountInForTokenOne;
        uint256 amountInForTokenTwo;
        bool multiSwap;
    }

    struct StakePayload{
        address receiverAddress;
        address firstToken;
        address secondToken;
        uint256 firstTokenAmount; ///@notice final amount to deposit
        uint256 secondTokenAmount; ///@notice final amount to deposit
    }

    function startSwap(DexPayload memory _payload, StakePayload memory _stakePayload) external;
}
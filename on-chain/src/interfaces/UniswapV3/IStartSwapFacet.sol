///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

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

    function startSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external;
}
///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

interface IStartSwapFacet {
    struct DexPayload{
        bytes pathOne;
        address token0;
        uint256 totalAmountIn;
        uint256 amountInForToken0;
    }

    function startSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external;
}
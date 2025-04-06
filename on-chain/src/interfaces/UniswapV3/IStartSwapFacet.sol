///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

interface IStartSwapFacet {

    /*///////////////////////////////////
                    Variables
    ///////////////////////////////////*/
    struct DexPayload{
        bytes path;
        uint256 amountInForInputToken;
        uint256 deadline;
    }

    function startSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external;
}
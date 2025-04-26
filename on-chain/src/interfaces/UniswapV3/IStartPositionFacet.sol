///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";
interface IStartPositionFacet is INonFungiblePositionManager {

    function startPositionAfterSwap(INonFungiblePositionManager.MintParams memory _params) external;
    function startPosition(INonFungiblePositionManager.MintParams memory _params) external;
    function collectAllFees(INonFungiblePositionManager.CollectParams memory _params) external;
    function decreaseLiquidityCurrentRange(INonFungiblePositionManager.DecreaseLiquidityParams memory _params) external;
    function increaseLiquidityCurrentRange(INonFungiblePositionManager.IncreaseLiquidityParams memory _params) external;
}
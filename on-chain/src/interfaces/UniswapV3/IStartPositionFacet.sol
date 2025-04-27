///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";
interface IStartPositionFacet is INonFungiblePositionManager {

    function startPositionAfterSwap(INonFungiblePositionManager.MintParams memory _params) external;
    function startPosition(INonFungiblePositionManager.MintParams memory _params) external;
    function collectAllFees(INonFungiblePositionManager.CollectParams memory _params) external;
    function decreaseLiquidityCurrentRange(INonFungiblePositionManager.DecreaseLiquidityParams memory _decreaseParams, INonFungiblePositionManager.CollectParams memory _collectParams) external returns(uint256 amount0_, uint256 amount1_);
    function increaseLiquidityCurrentRange(address _token0, address _token1, INonFungiblePositionManager.IncreaseLiquidityParams memory _params) external returns(uint128 liquidity_, uint256 amount0_, uint256 amount1_);
}
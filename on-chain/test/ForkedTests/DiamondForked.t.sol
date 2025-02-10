// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Test Helper
import {ForkedHelper} from "../Helpers/ForkedHelper.t.sol";

///Protocol Interfaces
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

contract DiamondForked is ForkedHelper {

    ///@notice Pool Range
    int24 private constant MIN_TICK = -60; // Minimum price range
    int24 private constant MAX_TICK = 60;  // Maximum price range

    function test_uniCanSwapAndStakeOnMainnetFork() public {
        bytes memory path = abi.encodePacked(address(USDC_BASE_MAINNET), USDC_WETH_POOL_FEE, address(WETH_BASE_MAINNET));
        uint256 totalAmountIn = 5400*10**6;
        uint256 amountInSwap = 2700*10**6;
        uint256 amountOutSwap = 1*10**18;

        IStartSwapFacet.DexPayload memory dexPayload = IStartSwapFacet.DexPayload({
            pathOne: path,
            token0: address(USDC_BASE_MAINNET),
            totalAmountIn: totalAmountIn,
            amountInForToken0: amountInSwap
        });

        INonFungiblePositionManager.MintParams memory stakePayload = INonFungiblePositionManager.MintParams({
            token0: address(WETH_BASE_MAINNET),
            token1: address(USDC_BASE_MAINNET),
            fee: USDC_WETH_POOL_FEE,
            tickLower: MIN_TICK,
            tickUpper: MAX_TICK,
            amount0Desired: amountOutSwap,
            amount1Desired: amountInSwap,
            amount0Min: 0,
            amount1Min: 0,
            recipient: s_user02,
            deadline: block.timestamp + 60
        });

        vm.startPrank(s_user02);
        USDC_BASE_MAINNET.approve(address(s_uniSwapWrapper), totalAmountIn);
        s_uniSwapWrapper.startSwap(dexPayload, stakePayload);
        vm.stopPrank();
    }
}
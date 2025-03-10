// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Test Helper
import {ForkedHelper} from "../Helpers/ForkedHelper.t.sol";

///Protocol Interfaces
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";

contract DiamondForked is ForkedHelper {
    function test_uniCanSwapOnMainnetFork() public {
        bytes memory path = abi.encodePacked(address(USDC_BASE_MAINNET), USDC_WETH_POOL_FEE, address(WETH_BASE_MAINNET));
        uint256 totalAmountIn = 6300*10**6;
        uint256 amountIn = 3150*10**6;
        uint256 amountOut = 1*10**18;


        IStartSwapFacet.DexPayload memory dexPayload = IStartSwapFacet.DexPayload({
            pathOne: path,
            pathTwo: "",
            tokenIn: address(USDC_BASE_MAINNET),
            totalAmountIn: totalAmountIn,
            amountInForTokenOne: amountIn,
            amountInForTokenTwo: 0,
            multiSwap: false
        });

        IStartSwapFacet.StakePayload memory stakePayload = IStartSwapFacet.StakePayload({
            receiverAddress: address(s_diamond),
            firstToken: address(USDC_BASE_MAINNET),
            secondToken: address(WETH_BASE_MAINNET),
            firstTokenAmount: amountOut,
            secondTokenAmount: 0
        });

        vm.startPrank(s_user02);
        USDC_BASE_MAINNET.approve(address(s_uniSwapWrapper), totalAmountIn);
        s_uniSwapWrapper.startSwap(dexPayload, stakePayload);
        vm.stopPrank();
    }
}
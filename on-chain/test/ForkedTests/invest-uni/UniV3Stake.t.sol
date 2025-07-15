// // SPDX-License-Identifier: UNLICENSED
// pragma solidity 0.8.26;

// //Foundry Tools
// import { console } from "forge-std/Console.sol";

// ///Test Helper
// import {ForkedHelper} from "../Helpers/ForkedHelper.t.sol";

// ///Protocol Interfaces
// import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
// import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

// ///OZ Interfaces
// import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import { IWETH } from "src/interfaces/IWETH.sol";

// contract UniV3StakeTest is ForkedHelper {

//     ///Checks if user can Decrease Liquidity and Withdraw the Amount
//     function test_userDecreaseLiquidity() public baseMainnetMod basePositionOpener {
//         uint256 usdcBalanceBefore = USDC_BASE_MAINNET.balanceOf(address(s_user02));
//         uint256 wethBalanceBefore = WETH_BASE_MAINNET.balanceOf(address(s_user02));

//         //Decreasing Liquidity Params
//         INonFungiblePositionManager.DecreaseLiquidityParams memory decreaseParams = INonFungiblePositionManager.DecreaseLiquidityParams({
//             tokenId: s_tokenId,
//             liquidity: s_liquidity / 3, //trying to understand this...
//             amount0Min: 0, ///TODO: understand why is it reverting on values bigger than zero.
//             amount1Min: 0, ///It's functional, but seems to not be correct.
//             deadline: block.timestamp + 60
//         });
//         //Collecting Funds Params
//         INonFungiblePositionManager.CollectParams memory collectParams = INonFungiblePositionManager.CollectParams ({
//             tokenId: s_tokenId,
//             recipient: s_user02,
//             amount0Max: type(uint128).max,
//             amount1Max: type(uint128).max
//         });

//         vm.startPrank(s_user02);
//         IERC721(s_baseConfig.stake.uniswapV3PositionManager).approve(address(s_uniStakeWrapper), s_tokenId);
//         (uint256 wEthWithdrawn, uint256 usdcWithdrawn) = s_uniStakeWrapper.decreaseLiquidityCurrentRange(decreaseParams, collectParams);
//         console.log("USDC value decreased", usdcWithdrawn, "wETH value decreased", wEthWithdrawn);
//         vm.stopPrank();

//         //Contract must have zero balance
//         console.log("Diamond contract balances");
//         assertEq(USDC_BASE_MAINNET.balanceOf(address(s_uniStakeWrapper)), 0);
//         assertEq(WETH_BASE_MAINNET.balanceOf(address(s_uniStakeWrapper)), 0);
//         //User must have a bigger balance
//         console.log("User02 USDC & WETH balances after decreasing liquidity");
//         assertEq(USDC_BASE_MAINNET.balanceOf(address(s_user02)), usdcBalanceBefore + usdcWithdrawn);
//         assertEq(WETH_BASE_MAINNET.balanceOf(address(s_user02)), wethBalanceBefore + wEthWithdrawn);

//         //@Question Where is the money going?
//     }

//     ///Checks if user can Increase Liquidity
//     function test_userIncreaseLiquidity() public baseMainnetMod basePositionOpener {
//         uint256 amount0 = 1 * 10**18;
//         uint256 amount1 = 1800 * 10**6;
//         //Increase new Position
//         INonFungiblePositionManager.IncreaseLiquidityParams memory increaseParams = INonFungiblePositionManager.IncreaseLiquidityParams({
//             tokenId: s_tokenId,
//             amount0Desired: amount0,
//             amount1Desired: amount1,
//             amount0Min: 0,
//             amount1Min: 0,
//             deadline: block.timestamp + 60
//         });

//         ///generate some more wETH to user02
//         vm.startPrank(s_user02);
//         IWETH(address(WETH_BASE_MAINNET)).deposit{value: amount0}();

//         ///Query user02 balances
//         uint256 wethBalanceBefore = WETH_BASE_MAINNET.balanceOf(address(s_user02));
//         uint256 usdcBalanceBefore = USDC_BASE_MAINNET.balanceOf(address(s_user02));

//         ///Approve transfer to Diamond
//         WETH_BASE_MAINNET.approve(address(s_uniStakeWrapper), amount0);
//         USDC_BASE_MAINNET.approve(address(s_uniStakeWrapper), amount1);

//         ///Increase the Liquidity
//         ///TODO: Check how to sanitize the liquidity return.
//         (
//             uint128 liquidity, 
//             uint256 depositedAmount0, 
//             uint256 depositedAmount1
//         ) = s_uniStakeWrapper.increaseLiquidityCurrentRange(address(WETH_BASE_MAINNET), address(USDC_BASE_MAINNET), increaseParams);
        
//         vm.stopPrank();

//         uint256 wEthFee = amount0 / 50;
//         uint256 usdcFee = amount1 / 50;

//         assertEq(WETH_BASE_MAINNET.balanceOf(address(s_user02)), wethBalanceBefore - (depositedAmount0 + wEthFee));
//         assertEq(USDC_BASE_MAINNET.balanceOf(address(s_user02)), usdcBalanceBefore - (depositedAmount1 + usdcFee));

//         assertEq(WETH_BASE_MAINNET.balanceOf(address(s_uniStakeWrapper)), 0);
//         assertEq(USDC_BASE_MAINNET.balanceOf(address(s_uniStakeWrapper)), 0);
        
//     }

//     // ///Checks if user can decrease liquidity
//     // function test_userCollectFees() public baseMainnetMod basePositionOpener {
//     //     INonFungiblePositionManager.CollectParams memory params = INonFungiblePositionManager.CollectParams({
//     //         tokenId: ,
//     //         recipient: ,
//     //         amount0Max: ,
//     //         amount1Max:
//     //     });

        
//     // }
// }
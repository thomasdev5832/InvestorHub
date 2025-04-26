// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///Test Helper
import {ForkedHelper} from "../Helpers/ForkedHelper.t.sol";

///Protocol Interfaces
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

///OZ Interfaces
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract UniV3StakeTest is ForkedHelper {

    ///Checks if user can Decrease Liquidity
    function test_userDecreaseLiquidity() public baseMainnetMod basePositionOpener {
        uint256 usdcBalanceBefore = USDC_BASE_MAINNET.balanceOf(address(s_user02));
        uint256 wethBalanceBefore = WETH_BASE_MAINNET.balanceOf(address(s_user02));

        INonFungiblePositionManager.DecreaseLiquidityParams memory params = INonFungiblePositionManager.DecreaseLiquidityParams({
            tokenId: s_tokenId,
            liquidity: s_liquidity / 3, //trying to understand this...
            amount0Min: 0, ///TODO: understand why is it reverting on values bigger than zero.
            amount1Min: 0, ///It's functional, but seems to not be correct.
            deadline: block.timestamp + 60
        });

        vm.startPrank(s_user02);
        IERC721(s_baseConfig.stake.uniswapV3PositionManager).approve(address(s_uniStakeWrapper), s_tokenId);
        s_uniStakeWrapper.decreaseLiquidityCurrentRange(params);

        //Contract must have zero balance
        assertEq(USDC_BASE_MAINNET.balanceOf(address(s_uniStakeWrapper)), 0);
        assertEq(WETH_BASE_MAINNET.balanceOf(address(s_uniStakeWrapper)), 0);
        //User must have a bigger balance
        assertGt(USDC_BASE_MAINNET.balanceOf(address(s_user02)), usdcBalanceBefore);
        assertGt(WETH_BASE_MAINNET.balanceOf(address(s_user02)), wethBalanceBefore);

        //@Question Where is the money going?
    }

    ///Checks if user can Increase Liquidity
    // function test_userIncreaseLiquidity() public baseMainnetMod basePositionOpener {
    //     INonFungiblePositionManager.IncreaseLiquidityParams memory params = INonFungiblePositionManager.IncreaseLiquidityParams({
    //         tokenId: ,
    //         amount0Desired: ,
    //         amount1Desired: ,
    //         amount0Min: ,
    //         amount1Min: ,
    //         deadline: block.timestamp + 60
    //     });
    // }

    // ///Checks if user can decrease liquidity
    // function test_userCollectFees() public baseMainnetMod basePositionOpener {
    //     INonFungiblePositionManager.CollectParams memory params = INonFungiblePositionManager.CollectParams({
    //         tokenId: ,
    //         recipient: ,
    //         amount0Max: ,
    //         amount1Max:
    //     });

        
    // }
}
///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

interface IStartSwapFacet {

    /*///////////////////////////////////
                    Variables
    ///////////////////////////////////*/
    struct DexPayload{
        bytes path;
        address token0;
        uint256 totalAmountIn;
        uint256 amountInForToken0;
        uint256 deadline;
    }

    /*///////////////////////////////////
                    Events
    ///////////////////////////////////*/

    /*///////////////////////////////////
                    Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the function is not executed in the Diamond context
    error IStartSwapFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
    ///@notice error emitted when the liquidAmount is zero
    error IStartSwapFacet_InvalidAmountToSwap(uint256 amountIn);
    ///@notice error emitted when the input array is to big
    error IStartSwapFacet_ArrayBiggerThanTheAllowedSize(uint256 arraySize);
    ///@notice error emitted when the staking payload sent is different than the validated struct
    error IStartSwapFacet_InvalidStakePayload(bytes32 hashOfEncodedPayload, bytes32 hashOfStructArgs);
    ///@notice error emitted when the first token of a swap is the address(0)
    error IStartSwapFacet_InvalidToken0(address tokenIn);
    ///@notice error emitted when the last token != than the token to stake
    error IStartSwapFacet_InvalidToken1(address tokenOut);
    ///@notice error emitted when the amount of token0 left is less than the amount needed to stake
    error IStartSwapFacet_InvalidProportion();

    function startSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external;
}
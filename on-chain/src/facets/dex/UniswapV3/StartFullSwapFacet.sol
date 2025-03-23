///TODO: Offer a way for tokens to be completely swapped in case of a different stake method is used
// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// /*///////////////////////////////////
//             Imports
// ///////////////////////////////////*/
// // import {AppStorage} from "src/storage/AppStorage.sol"; unused

// /*///////////////////////////////////
//             Interfaces
// ///////////////////////////////////*/
// import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
// import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";
// import {IV3SwapRouter} from "@uni-router-v3/contracts/interfaces/IV3SwapRouter.sol";

// /*///////////////////////////////////
//             Libraries
// ///////////////////////////////////*/
// import {LibTransfers} from "src/libraries/LibTransfers.sol";
// import {LibUniswapV3} from "src/libraries/LibUniswapV3.sol";

// /**
//     *@title Swap & Stake - Diamond Uniswap Facet
//     *@notice Contract Designed to Swap and Stake users investments on UniswapV3
// */
// contract StartSwapFacet is IStartSwapFacet {

//     /*///////////////////////////////////
//               State Variables
//     ///////////////////////////////////*/
//     ///@notice struct that holds common storage
//     // AppStorage internal s; @question why do we need this? unused.

//     ///@notice immutable variable to store the diamond address
//     address immutable i_diamond;
//     ///@notice immutable variable to store the router address
//     address immutable i_router;

//     ///@notice constant variable to store MAGIC NUMBERS
//     uint8 private constant ZERO = 0;
//     uint8 constant TWO = 2;

//     /*///////////////////////////////////
//                     Events
//     ///////////////////////////////////*/

//     /*///////////////////////////////////
//                     Errors
//     ///////////////////////////////////*/
//     ///@notice error emitted when the function is not executed in the Diamond context
//     error StartSwapFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
//     ///@notice error emitted when the liquidAmount is zero
//     error StartSwapFacet_InvalidAmountToSwap(uint256 amountIn);
//     ///@notice error emitted when the input array is to big
//     error StartSwapFacet_ArrayBiggerThanTheAllowedSize(uint256 arraySize);
//     ///@notice error emitted when the staking payload sent is different than the validated struct
//     error StartSwapFacet_InvalidStakePayload(bytes32 hashOfEncodedPayload, bytes32 hashOfStructArgs);
//     ///@notice error emitted when a delegatecall fails
//     error StartSwapFacet_UnableToDelegatecall(bytes data);
//     ///@notice error emitted when the first token of a swap is the address(0)
//     error StartSwapFacet_InvalidToken0(address tokenIn);
//     ///@notice error emitted when the last token != than the token to stake
//     error StartSwapFacet_InvalidToken1(address tokenOut);
//     ///@notice error emitted when the amount of token0 left is less than the amount needed to stake
//     error StartSwapFacet_InvalidProportion();

//     /*///////////////////////////////////
//                     Functions
//     ///////////////////////////////////*/
//     /*///////////////////////////////////
//                     Modifiers
//     ///////////////////////////////////*/
    
//     ///@notice Facet constructor
//     constructor(address _diamond, address _router){
//         i_diamond = _diamond;
//         i_router = _router;
//         //never update state variables inside
//     }

//     /*///////////////////////////////////
//                   External
//     ///////////////////////////////////*/
//     //QUESTION: What if the user has a meme coin and want to completely swap for a token that will be deposited? 
//     //TODO: Ensure the swap can happen over the full amount
//     /**
//         *@notice external function to handle the creation of an investment position
//         *@param _payload the data to perform swaps
//         *@param _stakePayload the data to perform the stake operation
//         *@dev this function must be able to perform swaps and stake the tokens
//         *@dev the stToken must be sent directly to user.
//         *@dev the _stakePayload must contain the final value to be deposited, the calculations
//     */
//     function startFullSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external {
//         if(address(this) != i_diamond) revert StartSwapFacet_CallerIsNotDiamond(address(this), i_diamond);
//         if(_payload.totalAmountIn == ZERO) revert StartSwapFacet_InvalidAmountToSwap(_payload.totalAmountIn);

//         // retrieve tokens from UniV3 path input
//         (
//             address token0,
//             address token1
//         ) = LibUniswapV3._extractTokens(_payload.path);

//         //check params TODO
//         if(token0 != _stakePayload.token0) revert StartSwapFacet_InvalidToken0(token0);
//         if(token1 != _stakePayload.token1) revert StartSwapFacet_InvalidToken1(token1);
//         if(_payload.totalAmountIn - _payload.amountInForToken0 < _stakePayload.amount0Desired) revert StartSwapFacet_InvalidProportion();
        
//         //transfer the totalAmountIn FROM user
//             //We don't care about the return in here because we are checking it after the swap
//             //Even though it may be a FoT token, we will account for it after the swap
//             //We can do this way because the swap will never be done over the whole amount, only fractions
//         LibTransfers._handleTokenTransfers(token0, _payload.totalAmountIn);

//         //TODO: Sanity checks
//         (
//             _stakePayload.amount0Desired, //Update the values to be staked
//             _stakePayload.amount1Desired // with the dust and amount received from the swap
//         )= LibUniswapV3._handleSwaps(
//             i_router,
//             _payload.path,
//             token0,
//             _payload.deadline,
//             _payload.amountInForToken0, //the input is only the amount necessary to perform the swap and receive the token1 amount to stake
//             _stakePayload.amount0Desired
//         );

//         _stakePayload = normalizeStakePayload(_stakePayload);

//         // Delegatecall to an internal facet to process the stake
//         (bool success, bytes memory data) = i_diamond.delegatecall(
//             abi.encodeWithSelector(
//                 IStartPositionFacet.startPositionAfterSwap.selector,
//                 _stakePayload
//             )
//         );
//         if(!success) revert StartSwapFacet_UnableToDelegatecall(data);
//     }

//     /*///////////////////////////////////
//                     Private
//     ///////////////////////////////////*/

//     /**
//      * @notice Normalizes the token order within a Uniswap V3 `MintParams` struct to adhere to Uniswap's requirements.
//      * @dev Uniswap V3 requires `token0` to have a lower address value than `token1`. 
//      *      This function ensures the tokens are correctly ordered and swaps the corresponding amounts if necessary.
//      * @param _stakePayload The `MintParams` struct containing the parameters for minting a Uniswap V3 position.
//      * @return The normalized `MintParams` struct with tokens and corresponding amounts correctly ordered.
//      *
//      * @dev If `token0` is greater than `token1`, the function will:
//      *      - Swap `token0` and `token1`
//      *      - Swap `amount0Desired` and `amount1Desired`
//      *      - Swap `amount0Min` and `amount1Min`
//      *
//      * @dev This ensures compatibility with the Uniswap V3 `mint()` function, which expects token0 < token1.
//      */
//     function normalizeStakePayload(INonFungiblePositionManager.MintParams memory _stakePayload) private pure returns (INonFungiblePositionManager.MintParams memory) {
//         //TODO: move this check to off-chain components.
//         if (_stakePayload.token0 > _stakePayload.token1) {
//             (_stakePayload.token0, _stakePayload.token1) = (_stakePayload.token1, _stakePayload.token0);
//             (_stakePayload.amount0Desired, _stakePayload.amount1Desired) = (_stakePayload.amount1Desired, _stakePayload.amount0Desired);
//             (_stakePayload.amount0Min, _stakePayload.amount1Min) = (_stakePayload.amount1Min, _stakePayload.amount0Min);
//         }
//         return _stakePayload;
//     }
// }
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
// import {AppStorage} from "src/storage/AppStorage.sol"; unused

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";
import { IV3SwapRouter } from "@uni-router-v3/contracts/interfaces/IV3SwapRouter.sol";

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/
import { LibTransfers } from "src/libraries/LibTransfers.sol";
import { LibUniswapV3 } from "src/libraries/LibUniswapV3.sol";

/**
    *@title StartSwapFacet
    *@notice Diamond facet used to perform swaps on chains in which the IV3 Swap Router is used
*/
contract StartSwapFacetV3 is IStartSwapFacet {

    /*///////////////////////////////////
              State Variables
    ///////////////////////////////////*/
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store the router address
    address immutable i_router;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 private constant ZERO = 0;
    uint8 constant TWO = 2;

    /*///////////////////////////////////
                    Functions
    ///////////////////////////////////*/    
    ///@notice Facet constructor
    constructor(address _diamond, address _router){
        i_diamond = _diamond;
        i_router = _router;
        //never update state variables inside
    }

    /*///////////////////////////////////
                  External
    ///////////////////////////////////*/
    /**
        *@notice external function to handle the creation of an investment position
        *@param _payload the data to perform swaps
        *@param _stakePayload the data to perform the stake operation
        *@dev this function must be able to perform swaps and stake the tokens
        *@dev the stToken must be sent directly to user.
        *@dev the _stakePayload must contain the final value to be deposited, the calculations
    */
    function startSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external {
        if(address(this) != i_diamond) revert IStartSwapFacet_CallerIsNotDiamond(address(this), i_diamond);
        if(_payload.totalAmountIn == ZERO) revert IStartSwapFacet_InvalidAmountToSwap(_payload.totalAmountIn);

        // retrieve tokens from UniV3 path input
        (
            address token0,
            address token1
        ) = LibUniswapV3._extractTokens(_payload.path);

        //check params TODO
        if(token0 != _stakePayload.token0) revert IStartSwapFacet_InvalidToken0(token0);
        if(token1 != _stakePayload.token1) revert IStartSwapFacet_InvalidToken1(token1);
        if(_payload.totalAmountIn - _payload.amountInForToken0 < _stakePayload.amount0Desired) revert IStartSwapFacet_InvalidProportion();
        
        //transfer the totalAmountIn FROM user
            //We don't care about the return in here because we are checking it after the swap
            //Even though it may be a FoT token, we will account for it after the swap
            //We can do this way because the swap will never be done over the whole amount, only a fraction of it
        LibTransfers._handleTokenTransfers(token0, _payload.totalAmountIn);

        //TODO: Sanity checks
        (
            _stakePayload.amount0Desired, //Update the values to be staked
            _stakePayload.amount1Desired // with the dust and amount received from the swap
        )= LibUniswapV3._handleSwapsV3(
            i_router,
            _payload.path,
            token0, 
            _payload.amountInForToken0, //the input is only the amount necessary to perform the swap and receive the token1 amount to stake
            _stakePayload.amount0Desired
        );

        _stakePayload = normalizeStakePayload(_stakePayload);

        // Delegatecall to an internal facet to process the stake
        LibTransfers._handleDelegateCalls(
            i_diamond,
            abi.encodeWithSelector(
                IStartPositionFacet.startPositionAfterSwap.selector,
                _stakePayload
            )
        );
    }

    /*///////////////////////////////////
                    Private
    ///////////////////////////////////*/

    /**
     * @notice Normalizes the token order within a Uniswap V3 `MintParams` struct to adhere to Uniswap's requirements.
     * @dev Uniswap V3 requires `token0` to have a lower address value than `token1`. 
     *      This function ensures the tokens are correctly ordered and swaps the corresponding amounts if necessary.
     * @param _stakePayload The `MintParams` struct containing the parameters for minting a Uniswap V3 position.
     * @return The normalized `MintParams` struct with tokens and corresponding amounts correctly ordered.
     *
     * @dev If `token0` is greater than `token1`, the function will:
     *      - Swap `token0` and `token1`
     *      - Swap `amount0Desired` and `amount1Desired`
     *      - Swap `amount0Min` and `amount1Min`
     *
     * @dev This ensures compatibility with the Uniswap V3 `mint()` function, which expects token0 < token1.
     */
    function normalizeStakePayload(INonFungiblePositionManager.MintParams memory _stakePayload) private pure returns (INonFungiblePositionManager.MintParams memory) {
        //TODO: move this check to off-chain components.
        if (_stakePayload.token0 > _stakePayload.token1) {
            (_stakePayload.token0, _stakePayload.token1) = (_stakePayload.token1, _stakePayload.token0);
            (_stakePayload.amount0Desired, _stakePayload.amount1Desired) = (_stakePayload.amount1Desired, _stakePayload.amount0Desired);
            (_stakePayload.amount0Min, _stakePayload.amount1Min) = (_stakePayload.amount1Min, _stakePayload.amount0Min);
        }
        return _stakePayload;
    }
}
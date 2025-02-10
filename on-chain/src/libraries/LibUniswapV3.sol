//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///@notice Uniswap V3 Interface - With deadline
import {ISwapRouter} from "@uniV3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IV3SwapRouter} from "@uni-router-v3/contracts/interfaces/IV3SwapRouter.sol";

///@notice OpenZeppelin Imports
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

///@notice Libraries
import {BytesLib} from "@bytes-utils/contracts/BytesLib.sol";

library LibUniswapV3{

    /*///////////////////////////////////
             Type declarations
    ///////////////////////////////////*/   
    using SafeERC20 for IERC20; 
    using BytesLib for bytes;

    /*///////////////////////////////////
                    Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the first token of a swap is the address(0)
    error LibUniswapV3_InvalidToken0(address tokenIn);
    ///@notice error emitted when the last token != than the token to stake
    error LibUniswapV3_InvalidToken1(address tokenOut);

    ////////////////////////////////////////////////////////////////////////////////
                                /// Functions ///
    ////////////////////////////////////////////////////////////////////////////////
    /**
        *@notice function to handle the payload in exactInput function format
        *@param _path the tokens in bytes type
        *@param _deadline the time for the tx to expire
        *@param _amountIn the amount of tokens that will be swapped
        *@param _amountOutMin the minimum amount expected from the swap.
        *@return _dexPayload the payload needed to call exactInput function
        *@dev This function handle the RouterV1 payload
    */
    function _handleSwapPayload(
        bytes memory _path,
        uint256 _deadline,
        uint256 _amountIn,
        uint256 _amountOutMin
    ) internal view returns(ISwapRouter.ExactInputParams memory _dexPayload){
        //populate struct
        _dexPayload = ISwapRouter.ExactInputParams({
            path: _path,
            recipient: address(this), ///@notice swaps must have the Diamond address as receiver
            deadline: _deadline,
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMin
        });
    }

    /**
        *@notice function to handle the payload in exactInput function format
        *@param _path the tokens in bytes type
        *@param _amountIn the amount of tokens that will be swapped
        *@param _amountOutMin the minimum amount expected from the swap.
        *@return _dexPayload the payload needed to call exactInput function
        *@dev This function handle the RouterV2 Payload
    */
    function _handleSwapPayloadV3(
        bytes memory _path,
        uint256 _amountIn,
        uint256 _amountOutMin
    ) internal view returns(IV3SwapRouter.ExactInputParams memory _dexPayload){
        //populate struct
        _dexPayload = IV3SwapRouter.ExactInputParams({
            path: _path,
            recipient: address(this), ///@notice swaps must have the Diamond address as receiver
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMin
        });
    }

    /**
        *@notice Private function to handle swaps. It allows to simplify `startPosition` logic and avoid duplicated code
        *@param _path the Uniswap pattern path to swap on v3 model
        *@param _token0 the token to be swapped
        *@param _token1 the address of the token to be deposit to compare to `tokenOut`
        *@param _amountInForToken0 the amount of tokens to swap
        *@param _amountOut the minimum accepted amount to receive from the swap
        *@return swappedAmount_ the result from the swap process
    */
    function _handleSwaps(
        address _router,
        bytes memory _path,
        address _token0,
        address _token1,
        uint256 _amountInForToken0,
        uint256 _amountOut
    ) internal returns(uint256 swappedAmount_, uint256 token0left_){

        // retrieve tokens from payload
        (
            address token0,
            address token1
        ) = LibUniswapV3._extractTokens(_path);

        //check params TODO
        if(token0 == address(0)) revert LibUniswapV3_InvalidToken0(token0);
        if(token0 != _token0) revert LibUniswapV3_InvalidToken0(token0);
        if(token1 != _token1) revert LibUniswapV3_InvalidToken1(token1);

        //handle payload - forward the liquidAmount
        IV3SwapRouter.ExactInputParams memory dexPayload = LibUniswapV3._handleSwapPayloadV3(_path, _amountInForToken0, _amountOut);

        //Safe approve _router for the _amountInForToken0
        IERC20(token0).safeIncreaseAllowance(_router, _amountInForToken0);

        uint256 balanceBefore = IERC20(_token0).balanceOf(address(this));

        //Swap
        swappedAmount_ = IV3SwapRouter(_router).exactInput(dexPayload);

        uint256 balanceAfter = IERC20(_token0).balanceOf(address(this));

        token0left_ = balanceBefore - balanceAfter;
    }

    /**
        *@notice helper function to extract tokens from bytes data
        *@dev should extract the first and last tokens.
        *@return _tokenIn the token that will be the input
        *@return _tokenOut the token that will be the final output
    */
    function _extractTokens(
        bytes memory _path
    ) internal pure returns (address _tokenIn, address _tokenOut) {
        uint256 pathSize = _path.length;

        bytes memory tokenBytes = _path.slice(0, 20);

        assembly {
            _tokenIn := mload(add(tokenBytes, 20))
        }

        bytes memory secondTokenBytes = _path.slice(pathSize - 20, 20);

        assembly {
            _tokenOut := mload(add(secondTokenBytes, 20))
        }
    }
}
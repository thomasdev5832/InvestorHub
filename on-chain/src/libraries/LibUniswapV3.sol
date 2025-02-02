//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///@notice Uniswap V3 Interface - With deadline
import {ISwapRouter} from "@uniV3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IV3SwapRouter} from "@uni-router-v3/contracts/interfaces/IV3SwapRouter.sol";

///@notice Libraries
import {BytesLib} from "@bytes-utils/contracts/BytesLib.sol";

library LibUniswapV3{

    ////////////////////////////////////////////////////////////////////////////////
                            /// Type Declarations ///
    ////////////////////////////////////////////////////////////////////////////////    
    using BytesLib for bytes;


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
    function _handleSwapPayloadV2(
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
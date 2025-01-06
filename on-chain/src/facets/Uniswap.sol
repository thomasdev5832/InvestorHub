// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Protocol Import
import {AppStorage} from "../storage/AppStorage.sol";

/// Interfaces - External
import {ISwapRouter} from "@v3/contracts/interfaces/ISwapRouter.sol";

/// Libraries
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {BytesLib} from "@bytes-utils/contracts/BytesLib.sol";

/**
    *@title Swap & Stake - Diamond Uniswap Facet
    *@notice Contract Designed to Swap and Stake users investments on UniswapV3
*/
contract Uniswap {

    ////////////////////////////////////////////////////////////////////////////////
                            /// Type Declarations ///
    ////////////////////////////////////////////////////////////////////////////////    
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    ////////////////////////////////////////////////////////////////////////////////
                            /// State Variables ///
    ////////////////////////////////////////////////////////////////////////////////
    ///@notice variable to store the diamond address
    address immutable i_diamond;
    ///@notice variable to store the router address
    address immutable i_router;
    ///@notice struct that holds the whole Diamond storage
    AppStorage internal s;


    ////////////////////////////////////////////////////////////////////////////////
                                /// Events ///
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
                                /// Errors ///
    ////////////////////////////////////////////////////////////////////////////////
    ///@notice error emitted when the function is not executed in the Diamond context
    error Uniswap_CallerIsNotDiamond(address actualContext, address diamondContext);


    ////////////////////////////////////////////////////////////////////////////////
                                /// Functions ///
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
                            /// EXTERNAL ///
    ////////////////////////////////////////////////////////////////
    modifier onlyDiamondContext(){
        if(address(this) != i_diamond) revert Uniswap_CallerIsNotDiamond(address(this), i_diamond);
        _;
    }
    
    ///@notice Facet constructor
    constructor(address _diamond, address _router){
        i_diamond = _diamond;
        i_router = _router;
        //never update state variables inside
    }

    ////////////////////////////////////////////////////////////////
                            /// EXTERNAL ///
    ////////////////////////////////////////////////////////////////

    function startPosition(bytes memory _payload) external onlyDiamondContext{
        (
            bytes memory path,
            uint256 deadline,
            uint256 amountIn,
            uint256 amountOutMin
        ) = abi.decode(_payload, (bytes, uint256, uint256, uint256));
        
        // retrieve tokens from payload
        (
            address tokenIn,
            address tokenOut
        ) = _extractTokens(path);

        //check params TODO
            //tokenIn can be anything
            //tokenOut must be the staking token

        //handle payload
        ISwapRouter.ExactInputParams memory dexPayload = _handlePayload(path, deadline, amountIn, amountOutMin);

        //transfer FROM user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        //Safe approve i_router
        IERC20(tokenIn).safeIncreaseAllowance(i_router, amountIn);

        //Swap
        ISwapRouter(i_router).exactInput(dexPayload);
        //Stake TODO
    }

    function endPosition() external onlyDiamondContext{}

    ////////////////////////////////////////////////////////////////
                            /// PRIVATE ///
    ////////////////////////////////////////////////////////////////

    /**
        *@notice function to handle the payload in exactInput function format
        *@param _path the tokens in bytes type
        *@param _deadline the time for the tx to expire
        *@param _amountIn the amount of tokens that will be swapped
        *@param _amountOutMin the minimum amount expected from the swap.
        *@return _dexPayload the payload needed to call exactInput function
    */
    function _handlePayload(
        bytes memory _path,
        uint256 _deadline,
        uint256 _amountIn,
        uint256 _amountOutMin
    ) private view returns(ISwapRouter.ExactInputParams memory _dexPayload){
        //populate struct
        _dexPayload = ISwapRouter.ExactInputParams({
            path: _path,
            recipient: address(this), //diamond address
            deadline: _deadline,
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
    ) private pure returns (address _tokenIn, address _tokenOut) {
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
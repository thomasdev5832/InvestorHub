// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Protocol Import
import {AppStorage} from "../storage/AppStorage.sol";

/// Interfaces - External
import {ISwapRouter} from "@v3/contracts/interfaces/ISwapRouter.sol";

/// Libraries
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {BytesLib} from "@bytes-utils/contracts/BytesLib.sol";
import {LibTransfers} from "../libraries/LibTransfers.sol";

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
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store the router address
    address immutable i_router;
    ///@notice immutable variable to store the protocol's multisig wallet address
    address immutable i_multiSig;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 constant ONE = 1;
    ///@notice constant variable to hold the PRECISION_HANDLER
    uint256 constant PRECISION_HANDLER = 10*9;
    ///@notice constant variable to store the PROTOCOL FEE. 1% in BPS
    uint16 constant PROTOCOL_FEE = 100;

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
    ///@notice error emitted when the first token of a swap is the address(0)
    error Uniswap_InvalidTokenIn(address tokenIn);
    ///@notice error emitted when the last token != than the token to stake
    error Uniswap_InvalidTokenOut(address tokenOut);
    ///@notice error emitted when the liquidAmount is zero
    error Uniswap_InvalidAmountToSwap(uint256 amountIn);

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
    constructor(address _diamond, address _router, address _protocolMultiSig){
        i_diamond = _diamond;
        i_router = _router;
        i_multiSig = _protocolMultiSig;
        //never update state variables inside
    }

    ////////////////////////////////////////////////////////////////
                            /// EXTERNAL ///
    ////////////////////////////////////////////////////////////////

    function startPosition(bytes memory _payload/*, Staking memory _stakePayload*/) external onlyDiamondContext{
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
        if(tokenIn == address(0)) revert Uniswap_InvalidTokenIn(tokenIn);
        // if(tokenOut != _stakePayload.tokenTwo) revert Uniswap_InvalidTokenOut(tokenOut);
        if(amountIn < ONE) revert Uniswap_InvalidAmountToSwap(amountIn);

        //transfer FROM user the amountIn
        uint256 receivedAmount = LibTransfers._handleTokenTransfers(tokenIn, amountIn);

        //charge protocol fee
        uint256 liquidAmount = _handleProtocolFee(tokenIn, receivedAmount);

        //handle payload - forward the liquidAmount
        ISwapRouter.ExactInputParams memory dexPayload = _handleSwapPayload(path, deadline, liquidAmount, amountOutMin);

        //Safe approve i_router for the liquidAmount
        IERC20(tokenIn).safeIncreaseAllowance(i_router, liquidAmount);

        //Swap
        uint256 stakeAmountTwo = ISwapRouter(i_router).exactInput(dexPayload);
        //Stake TODO
    }

    function endPosition() external onlyDiamondContext{}

    ////////////////////////////////////////////////////////////////
                            /// PRIVATE ///
    ////////////////////////////////////////////////////////////////

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

    /**
        *@notice private function to handle protocol fee calculation and transfers
        *@param _tokenIn the token in which the fee will be calculated on top of
        *@param _amountIn the initial amount sent by the user
        *@return _liquidAmount the amount minus fee
    */
    function _handleProtocolFee(address _tokenIn, uint256 _amountIn) private returns(uint256 _liquidAmount){
        _liquidAmount = ((_amountIn * PRECISION_HANDLER)/PROTOCOL_FEE) / PRECISION_HANDLER;

        IERC20(_tokenIn).safeTransfer(i_multiSig, _amountIn - _liquidAmount);
    }

    /**
        *@notice function to handle the payload in exactInput function format
        *@param _path the tokens in bytes type
        *@param _deadline the time for the tx to expire
        *@param _amountIn the amount of tokens that will be swapped
        *@param _amountOutMin the minimum amount expected from the swap.
        *@return _dexPayload the payload needed to call exactInput function
    */
    function _handleSwapPayload(
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
}
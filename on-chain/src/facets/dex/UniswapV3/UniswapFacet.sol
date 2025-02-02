// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Protocol Import
// import {AppStorage} from "src/storage/AppStorage.sol"; unused

/// Interfaces - External
import {IV3SwapRouter} from "@uni-router-v3/contracts/interfaces/IV3SwapRouter.sol";

/// Interfaces - Internal
import { IUniswapFacet } from "src/interfaces/IUniswapFacet.sol";

/// Libraries
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {LibTransfers} from "src/libraries/LibTransfers.sol";
import {LibUniswapV3} from "src/libraries/LibUniswapV3.sol";

/**
    *@title Swap & Stake - Diamond Uniswap Facet
    *@notice Contract Designed to Swap and Stake users investments on UniswapV3
*/
contract UniswapFacet is IUniswapFacet {

    ////////////////////////////////////////////////////////////////////////////////
                            /// Type Declarations ///
    ////////////////////////////////////////////////////////////////////////////////    
    using SafeERC20 for IERC20;

    ////////////////////////////////////////////////////////////////////////////////
                            /// State Variables ///
    ////////////////////////////////////////////////////////////////////////////////
    ///@notice struct that holds common storage
    // AppStorage internal s; @question why do we need this? unused.

    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store the router address
    address immutable i_router;
    ///@notice immutable variable to store the protocol's multisig wallet address
    address immutable i_multiSig;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 constant ONE = 1;
    uint8 constant TWO = 2;
    ///@notice constant variable to hold the PRECISION_HANDLER
    uint256 constant PRECISION_HANDLER = 10*9;
    ///@notice constant variable to store the PROTOCOL FEE. 1% in BPS
    uint16 constant PROTOCOL_FEE = 100;

    ////////////////////////////////////////////////////////////////////////////////
                                /// Events ///
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
                                /// Errors ///
    ////////////////////////////////////////////////////////////////////////////////
    ///@notice error emitted when the function is not executed in the Diamond context
    error UniswapFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
    ///@notice error emitted when the first token of a swap is the address(0)
    error UniswapFacet_InvalidTokenIn(address tokenIn);
    ///@notice error emitted when the last token != than the token to stake
    error UniswapFacet_InvalidTokenOut(address tokenOut);
    ///@notice error emitted when the liquidAmount is zero
    error UniswapFacet_InvalidAmountToSwap(uint256 amountIn);
    ///@notice error emitted when the input array is to big
    error UniswapFacet_ArrayBiggerThanTheAllowedSize(uint256 arraySize);

    ////////////////////////////////////////////////////////////////////////////////
                                /// Functions ///
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
                            /// EXTERNAL ///
    ////////////////////////////////////////////////////////////////
    modifier onlyDiamondContext(){
        if(address(this) != i_diamond) revert UniswapFacet_CallerIsNotDiamond(address(this), i_diamond);
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
    /**
        *@notice external function to handle the creation of an investment position
        *@param _payload the data to perform swaps
        *@param _stakePayload the data to perform the stake operation
        *@dev this function must be able to perform swaps and stake the tokens
        *@dev the stToken must be sent directly to user.
        *@dev the _stakePayload must contain the final value to be deposited, the calculations
        *@dev we are ignoring dust refunds for now
    */
    function startPosition(DexPayload memory _payload, StakePayload memory _stakePayload) external onlyDiamondContext{
        if(_payload.totalAmountIn < ONE) revert UniswapFacet_InvalidAmountToSwap(_payload.totalAmountIn);
        uint256 receivedAmount;
        uint256 liquidAmount;

        //transfer the totalAmountIn FROM user
        receivedAmount = LibTransfers._handleTokenTransfers(_payload.tokenIn, _payload.totalAmountIn);

        //charge protocol fee
        liquidAmount = _handleProtocolFee(_payload.tokenIn, receivedAmount);

        _handleSwaps(
            _payload.pathOne,
            _payload.tokenIn, 
            _payload.multiSwap == false ? _stakePayload.secondToken : _stakePayload.firstToken, 
            _payload.amountInForTokenOne, 
            _stakePayload.firstTokenAmount
        );

        if(_payload.multiSwap == true){
            _handleSwaps(_payload.pathTwo, _payload.tokenIn, _stakePayload.secondToken, _payload.amountInForTokenTwo, _stakePayload.secondTokenAmount);
        }

        //Stake TODO
    }

    function endPosition() external onlyDiamondContext{}

    ////////////////////////////////////////////////////////////////
                            /// PRIVATE ///
    ////////////////////////////////////////////////////////////////

    /**
        *@notice private function to handle protocol fee calculation and transfers
        *@param _tokenIn the token in which the fee will be calculated on top of
        *@param _amountIn the initial amount sent by the user
        *@return liquidAmount_ the amount minus fee
    */
    function _handleProtocolFee(address _tokenIn, uint256 _amountIn) private returns(uint256 liquidAmount_){
        liquidAmount_ = _amountIn - ((_amountIn * PRECISION_HANDLER)/PROTOCOL_FEE) / PRECISION_HANDLER;

        IERC20(_tokenIn).safeTransfer(i_multiSig, _amountIn - liquidAmount_);
    }

    /**
        *@notice Private function to handle swaps. It allows to simplify `startPosition` logic and avoid duplicated code
        *@param _path the Uniswap pattern path to swap on v3 model
        *@param _tokenIn the token to be swapped
        *@param _token the address of the token to be deposit to compare to `tokenOut`
        *@param _amountIn the amount of tokens to swap
        *@param _amountOut the minimum accepted amount to receive from the swap
        *@return swappedAmount_ the result from the swap process
    */
    function _handleSwaps(bytes memory _path, address _tokenIn, address _token, uint256 _amountIn, uint256 _amountOut) private returns(uint256 swappedAmount_){

        // retrieve tokens from payload
        (
            address tokenIn,
            address tokenOut
        ) = LibUniswapV3._extractTokens(_path);

        //check params TODO
        if(tokenIn == address(0)) revert UniswapFacet_InvalidTokenIn(tokenIn);
        if(tokenIn != _tokenIn) revert UniswapFacet_InvalidTokenIn(tokenIn);
        if(tokenOut != _token) revert UniswapFacet_InvalidTokenOut(tokenOut);

        //handle payload - forward the liquidAmount
        IV3SwapRouter.ExactInputParams memory dexPayload = LibUniswapV3._handleSwapPayloadV2(_path, _amountIn,_amountOut);

        //Safe approve i_router for the _amountIn
        IERC20(tokenIn).safeIncreaseAllowance(i_router, _amountIn);

        //Swap
        swappedAmount_ = IV3SwapRouter(i_router).exactInput(dexPayload);

    }
}
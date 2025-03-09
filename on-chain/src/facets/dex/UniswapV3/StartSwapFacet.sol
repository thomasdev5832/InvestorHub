// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Protocol Import
// import {AppStorage} from "src/storage/AppStorage.sol"; unused

/// Interfaces - External
import {IV3SwapRouter} from "@uni-router-v3/contracts/interfaces/IV3SwapRouter.sol";

/// Interfaces - Internal
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

/// Libraries
import {LibTransfers} from "src/libraries/LibTransfers.sol";
import {LibUniswapV3} from "src/libraries/LibUniswapV3.sol";

/**
    *@title Swap & Stake - Diamond Uniswap Facet
    *@notice Contract Designed to Swap and Stake users investments on UniswapV3
*/
contract StartSwapFacet is IStartSwapFacet {

    /*///////////////////////////////////
              State Variables
    ///////////////////////////////////*/
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

    /*///////////////////////////////////
                    Events
    ///////////////////////////////////*/

    /*///////////////////////////////////
                    Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the function is not executed in the Diamond context
    error StartSwapFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
    ///@notice error emitted when the liquidAmount is zero
    error StartSwapFacet_InvalidAmountToSwap(uint256 amountIn);
    ///@notice error emitted when the input array is to big
    error StartSwapFacet_ArrayBiggerThanTheAllowedSize(uint256 arraySize);
    ///@notice error emitted when the staking payload sent is different than the validated struct
    error StartSwapFacet_InvalidStakePayload(bytes32 hashOfEncodedPayload, bytes32 hashOfStructArgs);
    ///@notice error emitted when a delegatecall fails
    error StartSwapFacet_UnableToDelegatecall(bytes data);

    /*///////////////////////////////////
                    Functions
    ///////////////////////////////////*/
    /*///////////////////////////////////
                    Modifiers
    ///////////////////////////////////*/
    
    ///@notice Facet constructor
    constructor(address _diamond, address _router, address _protocolMultiSig){
        i_diamond = _diamond;
        i_router = _router;
        i_multiSig = _protocolMultiSig;
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
        *@dev we are ignoring dust refunds for now
    */
    function startSwap(DexPayload memory _payload, INonFungiblePositionManager.MintParams memory _stakePayload) external {
        if(address(this) != i_diamond) revert StartSwapFacet_CallerIsNotDiamond(address(this), i_diamond);
        if(_payload.totalAmountIn < ONE) revert StartSwapFacet_InvalidAmountToSwap(_payload.totalAmountIn);
        uint256 receivedAmount;
        uint256 liquidAmount;

        //transfer the totalAmountIn FROM user
        receivedAmount = LibTransfers._handleTokenTransfers(_payload.token0, _payload.totalAmountIn);

        //charge protocol fee
        //TODO: change order of methods. Not charging fees on meme coins
        liquidAmount = LibTransfers._handleProtocolFee(i_multiSig, _payload.token0, receivedAmount);

        //TODO: Sanity checks

        (
            _stakePayload.amount1Desired,
            _stakePayload.amount0Desired
        )= LibUniswapV3._handleSwaps(
            i_router,
            _payload.pathOne,
            _payload.token0, 
            _stakePayload.token1,
            _payload.amountInForToken0, 
            _stakePayload.amount0Desired
        );

        _stakePayload = normalizeStakePayload(_stakePayload);
        //delegatecall to another internal facet to process the stake
        (bool success, bytes memory data) = i_diamond.delegatecall(
            abi.encodeWithSelector(
                IStartPositionFacet.startPosition.selector,
                _stakePayload
            )
        );
        if(!success) revert StartSwapFacet_UnableToDelegatecall(data);
        //TODO check uniswapv3 contract for stake range
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
        if (_stakePayload.token0 > _stakePayload.token1) {
            (_stakePayload.token0, _stakePayload.token1) = (_stakePayload.token1, _stakePayload.token0);
            (_stakePayload.amount0Desired, _stakePayload.amount1Desired) = (_stakePayload.amount1Desired, _stakePayload.amount0Desired);
            (_stakePayload.amount0Min, _stakePayload.amount1Min) = (_stakePayload.amount1Min, _stakePayload.amount0Min);
        }
        return _stakePayload;
    }

    // function _checkIfStakePayloadIsValid(IStartPositionFacet.StakePayload memory _stakePayload) private returns(bool isValid_){
    //     bytes32 hashOfEncodedPayload = keccak256(abi.encodePacked(_stakePayload.encodedPayload));
    //     bytes32 hashOfStructArgs = keccak256(abi.encodePacked(abi.encode(

    //     )));

    //     if (hashOfEncodedPayload != hashOfStructArgs) revert StartSwapFacet_InvalidStakePayload(hashOfEncodedPayload, hashOfStructArgs);
    // }
}
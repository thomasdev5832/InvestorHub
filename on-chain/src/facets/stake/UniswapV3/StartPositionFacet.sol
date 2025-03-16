///SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/
import {LibTransfers} from "src/libraries/LibTransfers.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StartPositionFacet {
    /*///////////////////////////////////
            Type declarations
    ///////////////////////////////////*/
    using SafeERC20 for IERC20;

    /*///////////////////////////////////
            State variables
    ///////////////////////////////////*/
    INonFungiblePositionManager immutable i_positionManager;

    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store the protocol's multisig wallet address
    address immutable i_multiSig;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 private constant ZERO = 0;
    /*///////////////////////////////////
                Events
    ///////////////////////////////////*/

    /*///////////////////////////////////
                Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the call is not a delegatecall
    error StartPosition_CallerIsNotDiamond(address context, address diamond);
    ///@notice error emitted if one of the amounts to stake is zero
    error StartPosition_InvalidAmountToStake(uint256 amount0Desired, uint256 amount1Desired);

    /*///////////////////////////////////
                Modifiers
    ///////////////////////////////////*/

    /*///////////////////////////////////
                Functions
    ///////////////////////////////////*/

    /*///////////////////////////////////
                constructor
    ///////////////////////////////////*/
    ///@notice Facet constructor
    constructor(address _diamond, address _positionManager, address _protocolMultiSig) {
        i_diamond = _diamond;
        i_positionManager = INonFungiblePositionManager(_positionManager);
        i_multiSig = _protocolMultiSig;
        //never update state variables inside
    }

    /*///////////////////////////////////
            Receive&Fallback
    ///////////////////////////////////*/

    /*///////////////////////////////////
                external
    ///////////////////////////////////*/
    /**
        *@notice Creates a new liquidity position
        *@param _params inherited from INonFungiblePositionManager.MintParams
        *@return tokenId_ ID of the NFT representing the liquidity position.
        *@return liquidity_ Amount of liquidity added to the pool.
        *@dev function to be called by the StartSwapFacet.sol::startSwap function
    */
    function startPositionAfterSwap(
        INonFungiblePositionManager.MintParams memory _params
    ) external returns (
        uint256 tokenId_,
        uint128 liquidity_
    ){
        //@question How to block this function to only be called after the startSwap function?
        //This function will/must revert on the _handleProtocolFee call, because the contract will not have any money in it.
        //It will/must also revert when the `mint` function is called
        if (address(this) != i_diamond)
            revert StartPosition_CallerIsNotDiamond(address(this), i_diamond);
        
        //TODO: Sanity checks
        //@question which checks should be implemented?
        //@question what Uniswap already checks?

        //charge protocol fee over the totalAmountIn
        _params.amount0Desired = LibTransfers._handleProtocolFee(i_multiSig, _params.token0, _params.amount0Desired);
        _params.amount1Desired = LibTransfers._handleProtocolFee(i_multiSig, _params.token1, _params.amount1Desired);

        // Approve the tokens to be spend by the position manager
        IERC20(_params.token0).safeIncreaseAllowance(address(i_positionManager), _params.amount0Desired);
        IERC20(_params.token1).safeIncreaseAllowance(address(i_positionManager), _params.amount1Desired);

        // Mint position and return the results
        (tokenId_, liquidity_, , ) = i_positionManager.mint(_params);

        uint256 amountToken0After = IERC20(_params.token0).balanceOf(address(this));
        uint256 amountToken1After = IERC20(_params.token1).balanceOf(address(this));

        // Refund unused token0 (if any)
        if (amountToken0After != ZERO) {
            IERC20(_params.token0).safeTransfer(_params.recipient, amountToken0After);
        }

        // Refund unused token1 (if any)
        if (amountToken1After != ZERO) {
            IERC20(_params.token1).safeTransfer(_params.recipient, amountToken1After);
        }
    }

    //TODO: Move this to a new facet
    /**
        *@notice Creates a new liquidity position
        *@param _params inherited from INonFungiblePositionManager.MintParams
        *@return tokenId_ ID of the NFT representing the liquidity position.
        *@return liquidity_ Amount of liquidity added to the pool.
    */
    function startPosition(
        INonFungiblePositionManager.MintParams memory _params
    ) external returns (
        uint256 tokenId_,
        uint128 liquidity_
    ){
        if (address(this) != i_diamond) revert StartPosition_CallerIsNotDiamond(address(this), i_diamond);
        if(_params.amount0Desired == ZERO || _params.amount1Desired == ZERO) revert StartPosition_InvalidAmountToStake(_params.amount0Desired, _params.amount1Desired);
        
        //transfer the totalAmountIn FROM user
            //We don't care about the return in here because we are checking it after the swap
            //Even though it may be a FoT token, we will account for it after the swap
            //We can do this way because the swap will never be done over the whole amount, only fractions
        uint256 receivedToken0Amount = LibTransfers._handleTokenTransfers(_params.token0, _params.amount0Desired);
        uint256 receivedToken1Amount = LibTransfers._handleTokenTransfers(_params.token1, _params.amount1Desired);
        
        //TODO: Sanity checks
        //@question which checks should be implemented?
        //@question what Uniswap already checks?

        //charge protocol fee over the totalAmountIn
        _params.amount0Desired = LibTransfers._handleProtocolFee(i_multiSig, _params.token0, receivedToken0Amount);
        _params.amount1Desired = LibTransfers._handleProtocolFee(i_multiSig, _params.token1, receivedToken1Amount);

        // Approve the tokens to be spend by the position manager
        IERC20(_params.token0).safeIncreaseAllowance(address(i_positionManager), _params.amount0Desired);
        IERC20(_params.token1).safeIncreaseAllowance(address(i_positionManager), _params.amount1Desired);

        // Mint position and return the results
        (tokenId_, liquidity_, , ) = i_positionManager.mint(_params);

        uint256 amountToken0After = IERC20(_params.token0).balanceOf(address(this));
        uint256 amountToken1After = IERC20(_params.token1).balanceOf(address(this));

        // Refund unused token0 (if any)
        if (amountToken0After != ZERO) {
            IERC20(_params.token0).safeTransfer(_params.recipient, amountToken0After);
        }

        // Refund unused token1 (if any)
        if (amountToken1After != ZERO) {
            IERC20(_params.token1).safeTransfer(_params.recipient, amountToken1After);
        }
    }

    /*///////////////////////////////////
                public
    ///////////////////////////////////*/

    /*///////////////////////////////////
                internal
    ///////////////////////////////////*/

    /*///////////////////////////////////
                private
    ///////////////////////////////////*/

    /*///////////////////////////////////
                View & Pure
    ///////////////////////////////////*/
}

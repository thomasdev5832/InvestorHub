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
    ///@notice event emitted when a new position is opened.
    event StartPositionFacet_PositionStarted(uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);

    /*///////////////////////////////////
                Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the call is not a delegatecall
    error StartPosition_CallerIsNotDiamond(address context, address diamond);
    ///@notice error emitted if one of the amounts to stake is zero
    error StartPosition_InvalidAmountToStake(uint256 amount0Desired, uint256 amount1Desired);

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
                external
    ///////////////////////////////////*/
    /**
        *@notice Creates a new liquidity position
        *@param _params inherited from INonFungiblePositionManager.MintParams
        *@return tokenId_ ID of the NFT representing the liquidity position.
        *@return liquidity_ Amount of liquidity added to the pool.
        *@dev this function should only be called if the user has both pool tokens
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

        uint256 amount0;
        uint256 amount1;

        // Mint position and return the results
        (tokenId_, liquidity_, amount0, amount1) = i_positionManager.mint(_params);

        // Refund any dust left in the contract
        LibTransfers._handleRefunds(_params.recipient, _params.token0, _params.amount0Desired - amount0);
        LibTransfers._handleRefunds(_params.recipient, _params.token1, _params.amount1Desired - amount1);

        emit StartPositionFacet_PositionStarted(tokenId_, liquidity_, amount0, amount1);
    }
}

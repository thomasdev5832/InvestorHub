///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/
import { LibTransfers } from "src/libraries/LibTransfers.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StartUniswapV3PositionFacet {
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
    address immutable i_vault;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 private constant ZERO = 0;
    /*///////////////////////////////////
                Events
    ///////////////////////////////////*/
    ///@notice event emitted when a new position is opened.
    event StartUniswapV3PositionFacet_PositionStarted(uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);

    /*///////////////////////////////////
                Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the call is not a delegatecall
    error StartUniswapV3PositionFacet_CallerIsNotDiamond(address context, address diamond);
    ///@notice error emitted if one of the amounts to stake is zero
    error StartUniswapV3PositionFacet_InvalidAmountToStake(uint256 amount0Desired, uint256 amount1Desired);

                                /*////////////////////////////////////////////////////
                                                        Functions
                                ////////////////////////////////////////////////////*/

    /*///////////////////////////////////
                constructor
    ///////////////////////////////////*/
    ///@notice Facet constructor
    constructor(address _diamond, address _positionManager, address _protocolVault) {
        i_diamond = _diamond;
        i_positionManager = INonFungiblePositionManager(_positionManager);
        i_vault = _protocolVault;
        ///@dev never update state variables inside
    }
        
    //Question: Can this function be called directly?
    /**
        *@notice Creates a new liquidity position
        *@param _params inherited from INonFungiblePositionManager.MintParams
    */
    function startPositionUniswapV3(
        INonFungiblePositionManager.MintParams memory _params,
        bool _afterSwap,
        bool _isCrossChainTx
    ) external {
        if (address(this) != i_diamond) revert StartUniswapV3PositionFacet_CallerIsNotDiamond(address(this), i_diamond);
        if(_params.amount0Desired == ZERO || _params.amount1Desired == ZERO) revert StartUniswapV3PositionFacet_InvalidAmountToStake(_params.amount0Desired, _params.amount1Desired);
        uint256 receivedToken0Amount;
        uint256 receivedToken1Amount;
        //@question which checks should be implemented? What Uniswap already checks?

        //TODO: Block users from not sending any token and still use operational LINK's
        if(!_afterSwap){
            //transfer the totalAmountIn FROM user
            receivedToken0Amount = LibTransfers._handleTokenTransfers(_params.token0, _params.amount0Desired);
            receivedToken1Amount = LibTransfers._handleTokenTransfers(_params.token1, _params.amount1Desired);
        }
        
        //charge protocol fee over the totalAmountIn
        if (!_isCrossChainTx){
            _params.amount0Desired = LibTransfers._handleProtocolFee(i_vault, _params.token0, receivedToken0Amount);
            _params.amount1Desired = LibTransfers._handleProtocolFee(i_vault, _params.token1, receivedToken1Amount);
        }

        // Approve the tokens to be spend by the position manager
        IERC20(_params.token0).safeIncreaseAllowance(address(i_positionManager), _params.amount0Desired);
        IERC20(_params.token1).safeIncreaseAllowance(address(i_positionManager), _params.amount1Desired);

        // Mint position and return the results
        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = i_positionManager.mint(_params);

        // Refund any dust left in the contract
        LibTransfers._handleRefunds(_params.recipient, _params.token0, _params.amount0Desired - amount0);
        LibTransfers._handleRefunds(_params.recipient, _params.token1, _params.amount1Desired - amount1);

        emit StartUniswapV3PositionFacet_PositionStarted(tokenId, liquidity, amount0, amount1);
    }
}
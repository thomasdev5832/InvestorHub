///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/
import { LibTransfers } from "src/libraries/LibTransfers.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract IncreaseLiquidityFacet {
    ////////////////////////////////////////////////////////////
                    /// Type Declarations ///
    ////////////////////////////////////////////////////////////
    using SafeERC20 for IERC20;

    /*///////////////////////////////////
            State variables
    ///////////////////////////////////*/
    INonFungiblePositionManager immutable i_positionManager;
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store the multi sig wallet address
    address immutable i_multiSig;

    /*///////////////////////////////////
                Errors
    ///////////////////////////////////*/
    ///@notice error emitted when the call was not delegated
    error IncreaseLiquidity_CallerIsNotDiamond(address context, address diamond);

    /*///////////////////////////////////
                Functions
    ///////////////////////////////////*/

    /*///////////////////////////////////
                constructor
    ///////////////////////////////////*/
    ///@notice Facet constructor
    constructor(address _diamond, address _positionManager, address _multiSig) {
        i_diamond = _diamond;
        i_positionManager = INonFungiblePositionManager(_positionManager);
        i_multiSig = _multiSig;
        //never update state variables inside
    }

    /*///////////////////////////////////
                external
    ///////////////////////////////////*/
    /**
        *@notice Adds liquidity to the current range of a specified position.
        *@param _params inherited from INonFungiblePositionManager
        *@return liquidity_ New liquidity amount after addition.
        *@return amount0_ Actual amount of DAI added.
        *@return amount1_ Actual amount of USDC added.
        *@dev the `collect` function checks if the caller is allowed
        *@dev caller must give authorization to the diamond before calling this function.
    */
    function increaseLiquidityCurrentRange(
        address _token0,
        address _token1,
        INonFungiblePositionManager.IncreaseLiquidityParams memory _params
    ) external returns (uint128 liquidity_, uint256 amount0_, uint256 amount1_) {
        if(address(this) != i_diamond) revert IncreaseLiquidity_CallerIsNotDiamond(address(this), i_diamond);

        //Transfer the tokens to be staked and increase the liquidity
        _params.amount0Desired = LibTransfers._handleTokenTransfers(_token0, _params.amount0Desired);
        _params.amount1Desired = LibTransfers._handleTokenTransfers(_token1, _params.amount1Desired);

        //charge protocol fee over the totalAmountIn
        _params.amount0Desired = LibTransfers._handleProtocolFee(i_multiSig, _token0, _params.amount0Desired);
        _params.amount1Desired = LibTransfers._handleProtocolFee(i_multiSig, _token1, _params.amount1Desired);

        //Safe approve position manager for the amount desired
        IERC20(_token0).safeIncreaseAllowance(address(i_positionManager), _params.amount0Desired);
        IERC20(_token1).safeIncreaseAllowance(address(i_positionManager), _params.amount1Desired);

        //Gets contract initial balance
        uint256 balanceBeforeForToken0 = IERC20(_token0).balanceOf(address(this)) - _params.amount0Desired;
        uint256 balanceBeforeForToken1 = IERC20(_token1).balanceOf(address(this)) - _params.amount1Desired;

        // Increase liquidity and return the results
        (liquidity_, amount0_, amount1_) = i_positionManager.increaseLiquidity(_params);

        //Gets the current the dust, if any.
        uint256 finalBalanceForToken0 = IERC20(_token0).balanceOf(address(this)) - balanceBeforeForToken0;
        uint256 finalBalanceForToken1 = IERC20(_token1).balanceOf(address(this)) - balanceBeforeForToken1;

        // Refund any dust left in the contract
        LibTransfers._handleRefunds(msg.sender, _token0, finalBalanceForToken0);
        LibTransfers._handleRefunds(msg.sender, _token1, finalBalanceForToken1);
    }

}
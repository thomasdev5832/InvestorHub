///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";

contract IncreaseLiquidityFacet {

    /*///////////////////////////////////
            State variables
    ///////////////////////////////////*/
    INonFungiblePositionManager immutable i_positionManager;
    
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;

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
    constructor(address _diamond, address _positionManager) {
        i_diamond = _diamond;
        i_positionManager = INonFungiblePositionManager(_positionManager);
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
        INonFungiblePositionManager.IncreaseLiquidityParams memory _params
    ) external returns (uint128 liquidity_, uint256 amount0_, uint256 amount1_) {
        if(address(this) != i_diamond) revert IncreaseLiquidity_CallerIsNotDiamond(address(this), i_diamond);

        // Increase liquidity and return the results
        (liquidity_, amount0_, amount1_) = i_positionManager.increaseLiquidity(_params);
    }

}
///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/

contract IncreaseLiquidityFacet {

    /*///////////////////////////////////
            Type declarations
    ///////////////////////////////////*/

    /*///////////////////////////////////
            State variables
    ///////////////////////////////////*/
    INonFungiblePositionManager immutable i_positionManager;
    
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;

    /*///////////////////////////////////
                Events
    ///////////////////////////////////*/

    /*///////////////////////////////////
                Errors
    ///////////////////////////////////*/
    error IncreaseLiquidity_CallerIsNotDiamond(address context, address diamond);

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
    constructor(address _diamond, address _positionManager) {
        i_diamond = _diamond;
        i_positionManager = INonFungiblePositionManager(_positionManager);
        //never update state variables inside
    }

    /*///////////////////////////////////
            Receive&Fallback
    ///////////////////////////////////*/

    /*///////////////////////////////////
                external
    ///////////////////////////////////*/
    /**
        *@notice Adds liquidity to the current range of a specified position.
        *@param _params inherited from INonFungiblePositionManager
        *@return liquidity_ New liquidity amount after addition.
        *@return amount0_ Actual amount of DAI added.
        *@return amount1_ Actual amount of USDC added.
    */
    function increaseLiquidityCurrentRange(
        INonFungiblePositionManager.IncreaseLiquidityParams memory _params
    ) external returns (uint128 liquidity_, uint256 amount0_, uint256 amount1_) {
        if(address(this) != i_diamond) revert IncreaseLiquidity_CallerIsNotDiamond(address(this), i_diamond);

        // Increase liquidity and return the results
        (liquidity_, amount0_, amount1_) = i_positionManager.increaseLiquidity(_params);
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
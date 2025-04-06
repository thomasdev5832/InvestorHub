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

contract DecreaseLiquidityFacet {

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
    error DecreaseLiquidity_CallerIsNotDiamond(address context, address diamond);

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
        *@notice Decreases liquidity for a specified position.
        *@param _params inherited from INonFungiblePositionManager docs.
        *@return amount0_ Amount of token one withdrawn.
        *@return amount1_ Amount of token two withdrawn.
    */
    function decreaseLiquidityCurrentRange(
        INonFungiblePositionManager.DecreaseLiquidityParams memory _params
    ) external returns (uint256 amount0_, uint256 amount1_) {
        if(address(this) != i_diamond) revert DecreaseLiquidity_CallerIsNotDiamond(address(this), i_diamond);

        // Decrease liquidity and return the amounts withdrawn
        (amount0_, amount1_) = i_positionManager.decreaseLiquidity(_params);
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
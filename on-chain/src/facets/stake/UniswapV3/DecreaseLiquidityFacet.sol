///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";

contract DecreaseLiquidityFacet {

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
    error DecreaseLiquidity_CallerIsNotDiamond(address context, address diamond);

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
        *@notice Decreases liquidity for a specified position.
        *@param _params inherited from INonFungiblePositionManager docs.
        *@return amount0_ Amount of token one withdrawn.
        *@return amount1_ Amount of token two withdrawn.
        *@dev the `decreaseLiquidity` function checks if the caller is allowed
        *@dev caller must give authorization to the diamond before calling this function.
    */
    function decreaseLiquidityCurrentRange(
        INonFungiblePositionManager.DecreaseLiquidityParams memory _params
    ) external returns (uint256 amount0_, uint256 amount1_) {
        if(address(this) != i_diamond) revert DecreaseLiquidity_CallerIsNotDiamond(address(this), i_diamond);

        // Decrease liquidity and return the amounts withdrawn
        (amount0_, amount1_) = i_positionManager.decreaseLiquidity(_params);
    }

}
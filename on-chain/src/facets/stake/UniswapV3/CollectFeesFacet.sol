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

contract CollectFeesFacet {

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
    error CollectFees_CallerIsNotDiamond(address context, address diamond);

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
    /// @notice Collects all fees earned by the specified liquidity position.
    /// @param _params inherited from INonFungiblePositionManager
    /// @return amount0_ Amount of token one fees collected.
    /// @return amount1_ Amount of token two fees collected.
    function collectAllFees(
        INonFungiblePositionManager.CollectParams memory _params
    ) external returns (uint256 amount0_, uint256 amount1_) {
        if(address(this) != i_diamond) revert CollectFees_CallerIsNotDiamond(address(this), i_diamond);

        // Collect the fees and return the amounts
        (amount0_, amount1_) = i_positionManager.collect(_params);
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
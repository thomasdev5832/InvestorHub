///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
import { INonFungiblePositionManager } from "src/facets/stake/interfaces/INonFungiblePositionManager.sol";

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/

contract CollectFees {

    /*///////////////////////////////////
            Type declarations
    ///////////////////////////////////*/

    /*///////////////////////////////////
            State variables
    ///////////////////////////////////*/
    INonFungiblePositionManager constant POSITION_MANAGER = INonFungiblePositionManager(0xC36442b4a4522E871399CD717aBDD847Ab11FE88); //TODO: Change to Base.
    
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
    constructor(address _diamond){
        i_diamond = _diamond;
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
        (amount0_, amount1_) = POSITION_MANAGER.collect(_params);
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
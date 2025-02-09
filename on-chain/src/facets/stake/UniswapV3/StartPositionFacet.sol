///SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

/*///////////////////////////////////
            Interfaces
///////////////////////////////////*/

/*///////////////////////////////////
            Libraries
///////////////////////////////////*/

contract StartPositionFacet {
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
    error StartPosition_CallerIsNotDiamond(address context, address diamond);

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
        *@notice Creates a new liquidity position
        *@param _params inherited from INonFungiblePositionManager.MintParams
        *@return tokenId_ ID of the NFT representing the liquidity position.
        *@return liquidity_ Amount of liquidity added to the pool.
        *@return amount0_ Actual amount of DAI added.
        *@return amount1_ Actual amount of USDC added.
    */
    function startPosition(
        INonFungiblePositionManager.MintParams memory _params
    ) external returns (
        uint256 tokenId_,
        uint128 liquidity_,
        uint256 amount0_,
        uint256 amount1_
    ){
        if (address(this) != i_diamond)
            revert StartPosition_CallerIsNotDiamond(address(this), i_diamond);
        
        //@question which checks should be implemented?
        //@question what Uniswap already checks?

        // Mint position and return the results
        (tokenId_, liquidity_, amount0_, amount1_) = i_positionManager.mint(_params);
        //(bool success, bytes memory erro) = i_positionManager.call(payload)
        //payload = abi.encodeWithSelector(
        // INonFungiblePositionManager.mint.selector,
        // _params
        // );

        // struct MintParams {
        //     address token0; eth
        //     address token1; usdc
        //     uint24 fee;
        //     int24 tickLower;
        //     int24 tickUpper;
        //     uint256 amount0Desired; 1 eth == 2.6k
        //     uint256 amount1Desired; 1 usdc == 2.6k -> swap
        //     uint256 amount0Min;
        //     uint256 amount1Min;
        //     address recipient;
        //     uint256 deadline;
        // }
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

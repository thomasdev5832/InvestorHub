///SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

/// Libraries
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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
    using SafeERC20 for IERC20;

    /*///////////////////////////////////
            State variables
    ///////////////////////////////////*/
    INonFungiblePositionManager immutable i_positionManager;

    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 private constant ZERO = 0;
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
    */
    function startPosition(
        INonFungiblePositionManager.MintParams memory _params
    ) external returns (
        uint256 tokenId_, //Check if need to return on StartSwapFacet
        uint128 liquidity_
    ){
        if (address(this) != i_diamond)
            revert StartPosition_CallerIsNotDiamond(address(this), i_diamond);
        
        //TODO: Sanity checks
        //@question which checks should be implemented?
        //@question what Uniswap already checks?

        uint256 amountToken0Before = IERC20(_params.token0).balanceOf(address(this));
        uint256 amountToken1Before = IERC20(_params.token1).balanceOf(address(this));

        // Mint position and return the results
        (tokenId_, liquidity_, , ) = i_positionManager.mint(_params);

        uint256 amountToken0After = IERC20(_params.token0).balanceOf(address(this));
        uint256 amountToken1After = IERC20(_params.token1).balanceOf(address(this));

        // Refund unused token0 (if any)
        if (amountToken0Before - amountToken0After != ZERO) {
            uint256 refund0 = amountToken0Before - amountToken0After;
            IERC20(_params.token0).safeTransfer(msg.sender, refund0);
        }

        // Refund unused token1 (if any)
        if (amountToken1Before - amountToken1After != ZERO) {
            uint256 refund1 = amountToken1Before - amountToken1After;
            IERC20(_params.token1).safeTransfer(msg.sender, refund1);
        }
        
        //(bool success, bytes memory erro) = i_positionManager.call(payload)
        //payload = abi.encodeWithSelector(
        // INonFungiblePositionManager.mint.selector,
        // _params
        // );
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

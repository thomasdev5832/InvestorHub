///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*/////////////////////////////
            Interfaces
/////////////////////////////*/
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ICCIPFacets } from "src/interfaces/Chainlink/ICCIPFacets.sol";
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";

/*/////////////////////////////
            Libraries
/////////////////////////////*/
import { SafeERC20 }  from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { LibTransfers } from "src/libraries/LibTransfers.sol";
import { LibUniswapV3 } from "src/libraries/LibUniswapV3.sol";

contract UniswapCrossChainPosition {

    /*/////////////////////////////////////////////
                    Type Declarations
    /////////////////////////////////////////////*/
    using SafeERC20 for IERC20;

    /*/////////////////////////////////////////////
                    State variables
    /////////////////////////////////////////////*/
    INonFungiblePositionManager immutable i_positionManager;

    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    
    /*/////////////////////////////////////////////
                        Error
    /////////////////////////////////////////////*/
    ///@notice error emitted when the function is not executed in the Diamond context
    error UniswapCCP_CallerIsNotDiamond(address actualContext, address diamondContext);

    /*/////////////////////////////////////////////
                        Functions
    /////////////////////////////////////////////*/

    /*///////////////////////////////////
                constructor
    ///////////////////////////////////*/
    ///@notice Facet constructor
    constructor(address _diamond, address _positionManager) {
        i_diamond = _diamond;
        i_positionManager = INonFungiblePositionManager(_positionManager);
        ///@dev never update state variables inside
    }
}
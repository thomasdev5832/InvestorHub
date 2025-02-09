///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";
interface IStartPositionFacet is INonFungiblePositionManager {

    // struct StakePayload{
    //     address receiverAddress;
    //     address firstToken;
    //     address secondToken;
    //     uint256 firstTokenAmount; ///@notice final amount to deposit
    //     uint256 secondTokenAmount; ///@notice final amount to deposit
    //     INonFungiblePositionManager.MintParams mint;
    // }

    function startPosition(INonFungiblePositionManager.MintParams memory _params) external;
}
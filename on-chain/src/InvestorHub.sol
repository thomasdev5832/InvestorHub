// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///Imports///
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {InvestorHubUtils} from "./helpers/InvestorHubUtils.sol";

///Errors///

///Interfaces, Libraries///

contract InvestorHub is InvestorHubUtils, ReentrancyGuard{

    ///State variables///

    ///Modifiers///

    ///constructor///

    ///external///
    /**
        * @notice Main function  that will receive all users calls
        * @param _payload The payload data to process all operations
        * @dev this function needs to handle common approve+transfers and permit() calls
    */
    function entrypoint(Payload memory _payload) external payable {
        //checks

        //effects
        _privateSafeTransferFrom(_payload.tokenOne, _payload.amountTokenOne);
        _privateSafeTransferFrom(_payload.tokenTwo, _payload.amountTokenTwo);
    
        (_payload.amountTokenOne, _payload.amountTokenTwo) = _feeCalculation(_payload);

        //Interactions
        _safeDelegateCall(_payload);
    }

    function endPosition() external nonReentrant {

    }

    ///public///

    ///internal///

    ///private///

    ///view & pure///
}
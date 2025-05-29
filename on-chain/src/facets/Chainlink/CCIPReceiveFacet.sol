///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*/////////////////////////////
            Imports
/////////////////////////////*/
import { CCIPReceiver } from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";

/*/////////////////////////////
            Interfaces
/////////////////////////////*/
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*/////////////////////////////
            Libraries
/////////////////////////////*/
import { SafeERC20 }  from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Client } from "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";

contract CCIPReceiveFacet is CCIPReceiver {

    /*/////////////////////////////////////////////
                    Type Declarations
    /////////////////////////////////////////////*/
    using SafeERC20 for IERC20;

    /*/////////////////////////////////////////////
                    State Variables
    /////////////////////////////////////////////*/
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;

    ///@notice constant variable to store MAGIC NUMBERS
    uint8 private constant ZERO = 0;
    uint8 private constant MAX_MESSAGE_NUM_PAYLOADS = 6;

    /*/////////////////////////////////////////////
                        Events
    /////////////////////////////////////////////*/

    /*/////////////////////////////////////////////
                        Error
    /////////////////////////////////////////////*/
    ///@notice error emitted when the function is not executed in the Diamond context
    error CCIPReceiveFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
    ///@notice error emitted when the payload call fails
    error CCIPReceiveFacet_CallFailed(bytes data);
    ///@notice error emitted if one of the calls has the diamond as target
    error CCIPReceiveFacet_CannotCallTheDiamond();

                                    /*/////////////////////////////////////////////
                                                        Functions
                                    /////////////////////////////////////////////*/
    

    /*//////////////////////////////
                Modifiers
    //////////////////////////////*/

    /*//////////////////////////////
                Constructor
    //////////////////////////////*/
    constructor(address _diamond, address _router) CCIPReceiver(_router){
        i_diamond = _diamond;
    }

    /*//////////////////////////////
                External
    //////////////////////////////*/

    /*//////////////////////////////
                Public
    //////////////////////////////*/

    /*//////////////////////////////
                Internal
    //////////////////////////////*/

    /*//////////////////////////////
                Private
    //////////////////////////////*/
    /**
        @notice Function to handle cross-chain operations
        @param _message the CCIP payload received
        @dev this function doesn't check for access control
             which means, any contract can use it's functionally
             Therefore, it cannot be able to call itself.
             Otherwise attackers can leverage it against the diamond
        @dev it will not use internal facets because at this time,
             fees were already charged on the origin
    */
    function _ccipReceive(
        Client.Any2EVMMessage memory _message
    ) internal override {
        ///@question what about sequencers? if they are down,
        ///cross-chain messages are also affected?
        if(address(this) != i_diamond) revert CCIPReceiveFacet_CallerIsNotDiamond(address(this), i_diamond);

        bytes[] memory calls = new bytes[](MAX_MESSAGE_NUM_PAYLOADS);

        ///@notice all calls have the address to be called + payload
        (
            calls[0], // tokenReceivedApproval,
            calls[1], // swapCallOne,
            calls[2], // swapCallTwo,
            calls[3], // tokenOneApproval,
            calls[4], // tokenTwoApproval,
            calls[5] // investCall
        ) = abi.decode(
            _message.data,
            (
                bytes, 
                bytes, 
                bytes, 
                bytes, 
                bytes, 
                bytes
            )
        );

        for(uint256 i; i < calls.length; ++i){
            //TODO: handle errors properly
            if(calls[i].length > ZERO){
                (
                    address target,
                    bytes memory payload
                ) = abi.decode(calls[i], (address, bytes));

                if(target == address(this)) revert CCIPReceiveFacet_CannotCallTheDiamond();
                
                (bool success, bytes memory data) = target.call(payload);
                if(!success) revert CCIPReceiveFacet_CallFailed(data);
                //TODO: handle dust amounts left
            }
        }
    }

    /*//////////////////////////////
                View & Pure
    //////////////////////////////*/
}

/**
    User
    * Stake Link & USDC in Arbitrum's UniswapV3
    -> Start call [ETH]
        -> Convert into USDC?
        -> Calls CCIP and initiate Cross-chain transfer.
        -> Receives USDC tokenAmounts[0]
        -> Receives a Data payload
            -> encoded call to UniV3 Swap
                Must approve USDC received before
            -> encoded call to UniV3 stake function
                Must approve UniV3 for both tokens
            -> Must remove any dust from the contract, sending back to user.
*/
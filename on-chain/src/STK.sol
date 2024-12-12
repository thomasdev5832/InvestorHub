// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///Imports///
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

///Errors///

///Interfaces, Libraries///

contract STK {

    ///Type declarations///

    ///State variables///

    ///Immutable & Constant///
    ///@notice Loss of Precision Handler
    uint256 constant PRECISION_MULTIPLIER = 1*10**6;
    ///@notice Protocol Fee in BPS
    uint256 constant PROTOCOL_FEE = 10_000;

    ///Events///

    ///Modifiers///

    ///Functions///

    ///constructor///

    ///receive function ///

    ///fallback function///

    ///external///
    function entrypoint(Payload memory _payload) external {
        //checks

        //effects
        //transferir o valor para o contrato - Gasta o Permit
            //address(this)
        uint256 value = _feeCalculation(_payload);

        //delegatecall()
    }

    ///public///

    ///internal///

    ///private///
    function _protocolFeeRedirect() private {
        //multi-sig
    }

    function _feeCalculation(uint256 _amount) external view returns(uint256 _protocolFee){
        _protocolFeeRedirect();
    }

    ///view & pure///
}
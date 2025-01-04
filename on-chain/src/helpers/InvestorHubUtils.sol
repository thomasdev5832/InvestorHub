//SPX-License Identifier: MIT
pragma solidity 0.8.26;

///Imports///
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract InvestorHubUtils {

    ///Type declarations///
    ///@notice Using safe functionalities through IERC20 common calls
    using SafeERC20 for IERC20;

    ///Custom Types///
    ///@notice struct to handle all entrypoint payload data
    struct Payload{
        address tokenOne;
        address tokenTwo;
        uint256 amountTokenOne;
        uint256 amountTokenTwo;
        address receiver;
    }

    ///Instances///

    ///Immutable///
    
    ///Constant///
    ///@notice protocol multi-sig address
    address constant PROTOCOL_WALLET = address(1);
    ///@notice Loss of Precision Handler
    uint256 constant PRECISION_MULTIPLIER = 1*10**6;
    ///@notice Protocol Fee in BPS
    uint256 constant PROTOCOL_FEE = 10_000;


    ///Events///
    event InvestorHub_TokenReceived(address token, uint256 amount);
    event InvestorHub_ProtocolFeeTransferred(address tokenToTransfer, uint256 feeToTransfer);

    ///Internal///

    function _privateSafeTransferFrom(address _token, uint256 _amount) internal {
        emit InvestorHub_TokenReceived(_token, _amount);

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
    }

    function _feeCalculation(Payload memory _payload) internal returns(uint256 _amountOneMinusFee, uint256 _amountTwoMinusFee){
        _amountOneMinusFee = _payload.amountTokenOne - _precisionCalculation(_payload.tokenOne, _payload.amountTokenOne);
        _amountTwoMinusFee = _payload.amountTokenTwo - _precisionCalculation(_payload.tokenTwo, _payload.amountTokenTwo);
    }


    function _precisionCalculation(address _tokenToTransfer, uint256 _amount) internal returns(uint256 _calculatedFee){
        _calculatedFee = ((_amount * PRECISION_MULTIPLIER) / PROTOCOL_FEE) / PRECISION_MULTIPLIER;

        _protocolFeeRedirect(_tokenToTransfer, _calculatedFee);
    }

    function _protocolFeeRedirect(address _tokenToTransfer, uint256 _feeToTransfer) internal {

        emit InvestorHub_ProtocolFeeTransferred(_tokenToTransfer, _feeToTransfer);
        //multi-sig
        IERC20(_tokenToTransfer).safeTransfer(PROTOCOL_WALLET, _feeToTransfer);
    }

    function _safeDelegateCall(Payload memory _payload) internal {

    }
}
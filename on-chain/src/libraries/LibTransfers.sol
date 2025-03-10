//SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

/// Libraries
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

library LibTransfers{
    ////////////////////////////////////////////////////////////
                    /// Type Declarations ///
    ////////////////////////////////////////////////////////////
    using SafeERC20 for IERC20;


    ////////////////////////////////////////////////////////////
                        /// Errors ///
    ////////////////////////////////////////////////////////////
    ///@notice error emitted when delegatecall() fails
    // error LibTransfers_DelegatecallFailed(bytes data); TODO: cleanup if not needed
    
    ////////////////////////////////////////////////////////////////////////////////
                                /// Functions ///
    ////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////
                                /// EXTERNAL ///
    //////////////////////////////////////////////////////////////////////
    // function _safeDelegatecall(bytes4 _callPayload, address _router) internal { TODO: cleanup if not needed
    //     (bool success, bytes memory data) = _router.delegatecall(_callPayload);
    //     if(!success) revert LibTransfers_DelegatecallFailed(data);
    // }

    /**
        *@notice internal function to handle transfers TO protocol
        *@param _token the token to be transferred
        *@param _amount the amount to be transferred
        *@return _transferredAmount the received amount
        *@dev this function supports `Fee on Transfer` tokens
    */
    function _handleTokenTransfers(address _token, uint256 _amount) internal returns(uint256 _transferredAmount){
        uint256 balanceBefore = IERC20(_token).balanceOf(address(this));

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 balanceAfter = IERC20(_token).balanceOf(address(this));

        uint256 finalBalance = balanceAfter - balanceBefore;

        _transferredAmount = finalBalance == _amount ? _amount : finalBalance;
    }
}
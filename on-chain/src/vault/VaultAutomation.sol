///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*/////////////////////////////
            Imports
/////////////////////////////*/
import { KeeperBase } from "@chainlink/contracts/src/v0.8/automation/KeeperBase.sol";
import { IHUBFunctions } from "src/vault/IHUBFunctions.sol";

/*/////////////////////////////
            Interfaces
/////////////////////////////*/
import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*/////////////////////////////
            Libraries
/////////////////////////////*/
import {SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract VaultAutomation is AutomationCompatibleInterface, KeeperBase, IHUBFunctions{
    //TODO make it upgradeable -> use Transparent or UUPS

    /*/////////////////////////////////////////////
                    Type Declarations
    /////////////////////////////////////////////*/
    using SafeERC20 for IERC20;

    /*/////////////////////////////////////////////
                    State Variables
    /////////////////////////////////////////////*/
    struct Tokens {
        address token;
        uint256 threshold;
    }
    
    ///@notice immutable variable to store the multi-sig address
    address i_multisig;
    ///@notice magic number removal
    uint8 constant MAX_TOKENS_SUPPORTED = 6;

    /*/////////////////////////////////////////////
                        Events
    /////////////////////////////////////////////*/
    ///@notice event emitted when the forwarder is updated
    event VaultAutomation_ForwarderAddressUpdated(address forwarder);
    ///@notice event emitted when a emergency withdraw is performed
    event VaultAutomation_EmergencyWithdrawalPerformed(address caller, uint256 contractBalance);

    /*/////////////////////////////////////////////
                        Error
    /////////////////////////////////////////////*/
    ///@notice error emitted when the caller is not the Multi Signature wallet
    error VaultAutomation_CallerIsNotAllowedToWithdraw(address caller, address multisig);
    ///@notice error emitted when the input for the setForwarder function is an invalid address
    error VaultAutomation_InvalidForwarderAddress();
    ///@notice error emitted if the caller is not the forwarder
    error VaultAutomation_CallerIsNotTheForwarder();

                                    /*/////////////////////////////////////////////
                                                        Functions
                                    /////////////////////////////////////////////*/

    /*//////////////////////////////
                Modifiers
    //////////////////////////////*/
    modifier onlyMultiSig() {
        if(msg.sender != i_multisig) revert VaultAutomation_CallerIsNotAllowedToWithdraw(msg.sender, i_multisig);
        _;
    }

    /*//////////////////////////////
                Constructor
    //////////////////////////////*/
    constructor(
        address _multisig,
        address _functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId,
        address _owner
    ) IHUBFunctions(
        _functionsRouter,
        _donId,
        _subscriptionId,
        _owner
    ){
        i_multisig = _multisig;
    }

    /*//////////////////////////////
                External
    //////////////////////////////*/
    function checkUpkeep(bytes calldata) external view cannotExecute() returns(bool upkeepNeeded_, bytes memory performData_){
        Tokens[] memory tokensSupported = supportedTokens();

        for(uint256 i; i < MAX_TOKENS_SUPPORTED; ++i){
            uint256 balanceOfToken = IERC20(tokensSupported[i].token).balanceOf(address(this));
            
            if(balanceOfToken > tokensSupported[i].threshold){
                upkeepNeeded_ = true;
                performData_ = abi.encode(tokensSupported[i].token, balanceOfToken);
            }
        }
    }

    /**
        @notice Automation function to trigger the Chainlink Functions and perform swaps
        @param _performData the data received from the check upkeep
        @dev the perform upkeep must trigger Chainlink functions
             to get swap information from the SDK and swap
             the token for IHUB token
    */
    function performUpkeep(bytes calldata _performData) external {
        if(msg.sender != s_forwarder) revert VaultAutomation_CallerIsNotTheForwarder();

        (address token, uint256 balanceToConvert) = abi.decode(_performData, (address, uint256));

        //TODO: call functions
        bytes[] memory functionInput = new bytes[](2);
        functionInput[0] = abi.encodePacked(token);
        functionInput[1] = abi.encodePacked(balanceToConvert);

        sendRequest(functionInput);
    }

    /**
        @notice admin function to set the forwarder address
        @param _forwarder the address of the Automation Forwarder
        @dev can only be called by the owner
    */
    function setForwarder(address _forwarder) external /*onlyOwner*/ {
        if(_forwarder == address(0)) revert VaultAutomation_InvalidForwarderAddress();
        
        s_forwarder = _forwarder;

        emit VaultAutomation_ForwarderAddressUpdated(_forwarder);
    }

    /**
        @notice function to perform emergency withdrawals for incident response
        @param _token the token to withdraw
        @dev can only be called by the multisig in a 4/6 threshold
    */
    function emergencyWithdraw(address _token) external onlyMultiSig {
        uint256 contractBalance = IERC20(_token).balanceOf(address(this));
        
        IERC20(_token).safeTransfer(msg.sender, contractBalance);

        emit VaultAutomation_EmergencyWithdrawalPerformed(msg.sender, contractBalance);
    }

    /**
        @notice function to provide supported tokens data
        @return tokensSupported_ the array of supported tokens
    */
    function supportedTokens() internal pure returns(Tokens[] memory tokensSupported_){
        tokensSupported_ = new Tokens[](MAX_TOKENS_SUPPORTED);
        tokensSupported_[0] = Tokens(address(0x1), 2e17); //ETH
        tokensSupported_[1] = Tokens(address(0x2), 33e18); //LINK
        tokensSupported_[2] = Tokens(address(0x3), 500e6); //USDC
        tokensSupported_[3] = Tokens(address(0x4), 500e6); //USDT
        tokensSupported_[4] = Tokens(address(0x5), 5e5); //wBTC //TODO need to check the decimals, I don't remember
        tokensSupported_[5] = Tokens(address(0x6), 500e18); //DAI
    }
}
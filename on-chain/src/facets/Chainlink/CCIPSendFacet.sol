///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*/////////////////////////////
            Imports
/////////////////////////////*/

/*/////////////////////////////
            Interfaces
/////////////////////////////*/
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { INonFungiblePositionManager } from "src/interfaces/UniswapV3/INonFungiblePositionManager.sol";
import { IRouterClient } from "@chainlink/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { IDataFeedsFacet } from "src/interfaces/Chainlink/IDataFeedsFacet.sol";

/*/////////////////////////////
            Libraries
/////////////////////////////*/
import { SafeERC20 }  from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Client } from "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";
import { LibTransfers } from "src/libraries/LibTransfers.sol";
import { LibUniswapV3 } from "src/libraries/LibUniswapV3.sol";

contract CCIPSendFacet {

    /*/////////////////////////////////////////////
                    Type Declarations
    /////////////////////////////////////////////*/
    using SafeERC20 for IERC20;

    /*/////////////////////////////////////////////
                    State Variables
    /////////////////////////////////////////////*/
    struct CCTApproval{
        address token;
        bytes payload;
    }

    struct CCSwap{
        address target;
        bytes payload;
    }

    struct CCInvestment{
        address target;
        bytes payload;
    }

    struct TransactionData{
        uint64 chainSelector;
        address receiverContract;
        uint256 amountToSend;
        Client.GenericExtraArgsV2 args;
    }

    struct CCPayload{
        TransactionData transaction;
        CCTApproval[3] approvals;
        CCSwap[2] swaps;
        CCInvestment investment;
    }

    struct LocalUniswapPayload{
        address router;
        bytes path;
        address inputToken;
        uint256 deadline;
        uint256 amountInForToken0;
        uint256 amountOut;
    }

    ///@notice immutable variable to store the protocol multisig
    address immutable i_multisig;
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store the USDC address
    address immutable i_usdc;
    ///@notice immutable variable to store the CCIP router address
    IRouterClient immutable i_ccipRouter;
    ///@notice immutable variable to store the LINK token address
    IERC20 immutable i_link;

    /*/////////////////////////////////////////////
                        Events
    /////////////////////////////////////////////*/
    ///@notice event emitted when a CCIP transaction is successfully sent
    event CCIPSendFacet_MessageSent(bytes32 txId, uint64 destinationChainSelector, address sender, uint256 fees);

    /*/////////////////////////////////////////////
                        Error
    /////////////////////////////////////////////*/
    ///@notice error emitted when the function is not executed in the Diamond context
    error CCIPSendFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
    ///@notice error emitted when the tokenOut of a local swap is not USDC
    error CCIPSendFacet_InvalidLocalSwapInput();
    ///@notice error emitted when the link balance is not enough
    error CCIPSendFacet_NotEnoughBalance(uint256 fees, uint256 linkBalance);

                                    /*/////////////////////////////////////////////
                                                        Functions
                                    /////////////////////////////////////////////*/

    /*//////////////////////////////
                Constructor
    //////////////////////////////*/
    constructor(
        address _diamond,
        address _multiSig,
        address _usdc, 
        address _router,
        address _link
    ){
        i_diamond = _diamond;
        i_multisig = _multiSig;
        i_usdc = _usdc;
        i_ccipRouter = IRouterClient(_router);
        i_link = IERC20(_link);
    }

    /*//////////////////////////////
                External
    //////////////////////////////*/
    /**
        @notice Entry point function for cross-chain investments
        @param _localUniswapPayload the payload to swap ANY ERC20 token into USDC
        @param _payload the cross-chain payload
        @dev at first, we don't care what users will send in this payload
             if they pay us, they are good to go.
             If they follow the UI, they will have the correct payload to use
    */
    function startCrossChainInvestment(
        LocalUniswapPayload memory _localUniswapPayload,
        CCPayload memory _payload
    ) external {
        if(address(this) != i_diamond) revert CCIPSendFacet_CallerIsNotDiamond(address(this), i_diamond);
        
        _localUniswapPayload.amountInForToken0 = LibTransfers._handleTokenTransfers(_localUniswapPayload.inputToken, _localUniswapPayload.amountInForToken0);

        uint256 inputTokenDust;
        uint256 swapResult;

        if(_localUniswapPayload.inputToken != i_usdc) {
            (inputTokenDust, swapResult) = _verifySwapPayloadAndExecuteSwap(_localUniswapPayload);
        }
        
        LibTransfers._handleRefunds(msg.sender, _localUniswapPayload.inputToken, inputTokenDust);

        _payload.transaction.amountToSend = LibTransfers._handleProtocolFee(i_multisig, i_usdc, swapResult);
        
        _ccipSend(_payload);
    }

    /*//////////////////////////////
                Private
    //////////////////////////////*/
    /**
        @notice internal function to handle the CCIP environment
        @param _payload the cross-chain payload to be sent
    */
    function _ccipSend(CCPayload memory _payload) private {

        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _payload.transaction.receiverContract,
            _payload.transaction.amountToSend,
            abi.encode(
                abi.encodePacked(_payload.approvals[0].token, _payload.approvals[0].payload),
                abi.encodePacked(_payload.swaps[0].target, _payload.swaps[0].payload),
                abi.encodePacked(_payload.swaps[1].target, _payload.swaps[1].payload),
                abi.encodePacked(_payload.approvals[1].token, _payload.approvals[1].payload),
                abi.encodePacked(_payload.approvals[2].token, _payload.approvals[2].payload),
                abi.encodePacked(_payload.investment.target, _payload.investment.payload)
            ),
            _payload.transaction.args
        );

        // Get the fee required to send the CCIP message
        uint256 fees = i_ccipRouter.getFee(_payload.transaction.chainSelector, evm2AnyMessage);

        //Convert LINK -> USDC and subtract from the total to be sent.
        evm2AnyMessage.tokenAmounts[0].amount = evm2AnyMessage.tokenAmounts[0].amount - _getLinkUSDValue(fees);
            
        uint256 linkBalance = i_link.balanceOf(address(this));
        if (fees > linkBalance) revert CCIPSendFacet_NotEnoughBalance(linkBalance, fees);
            
        // approve the i_ccipRouter to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        i_link.approve(address(i_ccipRouter), fees);
            
        // Send the message through the i_ccipRouter and store the returned message ID
        bytes32 txId = i_ccipRouter.ccipSend(_payload.transaction.chainSelector, evm2AnyMessage);
            
        // Emit an event with message details
        emit CCIPSendFacet_MessageSent(txId, _payload.transaction.chainSelector, msg.sender, fees);
    }

    /**
        @notice Function to validate swap inputs and execute the swap
        @param _localUniswapPayload the struct that contains the info needed to perform the swap
        @return inputTokenDust_ any input token lefts to be refunded
        @return swapResult_ the tokens received from the swap
    */
    function _verifySwapPayloadAndExecuteSwap(
        LocalUniswapPayload memory _localUniswapPayload
    ) private returns(uint256 inputTokenDust_, uint256 swapResult_){
        (address token0, address token1) = LibUniswapV3._extractTokens(_localUniswapPayload.path);
        
        if(token0 != _localUniswapPayload.inputToken) revert CCIPSendFacet_InvalidLocalSwapInput();
        if(token1 != i_usdc) revert CCIPSendFacet_InvalidLocalSwapInput();

        (inputTokenDust_, swapResult_) = LibUniswapV3._handleSwapsV3(
            _localUniswapPayload.router,
            _localUniswapPayload.path,
            _localUniswapPayload.inputToken,
            _localUniswapPayload.amountInForToken0,
            _localUniswapPayload.amountOut
        );
    }

    /**
        @notice function to handle LINK to USDC conversion
        @param _feeInLink the amount that will be charge by CCIP
        @return linkUSDValue_ the USDC amount after conversion
    */
    function _getLinkUSDValue(uint256 _feeInLink) private returns(uint256 linkUSDValue_){
        bytes memory data = LibTransfers._handleDelegateCalls(
            i_diamond,
            abi.encodeWithSelector(
                IDataFeedsFacet.getUSDValueOfLink.selector,
                _feeInLink
            ));

        linkUSDValue_ = abi.decode(data, (uint256));
    }

    /*//////////////////////////////
                View & Pure
    //////////////////////////////*/
    /**
        * @notice Construct a CCIP message.
        * @dev This function will create an EVM2AnyMessage struct with all the necessary information for programmable tokens transfer.
        * @param _crossChainContractReceiver The address of the receiver contract.
        * @param _tokenAmount the amount to be transferred
        * @param _payload the cross-chain payload to be used
        * @param _args CCIP's extra args to customize functionality
        * @return message_ Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    */
    function _buildCCIPMessage(
        address _crossChainContractReceiver,
        uint256 _tokenAmount,
        bytes memory _payload,
        Client.GenericExtraArgsV2 memory _args
    ) private view returns (Client.EVM2AnyMessage memory message_) {
        // Set the token amounts
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount(address(i_usdc), _tokenAmount);

        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        message_ = Client.EVM2AnyMessage({
            receiver: abi.encode(_crossChainContractReceiver),
            data: _payload,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                _args
            ),
            feeToken: address(i_link)
        });
    }
}

/*
    User - on Ethereum
    * Stake LINk & USDC in Avalanche's UniswapV3
    -> Start call [ETH]
        -> Convert into USDC?
        -> 
*/
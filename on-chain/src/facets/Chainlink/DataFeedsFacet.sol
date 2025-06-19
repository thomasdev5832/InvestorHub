///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*/////////////////////////////
            Interfaces
/////////////////////////////*/
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract DataFeedsFacet {

    /*/////////////////////////////////////////////
                    State Variables
    /////////////////////////////////////////////*/
    ///@notice immutable variable to store the diamond address
    address immutable i_diamond;
    ///@notice immutable variable to store Price Feeds address
    AggregatorV3Interface immutable i_feeds;

    ///@notice constant variable to store the feeds heartbeat
    uint24 constant HEARTBEAT = 86400; //Base is 86_400, while Arbitrum is 3_600
    ///@notice constant variable to store MAGIC NUMBERS
    uint8 private constant ZERO = 0;
    uint256 private constant PRECISION_HANDLER = 1e20;

    /*/////////////////////////////////////////////
                        Error
    /////////////////////////////////////////////*/
    ///@notice error emitted when the function is not executed in the Diamond context
    error DataFeedsFacet_CallerIsNotDiamond(address actualContext, address diamondContext);
    ///@notice error emitted if the oracle return is stale
    error DataFeedsFacet_StalePrice();
    ///@notice error emitted if the roundId is zero
    error DataFeedsFacet_InvalidRoundId();
    ///@notice error emitted when the oracle returns a zero answer
    error DataFeedsFacet_AnswerCannotBeZero();

                                    /*/////////////////////////////////////////////
                                                        Functions
                                    /////////////////////////////////////////////*/
    constructor(
        address _diamond,
        address _feeds
    ) {
        i_diamond = _diamond;
        i_feeds = AggregatorV3Interface(_feeds);
    }

    /*//////////////////////////////
                View & Pure
    //////////////////////////////*/
    /**
        @notice view function to provide Feeds Data to CCIP facet
        @param _feeInLink the fee charged by link router
        @return linkUSDValue_ the value in USD for the link amount input
        @dev normalized with 6 decimals following USDC pattern
    */
    function getUSDValueOfLink(uint256 _feeInLink) external view returns(uint256 linkUSDValue_){
        if(address(this) != i_diamond) revert DataFeedsFacet_CallerIsNotDiamond(address(this), i_diamond);
        (
            uint80 roundId,
            int256 answer,
            /*uint256 startedAt*/,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = i_feeds.latestRoundData();
        if(HEARTBEAT > block.timestamp - updatedAt) revert DataFeedsFacet_StalePrice();
        if(roundId == ZERO || answeredInRound == ZERO) revert DataFeedsFacet_InvalidRoundId();
        if(uint256(answer) == ZERO) revert DataFeedsFacet_AnswerCannotBeZero(); 

        linkUSDValue_ = convertLinkToUSDC(_feeInLink, uint256(answer));
    }

    /**
        @notice helper function to normalize decimals
        @param _feeInLink the amount of LINK charged by CCIP
        @param _oracleAnswer the oracle value received
        @return linkUSDValue_ the value after decimal conversion
    */
    function convertLinkToUSDC(uint256 _feeInLink, uint256 _oracleAnswer) private pure returns(uint256 linkUSDValue_){
        //TODO: test for precision loss.
            //If needed, round up against user.
        linkUSDValue_ = (_feeInLink * _oracleAnswer) / PRECISION_HANDLER;
    }
}

/* Chisel Simulations
    uint256 private constant PRECISION_HANDLER = 1e20;
    ➜ uint256 linkUSDValue;
    ➜ uint256 ccipFee = 1e15;
    ➜ uint256 oracleAnswer = 15e8;
    ➜ linkUSDValue = (ccipFee * oracleAnswer) / PRECISION_HANDLER;
    ➜ linkUSDValue
    Type: uint256
    ├ Hex: 0x3a98
    ├ Hex (full word): 0x0000000000000000000000000000000000000000000000000000000000003a98
    └ Decimal: 15_000

    ➜ ccipFee = 1e18;
    ➜ linkUSDValue = (ccipFee * oracleAnswer) / PRECISION_HANDLER;
    ➜ linkUSDValue
    Type: uint256
    ├ Hex: 0xe4e1c0
    ├ Hex (full word): 0x0000000000000000000000000000000000000000000000000000000000e4e1c0
    └ Decimal: 15_000_000

    ➜ ccipFee = 3e17;
    ➜ linkUSDValue = (ccipFee * oracleAnswer) / PRECISION_HANDLER;
    ➜ linkUSDValue
    Type: uint256
    ├ Hex: 0x44aa20
    ├ Hex (full word): 0x000000000000000000000000000000000000000000000000000000000044aa20
    └ Decimal: 4_500_000
*/
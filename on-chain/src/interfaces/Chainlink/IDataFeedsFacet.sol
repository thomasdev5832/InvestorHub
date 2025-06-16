///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IDataFeedsFacet {
    function getUSDValueOfLink(uint256 _feeInLink) external view returns(uint256 linkUsdValue_);
}
Compiling 89 files with Solc 0.8.26
Solc 0.8.26 finished in 2.59s
Compiler run successful with warnings:
Warning (2072): Unused local variable.
  --> src/facets/stake/UniswapV3/IncreaseLiquidityFacet.sol:86:9:
   |
86 |         uint256 amountToken0Refunded = LibTransfers._handleRefunds(msg.sender, _token0);
   |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Warning (2072): Unused local variable.
  --> src/facets/stake/UniswapV3/IncreaseLiquidityFacet.sol:87:9:
   |
87 |         uint256 amountToken1Refunded = LibTransfers._handleRefunds(msg.sender, _token1);
   |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Warning (2072): Unused local variable.
  --> test/ForkedTests/UniV3Stake.t.sol:87:13:
   |
87 |             uint128 liquidity, 
   |             ^^^^^^^^^^^^^^^^^

Analysing contracts...
Running tests...

Ran 1 test for test/Scripts/DeployInit.t.sol:DeployInitTest
[PASS] test_ifContractsWereDeployedCorrectly() (gas: 16134)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 5.98ms (360.38µs CPU time)

Ran 8 tests for test/UnitTests/DiamondUnit.t.sol:DiamondUnit
[PASS] test_claimOwnershipRevertWhenTheCallerIsNotTheCandidate() (gas: 51635)
[PASS] test_claimOwnershipTransfersOwnerCorrectly() (gas: 43100)
[PASS] test_diamondCutRemovesStartSwapFacet() (gas: 57532)
[PASS] test_diamondCutReplaceStartSwapFacetToDiamond() (gas: 1409308)
[PASS] test_diamondCutRevertWhenCallerIsNotOwner() (gas: 19654)
[PASS] test_getOwner() (gas: 16312)
[PASS] test_transferOwnershipAndGetCandidateOwner() (gas: 46598)
[PASS] test_transferOwnershipRevertBecauseOfCallerIsNotOwner() (gas: 17419)
Suite result: ok. 8 passed; 0 failed; 0 skipped; finished in 6.94ms (3.64ms CPU time)

Ran 2 tests for test/ForkedTests/UniV3Stake.t.sol:UniV3StakeTest
[PASS] test_userDecreaseLiquidity() (gas: 755216)
[PASS] test_userIncreaseLiquidity() (gas: 785455)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 5.37s (344.93ms CPU time)

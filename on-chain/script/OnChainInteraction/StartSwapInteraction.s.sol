///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Script, console } from "forge-std/Script.sol";

import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { StartSwapFacet } from "src/facets/dex/UniswapV3/StartSwapFacet.sol";

import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IWETH is IERC20{
    function deposit() external payable;
    function withdraw(uint256) external;
}

contract StartSwapInteraction is Script {
    address constant DIAMOND = 0xBD1d982774b24D6244b7d9d11D086712281706cC;

    // General Transaction Info
    address constant USER = 0x5FA769922a6428758fb44453815e2c436c57C3c7;
    uint24 constant LINK_WETH_POOL_FEE = 10000; //1%
    // uint24 constant USDC_WETH_POOL_FEE = 500; //0.5%
    address constant LINK_SEPOLIA = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant WETH_SEPOLIA = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;
    // address constant USDC_SEPOLIA = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    uint256 constant TOTAL_AMOUNT_IN = 0.02 ether;
    uint256 constant AMOUNT_IN_SWAP = 0.01 ether;
    uint256 constant AMOUNT_OUT_SWAP = 94e18;
    uint256 constant DEADLINE = 60;
    
    // Pool Info
    int24 constant MIN_TICK = -203200; // Minimum price range
    int24 constant MAX_TICK = -191200;  // Maximum price range

    function run() external {
        StartSwapFacet swap = StartSwapFacet(DIAMOND);

        vm.startBroadcast(USER);

        console.log("Transaction Starting. The caller is: ", USER);
        console.log("The address being called is: ", DIAMOND);

        console.log(" ======== \\========// ========");

        console.log(unicode"Converting ETH into WETH ⏳");
        _prepareWETH();

        console.log("Executing the StartSwap call");
        _executeSwap(swap);

        console.log("Transaction Finished!");
        vm.stopBroadcast();
    }

    /*//////////////////////////////////////////////////////////////////
                        CONVERT ETH -> WETH & APPROVALS
    //////////////////////////////////////////////////////////////////*/
    function _prepareWETH() internal{
        IWETH wETH = IWETH(WETH_SEPOLIA);

        console.log("Amount of ETH deposited is: ", TOTAL_AMOUNT_IN);
        wETH.deposit{value: TOTAL_AMOUNT_IN}();

        console.log("Amount of wETH received is: ", wETH.balanceOf(USER));
        wETH.approve(DIAMOND, TOTAL_AMOUNT_IN);
        // 3_128_169_009_456_896_423
    }

    /*//////////////////////////////////////////////////////////////////
                             EXECUTE TRANSACTION
    //////////////////////////////////////////////////////////////////*/
    function _executeSwap(StartSwapFacet _swap) internal {
        IStartSwapFacet.DexPayload memory dexPayload = _createDexPayload();
        INonFungiblePositionManager.MintParams memory investPayload = _createInvestPayload();

        _swap.startSwap(
            TOTAL_AMOUNT_IN,
            dexPayload,
            investPayload
        );
    }

    /*//////////////////////////////////////////////////////////////////
                             CREATE DEX PAYLOAD
    //////////////////////////////////////////////////////////////////*/
    function _createDexPayload() internal pure returns(IStartSwapFacet.DexPayload memory dexPayload_){
        // Swap Variables
        bytes memory path = abi.encodePacked(
            WETH_SEPOLIA,
            LINK_WETH_POOL_FEE,
            LINK_SEPOLIA
        );

        dexPayload_ = IStartSwapFacet.DexPayload({
            path: path,
            amountInForInputToken: AMOUNT_IN_SWAP,
            deadline: 0
        });

        console.log("DexPayload's path created");
        console.log("DexPayload's amountInForInputToken is: ", AMOUNT_IN_SWAP);
        console.log("DexPayload's deadline is: ", AMOUNT_IN_SWAP);
    }

    /*//////////////////////////////////////////////////////////////////
                            CREATE INVEST PAYLOAD
    //////////////////////////////////////////////////////////////////*/
    function _createInvestPayload() internal view returns(INonFungiblePositionManager.MintParams memory investPayload_){
        investPayload_ = INonFungiblePositionManager.MintParams({
            token0: address(WETH_SEPOLIA),
            token1: address(LINK_SEPOLIA),
            fee: LINK_WETH_POOL_FEE,
            tickLower: MIN_TICK,
            tickUpper: MAX_TICK,
            amount0Desired: AMOUNT_IN_SWAP,
            amount1Desired: AMOUNT_OUT_SWAP,
            amount0Min: 0,
            amount1Min: 0,
            recipient: USER, //Tx Executioner
            deadline: block.timestamp + DEADLINE
        });

        console.log("InvestPayload's AMOUNT_IN_SWAP is: ", AMOUNT_IN_SWAP);
        console.log("InvestPayload's AMOUNT_OUT_SWAP is: ", AMOUNT_OUT_SWAP);
    }
}
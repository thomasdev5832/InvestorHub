///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Script, console } from "forge-std/Script.sol";

import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { StartFullSwapFacet } from "src/facets/dex/UniswapV3/StartFullSwapFacet.sol";

import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IWETH is IERC20{
    function deposit() external payable;
    function withdraw(uint256) external;
}

contract StartFullSwapInteraction is Script {
    address constant DIAMOND = 0xBD1d982774b24D6244b7d9d11D086712281706cC;

    // General Transaction Info
    address constant USER = 0x5FA769922a6428758fb44453815e2c436c57C3c7;
    uint24 constant LINK_WETH_POOL_FEE = 10000; //1%
    uint24 constant WETH_USDT_POOL_FEE = 3000; //0.3%
    uint24 constant WETH_USDC_POOL_FEE = 500; //0.05%
    // uint24 constant USDC_WETH_POOL_FEE = 500; //0.5%
    address constant INPUT_TOKEN_WETH = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;
    address constant LINK_SEPOLIA = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant USDC_SEPOLIA = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address constant USDT_SEPOLIA = 0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0;
    uint256 constant TOTAL_AMOUNT_IN = 0.02 ether;
    uint256 constant AMOUNT_IN_SWAP = 0.0001 ether;
    uint256 constant AMOUNT_DESIRED_USDT = 2_860_290_000;
    uint256 constant AMOUNT_DESIRED_USDC = 10_390_000;
    uint256 constant DEADLINE = 60;
    
    // Pool Info
    int24 constant MIN_TICK = -203200; // Minimum price range
    int24 constant MAX_TICK = -191200;  // Maximum price range

    /*
        USDC - USDT: https://www.geckoterminal.com/sepolia-testnet/pools/0xfef3ae91e2050accb4da6033c6eb3b1bc4e3a1a5
        USDC - wETH: https://www.geckoterminal.com/sepolia-testnet/pools/0x3289680dd4d6c10bb19b899729cda5eef58aeff1
        USDT - wETH: https://www.geckoterminal.com/sepolia-testnet/pools/0x46bb6bb1b27069c652aa40ddbf47854b1c426428
    */

    function run() external {
        StartFullSwapFacet swap = StartFullSwapFacet(DIAMOND);

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
        IWETH wETH = IWETH(INPUT_TOKEN_WETH);

        console.log("Amount of ETH deposited is: ", TOTAL_AMOUNT_IN);
        wETH.deposit{value: TOTAL_AMOUNT_IN}();

        console.log("Amount of wETH received is: ", wETH.balanceOf(USER));
        wETH.approve(DIAMOND, TOTAL_AMOUNT_IN);
        // 3_128_169_009_456_896_423
    }

    /*//////////////////////////////////////////////////////////////////
                             EXECUTE TRANSACTION
    //////////////////////////////////////////////////////////////////*/
    function _executeSwap(StartFullSwapFacet _swap) internal {
        IStartSwapFacet.DexPayload[] memory dexPayload = new IStartSwapFacet.DexPayload[](2);
        dexPayload = _createDexPayload();
        INonFungiblePositionManager.MintParams memory investPayload = _createInvestPayload();

        _swap.startSwap(
            INPUT_TOKEN_WETH,
            TOTAL_AMOUNT_IN,
            dexPayload,
            investPayload
        );
    }

    /*//////////////////////////////////////////////////////////////////
                             CREATE DEX PAYLOAD
    //////////////////////////////////////////////////////////////////*/
    function _createDexPayload() internal pure returns(IStartSwapFacet.DexPayload[] memory dexPayload_){
        IStartSwapFacet.DexPayload[] memory dexPayload = new IStartSwapFacet.DexPayload[](2);

        // Swap Variables
        bytes memory path0 = abi.encodePacked(
            INPUT_TOKEN_WETH,
            WETH_USDT_POOL_FEE,
            USDT_SEPOLIA
        );

        dexPayload[0] = IStartSwapFacet.DexPayload({
            path: path0,
            amountInForInputToken: AMOUNT_IN_SWAP,
            deadline: 0
        });

        bytes memory path1 = abi.encodePacked(
            INPUT_TOKEN_WETH,
            WETH_USDC_POOL_FEE,
            USDC_SEPOLIA
        );

        dexPayload[1] = IStartSwapFacet.DexPayload({
            path: path1,
            amountInForInputToken: AMOUNT_IN_SWAP,
            deadline: 0
        });

        dexPayload_ = dexPayload;

        console.log("DexPayload's path created");
    }

    /*//////////////////////////////////////////////////////////////////
                            CREATE INVEST PAYLOAD
    //////////////////////////////////////////////////////////////////*/
    function _createInvestPayload() internal view returns(INonFungiblePositionManager.MintParams memory investPayload_){
        investPayload_ = INonFungiblePositionManager.MintParams({
            token0: address(USDT_SEPOLIA),
            token1: address(USDC_SEPOLIA),
            fee: LINK_WETH_POOL_FEE,
            tickLower: MIN_TICK,
            tickUpper: MAX_TICK,
            amount0Desired: AMOUNT_DESIRED_USDT,
            amount1Desired: AMOUNT_DESIRED_USDC,
            amount0Min: 0,
            amount1Min: 0,
            recipient: USER, //Tx Executioner
            deadline: block.timestamp + DEADLINE
        });

        console.log("InvestPayload's Amount Desired USDT is: ", AMOUNT_DESIRED_USDT);
        console.log("InvestPayload's Amount Desired USDC is: ", AMOUNT_DESIRED_USDC);
    }
}
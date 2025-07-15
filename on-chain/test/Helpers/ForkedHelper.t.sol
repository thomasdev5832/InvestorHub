//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Helpers
import { BaseTests } from "./BaseTests.t.sol";

///Interfaces
import { IStartSwapFacet  } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

///Open Zeppelin Tools
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ForkedHelper is BaseTests {

    string BASE_SEPOLIA_RPC_URL = vm.envString("BASE_SEPOLIA_RPC");
    string BASE_MAINNET_RPC_URL = vm.envString("BASE_MAINNET_RPC");
    string ARBITRUM_SEPOLIA_RPC_URL = vm.envString("ARB_SEPOLIA_RPC");
    string ARBITRUM_MAINNET_RPC_URL = vm.envString("ARB_MAINNET_RPC");
    uint256 baseSepolia;
    uint256 baseMainnet;
    uint256 arbSepolia;
    uint256 arbMainnet;

    ///Mainnet variables
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    IERC20 constant BASE_USDC_MAINNET = IERC20(BASE_USDC);
    address constant BASE_WETH = 0x4200000000000000000000000000000000000006;
    IERC20 constant BASE_WETH_MAINNET = IERC20(BASE_WETH);

    address constant ARB_USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    IERC20 constant ARB_USDC_MAINNET = IERC20(ARB_USDC);
    address constant ARB_WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    IERC20 constant ARB_WETH_MAINNET = IERC20(ARB_WETH);

    ///@notice Uniswap pool fee
    uint24 constant USDC_WETH_POOL_FEE = 500; //0.05%
    ///@notice Pool Range
    int24 constant MIN_TICK = -203110; // Minimum price range
    int24 constant MAX_TICK = -191200;  // Maximum price range

    ///Token Amounts
    uint256 constant USDC_INITIAL_BALANCE = 10_000*10**6;
    uint256 constant WETH_INITIAL_BALANCE = 100 * 10**18;

    function setUp() public override {

        /*/////////////////////////////////////////////////
                CREATE BASE FORK E DEPLOY CONTRACTS V2
        //////////////////////////////////////////////////*/
        baseMainnet = vm.createSelectFork(BASE_MAINNET_RPC_URL);
        vm.rollFork(29_441_000);

        //Distribute eth balance
        deal(BASE_USDC, user02, USDC_INITIAL_BALANCE);
        deal(BASE_USDC, user03, USDC_INITIAL_BALANCE);
        deal(BASE_WETH, user02, WETH_INITIAL_BALANCE);
        deal(BASE_WETH, user03, WETH_INITIAL_BALANCE);

        // Labeling
        vm.label(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, "USDC Contract");
        vm.label(0x4200000000000000000000000000000000000006, "wETH Contract");

        super.setUp();

        /*/////////////////////////////////////////////////
                CREATE ARB FORK E DEPLOY CONTRACTS V1
        //////////////////////////////////////////////////*/

        // arbMainnet = vm.createSelectFork(ARBITRUM_MAINNET_RPC_URL);
        // vm.rollFork(330_415_000);

        // //Distribute eth balance
        // deal(ARB_USDC, user02, USDC_INITIAL_BALANCE);
        // deal(ARB_USDC, user03, USDC_INITIAL_BALANCE);
        // deal(ARB_WETH, user02, WETH_INITIAL_BALANCE);
        // deal(ARB_WETH, user03, WETH_INITIAL_BALANCE);

        // // Labeling
        // vm.label(0xaf88d065e77c8cC2239327C5EDb3A432268e5831, "USDC Contract");
        // vm.label(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1, "wETH Contract");

        // super.setUp();
    }

    modifier baseMainnetMod(){
        vm.selectFork(baseMainnet);
        _;
    }

    modifier arbMainnetMod(){
        vm.selectFork(arbMainnet);
        _;
    }

    modifier basePositionOpener(){
        bytes memory path = abi.encodePacked(address(BASE_USDC_MAINNET), USDC_WETH_POOL_FEE, address(BASE_WETH_MAINNET));
        uint256 totalAmountIn = 6000*10**6;
        uint256 amountInSwap = 1850*10**6;
        uint256 amountOutSwap = 1*10**18;

        IStartSwapFacet.DexPayload memory dexPayload = IStartSwapFacet.DexPayload({
            path: path,
            amountInForInputToken: amountInSwap,
            deadline: 0
        });

        INonFungiblePositionManager.MintParams memory stakePayload = INonFungiblePositionManager.MintParams({
            token0: address(BASE_USDC_MAINNET),
            token1: address(BASE_WETH_MAINNET),
            fee: USDC_WETH_POOL_FEE,
            tickLower: MIN_TICK,
            tickUpper: MAX_TICK,
            amount0Desired: amountInSwap,
            amount1Desired: amountOutSwap,
            amount0Min: 0,
            amount1Min: 0,
            recipient: user02,
            deadline: block.timestamp + 600
        });

        vm.startPrank(user02);
        BASE_USDC_MAINNET.approve(d, totalAmountIn);
        IStartSwapFacet(d).startSwap(totalAmountIn, dexPayload, stakePayload);
        vm.stopPrank();
        
        _;
    }

    modifier arbPositionOpener(){
        bytes memory path = abi.encodePacked(address(ARB_USDC_MAINNET), USDC_WETH_POOL_FEE, address(ARB_WETH_MAINNET));
        uint256 totalAmountIn = 6000*10**6;
        uint256 amountInSwap = 1850*10**6;
        uint256 amountOutSwap = 1*10**18;

        assertEq(ARB_USDC_MAINNET.balanceOf(d), 0);
        assertEq(ARB_WETH_MAINNET.balanceOf(d), 0);

        assertEq(ARB_USDC_MAINNET.balanceOf(c.multisig), 0);
        uint256 initialWEthBalance = ARB_WETH_MAINNET.balanceOf(c.multisig);

        IStartSwapFacet.DexPayload memory dexPayload = IStartSwapFacet.DexPayload({
            path: path,
            amountInForInputToken: amountInSwap,
            deadline: block.timestamp + 60
        });

        INonFungiblePositionManager.MintParams memory stakePayload = INonFungiblePositionManager.MintParams({
            token0: address(ARB_USDC_MAINNET),
            token1: address(ARB_WETH_MAINNET),
            fee: USDC_WETH_POOL_FEE,
            tickLower: MIN_TICK,
            tickUpper: MAX_TICK,
            amount0Desired: amountInSwap,
            amount1Desired: amountOutSwap,
            amount0Min: 0,
            amount1Min: 0,
            recipient: user02,
            deadline: block.timestamp + 60
        });

        vm.startPrank(user02);
        ARB_USDC_MAINNET.approve(d, totalAmountIn);
        IStartSwapFacet(d).startSwap(totalAmountIn, dexPayload, stakePayload);
        vm.stopPrank();

        ///Ensure the config.c.multisig receives the protocol fee
        assertGt(ARB_USDC_MAINNET.balanceOf(c.multisig), (amountInSwap / 50));
        assertGt(ARB_WETH_MAINNET.balanceOf(c.multisig), (amountOutSwap / 50));
        ///Ensure protocol doesn't hold any asset
        assertEq(ARB_USDC_MAINNET.balanceOf(d), 0);
        assertEq(ARB_WETH_MAINNET.balanceOf(d), 0);
        
        _;
    }
}
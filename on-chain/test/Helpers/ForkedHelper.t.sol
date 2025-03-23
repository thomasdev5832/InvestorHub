//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Foundry Stuff
import { console } from "forge-std/console.sol";

//Helpers
import { BaseTests } from "./BaseTests.t.sol";

//Scripts
import { DeployInit } from "script/DeployInit.s.sol";
import { StartSwapScript } from "script/Facets/UniswapV3/StartSwapScript.s.sol";
import { StartSwapScriptV3 } from "script/Facets/UniswapV3/StartSwapScriptV3.s.sol";
import { StartPositionScript } from "script/Facets/UniswapV3/StartPositionScript.s.sol";

//Protocol contracts
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "src/diamond/DiamondLoupeFacet.sol";
import { IStartSwapFacet  } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";

///Open Zeppelin Tools
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ForkedHelper is BaseTests {

    string BASE_SEPOLIA_RPC_URL = vm.envString("BASE_SEPOLIA_RPC");
    string BASE_MAINNET_RPC_URL = vm.envString("BASE_MAINNET_RPC");
    uint256 baseSepolia;
    uint256 baseMainnet;

    ///Mainnet variables
    IERC20 constant USDC_BASE_MAINNET = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
    IERC20 constant WETH_BASE_MAINNET = IERC20(0x4200000000000000000000000000000000000006);
    address constant USDC_HOLDER = 0xD34EA7278e6BD48DefE656bbE263aEf11101469c; //Coinbase7 Wallet

    //Uniswap Variables
    uint24 constant USDC_WETH_POOL_FEE = 500; //0.05%

    ///Token Amounts
    uint256 constant USDC_INITIAL_BALANCE = 10_000*10**6;

    function setUp() public override {
        //Create Forked Environment
        baseSepolia = vm.createFork(BASE_SEPOLIA_RPC_URL);
        baseMainnet = vm.createFork(BASE_MAINNET_RPC_URL);
        //Select the fork will be used
        vm.selectFork(baseMainnet);

        s_deploy = new DeployInit();
        s_startSwapScriptV3 = new StartSwapScriptV3();
        // s_startSwapScript= new StartSwapScript();
        s_startPositionScript = new StartPositionScript();

        (s_helperConfig,,,,s_diamond,) = s_deploy.run();
        // s_startSwapScript.run(s_helperConfig);
        s_startSwapScriptV3.run(s_helperConfig);
        s_startPositionScript.run(s_helperConfig);

        s_uniSwapWrapper = IStartSwapFacet(address(s_diamond));

        ///Distribute some USDC using the Coinbase Wallet
        vm.startPrank(USDC_HOLDER);
        USDC_BASE_MAINNET.transfer(s_user02, USDC_INITIAL_BALANCE);
        USDC_BASE_MAINNET.transfer(s_user03, USDC_INITIAL_BALANCE);
        USDC_BASE_MAINNET.transfer(s_user04, USDC_INITIAL_BALANCE);
        USDC_BASE_MAINNET.transfer(s_user05, USDC_INITIAL_BALANCE);
        vm.stopPrank();
    }
}
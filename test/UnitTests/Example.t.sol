// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {BaseTests} from "../Helpers/BaseTests.t.sol";

contract ExampleUnit is BaseTests {

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        //counter = new Counter();
        

        vm.stopBroadcast();
    }
}
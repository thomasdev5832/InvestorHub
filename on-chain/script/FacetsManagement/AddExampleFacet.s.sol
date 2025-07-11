///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///@notice foundry tools
import { Script, console } from "forge-std/Script.sol";

///@notice helper config that contains network information
import { HelperConfig } from "script/helpers/HelperConfig.sol";

///@notice helper to handle facet addition
import { AddFacetHelper } from "script/helpers/AddFacetHelper.sol";

///@notice facet to be deployed and added to the Diamond
// import { ExampleFacet } from "src/facets/ExampleFacet.sol";

contract AddExampleFacet is Script, AddFacetHelper {

    function run() public {
        ///Initialize Network Variables
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        ///Create Selectors Array
        bytes4[] memory selectors = new bytes4[](10);
        // selectors[0] = ;
        // selectors[1] = ;
        // selectors[2] = ;
        // selectors[3] = ;
        // selectors[4] = ;

        vm.startBroadcast();
        // ExampleFacet example = new ExampleFacet();

        // Execute the transaction adding the facet and initializing it, if necessary
        // _addFacet(
        //     config,
        //     example,
        //     selectors,
        //     config.initializer != address(0) ? config.initializer : address(0),
        //     abi.encodeWithSelector(
        //         ExampleFacet.init.selector,
        //         param1,
        //         param2,
        //         param3
        //     )
        // );

        vm.stopBroadcast();
    }
}
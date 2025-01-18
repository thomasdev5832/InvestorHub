// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///Foundry
import { Script, console } from "forge-std/Script.sol";

///Protocol Scripts
import { HelperConfig } from "./Helpers/HelperConfig.s.sol";

//Protocol Contracts
import { Diamond } from "../src/Diamond.sol";
import { OwnershipFacet } from "../src/diamond/OwnershipFacet.sol";
import { DiamondCutFacet } from "../src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "../src/diamond/DiamondLoupeFacet.sol";

contract DeployInit is Script {
    function run() external returns (
        HelperConfig helperConfig_,
        OwnershipFacet ownership_,
        DiamondCutFacet cut_,
        DiamondLoupeFacet loupe_,
        Diamond diamond_
    ) {
        helperConfig_ = new HelperConfig(); // This comes with our mocks!
        
        HelperConfig.NetworkConfig memory config = helperConfig_.getConfig();

        vm.startBroadcast(config.admin);
        ///@notice Deploys Ownership
        ownership_ = new OwnershipFacet();
        ///@notice Deploys Cut
        cut_ = new DiamondCutFacet();
        ///@notice Deploys Loupe
        loupe_ = new DiamondLoupeFacet();
        ///@notice Deploys Diamond with ADMIN, CUT and LOUPE
        diamond_ = new Diamond(
            config.admin,
            address(cut_),
            address(loupe_)
        );
        vm.stopBroadcast();
    }
}
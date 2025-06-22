// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///Foundry
import { Script, console } from "forge-std/Script.sol";

///Protocol Scripts
import { HelperConfig } from "./Helpers/HelperConfig.s.sol";
import { DeployInitialStructureScript } from "script/Facets/DeployIS.s.sol";

//Protocol Base Contracts
import { Diamond } from "../src/Diamond.sol";
import { OwnershipFacet } from "../src/diamond/OwnershipFacet.sol";
import { DiamondCutFacet } from "../src/diamond/DiamondCutFacet.sol";
import { DiamondLoupeFacet } from "../src/diamond/DiamondLoupeFacet.sol";
import { DiamondInitializer } from "src/upgradeInitializers/DiamondInitializer.sol";

//Protocol Swap Facets
import { StartSwapFacet } from "src/facets/dex/UniswapV3/StartSwapFacet.sol";
import { StartFullSwapFacet } from "src/facets/dex/UniswapV3/StartFullSwapFacet.sol";

//Protocol Invest Facets
import { CollectFeesFacet } from "src/facets/stake/UniswapV3/CollectFeesFacet.sol";
import { DecreaseLiquidityFacet } from "src/facets/stake/UniswapV3/DecreaseLiquidityFacet.sol";
import { IncreaseLiquidityFacet } from "src/facets/stake/UniswapV3/IncreaseLiquidityFacet.sol";

//Import Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";

contract DeployInit is Script, DeployInitialStructureScript {

    function run() external returns (
        HelperConfig helperConfig_,
        Diamond diamond_
    ) {

        console.log("1. Create Environment and Prepare Deployment Variables");
        ///@notice Deploys the Helper to access configurations for each environment
        helperConfig_ = new HelperConfig();

        console.log("2. Query Deployment Variables ");
        ///@notice Gets the config related to each particular environment
        HelperConfig.NetworkConfig memory config = helperConfig_.getConfig();

        console.log("3. Set the Deployer Key");
        vm.startBroadcast(config.admin);

        ///@notice Deploys Cut
        DiamondCutFacet cut = new DiamondCutFacet();
        console.log("4. Core Faucet __Cut__ Deployed At The Following Address:", address(cut));

        ///@notice Deploys Loupe
        DiamondLoupeFacet loupe = new DiamondLoupeFacet();
        console.log("5. Core Faucet __Loupe__ Deployed At The Following Address:", address(loupe));

        ///@notice Deploys Diamond with ADMIN, CUT and LOUPE
        diamond_ = new Diamond(
            config.admin,
            address(cut),
            address(loupe)
        );
        console.log("6. Proxy Contract __Diamond__ Deployed At The Following Address:", address(diamond_));

        /*//////////////////////////////////////////////////////////////////////////////////////////
                            Update HelperConfig's Config Information
        //////////////////////////////////////////////////////////////////////////////////////////*/

        console.log("7. Update Local Deployment Variables: Cut, Loupe and Diamond");
        config.cutFacet = address(cut);
        config.loupeFacet = address(loupe);
        config.diamond = address(diamond_);

        /*//////////////////////////////////////////////////////////////////////////////////////////
                            Continue to Deploy the Business Logic Facets
        //////////////////////////////////////////////////////////////////////////////////////////*/

        console.log("8. Start Business Logic Facet Deployment:");
        ///@notice Deployment of Business Logic Facets
        handlerOfFacetDeployments(config);
        
        console.log("Protocol Completely Deployed");
        vm.stopBroadcast();
    }
}
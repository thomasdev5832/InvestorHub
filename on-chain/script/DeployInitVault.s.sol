///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

///Foundry
import { Script, console } from "forge-std/Script.sol";

///Protocol Scripts
import { HelperConfig } from "script/helpers/HelperConfig.sol";

/// Protocol Contracts
import { VaultAutomation } from "src/vault/VaultAutomation.sol";

contract DeployInitVaultScript is Script {

    function run() external returns(HelperConfig helperConfig_, VaultAutomation vault_){
        console.log("1. Create Environment and Prepare Deployment Variables");
        ///@notice Deploys the Helper to access configurations for each environment
        helperConfig_ = new HelperConfig();

        console.log("2. Query Deployment Variables ");
        ///@notice Gets the config related to each particular environment
        HelperConfig.NetworkConfig memory config = helperConfig_.getConfig();

        console.log("3. Set the Deployer Key");
        vm.startBroadcast(config.admin);

        console.log("4. Deploy Vault");
        vault_ = new VaultAutomation(
            config.multisig,
            config.cl.functionsRouter,
            config.cl.donId,
            config.cl.subscriptionId,
            config.admin
        );

        console.log("5. Deploy Successfully Completed. The Vault is at the following address:", address(vault_));

        vm.stopBroadcast();
    }
}
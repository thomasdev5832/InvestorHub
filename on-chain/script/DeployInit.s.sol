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
import { DiamondInitializer } from "src/upgradeInitializers/DiamondInitializer.sol";

//Import Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";

contract DeployInit is Script {

    function run() external returns (
        HelperConfig helperConfig_,
        OwnershipFacet ownership_,
        DiamondCutFacet cut_,
        DiamondLoupeFacet loupe_,
        Diamond diamond_,
        DiamondInitializer initializer_
    ) {
        ///@notice Deploys the Helper to access configurations for each environment
        helperConfig_ = new HelperConfig();
        ///@notice Gets the config related to each particular environment
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
        ///@notice Deploys the initializer to populate state variables
        initializer_ = new DiamondInitializer();

        _addInitializeFacetToDiamond(address(diamond_), address(initializer_));
        _addCutFacetToDiamond(address(diamond_), address(ownership_));
        
        vm.stopBroadcast();

        config.ownership = address(ownership_);
        config.cut = address(cut_);
        config.loupe = address(loupe_);
        config.diamond = address(diamond_);
        config.initializer = address(initializer_);
        helperConfig_.setConfig(block.chainid, config);
    }

    function _addInitializeFacetToDiamond(address _diamond, address _initializer) private {
        ///@notice Wraps the Diamond with Cut type to add a new facet.
        DiamondCutFacet cutWrapper = DiamondCutFacet(_diamond);
        ///@notice create a memory selectors Array and Populate it
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = DiamondInitializer.init.selector;
        ///@notice create a memory FacetCut array and Populate it
        IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);
        facetCuts[0] = IDiamondCut.FacetCut ({
                facetAddress: _initializer,
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
        });
        ///@notice add `initializer` to the diamond;
        cutWrapper.diamondCut(
            facetCuts,
            _diamond,
            abi.encodeWithSelector(DiamondInitializer.init.selector)
        );
    }
    function _addCutFacetToDiamond(address _diamond, address _ownershipFacet) private {
        ///@notice Wraps the Diamond with Cut type to add a new facet.
        DiamondCutFacet cutWrapper = DiamondCutFacet(_diamond);
        ///@notice create a memory selectors Array and Populate it
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = OwnershipFacet.transferOwnership.selector;
        selectors[1] = OwnershipFacet.claimOwnership.selector;
        selectors[2] = OwnershipFacet.owner.selector;
        selectors[3] = OwnershipFacet.ownerCandidate.selector;
        ///@notice create a memory FacetCut array and Populate it
        IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);
        facetCuts[0] = IDiamondCut.FacetCut ({
                facetAddress: _ownershipFacet,
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
        });
        ///@notice add `initializer` to the diamond;
        cutWrapper.diamondCut(
            facetCuts,
            _diamond,
            abi.encodeWithSelector(DiamondInitializer.init.selector)
        );
    }
}
//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Foundry Stuff
import { Script, console } from "forge-std/Script.sol";

//Protocol Scripts
import { DeployInit } from "script/DeployInit.s.sol";
import { HelperConfig } from "script/Helpers/HelperConfig.s.sol";

//Protocol Contracts
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";
import { Diamond } from "src/Diamond.sol";
import { StartSwapFacet } from "src/facets/dex/UniswapV3/StartSwapFacet.sol";

//Protocol Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";

contract StartSwapScript is Script {
    //Scripts Instances
    DeployInit s_deploy;

    //Contracts Instances
    Diamond s_diamond;
    DiamondCutFacet s_cut;
    StartSwapFacet s_facet;

    //Wraps
    DiamondCutFacet s_cutWrapper;

    function run(HelperConfig _helperConfig) public {
        HelperConfig.NetworkConfig memory config = _helperConfig.getConfig();
        HelperConfig.DexSpecifications memory dex = config.dex;
        // HelperConfig.StakingSpecifications memory stake = config.stake;

        vm.startBroadcast(config.admin);
        s_facet = new StartSwapFacet(
            config.diamond,
            dex.routerUniV3,
            config.multisig
        );
        
        s_cutWrapper = DiamondCutFacet(address(config.diamond));
        _addNewFacet(s_cutWrapper, address(s_facet));
        vm.stopBroadcast();
    }

    function _addNewFacet(DiamondCutFacet _cutWrapper, address _facet) public {
        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the facet been deployed
        selectors[0] = StartSwapFacet.startSwap.selector;

        ///@notice update accordingly with the facet been deployed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: _facet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        _cutWrapper.diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

}
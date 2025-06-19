///SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Foundry Stuff
import { Script } from "forge-std/Script.sol";

//Deploy Handler
import { HelperConfig } from "script/Helpers/HelperConfig.s.sol";

//Protocol Base Contracts
import { DiamondCutFacet } from "src/diamond/DiamondCutFacet.sol";
import { DiamondInitializer } from "src/upgradeInitializers/DiamondInitializer.sol";
import { OwnershipFacet } from "src/diamond/OwnershipFacet.sol";

//Protocol Swap Facets
import { StartSwapFacet } from "src/facets/dex/UniswapV3/StartSwapFacet.sol";
import { StartFullSwapFacet } from "src/facets/dex/UniswapV3/StartFullSwapFacet.sol";

//Protocol Invest Facets
import { StartUniswapV3PositionFacet } from "src/facets/stake/UniswapV3/StartUniswapV3PositionFacet.sol";
import { CollectFeesFacet } from "src/facets/stake/UniswapV3/CollectFeesFacet.sol";
import { DecreaseLiquidityFacet } from "src/facets/stake/UniswapV3/DecreaseLiquidityFacet.sol";
import { IncreaseLiquidityFacet } from "src/facets/stake/UniswapV3/IncreaseLiquidityFacet.sol";

//Protocol Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";

contract DeployInitialStructureScript is Script {

    function handlerOfFacetDeployments(HelperConfig.NetworkConfig memory _config) external {
        _addInitializeFacetToDiamond(_config.diamond);
        _addOwnershipFacetToDiamond(_config.diamond);
        _addSwapFacet(_config);
        _addFullSwapFacet(_config);
        _addStartPositionFacet(_config);
        _addDecreasePositionFacet(_config);
        _addPositionCollectFacet(_config);
        _addIncreasePositionFacet(_config);
    }

    /*////////////////////////////////////////////////////////////////////////
    
                                    BASE FACETS
    
    ////////////////////////////////////////////////////////////////////////*/
    /**
        @notice Function to deploy the Diamond's initialize facet
    */
    function _addInitializeFacetToDiamond(address _diamond) internal {
        
        ///@notice Deploys the initializer to populate state variables
        DiamondInitializer initializer = new DiamondInitializer();
        
        ///@notice Wraps the Diamond with Cut type to add a new facet.
        DiamondCutFacet cutWrapper = DiamondCutFacet(_diamond);
        ///@notice create a memory selectors Array and Populate it
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = DiamondInitializer.init.selector;
        ///@notice create a memory FacetCut array and Populate it
        IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);
        facetCuts[0] = IDiamondCut.FacetCut ({
                facetAddress: address(initializer),
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
    
    /**
        @notice Function to deploy the Diamond's Ownership facet
    */
    function _addOwnershipFacetToDiamond(address _diamond) private {

        ///@notice Deploys Ownership
        OwnershipFacet ownership = new OwnershipFacet();

        ///@notice create a memory selectors Array and Populate it
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = OwnershipFacet.transferOwnership.selector;
        selectors[1] = OwnershipFacet.claimOwnership.selector;
        selectors[2] = OwnershipFacet.owner.selector;
        selectors[3] = OwnershipFacet.ownerCandidate.selector;

        ///@notice create a memory FacetCut array and Populate it
        IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);
        facetCuts[0] = IDiamondCut.FacetCut ({
                facetAddress: address(ownership),
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
        });

        ///@notice add `initializer` to the diamond;
        DiamondCutFacet(_diamond).diamondCut(
            facetCuts,
            _diamond,
            abi.encodeWithSelector(DiamondInitializer.init.selector)
        );
    }


    /*////////////////////////////////////////////////////////////////////////
    
                                    SWAP FACETS
    
    ////////////////////////////////////////////////////////////////////////*/

    /**
        @notice Uniswap Facet to perform partial swaps
    */
    function _addSwapFacet(HelperConfig.NetworkConfig memory config) internal {
        
        StartSwapFacet facet = new StartSwapFacet(
            config.diamond,
            config.dex.routerUniV3
        );

        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the facet been deployed
        selectors[0] = StartSwapFacet.startSwap.selector;

        ///@notice update accordingly with the facet been deployed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(config.diamond).diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

    /**
        @notice Uniswap Facet to perform complete swaps
    */
    function _addFullSwapFacet(HelperConfig.NetworkConfig memory config) internal {
        StartFullSwapFacet facet = new StartFullSwapFacet(
            config.diamond,
            config.stake.uniswapV3PositionManager
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the facet been deployed
        selectors[0] = StartFullSwapFacet.startSwap.selector;

        ///@notice update accordingly with the facet been deployed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(config.diamond).diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

    /*////////////////////////////////////////////////////////////////////////
    
                                INVESTMENT FACETS
    
    ////////////////////////////////////////////////////////////////////////*/

    /**
        @notice Function to deploy the facet to enable users to start a position on Uniswap
    */
    function _addStartPositionFacet(HelperConfig.NetworkConfig memory config) public {
        StartUniswapV3PositionFacet facet = new StartUniswapV3PositionFacet(
            config.diamond,
            config.stake.uniswapV3PositionManager,
            config.multisig
        );

        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the action being performed
        selectors[0] = StartUniswapV3PositionFacet.startPositionUniswapV3.selector;

        ///@notice update accordingly with the action to be performed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(config.diamond).diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

    /**
        @notice Function to deploy the facet to enable users to Decrease their positions on Uniswap
    */
    function _addDecreasePositionFacet(HelperConfig.NetworkConfig memory config) internal {
        DecreaseLiquidityFacet facet = new DecreaseLiquidityFacet(
            config.diamond,
            config.stake.uniswapV3PositionManager
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the action being performed
        selectors[0] = DecreaseLiquidityFacet.decreaseLiquidityCurrentRange.selector;

        ///@notice update accordingly with the action to be performed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(config.diamond).diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

    /**
        @notice Function to deploy the facet that enable users to collect their stake tokens on Uniswap
    */
    function _addPositionCollectFacet(HelperConfig.NetworkConfig memory config) internal {

        CollectFeesFacet facet = new CollectFeesFacet(
            config.diamond,
            config.stake.uniswapV3PositionManager
        );

        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the action being performed
        selectors[0] = CollectFeesFacet.collectAllFees.selector;

        ///@notice update accordingly with the action to be performed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(config.diamond).diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

    /**
        @notice Function to deploy the facet to enable users to increase their positions on Uniswap
    */
    function _addIncreasePositionFacet(HelperConfig.NetworkConfig memory config) public {
        
        IncreaseLiquidityFacet facet = new IncreaseLiquidityFacet(
            config.diamond,
            config.stake.uniswapV3PositionManager,
            config.multisig
        );
        
        bytes4[] memory selectors = new bytes4[](1);
        ///@notice update accordingly with the action being performed
        selectors[0] = IncreaseLiquidityFacet.increaseLiquidityCurrentRange.selector;

        ///@notice update accordingly with the action to be performed
        IDiamondCut.FacetCut memory facetCut = IDiamondCut.FacetCut({
            facetAddress: address(facet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: selectors
        });

        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);        
        cuts[0] = facetCut;

        DiamondCutFacet(config.diamond).diamondCut(
            cuts,
            address(0), ///@notice update it if the facet needs initialization
            "" ///@notice update it if the facet needs initialization
        );
    }

}
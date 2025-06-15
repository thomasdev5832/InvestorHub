// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

//Test Base
import {BaseTests} from "test/helpers/BaseTests.t.sol";

//Scripts
import { StartSwapScript } from "script/Facets/UniswapV3/dex/StartSwapScript.s.sol";

//Contract Interfaces
import { IDiamondCut } from "src/interfaces/IDiamondCut.sol";
import { IStartSwapFacet } from "src/interfaces/UniswapV3/IStartSwapFacet.sol";
import { IStartPositionFacet, INonFungiblePositionManager } from "src/interfaces/UniswapV3/IStartPositionFacet.sol";

contract StartSwapScriptTest is BaseTests {}
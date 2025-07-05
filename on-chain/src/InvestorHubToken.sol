// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
    @title Investor Hub Cross-chain Token
    @author 77 Innovation Labs
    @notice Token compatible with CCIP's CCT pattern
    @custom:security-contact security@77innovationlabs.com
*/
contract InvestorHubToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address _defaultAdmin, address _pauser, address _minter)
        ERC20("Investor Hub Token", "IHT")
        ERC20Permit("Investor Hub Token")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(PAUSER_ROLE, _pauser);
        _grantRole(MINTER_ROLE, _minter);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function grantMinterAndBurnerRolesToCCIPPool(address _ccipPool) external onlyRole(DEFAULT_ADMIN_ROLE){
        _grantRole(PAUSER_ROLE, _ccipPool);
        _grantRole(MINTER_ROLE, _ccipPool);
    }

    function mint(address _to, uint256 _amount) public onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address _from, address _to, uint256 _value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(_from, _to, _value);
    }
}

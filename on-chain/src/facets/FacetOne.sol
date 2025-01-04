// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AppStorage, Person} from "../storage/AppStorage.sol";

contract Facet1 {
    AppStorage internal s;

    function setFacet1(uint256 _position, string memory _name) external {
        s.facet1[_position].name = _name;
    }

    function getFacet1(uint256 _position) external view returns (Person memory) {
        return s.facet1[_position];
    }
}
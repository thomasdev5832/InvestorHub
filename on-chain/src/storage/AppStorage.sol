// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


struct AppStorage {
    address owner;
    mapping (uint256 => bool) ccipUtils;
    mapping (uint256 => bool) facet2;
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


struct AppStorage {
    address owner;
    string appName;
    mapping (uint256 => bool) facet1;
    mapping (uint256 => bool) facet2;
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Person {
    string name;
}

struct AppStorage {
    address owner;
    string appName;
    mapping (uint256 => Person) facet1;
    mapping (uint256 => Person) facet2;
}
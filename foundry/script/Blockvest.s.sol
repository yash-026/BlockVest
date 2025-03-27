// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Blockvest} from "../src/Blockvest.sol";

contract BlockvestScript is Script {
    Blockvest public blockvest;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        blockvest = new Blockvest();

        vm.stopBroadcast();
    }
}

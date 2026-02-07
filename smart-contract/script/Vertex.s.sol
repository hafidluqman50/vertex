// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Vertex.sol";

contract DeployVertex is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        Vertex vertex = new Vertex();

        vm.stopBroadcast();

        console.log("------------------------------------------------");
        console.log("VERTEX SECURE DEPLOYED AT:", address(vertex));
        console.log("------------------------------------------------");
    }
}

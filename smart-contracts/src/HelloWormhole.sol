// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.13;

// import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";
// import {IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";
// import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

// contract WormholeDeployer is IWormholeReceiver {
//     uint256 constant GAS_LIMIT = 50_000;

//     IWormholeRelayer public wormholeRelayer;

//     event ContractDeployed(address deployedAddress, bytes32 salt);

//     /**
//      * @dev Deploys a contract across multiple chains using Wormholes
//      * @param targetChains The array of target chain IDs
//      * @param bytecode The bytecode of the contract to deploy
//      * @param salt The salt used in the CREATE2 deployment
//      * @param initializable Whether the contract is initializable
//      * @param initializeData The data used to initialize the contract if it's initializable
//      */
//     function deployAcrossChains(
//         uint16[] memory targetChains,
//         address[] memory targetAddresses,
//         bytes memory bytecode,
//         bytes32 salt,
//         bool initializable,
//         bytes memory initializeData
//     ) external payable {
//         address expectedAddress = computeAddress(salt, bytecode);

//         for (uint256 i = 0; i < targetChains.length; i++) {
//             bytes memory payload = abi.encode(bytecode, salt, initializable, initializeData);

//             (uint256 cost,) = wormholeRelayer.quoteEVMDeliveryPrice(targetChains[i], 0, GAS_LIMIT);

//             require(msg.value >= cost, "Insufficient funds for deployment");

//             try wormholeRelayer.sendPayloadToEvm{value: cost}(
//                 targetChains[i],
//                 targetAddresses[i],
//                 payload,
//                 0,
//                 GAS_LIMIT
//             ) {
//                 // Success
//             } catch Error(string memory reason) {
//                 revert(string(abi.encodePacked("Wormhole relayer failed for chain ", targetChains[i], ": ", reason)));
//             }
//         }

//         // Deploy on the current chain
//         address deployedAddress = deployContract(salt, bytecode, initializable, initializeData);
//         require(deployedAddress == expectedAddress, "Deployment address mismatch");
//         emit ContractDeployed(deployedAddress, salt);
//     }
//     /**
//      * @dev Receives and processes Wormhole messages
//      * @param payload The payload received from Wormhole
//      */
//     function receiveWormholeMessages(
//         bytes memory payload,
//         bytes[] memory ,
//         bytes32 ,
//         uint16 ,
//         bytes32
//     ) public payable {
//         (bytes memory bytecode, bytes32 salt, bool initializable, bytes memory initializeData) =
//             abi.decode(payload, (bytes, bytes32, bool, bytes));
//         address deployedAddress = deployContract(salt, bytecode, initializable, initializeData);
//         address expectedAddress = computeAddress(salt, bytecode);
//         require(deployedAddress == expectedAddress, "Deployment address mismatch");
//         emit ContractDeployed(deployedAddress, salt);
//     }

//     /**
//      * @dev Deploys and initializes a contract
//      * @param salt The salt used to generate the address
//      * @param bytecode The bytecode of the contract
//      * @param initializable Whether the contract is initializable
//      * @param initializeData The data used to initialize the contract
//      * @return The address of the deployed contract
//      */
//     function deployContract(bytes32 salt, bytes memory bytecode, bool initializable, bytes memory initializeData)
//         public
//         returns (address)
//     {
//         address deployedAddress = deploy(salt, bytecode);
//         if (initializable) {
// (bool success,) = deployedAddress.call(initializeData);
// require(success, "initialize failed");
//         }
//         return deployedAddress;
//     }

//     /**
//      * @dev Deploys a contract using CREATE2
//      * @param salt The salt used to generate the address
//      * @param bytecode The bytecode of the contract
//      * @return The address of the deployed contract
//      */
//     function deploy(bytes32 salt, bytes memory bytecode) public returns (address) {
//         return Create2.deploy(0, salt, bytecode);
//     }

//     /**
//      * @dev Computes the address of the contract that will be deployed
//      * @param salt The salt used to generate the address
//      * @param bytecode The bytecode of the contract
//      * @return The computed address of the contract that will be deployed
//      */
//     function computeAddress(bytes32 salt, bytes memory bytecode) public view returns (address) {
//         return Create2.computeAddress(salt, keccak256(bytecode));
//     }

//     receive() external payable {}

//     function getCost(uint16[] memory chainId) public view returns (uint256) {
//         uint256 totalCost = 0;
//         for (uint256 i = 0; i < chainId.length; i++) {
//             (uint256 cost,) = wormholeRelayer.quoteEVMDeliveryPrice(chainId[i], 0, GAS_LIMIT);
//             totalCost += cost;
//         }
//         return totalCost;
//     }

//     function initialize(address _wormholeRelayer) external {
//         wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
//     }
// }

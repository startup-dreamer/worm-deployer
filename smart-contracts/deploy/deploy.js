// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WormholeDeployer
  const WormholeDeployer = await hre.ethers.getContractFactory("WormholeDeployer");


  // const wormholeDeployer = await WormholeDeployer.deploy(wormholeRelayerAddress);
  // await wormholeDeployer.deployed();
  // console.log("WormholeDeployer deployed to:", wormholeDeployer.address);

  const Create2Deployer = await hre.ethers.getContractFactory(
    "Create2Deployer"
  );
  const create2Deployer = await Create2Deployer.attach(
    "0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2"
  );

  const salt =
    "0x0001000000000000000000000000000000000110000000000001110001011010";

  const tx = await create2Deployer.deploy(0, salt, WormholeDeployer.bytecode);
  await tx.wait();
  const bytecodehash = hre.ethers.utils.keccak256(WormholeDeployer.bytecode);
  const address = await create2Deployer.computeAddress(salt, bytecodehash);
  console.log("address", address);

  const wormholeDeployer = await WormholeDeployer.attach(address);
  await wormholeDeployer.initialize(
    "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470"
  );
  console.log("wormholeDeployer", wormholeDeployer.address);
  // const wormholeRelayerAddress = "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470"; // Sepolia 11155111
  // const wormholeRelayerAddress = "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470"; // Arbitrum 421614
  // const wormholeRelayerAddress = "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE"; // Optimism Sepolia 11155420
  // const wormholeRelayerAddress = "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE"; // Base Sepolia 84532
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
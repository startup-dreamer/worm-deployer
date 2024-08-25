const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Use the same Create2Deployer address across all chains
  const CREATE2_DEPLOYER_ADDRESS = "0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2";
  const Create2Deployer = await hre.ethers.getContractFactory("Create2Deployer");
  const WormholeDeployer = await hre.ethers.getContractFactory("WormholeDeployer");
  const create2Deployer = await Create2Deployer.attach(CREATE2_DEPLOYER_ADDRESS);

  // Use a consistent salt across all deployments
  const salt = ethers.utils.id("WormholeDeployer_v1");

  // Check if the contract is already deployed
  const tx = await create2Deployer.deploy(0, salt, WormholeDeployer.bytecode);
  await tx.wait();
  const bytecodehash = hre.ethers.utils.keccak256(WormholeDeployer.bytecode);
  const address = await create2Deployer.computeAddress(salt, bytecodehash);
  console.log("wormholeDeployer address: ", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

  // const wormholeRelayerAddress = "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470"; // Sepolia 11155111
  // const wormholeRelayerAddress = "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470"; // Arbitrum 421614
  // const wormholeRelayerAddress = "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE"; // Optimism Sepolia 11155420
  // const wormholeRelayerAddress = "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE"; // Base Sepolia 84532
  // const wormholeRelayerAddress = "0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84"; // Alfajores 44787
  // const wormholeRelayerAddress = "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0"; // Moonbase-Alphanet 1287
  // const wormholeRelayerAddress = "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB"; // Fuji 43113
  // const wormholeRelayerAddress = "0x80aC94316391752A193C1c47E27D382b507c93F3"; // BSC 97
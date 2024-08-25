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

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  const wormholeRelayerAddresses = {
    sepolia: "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470",
    arbitrumSepolia: "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470",
    optimismSepolia: "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE",
    baseSepolia: "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE",
    alfajores: "0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84",
    moonbaseAlphanet: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
    fuji: "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB",
    bscTestnet: "0x80aC94316391752A193C1c47E27D382b507c93F3"
  };

  const wormholeDeployerAddress = "0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9";
  const wormholeRelayerAddress = wormholeRelayerAddresses[networkName];

  if (!wormholeDeployerAddress || !wormholeRelayerAddress) {
    throw new Error(`Addresses not configured for network: ${networkName}`);
  }

  const WormholeDeployer = await hre.ethers.getContractFactory("WormholeDeployer");
  const wormholeDeployer = await WormholeDeployer.attach(wormholeDeployerAddress);
  await wormholeDeployer.initialize(wormholeRelayerAddress, wormholeDeployerAddress);

  console.log("Initialization complete");
  console.log("WormholeDeployer address:", wormholeDeployerAddress);
  const relayer = await wormholeDeployer.wormholeRelayer();
  console.log("relayer:", relayer);
  const wormDeployer = await wormholeDeployer.targetAddress();
  console.log("wormDeployer:", wormDeployer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
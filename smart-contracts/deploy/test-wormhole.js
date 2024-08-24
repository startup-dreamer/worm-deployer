const hre = require("hardhat");
const contractBin = "0x608060405234801561001057600080fd5b5060b68061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80632e64cec114602d575b600080fd5b60336047565b604051603e91906067565b60405180910390f35b60008054905090565b6000819050919050565b6061816050565b82525050565b6000602082019050607a6000830184605a565b9291505056fea2646970667358221220699af7e568231b56056bf301f0a95a10387afd84e816df3d718bfc60c0aa80ba64736f6c63430008120033";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const WormholeDeployer = await ethers.getContractFactory("WormholeDeployer");
  const wormholeDeployer = WormholeDeployer.attach("0x83B805f716DEae9eB7021E0F611b6f7284c11D75");
  // const wormholeDeployer = WormholeDeployer.attach("0x8e75B5A12af57bfdb6958fdBD79cd53969CeC59F");

  const targetChains = [10003, 10004]; // Chain IDs as an array
  const tergetAddresses = ["0x8e75B5A12af57bfdb6958fdBD79cd53969CeC59F", "0xA1D775eB3d02E52F95Ef64c167B7f4989440dd76"]
  const bytecode = ethers.utils.arrayify(contractBin);
  const salt = ethers.utils.randomBytes(32);
  const initializable = false;
  const initializeData = "0x";

  try {
    const cost = await wormholeDeployer.getCost(targetChains);
    console.log("Estimated cost:", ethers.utils.formatEther(cost), "ETH");

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.lt(cost)) {
      throw new Error("Insufficient funds for deployment");
    }

    const address = await wormholeDeployer.computeAddress(salt, bytecode);
    console.log("Deployed to address:", address);

    const tx = await wormholeDeployer.deployAcrossChains(
      targetChains,
      tergetAddresses,
      bytecode,
      salt,
      initializable,
      initializeData,
      { value: cost.mul(2) } // Send twice the estimated cost to ensure enough funds
    );

    console.log("Transaction sent. Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`https://wormholescan.io/#/tx/${receipt.transactionHash}?network=TESTNET`);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    if (error.transaction) {
      console.error('Transaction details:', error.transaction);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Chain IDs:
// 11155111 -> Sepolia
// 421614 -> Arbitrum Sepolia
// 11155420 -> Optimism Sepolia
// 84532 -> Base Sepolia



// krieger@DESKTOP-JK4B7DR:~/CrossX/smart-contracts$ npx hardhat verify --network baseSepolia 0x644659e08e3be9812d462ae334e88b75580b555c 0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE
// WARNING: You are currently using Node.js v21.1.0, which is not supported by Hardhat. This can lead to unexpected behavior. See https://hardhat.org/nodejs-versions


// [INFO] Sourcify Verification Skipped: Sourcify verification is currently disabled. To enable it, add the following entry to your Hardhat configuration:

// sourcify: {
//   enabled: true
// }

// Or set 'enabled' to false to hide this message.

// For more information, visit https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify
// hardhat-verify found one or more errors during the verification process:

// Etherscan:
// The constructor for src/WormDeployer.sol:WormholeDeployer has 0 parameters
// but 1 arguments were provided instead.


// krieger@DESKTOP-JK4B7DR:~/CrossX/smart-contracts$ npx hardhat verify --network baseSepolia 0x644659e08e3be9812d462ae334e88b75580b555c
// WARNING: You are currently using Node.js v21.1.0, which is not supported by Hardhat. This can lead to unexpected behavior. See https://hardhat.org/nodejs-versions


// [INFO] Sourcify Verification Skipped: Sourcify verification is currently disabled. To enable it, add the following entry to your Hardhat configuration:

// sourcify: {
//   enabled: true
// }

// Or set 'enabled' to false to hide this message.

// For more information, visit https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify
// Successfully submitted source code for contract
// src/WormDeployer.sol:WormholeDeployer at 0x644659e08e3be9812d462ae334e88b75580b555c
// for verification on the block explorer. Waiting for verification result...

// Successfully verified contract WormholeDeployer on the block explorer.
// https://sepolia.basescan.org/address/0x644659e08e3be9812d462ae334e88b75580b555c#code

// krieger@DESKTOP-JK4B7DR:~/CrossX/smart-contracts$ npx hardhat verify --network arbitrumSepolia 0x1b5331bd33d3487fba4e8e5b1f253df2be748fc8
// WARNING: You are currently using Node.js v21.1.0, which is not supported by Hardhat. This can lead to unexpected behavior. See https://hardhat.org/nodejs-versions


// [INFO] Sourcify Verification Skipped: Sourcify verification is currently disabled. To enable it, add the following entry to your Hardhat configuration:

// sourcify: {
//   enabled: true
// }

// Or set 'enabled' to false to hide this message.

// For more information, visit https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify
// Successfully submitted source code for contract
// src/WormDeployer.sol:WormholeDeployer at 0x1b5331bd33d3487fba4e8e5b1f253df2be748fc8
// for verification on the block explorer. Waiting for verification result...

// Successfully verified contract WormholeDeployer on the block explorer.
// https://sepolia.arbiscan.io/address/0x1b5331bd33d3487fba4e8e5b1f253df2be748fc8#code

// krieger@DESKTOP-JK4B7DR:~/CrossX/smart-contracts$ npx hardhat run deploy/sample-contract-deploy.js --network sepolia
// WARNING: You are currently using Node.js v21.1.0, which is not supported by Hardhat. This can lead to unexpected behavior. See https://hardhat.org/nodejs-versions


// Generating typings for: 14 artifacts in dir: typechain-types for target: ethers-v5
// Successfully generated 62 typings!
// Compiled 11 Solidity files successfully (evm target: paris).
// Estimated cost: 0.000016602230918686 ETH
// Account balance: 1.095813558692917342 ETH
// Deployed to address: 0xE3dda0ff01918dBFb9a055C22bf5C354708aAA34
// Transaction sent. Waiting for confirmation...
// Deployment successful: 0xc97bcdbfa541a6d4a7f6dcd11571e7007c07223f1b5f1e4db6e995bc70b94d06
// krieger@DESKTOP-JK4B7DR:~/CrossX/smart-contracts$ 
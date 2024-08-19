#!/usr/bin/env node

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import getFiles from "./files.js";
import inquirer from "inquirer";
import cliSpinners from "cli-spinners";
import ora from "ora";
import { log } from "console";
import { ethers } from "ethers";
// import getWormholeConfig from "./config.js";

async function main() {
  // Determine project type
  const projectType = await determineProjectType();

  // Get contract path
  const contractPath = await getContractPath(projectType);

  // Compile contract
  await compileContract(projectType);

  // Get contract metadata
  const { contract, jsonFile } = await getContractMetadata(projectType, contractPath);

  // Determine deployment type
  const deploymentType = await determineDeploymentType();

  // Get deployment details
  const deploymentDetails = await getDeploymentDetails(deploymentType);

  // Deploy contract
  await deployContract(contract, jsonFile, deploymentDetails);
}

async function determineProjectType() {
  const hasHardhatConfig = fs.existsSync(path.join(process.cwd(), 'hardhat.config.js')) || fs.existsSync(path.join(process.cwd(), 'hardhat.config.ts'));
  const hasFoundryToml = fs.existsSync(path.join(process.cwd(), 'foundry.toml'));

  if (hasHardhatConfig && hasFoundryToml) {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'Which project type are you using?',
        choices: [
          { name: '🦔 Hardhat', value: 'hardhat' },
          { name: '🔨 Foundry', value: 'foundry' }
        ],
      },
    ]);
    return projectType;
  } else if (hasHardhatConfig) {
    log('Found the Hardhat project');
    return 'hardhat';
  } else if (hasFoundryToml) {
    log('Found the Foundry project');
    return 'foundry';
  } else {
    throw new Error('Neither Hardhat nor Foundry configuration found.');
  }
}

async function getContractPath(projectType) {
  const contractsDir = projectType === 'hardhat' ? 'contracts' : 'src';
  const dir = path.join(process.cwd(), contractsDir);
  const contractPaths = getFiles(dir, []);
  const solidityFiles = contractPaths.filter((file) => file.endsWith('.sol'));

  if (solidityFiles.length === 0) {
    throw new Error('No Solidity contracts found.');
  }

  if (solidityFiles.length === 1) {
    return solidityFiles[0];
  }

  const contractChoices = solidityFiles.map(file => ({
    name: `📜 ${path.basename(file, '.sol')}`,
    value: file
  }));

  const { contractPath } = await inquirer.prompt([
    {
      type: 'list',
      name: 'contractPath',
      message: 'Which contract do you want to deploy?',
      choices: contractChoices,
    },
  ]);

  return contractPath;
}

async function compileContract(projectType) {
  let spinner = ora({
    text: "Compiling contract",
    spinner: cliSpinners.clock,
  }).start();

  const command = projectType === 'hardhat' ? 'npx hardhat compile' : 'forge compile';
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        spinner.fail(`Compilation error: ${error}`);
        reject(error);
      } else {
        spinner.succeed('Compilation successful');
        resolve();
      }
    });
  }).finally(() => {
    spinner.stop();
  });
}

async function getContractMetadata(projectType, contractPath) {
  const contract = fs.readFileSync(contractPath, 'utf-8');
  let jsonFile;

  if (projectType === 'hardhat') {
    const artifactsDir = path.join(process.cwd(), 'artifacts', 'contracts');
    const contractName = path.basename(contractPath, '.sol');
    const jsonFilePath = path.join(artifactsDir, `${contractName}.json`);
    jsonFile = fs.readFileSync(jsonFilePath, 'utf-8');
  } else {
    const outDir = path.join(process.cwd(), 'out');
    const contractName = path.basename(contractPath, '.sol');
    const jsonFilePath = path.join(outDir, `${contractName}.sol`, `${contractName}.json`);
    jsonFile = fs.readFileSync(jsonFilePath, 'utf-8');
  }

  return { contract, jsonFile };
}

async function determineDeploymentType() {
  const { deploymentType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'deploymentType',
      message: 'Is this a single chain or multi chain deployment?',
      choices: [
        { name: 'Single Chain', value: 'single' },
        { name: 'Multi Chain', value: 'multi' }
      ],
    },
  ]);
  return deploymentType;
}

async function getDeploymentDetails(deploymentType) {
  let sourceChain, destinationChains, saltInput, privateKey;

  if (deploymentType === 'single') {
    sourceChain = 'Ethereum'; // Default for single chain deployment
  } else {
    const { chain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'chain',
        message: 'Choose the source chain (fees for deployment will be taken from here):',
        choices: ['Ethereum', 'Arbitrum'],
      },
    ]);
    sourceChain = chain;

    const { destinations } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'destinations',
        message: 'Choose the destination chains:',
        choices: ['Ethereum', 'Arbitrum'].filter(c => c !== sourceChain),
      },
    ]);
    destinationChains = destinations;
  }

  const { saltInputInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'saltInputInput',
      message: 'Enter a Create2Deployer saltInput (number):',
      validate: input => !isNaN(input) && input !== '' || 'Please enter a valid number',
    },
  ]);
  // saltInput = ethers.utils.hexZeroPad(ethers.BigNumber.from(saltInputInput).toHexString(), 32);

  const { key } = await inquirer.prompt([
    {
      type: 'password',
      name: 'key',
      message: 'Enter your private key for gas fee payment:',
    },
  ]);
  privateKey = key;

  return { sourceChain, destinationChains, saltInput, privateKey };
}

async function deployContract(contract, jsonFile, deploymentDetails) {
  const { sourceChain, destinationChains, saltInput, privateKey } = deploymentDetails;
  
  // Setup provider and signer
  const provider = new ethers.providers.JsonRpcProvider(`https://${sourceChain.toLowerCase()}.infura.io/v3/YOUR_INFURA_PROJECT_ID`);
  const signer = new ethers.Wallet(privateKey, provider);

  // Get deployer address and balance
  const deployerAddress = await signer.getAddress();
  const balance = await provider.getBalance(deployerAddress);
  console.log(`Deployer address: ${deployerAddress}`);
  console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  // Setup WormholeDeployer contract
  const WormholeDeployer = new ethers.Contract(
    "0x83B805f716DEae9eB7021E0F611b6f7284c11D75",
    ["function getCost(uint16[] memory targetChains) public view returns (uint256)", 
     "function computeAddress(bytes32 saltInput, bytes memory bytecode) public view returns (address)", 
     "function deployAcrossChains(uint16[] memory targetChains, address[] memory targetAddresses, bytes memory bytecode, bytes32 saltInput, bool initializable, bytes memory initializeData) public payable returns (address)"],
    signer
  );

  // Parse contract bytecode from JSON
  const parsedJson = JSON.parse(jsonFile);
  const bytecode = ethers.utils.arrayify(parsedJson.bytecode);

  // Prepare deployment parameters
  const targetChains = destinationChains ? destinationChains.map(chain => chain === 'Ethereum' ? 1 : 42161) : [1]; // Use appropriate chain IDs
  const targetAddresses = targetChains.map(() => "0x0000000000000000000000000000000000000000"); // Replace with actual addresses if needed

  try {
    // Get deployment cost
    const cost = await WormholeDeployer.getCost(targetChains);
    console.log("Estimated cost:", ethers.utils.formatEther(cost), "ETH");

    if (balance.lt(cost)) {
      throw new Error("Insufficient funds for deployment");
    }

    // Compute deployment address
    const deploymentAddress = await WormholeDeployer.computeAddress(saltInput, bytecode);
    console.log("Computed deployment address:", deploymentAddress);

    // Confirm deployment
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to proceed with the deployment?',
      },
    ]);

    if (!confirm) {
      console.log("Deployment cancelled.");
      return;
    }

    // Deploy contract
    const tx = await WormholeDeployer.deployAcrossChains(
      targetChains,
      targetAddresses,
      bytecode,
      saltInput,
      false, // initializable
      "0x", // initializeData
      { value: cost.mul(2) } // Send twice the estimated cost to ensure enough funds
    );

    console.log("Transaction sent. Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`Deployment successful. Checkout transaction...`);
    console.log(`https://wormholescan.io/#/tx/${receipt.transactionHash}?network=MAINNET`);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    if (error.transaction) {
      console.error('Transaction details:', error.transaction);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

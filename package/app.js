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
import { getWormholeConfig, WormDeployerConfig, Create2DeployerConfig } from "./config.js";
import { type } from "os";
import chalk from 'chalk';
import dotenv from 'dotenv';

async function main() {
  try {
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
  } catch (error) {
    console.error(chalk.red('Error in main execution:'), error);
    process.exit(1);
  }
}

async function determineProjectType() {
  const hasHardhatConfig = fs.existsSync(path.join(process.cwd(), 'hardhat.config.js')) || fs.existsSync(path.join(process.cwd(), 'hardhat.config.ts'));
  const hasFoundryToml = fs.existsSync(path.join(process.cwd(), 'foundry.toml'));

  if (hasHardhatConfig && hasFoundryToml) {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: chalk.cyan('Which project type are you using?'),
        choices: [
          { name: chalk.magenta('🦔 Hardhat'), value: 'hardhat' },
          { name: chalk.magenta('🔨 Foundry'), value: 'foundry' }
        ],
      },
    ]);
    return projectType;
  } else if (hasHardhatConfig) {
    log(chalk.blue('Found the Hardhat project'));
    return 'hardhat';
  } else if (hasFoundryToml) {
    log(chalk.blue('Found the Foundry project'));
    return 'foundry';
  } else {
    throw new Error(chalk.red('Neither Hardhat nor Foundry configuration found.'));
  }
}

async function getContractPath(projectType) {
  const contractsDir = projectType === 'hardhat' ? 'contracts' : 'src';
  const dir = path.join(process.cwd(), contractsDir);
  const contractPaths = getFiles(dir, []);
  const solidityFiles = contractPaths.filter((file) => file.endsWith('.sol'));

  if (solidityFiles.length === 0) {
    throw new Error(chalk.red('No Solidity contracts found.'));
  }

  if (solidityFiles.length === 1) {
    return solidityFiles[0];
  }

  const contractChoices = solidityFiles.map(file => ({
    name: chalk.green(`📜 ${path.basename(file, '.sol')}`),
    value: file
  }));

  const { contractPath } = await inquirer.prompt([
    {
      type: 'list',
      name: 'contractPath',
      message: chalk.cyan('Which contract do you want to deploy?'),
      choices: contractChoices,
    },
  ]);

  return contractPath;
}

async function compileContract(projectType) {
  let spinner = ora({
    text: chalk.yellow("Compiling contract"),
    spinner: cliSpinners.arc,
  }).start();

  const command = projectType === 'hardhat' ? 'npx hardhat compile' : 'forge compile';
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        spinner.fail(chalk.red(`Compilation error: ${error}`));
        reject(error);
      } else {
        spinner.succeed(chalk.green('Compilation successful'));
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
      message: chalk.cyan('Is this a single chain or multi chain deployment?'),
      choices: [
        { name: chalk.green('Single Chain'), value: 'single' },
        { name: chalk.green('Multi Chain'), value: 'multi' }
      ],
    },
  ]);
  return deploymentType;
}

async function getDeploymentDetails(deploymentType) {
  const wormholeConfig = getWormholeConfig();
  let sourceChain, destinationChains, saltInput, privateKey;

  if (deploymentType === 'single') {
    const { chain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'chain',
        message: chalk.cyan('Choose the deployment chain:'),
        choices: wormholeConfig.chains.map(chain => ({ name: chalk.yellow(chain), value: chain })),
      },
    ]);
    sourceChain = chain;
  } else {
    const { chain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'chain',
        message: chalk.cyan('Choose the source chain (fees for deployment will be taken from here):'),
        choices: wormholeConfig.chains.map(chain => ({ name: chalk.yellow(chain), value: chain })),
      },
    ]);
    sourceChain = chain;

    const { destinations } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'destinations',
        message: chalk.cyan('Choose the destination chains:'),
        choices: wormholeConfig.chains.filter(c => c !== sourceChain).map(chain => ({ name: chalk.green(chain), value: chain })),
      },
    ]);
    destinationChains = destinations;
  }

  const { saltInputInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'saltInputInput',
      message: chalk.cyan('Enter a Create2Deployer saltInput (number):'),
      validate: input => !isNaN(input) && input !== '' || chalk.red('Please enter a valid number'),
    },
  ]);

  log(chalk.cyan(`Type of saltInputInput: ${typeof saltInputInput}`));

  saltInput = stringToBytes(saltInputInput, 32);

  log(chalk.cyan(saltInput));

  const { hasEnvFile } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasEnvFile',
      message: chalk.cyan('Is there a .env file present in the project directory?'),
    },
  ]);

  if (hasEnvFile) {
    dotenv.config();
    privateKey = process.env.DEPLOYMENT_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.log(chalk.yellow('No private key found in .env file. Please enter it manually.'));
      const { key } = await inquirer.prompt([
        {
          type: 'password',
          name: 'key',
          message: chalk.cyan('Enter your private key for gas fee payment:'),
        },
      ]);
      privateKey = key;
    }
  } else {
    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: chalk.cyan('Enter your private key for gas fee payment:'),
      },
    ]);
    privateKey = key;
  }

  return { sourceChain, destinationChains, saltInput, privateKey };
}

async function deployContract(contract, jsonFile, deploymentDetails) {
  const { sourceChain, destinationChains, saltInput, privateKey } = deploymentDetails;
  const wormholeConfig = getWormholeConfig();
  
  // Setup provider and signer
  try {
    const provider = new ethers.providers.JsonRpcProvider(wormholeConfig.getRpcUrl(sourceChain));
    const signer = new ethers.Wallet(privateKey, provider);

    // Get deployer address and balance
    const deployerAddress = await signer.getAddress();
    const balance = await provider.getBalance(deployerAddress);
    console.log(chalk.blue(`Deployer address: ${deployerAddress}`));
    console.log(chalk.blue(`Source chain account balance: ${ethers.utils.formatEther(balance)} ${sourceChain} ETH`));

    // Setup WormholeDeployer contract
    const WormholeDeployer = new ethers.Contract(
      WormDeployerConfig.address,
      WormDeployerConfig.abi,
      signer
    );

    // Parse contract bytecode from JSON
    const parsedJson = JSON.parse(jsonFile);
    const bytecodeString = parsedJson.bytecode;
    const bytecode = ethers.utils.arrayify(bytecodeString.object);

    // Prepare deployment parameters
    const targetChains = destinationChains ? destinationChains.map(chain => wormholeConfig.chainToChainId(chain)) : [wormholeConfig.chainToChainId(sourceChain)];
    const targetAddresses = targetChains.map(() => "0x0000000000000000000000000000000000000000"); // Replace with actual addresses if needed

    // Get deployment cost
    const cost = await WormholeDeployer.getCost(targetChains);
    console.log(chalk.yellow("Estimated cost:"), chalk.green(ethers.utils.formatEther(cost)), "ETH");

    if (balance.lt(cost)) {
      throw new Error(chalk.red("Insufficient funds for deployment"));
    }

    // Compute deployment address
    const deploymentAddress = await WormholeDeployer.computeAddress(saltInput, bytecode);
    console.log(chalk.blue("Computed deployment address:"), chalk.green(deploymentAddress));

    // Confirm deployment
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.cyan('Do you want to proceed with the deployment?'),
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Deployment cancelled."));
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

    console.log(chalk.yellow("Transaction sent."));
    const spinner = ora({
      text: chalk.yellow("Waiting for transaction confirmation..."),
      spinner: cliSpinners.circle,
    }).start();
    const receipt = await tx.wait();
    spinner.succeed(chalk.green('Transaction confirmed'));
    console.log(chalk.green(`Deployment successful. Checkout on wormholescan...`));
    console.log(chalk.blue(`https://wormholescan.io/#/tx/${receipt.transactionHash}?network=MAINNET`));
  } catch (error) {
    console.error(chalk.red('Deployment failed:'), error);
    if (error.transaction) {
      console.error(chalk.red('Transaction details:'), error.transaction);
    }
  }
}

main().catch((error) => {
  console.error(chalk.red(error));
  process.exit(1);
});

function stringToBytes(input, length) {
  const bytes = ethers.utils.toUtf8Bytes(input);
  return ethers.utils.concat([bytes, new Uint8Array(length - bytes.length)]);
}
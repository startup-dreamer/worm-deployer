#!/usr/bin/env node

import chalk from 'chalk';
import { determineProjectType } from "./src/projectType.js";
import { getContractPath, compileContract, getContractMetadata } from "./src/contractUtils.js";
import { determineDeploymentType, getDeploymentDetails } from "./src/deploymentUtils.js";
import { deployContract } from "./src/deploymentHandler.js";

async function main() {
  try {
    // Determine project type
    const projectType = await determineProjectType();

    // Get contract path
    const contractPath = await getContractPath(projectType);

    // Compile contract
    await compileContract(projectType);

    // Get contract metadata
    const { contract, contractBytecode } = await getContractMetadata(projectType, contractPath);

    // Determine deployment type
    const deploymentType = await determineDeploymentType();

    // Get deployment details
    const deploymentDetails = await getDeploymentDetails(deploymentType);

    // Deploy contract
    await deployContract(contract, contractBytecode, deploymentDetails);
  } catch (error) {
    console.error(chalk.red('Error in main execution:'), error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red(error));
  process.exit(1);
});

export {determineProjectType, getContractPath, compileContract, getContractMetadata, determineDeploymentType, getDeploymentDetails, deployContract};
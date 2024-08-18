#!/usr/bin/env node

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import getFiles from "./files.js";
import storeToIpfs from "./ipfs.js";
import inquirer from "inquirer";
import cliSpinners from "cli-spinners";
import ora from "ora";

async function main() {
  // Determine project type
  const projectType = await determineProjectType();

  // Get contract path
  const contractPath = await getContractPath(projectType);

  // Compile contract
  await compileContract(projectType);

  // Get contract metadata
  const { contract, jsonFile } = await getContractMetadata(projectType, contractPath);

  // Deploy contract
  await deployContract(contract, jsonFile);
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
    return 'hardhat';
  } else if (hasFoundryToml) {
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

async function deployContract(contract, jsonFile) {

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

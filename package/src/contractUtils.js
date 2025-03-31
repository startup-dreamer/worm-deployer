// contractUtils.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import cliSpinners from "cli-spinners";
import { ethers } from "ethers";
import { exec } from "child_process";
import getFiles from "./files.js";

export async function getContractPath(projectType) {
  const contractsDir = projectType === "hardhat" ? "contracts" : "src";
  const dir = path.join(process.cwd(), contractsDir);
  const contractPaths = getFiles(dir, []);
  const solidityFiles = contractPaths.filter((file) => file.endsWith(".sol"));

  if (solidityFiles.length === 0) {
    throw new Error(chalk.red("No Solidity contracts found."));
  }

  if (solidityFiles.length === 1) {
    return solidityFiles[0];
  }

  const contractChoices = solidityFiles.map((file) => ({
    name: chalk.green(`📜 ${path.basename(file, ".sol")}`),
    value: file,
  }));

  const { contractPath } = await inquirer.prompt([
    {
      type: "list",
      name: "contractPath",
      message: chalk.cyan("Which contract do you want to deploy?"),
      choices: contractChoices,
    },
  ]);

  return contractPath;
}

export async function compileContract(projectType) {
  let spinner = ora({
    text: chalk.yellow("Compiling contract"),
    spinner: cliSpinners.arc,
  }).start();

  const command =
    projectType === "hardhat" ? "npx hardhat compile" : "forge compile";
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        spinner.fail(chalk.red(`Compilation error: ${error}`));
        reject(error);
      } else {
        spinner.succeed(chalk.green("Compilation successful"));
        resolve();
      }
    });
  }).finally(() => {
    spinner.stop();
  });
}

export async function getContractMetadata(projectType, contractPath) {
  const contract = fs.readFileSync(contractPath, "utf-8");
  let contractBytecode;

  if (projectType === "hardhat") {
    const artifactsDir = path.join(process.cwd(), "artifacts", "contracts");
    const contractName = path.basename(contractPath, ".sol");
    const jsonFilePath = path.join(
      artifactsDir,
      `${contractName}.sol`,
      `${contractName}.json`
    );
    const jsonFile = fs.readFileSync(jsonFilePath, "utf-8");
    const parsedJson = JSON.parse(jsonFile);
    const bytecodeString = parsedJson.bytecode;
    contractBytecode = ethers.utils.arrayify(bytecodeString);
  } else {
    const outDir = path.join(process.cwd(), "out");
    const contractName = path.basename(contractPath, ".sol");
    const jsonFilePath = path.join(
      outDir,
      `${contractName}.sol`,
      `${contractName}.json`
    );
    const jsonFile = fs.readFileSync(jsonFilePath, "utf-8");
    const parsedJson = JSON.parse(jsonFile);
    const bytecodeString = parsedJson.bytecode;
    contractBytecode = ethers.utils.arrayify(bytecodeString.object);
  }

  return { contract, contractBytecode };
}

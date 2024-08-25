// deploymentUtils.js
import inquirer from "inquirer";
import chalk from 'chalk';
import ora from "ora";
import cliSpinners from "cli-spinners";
import dotenv from 'dotenv';
import { getWormholeConfig } from "../config.js";
import { stringToBytes } from "./utils.js";

export async function determineDeploymentType() {
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

export async function getDeploymentDetails(deploymentType) {
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

  const { hasEnvFile } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasEnvFile',
      message: chalk.cyan('Is there a .env file present in the project directory?'),
    },
  ]);
  let spinner;
  if (hasEnvFile) {
    spinner = ora({
      text: chalk.yellow("Fetching details from .env file"),
      spinner: cliSpinners.circle,
    }).start();

    dotenv.config();
    privateKey = process.env.DEPLOYMENT_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
      spinner.stop();
      console.log(chalk.yellow('No private key found in .env file. Please enter it manually.'));
      const { key } = await inquirer.prompt([
        {
          type: 'password',
          name: 'key',
          message: chalk.cyan('Enter your private key for gas fee payment:'),
        },
      ]);
      privateKey = key;
    } else {
      spinner.succeed(chalk.green('Private key found in .env file'));
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

  const { saltInputInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'saltInputInput',
      message: chalk.cyan('Enter a Create2Deployer saltInput (number):'),
      validate: input => !isNaN(input) && input !== '' || chalk.red('Please enter a valid number'),
    },
  ]);

  saltInput = stringToBytes(saltInputInput, 32);

  return { sourceChain, destinationChains, saltInput, privateKey };
}
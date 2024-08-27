// deploymentHandler.js
import { ethers } from "ethers";
import chalk from 'chalk';
import ora from "ora";
import cliSpinners from "cli-spinners";
import inquirer from "inquirer";
import { getWormholeConfig, WormDeployerConfig } from "../config.js";
import { stringToBytes } from "./utils.js";

export async function deployContract(contract, contractBytecode, deploymentDetails) {
  const { sourceChain, destinationChains, privateKey, deployOnSourceChain } = deploymentDetails;
  const wormholeConfig = getWormholeConfig();
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(wormholeConfig.getRpcUrl(sourceChain));
    const signer = new ethers.Wallet(privateKey, provider);
    
    let spinner = ora({
      text: chalk.yellow("Initializing deployment..."),
      spinner: cliSpinners.arc,
    }).start();

    const deployerAddress = await signer.getAddress();
    const balance = await provider.getBalance(deployerAddress);
    
    spinner.stop();
    
    console.log(chalk.blue(`Deployer address: ${deployerAddress}`));
    console.log(chalk.blue(`Source chain account balance: ${ethers.utils.formatEther(balance)} ${sourceChain} ETH`));

    const WormholeDeployer = new ethers.Contract(
      WormDeployerConfig.address,
      WormDeployerConfig.abi,
      signer
    );

    const targetChains = destinationChains ? destinationChains.map(chain => wormholeConfig.chainToChainId(chain)) : [wormholeConfig.chainToChainId(sourceChain)];

    spinner.text = chalk.yellow("Calculating deployment cost...");
    spinner.start();
    
    const cost = await WormholeDeployer.getCost(targetChains);
    
    spinner.succeed(chalk.green("Deployment cost calculated"));
    console.log(chalk.yellow("Estimated cost:"), chalk.red(ethers.utils.formatEther(cost)), chalk.red("ETH"));

    if (balance.lt(cost)) {
      throw new Error(chalk.red("Insufficient funds for deployment"));
    }

    const { saltInputInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'saltInputInput',
        message: chalk.cyan('Enter a Create2Deployer saltInput (number):'),
        validate: input => !isNaN(input) && input !== '' || chalk.red('Please enter a valid number'),
      },
    ]);
  
    const saltInput = stringToBytes(saltInputInput, 32);

    const { hasConstructorArgs } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasConstructorArgs',
        message: chalk.cyan('Does the contract have constructor arguments?'),
      },
    ]);
  
    let constructorArgs = "0x";
    if (hasConstructorArgs) {
      const { argTypes, argValues } = await inquirer.prompt([
        {
          type: 'input',
          name: 'argTypes',
          message: chalk.cyan('Enter constructor argument types (space-separated, e.g., string uint256 address):'),
        },
        {
          type: 'input',
          name: 'argValues',
          message: chalk.cyan('Enter constructor argument values (space-separated):'),
        },
      ]);
  
      const types = argTypes.split(' ');
      const values = argValues.split(' ');
  
      if (types.length !== values.length) {
        throw new Error('Number of types does not match number of values');
      }
  
      const abiCoder = new ethers.utils.AbiCoder();
      constructorArgs = abiCoder.encode(types, values);
    }

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

    const initializable = false; // Assuming the contract is not initializable
    if (!initializable) {
      // Append constructor args to bytecode
      contractBytecode = ethers.utils.concat([contractBytecode, constructorArgs]);
    }

    spinner = ora({
      text: chalk.yellow("Computing deployment address..."),
      spinner: cliSpinners.arc,
    }).start();

    const deploymentAddress = await WormholeDeployer.computeAddress(saltInput, contractBytecode);
    spinner.succeed(chalk.green('Deployment address computed'));
    console.log(chalk.blue("Computed deployment address:"), chalk.red(deploymentAddress));

    spinner.text = chalk.yellow("Deploying contract...");
    spinner.start();

    const tx = await WormholeDeployer.deployAcrossChains(
      targetChains,
      contractBytecode,
      saltInput,
      deployOnSourceChain,
      { value: cost.mul(2) }
    );

    spinner.text = chalk.yellow("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    spinner.succeed(chalk.green('Deployment successful'));

    console.log(chalk.green(`Deployment successful. Checkout on wormholescan...`));
    console.log(chalk.blue(`https://wormholescan.io/#/tx/${receipt.transactionHash}?network=TESTNET`));
  } catch (error) {
    if (spinner) {
      spinner.fail(chalk.red('Deployment failed'));
    }
    console.error(chalk.red('Deployment failed:'), error);
    if (error.transaction) {
      console.error(chalk.red('Transaction details:'), error.transaction);
    }
  }
}
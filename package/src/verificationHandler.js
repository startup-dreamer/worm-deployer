import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import { getWormholeConfig } from '../config.js';

export async function verifyContract(contractAddress, deploymentDetails, contractPath) {
  const { sourceChain } = deploymentDetails;
  const wormholeConfig = getWormholeConfig();

  const configPath = path.join(process.cwd(), 'deployer.config.json');
  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('deployer.config.json file not found. Unable to verify contract.'));
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const apiKey = config[sourceChain]?.apiKey;

  if (!apiKey) {
    console.error(chalk.red(`API key for ${sourceChain} not found in deployer.config.json`));
    return;
  }

  const explorerApiUrl = getExplorerApiUrl(sourceChain);
  if (!explorerApiUrl) {
    console.error(chalk.red(`Explorer API URL not found for ${sourceChain}`));
    return;
  }

  const spinner = ora({
    text: chalk.yellow(`Verifying contract on ${sourceChain}...`),
    spinner: 'dots',
  }).start();

  try {
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    const response = await axios.post(explorerApiUrl, {
      apikey: apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: contractAddress,
      sourceCode: contractSource,
      codeformat: 'solidity-single-file',
      contractname: path.basename(contractPath, '.sol'),
      compilerversion: 'v0.8.17+commit.8df45f5f', // You may need to dynamically determine this
      optimizationUsed: 1,
      runs: 200,
    });

    if (response.data.status === '1') {
      spinner.succeed(chalk.green(`Contract verified successfully on ${sourceChain}`));
      console.log(chalk.blue(`Verification URL: ${getExplorerUrl(sourceChain, contractAddress)}`));
    } else {
      spinner.fail(chalk.red(`Contract verification failed: ${response.data.result}`));
    }
  } catch (error) {
    spinner.fail(chalk.red('Contract verification failed'));
    console.error(error.response?.data || error.message);
  }
}

function getExplorerApiUrl(chain) {
  const explorers = {
    Sepolia: 'https://api-sepolia.etherscan.io/api',
    ArbitrumSepolia: 'https://api-sepolia.arbiscan.io/api',
    BaseSepolia: 'https://api-sepolia.basescan.org/api',
    OptimismSepolia: 'https://api-sepolia-optimistic.etherscan.io/api',
    Alfajores: 'https://api-alfajores.celoscan.io/api',
    Fuji: 'https://api-testnet.snowtrace.io/api',
    BscTestnet: 'https://api-testnet.bscscan.com/api',
  };
  return explorers[chain];
}

function getExplorerUrl(chain, address) {
  const explorers = {
    Sepolia: `https://sepolia.etherscan.io/address/${address}`,
    ArbitrumSepolia: `https://sepolia.arbiscan.io/address/${address}`,
    BaseSepolia: `https://sepolia.basescan.org/address/${address}`,
    OptimismSepolia: `https://sepolia-optimism.etherscan.io/address/${address}`,
    Alfajores: `https://alfajores.celoscan.io/address/${address}`,
    Fuji: `https://testnet.snowtrace.io/address/${address}`,
    BscTestnet: `https://testnet.bscscan.com/address/${address}`,
  };
  return explorers[chain];
}
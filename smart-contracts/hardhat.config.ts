import fs from "fs";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-preprocessor";
import dotenv from 'dotenv';
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

import example from "./tasks/example";

function getRemappings() {
  return fs
    .readFileSync("remappings.txt", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().split("="));
}

task("example", "Example task").setAction(example);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // evmVersion: "cancun",
    },
  },
  networks: {
    polygon: {
      url: 'https://zkevm-rpc.com',
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
      ? [process.env.DEPLOYMENT_PRIVATE_KEY]
      : []
    },
    cardona: {
      url: 'https://rpc.cardona.zkevm-rpc.com',
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
      ? [process.env.DEPLOYMENT_PRIVATE_KEY]
      : [],
    },
    lukso_testnet: {
      // url: `https://rpc.testnet.lukso.network/`
      url: 'https://rpc.testnet.lukso.gateway.fm/',
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
      ? [process.env.DEPLOYMENT_PRIVATE_KEY]
      : [],
    },
      lukso: {
        url: `https://rpc.l16.lukso.network/`,
        accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
      },
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${
          process.env.API_KEY ? process.env.API_KEY : ''
        }`,
        blockNumber: 14390000,
      },
      accounts: {
        count: 50,
      },
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com", // Replace with the actual URL of the sepoli network
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    arbitrumSepolia: {
      url: `https://arbitrum-sepolia.blockpi.network/v1/rpc/public`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    optimismSepolia: {
      url: `https://optimism-sepolia.blockpi.network/v1/rpc/public`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    baseSepolia: {
      url: `https://base-sepolia-rpc.publicnode.com`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    goerli: {
      url: `https://eth-goerli.public.blastapi.io`, // Replace with the actual URL of the goerli network
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    fuji: {
      url: `https://avalanche-fuji-c-chain-rpc.publicnode.com`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    alfajores : {
      url: `https://alfajores-forno.celo-testnet.org`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    moonbeam_testnet: {
      url: `https://moonbase-alpha.drpc.org`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    mumbai: {
      url: 'https://rpc.ankr.com/polygon_mumbai',
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    },
    fantom: {
      url: `https://fantom.api.onfinality.io/public`,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY
        ? [process.env.DEPLOYMENT_PRIVATE_KEY]
        : [],
    }
  },
  paths: {
    sources: "./src", // Use ./src rather than ./contracts as Hardhat expects
    cache: "./cache_hardhat", // Use a different cache for Hardhat than Foundry
  },
  // This fully resolves paths for imports in the ./lib directory for Hardhat
  preprocess: {
    eachLine: (hre) => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          getRemappings().forEach(([find, replace]) => {
            if (line.match(find)) {
              line = line.replace(find, replace);
            }
          });
        }
        return line;
      },
    }),
  },
  etherscan: {
    apiKey: {
      // moonbaseAlpha: '', // Moonbeam Moonscan API Key
      // baseSepolia: '', // Base Sepolia Etherscan API Key
      // arbitrumSepolia: '', // Arbitrum Sepolia Etherscan API Key
    },
  },
};

export default config;

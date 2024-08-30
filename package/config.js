import { chainToChainId } from "@wormhole-foundation/sdk-base";
import { createRequire } from 'module';
import dotenv from 'dotenv';
const require = createRequire(import.meta.url);
const WormholeDeployer = require("./abi/WormholeDeployer.json");
const Create2Deployer = require("./abi/Create2Deployer.json");
dotenv.config();

export function getWormholeConfig() {
  const testnetChains = ["Sepolia", "ArbitrumSepolia", "BaseSepolia", "OptimismSepolia", "Alfajores", "Fuji", "BscTestnet"];
  
  const rpcUrls = {
    Sepolia: "https://ethereum-sepolia-rpc.publicnode.com",
    ArbitrumSepolia: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
    BaseSepolia: "https://base-sepolia-rpc.publicnode.com",
    OptimismSepolia: "https://optimism-sepolia.blockpi.network/v1/rpc/public",
    Alfajores: "https://alfajores-forno.celo-testnet.org",
    Fuji: "https://avalanche-fuji-c-chain-rpc.publicnode.com",
    BscTestnet: "https://data-seed-prebsc-1-s1.binance.org:8545"
  };

  const customChainIds = {
    Alfajores: 14,  // Alfajores
    Fuji: 6,  // Fuji
    BscTestnet: 4  // BscTestnet
  };

  return {
    chains: testnetChains,
    wormholeChainIds: testnetChains.map(chain => customChainIds[chain] || chainToChainId(chain)),
    chainToChainId: (chain) => {
      if (customChainIds[chain]) {
        return customChainIds[chain];
      }
      return testnetChains.includes(chain) ? chainToChainId(chain) : undefined;
    },
    getRpcUrl: (chain) => rpcUrls[chain] || 'URL not found'
  };
}

export const WormDeployerConfig = {
  abi: WormholeDeployer.abi,
  address: '0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9'
}

export const Create2DeployerConfig = {
  abi: Create2Deployer.abi,
  address: '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2'
}
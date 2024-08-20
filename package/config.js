import { chainToChainId } from "@wormhole-foundation/sdk-base";
import { createRequire } from 'module';
import dotenv from 'dotenv';
const require = createRequire(import.meta.url);
const WormholeDeployer = require("./abi/WormholeDeployer.json");
const Create2Deployer = require("./abi/Create2Deployer.json");
dotenv.config();

export function getWormholeConfig() {
  const testnetChains = ["Sepolia", "ArbitrumSepolia", "BaseSepolia", "OptimismSepolia"];
  
  const rpcUrls = {
    Sepolia: "https://ethereum-sepolia-rpc.publicnode.com",
    ArbitrumSepolia: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
    BaseSepolia: "https://base-sepolia-rpc.publicnode.com",
    OptimismSepolia: "https://optimism-sepolia.blockpi.network/v1/rpc/public"
  };

  return {
    chains: testnetChains,
    wormholeChainIds: testnetChains.map(chain => chainToChainId(chain)),
    chainToChainId: (chain) => testnetChains.includes(chain) ? chainToChainId(chain) : undefined,
    getRpcUrl: (chain) => rpcUrls[chain] || 'URL not found'
  };
}

export const WormDeployerConfig = {
  abi: WormholeDeployer.abi,
  address: '0x83B805f716DEae9eB7021E0F611b6f7284c11D75'
}

export const Create2DeployerConfig = {
  abi: Create2Deployer.abi,
  address: '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2'
}
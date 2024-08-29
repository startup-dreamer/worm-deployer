> [!WARNING]  
> This is a proof of concept developed for the [Wormhole Hackathon](https://www.encode.club/encode-wormhole-hackathon). It is a project driven by personal interest and is currently in an experimental stage. Use with caution, as mainnet deployment is still under active development.
<div align="center">
  <h1>Worm-Deployer</h1>

  <img alt="Worm-Deployer" src="./public/worm-deployer-1.png" width="125" />

  <p>
    Worm-Deployer is a multichain utility tool for deploying Wormhole messages to multiple chains in a single transaction.
  </p>
</div>

### Features

- Single-transaction Multi-chain Deployment: Deploy to multiple chains from a single source transaction.
- Deterministic Addressing via CREATE2: Same contract address across all target chains.
- Source Chain Gas Payment: Pay gas only on the source chain.
- Flexible Chain Selection: Support for various source and destination chain combinations. ([supported chains](#supported-chains))

### Supported Frameworks

- <img src="./public/hardhat-logo-888739EBB4-seeklogo.com.png" alt="Hardhat" width="25" height="17"> [Hardhat](https://hardhat.org/)
- <img src="./public/foundry-bucket.svg" alt="Foundry" width="25" height="17" style="background-color: white; transform: scaleX(-1);"> [Foundry](https://github.com/foundry-rs/foundry)

### Supported Chains

- Ethereum Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia.etherscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9)
- Base Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia.basescan.org/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx)
- Optimism Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia-optimism.etherscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx) 
- Arbitrum Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia.arbiscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx)

### Getting Started

> [!IMPORTANT]  
> Need to install `node v21.1.0` on your system ([steps here using nvm](https://github.com/nvm-sh/nvm)).

#### Remote usage (as npx command)

```bash
npx worm-deployer@latest

and then follow the prompts to deploy the contracts.
```

#### Local usage (as local command)

```bash
git clone https://github.com/0xSnarks/worm-deployer.git
```
 Install dependencies

```bash
cd worm-deployer
npm install
```

then run npm link

```bash
npm link
```

then run the command

```bash
worm-deployer
```
and then follow the prompts to deploy the contracts.
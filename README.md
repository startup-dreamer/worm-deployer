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
- Flexible Chain Selection: Support for various source and destination chain combinations.

### Supported Frameworks

- <img src="./public/hardhat-logo-888739EBB4-seeklogo.com.png" alt="Hardhat" width="25" height="17"> [Hardhat](https://hardhat.org/)
- <img src="./public/foundry-aluminium-production-color-icon-vector-37432115.jpg" alt="Foundry" width="25" height="17"> [Foundry](https://github.com/foundry-rs/foundry)
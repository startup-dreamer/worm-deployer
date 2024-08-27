<div align="center">
  <h1>Worm-Deployer</h1>

  <img alt="Worm-Deployer" src="./public/worm-deployer-1.png" width="125" />

  <p>
    Worm-Deployer is a multichain utility tool for deploying Wormhole messages to multiple chains in a single transaction.
  </p>

```mermaid
flowchart TD
    A[Start] --> B[deployAcrossChains]
    B --> C[Compute expected address using CREATE2]
    C --> D{For each target chain}
    D --> E[Encode payload: bytecode + salt]
    E --> F[Calculate deployment cost]
    F --> G[Send payload to Wormhole Relayer]
    G --> H[Wormhole Core Contract]
    H --> I[Wormhole Guardian Network]
    I --> J[Wormhole Core Contract on target chain]
    J --> K[Wormhole Relayer on target chain]
    K --> L[Call receiveWormholeMessages]
    L --> M[Decode payload]
    M --> N[Deploy contract using CREATE2]
    N --> P[Emit ContractDeployed event]
    P --> Q{More chains?}
    Q -->|Yes| D
    Q -->|No| R[End]

    subgraph Wormhole Components
    H
    I
    J
    K
    end
```
</div>
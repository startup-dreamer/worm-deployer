> [!WARNING]  
> This is a proof of concept developed for the [Wormhole Hackathon](https://www.encode.club/encode-wormhole-hackathon). This is a project driven by personal interest and is currently in an experimental stage (Although people are using it). Use with caution, as mainnet deployment is still under active development.
<div align="center">
  <h1>Worm-Deployer</h1>

  <img alt="Worm-Deployer" src="./public/worm-deployer-1.png" width="125" />

  <p><b>Worm-Deployer: A Multi-Chain Smart Contract Deployment Tool with Single-Transaction Execution and Deterministic Addressing</b></p>
</div>

## Features

- Single-transaction Multi-chain Deployment: Deploy to multiple chains from a single source transaction.
- Deterministic Addressing via CREATE2: Same contract address across all target chains.
- Source Chain Gas Payment: Pay gas only on the source chain.
- Flexible Chain Selection: Support for various source and destination chain combinations. ([supported chains](#supported-chains))

## Supported Frameworks

- <img src="./public/hardhat-logo-888739EBB4-seeklogo.com.png" alt="Hardhat" width="25" height="17"> [Hardhat](https://hardhat.org/)
- <img src="./public/foundry-bucket.svg" alt="Foundry" width="25" height="17" style="background-color: white; transform: scaleX(-1);"> [Foundry](https://github.com/foundry-rs/foundry)

## Supported Chains (Testnet only)

- Ethereum Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia.etherscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9)
- Base Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia.basescan.org/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx)
- Optimism Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia-optimism.etherscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx) 
- Arbitrum Sepolia [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://sepolia.arbiscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx)
- Celo Alfajores [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://alfajores.celoscan.io/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx)
- Avalanche Fuji [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://testnet.avascan.info/blockchain/all/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9/transactions/internal)
- Binance Smart Chain Testnet [`0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9`](https://testnet.bscscan.com/address/0xB6C636Fc86B4d008faEE98C0c7c493D41fa483e9#internaltx)

## Getting Started

> [!IMPORTANT]  
> Need to install `node v21.1.0` on your system ([steps here using nvm](https://github.com/nvm-sh/nvm)).

### Remote usage (as npx command)

```bash
npx worm-deployer@latest
```
Then follow the prompts to deploy the contracts.

### Local usage (as local command)

1. Clone the repository:

```bash
git clone https://github.com/startup-dreamer/worm-deployer.git
```

2. Install dependencies:

```bash
cd worm-deployer
npm install
```

3. Link the package:

```bash
npm link
```

4. Run the command:

```bash
worm-deployer
```

5. Then follow the prompts to deploy the contracts.

### Demo Deployment
<div align="center">
  <img src="public/test-deployment.gif" alt="Demo Deployment" width="75%" />
</div>

Test deployment contract: [https://wormholescan.io/#/tx/0xb4032d06e1a5f87429ee7628543984d1d3fa9623ad0b137571c7cb42e5463d38](https://wormholescan.io/#/tx/0xb4032d06e1a5f87429ee7628543984d1d3fa9623ad0b137571c7cb42e5463d38?network=TESTNET)

## Worm-Deployer Architecture

### 
<details>
<summary> 

[**Contract Architecture**](./contract-flow.md)

</summary>

<div align="center">

[![](https://mermaid.ink/img/pako:eNqNlFtzojAUx79KJq9rHRUpwsPuWLz0ptOqdWcX-5DCUZhCwiShLVW_-4YYrLuznakPSM75_Q_nBlscsgiwh9cpew1jwiVaDFYUqV8_mEt1fkRnZ9_RRRBBnrKyH3ImhB-ThIrHA3ehAT_wWZYXEhC85RBKiBCJIg5CoEIkdIP82bC_GHaMyNeiwXbEOAISxkg9agMShVXk_YEZaGYYDGmVI8pJmTISeeiplKAt35AgqTQRh5oeBT5JwyIlKpFDxhlQFZaJmhtpbhzMgUZ1TCQZ-sl4FrMU0AxSUgI3-Fjjl8HR7TNeXajkJKxjXmro6gMaF4RHCaFoCvKV8WfDXWnu-pNgiNG_2mBE11p0E_yb4Cf4jcZvqz6kiEMIyQvU0okaB9lAPblbjU6CAZw22Dgn2jlVzqqLqoMmyf9Nc6rZu2CYJfJYzkGo9gBe1AgMeafJ--2kKlynLX6Ycd9Xrt0vEDs0OLVM2Q7NtyYNVXNYcK5nWqlr8fxDvPhSygudyEOwBJ6sS7MrJ0ubERnGII7bbGQPWrb8QqVLTc7U9tba-bGcU6sonjac5DE6WYosZ1RFEma7zPKYdTBjPvypJcYNnAHPSBKp13hbmVdYxpDBCnvqNiL8eYVXdK84Ukg2L2mIPckLaGDOik2MvTVJhToVeaRem0FCVD7Z0ZoT-puxrJaoI_a2-A17Hcdt2o7tdju22-q2u90GLrF33nQsu2e1HctxOm7XtvcN_K71VtO1zq12z3XtVqvXbVlOA0OUSMYnh0-Q_hLt_wBYZHJz?type=png)](https://mermaid.live/edit#pako:eNqNlFtzojAUx79KJq9rHRUpwsPuWLz0ptOqdWcX-5DCUZhCwiShLVW_-4YYrLuznakPSM75_Q_nBlscsgiwh9cpew1jwiVaDFYUqV8_mEt1fkRnZ9_RRRBBnrKyH3ImhB-ThIrHA3ehAT_wWZYXEhC85RBKiBCJIg5CoEIkdIP82bC_GHaMyNeiwXbEOAISxkg9agMShVXk_YEZaGYYDGmVI8pJmTISeeiplKAt35AgqTQRh5oeBT5JwyIlKpFDxhlQFZaJmhtpbhzMgUZ1TCQZ-sl4FrMU0AxSUgI3-Fjjl8HR7TNeXajkJKxjXmro6gMaF4RHCaFoCvKV8WfDXWnu-pNgiNG_2mBE11p0E_yb4Cf4jcZvqz6kiEMIyQvU0okaB9lAPblbjU6CAZw22Dgn2jlVzqqLqoMmyf9Nc6rZu2CYJfJYzkGo9gBe1AgMeafJ--2kKlynLX6Ycd9Xrt0vEDs0OLVM2Q7NtyYNVXNYcK5nWqlr8fxDvPhSygudyEOwBJ6sS7MrJ0ubERnGII7bbGQPWrb8QqVLTc7U9tba-bGcU6sonjac5DE6WYosZ1RFEma7zPKYdTBjPvypJcYNnAHPSBKp13hbmVdYxpDBCnvqNiL8eYVXdK84Ukg2L2mIPckLaGDOik2MvTVJhToVeaRem0FCVD7Z0ZoT-puxrJaoI_a2-A17Hcdt2o7tdju22-q2u90GLrF33nQsu2e1HctxOm7XtvcN_K71VtO1zq12z3XtVqvXbVlOA0OUSMYnh0-Q_hLt_wBYZHJz)
</div>

</details>

<details>
<summary>

[**User Flow**](./user-flow.md)

</summary>

<div align="center">

[![](https://mermaid.ink/img/pako:eNqllMty2jAUhl9FozWh5RYKi3YAmzQhJATIhRgmo9gCFGTJI8kkFPPulSU7MU1nuqg39rG-_9wknT30eYBhGy4pf_XXSCgwdeYM6KfjTZS2F-Dk5DvoeudMKkQpeOUiPAlwRPkOi4VFu4bpeeOYARa9_ZXpGcbZO1hhX4GR4C_pe7qL8MESTkokOodgjVTZ52xJVmUlv7zIBLjeT_t_UWSXPGaB2JUVD2kC-l7f2kdMl6t1As72OmAYKRBLLIDiwF9zLvPIZyY3t2j0reEaI8kLy5IDvvZFKE7AhTfBNK3DVhtipoDSJWUp9P9PfmEqmBC2ohj01oiwBAy8nkm9KPHTpSPNMKaK5JLLXCJ5LHx8hF-aDIcfTqUiDCnCmcVkxg0Nd-U5JirQy0VnPzJqYKhr7Q37G7DkApQx24KlLjYjrixhjWuTq0EigaUuJQGj_YfYcUeX17OhezV9Go3P7zpT92ngzoBeKZpbJAh6pvlmjozTAd4BczwScONdchToCGSLFAYbnB-QD5JxldNjLzspaQKfNYWU0bPNeGxXbkxlE88hMqJoB_LzD1AQ6OIkQCwAz4gi5ufNGFuJNSbGmHo9RP2YplFTQXDkze42l_k1mBrNrecypQP1BNayqpMHlojm4K0B74q16QsmlYh9pb-RWMXvhy_f8jujuf-nZoto_C66N6IHr5deXxEW8s6ABwPM3tuU3oVY4aBYYdaxTDEzikc9gYgiaV8--Xw0RKfzR--NLz21VGybf6_H0ppTLH3EACVsk8k7Havv6j4GC1iCIRYhIoEei_uUmEO1xiGew7b-DJDYzOGcHTSHYsUnO-bDtm4KLkHB49UatpeISm3FUaCzdQhaCRTmSITYI-dFE7b38A22q81WudFstOrVRutrvVKvl-AOtk_LzVrjW63SrDWb1Va90TiU4C-jr5VbtdNapVWpVJv6qZQgDojel6Gd52asH34DA1vmmQ?type=png)](https://mermaid.live/edit#pako:eNqllMty2jAUhl9FozWh5RYKi3YAmzQhJATIhRgmo9gCFGTJI8kkFPPulSU7MU1nuqg39rG-_9wknT30eYBhGy4pf_XXSCgwdeYM6KfjTZS2F-Dk5DvoeudMKkQpeOUiPAlwRPkOi4VFu4bpeeOYARa9_ZXpGcbZO1hhX4GR4C_pe7qL8MESTkokOodgjVTZ52xJVmUlv7zIBLjeT_t_UWSXPGaB2JUVD2kC-l7f2kdMl6t1As72OmAYKRBLLIDiwF9zLvPIZyY3t2j0reEaI8kLy5IDvvZFKE7AhTfBNK3DVhtipoDSJWUp9P9PfmEqmBC2ohj01oiwBAy8nkm9KPHTpSPNMKaK5JLLXCJ5LHx8hF-aDIcfTqUiDCnCmcVkxg0Nd-U5JirQy0VnPzJqYKhr7Q37G7DkApQx24KlLjYjrixhjWuTq0EigaUuJQGj_YfYcUeX17OhezV9Go3P7zpT92ngzoBeKZpbJAh6pvlmjozTAd4BczwScONdchToCGSLFAYbnB-QD5JxldNjLzspaQKfNYWU0bPNeGxXbkxlE88hMqJoB_LzD1AQ6OIkQCwAz4gi5ufNGFuJNSbGmHo9RP2YplFTQXDkze42l_k1mBrNrecypQP1BNayqpMHlojm4K0B74q16QsmlYh9pb-RWMXvhy_f8jujuf-nZoto_C66N6IHr5deXxEW8s6ABwPM3tuU3oVY4aBYYdaxTDEzikc9gYgiaV8--Xw0RKfzR--NLz21VGybf6_H0ppTLH3EACVsk8k7Havv6j4GC1iCIRYhIoEei_uUmEO1xiGew7b-DJDYzOGcHTSHYsUnO-bDtm4KLkHB49UatpeISm3FUaCzdQhaCRTmSITYI-dFE7b38A22q81WudFstOrVRutrvVKvl-AOtk_LzVrjW63SrDWb1Va90TiU4C-jr5VbtdNapVWpVJv6qZQgDojel6Gd52asH34DA1vmmQ)
</div>

</details>


#### Wormhole Tech Used
- [**Standard Relaying**](https://docs.wormhole.com/wormhole/explore-wormhole/relayer#standard-relayers) for EVM chains message passing through Wormhole protocol.
- **Wormhole Solidity SDK** to connect wormdeployer contract with relayer interface.
- **Wormhole Base SDK** to get the wormhole specific chain parameters for configuring the deployment.

#### Worm-Deployer Development

- Implemented as an [**NPX package**](https://www.npmjs.com/package/worm-deployer) compatible with both Hardhat and Foundry projects.

#### Workflow:

- User runs the worm-deployer package in their project directory.
- Selects the contract to deploy.
- worm-deployer compiles the contract using appropriate build tools.
- Extracts bytecode from contract artifacts.
- User provides custom salt for deterministic address generation.
- Calls `deployAcrossChains` function on source chain's WormholeDeployer contract.
- Wormhole relayer sends transaction to destination chains.
- `receiveWormholeMessages` function deploys the contract on destination chains using CREATE2 opcode.

## Future Work
### Pre-Mainnet Launch
1. Mainnet readiness
2. Multi-chain support expansion
3. Batch deployments
   - Deploy multiple contracts in a single transaction
   - Optimize gas fees and simplify complex deployments
4. Automatic contract verification
   - Integrate with block explorers across supported chains

### Post-Mainnet Launch

1. Cross-chain contract interaction
   - Allow initialization and configuration of newly deployed contracts
   - Support interaction with deployed contracts on other chains

2. Upgrade Mechanism
   - Contract upgradeability across multiple chains, Using proxy patterns.

3. Specialized relayer integration

## Contact
Twitter - [@Krieger](https://twitter.com/Startup_dmr)  
Mail - prsumit35@gmail.com

## Contribution

Contributions are more than welcome! Please open an issue for any bugs or feature requests and maybe submit a PR as well.

## Acknowledgment

Thanks to [Encode Club](https://www.encode.club/) for making the [**Wormhole Hackathon**](https://www.encode.club/encode-wormhole-hackathon) possible, and to the [**Wormhole Foundation**](https://docs.wormhole.com/wormhole/quick-start/cross-chain-dev) for providing the innovative and user-friendly framework for cross-chain messaging that inspired me to create Worm-Deployer. I would greatly appreciate any feedback or guidance from the judges.


### References

- Wormhole Docs: [Docs](https://docs.wormhole.com/wormhole/quick-start/cross-chain-dev)
- Foundry Create2 Tutorial: [Tutorial](https://book.getfoundry.sh/tutorials/create2-tutorial)
- OpenZeppelin Create2 Library: [Library](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Create2.sol)
- Wormhole Architecture: [Architecture](https://docs.wormhole.com/wormhole/explore-wormhole/components)
- Wormhole SDK: [SDK](https://github.com/wormhole-foundation/wormhole-sdk-ts)
- Wormhole Solidity SDK: [Solidity SDK](https://github.com/wormhole-foundation/wormhole-solidity-sdk)
const hre = require("hardhat");
const contractBin = "0x608060405234801561001057600080fd5b5060b68061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80632e64cec114602d575b600080fd5b60336047565b604051603e91906067565b60405180910390f35b60008054905090565b6000819050919050565b6061816050565b82525050565b6000602082019050607a6000830184605a565b9291505056fea2646970667358221220699af7e568231b56056bf301f0a95a10387afd84e816df3d718bfc60c0aa80ba64736f6c63430008120033";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const WormholeDeployer = await ethers.getContractFactory("WormholeDeployer");
  const wormholeDeployer = WormholeDeployer.attach("0x83B805f716DEae9eB7021E0F611b6f7284c11D75");

  const targetChains = [10003, 10004]; // Chain IDs as an array
  const tergetAddress = "WormholeDeployerConfig.address"
  const bytecode = ethers.utils.arrayify(contractBin);
  const salt = ethers.utils.randomBytes(32);
  const initializable = false;
  const initializeData = "0x";

  try {
    const cost = await wormholeDeployer.getCost(targetChains);
    console.log("Estimated cost:", ethers.utils.formatEther(cost), "ETH");

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.lt(cost)) {
      throw new Error("Insufficient funds for deployment");
    }

    const address = await wormholeDeployer.computeAddress(salt, bytecode);
    console.log("Deployed to address:", address);

    const tx = await wormholeDeployer.deployAcrossChains(
      targetChains,
      bytecode,
      salt,
      true,
      { value: cost.mul(2) } // Send twice the estimated cost to ensure enough funds
    );

    console.log("Transaction sent. Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`https://wormholescan.io/#/tx/${receipt.transactionHash}?network=TESTNET`);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    if (error.transaction) {
      console.error('Transaction details:', error.transaction);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
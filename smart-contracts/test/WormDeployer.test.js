const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WormDeployer", function () {
  let WormDeployer;
  let wormDeployer;
  let owner;
  let addr1;
  let addr2;
  let mockWormholeRelayer;
  let mockTargetContract;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock contracts
    const MockWormholeRelayer = await ethers.getContractFactory("WormholeRelayer");
    mockWormholeRelayer = await MockWormholeRelayer.deploy();

    const MockTargetContract = await ethers.getContractFactory("TestContract");
    mockTargetContract = await MockTargetContract.deploy();

    // Deploy WormDeployer
    WormDeployer = await ethers.getContractFactory("WormDeployer");
    wormDeployer = await WormDeployer.deploy();
    await wormDeployer.initialize(mockWormholeRelayer.address, mockTargetContract.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wormDeployer.owner()).to.equal(owner.address);
    });

    it("Should set the correct WormholeRelayer address", async function () {
      expect(await wormDeployer.wormholeRelayer()).to.equal(mockWormholeRelayer.address);
    });

    it("Should set the correct target address", async function () {
      expect(await wormDeployer.targetAddress()).to.equal(mockTargetContract.address);
    });
  });

  describe("deployAcrossChains", function () {
    it("Should deploy contracts across chains", async function () {
      const targetChains = [1, 2, 3];
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");
      const deployOnCurrentChain = true;
      const cost = ethers.utils.parseEther("1");

      await mockWormholeRelayer.setQuoteEVMDeliveryPrice(cost);

      await expect(wormDeployer.deployAcrossChains(targetChains, bytecode, salt, deployOnCurrentChain, { value: cost.mul(4) }))
        .to.emit(wormDeployer, "ContractDeployed");
    });

    it("Should revert if insufficient funds are provided", async function () {
      const targetChains = [1];
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");
      const deployOnCurrentChain = false;
      const cost = ethers.utils.parseEther("1");

      await mockWormholeRelayer.setQuoteEVMDeliveryPrice(cost);

      await expect(wormDeployer.deployAcrossChains(targetChains, bytecode, salt, deployOnCurrentChain, { value: cost.div(2) }))
        .to.be.revertedWith("Insufficient funds for deployment");
    });

    it("Should handle Wormhole relayer failures", async function () {
      const targetChains = [1];
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");
      const deployOnCurrentChain = false;
      const cost = ethers.utils.parseEther("1");

      await mockWormholeRelayer.setQuoteEVMDeliveryPrice(cost);
      await mockWormholeRelayer.setShouldFail(true);

      await expect(wormDeployer.deployAcrossChains(targetChains, bytecode, salt, deployOnCurrentChain, { value: cost }))
        .to.be.revertedWith("Wormhole relayer failed for chain 1:");
    });
  });

  describe("receiveWormholeMessages", function () {
    it("Should deploy contract when receiving Wormhole message", async function () {
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");
      const payload = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes32"], [bytecode, salt]);

      await expect(wormDeployer.receiveWormholeMessages(payload, [], ethers.constants.HashZero, 1, ethers.constants.HashZero))
        .to.emit(wormDeployer, "ContractDeployed");
    });

    it("Should revert if deployment address mismatches", async function () {
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");
      const payload = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes32"], [bytecode, salt]);

      await wormDeployer.setMockDeployedAddress(ethers.Wallet.createRandom().address);

      await expect(wormDeployer.receiveWormholeMessages(payload, [], ethers.constants.HashZero, 1, ethers.constants.HashZero))
        .to.be.revertedWith("Deployment address mismatch");
    });
  });

  describe("deployContract", function () {
    it("Should deploy contract successfully", async function () {
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");

      await expect(wormDeployer.deployContract(salt, bytecode))
        .to.emit(wormDeployer, "ContractDeployed");
    });

    it("Should handle deployment failures", async function () {
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");

      await wormDeployer.setMockDeploymentShouldFail(true);

      await expect(wormDeployer.deployContract(salt, bytecode))
        .to.be.revertedWith("Deployment failed:");
    });
  });

  describe("computeAddress", function () {
    it("Should compute the correct address", async function () {
      const bytecode = "0x12345678";
      const salt = ethers.utils.formatBytes32String("test");

      const computedAddress = await wormDeployer.computeAddress(salt, bytecode);
      expect(computedAddress).to.be.properAddress;
    });
  });

  describe("getCost", function () {
    it("Should return the correct total cost", async function () {
      const targetChains = [1, 2, 3];
      const cost = ethers.utils.parseEther("1");

      await mockWormholeRelayer.setQuoteEVMDeliveryPrice(cost);

      const totalCost = await wormDeployer.getCost(targetChains);
      expect(totalCost).to.equal(cost.mul(targetChains.length));
    });
  });

  describe("Ownership", function () {
    it("Should allow only owner to initialize", async function () {
      await expect(wormDeployer.connect(addr1).initialize(addr2.address, addr2.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
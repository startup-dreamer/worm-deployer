import { jest } from '@jest/globals';
import { ethers } from 'ethers';
import inquirer from 'inquirer';
import ora from 'ora';
import { getWormholeConfig } from '../config.js';
import { stringToBytes } from './utils.js';
import { deployContract } from './deploymentHandler.js';

// Mock dependencies
jest.mock('ethers');
jest.mock('inquirer');
jest.mock('ora');
jest.mock('../config.js');
jest.mock('./utils.js');

describe('deployContract', () => {
  let mockProvider;
  let mockSigner;
  let mockContract;
  let mockSpinner;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock ethers provider and signer
    mockProvider = {
      getBalance: jest.fn().mockResolvedValue(ethers.utils.parseEther('10')),
    };
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
    };
    ethers.providers.JsonRpcProvider.mockReturnValue(mockProvider);
    ethers.Wallet.mockReturnValue(mockSigner);

    // Mock WormholeDeployer contract
    mockContract = {
      getCost: jest.fn().mockResolvedValue(ethers.utils.parseEther('1')),
      computeAddress: jest.fn().mockResolvedValue('0x9876543210987654321098765432109876543210'),
      deployAcrossChains: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabcdef1234567890' }),
      }),
    };
    ethers.Contract.mockReturnValue(mockContract);

    // Mock ora spinner
    mockSpinner = {
      start: jest.fn().mockReturnThis(),
      stop: jest.fn().mockReturnThis(),
      succeed: jest.fn().mockReturnThis(),
      fail: jest.fn().mockReturnThis(),
    };
    ora.mockReturnValue(mockSpinner);

    // Mock getWormholeConfig
    getWormholeConfig.mockReturnValue({
      getRpcUrl: jest.fn().mockReturnValue('https://mock-rpc-url.com'),
      chainToChainId: jest.fn().mockReturnValue(1),
    });

    // Mock stringToBytes
    stringToBytes.mockReturnValue('0x1234567890');

    // Mock inquirer prompts
    inquirer.prompt.mockResolvedValueOnce({ saltInputInput: '123' })
      .mockResolvedValueOnce({ hasConstructorArgs: false })
      .mockResolvedValueOnce({ confirm: true });
  });

  it('should successfully deploy a contract', async () => {
    const contract = {};
    const contractBytecode = '0x1234567890abcdef';
    const deploymentDetails = {
      sourceChain: 'ethereum',
      destinationChains: ['bsc'],
      privateKey: '0xprivatekey',
      deployOnSourceChain: true,
    };

    await deployContract(contract, contractBytecode, deploymentDetails);

    expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith('https://mock-rpc-url.com');
    expect(ethers.Wallet).toHaveBeenCalledWith('0xprivatekey', mockProvider);
    expect(mockContract.getCost).toHaveBeenCalledWith([1]);
    expect(mockContract.computeAddress).toHaveBeenCalledWith('0x1234567890', contractBytecode);
    expect(mockContract.deployAcrossChains).toHaveBeenCalledWith(
      [1],
      contractBytecode,
      '0x1234567890',
      true,
      { value: ethers.utils.parseEther('2') }
    );
    expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('Deployment successful'));
  });

  it('should handle insufficient funds', async () => {
    mockProvider.getBalance.mockResolvedValue(ethers.utils.parseEther('0.5'));

    const contract = {};
    const contractBytecode = '0x1234567890abcdef';
    const deploymentDetails = {
      sourceChain: 'ethereum',
      destinationChains: ['bsc'],
      privateKey: '0xprivatekey',
      deployOnSourceChain: true,
    };

    await deployContract(contract, contractBytecode, deploymentDetails);

    expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Deployment failed'));
  });

  it('should handle deployment cancellation', async () => {
    inquirer.prompt
      .mockResolvedValueOnce({ saltInputInput: '123' })
      .mockResolvedValueOnce({ hasConstructorArgs: false })
      .mockResolvedValueOnce({ confirm: false });

    const contract = {};
    const contractBytecode = '0x1234567890abcdef';
    const deploymentDetails = {
      sourceChain: 'ethereum',
      destinationChains: ['bsc'],
      privateKey: '0xprivatekey',
      deployOnSourceChain: true,
    };

    await deployContract(contract, contractBytecode, deploymentDetails);

    expect(mockContract.deployAcrossChains).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Deployment cancelled'));
  });
});
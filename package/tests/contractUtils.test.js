import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { ethers } from 'ethers';
import { getContractPath, compileContract, getContractMetadata } from './contractUtils';
import getFiles from '../src/files.js';

jest.mock('fs');
jest.mock('path');
jest.mock('inquirer');
jest.mock('child_process');
jest.mock('ethers');
jest.mock('../src/files');

describe('contractUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContractPath', () => {
    it('should return the only Solidity file if there is only one', async () => {
      getFiles.mockReturnValue(['contract.sol']);
      path.join.mockReturnValue('/path/to/contracts');

      const result = await getContractPath('hardhat');
      expect(result).toBe('contract.sol');
    });

    it('should prompt user to choose a contract if there are multiple', async () => {
      getFiles.mockReturnValue(['contract1.sol', 'contract2.sol']);
      path.join.mockReturnValue('/path/to/contracts');
      inquirer.prompt.mockResolvedValue({ contractPath: 'contract2.sol' });

      const result = await getContractPath('hardhat');
      expect(result).toBe('contract2.sol');
      expect(inquirer.prompt).toHaveBeenCalled();
    });

    it('should throw an error if no Solidity contracts are found', async () => {
      getFiles.mockReturnValue([]);
      path.join.mockReturnValue('/path/to/contracts');

      await expect(getContractPath('hardhat')).rejects.toThrow('No Solidity contracts found.');
    });
  });

  describe('compileContract', () => {
    it('should compile successfully for hardhat project', async () => {
      exec.mockImplementation((command, callback) => callback(null, 'Compilation successful', ''));

      await expect(compileContract('hardhat')).resolves.not.toThrow();
      expect(exec).toHaveBeenCalledWith('npx hardhat compile', expect.any(Function));
    });

    it('should compile successfully for foundry project', async () => {
      exec.mockImplementation((command, callback) => callback(null, 'Compilation successful', ''));

      await expect(compileContract('foundry')).resolves.not.toThrow();
      expect(exec).toHaveBeenCalledWith('forge compile', expect.any(Function));
    });

    it('should throw an error if compilation fails', async () => {
      exec.mockImplementation((command, callback) => callback(new Error('Compilation failed'), '', ''));

      await expect(compileContract('hardhat')).rejects.toThrow('Compilation failed');
    });
  });

  describe('getContractMetadata', () => {
    it('should return contract and bytecode for hardhat project', async () => {
      fs.readFileSync.mockReturnValueOnce('contract source')
        .mockReturnValueOnce('{"bytecode": "0x1234"}');
      path.join.mockReturnValue('/path/to/artifacts');
      path.basename.mockReturnValue('Contract');
      ethers.utils.arrayify.mockReturnValue(new Uint8Array([0x12, 0x34]));

      const result = await getContractMetadata('hardhat', 'Contract.sol');
      expect(result).toEqual({
        contract: 'contract source',
        contractBytecode: new Uint8Array([0x12, 0x34])
      });
    });

    it('should return contract and bytecode for foundry project', async () => {
      fs.readFileSync.mockReturnValueOnce('contract source')
        .mockReturnValueOnce('{"bytecode": {"object": "0x5678"}}');
      path.join.mockReturnValue('/path/to/out');
      path.basename.mockReturnValue('Contract');
      ethers.utils.arrayify.mockReturnValue(new Uint8Array([0x56, 0x78]));

      const result = await getContractMetadata('foundry', 'Contract.sol');
      expect(result).toEqual({
        contract: 'contract source',
        contractBytecode: new Uint8Array([0x56, 0x78])
      });
    });
  });
});
import { jest } from '@jest/globals';
import inquirer from 'inquirer';
import { determineDeploymentType, getDeploymentDetails } from '../src/deploymentUtils.js';

jest.mock('inquirer');

describe('deploymentUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('determineDeploymentType should return correct deployment type', async () => {
    inquirer.prompt.mockResolvedValue({ deploymentType: 'single' });
    const result = await determineDeploymentType();
    expect(result).toBe('single');
  });

  test('getDeploymentDetails should return correct details for single chain deployment', async () => {
    inquirer.prompt
      .mockResolvedValueOnce({ chain: 'ethereum' })
      .mockResolvedValueOnce({ hasEnvFile: false })
      .mockResolvedValueOnce({ key: 'testPrivateKey' });

    const result = await getDeploymentDetails('single');
    expect(result).toEqual({
      sourceChain: 'ethereum',
      destinationChains: undefined,
      privateKey: 'testPrivateKey',
      deployOnSourceChain: true
    });
  });
});
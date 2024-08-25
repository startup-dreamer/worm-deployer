// projectType.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from 'chalk';
import { log } from "console";

export async function determineProjectType() {
  const hasHardhatConfig = fs.existsSync(path.join(process.cwd(), 'hardhat.config.js')) || fs.existsSync(path.join(process.cwd(), 'hardhat.config.ts'));
  const hasFoundryToml = fs.existsSync(path.join(process.cwd(), 'foundry.toml'));

  if (hasHardhatConfig && hasFoundryToml) {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: chalk.cyan('Which project type are you using?'),
        choices: [
          { name: chalk.magenta('🦔 Hardhat'), value: 'hardhat' },
          { name: chalk.magenta('🔨 Foundry'), value: 'foundry' }
        ],
      },
    ]);
    return projectType;
  } else if (hasHardhatConfig) {
    log(chalk.blue('Found the Hardhat project'));
    return 'hardhat';
  } else if (hasFoundryToml) {
    log(chalk.blue('Found the Foundry project'));
    return 'foundry';
  } else {
    throw new Error(chalk.red('Neither Hardhat nor Foundry configuration found.'));
  }
}

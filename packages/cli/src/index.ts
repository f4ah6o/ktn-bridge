#!/usr/bin/env node

import { Command } from 'commander';
import { createInitCommand } from './commands/init';
import { createDevCommand } from './commands/dev';
import { createBuildCommand } from './commands/build';

const program = new Command();

program
  .name('ktn-b')
  .description('ktn-bridge CLI tool')
  .version('0.1.0');

program.addCommand(createInitCommand());
program.addCommand(createDevCommand());
program.addCommand(createBuildCommand());

program.parse();
#!/usr/bin/env node

import { Command } from 'commander';
import { createOutputContext, type OutputContext } from './utils/output-context.js';
import { registerInitCommand } from './commands/init.js';
import { registerListCommand, registerShowCommand } from './commands/list.js';
import { registerValidateCommand } from './commands/validate.js';
import { registerPublishCommand } from './commands/publish.js';
import { registerArchiveCommand } from './commands/archive.js';
import { registerMetricsCommand } from './commands/metrics.js';

const program = new Command();

program
  .name('docflow')
  .description(
    'CLI tool that helps SMEs produce engaging, research-backed documentation',
  )
  .version('0.1.0')
  .option('--json', 'Output results as JSON', false)
  .option('--no-interactive', 'Disable interactive prompts');

// Store output context on the program for commands to access
let outputCtx: OutputContext;

program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  outputCtx = createOutputContext(
    opts.json ?? false,
    !opts.interactive,
  );
});

// Register commands
const getCtx = () => outputCtx;
registerInitCommand(program, getCtx);
registerListCommand(program, getCtx);
registerShowCommand(program, getCtx);
registerValidateCommand(program, getCtx);
registerPublishCommand(program, getCtx);
registerArchiveCommand(program, getCtx);
registerMetricsCommand(program, getCtx);

program.parse();

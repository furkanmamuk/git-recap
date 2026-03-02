#!/usr/bin/env node
import { program } from 'commander';
import { generateRecap } from './recap.js';
import { printBanner, printRecap, printError } from './display.js';
import { readConfig, isProUnlocked } from './config.js';
import { upgrade } from './upgrade.js';

const pkg = JSON.parse(
  await import('fs').then(fs => fs.promises.readFile(
    new URL('../package.json', import.meta.url), 'utf8'
  ))
);

program
  .name('git-recap')
  .description('Generate beautiful standup reports from your git history')
  .version(pkg.version);

program
  .command('today', { isDefault: true })
  .description('Show what you worked on today')
  .option('-d, --days <n>', 'Look back N days', '1')
  .option('-a, --author <name>', 'Filter by author (default: git config user.name)')
  .option('-f, --format <type>', 'Output format: terminal, markdown, html', 'terminal')
  .option('-o, --output <file>', 'Save output to file')
  .option('--all-repos', 'Scan all git repos in current directory tree')
  .option('--since <date>', 'Custom start date (e.g. "2 days ago", "2026-03-01")')
  .option('--until <date>', 'Custom end date (e.g. "today", "2026-03-02")')
  .action(async (opts) => {
    printBanner();
    const config = readConfig();
    const isPro = isProUnlocked(config);

    try {
      const recap = await generateRecap({
        days: parseInt(opts.days),
        author: opts.author,
        format: opts.format,
        allRepos: opts.allRepos && isPro,
        since: opts.since,
        until: opts.until,
        isPro,
      });

      await printRecap(recap, opts.format, opts.output, isPro);

      if (!isPro && (opts.allRepos || opts.format === 'html')) {
        console.log('\n\x1b[33m⚡ Pro feature required. Upgrade at: https://git-recap.dev/upgrade\x1b[0m');
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });

program
  .command('week')
  .description('Show your week summary')
  .option('-a, --author <name>', 'Filter by author')
  .option('-f, --format <type>', 'Output format: terminal, markdown, html', 'terminal')
  .action(async (opts) => {
    printBanner();
    const config = readConfig();
    const isPro = isProUnlocked(config);

    try {
      const recap = await generateRecap({
        days: 7,
        author: opts.author,
        format: opts.format,
        isPro,
      });
      await printRecap(recap, opts.format, null, isPro);
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });

program
  .command('upgrade')
  .description('Unlock Pro features ($9 one-time payment)')
  .action(async () => {
    await upgrade();
  });

program
  .command('config')
  .description('Show configuration')
  .action(() => {
    const config = readConfig();
    const isPro = isProUnlocked(config);
    console.log('\n📋 git-recap configuration:\n');
    console.log(`  Status: ${isPro ? '✅ Pro' : '🆓 Free'}`);
    console.log(`  Config file: ${getConfigPath()}`);
    if (config.author) console.log(`  Default author: ${config.author}`);
    console.log('');
  });

program.parse();

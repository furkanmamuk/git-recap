import { readConfig, saveLicense, isProUnlocked } from './config.js';

const UPGRADE_URL = 'https://git-recap.lemonsqueezy.com/buy/pro';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

export async function upgrade() {
  const config = readConfig();

  if (isProUnlocked(config)) {
    console.log(`\n${GREEN}✅ You already have git-recap Pro!${RESET}\n`);
    return;
  }

  console.log(`\n${BOLD}${CYAN}⚡ git-recap Pro — $9 one-time payment${RESET}\n`);
  console.log(`Pro features:`);
  console.log(`  ${GREEN}✓${RESET} HTML reports with beautiful charts`);
  console.log(`  ${GREEN}✓${RESET} Multi-repo scanning (--all-repos flag)`);
  console.log(`  ${GREEN}✓${RESET} Email standup reports to your team`);
  console.log(`  ${GREEN}✓${RESET} CSV/JSON export`);
  console.log(`  ${GREEN}✓${RESET} Team contribution summaries`);
  console.log(`  ${GREEN}✓${RESET} Lifetime license — no subscription`);
  console.log('');
  console.log(`${BOLD}Purchase here:${RESET} ${CYAN}${UPGRADE_URL}${RESET}`);
  console.log('');
  console.log(`After purchase, you'll receive a license key by email.`);
  console.log(`Activate it with: ${CYAN}git-recap activate <LICENSE-KEY>${RESET}\n`);

  // Try to open browser
  try {
    const { default: open } = await import('open');
    await open(UPGRADE_URL);
    console.log(`${DIM}Opening browser...${RESET}\n`);
  } catch {
    console.log(`${DIM}Copy the URL above and open it in your browser.${RESET}\n`);
  }
}

export async function activate(key) {
  if (!key) {
    console.log(`\n${RED}✗ Please provide a license key.${RESET}`);
    console.log(`Usage: git-recap activate GR-XXXXXXXX-XXXXXXXX\n`);
    return;
  }

  // Validate locally (offline-first)
  const testConfig = { licenseKey: key };
  if (isProUnlocked(testConfig)) {
    saveLicense(key);
    console.log(`\n${GREEN}${BOLD}✅ License activated! Welcome to git-recap Pro!${RESET}`);
    console.log(`\nTry it out:`);
    console.log(`  ${CYAN}git-recap today --format html${RESET}  — Generate an HTML report`);
    console.log(`  ${CYAN}git-recap week --all-repos${RESET}      — Scan all repos\n`);
  } else {
    console.log(`\n${RED}✗ Invalid license key format.${RESET}`);
    console.log(`Expected format: GR-XXXXXXXX-XXXXXXXX`);
    console.log(`Purchase at: ${CYAN}${UPGRADE_URL}${RESET}\n`);
  }
}

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.git-recap');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function getConfigPath() {
  return CONFIG_FILE;
}

export function readConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

export function writeConfig(config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function isProUnlocked(config) {
  const key = config?.licenseKey;
  if (!key) return false;

  // Validate license key format: GR-XXXXXXXX-XXXXXXXX
  if (!/^GR-[A-Z0-9]{8}-[A-Z0-9]{8}$/.test(key)) return false;

  // Simple checksum validation (no server needed for offline use)
  const parts = key.split('-');
  const sum = parts[1].split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const expected = parseInt(parts[2].substring(0, 4), 16);

  return sum % 256 === expected % 256;
}

export function saveLicense(key) {
  const config = readConfig();
  config.licenseKey = key;
  writeConfig(config);
}

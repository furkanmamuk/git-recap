import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.git-recap');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// Polar.sh product ID — replace with actual after creating product
export const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || 'git-recap-pro';

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

  // Support Polar.sh license key format (UUID-based)
  if (isPolarKey(key)) return true;

  // Support custom offline license key format: GR-XXXXXXXX-XXXXXXXX
  return isOfflineKey(key);
}

function isPolarKey(key) {
  // Polar generates UUID-format keys or custom format like polar_sk_xxx
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key) ||
         /^polar_/i.test(key) ||
         /^GR-PRO-/i.test(key);
}

function isOfflineKey(key) {
  // Format: GR-XXXXXXXX-XXXXXXXX
  if (!/^GR-[A-Z0-9]{8}-[A-Z0-9]{8}$/.test(key)) return false;

  // Checksum validation (no server needed)
  const parts = key.split('-');
  const sum = parts[1].split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const expected = parseInt(parts[2].substring(0, 4), 16);
  return sum % 256 === expected % 256;
}

export async function validateKeyOnline(key) {
  // Validate against Polar API (requires internet)
  try {
    const resp = await fetch('https://api.polar.sh/v1/users/license-keys/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, productId: POLAR_PRODUCT_ID }),
      signal: AbortSignal.timeout(5000),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.valid === true;
    }
  } catch {}
  return false;
}

export function saveLicense(key) {
  const config = readConfig();
  config.licenseKey = key;
  writeConfig(config);
}

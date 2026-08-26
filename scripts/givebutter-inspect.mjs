/**
 * Read-only GiveButter diagnostic.
 *
 * Lists campaigns so we can confirm the exact identifier the embed widget needs
 * and whether the campaign is published. Prints no credentials.
 *
 * Usage: GIVEBUTTER_API_KEY=... node scripts/givebutter-inspect.mjs
 *        (or put the key in .env, which is gitignored)
 */
import { readFileSync } from 'node:fs';

function loadKey() {
  if (process.env.GIVEBUTTER_API_KEY) return process.env.GIVEBUTTER_API_KEY.trim();
  try {
    const line = readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n')
      .find((l) => l.startsWith('GIVEBUTTER_API_KEY='));
    if (line) return line.slice('GIVEBUTTER_API_KEY='.length).trim();
  } catch {
    /* no .env */
  }
  return null;
}

const key = loadKey();
if (!key) {
  console.error('No GIVEBUTTER_API_KEY found (checked shell env and .env).');
  process.exit(1);
}

async function get(path) {
  const res = await fetch(`https://api.givebutter.com/v1${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  const body = await res.text();
  let json = null;
  try {
    json = JSON.parse(body);
  } catch {
    /* non-JSON error page */
  }
  return { status: res.status, json, raw: body.slice(0, 400) };
}

const campaigns = await get('/campaigns');
console.log(`GET /campaigns -> ${campaigns.status}`);

if (campaigns.status !== 200) {
  console.log('Response:', campaigns.raw);
  process.exit(1);
}

const rows = campaigns.json?.data ?? [];
console.log(`${rows.length} campaign(s):\n`);
for (const c of rows) {
  console.log(`  title:  ${c.title}`);
  console.log(`  id:     ${c.id}`);
  console.log(`  code:   ${c.code}`);
  console.log(`  status: ${c.status}`);
  console.log(`  type:   ${c.type}`);
  console.log(`  url:    ${c.url}`);
  console.log();
}

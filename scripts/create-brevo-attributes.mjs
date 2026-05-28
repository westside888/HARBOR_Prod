#!/usr/bin/env node
/**
 * Creates WIN custom contact attributes in Brevo.
 * Usage: BREVO_API_KEY=your_key node scripts/create-brevo-attributes.mjs
 *
 * If you see an IP authorization error, add your IP at:
 * https://app.brevo.com/security/authorised_ips
 */
import { BREVO_CUSTOM_ATTRIBUTES } from '../lib/brevo-attributes.js';

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error('Set BREVO_API_KEY environment variable.');
  process.exit(1);
}

const base = 'https://api.brevo.com/v3/contacts/attributes/normal';

async function createAttribute(name) {
  const res = await fetch(`${base}/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({ type: 'text' }),
  });

  if (res.status === 201) {
    console.log(`✓ Created ${name}`);
    return;
  }

  const body = await res.text();
  if (res.status === 400 && body.toLowerCase().includes('already')) {
    console.log(`· Exists ${name}`);
    return;
  }

  console.error(`✗ ${name} (${res.status}): ${body}`);
}

console.log(`Creating ${BREVO_CUSTOM_ATTRIBUTES.length} attributes…\n`);

for (const name of BREVO_CUSTOM_ATTRIBUTES) {
  await createAttribute(name);
  await new Promise((r) => setTimeout(r, 120));
}

console.log('\nDone. Intake contacts are added via POST /v3/contacts (no double opt-in).');

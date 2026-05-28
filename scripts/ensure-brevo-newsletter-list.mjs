#!/usr/bin/env node
/**
 * Find or create the Brevo "_newsletter" list and print its ID for wrangler.toml / Cloudflare.
 * Usage: BREVO_API_KEY=your_key node scripts/ensure-brevo-newsletter-list.mjs
 */
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error('Set BREVO_API_KEY');
  process.exit(1);
}

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  'api-key': apiKey,
};

async function main() {
  const res = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50', { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Failed to list Brevo lists:', res.status, data);
    process.exit(1);
  }

  const match =
    (data.lists || []).find((l) => /^_?newsletter$/i.test(String(l.name || '').trim())) ||
    (data.lists || []).find((l) => /newsletter/i.test(String(l.name || '')));

  if (match) {
    console.log(`Found list: id=${match.id} name="${match.name}"`);
    console.log(`Set in wrangler.toml: BREVO_LIST_NEWSLETTER = "${match.id}"`);
    return;
  }

  const create = await fetch('https://api.brevo.com/v3/contacts/lists', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: '_newsletter' }),
  });
  const created = await create.json().catch(() => ({}));
  if (!create.ok) {
    console.error('Failed to create _newsletter list:', create.status, created);
    process.exit(1);
  }
  console.log(`Created list: id=${created.id} name="_newsletter"`);
  console.log(`Set in wrangler.toml: BREVO_LIST_NEWSLETTER = "${created.id}"`);
}

main();

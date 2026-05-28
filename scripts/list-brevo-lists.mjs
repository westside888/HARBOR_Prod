#!/usr/bin/env node
/** List Brevo contact lists (find _newsletter list ID). */
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error('Set BREVO_API_KEY');
  process.exit(1);
}

const res = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50', {
  headers: { accept: 'application/json', 'api-key': apiKey },
});
const text = await res.text();
console.log('Status:', res.status);
try {
  const data = JSON.parse(text);
  for (const list of data.lists || []) {
    console.log(`- id=${list.id} name=${list.name}`);
  }
} catch {
  console.log(text);
}

#!/usr/bin/env node
/** List Brevo email templates to find DOI templateId */
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error('Set BREVO_API_KEY');
  process.exit(1);
}

const res = await fetch('https://api.brevo.com/v3/smtp/templates?limit=50&sort=desc', {
  headers: { accept: 'application/json', 'api-key': apiKey },
});
const text = await res.text();
console.log('Status:', res.status);
try {
  const data = JSON.parse(text);
  for (const t of data.templates || []) {
    console.log(`- id=${t.id} name=${t.name} subject=${t.subject}`);
  }
} catch {
  console.log(text);
}

#!/usr/bin/env node
/** Smoke test for /api/intake (production or wrangler pages dev). */
const base = process.argv[2] || 'https://warriorsinneed.org';

const res = await fetch(`${base}/api/intake`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://warriorsinneed.org',
  },
  body: JSON.stringify({
    role: 'veteran',
    fields: {
      'first name': 'API',
      'last name': 'Test',
      'email address': `smoke-${Date.now()}@example.com`,
      'contact number': '5555550100',
    },
  }),
});

const text = await res.text();
console.log('Status:', res.status);
console.log(text);

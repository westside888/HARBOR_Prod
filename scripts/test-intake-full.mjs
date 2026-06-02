#!/usr/bin/env node
/**
 * Full intake smoke test: API success + optional email send (after deploy).
 * Usage: node scripts/test-intake-full.mjs [baseUrl]
 */
import { buildSubmitterConfirmationEmail } from '../functions/lib/brevo-email.js';

const base = process.argv[2] || 'https://warriorsinneed.org';
const stamp = Date.now();
const email = `intake-smoke-${stamp}@warriorsinneed.org`;

const payload = {
  role: 'veteran',
  fields: {
    'first name': 'Smoke',
    'last name': 'Test',
    'email address': email,
    'contact number': '5555550199',
    city: 'Virginia Beach',
    state: 'Virginia',
    'zip code': '23451',
    'branch of service': 'Navy',
    'current military status': 'Veteran',
    'discharge status': 'Honorable',
    'how did you hear about win?': 'Website',
    'support needed': 'Career Guidance',
  },
};

console.log('POST', `${base}/api/intake`);
console.log('Test email:', email);

const res = await fetch(`${base}/api/intake`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://warriorsinneed.org',
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log('HTTP', res.status);
console.log(text);

if (!res.ok) process.exit(1);

const data = JSON.parse(text);
if (!data.ok) process.exit(1);

const confirm = buildSubmitterConfirmationEmail({ firstName: 'Smoke', role: 'veteran' });
console.log('\nExpected submitter email subject:', confirm.subject);
console.log('Check info@warriorsinneed.org for internal notification.');
console.log('Check', email, 'inbox for confirmation (may take 1–2 min).');
console.log('Brevo list 26 should include this contact.');

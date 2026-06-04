#!/usr/bin/env node
/**
 * Smoke test veteran intake → Brevo (production or local wrangler pages dev).
 * Usage:
 *   node scripts/test-intake-api.mjs
 *   node scripts/test-intake-api.mjs https://warriorsinneed.org
 */
const base = process.argv[2] || 'https://warriorsinneed.org';
const stamp = Date.now();
const email = `intake-test-${stamp}@warriorsinneed.org`;

const payload = {
  role: 'veteran',
  fields: {
    'first name': 'Test',
    'last name': 'Veteran',
    'email address': email,
    'contact number': '5555550100',
    'street address': '200 Test Ave',
    city: 'Los Angeles',
    state: 'California',
    'zip code': '90001',
    'branch of service': 'Army',
    'current military status': 'Veteran',
    'discharge status': 'Honorable',
    'rank at discharge / current rank': 'E-4',
    'enlistment date': '2015-06-01',
    'expected / actual separation date': '2023-12-01',
    'mos / afsc / rate': '15N',
    'aviation maintenance experience': 'Yes - Military Aviation',
    'general mechanical experience': 'Yes',
    'currently enrolled in training program?': 'No',
    'completed any aviation / mechanical certifications?': 'No',
    'faa written exams completed': 'None Started',
    'current employment status': 'Veteran - Employed',
    'willing to relocate?': 'Maybe',
    'how did you hear about win?': 'Google Search',
    'support needed': 'FAA Test Preparation, Tools',
    'additional information': 'API smoke test — full veteran fields',
  },
};

console.log('POST', `${base}/api/intake`);
console.log('Email:', email);

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
try {
  const data = JSON.parse(text);
  if (!data.ok) process.exit(1);
  console.log('\nOK — check Brevo list 26 for', email);
} catch {
  process.exit(1);
}

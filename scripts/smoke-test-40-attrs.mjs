#!/usr/bin/env node
/**
 * Smoke test: submit veteran intake with 40 Brevo attributes populated.
 * Usage: node scripts/smoke-test-40-attrs.mjs [baseUrl]
 */
import { LABEL_TO_BREVO } from '../functions/lib/brevo-attributes.js';

const base = process.argv[2] || 'https://warriorsinneed.org';
const stamp = Date.now();
const email = `intake-smoke-40-${stamp}@warriorsinneed.org`;

// 40 distinct form labels → Brevo attributes (veteran + cross-mapped employer/donor fields)
const fields = {
  'first name': 'Smoke40',
  'last name': 'AttrTest',
  'email address': email,
  'contact number': '7575550140',
  'street address': '400 Attribute Blvd',
  'address line 2': 'Suite 40',
  city: 'Norfolk',
  state: 'Virginia',
  'zip code': '23510',
  'branch of service': 'Navy',
  'current military status': 'Veteran',
  'discharge status': 'Honorable',
  'rank at discharge / current rank': 'E-6',
  'enlistment date': '2014-01-15',
  'expected / actual separation date': '2024-09-01',
  'mos / afsc / rate': '15T',
  'aviation maintenance experience': 'Yes - Both Military and Civilian',
  'general mechanical experience': 'Yes',
  'currently enrolled in training program?': 'No',
  'completed any aviation / mechanical certifications?': 'Currently In Progress',
  'faa written exams completed': 'Airframe Completed',
  'scheduled for faa oral & practical exam?': 'Yes',
  'current employment status': 'Veteran - Unemployed',
  'willing to relocate?': 'Yes',
  'preferred geographic locations': 'VA, NC, SC',
  'resume prepared?': 'Need Assistance',
  'interested in mentorship / career guidance?': 'Yes',
  'support needed': 'FAA Test Preparation, Tools, Mentorship, Career Placement Assistance',
  'how did you hear about win?': 'Google Search',
  'additional information': '40-attribute smoke test — verify Brevo export',
  'company name': 'WIN Smoke Test Org',
  'job title': 'Test Applicant',
  'company website': 'https://warriorsinneed.org',
  'organization type': 'MRO',
  'currently hiring?': 'Not Currently Hiring',
  'geographic hiring locations': 'N/A',
  'anticipated annual hires': '1-5',
  'roles most frequently hiring for': 'A&P Mechanics, Apprenticeships',
  'currently hire veterans / transitioning military?': 'Actively Seeking Veteran Talent',
  'preferred contact method': 'Email',
  'partnership interest with win': 'Would Like More Information',
};

const expectedKeys = new Set(['INTAKE_ROLE']);
for (const [label, value] of Object.entries(fields)) {
  const key = LABEL_TO_BREVO[label.toLowerCase().trim()];
  if (key && key !== 'EMAIL') expectedKeys.add(key);
}
expectedKeys.add('FIRSTNAME');
expectedKeys.add('LASTNAME');

console.log('WIN 40-attribute smoke test');
console.log('Email:', email);
console.log('Form fields:', Object.keys(fields).length);
console.log('Expected Brevo attributes:', expectedKeys.size);
console.log('POST', `${base}/api/intake\n`);

const res = await fetch(`${base}/api/intake`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'https://warriorsinneed.org' },
  body: JSON.stringify({ role: 'veteran', fields }),
});

const text = await res.text();
console.log('API', res.status, text);
if (!res.ok) process.exit(1);

const data = JSON.parse(text);
if (!data.ok) process.exit(1);

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.log('\nSet BREVO_API_KEY to verify stored attributes in Brevo.');
  process.exit(0);
}

await new Promise((r) => setTimeout(r, 1500));

const got = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
  headers: { accept: 'application/json', 'api-key': apiKey },
});
const contact = await got.json();
const attrs = contact.attributes || {};

const ok = [];
const missing = [];
for (const key of [...expectedKeys].sort()) {
  const v = attrs[key];
  if (v != null && String(v).trim() !== '') ok.push(key);
  else missing.push(key);
}

console.log('\n── Brevo read-back ──');
console.log(`Contact ID: ${contact.id}`);
console.log(`Stored with values: ${ok.length} / ${expectedKeys.size}`);
if (missing.length) console.log('Missing:', missing.join(', '));
console.log('\nSample values:');
for (const k of ['ADDRESS', 'STATE', 'ZIP_CODE', 'DISCHARGE_DATE', 'METHOD_OF_DISCOVERY', 'BRANCH_OF_SERVICE', 'COMPANY_NAME', 'HIRING_ROLES']) {
  if (attrs[k] != null) console.log(`  ${k} = ${JSON.stringify(attrs[k])}`);
}

console.log('\nMichelle can export this contact:', email);
console.log('Veteran list ID: 26');

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
    'street address': '100 Smoke Test Lane',
    'address line 2': 'Unit 1',
    city: 'Virginia Beach',
    state: 'Virginia',
    'zip code': '23451',
    'branch of service': 'Navy',
    'current military status': 'Veteran',
    'discharge status': 'Honorable',
    'rank at discharge / current rank': 'E-5',
    'enlistment date': '2016-01-01',
    'expected / actual separation date': '2024-06-01',
    'mos / afsc / rate': '15T',
    'aviation maintenance experience': 'Yes - Military Aviation',
    'general mechanical experience': 'Yes',
    'currently enrolled in training program?': 'No',
    'completed any aviation / mechanical certifications?': 'No',
    'faa written exams completed': 'General Completed',
    'scheduled for faa oral & practical exam?': 'No',
    'current employment status': 'Veteran - Unemployed',
    'willing to relocate?': 'Yes',
    'preferred geographic locations': 'Virginia',
    'resume prepared?': 'Yes',
    'interested in mentorship / career guidance?': 'Yes',
    'support needed': 'Tools, Mentorship',
    'how did you hear about win?': 'Google Search',
    'additional information': 'Full smoke test — all veteran fields populated',
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

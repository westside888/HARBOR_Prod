#!/usr/bin/env node
/**
 * Send a branded WIN test email via Brevo.
 * Usage: BREVO_API_KEY=... node scripts/send-branded-email-test.mjs [recipient]
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSubmitterConfirmationEmail,
  sendBrevoEmail,
  WIN_EMAIL_BRAND,
} from '../functions/lib/brevo-email.js';

const apiKey = process.env.BREVO_API_KEY;
const to = process.argv[2] || 'yoodunnie@gmail.com';
const sender = process.env.BREVO_SENDER_EMAIL || 'info@warriorsinneed.org';

if (!apiKey) {
  console.error('Set BREVO_API_KEY');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = join(root, 'assets/images/win-logo-email.png');
const logoBase64 = readFileSync(logoPath).toString('base64');
const logoUrl = `data:image/png;base64,${logoBase64}`;

const mail = buildSubmitterConfirmationEmail({
  firstName: 'Dunnie',
  role: 'veteran',
  logoUrl,
});

console.log('Sending branded test to', to);
console.log('Subject:', mail.subject);

const result = await sendBrevoEmail({
  apiKey,
  senderEmail: sender,
  to: [to],
  subject: `[TEST] ${mail.subject}`,
  htmlContent: mail.htmlContent,
  replyTo: 'info@warriorsinneed.org',
});

if (result.ok) {
  console.log('Sent successfully.', result.data?.messageId || '');
} else {
  console.error('Failed:', result.status, result.data);
  process.exit(1);
}

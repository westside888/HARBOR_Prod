import { LABEL_TO_BREVO, LIST_IDS } from '../lib/brevo-attributes.js';
import { FIELD_KEY_TO_LABEL } from '../lib/field-keys.js';
import { upsertBrevoContact } from '../lib/brevo-contact.js';
import {
  buildInternalNotificationEmail,
  buildSubmitterConfirmationEmail,
  sendBrevoEmail,
} from '../lib/brevo-email.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function corsOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || 'https://warriorsinneed.org,https://www.warriorsinneed.org')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin) || allowed.includes('*')) {
    return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin || allowed[0] };
  }
  return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': allowed[0] };
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

function normalizeFields(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (!v || k.startsWith('_')) continue;
    const lower = k.toLowerCase().trim();
    const label = FIELD_KEY_TO_LABEL[lower] || lower;
    out[label] = v;
  }
  return out;
}

function listIdForRole(role, env) {
  const fromEnv = {
    veteran: env.BREVO_LIST_VETERAN,
    employer: env.BREVO_LIST_EMPLOYER,
    donor: env.BREVO_LIST_DONOR,
  }[role];
  const id = parseInt(fromEnv || LIST_IDS[role], 10);
  return Number.isFinite(id) ? id : null;
}

function buildBrevoAttributes(fields, role) {
  const attributes = { INTAKE_ROLE: role };
  for (const [label, value] of Object.entries(fields)) {
    if (!value) continue;
    const key = LABEL_TO_BREVO[label.toLowerCase().trim()];
    if (!key || key === 'EMAIL') continue;
    attributes[key] = String(value).slice(0, 500);
  }
  return attributes;
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsOrigin(context.request, context.env) });
}

export async function onRequestPost(context) {
  const headers = corsOrigin(context.request, context.env);

  try {
    const { request, env } = context;
    const apiKey = env.BREVO_API_KEY;

    if (!apiKey) {
      return json(headers, 500, {
        ok: false,
        message: 'Server configuration error. Set BREVO_API_KEY in Cloudflare Pages.',
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json(headers, 400, { ok: false, message: 'Invalid request.' });
    }

    if (body.website) {
      return json(headers, 200, { ok: true });
    }

    const role = body.role;
    const listId = listIdForRole(role, env);
    const fields = normalizeFields(body.fields);
    if (!role || !listId) {
      return json(headers, 400, { ok: false, message: 'Invalid intake type.' });
    }

    const email = (fields.email || fields['email address'] || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(headers, 400, { ok: false, message: 'A valid email address is required.' });
    }

    const firstName = fields['first name'] || fields.first_name || '';
    const lastName = fields['last name'] || fields.last_name || '';
    if (!firstName.trim() || !lastName.trim()) {
      return json(headers, 400, { ok: false, message: 'First and last name are required.' });
    }

    const attributes = buildBrevoAttributes(fields, role);
    attributes.FIRSTNAME = firstName.trim();
    attributes.LASTNAME = lastName.trim();

    const phone = normalizePhone(
      fields['contact number'] || fields['phone number'] || fields.phone || attributes.SMS
    );
    if (phone) attributes.SMS = phone;

    const result = await upsertBrevoContact({
      apiKey,
      email,
      listIds: [listId],
      attributes,
    });

    if (result.ok) {
      const senderEmail = env.BREVO_SENDER_EMAIL || 'info@warriorsinneed.org';
      const notifyEmail = env.BREVO_NOTIFY_EMAIL || 'info@warriorsinneed.org';

      const submitterMail = buildSubmitterConfirmationEmail({
        firstName: firstName.trim(),
        role,
      });
      const internalMail = buildInternalNotificationEmail({
        role,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        phone,
        fields,
      });

      await Promise.all([
        sendBrevoEmail({
          apiKey,
          senderEmail,
          to: [email],
          subject: submitterMail.subject,
          htmlContent: submitterMail.htmlContent,
          replyTo: notifyEmail,
        }),
        sendBrevoEmail({
          apiKey,
          senderEmail,
          to: [notifyEmail],
          subject: internalMail.subject,
          htmlContent: internalMail.htmlContent,
          replyTo: email,
        }),
      ]);

      return json(headers, 200, {
        ok: true,
        message:
          'Thank you for your submission! Warriors In Need has received your intake and will be in touch soon.',
      });
    }

    const msg =
      result.data?.message ||
      result.data?.code ||
      'Unable to submit intake. Please try again or contact info@warriorsinneed.org.';
    console.error('Brevo error', result.status, result.data);
    return json(headers, 502, { ok: false, message: msg });
  } catch (err) {
    console.error(err);
    return json(headers, 500, { ok: false, message: 'Server error. Please try again later.' });
  }
}

function json(headers, status, data) {
  return new Response(JSON.stringify(data), { status, headers });
}

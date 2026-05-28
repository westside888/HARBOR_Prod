import { BREVO_CUSTOM_ATTRIBUTES } from './brevo-attributes.js';

const STANDARD_ATTRS = new Set([
  'FIRSTNAME',
  'LASTNAME',
  'SMS',
  'CITY',
  'STATE',
  'ZIP',
  'COUNTRY',
  'ADDRESS',
]);

const CUSTOM_ATTR_SET = new Set(BREVO_CUSTOM_ATTRIBUTES);

function splitAttributes(attributes) {
  const standard = {};
  const custom = {};
  for (const [key, value] of Object.entries(attributes || {})) {
    if (!value) continue;
    if (STANDARD_ATTRS.has(key)) standard[key] = value;
    else if (CUSTOM_ATTR_SET.has(key)) custom[key] = value;
    else custom[key] = value;
  }
  return { standard, custom };
}

export async function upsertBrevoContact({ apiKey, email, listIds, attributes }) {
  const payloads = [
    attributes,
    { ...splitAttributes(attributes).standard, INTAKE_ROLE: attributes?.INTAKE_ROLE },
    {
      FIRSTNAME: attributes?.FIRSTNAME,
      LASTNAME: attributes?.LASTNAME,
      INTAKE_ROLE: attributes?.INTAKE_ROLE,
    },
    {},
  ];

  let last = { status: 0, data: {} };
  for (const attrs of payloads) {
    const cleaned = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (v != null && String(v).trim() !== '') cleaned[k] = String(v).slice(0, 500);
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        listIds,
        attributes: cleaned,
        updateEnabled: true,
        emailBlacklisted: false,
        smsBlacklisted: false,
      }),
    });

    const text = await res.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (res.ok || res.status === 204) {
      return { ok: true, status: res.status, data };
    }

    last = { status: res.status, data };
    const msg = String(data.message || data.code || '').toLowerCase();
    const retryable =
      res.status === 400 &&
      (msg.includes('attribute') || msg.includes('invalid') || msg.includes('not found'));
    if (!retryable) break;
  }

  return { ok: false, status: last.status, data: last.data };
}

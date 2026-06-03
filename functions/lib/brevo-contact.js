import { BREVO_CUSTOM_ATTRIBUTES } from './brevo-attributes.js';

const STANDARD_ATTRS = new Set([
  'FIRSTNAME',
  'LASTNAME',
  'SMS',
  'CITY',
  'STATE',
  'ZIP_CODE',
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

function cleanAttributes(attrs) {
  const cleaned = {};
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v != null && String(v).trim() !== '') cleaned[k] = String(v).slice(0, 500);
  }
  return cleaned;
}

async function postContact({ apiKey, email, listIds, attributes }) {
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
      attributes,
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
  return { status: res.status, ok: res.ok || res.status === 204, data };
}

// Pull attribute names that Brevo names in an error message so we can drop only
// the offending field(s) and retry — never silently discarding all custom data.
function offendingAttributes(message, candidateKeys) {
  const msg = String(message || '').toUpperCase();
  return candidateKeys.filter((k) => msg.includes(k.toUpperCase()));
}

export async function upsertBrevoContact({ apiKey, email, listIds, attributes }) {
  let current = cleanAttributes(attributes);
  let last = { status: 0, data: {} };
  const dropped = [];

  // Retry loop: on a 400 that names specific attributes, remove just those and
  // retry. Bounded by the number of attributes so it always terminates.
  for (let attempt = 0; attempt <= Object.keys(current).length + 1; attempt += 1) {
    const result = await postContact({ apiKey, email, listIds, attributes: current });
    if (result.ok) {
      return { ok: true, status: result.status, data: result.data, droppedAttributes: dropped };
    }

    last = { status: result.status, data: result.data };
    if (result.status !== 400) break;

    const message = result.data.message || result.data.code || '';
    const bad = offendingAttributes(message, Object.keys(current));
    if (bad.length === 0) break;

    for (const key of bad) {
      delete current[key];
      dropped.push(key);
    }
  }

  // Last resort: persist the contact with standard fields only so the lead is
  // never lost, even if an unexpected error blocked the full payload.
  const fallback = { ...splitAttributes(attributes).standard, INTAKE_ROLE: attributes?.INTAKE_ROLE };
  const result = await postContact({ apiKey, email, listIds, attributes: cleanAttributes(fallback) });
  if (result.ok) {
    return {
      ok: true,
      status: result.status,
      data: result.data,
      droppedAttributes: Object.keys(cleanAttributes(attributes)).filter((k) => !STANDARD_ATTRS.has(k) && k !== 'INTAKE_ROLE'),
    };
  }

  return { ok: false, status: last.status, data: last.data };
}

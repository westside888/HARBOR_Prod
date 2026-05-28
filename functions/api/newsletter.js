import { upsertBrevoContact } from '../lib/brevo-contact.js';

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

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsOrigin(context.request, context.env) });
}

export async function onRequestPost(context) {
  const headers = corsOrigin(context.request, context.env);

  try {
    const { request, env } = context;
    const apiKey = env.BREVO_API_KEY;
    const listId = parseInt(env.BREVO_LIST_NEWSLETTER || '0', 10);

    if (!apiKey) {
      return json(headers, 500, {
        ok: false,
        message: 'Server configuration error. Set BREVO_API_KEY in Cloudflare Pages.',
      });
    }
    if (!listId) {
      return json(headers, 500, {
        ok: false,
        message: 'Newsletter list not configured. Set BREVO_LIST_NEWSLETTER in Cloudflare.',
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

    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(headers, 400, { ok: false, message: 'A valid email address is required.' });
    }

    const firstName = String(body.firstName || body.first_name || '').trim();
    const lastName = String(body.lastName || body.last_name || '').trim();

    const attributes = { INTAKE_ROLE: 'newsletter', REFERRAL_SOURCE: 'website newsletter' };
    if (firstName) attributes.FIRSTNAME = firstName;
    if (lastName) attributes.LASTNAME = lastName;

    const result = await upsertBrevoContact({
      apiKey,
      email,
      listIds: [listId],
      attributes,
    });

    if (result.ok) {
      return json(headers, 200, {
        ok: true,
        message: "You're subscribed! Thank you for joining our newsletter.",
      });
    }

    const msg =
      result.data?.message ||
      result.data?.code ||
      'Unable to subscribe. Please try again or contact info@warriorsinneed.org.';
    console.error('Brevo newsletter error', result.status, result.data);
    return json(headers, 502, { ok: false, message: msg });
  } catch (err) {
    console.error(err);
    return json(headers, 500, { ok: false, message: 'Server error. Please try again later.' });
  }
}

function json(headers, status, data) {
  return new Response(JSON.stringify(data), { status, headers });
}

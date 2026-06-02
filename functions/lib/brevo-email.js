/**
 * Send transactional email via Brevo SMTP API.
 * Failures are logged but do not block the intake response.
 */
export const WIN_EMAIL_BRAND = {
  olive: '#6e7d14',
  oliveMid: '#8a9c1a',
  oliveHi: '#adc22a',
  black: '#0d0d0a',
  dark: '#1a1a10',
  text: '#f5f5f0',
  textMuted: '#b8b8a8',
  logoUrl: 'https://warriorsinneed.org/assets/images/win-logo-email.png',
  siteUrl: 'https://warriorsinneed.org',
};

export async function sendBrevoEmail({ apiKey, senderEmail, to, subject, htmlContent, replyTo }) {
  if (!apiKey || !senderEmail || !to?.length || !subject || !htmlContent) {
    return { ok: false, skipped: true, reason: 'missing_params' };
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: 'Warriors In Need' },
      to: to.map((email) => ({ email })),
      subject,
      htmlContent,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
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

  if (res.ok || res.status === 201) {
    return { ok: true, status: res.status, data };
  }

  console.error('Brevo email error', res.status, data);
  return { ok: false, status: res.status, data };
}

const ROLE_LABELS = {
  veteran: 'Veteran',
  employer: 'Employer',
  donor: 'Donor',
};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Shared WIN-branded HTML email wrapper */
export function buildBrandedEmailHtml({ title, bodyHtml, logoUrl = WIN_EMAIL_BRAND.logoUrl }) {
  const { olive, oliveHi, dark, black, text, textMuted, siteUrl } = WIN_EMAIL_BRAND;
  const safeTitle = escapeHtml(title);
  const logo = escapeHtml(logoUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${black};font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${black};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:${dark};border:1px solid ${olive};border-radius:4px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg, ${olive} 0%, ${oliveHi} 100%);padding:28px 24px;text-align:center;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img src="${logo}" alt="Warriors In Need" width="280" style="display:block;margin:0 auto;max-width:280px;width:100%;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 24px;color:${text};font-size:16px;line-height:1.65;">
              <h1 style="margin:0 0 20px;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${oliveHi};">${safeTitle}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${olive};color:${textMuted};font-size:13px;line-height:1.5;text-align:center;">
              <p style="margin:0 0 8px;"><strong style="color:${oliveHi};">Warriors In Need</strong></p>
              <p style="margin:0;"><a href="${siteUrl}" style="color:${oliveHi};text-decoration:none;">warriorsinneed.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildSubmitterConfirmationEmail({ firstName, role, logoUrl }) {
  const name = escapeHtml(firstName || 'there');
  const roleLabel = ROLE_LABELS[role] || 'Intake';
  const bodyHtml = `
  <p style="margin:0 0 16px;">Hi ${name},</p>
  <p style="margin:0 0 16px;">Thank you for submitting your <strong style="color:${WIN_EMAIL_BRAND.oliveHi};">${roleLabel}</strong> intake form to Warriors In Need.</p>
  <p style="margin:0 0 16px;">We have received your information and a member of our team will follow up as soon as possible.</p>
  <p style="margin:0;">In solidarity,<br /><strong>Warriors In Need</strong></p>`;

  return {
    subject: 'Thank you — Warriors In Need received your intake',
    htmlContent: buildBrandedEmailHtml({
      title: 'Thank you for your submission',
      bodyHtml,
      logoUrl,
    }),
  };
}

export function buildInternalNotificationEmail({
  role,
  firstName,
  lastName,
  email,
  phone,
  fields,
  logoUrl,
}) {
  const roleLabel = ROLE_LABELS[role] || role || 'Intake';
  const rows = Object.entries(fields || {})
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 16px 8px 0;vertical-align:top;font-weight:600;color:${WIN_EMAIL_BRAND.oliveHi};font-size:14px;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:${WIN_EMAIL_BRAND.text};font-size:14px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const bodyHtml = `
  <p style="margin:0 0 16px;">A new <strong style="color:${WIN_EMAIL_BRAND.oliveHi};">${escapeHtml(roleLabel)}</strong> intake was submitted on warriorsinneed.org.</p>
  <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rows}</table>
  <p style="margin:0;"><strong style="color:${WIN_EMAIL_BRAND.oliveHi};">Email:</strong> ${escapeHtml(email)}<br />
  <strong style="color:${WIN_EMAIL_BRAND.oliveHi};">Phone:</strong> ${escapeHtml(phone || '—')}</p>`;

  return {
    subject: `New ${roleLabel} intake — ${firstName || ''} ${lastName || ''}`.trim(),
    htmlContent: buildBrandedEmailHtml({
      title: `New ${roleLabel} intake`,
      bodyHtml,
      logoUrl,
    }),
  };
}

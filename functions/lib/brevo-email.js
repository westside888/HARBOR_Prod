/**
 * Send transactional email via Brevo SMTP API.
 * Failures are logged but do not block the intake response.
 */
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

export function buildSubmitterConfirmationEmail({ firstName, role }) {
  const name = escapeHtml(firstName || 'there');
  const roleLabel = ROLE_LABELS[role] || 'Intake';
  return {
    subject: 'Thank you — Warriors In Need received your intake',
    htmlContent: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#1a1a10;">
  <p>Hi ${name},</p>
  <p>Thank you for submitting your <strong>${roleLabel}</strong> intake form to Warriors In Need.</p>
  <p>We have received your information and a member of our team will follow up as soon as possible.</p>
  <p>In solidarity,<br><strong>Warriors In Need</strong><br>
  <a href="https://warriorsinneed.org">warriorsinneed.org</a></p>
</body></html>`,
  };
}

export function buildInternalNotificationEmail({ role, firstName, lastName, email, phone, fields }) {
  const roleLabel = ROLE_LABELS[role] || role || 'Intake';
  const rows = Object.entries(fields || {})
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:bold;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  return {
    subject: `New ${roleLabel} intake — ${firstName || ''} ${lastName || ''}`.trim(),
    htmlContent: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#1a1a10;">
  <p>A new <strong>${escapeHtml(roleLabel)}</strong> intake was submitted on warriorsinneed.org.</p>
  <table style="border-collapse:collapse;">${rows}</table>
  <p style="margin-top:1.5em;"><strong>Email:</strong> ${escapeHtml(email)}<br>
  <strong>Phone:</strong> ${escapeHtml(phone || '—')}</p>
</body></html>`,
  };
}

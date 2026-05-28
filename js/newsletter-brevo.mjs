const FORM_ID = 'newsletter-form';

function showNewsletterMessage(text, isError) {
  const el = document.getElementById('newsletter-form-message');
  if (!el) return;
  el.className = 'newsletter-form-message' + (isError ? ' is-error' : ' is-success');
  el.textContent = text;
  el.hidden = false;
}

async function submitNewsletter(e) {
  e.preventDefault();
  const form = document.getElementById(FORM_ID);
  if (!form) return;

  const honeypot = form.querySelector('[name="website"]');
  if (honeypot?.value) return;

  const emailInput = form.querySelector('[name="email"]');
  const email = (emailInput?.value || '').trim();
  if (!email) {
    showNewsletterMessage('Please enter your email address.', true);
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  const prevText = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Subscribing…';
  }

  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, website: honeypot?.value || '' }),
    });

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (res.ok && data.ok) {
      showNewsletterMessage(
        data.message || "You're subscribed! Thank you for joining our newsletter.",
        false
      );
      form.reset();
      if (typeof window.openIntakeSuccessModal === 'function') {
        window.openIntakeSuccessModal();
      }
    } else {
      showNewsletterMessage(
        data.message ||
          (res.status >= 500
            ? 'Subscription is temporarily unavailable. Please try again later.'
            : 'Subscription failed. Please check your email and try again.'),
        true
      );
    }
  } catch {
    showNewsletterMessage('Network error. Please check your connection and try again.', true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById(FORM_ID);
  if (!form) return;
  form.addEventListener('submit', submitNewsletter);
});

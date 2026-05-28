import { FIELD_KEY_TO_LABEL } from './field-keys.js';

const INTAKE_FORM_ID = 'intake-form';

function normalizeLabel(labelEl) {
  if (!labelEl) return '';
  const clone = labelEl.cloneNode(true);
  clone.querySelectorAll('.req, .intake-section-note').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
}

function fieldLabelForKey(key, labelEl) {
  if (key && FIELD_KEY_TO_LABEL[key]) return FIELD_KEY_TO_LABEL[key];
  return normalizeLabel(labelEl);
}

function getControlKey(control) {
  if (!control) return '';
  return control.dataset?.field || control.name || '';
}

function collectPanelFields(panel) {
  const fields = {};
  panel.querySelectorAll('.intake-field').forEach((wrap) => {
    const labelEl = wrap.querySelector(':scope > label');
    const checkboxes = wrap.querySelectorAll('.intake-checkboxes input[type="checkbox"]');

    if (checkboxes.length) {
      const key = getControlKey(checkboxes[0]);
      const label = fieldLabelForKey(key, labelEl);
      if (!label) return;
      const checked = [...checkboxes]
        .filter((cb) => cb.checked)
        .map((cb) => cb.parentElement?.textContent?.trim() || cb.value);
      if (checked.length) fields[label] = checked.join(', ');
      return;
    }

    const control = wrap.querySelector('input:not([type="checkbox"]), select, textarea');
    if (!control) return;
    const key = getControlKey(control);
    const label = fieldLabelForKey(key, labelEl);
    if (!label) return;
    const val = (control.value || '').trim();
    if (val) fields[label] = val;
  });
  return fields;
}

function getActiveRole() {
  const active = document.querySelector('.intake-role.active');
  return active?.dataset?.role || 'veteran';
}

function getActivePanel() {
  const role = getActiveRole();
  return document.querySelector(`.intake-form-panel[data-panel="${role}"]`);
}

function validateRequired(panel) {
  const missing = [];
  panel.querySelectorAll('.intake-field').forEach((wrap) => {
    if (!wrap.querySelector('.req')) return;
    const labelEl = wrap.querySelector(':scope > label');
    const checkboxes = wrap.querySelectorAll('.intake-checkboxes input[type="checkbox"]');

    if (checkboxes.length) {
      const key = getControlKey(checkboxes[0]);
      const label = fieldLabelForKey(key, labelEl);
      if (![...checkboxes].some((cb) => cb.checked)) missing.push(label);
      return;
    }

    const control = wrap.querySelector('input:not([type="checkbox"]), select, textarea');
    const label = fieldLabelForKey(getControlKey(control), labelEl);
    if (!control || !(control.value || '').trim()) missing.push(label);
  });
  return missing;
}

function showIntakeMessage(text, isError) {
  let el = document.getElementById('intake-form-message');
  if (!el) {
    el = document.createElement('div');
    el.id = 'intake-form-message';
    el.style.cssText =
      'margin-top:1rem;padding:.85rem 1rem;font-size:.85rem;letter-spacing:.04em;border:1px solid rgba(173,194,42,.35);';
    const row = document.querySelector('.intake-submit-row');
    if (row) row.parentElement.insertBefore(el, row);
  }
  el.style.color = isError ? '#ffb4b4' : 'var(--olive-hi)';
  el.style.borderColor = isError ? 'rgba(255,100,100,.4)' : 'rgba(173,194,42,.35)';
  el.textContent = text;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function submitIntakeForm(e) {
  e.preventDefault();
  const form = document.getElementById(INTAKE_FORM_ID);
  if (!form) return;

  const honeypot = form.querySelector('[name="website"]');
  if (honeypot?.value) return;

  const panel = getActivePanel();
  if (!panel) return;

  const fields = collectPanelFields(panel);
  fields.email = fields['email address'] || fields.email;

  const missing = validateRequired(panel);
  if (missing.length) {
    showIntakeMessage('Please complete all required fields (*).', true);
    return;
  }

  const btn = form.querySelector('.intake-submit[type="submit"]');
  const prevText = btn?.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Submitting…';
  }

  try {
    const res = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: getActiveRole(),
        fields,
        website: honeypot?.value || '',
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      showIntakeMessage(
        data.message ||
          'Thank you! Check your email and click the confirmation link to complete your intake.',
        false
      );
      if (typeof window.openIntakeConfirmModal === 'function') {
        window.openIntakeConfirmModal();
      }
      form.reset();
    } else {
      showIntakeMessage(data.message || 'Submission failed. Please try again.', true);
    }
  } catch {
    showIntakeMessage('Network error. Please check your connection and try again.', true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = prevText;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById(INTAKE_FORM_ID);
  if (!form) return;
  form.addEventListener('submit', submitIntakeForm);
});

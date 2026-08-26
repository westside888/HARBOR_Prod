/** WIN homepage — GiveButter overlay, intake modal, contact popup, email signup */
(function () {
  const GIVEBUTTER_FALLBACK = 'https://givebutter.com/WIN-General-Donation-Page';
  /** How long to wait for the widget before giving up and using the hosted page. */
  const GIVEBUTTER_WAIT_MS = 2500;

  const ROLE_META = {
    veteran: { title: 'Veteran Intake', sub: 'Tell us about your transition — we\'ll connect you with career support.' },
    employer: { title: 'Employer & Partner Intake', sub: 'Share how you\'d like to hire or partner with WIN.' },
    supporter: { title: 'Supporter Intake', sub: 'Let us know how you\'d like to help our mission.' },
  };

  /** Click the widget's real button inside its shadow root. Returns false if it isn't ready. */
  function openGivebutter() {
    const gb =
      document.querySelector('#givebutter-donate-btn') ||
      document.querySelector('givebutter-button');
    const inner = gb?.shadowRoot?.querySelector('button, a[role="button"]');
    if (!inner) return false;
    inner.click();
    return true;
  }

  /**
   * A click before the widget script has loaded must not send the visitor off-site,
   * so hold the navigation and keep retrying. Only leave if the widget never arrives,
   * which means it was blocked or the network is down.
   */
  function handleDonateClick(e) {
    e.preventDefault();
    if (openGivebutter()) return;
    const deadline = Date.now() + GIVEBUTTER_WAIT_MS;
    const retry = () => {
      if (openGivebutter()) return;
      if (Date.now() >= deadline) {
        window.location.href = GIVEBUTTER_FALLBACK;
        return;
      }
      setTimeout(retry, 100);
    };
    retry();
  }

  // The href stays a working fallback for no-JS and for a widget that fails to load.
  document.querySelectorAll('.js-givebutter-donate').forEach((el) => {
    if (el.tagName === 'A') {
      el.setAttribute('href', GIVEBUTTER_FALLBACK);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
    el.addEventListener('click', handleDonateClick);
  });

  const contactOverlay = document.getElementById('contact-overlay');
  const contactForm = document.getElementById('contact-overlay-form');
  const openContact = document.getElementById('open-contact-overlay');
  const openEmailSignup = document.getElementById('open-email-signup');

  function openOverlay(overlay, focusEl) {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    (focusEl || overlay.querySelector('.overlay-close, input, button'))?.focus();
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('#intake-overlay.open, #contact-overlay.open')) {
      document.body.style.overflow = '';
    }
  }

  [openContact, openEmailSignup].forEach((btn) => {
    btn?.addEventListener('click', () => openOverlay(contactOverlay));
  });

  contactOverlay?.querySelectorAll('[data-close-overlay]').forEach((btn) => {
    btn.addEventListener('click', () => closeOverlay(contactOverlay));
  });
  contactOverlay?.addEventListener('click', (e) => {
    if (e.target === contactOverlay) closeOverlay(contactOverlay);
  });

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const payload = {
      firstName: String(fd.get('firstName') || '').trim(),
      lastName: String(fd.get('lastName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      website: String(fd.get('website') || ''),
      source: 'contact-overlay',
    };
    const msg = document.getElementById('contact-overlay-message');
    const submit = contactForm.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Submitting…';
    }
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        if (msg) {
          msg.hidden = false;
          msg.textContent = data.message || "You're on the list. Thank you!";
          msg.className = 'newsletter-form-message is-success';
        }
        contactForm.reset();
        if (typeof window.openIntakeSuccessModal === 'function') {
          window.openIntakeSuccessModal("Thank you — we've added you to our list.");
        }
        setTimeout(() => closeOverlay(contactOverlay), 1200);
      } else if (msg) {
        msg.hidden = false;
        msg.textContent = data.message || 'Something went wrong. Please try again.';
        msg.className = 'newsletter-form-message is-error';
      }
    } catch {
      if (msg) {
        msg.hidden = false;
        msg.textContent = 'Network error. Please try again.';
        msg.className = 'newsletter-form-message is-error';
      }
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'Submit';
      }
    }
  });

  /* ── Intake overlay ── */
  const intakeOverlay = document.getElementById('intake-overlay');
  const intakeOverlayBody = document.getElementById('intake-overlay-body');
  const intakeOverlayTitle = document.getElementById('intake-overlay-title');
  const intakeOverlaySub = document.getElementById('intake-overlay-sub');
  const intakeRight = document.querySelector('#intake .intake-right');
  const intakeHome = intakeRight?.parentElement;

  function setIntakeOverlayCopy(roleKey) {
    const meta = ROLE_META[roleKey] || ROLE_META.veteran;
    if (intakeOverlayTitle) intakeOverlayTitle.textContent = meta.title;
    if (intakeOverlaySub) intakeOverlaySub.textContent = meta.sub;
  }

  function openIntakeModal(roleKey) {
    if (!intakeOverlay || !intakeOverlayBody || !intakeRight) return;

    document.querySelectorAll('.intake-role').forEach((r) => {
      r.classList.toggle('active', r.dataset.role === roleKey);
      r.setAttribute('aria-pressed', r.dataset.role === roleKey ? 'true' : 'false');
    });
    document.querySelectorAll('.intake-form-panel').forEach((panel) => {
      panel.style.display = panel.dataset.panel === roleKey ? '' : 'none';
    });

    setIntakeOverlayCopy(roleKey);
    intakeOverlayBody.appendChild(intakeRight);
    intakeRight.classList.remove('reveal-col-right');
    intakeRight.style.display = '';
    intakeRight.style.opacity = '1';
    intakeRight.style.transform = 'none';
    openOverlay(intakeOverlay, intakeOverlay.querySelector('.overlay-close'));

    requestAnimationFrame(() => {
      const first = intakeRight.querySelector('.intake-form-panel[data-panel="' + roleKey + '"] input, .intake-form-panel[data-panel="' + roleKey + '"] select, .intake-form-panel[data-panel="' + roleKey + '"] textarea');
      if (first && window.matchMedia('(min-width: 721px)').matches) first.focus();
    });
  }

  function closeIntakeModal() {
    if (intakeRight && intakeHome) {
      intakeHome.appendChild(intakeRight);
      intakeRight.style.display = 'none';
    }
    closeOverlay(intakeOverlay);
  }

  window.closeIntakeModal = closeIntakeModal;

  document.querySelectorAll('.intake-role').forEach((role) => {
    role.setAttribute('role', 'button');
    role.setAttribute('tabindex', '0');
    role.setAttribute('aria-pressed', role.classList.contains('active') ? 'true' : 'false');

    const activate = () => openIntakeModal(role.dataset.role);
    role.addEventListener('click', activate);
    role.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  intakeOverlay?.querySelectorAll('[data-close-overlay]').forEach((btn) => {
    btn.addEventListener('click', closeIntakeModal);
  });
  intakeOverlay?.addEventListener('click', (e) => {
    if (e.target === intakeOverlay) closeIntakeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (contactOverlay?.classList.contains('open')) closeOverlay(contactOverlay);
    if (intakeOverlay?.classList.contains('open')) closeIntakeModal();
  });

  document.querySelectorAll('.intake-form-panel').forEach((p) => {
    p.style.display = 'none';
  });
})();

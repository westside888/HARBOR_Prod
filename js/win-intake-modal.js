/** Thank-you modal after intake or newsletter submit */
(function () {
  const overlay = document.getElementById('win-modal-overlay');
  const closeBtn = document.getElementById('win-modal-close');
  const textEl = document.getElementById('win-modal-text');
  const imgEl = document.getElementById('win-modal-img');

  if (!overlay) return;

  function closeModal() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openModal(message) {
    const msg =
      message ||
      'Thank you for your submission. Warriors In Need has received your information.';

    if (textEl) {
      textEl.textContent = msg;
      textEl.style.display = 'block';
    }
    if (imgEl) imgEl.style.display = 'none';

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  window.openIntakeSuccessModal = openModal;

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });
})();

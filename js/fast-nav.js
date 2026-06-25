/**
 * Fast in-page / cross-page hash navigation (intake, anchors).
 * Prefetches likely next pages on load, hover, and touch.
 */
(function (global) {
  const NAV_OFFSET = 72;
  const prefetched = new Set();

  function scrollToHash(hash, behavior) {
    if (!hash || hash === '#') return false;
    const id = decodeURIComponent(hash.slice(1));
    const el = document.getElementById(id);
    if (!el) return false;
    const y = el.getBoundingClientRect().top + global.scrollY - NAV_OFFSET;
    global.scrollTo({ top: Math.max(0, y), behavior: behavior || 'auto' });
    return true;
  }

  function jumpToHash() {
    if (global.location.hash) scrollToHash(global.location.hash, 'auto');
  }

  try {
    global.history.scrollRestoration = 'manual';
  } catch (_) {
    /* ignore */
  }

  if (global.location.hash) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', jumpToHash, { once: true });
    } else {
      jumpToHash();
    }
    global.addEventListener('load', jumpToHash, { once: true });
  }

  function prefetchPath(pathname) {
    const path = pathname || '/';
    if (prefetched.has(path)) return;
    prefetched.add(path);
    if (document.querySelector('link[rel="prefetch"][href="' + path + '"]')) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  }

  function prefetchFromHref(raw) {
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return;
    try {
      const url = new URL(raw, global.location.href);
      if (url.origin !== global.location.origin) return;
      if (url.pathname === global.location.pathname && !url.hash) return;
      prefetchPath(url.pathname);
    } catch (_) {
      /* ignore malformed href */
    }
  }

  if (/\/win-stories\/win-avtech/i.test(global.location.pathname)) {
    prefetchPath('/');
  } else if (global.location.pathname === '/' || global.location.pathname.endsWith('/index.html')) {
    prefetchPath('/win-stories/win-avtech.html');
  }

  function onLinkIntent(e) {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    prefetchFromHref(a.getAttribute('href'));
  }

  document.addEventListener('mouseover', onLinkIntent, { passive: true });
  document.addEventListener('touchstart', onLinkIntent, { passive: true });

  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;

      const raw = a.getAttribute('href');
      if (!raw) return;

      if (raw.startsWith('#')) {
        if (!document.getElementById(raw.slice(1))) return;
        e.preventDefault();
        history.pushState(null, '', raw);
        scrollToHash(raw, 'auto');
        return;
      }

      try {
        const url = new URL(raw, global.location.href);
        if (url.origin !== global.location.origin) return;

        if (url.hash && url.pathname === global.location.pathname) {
          e.preventDefault();
          history.pushState(null, '', url.hash);
          scrollToHash(url.hash, 'auto');
          return;
        }

        if (url.hash && url.pathname !== global.location.pathname) {
          prefetchFromHref(raw);
          document.documentElement.classList.add('is-navigating');
        }
      } catch (_) {
        /* ignore malformed href */
      }
    },
    true
  );
})(window);

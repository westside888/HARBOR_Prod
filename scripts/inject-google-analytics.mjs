/**
 * Injects GA4 gtag snippet before </head> when GA_MEASUREMENT_ID is set.
 * @param {string} html
 * @param {string} measurementId e.g. G-XXXXXXXXXX
 */
export function injectGoogleAnalytics(html, measurementId) {
  const id = String(measurementId || '').trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return html;
  if (html.includes(`gtag/js?id=${id}`)) return html;

  const snippet = `<!-- Google tag (gtag.js) — Warriors In Need -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}', { anonymize_ip: true });
</script>
`;

  return html.replace('</head>', `${snippet}</head>`);
}

#!/usr/bin/env python3
"""Inject intake/newsletter Brevo handlers and thank-you modal script into index.html."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

OLD = """});

</script>

<script>
(function() {
  // Base64-encoded PDFs"""

NEW = """});

</script>
<script src="/js/win-intake-modal.js"></script>
<script type="module" src="/js/intake-brevo.mjs"></script>
<script type="module" src="/js/newsletter-brevo.mjs"></script>

<script>
(function() {
  // Base64-encoded PDFs"""


def main():
    text = INDEX.read_text(encoding="utf-8")
    if "intake-brevo.mjs" in text:
        print("Already patched:", INDEX)
        return
    if OLD not in text:
        raise SystemExit("Anchor not found in index.html — manual patch required")
    INDEX.write_text(text.replace(OLD, NEW, 1), encoding="utf-8")
    print("Patched", INDEX)


if __name__ == "__main__":
    main()

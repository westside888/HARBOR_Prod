#!/usr/bin/env python3
"""Inject mobile UX CSS/JS into index.html and win-avtech.html (safe for large files)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

VIEWPORT_OLD = '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'
VIEWPORT_NEW = (
    '<meta name="viewport" '
    'content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>'
)

MOBILE_CSS = """
/* ── MOBILE UX PASS (2026-05) ───────────────────────────────── */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
a, button, .intake-role, .petition-doc-btn, .fin-990-btn {
  -webkit-tap-highlight-color: rgba(173, 194, 42, 0.18);
}
@supports (padding: max(0px)) {
  nav {
    padding-left: max(1.1rem, env(safe-area-inset-left));
    padding-right: max(1.1rem, env(safe-area-inset-right));
  }
  .ct-strip,
  .ct-soc,
  .ct-newsletter._newsletter,
  .footer-bar,
  footer {
    padding-left: max(1.1rem, env(safe-area-inset-left));
    padding-right: max(1.1rem, env(safe-area-inset-right));
  }
}
@media (max-width: 860px) {
  .nav-avtech {
    display: inline-flex !important;
    align-items: center;
    font-size: 0.58rem;
    letter-spacing: 0.16em;
    white-space: nowrap;
  }
  .nav-donate {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.62rem;
  }
  nav {
    min-height: 52px;
    gap: 0.5rem;
  }
  .intake-left {
    padding: 3rem 1.25rem;
  }
  .intake-right {
    padding: 2rem 1.25rem 3rem;
    max-height: none;
    overflow-y: visible;
  }
  .intake-roles {
    flex-direction: column;
    gap: 0.55rem;
  }
  .intake-role {
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: 0.85rem 1rem;
    min-height: 48px;
    gap: 0.85rem;
  }
  .intake-role-icon svg {
    width: 28px;
    height: 28px;
  }
  .intake-role-desc {
    flex: 1;
  }
  .intake-submit-row,
  .petition-submit-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .intake-submit,
  .petition-submit,
  ._newsletter .newsletter-submit {
    width: 100%;
    justify-content: center;
    min-height: 48px;
  }
  .intake-field input:not([type="checkbox"]),
  .intake-field select,
  .intake-field textarea,
  .petition-field input,
  .petition-field select,
  ._newsletter .newsletter-field input[type="email"] {
    font-size: 16px;
    padding: 0.75rem 0.9rem;
    min-height: 48px;
  }
  .intake-checkboxes {
    flex-direction: column;
    gap: 0.5rem;
  }
  .intake-check {
    min-height: 44px;
    align-items: center;
  }
  .intake-check input[type="checkbox"],
  .petition-check-row input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
  .donate-needs-row {
    flex-direction: column;
    align-items: stretch;
  }
  .donate-need-note {
    max-width: 100%;
  }
  .fin-footer-bar {
    flex-direction: column;
    gap: 0.6rem;
    text-align: center;
  }
  .fin-990-btns {
    flex-direction: column;
    align-items: stretch;
  }
  .fin-990-btn,
  .petition-doc-btn {
    min-height: 48px;
    justify-content: center;
  }
  #financials {
    padding: 4rem 1.1rem;
  }
  .fin-bar-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
  .fin-bar-track {
    width: 100%;
  }
  .team-track-wrap {
    touch-action: pan-x;
  }
}
@media (max-width: 540px) {
  .donate-left,
  .donate-right {
    padding-left: 1.1rem;
    padding-right: 1.1rem;
  }
  .petition-left {
    padding: 2.5rem 1.1rem;
  }
  .petition-form-inner {
    padding: 1.5rem 1.1rem 2.5rem;
  }
  .team-arr-btn {
    width: 44px;
    height: 44px;
  }
  .ct-strip a {
    word-break: break-word;
  }
}
@media (hover: none) and (pointer: coarse) {
  .tc .tc-info {
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    pointer-events: auto !important;
  }
  .tc.tc-open .tc-img,
  .tc:hover .tc-img {
    opacity: 0;
  }
  .tc.tc-open .tc-tint,
  .tc:hover .tc-tint {
    opacity: 0;
  }
  .tc.tc-open .tc-grade,
  .tc:hover .tc-grade {
    background: rgba(8, 8, 7, 0.96);
  }
  .tc.tc-open .tc-bio,
  .tc:hover .tc-bio {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }
  .team-scroll-hint::after {
    content: " · Tap a card for bio";
  }
}
"""

AVTECH_MOBILE_CSS = """
/* ── MOBILE UX PASS (2026-05) ───────────────────────────────── */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
a, button, .btn-primary, .btn-ghost, .sil-submit {
  -webkit-tap-highlight-color: rgba(173, 194, 42, 0.18);
}
@supports (padding: max(0px)) {
  nav {
    padding-left: max(1.1rem, env(safe-area-inset-left));
    padding-right: max(1.1rem, env(safe-area-inset-right));
  }
  footer {
    padding-left: max(1.1rem, env(safe-area-inset-left));
    padding-right: max(1.1rem, env(safe-area-inset-right));
  }
}
@media (max-width: 580px) {
  .nav-cta {
    display: inline-flex !important;
    align-items: center;
    min-height: 44px;
    padding: 0.45rem 0.85rem;
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    white-space: nowrap;
  }
  .nav-brand {
    flex-shrink: 1;
    min-width: 0;
  }
  .nav-avtech {
    font-size: 1.1rem;
  }
  .sil-field input,
  .sil-field select,
  .sil-field textarea {
    font-size: 16px;
    min-height: 48px;
  }
  .sil-submit,
  .btn-primary,
  .btn-ghost {
    min-height: 48px;
  }
}
"""

TEAM_TAP_JS = """
/* Team cards — tap to open bio on touch devices */
(function () {
  if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
  document.querySelectorAll(".tc").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      const wasOpen = card.classList.contains("tc-open");
      document.querySelectorAll(".tc.tc-open").forEach((c) => c.classList.remove("tc-open"));
      if (!wasOpen) card.classList.add("tc-open");
    });
  });
})();
"""

MARKER_CSS = "/* ── MOBILE UX PASS (2026-05)"
MARKER_JS = "/* Team cards — tap to open bio on touch devices */"


def patch_index(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if VIEWPORT_OLD in text and VIEWPORT_NEW not in text:
        text = text.replace(VIEWPORT_OLD, VIEWPORT_NEW, 1)
    if MARKER_CSS not in text:
        text = text.replace("</style>", MOBILE_CSS + "\n</style>", 1)
    if MARKER_JS not in text:
        needle = "})();\n\n/* ─ Contact ─────────────────────────────────────── */"
        if needle in text:
            text = text.replace(
                needle,
                "})();\n\n" + TEAM_TAP_JS + "\n/* ─ Contact ─────────────────────────────────────── */",
                1,
            )
        else:
            raise SystemExit("index.html: team scroll anchor not found")
    path.write_text(text, encoding="utf-8")
    print(f"Patched {path.name}")


def patch_avtech(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if VIEWPORT_OLD in text and VIEWPORT_NEW not in text:
        text = text.replace(VIEWPORT_OLD, VIEWPORT_NEW, 1)
    if MARKER_CSS not in text:
        text = text.replace("</style>", AVTECH_MOBILE_CSS + "\n</style>", 1)
    path.write_text(text, encoding="utf-8")
    print(f"Patched {path.name}")


def main() -> None:
    patch_index(ROOT / "index.html")
    patch_avtech(ROOT / "win-avtech.html")


if __name__ == "__main__":
    main()

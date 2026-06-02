#!/usr/bin/env python3
"""Larger nav logo (+15%) and more legible intake form typography."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LOGO_CSS_OLD = ".nav-logo {\n  height: 38px;\n  width: auto;\n  display: block;\n}"
LOGO_CSS_NEW = ".nav-logo {\n  height: 44px;\n  width: auto;\n  display: block;\n}"

LOGO_IMG_OLD = 'class="nav-logo" width="173" height="76"'
LOGO_IMG_NEW = 'class="nav-logo" width="199" height="87"'

INTAKE_REPLACEMENTS = [
    (
        ".intake-field label {\n  font-family: 'Barlow Condensed', sans-serif;\n  font-size: .71rem; font-weight: 700;",
        ".intake-field label {\n  font-family: 'Barlow Condensed', sans-serif;\n  font-size: .875rem; font-weight: 700;",
    ),
    (
        """.intake-field input:not([type="checkbox"]),
.intake-field select,
.intake-field textarea {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  color: var(--white);
  font-family: 'Barlow', sans-serif;
  font-size: .78rem; padding: .65rem .85rem;""",
        """.intake-field input:not([type="checkbox"]),
.intake-field select,
.intake-field textarea {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  color: var(--white);
  font-family: 'Barlow', sans-serif;
  font-size: 1rem; padding: .75rem .9rem;""",
    ),
    (
        ".intake-section-label {\n  font-family: 'Barlow Condensed', sans-serif;\n  font-size: .66rem; font-weight: 700;",
        ".intake-section-label {\n  font-family: 'Barlow Condensed', sans-serif;\n  font-size: .78rem; font-weight: 700;",
    ),
    (
        ".intake-check {\n  font-size: .82rem; color: rgba(255,255,255,.65);",
        ".intake-check {\n  font-size: .9375rem; color: rgba(255,255,255,.65);",
    ),
    (
        ".intake-role-desc {\n  font-size: .71rem; color: rgba(255,255,255,.68);",
        ".intake-role-desc {\n  font-size: .875rem; color: rgba(255,255,255,.68);",
    ),
    (
        ".intake-submit {\n  font-family: 'Barlow Condensed', sans-serif;\n  font-size: .78rem; font-weight: 700;",
        ".intake-submit {\n  font-family: 'Barlow Condensed', sans-serif;\n  font-size: .875rem; font-weight: 700;",
    ),
    (
        ".intake-secure {\n  font-size: .71rem; color: rgba(173,194,42,.75);",
        ".intake-secure {\n  font-size: .8125rem; color: rgba(173,194,42,.75);",
    ),
]


def patch_file(path: Path, intake: bool) -> None:
    text = path.read_text(encoding="utf-8")
    if LOGO_CSS_OLD not in text:
        raise SystemExit(f"{path.name}: nav-logo CSS not found")
    text = text.replace(LOGO_CSS_OLD, LOGO_CSS_NEW, 1)
    text = text.replace(LOGO_IMG_OLD, LOGO_IMG_NEW)
    if intake:
        for old, new in INTAKE_REPLACEMENTS:
            if old not in text:
                raise SystemExit(f"{path.name}: pattern not found: {old[:50]}...")
            text = text.replace(old, new, 1)
    if not text.strip().endswith("</html>"):
        raise SystemExit(f"{path.name}: truncated")
    path.write_text(text, encoding="utf-8")
    print(f"Patched {path.name}")


def main() -> None:
    patch_file(ROOT / "index.html", intake=True)
    patch_file(ROOT / "win-avtech.html", intake=False)


if __name__ == "__main__":
    main()

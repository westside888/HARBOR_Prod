#!/usr/bin/env python3
"""Restore intake/petition checkbox styles (exclude from text-field input rules)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
path = ROOT / "index.html"
text = path.read_text(encoding="utf-8")

REPLACEMENTS = [
    (
        ".intake-field input,\n.intake-field select,\n.intake-field textarea {",
        ".intake-field input:not([type=\"checkbox\"]),\n.intake-field select,\n.intake-field textarea {",
    ),
    (
        ".intake-field input:focus,\n.intake-field select:focus,\n.intake-field textarea:focus {",
        ".intake-field input:not([type=\"checkbox\"]):focus,\n.intake-field select:focus,\n.intake-field textarea:focus {",
    ),
    (
        ".intake-field input::placeholder,\n.intake-field textarea::placeholder { color: rgba(255,255,255,.2); }",
        ".intake-field input:not([type=\"checkbox\"])::placeholder,\n.intake-field textarea::placeholder { color: rgba(255,255,255,.2); }",
    ),
    (
        ".intake-checkboxes {\n  display: flex; flex-wrap: wrap; gap: .4rem .9rem;\n  padding-top: .2rem;\n}",
        ".intake-checkboxes {\n  display: flex;\n  flex-wrap: wrap;\n  gap: .4rem .9rem;\n  padding-top: .2rem;\n  pointer-events: auto;\n  position: relative;\n  z-index: 2;\n}",
    ),
    (
        ".intake-check input[type=\"checkbox\"] {\n  width: 13px; height: 13px; padding: 0;\n  accent-color: var(--olive-hi);\n  flex-shrink: 0;\n}",
        ".intake-check input[type=\"checkbox\"] {\n  width: 16px;\n  height: 16px;\n  min-width: 16px;\n  min-height: 16px;\n  margin: 0;\n  padding: 0;\n  border: 1px solid rgba(255,255,255,.35);\n  background: rgba(255,255,255,.08);\n  accent-color: var(--olive-hi);\n  appearance: auto;\n  -webkit-appearance: checkbox;\n  cursor: pointer;\n  pointer-events: auto;\n  position: relative;\n  z-index: 2;\n  flex-shrink: 0;\n}",
    ),
    (
        ".petition-field input,\n.petition-field select {",
        ".petition-field input:not([type=\"checkbox\"]),\n.petition-field select {",
    ),
    (
        ".petition-field input:focus,\n.petition-field select:focus {",
        ".petition-field input:not([type=\"checkbox\"]):focus,\n.petition-field select:focus {",
    ),
    (
        ".petition-field input::placeholder { color: rgba(255,255,255,.2); }",
        ".petition-field input:not([type=\"checkbox\"])::placeholder { color: rgba(255,255,255,.2); }",
    ),
    (
        ".petition-check-row input[type=\"checkbox\"] {\n  width: 14px; height: 14px; margin-top: .15rem;\n  accent-color: var(--olive-hi); flex-shrink: 0;\n}",
        ".petition-check-row input[type=\"checkbox\"] {\n  width: 16px;\n  height: 16px;\n  min-width: 16px;\n  min-height: 16px;\n  margin-top: .15rem;\n  accent-color: var(--olive-hi);\n  appearance: auto;\n  -webkit-appearance: checkbox;\n  cursor: pointer;\n  pointer-events: auto;\n  flex-shrink: 0;\n}",
    ),
    (
        """  .intake-check input[type="checkbox"],
  .petition-check-row input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }""",
        """  .intake-check input[type="checkbox"],
  .petition-check-row input[type="checkbox"] {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    max-width: 20px;
    appearance: auto;
    -webkit-appearance: checkbox;
    pointer-events: auto;
  }""",
    ),
]

MARKER = "/* CHECKBOX FIX APPLIED */"
if MARKER in text:
    print("Already fixed")
    raise SystemExit(0)

for old, new in REPLACEMENTS:
    if old not in text:
        raise SystemExit(f"Pattern not found:\n{old[:80]}...")
    text = text.replace(old, new, 1)

if not text.strip().endswith("</html>"):
    raise SystemExit("index.html truncated — aborting")

path.write_text(text, encoding="utf-8")
print(f"Fixed checkboxes in {path.name} ({len(text)} bytes)")

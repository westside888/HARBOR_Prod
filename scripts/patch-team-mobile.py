#!/usr/bin/env python3
"""Enlarge veteran team cards and improve bio readability on mobile."""
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "index.html"
text = path.read_text(encoding="utf-8")

MARKER = "/* TEAM MOBILE CARDS (2026-05) */"
if MARKER in text:
    print("Already patched")
    raise SystemExit(0)

replacements = [
    (
        "  /* Team */\n  #team { grid-template-columns: 1fr; }\n  .tc { aspect-ratio: 16/9; }",
        "  /* Team — tall portrait cards on tablet/mobile */\n  #team { display: block; }\n  .tc {\n    width: min(340px, 86vw);\n    aspect-ratio: 3 / 4.35;\n    min-height: 400px;\n  }\n  .team-track-wrap {\n    scroll-snap-type: x mandatory;\n    scroll-padding-inline: 1.25rem;\n  }\n  .tc { scroll-snap-align: center; }",
    ),
    (
        "/* Mobile */\n@media (max-width: 540px) {\n  .team-header { padding: 2.5rem 1.2rem 1.2rem; }\n  .team-track-wrap { padding: 0 1.2rem 2rem; }\n  .tc { width: 78vw; }\n  .team-arrows { padding: 0 1.2rem 1.2rem; }\n}",
        "/* Mobile */\n@media (max-width: 540px) {\n  .team-header { padding: 2.5rem 1.2rem 1.2rem; }\n  .team-track-wrap { padding: 0 1rem 2rem; }\n  .tc {\n    width: min(380px, 92vw);\n    aspect-ratio: 3 / 4.5;\n    min-height: min(540px, 74vh);\n  }\n  .team-arrows { padding: 0 1.2rem 1.2rem; }\n  .tc-bio { padding: 1.35rem 1.15rem 1.1rem; }\n  .tc-bio-text {\n    font-size: 1.02rem;\n    line-height: 1.68;\n    font-style: normal;\n  }\n  .t-nm { font-size: clamp(1.35rem, 6vw, 1.75rem); }\n}",
    ),
    (
        "  /* Team — horizontal scroll, cards naturally sized */\n  .tc-info { padding: 1.4rem 1.1rem 1.2rem; }\n  .t-nm { font-size: clamp(1.1625rem, 5vw, 1.4625rem); }",
        "  /* Team — horizontal scroll, cards naturally sized */\n  .tc-info { padding: 1.5rem 1.2rem 1.25rem; }\n  .t-nm { font-size: clamp(1.25rem, 5.5vw, 1.65rem); }",
    ),
    (
        """  .team-scroll-hint::after {
    content: " · Tap a card for bio";
  }
}""",
        f"""  .team-scroll-hint::after {{
    content: " · Tap a card for bio";
  }}
}}

{MARKER}
@media (max-width: 860px) {{
  .team-track {{
    gap: 1.25rem;
  }}
}}
@media (hover: none) and (pointer: coarse) {{
  .tc.tc-open .tc-info,
  .tc:active .tc-info {{
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }}
  .tc.tc-open .tc-bio,
  .tc:hover .tc-bio {{
    padding: 1.4rem 1.2rem 1.15rem;
  }}
  .tc.tc-open .tc-bio-text,
  .tc:hover .tc-bio-text {{
    font-size: 1.05rem;
    line-height: 1.7;
    font-style: normal;
  }}
  .tc.tc-open .tc-bio-inner,
  .tc:hover .tc-bio-inner {{
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 88%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, black 88%, transparent 100%);
  }}
}}""",
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"Pattern not found:\n{old[:100]}...")
    text = text.replace(old, new, 1)

if not text.strip().endswith("</html>"):
    raise SystemExit("index.html truncated")

path.write_text(text, encoding="utf-8")
print("Patched team mobile cards")

#!/usr/bin/env python3
"""Sitewide readable typography: root scale, tokens, overrides, font-size bumps."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ROOT_TOKENS = """  --text-body: clamp(1rem, 0.12vw + 0.95rem, 1.125rem);
  --text-ui: clamp(0.875rem, 0.08vw + 0.82rem, 1rem);
  --text-caption: clamp(0.8125rem, 0.05vw + 0.78rem, 0.9375rem);
  --leading-body: 1.6;
"""

HTML_FONT = """html {
  background: var(--black);
  font-size: clamp(106.25%, 0.35vw + 100%, 125%);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}"""

HTML_FONT_AVTECH = """html {
  background: var(--black);
  scroll-behavior: smooth;
  font-size: clamp(106.25%, 0.35vw + 100%, 125%);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}"""

READABILITY_INDEX = """
/* ── READABILITY / RESPONSIVE TYPE (2026-06) ───────────────── */
.hero-hl-inner,
.intake-info-body,
.intake-role-desc,
.donate-body,
.donate-need-note,
.q-text,
blockquote,
.tc-bio-text,
.pi span,
.cta-p,
.partner-desc,
.fin-intro,
.fin-bar-lbl,
.petition-info-body,
.newsletter-desc {
  font-size: var(--text-body);
  line-height: var(--leading-body);
}
.hero-label,
.nav-sub,
.nav-avtech,
.nav-donate,
.nav-x,
.intake-section-label,
.intake-field label,
.intake-submit,
.intake-secure,
.stat-l,
.partner-name,
.fin-lbl,
.petition-section-label,
.petition-field label,
._newsletter .newsletter-label {
  font-size: var(--text-ui);
}
.footer-designer-credit,
.footer-bar,
.fin-note,
.ct-soc-label {
  font-size: var(--text-caption);
}
"""

READABILITY_AVTECH = """
/* ── READABILITY / RESPONSIVE TYPE (2026-06) ───────────────── */
.hero-sub,
.overview-body,
.problem-body,
.problem-list li,
.solution-body,
.pillar-body,
.step-body,
.why-body,
.start-body,
.provides-body,
.emp-body {
  font-size: var(--text-body);
  line-height: var(--leading-body);
}
.hero-label,
.hero-eyebrow,
.nav-x,
.nav-avtech,
.nav-donate,
.section-eyebrow,
.step-num,
.step-title,
.pillar-title,
.footer-links a,
.sil-label,
.btn-primary,
.btn-ghost {
  font-size: var(--text-ui);
}
.footer-copy,
.start-note {
  font-size: var(--text-caption);
}
"""

BODY_KEYS = (
    "hero-hl-inner",
    "hero-body",
    "intake-info",
    "intake-role-desc",
    "donate-body",
    "donate-need",
    "partner-desc",
    "partner-body",
    "fin-intro",
    "fin-bar-lbl",
    "fin-desc",
    "q-text",
    "blockquote",
    "overview-body",
    "problem-body",
    "problem-list",
    "solution-body",
    "step-body",
    "why-body",
    "pillar-body",
    "start-body",
    "provides-body",
    "emp-body",
    "tc-bio-text",
    "pi span",
    "cta-p",
    "petition-info",
    "newsletter-desc",
    "hero-sub",
    "intake-check",
)

DISPLAY_KEYS = (
    "m-hed",
    "p-hed",
    "ct-hed",
    "stat-n",
    "donate-amt",
    "hero-stat",
    "sol-h",
    "prov-h",
    "step-h",
    "why-h",
    "start-h",
    "emp-h",
    "bebas",
    "t-nm",
    "fin-big",
)


def is_body_context(ctx: str) -> bool:
    c = ctx.lower()
    return any(k in c for k in BODY_KEYS)


def is_display_context(ctx: str) -> bool:
    c = ctx.lower()
    return any(k in c for k in DISPLAY_KEYS)


def round_rem(v: float) -> float:
    return round(v / 0.0125) * 0.0125


def fmt_rem(v: float) -> str:
    v = round_rem(v)
    s = f"{v:.4f}".rstrip("0").rstrip(".")
    if s.startswith("."):
        s = "0" + s
    return f"{s}rem"


def bump_rem_value(v: float, ctx: str) -> float:
    if is_display_context(ctx) and v >= 1.5:
        return v
    body = is_body_context(ctx)
    if body:
        if v >= 1.0:
            return v
        if v < 0.75:
            return 1.0
        bumped = round_rem(v * 1.15)
        return bumped if bumped >= 1.0 else 1.0
    if v >= 0.875:
        return v
    if v < 0.75:
        return 0.875
    bumped = round_rem(v * 1.15)
    return bumped if bumped >= 0.875 else 0.875


def bump_clamp(match: re.Match, ctx: str) -> str | None:
    """Return new clamp(...) value only, or None if unchanged."""
    min_v = float(match.group(1))
    mid = match.group(2)
    max_v = float(match.group(3))
    if is_display_context(ctx) and min_v >= 1.5:
        return None
    body = is_body_context(ctx)
    floor = 1.0 if body else 0.875
    need_hero_floor = "hero-hl-inner" in ctx and min_v < 1.125
    if min_v >= floor and not (body and min_v < 1.0) and not need_hero_floor:
        return None
    if min_v < 0.75:
        new_min = floor
    elif min_v < floor:
        new_min = floor
    else:
        new_min = round_rem(min_v * 1.15)
        if body and new_min < 1.0:
            new_min = 1.0
        if not body and new_min < 0.875:
            new_min = 0.875
    if need_hero_floor:
        new_min = max(new_min, 1.125)
    if abs(new_min - min_v) < 0.0001:
        return None
    max_v = round_rem(max(max_v, new_min * 1.15))
    return f"clamp({fmt_rem(new_min)}, {mid}, {fmt_rem(max_v)})"


def bump_font_sizes_in_style(style: str) -> tuple[str, int]:
    lines = style.split("\n")
    out: list[str] = []
    ctx_stack: list[str] = []
    changes = 0

    for line in lines:
        stripped = line.strip()
        line_ctx = " ".join(ctx_stack)
        if "{" in stripped:
            sel = stripped.split("{")[0].strip()
            if sel and not sel.startswith("@") and not sel.startswith("/*"):
                line_ctx = (line_ctx + " " + sel).strip()
                if "}" not in stripped:
                    ctx_stack.append(sel)

        if "font-size" in line and "var(--text-" not in line:
            ctx = line_ctx
            original = line

            def repl_rem(m: re.Match) -> str:
                nonlocal changes
                v = float(m.group(1))
                new_v = bump_rem_value(v, ctx)
                if abs(new_v - v) > 0.0001:
                    changes += 1
                return f"font-size: {fmt_rem(new_v)}"

            line = re.sub(
                r"font-size:\s*([\d.]+)rem",
                repl_rem,
                line,
                count=1,
            )

            def repl_clamp(m: re.Match) -> str:
                nonlocal changes
                bumped = bump_clamp(m, ctx)
                if bumped is None:
                    return m.group(0)
                changes += 1
                return f"font-size: {bumped}"

            line = re.sub(
                r"font-size:\s*clamp\(\s*([\d.]+)rem\s*,\s*([^,]+)\s*,\s*([\d.]+)rem\s*\)",
                repl_clamp,
                line,
                count=1,
            )

        if "}" in stripped:
            if ctx_stack:
                ctx_stack.pop()

        out.append(line)

    return "\n".join(out), changes


def patch_file(path: Path, readability: str, html_font: str) -> None:
    text = path.read_text(encoding="utf-8")
    original = text

    if "--text-body:" not in text:
        text = text.replace(
            "  --ease-film: cubic-bezier(0.16, 1, 0.3, 1);\n}",
            "  --ease-film: cubic-bezier(0.16, 1, 0.3, 1);\n"
            + ROOT_TOKENS
            + "}",
            1,
        )

    if "font-size: clamp(106.25%" not in text:
        if path.name == "win-avtech.html":
            text = re.sub(
                r"html \{ background: var\(--black\); scroll-behavior: smooth; \}",
                html_font,
                text,
                count=1,
            )
        else:
            text = re.sub(
                r"html \{ background: var\(--black\); \}",
                html_font,
                text,
                count=1,
            )

    marker = "/* ── READABILITY / RESPONSIVE TYPE (2026-06) ───────────────── */"
    if marker not in text:
        if path.name == "index.html":
            text = text.replace(
                "\n/* Mobile */\n@media (max-width: 540px) {",
                readability + "\n/* Mobile */\n@media (max-width: 540px) {",
                1,
            )
        else:
            text = text.replace(
                "\n/* ── RESPONSIVE ──────────────────────────────────────────────── */\n@media (max-width: 980px) {",
                readability + "\n/* ── RESPONSIVE ──────────────────────────────────────────────── */\n@media (max-width: 980px) {",
                1,
            )

    m = re.search(r"(<style>)(.*?)(</style>)", text, re.DOTALL)
    if not m:
        raise SystemExit(f"No <style> in {path}")
    style = m.group(2)
    new_style, n = bump_font_sizes_in_style(style)
    text = text[: m.start(2)] + new_style + text[m.end(2) :]

    # Mobile intake labels/checkboxes — 16px floor
    mobile_floor = """
  .intake-field label,
  .intake-check,
  .intake-role-desc,
  .intake-section-label {
    font-size: max(var(--text-ui), 1rem);
  }
"""
    if "max(var(--text-ui), 1rem)" not in text and path.name == "index.html":
        text = text.replace(
            "  .intake-check {\n    min-height: 44px;",
            mobile_floor + "  .intake-check {\n    min-height: 44px;",
            1,
        )

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"✓ {path.name} — {n} font-size adjustment(s)")
    else:
        print(f"· {path.name} — already up to date")

    # Mobile hero body: never shrink below readable minimum
    if path.name == "index.html":
        text = path.read_text(encoding="utf-8")
        text2 = text.replace(
            ".hero-hl-inner { font-size: clamp(1.0625rem, 4vw, 1.4625rem); }",
            ".hero-hl-inner { font-size: clamp(1.125rem, 4vw, 1.4625rem); }",
        ).replace(
            ".hero-hl-inner { font-size: clamp(0.9825rem, 4.5vw, 1.1625rem); line-height: 1.6; }",
            ".hero-hl-inner { font-size: clamp(1.125rem, 4.5vw, 1.35rem); line-height: 1.6; }",
        )
        if text2 != text:
            path.write_text(text2, encoding="utf-8")
            print(f"  ↳ {path.name} — mobile hero floor raised")


def main() -> None:
    patch_file(ROOT / "index.html", READABILITY_INDEX, HTML_FONT)
    patch_file(ROOT / "win-avtech.html", READABILITY_AVTECH, HTML_FONT_AVTECH)


if __name__ == "__main__":
    main()

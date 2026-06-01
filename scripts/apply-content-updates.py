#!/usr/bin/env python3
"""Nav logo, A&P Pathway label, AvTech intake links, donate tier, donate CTA."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
INTAKE_URL = (
    "https://warriorsinneed.org/#:~:text=a%20veteran%20or-,transitioning,-service%20member."
)
DONATE_URL = (
    "https://givebutter.com/WIN-General-Donation-Page"
    "?_gl=1*af2t6l*_ga*MTYwNzgwMDc5OS4xNzc1NzY2MDk5*_ga_29528SEPCL"
    "*czE3NzgwMjQ2MjckbzI0JGcxJHQxNzc4MDI0NjM0JGo2MCRsMCRoMTg2NDA3Mjk4OQ.."
)

NAV_LOGO_CSS = """
.nav-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}
.nav-logo {
  height: 38px;
  width: auto;
  display: block;
}
a.donate-cta-bar {
  text-decoration: none;
  cursor: pointer;
  transition: border-color .3s, background .3s;
}
a.donate-cta-bar:hover {
  border-color: rgba(173,194,42,.45);
  background: rgba(173,194,42,.06);
}
"""

INDEX_NAV_OLD = """<nav id="nav">
  <div class="nav-wm">
    <span class="nav-win">WIN</span>
    <span class="nav-sub">Warriors In Need</span>
  </div>
  <div class="nav-right">
    <a href="/win-stories/win-avtech.html" class="nav-avtech">AvTech Exams</a>"""

INDEX_NAV_NEW = """<nav id="nav">
  <a href="/" class="nav-logo-link" aria-label="Warriors In Need home">
    <img src="/assets/images/win-logo-nav.png" alt="Warriors In Need" class="nav-logo" width="173" height="76" />
  </a>
  <div class="nav-right">
    <a href="/win-stories/win-avtech.html" class="nav-avtech">A&amp;P Pathway</a>"""

DONATE_CTA_OLD = """      <div class="donate-cta-bar">
        <span class="donate-star">★</span>
        <span class="donate-cta-text">Every gift moves a veteran forward.</span>
      </div>"""

DONATE_CTA_NEW = f"""      <a href="{DONATE_URL}" target="_blank" rel="noopener" class="donate-cta-bar">
        <span class="donate-star">★</span>
        <span class="donate-cta-text">Every Gift Moves a Veteran forward</span>
      </a>"""

CERT_BARRIER_OLD = (
    '<div class="donate-tier-amount olive" data-target="6000" data-prefix="$">$6,000</div>\n'
    '          <div class="donate-tier-label">Help Remove<br>Certification Barriers</div>'
)
CERT_BARRIER_NEW = (
    '<div class="donate-tier-amount olive" data-target="6500" data-prefix="$">$6,500</div>\n'
    '          <div class="donate-tier-label">Help Remove<br>Certification Barriers</div>'
)

AVTECH_NAV_OLD = """<nav id="sitenav">
  <a class="nav-brand" href="https://warriorsinneed.org/">
    <span class="nav-win">WIN</span>
    <span class="nav-x">×</span>
    <span class="nav-avtech">AvTech</span>
  </a>
  <a href="https://warriorsinneed.org/#intake" class="nav-cta">Start Your Intake</a>
</nav>"""

AVTECH_NAV_NEW = f"""<nav id="sitenav">
  <a class="nav-logo-link" href="https://warriorsinneed.org/" aria-label="Warriors In Need home">
    <img src="/assets/images/win-logo-nav.png" alt="Warriors In Need" class="nav-logo" width="173" height="76" />
  </a>
  <a href="{INTAKE_URL}" class="nav-cta">Start Your Intake</a>
</nav>"""

START_SECTION_RE = re.compile(
    r"\n<!-- ══ START YOUR PATH ══.*?</section>\n\n<!-- ══ EMPLOYERS",
    re.DOTALL,
)
START_SECTION_REPL = (
    "\n<!-- ══ EMPLOYERS"
)


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")

    if ".nav-logo-link" not in text:
        text = text.replace(
            ".nav-avtech:hover { color: #d7ef45; opacity: 1; }\n",
            ".nav-avtech:hover { color: #d7ef45; opacity: 1; }\n" + NAV_LOGO_CSS,
            1,
        )

    for old, new in [
        (INDEX_NAV_OLD, INDEX_NAV_NEW),
        (DONATE_CTA_OLD, DONATE_CTA_NEW),
        (CERT_BARRIER_OLD, CERT_BARRIER_NEW),
    ]:
        if old not in text:
            raise SystemExit(f"index.html: block not found:\n{old[:60]}...")
        text = text.replace(old, new, 1)

    if not text.strip().endswith("</html>"):
        raise SystemExit("index.html truncated")
    path.write_text(text, encoding="utf-8")
    print("Patched index.html")


def patch_avtech() -> None:
    path = ROOT / "win-avtech.html"
    text = path.read_text(encoding="utf-8")

    if ".nav-logo-link" not in text:
        text = text.replace(
            ".nav-cta:hover::before { transform: scaleX(1); }\n",
            ".nav-cta:hover::before { transform: scaleX(1); }\n" + NAV_LOGO_CSS,
            1,
        )

    if AVTECH_NAV_OLD not in text:
        raise SystemExit("win-avtech.html: nav block not found")
    text = text.replace(AVTECH_NAV_OLD, AVTECH_NAV_NEW, 1)

    text = text.replace('href="#start"', f'href="{INTAKE_URL}"')
    text = text.replace("https://warriorsinneed.org/#intake", INTAKE_URL)
    text = text.replace("https://warriorsinneed.org#intake", INTAKE_URL)

    if not START_SECTION_RE.search(text):
        raise SystemExit("win-avtech.html: #start section not found")
    text = START_SECTION_RE.sub(START_SECTION_REPL, text, count=1)

    path.write_text(text, encoding="utf-8")
    print("Patched win-avtech.html")


def main() -> None:
    patch_index()
    patch_avtech()


if __name__ == "__main__":
    main()

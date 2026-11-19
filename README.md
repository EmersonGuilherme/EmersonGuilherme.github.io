# Emerson Guilherme da Silva — Quality Engineering Portfolio

Bilingual (English / Brazilian Portuguese), responsive static portfolio for GitHub Pages. The website uses native HTML, CSS, SVG and JavaScript. No backend, API keys, analytics, CDN or paid dependencies are required.

## Contents

- `index.html` — portfolio, selected career history, real public project links and four labs.
- `style.css` — responsive visual system, dark/light themes, reduced-motion and print layout.
- `script.js` — translations, theme, keyboard-accessible tabs, deterministic local assertions, synthetic performance generation, SVG charts and evidence export.
- `favicon.svg`, `404.html`, `.nojekyll` — site assets and Pages configuration.

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Alternatively, open `index.html` directly in a modern browser with the remaining files in the same directory.

## Deploy to the existing GitHub Pages repository

The deployment source already has a history. Keep it intact: create a branch (e.g. `portfolio-v3`) from `main`, upload these files to the **repository root**, commit, open a pull request and merge after review. Existing `demos.js` is unused by the new site and can be left in place. Do not change GitHub Pages settings if deployment already works; otherwise use Settings → Pages → Deploy from a branch → `main` / `/(root)`.

The site will be served at https://emersonguilherme.github.io/ once GitHub Pages deploys the merged commit.

## Data and evidence policy

- Employment periods deliberately avoid incompatible month/year details across CVs: Itaú 2025–2026, AB InBev ending in 2025. Confirm the exact start/end dates before expanding them. The English CV lists another Itaú start year and other CVs differ on BEES start dates.
- LinkedIn uses the URL common to three versions of the CV. The mobile CV uses a different slug; confirm current link if necessary.
- Email is taken from the CVs; phone and full CV attachments are not published. The architecture graphics are original illustrative vectors, not photos or employer diagrams.
- The ServeRest API automation and two Guimi repositories were found on GitHub. No CI result, production readiness, customer KPI, security certification, or commercial traction is claimed. Guimi is labeled as in development.
- Labs execute browser-local checks on fictional fixtures: Kafka/Avro-like rules (not Avro serialization), performance using a seeded synthetic sample (not a real load test), API fixture assertions (not HTTP calls), and AI response keyword checks (not an LLM judge).
- Evidence JSON records assertion results and metadata, not raw input values. Only limited non-text observations are included; do not enter private or confidential data.

## Browser checks

Open each tab, exercise valid and invalid inputs, switch English/Portuguese and light/dark, and download the JSON output. Check at narrow and wide viewports. The print button opens the browser's print dialog so the content can be saved as PDF.

## Verification performed

The portfolio and all four labs were exercised in Chromium using inline copies of the checked-in CSS/JS, including positive/negative checks, keyboard tab navigation, translations, theme switching and JSON download; viewport widths 320, 390, 768 and 1440 px were checked for horizontal overflow. GitHub deployment was not performed: the repository connection denied branch creation.

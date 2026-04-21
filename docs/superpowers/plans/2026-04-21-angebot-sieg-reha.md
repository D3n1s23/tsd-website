# Angebotsseite Sieg Reha GmbH — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected, AES-encrypted HTML pitch page for Sieg Reha GmbH at `/angebote/sieg-reha.html` with four modules (Website-Relaunch, Recruiting-Paket, Kreativ-Retainer, optional GEO-Audit) and a new value-comparison section that anchors TSD's prices against inhouse + agency alternatives.

**Architecture:** Reuse the existing encrypted-offer infrastructure from the Weinfreunde build. Parametrize `tools/encrypt-offer.js` to handle multiple offers via a config array + optional CLI filter. The Sieg-Reha content is written by copying the Weinfreunde content file as a styling foundation and then replacing section HTML. The only fully-new section is `09 — Kosten im Vergleich` (3-column comparison card grid + closing quote).

**Tech Stack:** Plain HTML/CSS/JS, Inter + Playfair Display, Node.js `crypto` (build-time), Web Crypto API (browser-side decrypt).

**Reference spec:** `docs/superpowers/specs/2026-04-21-angebot-sieg-reha-design.md`

---

## File Structure

```
/
├── .gitignore                                        # MODIFY: tools/offer-content-*.html
├── angebote/
│   ├── rewe-wein-online.html                         # EXISTING, unverändert
│   └── sieg-reha.html                                # NEW — verschlüsselter Artefakt (committed)
└── tools/
    ├── offer-template.html                           # EXISTING, unverändert
    ├── encrypt-offer.js                              # MODIFY: Config-Array + CLI-Filter
    ├── test-encryption.js                            # EXISTING, unverändert (encrypt()-Signatur bleibt)
    ├── offer-content.html                            # RENAME → offer-content-rewe-wein-online.html (gitignored)
    └── offer-content-sieg-reha.html                  # NEW (gitignored) — Klartext-Angebot Sieg Reha
```

**Responsibilities:**
- `tools/encrypt-offer.js`: Liest Template + Content, verschlüsselt, schreibt Output. **Nach Refactor**: iteriert über Config-Array (alle Offers) oder filtert auf einen Slug via CLI-Arg.
- `tools/offer-content-sieg-reha.html`: Pure body markup für Sieg Reha (11 Sektionen). Plaintext, gitignored.
- `angebote/sieg-reha.html`: Generierter Artefakt, verschlüsselter Body + Decrypt-JS. Committed, damit GitHub Pages ausliefert.
- `.gitignore`: Pattern `tools/offer-content-*.html` ignoriert alle künftigen Klartext-Angebote.

---

## Task 1: Parametrize `tools/encrypt-offer.js` (Config-Array + CLI-Filter)

**Files:**
- Modify: `tools/encrypt-offer.js`

**Hintergrund:** Das Script ist aktuell hartcodiert auf den Weinfreunde-Build. Wir führen eine Offer-Registry ein, die am Ende der Datei iteriert wird. Die `encrypt()`- und `build()`-Funktionen bleiben API-identisch — nur die CLI-Logik am Bottom wird getauscht. Das bestehende `test-encryption.js` testet nur `encrypt()` und muss nicht geändert werden.

- [ ] **Step 1: Run existing test to confirm baseline is green**

Run: `node tools/test-encryption.js`
Expected: `PASS: encryption round-trip works, wrong-password rejection works`

- [ ] **Step 2: Replace the CLI block at the bottom of `tools/encrypt-offer.js`**

Open `tools/encrypt-offer.js`. Replace the block starting at `if (require.main === module) {` (currently line ~43) with the new config-array logic.

Old block (to remove):

```js
if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  build({
    templatePath: path.join(root, 'tools/offer-template.html'),
    contentPath: path.join(root, 'tools/offer-content.html'),
    outputPath: path.join(root, 'angebote/rewe-wein-online.html'),
    password: 'rewewein',
  });
}
```

New block (to insert in its place):

```js
const OFFERS = [
  { slug: 'rewe-wein-online', password: 'rewewein' },
  { slug: 'sieg-reha',        password: 'siegreha' },
];

function pathsFor(root, slug) {
  return {
    templatePath: path.join(root, 'tools/offer-template.html'),
    contentPath:  path.join(root, `tools/offer-content-${slug}.html`),
    outputPath:   path.join(root, `angebote/${slug}.html`),
  };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const filter = process.argv[2]; // optional slug
  const selected = filter ? OFFERS.filter(o => o.slug === filter) : OFFERS;

  if (filter && selected.length === 0) {
    console.error(`Unknown slug "${filter}". Available: ${OFFERS.map(o => o.slug).join(', ')}`);
    process.exit(1);
  }

  for (const offer of selected) {
    const paths = pathsFor(root, offer.slug);
    if (!fs.existsSync(paths.contentPath)) {
      console.warn(`Skipping ${offer.slug}: ${paths.contentPath} not found (expected if content is gitignored and not yet created locally)`);
      continue;
    }
    build({ ...paths, password: offer.password });
  }
}
```

- [ ] **Step 3: Verify the module exports are unchanged**

Read `tools/encrypt-offer.js` lines 40-45 area. Confirm the line `module.exports = { encrypt, build };` is still present (it was above the CLI block, so should be untouched).

- [ ] **Step 4: Run the round-trip test again**

Run: `node tools/test-encryption.js`
Expected: `PASS: encryption round-trip works, wrong-password rejection works`

(The test imports `{ encrypt }` — API surface unchanged, so still passes.)

- [ ] **Step 5: Dry-run the script without args (content files don't exist yet after rename) to verify the "skip" path**

Run: `node tools/encrypt-offer.js`
Expected: Two "Skipping" warnings (both `rewe-wein-online` and `sieg-reha`, because content files haven't been renamed/created yet). No errors, exit code 0.

*Note: After Task 2 renames the Weinfreunde content file, the script will build Weinfreunde cleanly again.*

- [ ] **Step 6: Commit**

```bash
git add tools/encrypt-offer.js
git commit -m "$(cat <<'EOF'
Parametrize encrypt-offer.js for multiple offers

Adds OFFERS registry and optional CLI slug filter. Content path
follows convention tools/offer-content-<slug>.html, output follows
angebote/<slug>.html. Missing content files are warned and skipped
(non-fatal) so the build doesn't break when a slug is gitignored
and not checked out locally.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Rename Weinfreunde Content + Update `.gitignore` + Verify Rebuild

**Files:**
- Rename: `tools/offer-content.html` → `tools/offer-content-rewe-wein-online.html` (local only, both paths gitignored)
- Modify: `.gitignore`

- [ ] **Step 1: Rename the local Weinfreunde content file**

Run: `mv tools/offer-content.html tools/offer-content-rewe-wein-online.html`

(This file is gitignored — git won't track the rename. Both the old and new paths are ignored.)

- [ ] **Step 2: Verify file moved**

Run: `ls tools/offer-content*.html`
Expected: Only `tools/offer-content-rewe-wein-online.html` (no `tools/offer-content.html`).

- [ ] **Step 3: Update `.gitignore` pattern**

Open `.gitignore`. Replace the line `tools/offer-content.html` with `tools/offer-content-*.html`.

After the change, `.gitignore` should contain:

```
.DS_Store
tools/offer-content-*.html
```

- [ ] **Step 4: Verify the new pattern ignores the renamed file**

Run: `git status --short tools/`
Expected: No changes listed under `tools/` (the renamed file is still ignored by the new glob pattern).

Run: `git check-ignore -v tools/offer-content-rewe-wein-online.html`
Expected output shows it's ignored, referencing the new pattern line.

- [ ] **Step 5: Rebuild the Weinfreunde offer with the parametrized script**

Run: `node tools/encrypt-offer.js rewe-wein-online`
Expected: `Wrote /.../angebote/rewe-wein-online.html (NNNNN bytes)` — NNNNN should be in the 60k range (the original file was 61.076 bytes; minor variance OK due to new random salt/IV).

- [ ] **Step 6: Verify Weinfreunde artifact is valid**

Run: `wc -c angebote/rewe-wein-online.html`
Expected: File size > 50000 bytes.

Run: `grep -c "ENCRYPTED PAYLOAD" angebote/rewe-wein-online.html`
Expected: `1`

Run: `grep -c "noindex, nofollow, noarchive" angebote/rewe-wein-online.html`
Expected: `1`

- [ ] **Step 7: Smoke-test the Weinfreunde artifact in the browser (manual)**

Open `angebote/rewe-wein-online.html` in a browser (e.g. `open angebote/rewe-wein-online.html` on macOS). The TSD login overlay must appear. Enter password `rewewein`. The full 9-section Weinfreunde offer must render. Wrong passwords must show the inline error.

Acceptance: full Weinfreunde content visible after correct password, nothing visible before.

- [ ] **Step 8: Commit (only .gitignore + the re-encrypted artifact, NOT the renamed plaintext file)**

```bash
git add .gitignore angebote/rewe-wein-online.html
git commit -m "$(cat <<'EOF'
Generalize .gitignore pattern for offer content files

Switch from tools/offer-content.html to tools/offer-content-*.html
so multiple offers (sieg-reha, future clients) are all ignored
without further .gitignore edits.

Also rebuilds the Weinfreunde artifact from the renamed content
file (tools/offer-content-rewe-wein-online.html). New random
salt/IV — same decrypted payload.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Scaffold Sieg-Reha Content (Copy + Update Header/Hero/Über TSD)

**Files:**
- Create: `tools/offer-content-sieg-reha.html` (gitignored, starts as copy of Weinfreunde)

- [ ] **Step 1: Copy the Weinfreunde content as styling foundation**

Run: `cp tools/offer-content-rewe-wein-online.html tools/offer-content-sieg-reha.html`

The CSS (containers, header, theme toggle, sections, module cards, pills, etc.) is reusable 1:1. We will now replace content section-by-section.

- [ ] **Step 2: Update header meta + lockup partner mark**

In `tools/offer-content-sieg-reha.html`, find the `<header class="offer-header">` block and replace the `partner-mark` + `meta` as follows:

Old:

```html
      <span class="partner-mark">Weinfreunde</span>
    </div>
    <span class="meta">Stand 20. April 2026 · Gültig bis 20. Juli 2026</span>
```

New:

```html
      <span class="partner-mark">Sieg Reha</span>
    </div>
    <span class="meta">Stand 21. April 2026 · Gültig bis 21. Juli 2026</span>
```

- [ ] **Step 3: Update the Hero section (01)**

Find `<!-- ============= 01 — HERO =============` and replace the `.hero` block through the closing `</section>` with:

```html
<!-- ============= 01 — HERO ============= -->
<section class="hero">
  <div class="container">
    <div class="overline">Angebot für Sieg Reha GmbH</div>
    <h1>Marketing- &amp; Kreativ-Infrastruktur für <em>Sieg Reha</em></h1>
    <p class="lead">
      Lieber Herr Köpke, vielen Dank für das Interesse an einer Zusammenarbeit. Auf den folgenden Seiten finden Sie unsere Analyse Ihres aktuellen Marken-Setups und drei konkrete Leistungsmodule — plus einen optionalen strategischen Baustein —, die wir auf Basis dieser Analyse für Sieg Reha vorschlagen.
    </p>
    <div class="meta-pills">
      <span class="pill">Website-Relaunch</span>
      <span class="pill">Recruiting &amp; Social</span>
      <span class="pill">Kreativ-Retainer</span>
      <span class="pill">GEO-Audit (optional)</span>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Update Section 02 — Über TSD (only the third card's content changes)**

Find `<!-- ============= 02 — KONTEXT / ÜBER TSD =============`. Keep the `section-head` (the universal TSD value-prop) and the first two `.kontext-card` entries (Disziplinen + Schnittstelle) exactly as they are in the copied Weinfreunde file.

Replace **only the third `.kontext-card`** (currently `<span class="tag">Ansatz</span>` + „Erst messen, dann bauen"):

Old (to replace):

```html
      <div class="kontext-card">
        <span class="tag">Ansatz</span>
        <h3>Erst messen, dann bauen</h3>
        <p>Bevor wir produzieren, schauen wir hin. Welche Assets ziehen, wo sind blinde Flecken, welche Workflows lassen sich automatisieren?</p>
      </div>
```

New (Sieg-Reha-spezifische dritte Spalte — „externe Kreativ-Infrastruktur" statt „erst messen"):

```html
      <div class="kontext-card">
        <span class="tag">Ansatz</span>
        <h3>Externe Kreativ-Infrastruktur</h3>
        <p>Für Einrichtungen ohne eigenes Marketing-Team bedeutet das: eine externe Kreativ-Ressource, die wie ein Inhouse-Team wirkt — strategisch, visuell und operativ.</p>
      </div>
```

Cards 1 (Disziplinen · „Vier Layer, ein Studio") und 2 (Schnittstelle · „Marke trifft Technologie") bleiben **unverändert** — beide Aussagen sind universell und passen auch für Sieg Reha.

- [ ] **Step 5: Build and eyeball-test Sections 01–02**

Run: `node tools/encrypt-offer.js sieg-reha`
Expected: `Wrote /.../angebote/sieg-reha.html (NNNNN bytes)`

Open `angebote/sieg-reha.html` in browser. Enter password `siegreha`. Hero should show „Marketing- & Kreativ-Infrastruktur für *Sieg Reha*" with Herr-Köpke-Anrede, Über-TSD section with the new Spalte-3 text. Everything from Section 03 onwards is still Weinfreunde content — that's expected, we replace it in the next tasks.

Do NOT commit the generated artifact yet — we rebuild at the end (Task 11).

---

## Task 4: Sections 03 (Bedarfsanalyse) + 04 (Handlungsempfehlungen)

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

- [ ] **Step 1: Replace Section 03 — Bedarfsanalyse (4 Insight-Cards, Sieg-Reha-spezifisch)**

Find `<!-- ============= 03 — BEDARFSANALYSE =============` in `tools/offer-content-sieg-reha.html`. Replace the entire section through its closing `</section>` with:

```html
<!-- ============= 03 — BEDARFSANALYSE ============= -->
<section class="section" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">03 — Was wir gesehen haben</span>
      <h2>Vier Beobachtungen zu Sieg Reha — und ein Hebel, der heute fehlt.</h2>
      <p>Grundlage sind öffentlich zugängliche Quellen: Website, Karriere-Portal, Leistungsseiten und das Impressum.</p>
    </div>
    <div class="insights-grid">
      <div class="insight-card">
        <div class="insight-num">Insight 01</div>
        <h3>Starke Substanz, digital noch nicht auf Augenhöhe</h3>
        <p>QMS-Reha-Zertifizierung, zwei eigene Berufsfachschulen, Spezialgeräte wie Armeo und Lokomat — die Qualität vor Ort ist hoch. Die digitale Marke transportiert das noch nicht vollständig: Farben, Kontrast und Lesbarkeit der Website lassen Potenzial liegen.</p>
        <a class="source-link" href="https://siegreha.de/" target="_blank" rel="noopener">Quelle: siegreha.de →</a>
      </div>
      <div class="insight-card">
        <div class="insight-num">Insight 02</div>
        <h3>Recruiting-Druck trifft auf eigenen Ausbildungs-Funnel</h3>
        <p>Sechs Standorte, zwei Berufsfachschulen (Physio + Ergo), Auslandspraktika, FSJ, Azubi-Blog. Employer-Brand-Arbeit verstärkt diesen organischen Funnel messbar und zahlt gleichzeitig auf Fachkraft-Recruiting ein.</p>
        <a class="source-link" href="https://siegreha.de/karriere/" target="_blank" rel="noopener">Quelle: siegreha.de/karriere →</a>
      </div>
      <div class="insight-card">
        <div class="insight-num">Insight 03</div>
        <h3>Multi-Stakeholder-Kommunikation</h3>
        <p>Parallel angesprochen werden Patient:innen (Leistungssuche), Kostenträger (DRV, Krankenkassen; RV-Fit), Mitarbeitende (Kultur, Fortbildung) und Angehörige. Jede Gruppe braucht eigene Sprache und einen eigenen visuellen Pfad.</p>
        <a class="source-link" href="https://siegreha.de/service/" target="_blank" rel="noopener">Quelle: siegreha.de/service →</a>
      </div>
      <div class="insight-card">
        <div class="insight-num">Insight 04</div>
        <h3>Technologie-Wandel in der Patient Journey</h3>
        <p>Zunehmend wird vor dem Arztbesuch in KI-Chats recherchiert — „Reha nach Knie-OP", „Physio Hennef", „Was zahlt die DRV?". Sichtbarkeit in diesen Antworten wird zum neuen SEO — parallel zum klassischen Google-Ranking.</p>
        <span class="source-link">Quelle: Eigenes TSD-Monitoring</span>
      </div>
    </div>
    <div class="insight-teaser">
      <strong>Eine fünfte Dimension fehlt heute in vielen Gesundheits-Setups:</strong> die Sichtbarkeit in KI-Antworten (ChatGPT, Claude, Gemini, Perplexity). Gesundheit ist eine Beratungs-Kategorie — die Recherche wandert dort hin. Mehr dazu in Sektion 08.
    </div>
  </div>
</section>
```

*Note:* The `insights-grid`, `insight-card`, `insight-num`, `source-link`, `insight-teaser` classes already exist in the copied CSS (inherited 1:1 from Weinfreunde). The section uses inline `background: var(--bg-darker)` for the alternating-section pattern — this is the established convention (not CSS-variables or data-attributes).

- [ ] **Step 2: Replace Section 04 — Handlungsempfehlungen (3-Spalten-Roadmap)**

Find `<!-- ============= 04 — HANDLUNGSEMPFEHLUNGEN =============` and replace through its closing `</section>` with:

```html
<!-- ============= 04 — HANDLUNGSEMPFEHLUNGEN ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">04 — Was wir empfehlen</span>
      <h2>Drei Horizonte, drei klare nächste Schritte.</h2>
      <p>Aus den Insights ergibt sich eine Roadmap, die nicht alles auf einmal will — sondern erst Grundlage schafft, dann Sichtbarkeit, dann strategisch skaliert.</p>
    </div>
    <div class="roadmap">
      <div class="roadmap-step">
        <div class="horizon">1</div>
        <div class="horizon-label">Sofort · 1–4 Wochen</div>
        <h3>Discovery &amp; Audit</h3>
        <p>Workshop mit Geschäftsleitung, Stakeholder-Mapping, Analyse der bestehenden Website und Kanäle. Ergebnis: priorisierter Fahrplan für Relaunch und Recruiting.</p>
        <span class="ref">→ Sektion 05</span>
      </div>
      <div class="roadmap-step">
        <div class="horizon">2</div>
        <div class="horizon-label">Mittelfristig · Q3 2026</div>
        <h3>Relaunch &amp; Recruiting-Start</h3>
        <p>Neue Website live, Employer-Brand-Basis und erste Recruiting-Kampagne. Klare Nutzerpfade für Patient:innen, Bewerber:innen, Kostenträger.</p>
        <span class="ref">→ Sektion 05 + 06</span>
      </div>
      <div class="roadmap-step">
        <div class="horizon">3</div>
        <div class="horizon-label">Strategisch · H2 2026+</div>
        <h3>Kreativ-Retainer &amp; GEO</h3>
        <p>Kontinuierliche Content-Pipeline für Social, Blog, Standort-Kampagnen; optional GEO-Audit für KI-Sichtbarkeit in der Patient Journey.</p>
        <span class="ref">→ Sektion 07 + 08</span>
      </div>
    </div>
  </div>
</section>
```

*Note:* `roadmap`, `roadmap-step`, `horizon`, `horizon-label`, `ref` already exist in CSS from Weinfreunde — structure is identical to Weinfreunde's Section 04, only the content changes.

- [ ] **Step 3: Rebuild and spot-check**

Run: `node tools/encrypt-offer.js sieg-reha`
Open in browser, enter password, scroll to Sections 03 + 04. Confirm:
- Section 03 shows 4 green-accented cards with Sieg-Reha-content + links to `siegreha.de` subpages
- Section 04 shows 3 blue-accented roadmap steps with Sofort/Mittelfristig/Strategisch timing labels

---

## Task 5: Section 05 — Leistung 1: Website-Relaunch (replaces Weinfreunde „Creative Assets")

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

**Hintergrund:** Sektion 05 wird inhaltlich komplett neu. Strukturell übernehmen wir die Weinfreunde-Leistung-1 (3-Card-Vergleich mit `.assets-grid > .asset-card` + `.asset-card.featured` für die letzte Karte). Die Weinfreunde-Variante nutzt `<ul><li>` für Feature-Listen, `.price` + `.price-meta` für Preisdarstellung und `.asset-types-block > .label + .pills > .pill` für die abschließenden Pills. Alle CSS-Klassen existieren bereits im kopierten File.

- [ ] **Step 1: Replace Section 05 — Website-Relaunch**

Find `<!-- ============= 05 — LEISTUNG 1` (the Creative-Assets section in the Weinfreunde source). Replace the entire section through its closing `</section>` with:

```html
<!-- ============= 05 — LEISTUNG 1: WEBSITE-RELAUNCH ============= -->
<section class="section" id="leistung-1" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">05 — Leistung 1</span>
      <h2>Website-Relaunch — auf Augenhöhe mit der Qualität vor Ort.</h2>
    </div>
    <p class="service-intro">Fokus: Accessibility (WCAG 2.2 AA), kontrastsichere Typografie, klare Nutzerpfade für die vier Stakeholder-Gruppen — Patient:innen, Bewerber:innen, Kostenträger, Angehörige. Drei Phasen, jede einzeln buchbar.</p>

    <div class="assets-grid">
      <div class="asset-card">
        <div class="asset-overline">Phase 1 · Discovery</div>
        <h3>Discovery-Workshop</h3>
        <div class="price">€3.500</div>
        <div class="price-meta">fix · netto · 1,5 Tage vor Ort + Doku</div>
        <ul>
          <li>Workshop mit Geschäftsleitung und Stakeholdern</li>
          <li>Stakeholder-Mapping: Patient · Bewerber · Kostenträger · Angehörige</li>
          <li>Content-Audit der bestehenden Seite</li>
          <li>Priorisiertes Briefing-Dokument als Ergebnis</li>
        </ul>
      </div>
      <div class="asset-card">
        <div class="asset-overline">Phase 2 · Design</div>
        <h3>Design-Phase</h3>
        <div class="price">€9.000 – 14.000</div>
        <div class="price-meta">netto · 3–4 Wochen</div>
        <ul>
          <li>Neues Designsystem (Farben, Typografie, Komponenten)</li>
          <li>Accessibility-Konzept auf WCAG-2.2-AA-Niveau</li>
          <li>Key Templates: Start · Service · Standort · Karriere · Blog</li>
          <li>Klickbarer Prototyp für Abstimmung und Test</li>
        </ul>
      </div>
      <div class="asset-card featured">
        <span class="asset-badge">Hauptphase</span>
        <div class="asset-overline">Phase 3 · Build</div>
        <h3>Build &amp; Go-Live</h3>
        <div class="price">€13.000 – 22.000</div>
        <div class="price-meta">netto · 4–6 Wochen</div>
        <ul>
          <li>CMS-Umsetzung, alle Standort-Pages, Karriere-Bereich</li>
          <li>Content-Migration aus der bestehenden Site</li>
          <li>SEO-Basis und saubere Redirect-Matrix</li>
          <li>Go-Live-Support inkl. Monitoring in den ersten Wochen</li>
        </ul>
      </div>
    </div>

    <div class="asset-types-block">
      <div class="label">Bausteine im Lieferumfang</div>
      <div class="pills">
        <span class="pill">Accessibility-Konzept</span>
        <span class="pill">Designsystem</span>
        <span class="pill">Klickprototyp</span>
        <span class="pill">CMS-Umsetzung</span>
        <span class="pill">Standort-Pages</span>
        <span class="pill">Karriere-Flow</span>
        <span class="pill">Content-Migration</span>
        <span class="pill">Redirect-Matrix</span>
        <span class="pill">SEO-Basis</span>
        <span class="pill">Go-Live-Support</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Rebuild and spot-check**

Run: `node tools/encrypt-offer.js sieg-reha`. Open in browser, navigate to Section 05. Confirm 3 purple-accented phase cards (Discovery €3.500 fix · Design €9k–14k · Build €13k–22k featured) and asset-pill row underneath.

---

## Task 6: Section 06 — Leistung 2: Recruiting &amp; Social-Paket

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

- [ ] **Step 1: Replace Section 06 — Recruiting-Paket (originally Weinfreunde's GEO-Audit slot)**

Find `<!-- ============= 06 — LEISTUNG 2` and replace through its closing `</section>` with:

```html
<!-- ============= 06 — LEISTUNG 2: RECRUITING & SOCIAL ============= -->
<section class="section" id="leistung-2">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">06 — Leistung 2</span>
      <h2>Recruiting &amp; Social — sichtbar für die Menschen, die Sie suchen.</h2>
    </div>
    <p class="service-intro">Employer-Brand als Basis, ein skalierbares Content-Kit und vier Wochen aktiver Launch-Support für Meta und TikTok. Bausteine einzeln buchbar oder als Paket.</p>

    <div class="assets-grid">
      <div class="asset-card">
        <div class="asset-overline">Baustein A · Basis</div>
        <h3>Employer-Brand-Workshop + Guide</h3>
        <div class="price">€3.500 – 5.000</div>
        <div class="price-meta">netto · ~1 Tag vor Ort + 1-pager Guide</div>
        <ul>
          <li>Werte, Zielgruppen (Azubi / Fachkraft / Rückkehrer:in)</li>
          <li>Tonalität und visuelle Bausteine</li>
          <li>Guide für konsistenten Inhouse-Content</li>
          <li>Bleibt auch bei wechselnden Autor:innen tragfähig</li>
        </ul>
      </div>
      <div class="asset-card featured">
        <span class="asset-badge">Empfohlen</span>
        <div class="asset-overline">Baustein B · Produktion</div>
        <h3>Content-Kit</h3>
        <div class="price">€6.000 – 10.000</div>
        <div class="price-meta">netto · Kampagnen-Claim + 30–50 Assets + 2 Landing Pages</div>
        <ul>
          <li>Mitarbeiter-Portraits, Azubi-Storys, Standort-Takes</li>
          <li>Stellenanzeigen-Vorlagen für Inhouse-Gebrauch</li>
          <li>Zwei Karriere-Landing-Pages (z. B. Pflegekraft, Therapeut:in)</li>
          <li>Kampagnen-Claim als visuelle Klammer</li>
        </ul>
      </div>
      <div class="asset-card">
        <div class="asset-overline">Baustein C · Launch</div>
        <h3>Launch-Support (4 Wochen)</h3>
        <div class="price">€2.000 – 3.500</div>
        <div class="price-meta">netto · Meta + TikTok</div>
        <ul>
          <li>Setup Business Manager und Targeting</li>
          <li>Creative-Rotation mit wöchentlichem Test</li>
          <li>Weekly Report mit Learnings</li>
          <li>Basis-Datenpunkte für alle kommenden Kampagnen</li>
        </ul>
      </div>
    </div>

    <div class="asset-types-block">
      <div class="label">Bausteine im Lieferumfang</div>
      <div class="pills">
        <span class="pill">Employer-Guide</span>
        <span class="pill">Recruiting-Claims</span>
        <span class="pill">Portrait-Serie</span>
        <span class="pill">Azubi-Storys</span>
        <span class="pill">Standort-Takes</span>
        <span class="pill">Ad-Creatives</span>
        <span class="pill">Karriere-Landing-Pages</span>
        <span class="pill">Meta/TikTok-Setup</span>
        <span class="pill">Weekly Reports</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Rebuild and spot-check**

Run: `node tools/encrypt-offer.js sieg-reha`. In browser, Section 06 should show 3 purple cards — Workshop €3,5–5k · Content-Kit €6–10k featured · Launch €2–3,5k — plus the recruiting-themed asset pills.

---

## Task 7: Section 07 — Leistung 3: Kreativ-Retainer

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

**Hintergrund:** Diese Sektion entspricht strukturell der Weinfreunde-Retainer-Sektion (identische 3 Modelle: Flexibel / R20 / R30 zu identischen Preisen). Nur die Section-Head-Überschrift und die Asset-Pills am Ende werden angepasst (Gesundheits-/Recruiting-Bezug statt Wein).

- [ ] **Step 1: Replace Section 07 — Kreativ-Retainer**

Find `<!-- ============= 07 — LEISTUNG 3` and replace through its closing `</section>` with:

```html
<!-- ============= 07 — LEISTUNG 3: KREATIV-RETAINER ============= -->
<section class="section" id="leistung-3" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">07 — Leistung 3</span>
      <h2>Kreativ-Retainer — Ihr ausgelagertes Kreativ-Team.</h2>
    </div>
    <p class="service-intro">Direkt adressiert an „keine Marketingpower" — eine kontinuierliche Pipeline für Social, Blog, Newsletter, Patient-Kommunikation und Standort-Kampagnen, ohne den Overhead einer Festanstellung. Drei Modelle, je nach Bedarf.</p>

    <div class="assets-grid">
      <div class="asset-card">
        <div class="asset-overline">Modell A · Flexibel</div>
        <h3>Stundenbasis</h3>
        <div class="price">75 €<span style="font-size: 1rem; color: var(--text-muted); font-weight: 300;">/h</span></div>
        <div class="price-meta">netto, nach Aufwand abgerechnet</div>
        <ul>
          <li>Punktuelle Projekte und Kampagnen-Spitzen</li>
          <li>Kein Mindestvolumen, keine Bindung</li>
          <li>Monatliche Abrechnung mit detailliertem Stundenzettel</li>
          <li>Einstieg ohne Risiko, ideal als Test-Phase</li>
        </ul>
      </div>
      <div class="asset-card">
        <div class="asset-overline">Modell B · Retainer 20</div>
        <h3>20 Stunden / Woche</h3>
        <div class="price">70 €<span style="font-size: 1rem; color: var(--text-muted); font-weight: 300;">/h</span></div>
        <div class="price-meta">ca. 6.067 €/Monat netto · –6,7% gegenüber Stundenbasis</div>
        <ul>
          <li>Verlässliche Halbtages-Kapazität, jede Woche</li>
          <li>Eingespielter Workflow nach kurzer Onboarding-Phase</li>
          <li>Fester Liefer-Slot für laufende Kampagnen</li>
          <li>Reduzierter Stundensatz</li>
        </ul>
      </div>
      <div class="asset-card featured">
        <span class="asset-badge">Empfohlen</span>
        <div class="asset-overline">Modell C · Retainer 30</div>
        <h3>30 Stunden / Woche</h3>
        <div class="price">60 €<span style="font-size: 1rem; color: var(--text-muted); font-weight: 300;">/h</span></div>
        <div class="price-meta">ca. 7.800 €/Monat netto · –20% gegenüber Stundenbasis</div>
        <ul>
          <li>Volle Tages-Kapazität für hohe Frequenz</li>
          <li>Multi-Channel parallel: Social + Blog + Standorte + Recruiting</li>
          <li>Maximaler Rabatt, höchste Planungssicherheit</li>
          <li>Direkter Draht ohne Account-Layer · siehe Vergleich Sektion 09</li>
        </ul>
      </div>
    </div>

    <div class="asset-types-block">
      <div class="label">Asset-Typen im Lieferumfang</div>
      <div class="pills">
        <span class="pill">Social Ads</span>
        <span class="pill">Newsletter-Header</span>
        <span class="pill">Blog-Visuals</span>
        <span class="pill">Patient-Ratgeber</span>
        <span class="pill">Standort-Kampagnen</span>
        <span class="pill">Saison-Content</span>
        <span class="pill">Azubi-Kampagnen</span>
        <span class="pill">Kostenträger-Kommunikation</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Rebuild and spot-check**

Run: `node tools/encrypt-offer.js sieg-reha`. Section 07: 3 purple cards (Flexibel 75€/h · R20 ~6,067€/Mo · R30 ~7,800€/Mo featured) with health-/recruiting-themed pills underneath.

---

## Task 8: Section 08 — Optional: GEO-Audit (Health-spezifisch) — INSERT

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

**Hintergrund:** Weinfreunde hat 9 Sektionen, Sieg Reha hat 11. Nach Tasks 3–7 sind die alten Weinfreunde-Sektionen 01–07 durch Sieg-Reha-Content ersetzt. Die Weinfreunde-Sektionen 08 (Investitionsübersicht) und 09 (Kontakt) stehen noch im File. **Sektion 08 GEO-Audit wird zwischen der neuen 07 (Retainer) und der Weinfreunde-08 (Investitionsübersicht) eingefügt — NICHT überschrieben.** Task 10 renummeriert Weinfreunde-08 und -09 auf Sieg-Reha-10 und -11. Die CSS-Klassen `.geo-edu-card`, `.geo-bullets`, `.geo-format`, `.geo-conditions` wurden aus dem Weinfreunde-File mitkopiert und sind nutzbar.

- [ ] **Step 1: Insert Section 08 — GEO-Audit between Section 07 (Retainer) and the existing Weinfreunde Investitionsübersicht**

In `tools/offer-content-sieg-reha.html`, find the closing `</section>` of the newly-inserted Section 07 (Kreativ-Retainer, identified by `id="leistung-3"` from Task 7). Immediately **after** that closing tag, insert:

```html
<!-- ============= 08 — OPTIONAL: GEO-AUDIT ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">08 — Optionaler Baustein</span>
      <h2>GEO-Audit — Sichtbarkeit in KI-Antworten.</h2>
    </div>

    <div class="geo-edu">
      <div class="geo-edu-label">Warum GEO für Gesundheit jetzt Thema wird</div>
      <h3>Immer mehr Patient:innen starten ihre Recherche in KI-Chats.</h3>
      <p>„Reha nach Knie-OP", „Physio in Hennef", <em>„RV-Fit — wer bekommt das?"</em>. Wer dort nicht zitiert wird, ist für diese Gruppe unsichtbar — unabhängig vom klassischen SEO-Ranking.</p>
    </div>

    <div class="geo-content">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 1.3rem; font-weight: 400; margin-bottom: 1.25rem;">Was wir analysieren</h3>
        <ul class="geo-bullets">
          <li><span class="check">✓</span> Gesundheitsrelevante Prompts auf 4 Plattformen (ChatGPT, Claude, Gemini, Perplexity) — Patient-Journey-, Regions-, Kostenträger- und Nachsorge-Prompts</li>
          <li><span class="check">✓</span> Wettbewerbsmatrix vs. regionale Reha-Anbieter und große Ketten (Dr. Becker, MediClin) — Sichtbarkeit, Nennungsanteil, Position</li>
          <li><span class="check">✓</span> Channel-Breakdown: Gesundheitsportale, Patientenforen, YouTube-Physios, Fachmedien — wer treibt die Reha-Kategorie in KI-Antworten?</li>
          <li><span class="check">✓</span> Top-zitierte Sieg-Reha-URLs + meistzitierte Drittquellen + konkrete PR-Outreach-Liste (Gesundheitsmedien, regionale Presse)</li>
        </ul>
      </div>
      <div class="geo-meta-card">
        <h4>Format &amp; Konditionen</h4>
        <div class="geo-meta-row"><span class="key">Lieferung</span><span class="val">PDF + Live-Präsentation</span></div>
        <div class="geo-meta-row"><span class="key">Umfang</span><span class="val">25–40 Seiten · 60 Min Präsentation</span></div>
        <div class="geo-meta-row"><span class="key">Plattformen</span><span class="val">ChatGPT, Claude, Gemini, Perplexity</span></div>
        <div class="geo-meta-row"><span class="key">Investition</span><span class="val">€4.500 – 7.500 netto</span></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify the old Weinfreunde Investitionsübersicht is still present after the new Section 08**

Run: `grep -c "INVESTITIONSÜBERSICHT" tools/offer-content-sieg-reha.html`
Expected: `1` (Weinfreunde-08 comment still present, will be renamed in Task 10).

Run: `grep -n "=============" tools/offer-content-sieg-reha.html | head -15`
Expected order (top-down): HEADER, 01 HERO, 02 KONTEXT, 03 BEDARFSANALYSE, 04 HANDLUNGSEMPFEHLUNGEN, 05 LEISTUNG 1, 06 LEISTUNG 2, 07 LEISTUNG 3, **08 OPTIONAL: GEO-AUDIT** (new), 08 INVESTITIONSÜBERSICHT (Weinfreunde, will be renamed), 09 NÄCHSTE SCHRITTE (Weinfreunde, will be renamed).

- [ ] **Step 3: Rebuild and spot-check**

Run: `node tools/encrypt-offer.js sieg-reha`. Section 08: gold-accented with edu-card at top, 4 check-bulleted items, format line, single conditions pill showing €4.500 – 7.500 netto. Below Section 08, the old Weinfreunde Investitionsübersicht temporarily still renders — that's expected and fixed in Task 10.

---

## Task 9: Section 09 — Kosten im Vergleich (NEW SECTION)

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

**Hintergrund:** Das ist die einzige **strukturell neue** Sektion ggü. Weinfreunde. Sie benötigt **neue CSS-Regeln** (3-Spalten-Vergleichs-Cards mit hervorgehobener 3. Spalte) und neues HTML-Markup. Die Sektion wird zwischen der bestehenden GEO-Sektion (08) und der Investitionsübersicht (die bislang als Sektion 08 im Weinfreunde-File war, hier zu Sektion 10 wird) eingefügt.

- [ ] **Step 1: Add new CSS rules to the `<style>` block**

Find the closing `</style>` tag of the offer content's first `<style>` block. Insert the following CSS **directly before** the closing `</style>`:

```css
/* ============================================================
   SECTION 09 — KOSTEN IM VERGLEICH (Sieg Reha specific)
   ============================================================ */
.cost-compare-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
  margin-bottom: 3rem;
}
.cost-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 2rem 1.75rem;
  position: relative; transition: all 0.35s;
}
.cost-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--text-muted); opacity: 0.35;
  border-top-left-radius: 12px; border-top-right-radius: 12px;
}
.cost-card-featured { border-color: var(--accent); }
.cost-card-featured::before { background: var(--accent); opacity: 1; }
.cost-card:hover { border-color: var(--border-light); transform: translateY(-3px); }
.cost-card-featured:hover { border-color: var(--accent-hover); }
.cost-card-label {
  display: inline-block; font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 0.3rem 0.7rem; border-radius: 4px;
  background: rgba(197,164,109,0.10); color: var(--text-muted);
  margin-bottom: 1.25rem;
}
.cost-card-featured .cost-card-label {
  background: rgba(197,164,109,0.18); color: var(--accent);
}
.cost-card h3 {
  font-family: var(--font-serif); font-size: 1.2rem; font-weight: 400;
  line-height: 1.3; margin-bottom: 1.25rem;
}
.cost-card ul { list-style: none; padding: 0; margin: 0; }
.cost-card li {
  font-size: 0.88rem; line-height: 1.6; color: var(--text-muted); font-weight: 300;
  padding: 0.6rem 0; border-bottom: 1px solid var(--border-subtle);
}
.cost-card li:last-child { border-bottom: none; }
.cost-card li strong { color: var(--text-light); font-weight: 500; }
.cost-card li em { color: var(--accent); font-style: normal; font-weight: 500; }
.cost-compare-closing {
  font-family: var(--font-serif); font-style: italic;
  font-size: 1.05rem; line-height: 1.7; color: var(--text-muted);
  max-width: 780px; margin: 0 auto; text-align: center;
}
@media (max-width: 900px) {
  .cost-compare-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Insert Section 09 HTML**

Locate the Investment-Übersicht section (in the Weinfreunde copy it's marked `<!-- ============= 08 — INVESTITIONSÜBERSICHT =============` or similar). **Directly before** that section, insert the full new Section 09:

```html
<!-- ============= 09 — KOSTEN IM VERGLEICH ============= -->
<section class="section" data-layer="gold">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">09 — Einordnung</span>
      <h2>Kosten im Vergleich — was kostet das Alternativszenario?</h2>
      <p>Die Investitionen auf der nächsten Seite können auf den ersten Blick substantiell wirken. Wir möchten sie in den Kontext der naheliegenden Alternativen stellen — Festanstellung und Werbeagentur — damit Sie eine informierte Entscheidung treffen können.</p>
    </div>
    <div class="cost-compare-grid">
      <article class="cost-card">
        <span class="cost-card-label">Inhouse</span>
        <h3>Festangestellte:r Designer:in</h3>
        <ul>
          <li>Bruttogehalt <strong>€48.000–60.000/Jahr</strong> (Junior/Mid-Level realistisch)</li>
          <li>+ AG-Kosten (~22 %), Software (~€2.500 p. a.), Hardware (~€1.500 p. a.)</li>
          <li>Effektiv <strong>~€4.000–5.000/Monat + HR-Overhead</strong></li>
          <li>Kein Puffer für Urlaub/Krankheit (~30 Arbeitstage Ausfall p. a.)</li>
          <li>Disziplin-fokussiert — selten Strategie + Web + Social + KI in einer Person</li>
          <li>HR-Lasten, Onboarding, ggf. Kündigungsschutz</li>
        </ul>
      </article>
      <article class="cost-card">
        <span class="cost-card-label">Agentur</span>
        <h3>Mittelstands-Werbeagentur</h3>
        <ul>
          <li>Senior-Tagessätze <strong>€1.200–1.800</strong>, Agentur-Overhead 30–50 %</li>
          <li>Vergleichbarer Website-Relaunch: <strong>€40.000–60.000</strong></li>
          <li>Recruiting-Paket vergleichbarer Umfang: <strong>€23.000–35.000</strong></li>
          <li>GEO-Audit bei Spezialisten-Agentur: <strong>€10.000–15.000</strong></li>
          <li>Längere Entscheidungspfade, Account-Manager als Zwischenschicht</li>
          <li>Team-Turnover, wechselnde Ansprechpartner</li>
        </ul>
      </article>
      <article class="cost-card cost-card-featured">
        <span class="cost-card-label">TSD Design — Ihr Angebot</span>
        <h3>Kompakt, senior, multi-disziplinär</h3>
        <ul>
          <li>Website-Relaunch <strong>€25.500–39.500</strong> · <em>ca. 35–50 % unter Agentur</em></li>
          <li>Recruiting-Paket <strong>€11.500–18.500</strong> · <em>ca. 50 % unter Agentur</em></li>
          <li>Retainer R30 <strong>€7.800/Monat</strong> · <em>auf Inhouse-Niveau, mit Senior-Bandbreite</em></li>
          <li>GEO-Audit <strong>€4.500–7.500</strong> · <em>ca. 50 % unter Spezialisten-Agentur</em></li>
          <li>Flexibel skalierbar, kein Fix-Commitment</li>
          <li>Ein Ansprechpartner, Senior-Niveau, ohne HR-Overhead</li>
        </ul>
      </article>
    </div>
    <p class="cost-compare-closing">„Wir argumentieren nicht gegen Festanstellung oder Agentur — beide haben ihre Berechtigung. Wir zeigen, wo TSD in diesem Spektrum steht: im Projektpreis deutlich unter Agentur, im Retainer auf Höhe einer Inhouse-Stelle — mit der Bandbreite einer Agentur, ohne den Overhead beider Seiten."</p>
  </div>
</section>
```

- [ ] **Step 3: Rebuild and visually QA Section 09**

Run: `node tools/encrypt-offer.js sieg-reha`. In browser, confirm:
- Section 09 appears between Section 08 (GEO-Audit) and the next Section (to be relabeled 10 in Task 10)
- 3 cards side-by-side on desktop, stacked on mobile (<900px width)
- Left two cards have subtle gray top-stripe, right card has gold top-stripe + gold border
- All bullet points render, `<strong>` bold and gold-emphasis `<em>` visible
- Closing Serif-italic quote centered under grid
- **Light-Theme-Test**: toggle theme — card backgrounds become white, borders remain readable, gold stays consistent

---

## Task 10: Section 10 — Investitionsübersicht (Alternative-Column) + Section 11 — Kontakt

**Files:**
- Modify: `tools/offer-content-sieg-reha.html`

**Hintergrund:** Die Weinfreunde-„Investitionsübersicht" existiert bereits im kopierten File (war dort Sektion 08). Wir renummerieren sie auf 10, ersetzen die Tabelle komplett und ergänzen eine vierte Spalte „Marktübliche Alternative". Sektion 11 (Kontakt) ist die ehemalige Weinfreunde-Sektion 09 — die wird content-angepasst (Closing-Quote + Nummerierung).

- [ ] **Step 1: Replace the Weinfreunde Investitionsübersicht (currently numbered 08) with the renumbered Sieg-Reha-Sektion 10**

In `tools/offer-content-sieg-reha.html`, find the Weinfreunde-origin comment `<!-- ============= 08 — INVESTITIONSÜBERSICHT` (still at position 08 in the comments even though it now appears after the new Section 09 in document order). Replace that entire section through its closing `</section>` with:

```html
<!-- ============= 10 — INVESTITIONSÜBERSICHT ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">10 — Konditionen</span>
      <h2>Investitionsübersicht.</h2>
      <p>Alle Module und Varianten im Überblick, mit marktüblicher Alternative als Anker. Finale Angebote nach Discovery-Workshop.</p>
    </div>
    <table class="invest-table">
      <thead>
        <tr>
          <th>Modul</th>
          <th>Variante</th>
          <th>Investition (netto)</th>
          <th>Marktübliche Alternative</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Website — Discovery</td>
          <td data-label="Variante">1,5 Tage</td>
          <td data-label="Investition" class="price-cell">€3.500 fix</td>
          <td data-label="Alternative" class="alt-cell muted">—</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Website — Design</td>
          <td data-label="Variante">3–4 Wochen</td>
          <td data-label="Investition" class="price-cell">€9.000 – 14.000</td>
          <td data-label="Alternative" class="alt-cell muted">Teil von €40–60k Agentur-Gesamt</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Website — Build &amp; Go-Live</td>
          <td data-label="Variante">4–6 Wochen</td>
          <td data-label="Investition" class="price-cell">€13.000 – 22.000</td>
          <td data-label="Alternative" class="alt-cell muted">Teil von €40–60k Agentur-Gesamt</td>
        </tr>
        <tr class="row-total">
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span><strong>Website gesamt</strong></td>
          <td data-label="Variante"></td>
          <td data-label="Investition" class="price-cell"><strong>€25.500 – 39.500</strong></td>
          <td data-label="Alternative" class="alt-cell"><strong>Agentur €40k–60k</strong></td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Recruiting — Workshop + Guide</td>
          <td data-label="Variante">~1 Tag + Guide</td>
          <td data-label="Investition" class="price-cell">€3.500 – 5.000</td>
          <td data-label="Alternative" class="alt-cell muted">—</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Recruiting — Content-Kit</td>
          <td data-label="Variante">30–50 Assets + 2 LPs</td>
          <td data-label="Investition" class="price-cell">€6.000 – 10.000</td>
          <td data-label="Alternative" class="alt-cell muted">—</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Recruiting — Launch-Support</td>
          <td data-label="Variante">4 Wochen</td>
          <td data-label="Investition" class="price-cell">€2.000 – 3.500</td>
          <td data-label="Alternative" class="alt-cell muted">—</td>
        </tr>
        <tr class="row-total">
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span><strong>Recruiting gesamt</strong></td>
          <td data-label="Variante"></td>
          <td data-label="Investition" class="price-cell"><strong>€11.500 – 18.500</strong></td>
          <td data-label="Alternative" class="alt-cell"><strong>Agentur €23k–35k</strong></td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Kreativ-Retainer — Flexibel</td>
          <td data-label="Variante">nach Aufwand</td>
          <td data-label="Investition" class="price-cell">75 €/h</td>
          <td data-label="Alternative" class="alt-cell muted">—</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Kreativ-Retainer — R20</td>
          <td data-label="Variante">20 h / Woche</td>
          <td data-label="Investition" class="price-cell">ca. 6.067 €/Monat</td>
          <td data-label="Alternative" class="alt-cell muted">—</td>
        </tr>
        <tr class="row-highlight">
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span><strong>Kreativ-Retainer — R30</strong></td>
          <td data-label="Variante">30 h / Woche</td>
          <td data-label="Investition" class="price-cell"><strong>ca. 7.800 €/Monat</strong></td>
          <td data-label="Alternative" class="alt-cell"><strong>Inhouse FTE ~€4k–5k/Mo + HR-Overhead</strong></td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span>GEO-Audit (optional)</td>
          <td data-label="Variante">PDF + 60 Min Präsentation</td>
          <td data-label="Investition" class="price-cell"><strong>€4.500 – 7.500</strong></td>
          <td data-label="Alternative" class="alt-cell"><strong>Spezialisten-Agentur €10k–15k</strong></td>
        </tr>
      </tbody>
    </table>
    <div class="invest-footnote">
      Alle Preise netto zzgl. 19 % USt. Finale Angebote nach Discovery-Workshop. Retainer-Monatspreise basieren auf 4,33 Wochen pro Monat. Marktübliche Alternativen basieren auf branchenüblichen Tagessätzen und öffentlich kommunizierten Agentur-Paketen.
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add CSS for the new 4th column ("Alternative") + row highlighting + total rows**

The existing Weinfreunde `.invest-table` CSS handles 3 columns (Modul / Volumen / Investition / Geeignet für). We now have 4 columns instead, with different semantic content (Alternative). Append to the end of the `<style>` block (directly before `</style>`):

```css
/* SECTION 10 — INVEST TABLE: 4th column (Alternative) + total/highlight rows */
.invest-table .alt-cell {
  color: var(--text-muted); font-style: italic; font-size: 0.92rem;
}
.invest-table .alt-cell.muted { opacity: 0.5; }
.invest-table .alt-cell strong {
  color: var(--text-light); font-weight: 500; font-style: normal;
}
.invest-table .row-total td {
  background: rgba(197,164,109,0.04);
  border-top: 2px solid var(--accent);
}
.invest-table .row-highlight td {
  background: rgba(197,164,109,0.08);
}
@media (max-width: 768px) {
  .invest-table .alt-cell::before { content: "↳ Alternative: "; color: var(--text-muted); font-style: normal; }
}
```

(The base `.invest-table`, `.invest-footnote`, `.module-name`, `.stripe`, `.price-cell`, `.price-cell.muted` classes are already present in the Weinfreunde CSS copied over. The responsive stacking with `data-label` attrs is also already implemented.)

- [ ] **Step 3: Replace the Weinfreunde Kontakt (currently numbered 09) with the renumbered Sieg-Reha-Sektion 11**

Find the final section (Weinfreunde-origin comment `<!-- ============= 09 — NÄCHSTE SCHRITTE`). Replace through its closing `</section>` with:

```html
<!-- ============= 11 — KONTAKT ============= -->
<section class="section" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head" style="text-align: center; max-width: none;">
      <span class="section-overline" style="display: block;">11 — Wie es weitergeht</span>
      <h2 style="margin-left: auto; margin-right: auto;">Lassen Sie uns sprechen.</h2>
    </div>

    <div class="contact-steps">
      <div class="contact-step">
        <div class="num">1</div>
        <h4>Kontakt</h4>
        <p>Kurze Mail oder Anruf — Sie kennen meine Nummer.</p>
      </div>
      <div class="contact-step">
        <div class="num">2</div>
        <h4>Discovery-Workshop</h4>
        <p>1,5 Tage vor Ort in Hennef, mit Geschäftsleitung und relevanten Stakeholdern.</p>
      </div>
      <div class="contact-step">
        <div class="num">3</div>
        <h4>Konkretisierung</h4>
        <p>Sauber kalkuliertes Folgeangebot, basierend auf Workshop-Ergebnissen.</p>
      </div>
    </div>

    <div class="contact-card">
      <div class="who">
        <div class="name">Denis Papadopulos</div>
        <div class="role">TSD Design GmbH · Geschäftsführung</div>
      </div>
      <div class="channels">
        <div class="channel">
          <span class="key">E-Mail</span>
          <a href="mailto:mail@tsd-design.de">mail@tsd-design.de</a>
        </div>
        <div class="channel">
          <span class="key">Telefon</span>
          <a href="tel:+4917378437778">+49 (0) 173 78 43 778</a>
        </div>
      </div>
    </div>

    <div class="closing-quote">
      <blockquote>„Gute Kreativ-Infrastruktur entsteht aus Verständnis für die Marke und die Menschen dahinter. Wir freuen uns darauf, Sieg Reha kennenzulernen."</blockquote>
      <cite>— Denis Papadopulos, TSD Design GmbH</cite>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Rebuild and spot-check Sections 10 + 11**

Run: `node tools/encrypt-offer.js sieg-reha`. Browser-check:
- Sektion 10: Tabelle mit 4 Spalten sichtbar. `row-total` für Website + Recruiting gesamt hervorgehoben. `row-highlight` (R30) mit goldener Tint. Mobile: stacked Cards, jede Alternative-Zelle mit „↳ Alternative: "-Präfix.
- Sektion 11: Kontakt-Card mit Mail + Tel als klickbaren Links, Closing-Quote in Serif-italic.

---

## Task 11: Final Build, Full-Page QA, Commit

**Files:**
- Create: `angebote/sieg-reha.html` (generated)

- [ ] **Step 1: Final clean build**

Run: `node tools/encrypt-offer.js sieg-reha`
Expected: `Wrote /.../angebote/sieg-reha.html (NNNNN bytes)`. File size ≥ 55.000 bytes (template ~9k + encrypted content ~48k+ after payload growth from Section 09 additions).

- [ ] **Step 2: Verify the artifact contains no plaintext content**

Run: `grep -c "Michael Köpke" angebote/sieg-reha.html`
Expected: `0` (the name must be in the encrypted payload, not plaintext).

Run: `grep -c "Herr Köpke" angebote/sieg-reha.html`
Expected: `0`.

Run: `grep -c "Sieg Reha" angebote/sieg-reha.html`
Expected: `0` — the template contains only TSD branding; the Sieg-Reha mentions all live inside the encrypted payload. Any match >0 means a plaintext leak that needs investigation before committing.

Run: `grep -c "ENCRYPTED PAYLOAD" angebote/sieg-reha.html`
Expected: `1`.

Run: `grep -c "noindex, nofollow, noarchive" angebote/sieg-reha.html`
Expected: `1`.

- [ ] **Step 3: Browser QA — Full walkthrough**

Open `angebote/sieg-reha.html`. Walk through acceptance criteria:

1. Login overlay shows TSD logo + „Angebot ansehen"-Copy
2. Wrong password (e.g. `falsch`) → inline error „Passwort nicht korrekt", no content rendered
3. Correct password `siegreha` → overlay disappears, offer renders
4. Header shows „TSD × Sieg Reha" + date meta
5. Hero: „Marketing- & Kreativ-Infrastruktur für *Sieg Reha*", Anrede „Lieber Herr Köpke", 3 pills (Stand / Gültig bis / Vertraulich)
6. Scroll through all 11 sections — order, numbering, accent colors correct
7. Section 09 3-column grid, right card with gold stripe + border, closing quote centered
8. Section 10 table with 4 columns; R30 row highlighted; totals bold
9. Section 11 contact links — `mailto:` and `tel:` work
10. Toggle theme (sun/moon icon right-top) — dark ↔ light, text and borders remain readable
11. Resize to 375px wide — all sections stack, table collapses to cards, no horizontal scroll
12. Resize to 1440px — content caps at `max-width: 1200px` container

- [ ] **Step 4: Run encryption test one last time**

Run: `node tools/test-encryption.js`
Expected: `PASS: encryption round-trip works, wrong-password rejection works`

- [ ] **Step 5: Verify git status only stages the intended files**

Run: `git status --short`
Expected: Only `angebote/sieg-reha.html` untracked under our scope. **NOT** `tools/offer-content-sieg-reha.html` (must remain gitignored by the `tools/offer-content-*.html` pattern).

Run: `git check-ignore -v tools/offer-content-sieg-reha.html`
Expected output confirms it matches the `tools/offer-content-*.html` line in `.gitignore`.

- [ ] **Step 6: Commit the encrypted artifact**

```bash
git add angebote/sieg-reha.html
git commit -m "$(cat <<'EOF'
Add encrypted offer page for Sieg Reha GmbH

Password-protected pitch with 11 sections: Hero, Über TSD,
Bedarfsanalyse, Handlungsempfehlungen, three service modules
(Website-Relaunch, Recruiting-Paket, Kreativ-Retainer), optional
GEO-Audit, a new Kosten-im-Vergleich section anchoring prices
against inhouse/agency alternatives, Investitionsübersicht and
Kontakt. Password: siegreha. Valid through 21. Juli 2026.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: Log completion**

Confirm final git log shows three new commits on this branch:
1. Parametrize `encrypt-offer.js`
2. Generalize `.gitignore` + rebuild Weinfreunde
3. Add encrypted offer page for Sieg Reha GmbH

Run: `git log --oneline -5`
Expected output contains all three commit subjects above.

---

## Appendix: Acceptance Criteria (from spec)

- [ ] Seite öffnet sich nur nach Eingabe des Passworts `siegreha`
- [ ] Falsches Passwort → Fehlermeldung, kein Inhalt sichtbar
- [ ] Quelltext zeigt **keine** Klartext-Inhalte der Angebots-Sektionen (nur verschlüsselte Payload)
- [ ] Robots-Meta `noindex, nofollow, noarchive` vorhanden
- [ ] `robots.txt` blockt `/angebote/` (schon aus Weinfreunde-Setup gegeben)
- [ ] Theme-Toggle funktioniert dark ↔ light
- [ ] Mobile-Layout korrekt 375 px – 1440 px
- [ ] Alle 11 Sektionen in korrekter Reihenfolge
- [ ] Sektion 09 mit 3 Cards (Inhouse / Agentur / TSD) und Closing-Quote
- [ ] Investitionsübersicht-Tabelle mit Alternative-Spalte und allen korrekten Zahlen
- [ ] Kontaktdaten: mail@tsd-design.de, +49 (0) 173 78 43 778, Denis Papadopulos
- [ ] Anrede „Lieber Herr Köpke"
- [ ] Daten: 21. April 2026, gültig bis 21. Juli 2026
- [ ] Keine Verlinkung von Hauptseiten auf das Angebot
- [ ] `encrypt-offer.js` parametrisiert (Config-Array + CLI-Filter)
- [ ] `.gitignore` auf `tools/offer-content-*.html` umgestellt
- [ ] `tools/offer-content.html` → `tools/offer-content-rewe-wein-online.html` (lokal)
- [ ] Weinfreunde-Artifact (`angebote/rewe-wein-online.html`) rebuilt, funktional unverändert

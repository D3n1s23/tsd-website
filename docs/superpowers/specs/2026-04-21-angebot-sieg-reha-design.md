# Angebotsseite Sieg Reha GmbH

**Datum:** 2026-04-21
**Auftraggeber:** Denis Papadopulos / TSD Design GmbH
**Empfänger:** Michael Köpke, Geschäftsführer Sieg Reha GmbH (warm angesprochen)
**Pfad:** `/angebote/sieg-reha.html`
**Passwort:** `siegreha` (AES-verschlüsselter Inhalt)
**Gültigkeit:** Stand 21. April 2026 · gültig bis 21. Juli 2026

---

## 1. Ziel & Kontext

Eine **passwortgeschützte HTML-Angebotsseite** im TSD-Designsystem, die drei Leistungen + einen optionalen Baustein für Sieg Reha GmbH bündelt:

1. **Website-Relaunch** (3-Phasen-Projekt)
2. **Recruiting & Social-Paket** (Employer-Brand + Content-Kit + Launch-Support)
3. **Kreativ-Retainer** (Flexibel / R20 / R30)
4. **Optional: GEO-Audit** (Health-spezifisch)

Zusätzlich eine **Value-Comparison-Sektion**, die die Preise gegen realistische Alternativen (Festanstellung, Agentur) verankert — zentrale Anforderung, damit die Preise argumentierbar sind.

Die Seite ist nur über einen direkten Link erreichbar, nicht in der Navigation verlinkt, und durch AES-256-GCM-Content-Verschlüsselung geschützt. Technik und UX identisch zum bestehenden Weinfreunde-Angebot (`/angebote/rewe-wein-online.html`).

## 2. Recherche-Grundlage

Belastbare Insights aus Web-Recherche zu Sieg Reha GmbH:

- **Unternehmen**: Ambulantes Gesundheitszentrum, gegründet 2001, Sitz Hennef (HRB 6204 Amtsgericht Siegburg)
- **Geschäftsführer**: Michael Köpke · **Prokurist**: Bernd Rademacher
- **Standorte**: 6 Einrichtungen im Rhein-Sieg-Kreis — Hennef (Dickstr. 59, Mittelstr. 49–51, Kurhausstr. 45, Frankfurter Str. 7c), Alfter (Konrad-Zuse-Str. 5), Siegburg (Wilhelmstr. 55–63)
- **Leistungen**: Ambulante Reha, Physiotherapie + Ergotherapie + Logopädie „unter einem Dach", Reha-Sport (Wasser-/Trockengymnastik), Nachsorgeprogramme, RV-Fit (Deutsche Rentenversicherung), Fahrdienste
- **Spezialgeräte**: Armeo, Lokomat, Alter G, Novafon, Vierzellenbad
- **Berufsfachschulen**: Schule für Physiotherapie + Schule für Ergotherapie (mit Auslandspraktikum) — starker Ausbildungs-Funnel
- **Zertifizierung**: QMS Reha (Feb 2023, Deutsche Rentenversicherung)
- **Claim**: „Ihre Gesundheit ist unser Ziel"
- **Digitale Kanäle**: Facebook, Instagram, YouTube, News-Blog, Azubi-Blog, Newsletter, eigenes Bistro-Balance + Kursportal
- **Autorin Social/Content**: Angelina Blumenberg
- **Bewerbung**: bewerbung@siegreha.de / HR 02242 96988-370
- **Kein sichtbares Marketing-/Employer-Branding-Team** im Karriere-Portal — bestätigt die Beobachtung „keine Marketingpower"

**Strategisches Fazit für die Angebotsstruktur**:
- Starke medizinische Substanz (Zertifizierung, Spezialgeräte, 2 Schulen) — Qualität vor Ort ist hoch
- Digitaler Marken-Eindruck steht nicht auf Augenhöhe mit der Qualität vor Ort (Anlass für Website-Modul)
- 6 Standorte × kontinuierlicher Personalbedarf × 2 Berufsfachschulen = starker Recruiting-Hebel (Anlass für Social/Recruiting-Modul)
- Kein internes Marketing-Team = Retainer-Bedarf für planbare Pipeline

## 3. Visuelles System

Vollständige Übernahme des bestehenden TSD-Designsystems aus `index.html` und `brand-guidelines.html`:

- **Farben**: Dark/Light-Theme-Toggle (`localStorage.theme`), Gold-Akzent `#c5a46d`, 4 Layer-Farben (`#7a9e7e`, `#6a8fb5`, `#9b7ab8`, `#c5a46d`)
- **Typografie**: Playfair Display (Hero, H2, italic Quotes), Inter 300/400/600 (Body, UI)
- **Komponenten**: Section-Heads mit Overline + Serif-H2, Module-Cards mit 3px Top-Stripe in Layer-Farbe, Pills, Tags, Glass-Header
- **Spacing**: 7rem Section-Padding, max-width 1200px, `clamp(1.5rem, 4vw, 3rem)` Padding
- **Hero-Lockup**: TSD-Logo + „Sieg Reha"-Wordmark (Format: „TSD × Sieg Reha"); falls Sieg-Reha-Logo nicht als verwendbare Datei vorliegt, Fallback: TSD-Logo + stilisierter Sieg-Reha-Schriftzug in Playfair
- **Layer-Akzent-Zuteilung pro Sektion** (Kontrast zum Weinfreunde-Burgund; hier Gesundheit/Vertrauen):
  - Sektion 03 (Bedarfsanalyse) → **Layer-Grün**
  - Sektion 04 (Handlungsempfehlungen) → **Layer-Blau**
  - Sektion 05–07 (Leistungen) → **Layer-Lila**
  - Sektion 08 (GEO optional) → **Layer-Gold**
  - Sektion 09 (Kosten im Vergleich) → **Layer-Gold** (Highlight)

## 4. Sektionsstruktur (11 Sektionen)

### 01 — Hero
- Overline: „Angebot für Sieg Reha GmbH"
- H1 (Serif): „Marketing- & Kreativ-Infrastruktur für *Sieg Reha*" (Akzent „Sieg Reha" gold-italic)
- Sub: Persönliche Anrede „Lieber Herr Köpke, …" + 2–3 Sätze zum Pitch
- Visuelles Lockup: TSD-Logo + Sieg-Reha-Wordmark
- Sticky Date/Validity Pill: „Stand 21. April 2026 · Gültig bis 21. Juli 2026"

### 02 — Kontext / Über TSD
- 3-Spalten-Grid: Wer wir sind / Disziplinen / Warum externe Kreativ-Infrastruktur
- Kompakt: pro Spalte Headline + 2–3 Sätze + Layer-Tag

### 03 — Bedarfsanalyse (Layer-Grün)
Overline „03 — Was wir gesehen haben". 4 Insight-Cards, jede mit Headline + Beschreibung + Quelle/Link:

1. **Starke Substanz, noch nicht auf Augenhöhe digital** — Qualität vor Ort (QMS-Reha-zertifiziert, 2 Berufsfachschulen, Spezialgeräte wie Armeo/Lokomat) ist hoch. Die digitale Marke transportiert diese Qualität noch nicht vollständig: Farben, Kontrast und Lesbarkeit der Website lassen Potenzial liegen.
   Quelle: https://siegreha.de/
2. **Recruiting-Druck trifft auf eigenen Ausbildungs-Funnel** — 6 Standorte, 2 eigene Berufsfachschulen (Physio + Ergo), Auslandspraktika, FSJ, Azubi-Blog. Employer-Brand-Arbeit verstärkt diesen organischen Funnel messbar.
   Quelle: https://siegreha.de/karriere/
3. **Multi-Stakeholder-Kommunikation** — Parallel angesprochen werden Patient:innen (Leistungssuche), Kostenträger (DRV, Krankenkassen; RV-Fit), Mitarbeitende (Kultur, Fortbildung) und Angehörige. Jede Gruppe braucht eigene Sprache und eigenen visuellen Pfad.
   Quelle: https://siegreha.de/service/
4. **KI-Suche verändert die Patient Journey** — Zunehmend wird vor dem Arztbesuch in ChatGPT/Gemini recherchiert („Reha nach Knie-OP", „Physio Hennef", „Was zahlt die DRV?"). Sichtbarkeit in diesen Antworten wird zum neuen SEO.
   Quelle: Eigenes Monitoring TSD, Kontext-Sektion 08

### 04 — Handlungsempfehlungen (Layer-Blau)
Overline „04 — Was wir empfehlen". 3-Spalten-Roadmap:
- **Sofort (1–4 Wochen)**: Discovery-Workshop + Website-Audit → verweist auf Sektion 05
- **Mittelfristig (Q3 2026)**: Website-Relaunch live + Recruiting-Kampagnen-Start → verweist auf 05 + 06
- **Strategisch (H2 2026 / 2027)**: Kreativ-Retainer für kontinuierliche Pipeline + GEO-Audit als strategischer Baustein → verweist auf 07 + 08

Visuell: Horizontale Roadmap mit 3 Stationen + Verbindungslinie.

### 05 — Leistung 1: Website-Relaunch (Layer-Lila)
- Overline „05 — Leistung 1"
- H2: „Website-Relaunch — auf Augenhöhe mit der Qualität vor Ort"
- Beschreibung (2–3 Sätze): Fokus Accessibility (WCAG 2.2 AA), kontrastsichere Typografie, klare Nutzerpfade für die vier Stakeholder-Gruppen (Patient:innen, Bewerber:innen, Kostenträger, Angehörige)
- 3-Phasen-Visual:
  - **Phase 1 — Discovery (1,5 Tage + Doku)** — Workshop mit Geschäftsleitung, Stakeholder-Mapping, Ziel-Definition, Content-Audit bestehender Seite. **Fixpreis €3.500 netto**
  - **Phase 2 — Design (3–4 Wochen)** — Neues Designsystem (Farben, Typografie, Komponenten, Accessibility-Konzept), Key Templates (Start, Service, Standort, Karriere, Blog), Klickprototyp. **€9.000 – 14.000 netto**
  - **Phase 3 — Build & Go-Live (4–6 Wochen)** — CMS-Umsetzung, Standort-Pages, Karriere-Bereich, Content-Migration, SEO-Basis, Redirects, Go-Live-Support. **€13.000 – 22.000 netto**
- Asset-/Leistungs-Pills darunter: Accessibility-Konzept · Designsystem · Klickprototyp · CMS-Umsetzung · Standort-Pages · Karriere-Flow · Content-Migration · Redirect-Matrix · SEO-Basis · Go-Live-Support

### 06 — Leistung 2: Recruiting & Social-Paket (Layer-Lila)
- Overline „06 — Leistung 2"
- H2: „Recruiting & Social — sichtbar für die Menschen, die Sie suchen"
- Beschreibung (2–3 Sätze): Employer-Brand als Basis, Content-Kit für skalierbare Ausspielung, erste Kampagnen-Wochen als Launch-Support
- 3-Teil-Struktur:
  - **Employer-Brand-Workshop + Basis-Guide** — Werte, Zielgruppen (Azubi / Fachkraft / Rückkehrer), Tonalität, visuelle Bausteine als 1-pager Guide. **€3.500 – 5.000 netto**
  - **Content-Kit (Kampagnen-Claim + 30–50 Assets + 2 Landing Pages)** — Mitarbeiter-Portraits, Azubi-Storys, Standort-Takes, Stellenanzeigen-Vorlagen, Karriere-Landing-Pages (Pflegekraft, Therapeut:in). **€6.000 – 10.000 netto**
  - **Launch-Support (Meta + TikTok, erste 4 Wochen)** — Setup Business Manager, Targeting, Creative-Rotation, Weekly Report. **€2.000 – 3.500 netto**
- Asset-Pills: Employer-Guide · Recruiting-Claims · Portrait-Serie · Azubi-Storys · Standort-Takes · Ad-Creatives · Karriere-Landing-Pages · Meta/TikTok-Setup · Weekly Reports
- Optional: Übergang in Retainer (Sektion 07) für laufende Pipeline

### 07 — Leistung 3: Kreativ-Retainer (Layer-Lila)
- Overline „07 — Leistung 3"
- H2: „Kreativ-Retainer — Ihr ausgelagertes Kreativ-Team"
- Beschreibung (2–3 Sätze): Direkt adressiert „keine Marketingpower" — kontinuierliche Pipeline für Social, Blog, Newsletter, Patient-Kommunikation, Standort-Kampagnen, ohne Festanstellungs-Overhead
- 3-Karten-Vergleich:
  - **Flexibel** — 75 €/h netto, abrechnung nach Aufwand, geeignet für punktuelle Projekte
  - **Retainer 20** — 70 €/h, 20 h/Woche, ca. 6.067 €/Monat netto (4,33 Wochen × 1.400 €), −6,7 % gegenüber Stundenbasis
  - **Retainer 30** — 60 €/h, 30 h/Woche, ca. 7.800 €/Monat netto (4,33 Wochen × 1.800 €), −20 % gegenüber Stundenbasis (mit `featured`-Hervorhebung)
- Asset-Pills: Social Ads · Newsletter-Header · Blog-Visuals · Patient-Ratgeber · Standort-Kampagnen · Saison-Content · Azubi-Kampagnen · Kostenträger-Kommunikation

### 08 — Optional: GEO-Audit (Layer-Gold)
- Overline „08 — Optionaler Baustein"
- H2: „GEO-Audit — Sichtbarkeit in KI-Antworten"
- **Edukations-Block** (gold-akzentuierte Card, kompakter als Weinfreunde):
  > **Warum GEO für Gesundheit jetzt Thema wird**
  >
  > Immer mehr Patient:innen starten ihre Recherche in KI-Chats („Reha nach Knie-OP", „Physio in Hennef", „RV-Fit — wer bekommt das?"). Wer dort nicht zitiert wird, ist für diese Gruppe unsichtbar — unabhängig von klassischem SEO-Ranking.
- **Was wir für Sieg Reha analysieren** (4 Bullets):
  1. Gesundheitsrelevante Prompts auf 4 Plattformen (ChatGPT, Claude, Gemini, Perplexity)
  2. Wettbewerbsmatrix vs. regionale Reha-Anbieter + große Ketten (Dr. Becker, MediClin)
  3. Channel-Breakdown: Gesundheitsportale, Patientenforen, YouTube-Physios, Fachmedien
  4. Top-zitierte Sieg-Reha-URLs + Drittquellen + PR-Outreach-Liste (Gesundheitsmedien, regionale Presse)
- **Format**: PDF-Report (25–40 Seiten) + Live-Präsentation (60 Min)
- **Konditionen**: **€4.500 – 7.500 netto**

### 09 — Kosten im Vergleich (Layer-Gold, NEUE Sektion ggü. Weinfreunde)
- Overline „09 — Einordnung"
- H2 (Serif): „Kosten im Vergleich — was kostet das Alternativszenario?"
- Einleitung (2–3 Sätze): „Die Investitionen auf der nächsten Seite können auf den ersten Blick substantiell wirken. Wir möchten sie in den Kontext der naheliegenden Alternativen stellen — Festanstellung und Werbeagentur — damit Sie eine informierte Entscheidung treffen können."
- 3-Spalten-Vergleich:

  **Spalte 1 — Festangestellte:r Designer:in (Inhouse)**
  - Bruttogehalt €48.000–60.000/Jahr (Junior/Mid-Level realistisch)
  - + AG-Kosten (~22 %), Software (~€2.500 p. a.), Hardware (~€1.500 p. a.)
  - **Effektiv ~€4.000–5.000/Monat + HR-Overhead**
  - Kein Puffer für Urlaub/Krankheit (~30 Arbeitstage Ausfall p. a. realistisch)
  - Disziplin-fokussiert — selten Strategie + Web + Social + KI in einer Person
  - HR-Lasten, Onboarding, ggf. Kündigungsschutz/Abfindung

  **Spalte 2 — Mittelstands-Werbeagentur**
  - Senior-Tagessätze €1.200–1.800, Agentur-Overhead 30–50 %
  - Vergleichbarer Website-Relaunch: **€40.000–60.000**
  - Recruiting-Paket vergleichbarer Umfang: **€23.000–35.000**
  - GEO-Audit bei Spezialisten-Agentur: **€10.000–15.000**
  - Längere Entscheidungspfade, Account-Manager als Zwischenschicht, Team-Turnover

  **Spalte 3 — TSD Design (Ihr Angebot)**
  - Website-Relaunch **€25.500–39.500** · *ca. 35–50 % unter Agentur-Niveau*
  - Recruiting-Paket **€11.500–18.500** · *ca. 50 % unter Agentur-Niveau*
  - Retainer R30 **€7.800/Monat** · *etwas über Inhouse, aber mit Senior-Niveau, Multi-Disziplin, ohne Ausfall*
  - GEO-Audit **€4.500–7.500** · *ca. 50 % unter Spezialisten-Agentur*
  - Flexibel skalierbar, kein Fix-Commitment

- Closing (Serif-italic, klein):
  > „Wir argumentieren nicht gegen Festanstellung oder Agentur — beide haben ihre Berechtigung. Wir zeigen, wo TSD in diesem Spektrum steht: im Projektpreis deutlich unter Agentur, im Retainer auf Höhe einer Inhouse-Stelle — mit der Bandbreite einer Agentur, ohne den Overhead beider Seiten."

### 10 — Investitionsübersicht
- Overline „10 — Konditionen"
- H2: „Investitionsübersicht"
- Vergleichstabelle (mit Alternative-Spalte):

| Modul | Variante | Investition (netto) | Marktübliche Alternative |
|-------|----------|---------------------|--------------------------|
| Website-Relaunch | Discovery | €3.500 fix | — |
| Website-Relaunch | Design-Phase | €9.000 – 14.000 | Teil von €40–60k Agentur-Gesamt |
| Website-Relaunch | Build & Go-Live | €13.000 – 22.000 | Teil von €40–60k Agentur-Gesamt |
| **Website-Relaunch gesamt** | | **€25.500 – 39.500** | **Agentur €40k–60k** |
| Recruiting-Paket | Workshop + Guide | €3.500 – 5.000 | — |
| Recruiting-Paket | Content-Kit | €6.000 – 10.000 | — |
| Recruiting-Paket | Launch-Support | €2.000 – 3.500 | — |
| **Recruiting-Paket gesamt** | | **€11.500 – 18.500** | **Agentur €23k–35k** |
| Kreativ-Retainer | Flexibel | 75 €/h | — |
| Kreativ-Retainer | R20 | ca. 6.067 €/Monat | — |
| Kreativ-Retainer | R30 | **ca. 7.800 €/Monat** | **Inhouse FTE ~€4k–5k/Mo + HR-Overhead** |
| GEO-Audit (optional) | — | **€4.500 – 7.500** | **Spezialisten-Agentur €10k–15k** |

- Footnote: „Alle Preise netto zzgl. 19 % USt. Finale Angebote nach Discovery-Workshop. Retainer-Monatspreise basieren auf 4,33 Wochen pro Monat."

### 11 — Nächste Schritte / Kontakt
- Overline „11 — Wie es weitergeht"
- H2 (Serif): „Lassen Sie uns sprechen."
- 3-Schritt-Visual: Kontakt → Discovery-Workshop → Konkretisierung
- Kontakt-Card:
  - **Denis Papadopulos** · TSD Design GmbH
  - **E-Mail**: mail@tsd-design.de
  - **Telefon**: +49 (0) 173 78 43 778
- Closing-Quote (italic Serif):
  > „Gute Kreativ-Infrastruktur entsteht aus Verständnis für die Marke und die Menschen dahinter. Wir freuen uns darauf, Sieg Reha kennenzulernen."

## 5. Technische Implementierung

### 5.1 Single-File-HTML
Eine HTML-Datei `/angebote/sieg-reha.html` mit Inline-CSS und Inline-JS — kein Build-System, keine externen Dependencies außer Google Fonts (CDN, wie Hauptseite).

### 5.2 AES-Verschlüsselung des Inhalts
Verfahren **identisch** zu Weinfreunde:
- AES-256-GCM über Web-Crypto-API (browser-nativ)
- Schlüsselableitung PBKDF2 mit SHA-256, 100.000 Iterationen, 16-Byte Salt, 12-Byte IV
- Passwort: `siegreha`
- Speicherform: Verschlüsselter Inhalt + Salt + IV als Base64 in einem `<script>`-Block
- Template: wiederverwendbar, unverändert aus `tools/offer-template.html`

### 5.3 Build-Script parametrisieren
`tools/encrypt-offer.js` ist aktuell hartcodiert auf Weinfreunde. Refactor: **Config-Array + optionaler CLI-Filter**.

```javascript
const OFFERS = [
  { slug: 'rewe-wein-online', password: 'rewewein', content: 'tools/offer-content-rewe-wein-online.html' },
  { slug: 'sieg-reha',        password: 'siegreha', content: 'tools/offer-content-sieg-reha.html' },
];
// node tools/encrypt-offer.js             → baut alle
// node tools/encrypt-offer.js sieg-reha   → baut nur den einen
```

- Content-Pfad folgt Konvention `tools/offer-content-<slug>.html`
- Output folgt Konvention `angebote/<slug>.html`
- Rückwärts-Migration: Weinfreunde-Content umbenennen von `tools/offer-content.html` → `tools/offer-content-rewe-wein-online.html` (einmalig, lokal; Output-Datei `angebote/rewe-wein-online.html` bleibt unverändert, solange Content nicht neu verschlüsselt wird)
- `.gitignore` erweitern von `tools/offer-content.html` auf `tools/offer-content-*.html`, damit alle künftigen Offers automatisch ignoriert sind

### 5.4 UX
- Vollflächige Login-Maske (TSD-Designsystem) mit Passwort-Input und „Öffnen"-Button
- Bei korrektem Passwort: Decrypt + DOM-Injection + Render
- Bei falschem Passwort: Inline-Fehlermeldung „Passwort nicht korrekt"
- Kein Server-Roundtrip, kein Tracking

### 5.5 Suchmaschinen-Schutz
- Meta `robots="noindex, nofollow, noarchive"` (bereits im Template)
- `robots.txt` im Repo-Root blockt `/angebote/` bereits (aus Weinfreunde-Setup)
- Keine Verlinkung in `index.html`, Footer oder Sitemap

### 5.6 Theme-Toggle
Identisch zur Hauptseite — `localStorage.getItem('theme')` mit Default `dark`, Sun/Moon-SVG-Toggle im Header.

### 5.7 Responsive
Alle Sektionen mobile-optimiert (Breakpoints 480 / 600 / 768 / 900 / 1024). Tabellen werden auf < 768px zu vertikal gestapelten Cards. Die 3-Spalten-Vergleichsektion (09) stapelt unter 900px vertikal.

## 6. Dateistruktur

```
/
├── index.html                                        # bestehend, unverändert
├── (...)
├── robots.txt                                        # bestehend, blockiert /angebote/
├── .gitignore                                        # GEÄNDERT: tools/offer-content-*.html
├── angebote/
│   ├── rewe-wein-online.html                         # bestehend, unverändert
│   └── sieg-reha.html                                # NEU — verschlüsselte Angebotsseite
└── tools/
    ├── offer-template.html                           # bestehend, unverändert
    ├── encrypt-offer.js                              # GEÄNDERT: Config-Array + CLI-Filter
    ├── offer-content-rewe-wein-online.html           # GEÄNDERT: Rename von offer-content.html (lokal, gitignored)
    └── offer-content-sieg-reha.html                  # NEU (lokal, gitignored)
```

## 7. Inhaltliche Detail-Texte (Auszug)

**Hero-Sub:**
> Lieber Herr Köpke, vielen Dank für das Interesse an einer Zusammenarbeit. Auf den folgenden Seiten finden Sie unsere Analyse Ihres aktuellen Marken-Setups und drei konkrete Leistungsmodule — plus einen optionalen strategischen Baustein —, die wir auf Basis dieser Analyse für Sieg Reha vorschlagen.

**Sektion 02 — Über TSD (Spaltentexte):**
- Spalte 1: „TSD Design GmbH ist ein Studio für strategisches Design, Software und KI-Kreativsysteme." (Layer-Tag „Studio")
- Spalte 2: „Wir arbeiten an der Schnittstelle von Marke, Technologie und Skalierung." (Layer-Tag „Schnittstelle")
- Spalte 3: „Für Einrichtungen ohne eigenes Marketing-Team bedeutet das: eine externe Kreativ-Infrastruktur, die wie ein Inhouse-Team wirkt — strategisch, visuell und operativ." (Layer-Tag „Ansatz")

**Insights mit Quellen (Sektion 03)** — verlinken auf:
- Insight 1: `https://siegreha.de/` (Startseite als Gesamt-Eindruck)
- Insight 2: `https://siegreha.de/karriere/`
- Insight 3: `https://siegreha.de/service/`
- Insight 4: Intern (Eigenes TSD-Monitoring)

## 8. Acceptance-Kriterien

- [ ] Seite öffnet sich nur nach Eingabe des Passworts `siegreha`
- [ ] Falsches Passwort zeigt Fehlermeldung, kein Inhalt sichtbar
- [ ] Quelltext zeigt **keine** Klartext-Inhalte der Angebots-Sektionen (nur verschlüsselte Payload)
- [ ] Robots-Meta-Tag und `robots.txt` blockieren Indexierung
- [ ] Theme-Toggle funktioniert wie auf Hauptseite
- [ ] Mobile-Layout korrekt auf 375 px – 1440 px
- [ ] Alle 11 Sektionen vollständig und in korrekter Reihenfolge
- [ ] Sektion 09 „Kosten im Vergleich" mit 3 Spalten (Inhouse / Agentur / TSD) und allen Zahlen
- [ ] Investitionsübersicht-Tabelle mit **Alternative-Spalte**, alle Zahlen korrekt:
  - Website Gesamt €25.500 – 39.500 / Agentur €40k – 60k
  - Recruiting Gesamt €11.500 – 18.500 / Agentur €23k – 35k
  - R30 ca. 7.800 €/Monat / Inhouse FTE ~€4k – 5k/Mo + HR-Overhead
  - GEO-Audit €4.500 – 7.500 / Spezialisten-Agentur €10k – 15k
- [ ] Kontaktdaten korrekt: mail@tsd-design.de, +49 (0) 173 78 43 778, Denis Papadopulos
- [ ] Empfänger-Anrede: Michael Köpke („Lieber Herr Köpke")
- [ ] Datum: 21. April 2026, Gültigkeit: 21. Juli 2026
- [ ] Keine Verlinkung von Hauptseiten auf das Angebot
- [ ] `encrypt-offer.js` refaktoriert: Config-Array + CLI-Filter, baut Weinfreunde und Sieg Reha aus einer Quelle
- [ ] `.gitignore` angepasst auf `tools/offer-content-*.html`
- [ ] `tools/offer-content.html` umbenannt in `tools/offer-content-rewe-wein-online.html` (lokal)
- [ ] Weinfreunde-Output (`angebote/rewe-wein-online.html`) bleibt funktional unverändert

## 9. Out of Scope

- Keine separate Print-Version (PDF) — falls gewünscht, separates Folge-Projekt via Browser-Print
- Keine Sprache außer Deutsch
- Kein Server-Side-Auth (GitHub Pages unterstützt das nicht ohne weitere Infrastruktur)
- Keine Analytics / Tracking auf der Angebotsseite
- Kein E-Mail-Trigger bei Login (kein Backend)
- Keine Vertragsdetails / AGB / Datenschutzhinweise auf der Angebotsseite (Verweis auf bestehende Seiten genügt)
- Keine tatsächliche Umsetzung der beworbenen Leistungen im Rahmen dieses Projekts — dieses Projekt liefert nur die Angebotsseite selbst

## 10. Risiken & Annahmen

- **Annahme**: Michael Köpke ist der richtige primäre Adressat als GF. Falls Bernd Rademacher (Prokurist) parallel mit adressiert werden soll, ist nur die Anrede in Hero + Closing anzupassen.
- **Annahme**: Empfänger akzeptiert eine HTML-Seite als Angebotsformat (kein PDF-Anhang). Falls nicht: nachgelagert PDF-Export via Browser-Print.
- **Annahme**: Agentur-Vergleichs-Ranges (€40k–60k Website, €23k–35k Recruiting, €10k–15k GEO) sind marktübliche Mittelstands-Sätze — von Denis bestätigt. Bei Rückfragen seitens Sieg Reha sollte TSD eine Kurz-Referenz auf 2–3 anonymisierte Vergleichsfälle nachliefern können.
- **Risiko**: Inhouse-Vergleich €4k–5k/Mo ist bewusst konservativ (Junior/Mid-Level). Falls Sieg Reha ein Senior-Profil im Kopf hat (€6k+), wirkt der R30-Preis weniger als „Premium" — der Text in Sektion 09 Spalte 3 stellt deshalb heraus, dass TSD Senior-Niveau + Multi-Disziplin liefert.
- **Risiko**: Klartext-Inhalt liegt lokal in `tools/offer-content-sieg-reha.html`. Falls versehentlich committet, ist das Angebot kompromittiert. Mitigation: `.gitignore`-Pattern `tools/offer-content-*.html`.
- **Annahme**: Recherche-Insights sind zum 21. April 2026 gültig. Bei späterem Versand aktualisieren.
- **Annahme**: Sieg-Reha-Logo als verwendbare Datei nicht verfügbar; Fallback ist Playfair-Schriftzug „Sieg Reha" im Hero-Lockup.

# Angebotsseite REWE Wein online GmbH (Weinfreunde)

**Datum:** 2026-04-20
**Auftraggeber:** Denis Papadopulos / TSD Design GmbH
**Empfänger:** Kim Mathives / REWE Wein online GmbH (Marke: Weinfreunde)
**Pfad:** `/angebote/rewe-wein-online.html`
**Passwort:** `rewewein` (AES-verschlüsselter Inhalt)

---

## 1. Ziel & Kontext

Eine **passwortgeschützte HTML-Angebotsseite** im TSD-Designsystem, die drei Leistungen für REWE Wein online GmbH bündelt:

1. **Creative Asset Erstellung** (Freelancer auf Stundenbasis + Retainer-Modelle)
2. **GEO Audit** (Sichtbarkeit in KI-Antworten — Generative Engine Optimization)
3. **KI-Kreativsystem** (automatisierte Workflows nach Prozess-Audit)

Die Seite ist nur über einen direkten Link erreichbar, nicht in der Navigation verlinkt, und durch eine echte AES-256-Content-Verschlüsselung geschützt.

## 2. Recherche-Grundlage

Belastbare Insights aus Web-Recherche zu Weinfreunde / REWE Wein online GmbH:

- **Unternehmen**: 100% REWE-Digital-Tochter, 11–50 Mitarbeitende, Sitz Köln
- **Sortiment**: 1.000+ Weine online + Listung in 3.800 REWE-Filialen mit „Empfohlen von Weinfreunde"-POS-Material
- **Auszeichnung**: „Bester Weinfachhändler online international" (Berliner Weintrophy 2023)
- **Marketing-Setup**: Aktuell offene Stelle Senior Performance Marketing Manager (SEA, Paid Social, Display, Affiliate)
- **Content-Achse**: Weinfreunde Magazin, „Bei Anruf Wein"-Podcast, „Winzer des Monats", saisonale Kampagnen
- **Social**: Instagram 25.000 Follower, 1.559 Posts
- **Tech-Affinität**: LinkedIn-Kommunikation zu „Agentic Marketing" und „RCS-Kampagnen", neue Shop-Generation
- **Geschäftsführung** (lt. Impressum): Clemens Bauer, Cédric Garraud, Sven Reinbold, Ulrike Zanker

## 3. Visuelles System

Vollständige Übernahme des bestehenden TSD-Designsystems aus `index.html` und `brand-guidelines.html`:

- **Farben**: Dark/Light-Theme-Toggle (localStorage `theme`), Gold-Akzent `#c5a46d`, 4 Layer-Farben (`#7a9e7e`, `#6a8fb5`, `#9b7ab8`, `#c5a46d`)
- **Typografie**: Playfair Display (Hero, H2, italic Quotes), Inter 300/400/600 (Body, UI)
- **Komponenten**: Section-Heads mit Overline + Serif-H2, Module-Cards mit 3px Top-Stripe in Layer-Farbe, Pills, Tags, Glass-Header
- **Spacing**: 7rem Section-Padding, max-width 1200px, `clamp(1.5rem, 4vw, 3rem)` Padding
- **Hero-Visual**: TSD-Logo + Weinfreunde-Wordmark nebeneinander (Format: „TSD × Weinfreunde")
- **Kein dediziertes Burgund**: TSD-Brand bleibt dominant; Weinfreunde-Akzent nur als subtile 1px-Linie an Logo-Lockup

## 4. Sektionsstruktur (9 Sektionen)

### 01 — Hero
- Overline: „Angebot für REWE Wein online GmbH"
- H1 (Serif): „Creative Asset Produktion für *Weinfreunde*" (Akzent „Weinfreunde" gold-italic)
- Sub: Persönliche Anrede „Liebe Kim Mathives, …" + 2–3 Sätze zum Pitch
- Visuelles Lockup: TSD-Logo + Weinfreunde-Wordmark
- Sticky Date/Validity Pill: „Stand 20. April 2026 · Gültig bis 20. Juli 2026"

### 02 — Kontext / Über TSD
- 3-Spalten-Grid: Wer wir sind / Disziplinen / Warum Marketing-Creative
- Kompakt: pro Spalte Headline + 2–3 Sätze + Layer-Tag

### 03 — Bedarfsanalyse
- Overline „03 — Was wir gesehen haben"
- 4 Insight-Cards (Layer-Grün), jede mit Headline + Beschreibung + Quellen-Link:
  1. **Skalierender Performance-Marketing-Bedarf** (Quelle: REWE-Karriere-Portal Senior Performance Marketing Manager)
  2. **Multi-Channel-Output** (Magazin, Podcast, Instagram 25k, 3.800 REWE-Filialen mit POS)
  3. **Saisonale Kampagnen-Cycles** (Spargelweine, Frühlingsweine, „Winzer des Monats")
  4. **Technologische Affinität** (LinkedIn „Agentic Marketing", „RCS-Kampagnen", neue Shop-Generation)
- Mini-Teaser am Ende: „Eine fünfte Dimension fehlt heute in vielen Marketing-Setups: KI-Sichtbarkeit. Mehr dazu in Sektion 06."

### 04 — Handlungsempfehlungen
- Overline „04 — Was wir empfehlen"
- 3-Spalten-Roadmap (Layer-Blau):
  - **Sofort (1–4 Wochen)**: Externe Creative-Kapazität für Performance-Backlog → verweist auf Sektion 05
  - **Mittelfristig (Q3 2026)**: Verlässlicher Retainer für planbare Kampagnen-Cycles → verweist auf Sektion 05
  - **Strategisch (H2 2026)**: GEO Audit + KI-Kreativsystem → verweist auf Sektion 06 + 07
- Visuell: Horizontale Roadmap mit 3 Stationen + Verbindungslinie

### 05 — Leistung 1: Creative Assets
- Overline „05 — Leistung 1"
- H2: „Creative Asset Produktion als Freelancer"
- Beschreibung: 2–3 Sätze zum Leistungsumfang (Social Ads, Display, POS, Magazin-Visuals, Newsletter)
- 3-Karten-Vergleich (alle Layer-Lila):
  - **Flexibel** — 75 €/h netto, abrechnung nach Aufwand, geeignet für punktuelle Projekte
  - **Retainer 20** — 70 €/h, 20 h/Woche, ca. 6.067 €/Monat netto (4,33 Wochen × 1.400 €), -6,7% gegenüber Stundenbasis
  - **Retainer 30** — 60 €/h, 30 h/Woche, ca. 7.800 €/Monat netto (4,33 Wochen × 1.800 €), -20% gegenüber Stundenbasis (mit `featured`-Hervorhebung)
- Asset-Typen-Grid darunter (Pills): Social Ads · Display Banner · POS-Material · Magazin-Visuals · Newsletter-Header · Kampagnen-Keys · Podcast-Cover · Lifestyle-Stills

### 06 — Leistung 2: GEO Audit
- Overline „06 — Leistung 2"
- H2: „GEO Audit — Sichtbarkeit in KI-Antworten"
- **Edukations-Block** (gold-akzentuierte Card):
  > **Warum GEO jetzt Thema wird**
  >
  > Immer mehr Kaufentscheidungen starten in KI-Chats statt in Google. Wer dort nicht zitiert wird, existiert für diese User-Gruppe nicht. Bei Beratungs-Kategorien wie Wein („Welcher Riesling passt zu Spargel?", „Bester Online-Weinhändler?") ist das besonders relevant.
- **Was wir analysieren** (4 Bullets mit Check-Icons):
  1. Wein-relevante Prompts auf 4 Plattformen (ChatGPT, Claude, Gemini, Perplexity)
  2. Wettbewerbsmatrix vs. Vinos, Hawesko, Vicampo & Co.
  3. Channel-Breakdown: Magazine, YouTube-Sommeliers, Foodie-Sites, Reddit
  4. Top-zitierte Weinfreunde-URLs + Drittquellen + PR-Outreach-Liste
- **Format**: PDF-Report (40–60 Seiten) + Live-Präsentation (90 Min)
- **Konditionen** (Pill-Style):
  - Volumen: nach Absprache
  - Investition: auf Anfrage

### 07 — Leistung 3: KI-Kreativsystem
- Overline „07 — Leistung 3"
- H2: „KI-Kreativsystem — Automatisierte Workflows nach Audit"
- Einleitung: 2–3 Sätze zum Prinzip (erst Audit, dann maßgeschneiderte Workflows)
- 3-Phasen-Visual (Layer-Gold):
  - **Phase 1 — Analyse**: Audit interner Kreativprozesse (Tools, Briefings, Approval-Loops, Output-Volumen)
  - **Phase 2 — Workflow-Design**: Identifikation automatisierbarer Pfade (z.B. saisonale Asset-Varianten, Magazin-Bild-Pipelines, Newsletter-Personalisierung)
  - **Phase 3 — Implementierung**: Custom Pipelines mit Claude/GPT/Stable Diffusion + Bestandstools (DAM, CMS)
- Konditionen-Pill: „auf Anfrage nach Analyse"

### 08 — Investitionsübersicht
- Overline „08 — Konditionen"
- H2: „Investitionsübersicht"
- Vergleichstabelle (alle 5 Modelle):

| Modul | Volumen | Investition (netto) | Geeignet für |
|-------|---------|---------------------|--------------|
| Creative Assets — Flexibel | nach Bedarf | 75 €/h | Punktuelle Projekte |
| Creative Assets — Retainer 20 | 20 h/Woche | ca. 6.067 €/Monat | Kontinuierliche Pipeline |
| Creative Assets — Retainer 30 | 30 h/Woche | ca. 7.800 €/Monat | Hohe Multi-Channel-Frequenz |
| GEO Audit | nach Absprache | auf Anfrage | Strategischer Einstieg, Hebel identifizieren |
| KI-Kreativsystem | nach Audit | auf Anfrage | Strategische Skalierung |

- Footnote: „Alle Preise netto zzgl. 19% USt. Retainer-Monatspreise basieren auf 4,33 Wochen pro Monat."

### 09 — Nächste Schritte / Kontakt
- Overline „09 — Wie es weitergeht"
- H2 (Serif): „Lassen Sie uns sprechen."
- 3-Schritt-Visual: Kontakt → Erstgespräch → Konkretisierung
- Kontakt-Card:
  - **Denis Papadopulos** · TSD Design GmbH
  - **E-Mail**: mail@tsd-design.de
  - **Telefon**: +49 (0) 173 78 43 778
- Closing-Quote (italic Serif): „Gute Creative Assets entstehen aus Verständnis für die Marke. Wir freuen uns darauf, Weinfreunde kennenzulernen."

## 5. Technische Implementierung

### 5.1 Single-File-HTML

Eine HTML-Datei `/angebote/rewe-wein-online.html` mit Inline-CSS und Inline-JS — kein Build-System, keine externen Dependencies außer Google Fonts (CDN, wie Hauptseite).

### 5.2 AES-Verschlüsselung des Inhalts

**Verfahren:**
- **AES-256-GCM** über Web-Crypto-API (browser-nativ, keine externe Library)
- **Schlüsselableitung**: PBKDF2 mit SHA-256, 100.000 Iterationen, 16-Byte Salt
- **Passwort**: `rewewein`
- **Speicherform**: Verschlüsselter Inhalt + Salt + IV als Base64 in einem `<script>`-Block, der als JSON-Konstante dem Decrypt-Script übergeben wird

**Build-Schritt:**
- Node-Script `tools/encrypt-offer.js`
- Liest Klartext-HTML-Body aus `tools/offer-content.html`
- Verschlüsselt mit hartcodiertem Passwort
- Schreibt finale `/angebote/rewe-wein-online.html` mit Wrapper (Login-Form + Decrypt-Logik) + verschlüsselter Payload
- Manuell ausgeführt: `node tools/encrypt-offer.js`

**UX:**
- Beim Aufruf: Vollflächige Login-Maske (TSD-Designsystem) mit Passwort-Input und „Öffnen"-Button
- Bei korrektem Passwort: Decrypt + DOM-Injection des Klartextes + Render
- Bei falschem Passwort: Inline-Fehlermeldung „Passwort nicht korrekt"
- Kein Server-Roundtrip, kein Tracking

### 5.3 Suchmaschinen-Schutz

- **Meta-Tag**: `<meta name="robots" content="noindex, nofollow, noarchive">`
- **robots.txt** im Repo-Root (neu erstellen):
  ```
  User-agent: *
  Disallow: /angebote/
  ```
- **Keine Verlinkung**: Weder in `index.html`, noch in Footer, noch in Sitemap

### 5.4 Theme-Toggle

Identisch zur Hauptseite — `localStorage.getItem('theme')` mit Default `dark`, Sun/Moon-SVG-Toggle im Header.

### 5.5 Responsive

Alle Sektionen mobile-optimiert (Breakpoints 480 / 600 / 768 / 900 / 1024). Tabellen werden auf < 768px zu vertikal gestapelten Cards.

## 6. Dateistruktur

```
/
├── index.html                              # bestehend, NICHT verändert
├── brand-guidelines.html                   # bestehend
├── kontakt.html                            # bestehend
├── (...)
├── robots.txt                              # NEU — blockiert /angebote/
├── angebote/
│   └── rewe-wein-online.html               # NEU — verschlüsselte Angebotsseite
└── tools/
    ├── encrypt-offer.js                    # NEU — Build-Script
    └── offer-content.html                  # NEU — Klartext-Body (gitignored ODER privat)
```

**Hinweis Klartext-Quelle**: `tools/offer-content.html` enthält den unverschlüsselten Inhalt. Da das Repo `D3n1s23/tsd-website` öffentlich auf GitHub liegt, wird `tools/offer-content.html` per `.gitignore` ausgeschlossen. Nur die verschlüsselte `/angebote/rewe-wein-online.html` wird committet.

## 7. Inhaltliche Detail-Texte (Auszug)

**Hero-Sub:**
> Liebe Kim Mathives, vielen Dank für das Interesse an einer Zusammenarbeit. Auf den folgenden Seiten finden Sie unsere Analyse Ihres aktuellen Marketing-Setups und drei konkrete Leistungsmodule, die wir auf Basis dieser Analyse für Weinfreunde vorschlagen.

**Sektion 02 — Über TSD:**
- Spalte 1: „TSD Design GmbH ist ein Studio für strategisches Design, Software und KI-Kreativsysteme." (Layer-Tag „Disziplinen")
- Spalte 2: „Wir arbeiten an der Schnittstelle von Marke, Technologie und Skalierung." (Layer-Tag „Schnittstelle")
- Spalte 3: „Für Marketing-Creative bedeutet das: handgemacht, wenn nötig — automatisiert, wenn möglich." (Layer-Tag „Ansatz")

**Insights mit Quellen** (Sektion 03) — verlinken auf:
- Insight 1: `https://karriere.rewe-group.com/weinfreunde/`
- Insight 2: `https://www.weinfreunde.de/` + `https://www.instagram.com/weinfreunde/`
- Insight 3: `https://www.weinfreunde.de/magazin/` (Magazin-Sektion auf Haupt-Domain)
- Insight 4: `https://de.linkedin.com/company/weinfreunde-de`

## 8. Acceptance-Kriterien

- [ ] Seite öffnet sich nur nach Eingabe des Passworts `rewewein`
- [ ] Falsches Passwort zeigt Fehlermeldung, kein Inhalt sichtbar
- [ ] Quelltext zeigt KEINE Klartext-Inhalte der Angebots-Sektionen (nur verschlüsselte Payload)
- [ ] Robots-Meta-Tag und `robots.txt` blockieren Indexierung
- [ ] Theme-Toggle funktioniert wie auf Hauptseite
- [ ] Mobile-Layout korrekt auf 375px–1440px
- [ ] Alle 9 Sektionen vollständig
- [ ] Investitionsübersicht-Tabelle mit allen 5 Modellen, korrekte Pricing-Werte
- [ ] Kontaktdaten korrekt: mail@tsd-design.de, +49 (0) 173 78 43 778, Denis Papadopulos
- [ ] Empfänger-Anrede: Kim Mathives
- [ ] Datum: 20. April 2026, Gültigkeit: 20. Juli 2026
- [ ] Keine Verlinkung von Hauptseiten auf das Angebot

## 9. Out of Scope

- Keine separate Print-Version (PDF) — falls gewünscht, separates Folge-Projekt
- Keine Sprache außer Deutsch
- Kein Server-Side-Auth (GitHub Pages unterstützt das nicht ohne weitere Infrastruktur)
- Keine Analytics / Tracking auf der Angebotsseite
- Kein E-Mail-Trigger bei Login (kein Backend)
- Keine Vertragsdetails / AGB / Datenschutzhinweise auf der Angebotsseite (Verweis auf bestehende Seiten genügt)

## 10. Risiken & Annahmen

- **Annahme**: Der Empfänger akzeptiert eine HTML-Seite als Angebotsformat (kein PDF-Anhang). Falls nicht: nachgelagert PDF-Export aus der Seite via Browser-Print.
- **Risiko**: Der Klartext-Inhalt liegt lokal in `tools/offer-content.html`. Falls dieser versehentlich committet wird, ist das Angebot kompromittiert. Mitigation: `.gitignore`-Eintrag + Pre-Commit-Hinweis.
- **Annahme**: Kim Mathives ist die korrekte Ansprechperson und ihr Job-Titel ist nicht öffentlich bekannt — Anrede ohne Titel.
- **Annahme**: Die Recherche-Insights sind zum 20. April 2026 gültig. Bei späterem Versand sollte die Recherche aktualisiert werden.

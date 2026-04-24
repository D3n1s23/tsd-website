# Spec: Kundengalerie (Passwortgeschützte Case Page)

**Datum:** 2026-04-24
**Branch:** `finetuning-design`
**Ziel-Datei:** `cases.html`

## Zweck

Eine passwortgeschützte Portfolio-Seite, die Kundenprojekte von 2007 bis 2026 in einem langen, ruhigen Scroll-Erlebnis zeigt. Maximale Bildwirkung, minimaler Text, nur per Direktlink erreichbar. Nicht öffentlich verlinkt, nicht von Suchmaschinen indizierbar.

## High-Level-Struktur

Eine einzelne HTML-Datei mit Login-Overlay. Nach Passwort-Eingabe (`salvador`) wird der gesamte Galerieinhalt sichtbar. Inhalte nach Jahren gruppiert, jedes Jahr ist eine klickbare Akkordeon-Sektion. Direkter Einstieg ohne Hero/Intro.

## Architektur

### Dateien

- **`cases.html`** — Hauptseite, direkt im Projekt-Root (analog zu `brand-guidelines.html`, `impressum.html`)
- **`cases/<kunden-slug>/`** — ein Unterordner pro Kunde mit `logo.svg` (oder `.png` mit Transparenz) und `01.jpg`, `02.jpg`, … bis zu 5 Bilder
- **`cases/`** — bestehende Platzhalter (`01.png`, `ref-logo_dec-logo-full.svg`) werden im Zuge der Implementierung in `cases/_placeholder/` verschoben

### Keine Dependencies

- Kein Build-Step, kein Framework, keine npm-Pakete
- Alles handgeschrieben HTML/CSS/vanilla JS
- CSS-Variablen aus bestehendem Site-System (`--bg-dark`, `--text-white`, `--text-light`, `--text-muted`, `--accent`, `--border-subtle`, `--font-sans`, `--font-serif`)
- Fonts via Google Fonts wie auf Rest der Site (Inter + Playfair Display)

## Passwortschutz

### Mechanismus

Simples JS-Gate (kein AES, keine echte Kryptographie). HTML und Bilder sind technisch gesehen im Quelltext/über direkte URLs erreichbar — das Gate hält Gelegenheitsbesucher fern, nicht zielgerichtete Angreifer.

**Flow:**
1. Seite lädt, Login-Overlay wird angezeigt, `#cases-root` ist via CSS versteckt
2. Bei Seitenladen: prüfe `sessionStorage.getItem('cases-auth') === '1'` — wenn ja, Overlay sofort ausblenden und Content zeigen
3. Bei Passwort-Submit: SHA-256-Hash des Inputs mit hardcoded Hash vergleichen
4. Bei Match: `sessionStorage.setItem('cases-auth', '1')`, Overlay entfernen, `#cases-root` einblenden
5. Bei Fehler: Fehlerzeile ("Passwort nicht korrekt."), Input behält Fokus

**Passwort:** `salvador`
**SHA-256 Hash:** `877400dccdd18db5b4abc0ac761b4d647259d8e06bace1cc908c80eaa9d4969d`

Hash via Web Crypto API (`crypto.subtle.digest`), kein externes Script nötig. Session-basiert — Browser-Close loggt aus, Reload bleibt eingeloggt.

### Login-Overlay-Design

- Dark-Karte mittig, 420px max-width, analog zu `tools/offer-template.html` (ohne Branding-Flow-Gradient oben)
- TSD-Logo-SVG oben, 56px
- Überschrift: "Kundengalerie"
- Text: "Bitte geben Sie das Passwort ein, das Sie von uns erhalten haben."
- Password-Input mit autofocus, Submit-Button "Öffnen"
- Fehlerzeile (aria-live="polite") für "Passwort nicht korrekt."
- Footer: "Vertraulich" als Uppercase-Label

## Seitenlayout

### Theme

Nur Dark-Theme. `<html data-theme="dark">` fest gesetzt, keine Theme-Toggle auf dieser Seite. Keine dynamische Umschaltung.

### SEO / Privacy

```html
<meta name="robots" content="noindex, nofollow, noarchive">
```

Kein Link auf `cases.html` von anderen Site-Seiten. `sitemap.xml` (falls vorhanden) ausgenommen.

### Kein Hero, keine Navigation

Nach Login direkt Einstieg in die erste Jahres-Sektion (`2026`). Keine Header-Nav, keine Anchor-Links, kein Intro-Text. Reine Scroll-Erfahrung.

## Jahres-Akkordeon

### Tier-System (Größenabstufung)

| Tier | Jahre | Playfair Font-Size | Desktop Padding oben |
|---|---|---|---|
| 1 | 2024–2026 | 5.5rem | 4rem |
| 2 | 2020–2023 | 3rem | 2.5rem |
| 3 | 2007–2019 | 1.8rem | 1.3rem |

Jahre vor 2007 werden aktuell nicht angezeigt. Wenn 2027 kommt: Tier-Grenzen in CSS manuell anpassen (Tier 1 wird 2025–2027, Tier 2 wird 2021–2024, etc.).

### HTML-Struktur

```html
<section class="year-section tier-1" data-year="2026" data-open="true">
  <div class="year-header" role="button" tabindex="0" aria-expanded="true" aria-controls="year-2026-body">
    <span class="y">2026</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">3 Projekte</div>
  <div class="year-body" id="year-2026-body">
    <!-- Cases -->
  </div>
</section>
```

### Verhalten

- **Default offen**: `2026` und `2025` (beide `data-open="true"`)
- **Alle anderen**: `data-open="false"` initial
- **Toggle**: Klick auf `.year-header` oder Tastatur (Enter / Space) togglet `data-open`
- **Unabhängig**: Mehrere Jahre können gleichzeitig offen sein, keine "one-at-a-time"-Beschränkung
- **Counter** ("3 Projekte") wird manuell im HTML gepflegt, keine JS-Zählung
- **Trennlinie**: 1px `rgba(255,255,255,0.06)` oberhalb jeder Sektion (erste Sektion ohne Linie)
- **Chevron-Rotation**: bei offenem Zustand um 45° gedreht (aus `+` wird `×`-ähnlich)

### Collapsed-Zustand

- Jahreszahl in `rgba(255,255,255,0.35)`
- Hover-Zustand: Farbe → `rgba(255,255,255,0.75)`
- Counter-Text mit `opacity: 0.5`
- Cursor: `pointer`, `user-select: none` auf dem Header

## Case-Block (pro Kunde)

### HTML-Struktur

```html
<article class="case" data-client="fibe-messe-berlin">
  <img src="cases/fibe-messe-berlin/logo.svg" class="case-logo" alt="FIBE Messe Berlin">
  <div class="case-meta">2025 / 2026 · FIBE, Messe Berlin</div>
  <div class="case-discipline">Creative Direction</div>
  <p class="case-description">
    Ganzheitliche Konzeption und Umsetzung von Marketingmaßnahmen,
    darunter integrierte Kampagnen, Landingpages, Printanzeigen,
    Illustrationen sowie In-Store-Konzepte, Roadshows und Eventformate.
  </p>
  <div class="case-images">
    <img src="cases/fibe-messe-berlin/01.jpg" alt="">
    <img src="cases/fibe-messe-berlin/02.jpg" alt="">
    <img src="cases/fibe-messe-berlin/03.jpg" alt="">
  </div>
</article>
```

### Visuelle Spezifikation

Container:
- `max-width: 1000px`, zentriert
- `padding: 0 2rem` (Desktop), `0 1.25rem` (Mobile < 640px)
- `margin-bottom: 4.5rem`
- `text-align: center`

Vertikale Reihenfolge:
1. **Logo**: `height: 44px`, `width: auto`, `opacity: 0.9`, zentriert, `margin-bottom: 1.4rem` (Breite passt sich automatisch an Logo-Proportionen an)
2. **Meta-Zeile** (`.case-meta`): `font-size: 0.72rem`, `letter-spacing: 0.18em`, `text-transform: uppercase`, `color: var(--text-muted)`, `margin-bottom: 0.3rem`
   - Format: `<YAHR ODER JAHRES-SPANNE> · <KUNDE>` — z.B. `2025 / 2026 · FIBE, Messe Berlin`
3. **Discipline** (`.case-discipline`): `font-size: 0.72rem`, `letter-spacing: 0.12em`, `text-transform: uppercase`, `color: var(--accent)`, `margin-bottom: 1.2rem`
   - Format: `Creative Direction` oder `Branding, Editorial`
4. **Beschreibung** (`.case-description`): `font-size: 0.92rem`, `line-height: 1.65`, `font-weight: 300`, `color: var(--text-light)`, `max-width: 55ch`, `margin: 0 auto 2.2rem`
5. **Bilder-Grid** (`.case-images`): siehe unten

### Bilder-Grid

```css
.case-images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.case-images img {
  width: 100%;
  display: block;
  border-radius: 2px;
}
@media (max-width: 1000px) {
  .case-images {
    grid-template-columns: 1fr;
  }
}
```

**Ungerade Bildanzahl**: Grid-Flow füllt links-nach-rechts, zeilenweise. Bei ungerader Zahl landet das letzte Bild automatisch in der linken Spalte, die rechte Spalte bleibt leer. Kein `.solo`-Modifier, keine Zusatzlogik.

**Beispiele:**
- 1 Bild → links, rechts leer
- 2 Bilder → nebeneinander
- 3 Bilder → Reihe 1 voll, Reihe 2 links
- 4 Bilder → zwei volle Reihen
- 5 Bilder → zwei volle Reihen + Reihe 3 links

**Mobile (< 1000px)**: Grid kollabiert zu einer Spalte, alle Bilder gestapelt.

**Bild-Proportionen**: Bilder behalten ihre native Aspect Ratio (`height: auto`, `width: 100%`). Unterschiedliche Bildformate innerhalb einer Case führen zu unterschiedlichen Bildhöhen — das ist gewollt und Teil der editorialen Haltung. Bilder sollen als JPG oder WebP geliefert werden (für Fotos), SVG oder PNG mit Transparenz für Logos.

### Reihenfolge-Regeln

- **Jahre**: absteigend, neuestes (2026) zuerst, ältestes (2007) zuletzt
- **Cases innerhalb eines Jahres**: in HTML-Reihenfolge, manuell entschieden beim Pflegen
- **Bilder innerhalb einer Case**: in HTML-Reihenfolge; Dateinamen `01.jpg`, `02.jpg` sind Organisations­hilfen im Dateisystem, keine automatische Sortierung

## JavaScript

### Inline-Script in `cases.html`

```javascript
(function() {
  const PASSWORD_HASH = '877400dccdd18db5b4abc0ac761b4d647259d8e06bace1cc908c80eaa9d4969d';

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const overlay = document.getElementById('loginOverlay');
  const root = document.getElementById('cases-root');
  const form = document.getElementById('loginForm');
  const input = document.getElementById('passwordInput');
  const errorEl = document.getElementById('loginError');

  // Already authenticated this session?
  if (sessionStorage.getItem('cases-auth') === '1') {
    overlay.style.display = 'none';
    root.classList.add('revealed');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const hash = await sha256(input.value);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem('cases-auth', '1');
      overlay.style.display = 'none';
      root.classList.add('revealed');
    } else {
      errorEl.textContent = 'Passwort nicht korrekt.';
      input.select();
    }
  });

  // Year accordion toggle
  document.querySelectorAll('.year-header').forEach(header => {
    const toggle = () => {
      const section = header.closest('.year-section');
      const isOpen = section.dataset.open === 'true';
      section.dataset.open = isOpen ? 'false' : 'true';
      header.setAttribute('aria-expanded', String(!isOpen));
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
})();
```

Kein Framework, kein Bundler, keine externen Libs.

## Pflege-Workflow (für Denis)

### Neuen Kunden hinzufügen

1. Ordner anlegen: `cases/<slug>/` (kebab-case, z.B. `fibe-messe-berlin`)
2. Assets reinlegen: `logo.svg` (oder `.png`), `01.jpg`, `02.jpg`, … bis max 5 Bilder
3. In `cases.html` an der richtigen Stelle (richtiges Jahr, gewünschte Position innerhalb) ein `<article class="case">`-Block einfügen
4. Counter im `<div class="year-counter">` des betroffenen Jahres um 1 erhöhen

### Neues Jahr hinzufügen

1. Neue `<section class="year-section tier-N">` am Anfang der Galerie einfügen
2. Richtige Tier-Klasse wählen (Tier 1 = aktuelle 3 Jahre)
3. Ggf. Tier-Grenzen in CSS anpassen, wenn Jahre in einen anderen Tier rutschen

## Barrierefreiheit

- `role="button"` + `tabindex="0"` + `aria-expanded` auf Year-Headern
- `aria-controls` auf Year-Header verweist auf `.year-body`-ID
- Keyboard-Support (Enter/Space)
- `aria-live="polite"` auf Login-Fehlerzeile
- Leere `alt=""` auf Case-Bildern (dekorativ im Kontext des Case-Meta)
- Logo-`alt` trägt echten Kundennamen
- Fokus-Ringe auf Interaktions-Elementen (Input, Button, Year-Header)

## Was NICHT enthalten ist (YAGNI)

- Kein Lightbox / Click-to-enlarge
- Keine Filter nach Disziplin oder Kunde
- Keine Suche
- Kein Share-Link mit Deep-Link auf einzelne Cases
- Keine Animationen beim Akkordeon-Toggle (CSS-`display`-Wechsel, kein Smooth-Transition)
- Keine Lazy-Loading-Attribute auf Bildern (kann später ergänzt werden, falls die Seite zu langsam lädt)
- Keine Image-Optimierung (WebP/AVIF, responsive `srcset`) — kommt wenn nötig als Zweiter Schritt
- Kein Theme-Toggle
- Kein Service Worker, kein Offline-Mode
- Keine Analytics

## Akzeptanzkriterien

1. Direkter Aufruf von `/cases.html` zeigt das Login-Overlay, Content nicht sichtbar im gerenderten DOM
2. Passwort `salvador` öffnet die Galerie
3. Falsches Passwort zeigt Fehlermeldung
4. Nach erfolgreichem Login: `2026` und `2025` sind expanded, alle anderen Jahre collapsed
5. Klick auf Jahres-Header togglet den jeweiligen Jahrgang
6. Desktop (≥ 1000px): Case-Bilder 2-spaltig, ungerade Anzahl → letztes Bild links, rechts leer
7. Mobile (< 1000px): Case-Bilder 1-spaltig
8. Tier-Größen: 2024–2026 Playfair 5.5rem, 2020–2023 3rem, 2007–2019 1.8rem
9. Bei Reload im selben Tab: Login wird übersprungen; neuer Tab: Login-Prompt erscheint wieder
10. `<meta robots="noindex, nofollow, noarchive">` ist gesetzt
11. Keine JS-Fehler in der Browser-Konsole
12. Seite rendert korrekt in modernen Browsern (Chrome, Safari, Firefox, Edge der letzten 2 Jahre)

## Platzhalter-Umzug

Bestehende Platzhalter-Dateien in `cases/`:
- `cases/01.png` → `cases/_placeholder/01.png`
- `cases/ref-logo_dec-logo-full.svg` → `cases/_placeholder/logo.svg`

Die exemplarische erste Case im HTML nutzt diese Platzhalter initial, bis echte Kunden-Assets vorliegen. Die Spec verlangt nicht, dass das Erstrelease mit echten Kunden gefüllt ist — eine exemplarische Case mit Platzhalter-Assets reicht, um die Struktur zu demonstrieren.

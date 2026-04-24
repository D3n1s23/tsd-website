# Kundengalerie (cases.html) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passwortgeschützte Portfolio-Seite `cases.html` mit Jahres-Akkordeon (2007–2026) und zweispaltigem Case-Layout, umgesetzt in einer einzelnen HTML-Datei mit inline CSS/JS.

**Architecture:** Single-file handgeschriebenes HTML (wie `brand-guidelines.html`, `impressum.html`). Login-Gate via SHA-256-Hash-Check gegen `sessionStorage`. Jahres-Akkordeon mit `data-open`-Attribut und CSS-Toggle (kein JS-Animations-Framework). Bild-Grid mit CSS-Grid (2-spaltig ab 1000px, 1-spaltig darunter).

**Tech Stack:** HTML5, CSS3 (Custom Properties, CSS Grid, Media Queries), Vanilla JavaScript (Web Crypto API für SHA-256), Google Fonts (Inter + Playfair Display). Keine Dependencies, kein Build-Step, kein Framework.

**Referenz:** Spec unter [docs/superpowers/specs/2026-04-24-cases-kundengalerie-design.md](../specs/2026-04-24-cases-kundengalerie-design.md).

**Verifikation:** Statt Unit-Tests (Projekt hat keine) wird jeder Task über manuelle Browser-Checks an `http://localhost:9090/cases.html` verifiziert (Python-HTTP-Server läuft bereits).

---

## File Structure

```
cases.html                                 (NEU — Hauptseite)
cases/_placeholder/01.png                  (umgezogen von cases/01.png)
cases/_placeholder/logo.svg                (umgezogen von cases/ref-logo_dec-logo-full.svg)
docs/superpowers/specs/2026-04-24-cases-kundengalerie-design.md   (bereits vorhanden)
```

Keine weiteren Dateien neu, kein CSS/JS ausgelagert. Alles inline in `cases.html`.

---

## Task 1: Platzhalter-Assets umziehen

**Files:**
- Move: `cases/01.png` → `cases/_placeholder/01.png`
- Move: `cases/ref-logo_dec-logo-full.svg` → `cases/_placeholder/logo.svg`

- [ ] **Step 1: Verzeichnis anlegen**

```bash
mkdir -p cases/_placeholder
```

- [ ] **Step 2: Assets umziehen**

```bash
git mv cases/01.png cases/_placeholder/01.png
git mv cases/ref-logo_dec-logo-full.svg cases/_placeholder/logo.svg
```

- [ ] **Step 3: Verifikation**

```bash
ls cases/_placeholder/
# Expected: 01.png  logo.svg
ls cases/
# Expected: _placeholder  (nichts anderes)
```

- [ ] **Step 4: Commit**

```bash
git commit -m "Move case placeholder assets to cases/_placeholder/"
```

---

## Task 2: Dateigerüst + Login-Overlay (HTML)

**Files:**
- Create: `cases.html`

- [ ] **Step 1: Grundgerüst mit `<head>` schreiben**

Lege `cases.html` im Projekt-Root an. Inhalt:

```html
<!DOCTYPE html>
<html lang="de" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Kundengalerie — TSD Design GmbH</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>
/* Styles kommen in Task 3 */
</style>
</head>
<body>

<!-- ============= LOGIN OVERLAY ============= -->
<div class="login-overlay" id="loginOverlay">
  <div class="login-card">
    <img src="images/logo/tsd_logo_animated.svg" alt="TSD Design" class="login-logo">
    <div class="login-overline">TSD Design GmbH</div>
    <h1>Kundengalerie</h1>
    <p>Bitte geben Sie das Passwort ein, das Sie von uns erhalten haben.</p>
    <form class="login-form" id="loginForm" autocomplete="off">
      <input
        type="password"
        id="passwordInput"
        placeholder="Passwort"
        required
        autofocus
      >
      <button type="submit" id="loginButton">Öffnen</button>
    </form>
    <div class="login-error" id="loginError" role="alert" aria-live="polite"></div>
    <div class="login-footer">Vertraulich</div>
  </div>
</div>

<!-- ============= CASES ROOT (after auth) ============= -->
<div id="cases-root"></div>

<script>
// JS kommt in Task 4
</script>

</body>
</html>
```

- [ ] **Step 2: Verifikation — Datei liegt am richtigen Ort**

```bash
ls -l cases.html
# Expected: -rw-r--r--  1 user  staff   ~1500  cases.html
```

- [ ] **Step 3: Verifikation — Logo-Pfad existiert**

```bash
ls images/logo/tsd_logo_animated.svg
# Expected: images/logo/tsd_logo_animated.svg  (sollte vorhanden sein; wenn nicht, mit tsd_logo.svg ersetzen)
```

Falls die Datei nicht exakt so heißt:

```bash
ls images/logo/
```

Wähle das tatsächlich vorhandene TSD-Logo und ersetze den `src`-Pfad im HTML entsprechend.

- [ ] **Step 4: Commit**

```bash
git add cases.html
git commit -m "Add cases.html skeleton with login overlay markup"
```

---

## Task 3: CSS — Theme-Variablen, Reset, Login-Overlay-Styles

**Files:**
- Modify: `cases.html` (`<style>`-Block)

- [ ] **Step 1: CSS-Variablen + Reset + Login-Overlay-Styles einfügen**

Ersetze `/* Styles kommen in Task 3 */` im `<style>`-Block durch:

```css
:root {
  --bg-dark: #111111;
  --bg-darker: #0a0a0a;
  --bg-section: #161616;
  --bg-card: #1c1c1c;
  --text-white: #ffffff;
  --text-light: #e0ddd7;
  --text-muted: #8c8880;
  --text-dark: #1a1a1a;
  --accent: #c5a46d;
  --accent-hover: #d4b87e;
  --border-subtle: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.12);
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-sans);
  background: var(--bg-dark);
  color: var(--text-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }

/* ---- LOGIN OVERLAY ---- */
.login-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: var(--bg-dark);
  display: flex; align-items: center; justify-content: center;
  padding: 2rem;
}
.login-card {
  width: 100%; max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 3rem 2.5rem;
  text-align: center;
}
.login-logo { width: 56px; height: 56px; margin: 0 auto 1.5rem; }
.login-overline {
  font-size: 0.72rem; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent);
  margin-bottom: 0.75rem;
}
.login-card h1 {
  font-family: var(--font-serif);
  font-size: 1.6rem; font-weight: 400; line-height: 1.3;
  margin-bottom: 1.5rem;
}
.login-card p {
  font-size: 0.9rem; color: var(--text-muted); font-weight: 300;
  line-height: 1.6; margin-bottom: 2rem;
}
.login-form { display: flex; flex-direction: column; gap: 0.75rem; }
.login-form input {
  width: 100%; padding: 0.85rem 1rem;
  background: var(--bg-section); border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-white); font-family: var(--font-sans);
  font-size: 0.95rem; font-weight: 400;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.login-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(197,164,109,0.12);
}
.login-form button {
  padding: 0.9rem 1.5rem;
  background: var(--accent); color: var(--text-dark);
  border: none; border-radius: 6px;
  font-family: var(--font-sans); font-weight: 600; font-size: 0.9rem;
  cursor: pointer; transition: background 0.3s;
}
.login-form button:hover { background: var(--accent-hover); }
.login-error {
  margin-top: 1rem; font-size: 0.82rem;
  color: #d36e6e; min-height: 1.2em;
}
.login-footer {
  margin-top: 2rem; padding-top: 1.5rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.72rem; color: var(--text-muted);
  letter-spacing: 0.1em; text-transform: uppercase;
}

/* Cases root (versteckt bis Login ok) */
#cases-root { display: none; }
#cases-root.revealed { display: block; }
```

- [ ] **Step 2: Verifikation im Browser**

Öffne `http://localhost:9090/cases.html`. Prüfe:
- Dunkler Hintergrund (`#111`)
- Login-Karte mittig mit TSD-Logo oben
- Überschrift "Kundengalerie" in Playfair-Schrift
- Input-Feld + Gold-Button "Öffnen"
- Footer "VERTRAULICH" in Uppercase
- Keine Konsolen-Fehler (DevTools öffnen)

- [ ] **Step 3: Commit**

```bash
git add cases.html
git commit -m "Add login overlay styles for cases page"
```

---

## Task 4: Login-JavaScript (SHA-256-Hash-Check + sessionStorage)

**Files:**
- Modify: `cases.html` (`<script>`-Block)

- [ ] **Step 1: Login-JS einfügen**

Ersetze `// JS kommt in Task 6` durch:

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
  const button = document.getElementById('loginButton');

  function revealGallery() {
    overlay.style.display = 'none';
    root.classList.add('revealed');
  }

  if (sessionStorage.getItem('cases-auth') === '1') {
    revealGallery();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    button.disabled = true;
    button.textContent = 'Prüfen …';
    try {
      const hash = await sha256(input.value);
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem('cases-auth', '1');
        revealGallery();
      } else {
        errorEl.textContent = 'Passwort nicht korrekt.';
        input.select();
      }
    } catch (err) {
      errorEl.textContent = 'Fehler beim Prüfen. Bitte erneut versuchen.';
    } finally {
      button.disabled = false;
      button.textContent = 'Öffnen';
    }
  });
})();
```

- [ ] **Step 2: Verifikation — Falsches Passwort**

Browser-Reload `http://localhost:9090/cases.html`. Gib irgendein falsches Passwort ein und klicke "Öffnen".
- Erwartet: Fehlerzeile zeigt "Passwort nicht korrekt.", Input wird markiert (für Überschreiben).
- DevTools-Konsole: keine Fehler.

- [ ] **Step 3: Verifikation — Richtiges Passwort**

Gib `salvador` ein und klicke "Öffnen".
- Erwartet: Overlay verschwindet. Seite ist (noch) leer — `#cases-root` ist sichtbar aber leer (Content kommt ab Task 5).
- DevTools → Application → Session Storage → `localhost:9090`: `cases-auth` = `1`.

- [ ] **Step 4: Verifikation — Reload bleibt eingeloggt**

Reload `http://localhost:9090/cases.html` im selben Tab.
- Erwartet: Overlay erscheint nicht mehr, direkter Zugriff auf leere Seite.

- [ ] **Step 5: Verifikation — Neuer Tab verlangt Login**

Öffne `http://localhost:9090/cases.html` in einem neuen Inkognito-Fenster.
- Erwartet: Login-Overlay erscheint wieder.

- [ ] **Step 6: Commit**

```bash
git add cases.html
git commit -m "Add password gate with SHA-256 hash check and sessionStorage"
```

---

## Task 5: Galerie-Container + CSS für Case-Root

**Files:**
- Modify: `cases.html`

- [ ] **Step 1: Cases-Root-Content-Container einbauen**

Ersetze `<div id="cases-root"></div>` durch:

```html
<!-- ============= CASES ROOT (after auth) ============= -->
<div id="cases-root">
  <main class="cases-main">
    <!-- Jahres-Sektionen kommen in Task 6 -->
  </main>
  <footer class="cases-footer">— Ende —</footer>
</div>
```

- [ ] **Step 2: CSS für Galerie-Main + Footer hinzufügen**

Direkt vor `/* Cases root (versteckt bis Login ok) */` (oder am Ende des `<style>`-Blocks — Reihenfolge egal solange vor der nächsten Regel) einfügen:

```css
/* ---- CASES MAIN ---- */
.cases-main {
  min-height: 100vh;
}
.cases-footer {
  padding: 5rem 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border-top: 1px solid var(--border-subtle);
  margin-top: 3rem;
}
```

- [ ] **Step 3: Verifikation**

Reload `http://localhost:9090/cases.html` (ggf. in neuem Inkognito-Fenster + Passwort `salvador` eingeben).
- Erwartet: Nach Login leere Seite mit "— ENDE —" unten.

- [ ] **Step 4: Commit**

```bash
git add cases.html
git commit -m "Add cases root container with empty main and footer"
```

---

## Task 6: Jahres-Sektionen HTML (2007–2026) + Counter

**Files:**
- Modify: `cases.html`

- [ ] **Step 1: 20 Jahres-Sektionen als HTML einfügen**

Ersetze `<!-- Jahres-Sektionen kommen in Task 6 -->` durch die folgende Liste. Die Counter-Zahlen sind vorerst realistische Schätzungen (können später beim Pflegen angepasst werden):

```html
<section class="year-section tier-1" data-year="2026" data-open="true">
  <div class="year-header" role="button" tabindex="0" aria-expanded="true" aria-controls="year-body-2026">
    <span class="y">2026</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2026"></div>
</section>

<section class="year-section tier-1" data-year="2025" data-open="true">
  <div class="year-header" role="button" tabindex="0" aria-expanded="true" aria-controls="year-body-2025">
    <span class="y">2025</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2025"></div>
</section>

<section class="year-section tier-1" data-year="2024" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2024">
    <span class="y">2024</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2024"></div>
</section>

<section class="year-section tier-2" data-year="2023" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2023">
    <span class="y">2023</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2023"></div>
</section>

<section class="year-section tier-2" data-year="2022" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2022">
    <span class="y">2022</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2022"></div>
</section>

<section class="year-section tier-2" data-year="2021" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2021">
    <span class="y">2021</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2021"></div>
</section>

<section class="year-section tier-2" data-year="2020" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2020">
    <span class="y">2020</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2020"></div>
</section>

<section class="year-section tier-3" data-year="2019" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2019">
    <span class="y">2019</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2019"></div>
</section>

<section class="year-section tier-3" data-year="2018" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2018">
    <span class="y">2018</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2018"></div>
</section>

<section class="year-section tier-3" data-year="2017" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2017">
    <span class="y">2017</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2017"></div>
</section>

<section class="year-section tier-3" data-year="2016" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2016">
    <span class="y">2016</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2016"></div>
</section>

<section class="year-section tier-3" data-year="2015" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2015">
    <span class="y">2015</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2015"></div>
</section>

<section class="year-section tier-3" data-year="2014" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2014">
    <span class="y">2014</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2014"></div>
</section>

<section class="year-section tier-3" data-year="2013" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2013">
    <span class="y">2013</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2013"></div>
</section>

<section class="year-section tier-3" data-year="2012" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2012">
    <span class="y">2012</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2012"></div>
</section>

<section class="year-section tier-3" data-year="2011" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2011">
    <span class="y">2011</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2011"></div>
</section>

<section class="year-section tier-3" data-year="2010" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2010">
    <span class="y">2010</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2010"></div>
</section>

<section class="year-section tier-3" data-year="2009" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2009">
    <span class="y">2009</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2009"></div>
</section>

<section class="year-section tier-3" data-year="2008" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2008">
    <span class="y">2008</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2008"></div>
</section>

<section class="year-section tier-3" data-year="2007" data-open="false">
  <div class="year-header" role="button" tabindex="0" aria-expanded="false" aria-controls="year-body-2007">
    <span class="y">2007</span>
    <span class="chev" aria-hidden="true">+</span>
  </div>
  <div class="year-counter">0 Projekte</div>
  <div class="year-body" id="year-body-2007"></div>
</section>
```

- [ ] **Step 2: Verifikation**

Reload. Seite zeigt jetzt alle 20 Jahreszahlen untereinander — noch ohne Styles, also schlichter Text. Zähle: 2026, 2025, 2024, … 2007. DevTools-Konsole ohne Fehler.

- [ ] **Step 3: Commit**

```bash
git add cases.html
git commit -m "Add 20 year sections from 2007 to 2026 with tier classes"
```

---

## Task 7: CSS — Jahres-Sektionen (alle drei Tier-Größen + Collapsed-State)

**Files:**
- Modify: `cases.html`

- [ ] **Step 1: Jahres-Styles hinzufügen**

Füge am Ende des `<style>`-Blocks (vor `</style>`) ein:

```css
/* ---- YEAR ACCORDION ---- */
.year-section { border-top: 1px solid rgba(255,255,255,0.06); }
.year-section:first-of-type { border-top: none; }

.year-header {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s;
}
.year-header:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 4px;
}
.year-header .y {
  font-family: var(--font-serif);
  font-weight: 400;
  line-height: 1;
  color: var(--text-white);
  letter-spacing: -0.01em;
  transition: color 0.3s;
}
.year-header .chev {
  color: var(--accent);
  transition: transform 0.3s;
}
.year-section[data-open="false"] .year-header .y { color: rgba(255,255,255,0.35); }
.year-section[data-open="false"]:hover .year-header .y { color: rgba(255,255,255,0.75); }

.year-counter {
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: center;
  font-family: var(--font-sans);
}
.year-section[data-open="false"] .year-counter { opacity: 0.5; }

/* Tier 1: 2024–2026 */
.tier-1 .year-header { padding: 4rem 2rem 1rem; }
.tier-1 .year-header .y { font-size: 5.5rem; }
.tier-1 .year-header .chev { font-size: 1rem; transform: translateY(-0.5rem); }
.tier-1[data-open="true"] .year-header .chev { transform: translateY(-0.5rem) rotate(45deg); }
.tier-1 .year-counter { font-size: 0.72rem; padding-bottom: 2.5rem; }

/* Tier 2: 2020–2023 */
.tier-2 .year-header { padding: 2.5rem 2rem 0.5rem; }
.tier-2 .year-header .y { font-size: 3rem; }
.tier-2 .year-header .chev { font-size: 0.8rem; transform: translateY(-0.3rem); }
.tier-2[data-open="true"] .year-header .chev { transform: translateY(-0.3rem) rotate(45deg); }
.tier-2 .year-counter { font-size: 0.68rem; padding-bottom: 1.5rem; }

/* Tier 3: 2007–2019 */
.tier-3 .year-header { padding: 1.3rem 2rem 0.3rem; }
.tier-3 .year-header .y { font-size: 1.8rem; }
.tier-3 .year-header .chev { font-size: 0.7rem; transform: translateY(-0.1rem); }
.tier-3[data-open="true"] .year-header .chev { transform: translateY(-0.1rem) rotate(45deg); }
.tier-3 .year-counter { font-size: 0.65rem; padding-bottom: 0.8rem; }

.year-body { display: none; }
.year-section[data-open="true"] .year-body { display: block; }

/* Mobile Anpassungen */
@media (max-width: 640px) {
  .tier-1 .year-header .y { font-size: 3.5rem; }
  .tier-1 .year-header { padding: 3rem 1.25rem 0.8rem; }
  .tier-2 .year-header .y { font-size: 2.2rem; }
  .tier-2 .year-header { padding: 2rem 1.25rem 0.5rem; }
  .tier-3 .year-header { padding: 1rem 1.25rem 0.3rem; }
}
```

- [ ] **Step 2: Verifikation — Tier-Größen visuell**

Reload `http://localhost:9090/cases.html`. Prüfe:
- **2026, 2025** — sehr groß (5.5rem) in Playfair, weiß, Chevron als `+` leicht rotiert (`×`-ähnlich, da `data-open="true"`)
- **2024** — gleich groß aber ausgegraut, Chevron nicht rotiert
- **2023–2020** — mittelgroß (3rem), ausgegraut
- **2019–2007** — klein (1.8rem), ausgegraut
- "— ENDE —" ganz unten sichtbar
- Counter "0 Projekte" unter jedem Jahres-Header
- Alle collapsed-Jahre: Hover → Jahr wird heller

- [ ] **Step 3: Verifikation — Mobile**

DevTools → Responsive-Modus, Breite 375px.
- Tier 1 ist jetzt 3.5rem statt 5.5rem
- Tier 2 ist 2.2rem
- Keine horizontalen Scrollbalken

- [ ] **Step 4: Commit**

```bash
git add cases.html
git commit -m "Add year accordion styles with three tier sizes"
```

---

## Task 8: Akkordeon-JS-Toggle (Click + Keyboard)

**Files:**
- Modify: `cases.html` (`<script>`-Block)

- [ ] **Step 1: Toggle-Logik im JS ergänzen**

Im bestehenden `<script>`-Block, VOR der schließenden `})()` (direkt nach dem `form.addEventListener(...)`-Block), ergänzen:

```javascript
  // ---- YEAR ACCORDION TOGGLE ----
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
```

- [ ] **Step 2: Verifikation — Click**

Reload + Login. Klick auf `2024` (ausgegraut).
- Erwartet: Jahreszahl wird weiß (wie 2026/2025), Chevron rotiert. Erneuter Klick klappt wieder zu.

Klick auf `2015`.
- Erwartet: Jahreszahl wird weiß, Chevron rotiert.

- [ ] **Step 3: Verifikation — Keyboard**

Tab-Taste bis ein Jahres-Header fokussiert ist (sichtbarer Gold-Outline). Enter oder Leertaste drücken.
- Erwartet: Sektion toggelt. `aria-expanded` wechselt im DevTools-Inspector entsprechend.

- [ ] **Step 4: Verifikation — Mehrere offen gleichzeitig**

Öffne 2024, 2020 und 2015. Alle sollten gleichzeitig offen bleiben.
- Erwartet: Keine "one at a time"-Beschränkung.

- [ ] **Step 5: Commit**

```bash
git add cases.html
git commit -m "Add accordion click and keyboard toggle for year headers"
```

---

## Task 9: Case-Block — HTML-Muster + CSS ohne Bilder

**Files:**
- Modify: `cases.html`

- [ ] **Step 1: Erste Case in 2026-Sektion einfügen**

Ersetze `<div class="year-body" id="year-body-2026"></div>` durch:

```html
<div class="year-body" id="year-body-2026">

  <article class="case" data-client="platzhalter-muster">
    <img src="cases/_placeholder/logo.svg" class="case-logo" alt="Kunde Musterbeispiel">
    <div class="case-meta">2025 / 2026 · Kunde Musterbeispiel</div>
    <div class="case-discipline">Creative Direction</div>
    <p class="case-description">
      Ganzheitliche Konzeption und Umsetzung von Marketingmaßnahmen, darunter integrierte Kampagnen, Landingpages, Printanzeigen, Illustrationen sowie In-Store-Konzepte, Roadshows und Eventformate.
    </p>
    <div class="case-images">
      <!-- Bilder kommen in Task 10 -->
    </div>
  </article>

</div>
```

- [ ] **Step 2: Counter auf "1 Projekt" setzen**

Im 2026-Section-Block: ersetze `<div class="year-counter">0 Projekte</div>` durch `<div class="year-counter">1 Projekt</div>`.

- [ ] **Step 3: Case-Styles hinzufügen**

Am Ende des `<style>`-Blocks (vor `</style>`) einfügen:

```css
/* ---- CASE BLOCK ---- */
.case {
  max-width: 1000px;
  margin: 0 auto 4.5rem;
  padding: 0 2rem;
  text-align: center;
}
.case-logo {
  height: 44px;
  width: auto;
  margin: 0 auto 1.4rem;
  opacity: 0.9;
}
.case-meta {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
}
.case-discipline {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1.2rem;
}
.case-description {
  font-size: 0.92rem;
  line-height: 1.65;
  font-weight: 300;
  color: var(--text-light);
  max-width: 55ch;
  margin: 0 auto 2.2rem;
}

@media (max-width: 640px) {
  .case { padding: 0 1.25rem; }
}
```

- [ ] **Step 4: Verifikation**

Reload + Login. In 2026 sichtbar:
- Logo (Platzhalter-SVG) zentriert
- Meta-Zeile "2025 / 2026 · KUNDE MUSTERBEISPIEL" in Uppercase-Grau
- Discipline "CREATIVE DIRECTION" in Gold-Uppercase
- Beschreibungstext in hellerem Grau, begrenzte Breite
- 2026-Counter zeigt jetzt "1 Projekt"

- [ ] **Step 5: Commit**

```bash
git add cases.html
git commit -m "Add first placeholder case block with styles"
```

---

## Task 10: Bilder-Grid (2-spaltig ab 1000px, 1-spaltig darunter)

**Files:**
- Modify: `cases.html`

- [ ] **Step 1: Bilder in die Platzhalter-Case einfügen**

Ersetze `<!-- Bilder kommen in Task 10 -->` durch drei Bilder (um die "ungerade" Logik zu demonstrieren):

```html
      <img src="cases/_placeholder/01.png" alt="">
      <img src="cases/_placeholder/01.png" alt="">
      <img src="cases/_placeholder/01.png" alt="">
```

- [ ] **Step 2: Grid-Styles hinzufügen**

Am Ende des `<style>`-Blocks (vor `</style>`) einfügen:

```css
/* ---- CASE IMAGES GRID ---- */
.case-images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.case-images img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 2px;
}
@media (max-width: 1000px) {
  .case-images {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verifikation — Desktop 2-Spalten**

DevTools-Breite auf 1200px stellen. Reload.
- Erwartet: Reihe 1 = 2 Bilder nebeneinander. Reihe 2 = 1 Bild in linker Spalte, rechts leerer Bereich.

- [ ] **Step 4: Verifikation — Mobile 1-Spalten**

DevTools-Breite auf 900px (unter Breakpoint).
- Erwartet: Alle 3 Bilder gestapelt, Full-Width.

DevTools-Breite auf 375px (Mobile).
- Erwartet: Weiter 1-spaltig, Seitenabstand 1.25rem.

- [ ] **Step 5: Verifikation — Gerade Bildanzahl**

Füge temporär ein viertes Bild hinzu (vor `</div>` von `.case-images`):
```html
<img src="cases/_placeholder/01.png" alt="">
```

DevTools 1200px.
- Erwartet: 2 Reihen à 2 Bilder, keine Lücke.

Entferne das vierte Bild wieder (zurück auf 3 Bilder).

- [ ] **Step 6: Commit**

```bash
git add cases.html
git commit -m "Add image grid with 2-column desktop layout and mobile fallback"
```

---

## Task 11: Finale Verifikation aller Akzeptanzkriterien

**Files:** Keine Änderungen — reine Verifikation gegen Spec.

- [ ] **Step 1: Akzeptanzkriterien-Checkliste abarbeiten**

Öffne Inkognito-Fenster auf `http://localhost:9090/cases.html` und prüfe die 12 Kriterien aus [docs/superpowers/specs/2026-04-24-cases-kundengalerie-design.md](../specs/2026-04-24-cases-kundengalerie-design.md) (Abschnitt "Akzeptanzkriterien"):

1. ✅ Direkter Aufruf zeigt Login-Overlay, Content nicht sichtbar im DOM → DevTools Elements: `#cases-root` hat `display: none`
2. ✅ Passwort `salvador` öffnet Galerie
3. ✅ Falsches Passwort zeigt Fehler
4. ✅ Nach Login: 2026 + 2025 expanded, Rest collapsed
5. ✅ Klick auf Jahres-Header togglet
6. ✅ Desktop ≥ 1000px: Bilder 2-spaltig, ungerade → links
7. ✅ Mobile < 1000px: Bilder 1-spaltig
8. ✅ Tier-Größen: 2026 = 5.5rem, 2020 = 3rem, 2015 = 1.8rem (DevTools → Computed Styles)
9. ✅ Reload bleibt eingeloggt (sessionStorage persistent), neuer Tab verlangt Login
10. ✅ `<meta robots="noindex, nofollow, noarchive">` vorhanden (View Source prüfen)
11. ✅ Keine JS-Errors (DevTools Console)
12. ✅ Rendering in mehreren Browsern (mindestens Chrome + Safari testen)

- [ ] **Step 2: Lighthouse-Schnellcheck (optional)**

DevTools → Lighthouse → Accessibility-Check.
- Erwartet: Score ≥ 90. Bei niedrigerem Score: Issues lesen, ggf. `lang`-Attribut auf Logo-Alt-Texten oder fehlende Fokus-Ringe nachbessern.

- [ ] **Step 3: Merge-Readiness — keine Änderungen mehr nötig**

Falls alle 12 Kriterien grün sind: fertig.

Falls eines rot: Issue benennen, als eigenen Task im Nachlauf fixen.

- [ ] **Step 4: Abschluss-Commit (falls Task 11 irgendetwas korrigiert hat)**

Nur wenn während der Verifikation Nachbesserungen nötig waren:

```bash
git add cases.html
git commit -m "Address final review findings for cases page"
```

Sonst: Task 11 hat keinen Commit.

---

## Zusammenfassung der Commits

Nach vollständiger Implementierung liegen folgende Commits auf dem Branch:

1. `Move case placeholder assets to cases/_placeholder/`
2. `Add cases.html skeleton with login overlay markup`
3. `Add login overlay styles for cases page`
4. `Add password gate with SHA-256 hash check and sessionStorage`
5. `Add cases root container with empty main and footer`
6. `Add 20 year sections from 2007 to 2026 with tier classes`
7. `Add year accordion styles with three tier sizes`
8. `Add accordion click and keyboard toggle for year headers`
9. `Add first placeholder case block with styles`
10. `Add image grid with 2-column desktop layout and mobile fallback`
11. (Optional) `Address final review findings for cases page`

---

## Danach

Die Seite ist funktionsfähig mit einer Platzhalter-Case. Zum Befüllen mit echten Kunden:
- Kundenordner anlegen: `cases/<slug>/`, Assets reinlegen
- `<article class="case">`-Block in richtiges Jahr einfügen
- Counter "X Projekte" in der Jahres-Sektion aktualisieren

Dieser Pflege-Workflow ist in der Spec ausführlich dokumentiert.

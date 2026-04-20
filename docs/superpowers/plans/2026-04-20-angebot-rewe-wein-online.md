# Angebotsseite REWE Wein online GmbH (Weinfreunde) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected, AES-encrypted HTML pitch page for REWE Wein online GmbH at `/angebote/rewe-wein-online.html`, using the existing TSD design system, with three service modules (Creative Assets, GEO Audit, KI-Kreativsystem).

**Architecture:** Static single-file HTML with browser-native AES-256-GCM content encryption. A Node build script reads a plaintext content file, encrypts the body with the password `rewewein` (PBKDF2 → 100k iterations → SHA-256), and injects the ciphertext into a wrapper template that contains a TSD-themed login UI and Web-Crypto-API decrypt logic. The plaintext source is gitignored; only the encrypted artifact is committed.

**Tech Stack:** Plain HTML/CSS/JS (no framework), Inter + Playfair Display fonts (Google Fonts CDN), Node.js `crypto` module for build-time encryption, Web Crypto API for browser-side decryption.

**Reference spec:** `docs/superpowers/specs/2026-04-20-angebot-rewe-wein-online-design.md`

---

## File Structure

```
/
├── robots.txt                              # NEW — block /angebote/
├── .gitignore                              # NEW — ignore plaintext source
├── angebote/
│   └── rewe-wein-online.html               # NEW — generated, encrypted artifact (committed)
├── tools/
│   ├── encrypt-offer.js                    # NEW — Node build script (committed)
│   ├── offer-template.html                 # NEW — wrapper with login + decrypt (committed)
│   ├── offer-content.html                  # NEW — plaintext body (gitignored)
│   └── test-encryption.js                  # NEW — round-trip encryption test (committed)
└── docs/superpowers/plans/
    └── 2026-04-20-angebot-rewe-wein-online.md  # this plan
```

**Responsibilities:**
- `tools/offer-template.html`: Visual shell — HTML head with TSD CSS, body with login form + theme toggle + decrypt JS. Contains `{{ENCRYPTED_PAYLOAD}}` placeholder. Committed and reviewable.
- `tools/offer-content.html`: Pure body markup (the 9 sections). Plaintext, gitignored.
- `tools/encrypt-offer.js`: Reads template + content, encrypts content with `rewewein`, replaces placeholder with payload JSON, writes `angebote/rewe-wein-online.html`.
- `tools/test-encryption.js`: Verifies encrypt/decrypt round-trip works (Node-only test, no browser).
- `angebote/rewe-wein-online.html`: Generated artifact. Encrypted body + decrypt JS. Committed so GitHub Pages serves it.
- `robots.txt`: Disallow `/angebote/` for all crawlers.
- `.gitignore`: Ensures `tools/offer-content.html` never reaches git.

---

## Task 1: Repository Hygiene (robots.txt + .gitignore)

**Files:**
- Create: `robots.txt`
- Create: `.gitignore`

- [ ] **Step 1: Create robots.txt**

Write file `robots.txt` at repo root with content:

```
User-agent: *
Disallow: /angebote/
```

- [ ] **Step 2: Create .gitignore**

Write file `.gitignore` at repo root with content:

```
.DS_Store
tools/offer-content.html
```

(`.DS_Store` already appears in `git status`, so this also cleans that up.)

- [ ] **Step 3: Verify .gitignore takes effect**

Run: `git status --short`
Expected output: `.DS_Store` no longer appears in untracked files. (If `tools/offer-content.html` doesn't exist yet, that's fine — it'll be ignored once created in Task 5.)

- [ ] **Step 4: Commit**

```bash
git add robots.txt .gitignore
git commit -m "$(cat <<'EOF'
Add robots.txt to block /angebote/ and .gitignore for plaintext sources

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Build Encryption Script (Node side)

**Files:**
- Create: `tools/encrypt-offer.js`
- Create: `tools/test-encryption.js`

- [ ] **Step 1: Write the round-trip test FIRST**

Create `tools/test-encryption.js`:

```js
const assert = require('assert');
const { encrypt } = require('./encrypt-offer.js');
const crypto = require('crypto');

async function decryptInNode(payload, password) {
  const salt = Buffer.from(payload.salt, 'base64');
  const iv = Buffer.from(payload.iv, 'base64');
  const data = Buffer.from(payload.data, 'base64');
  const ciphertext = data.subarray(0, data.length - 16);
  const tag = data.subarray(data.length - 16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

(async () => {
  const plaintext = '<h1>Hallo Weinfreunde</h1><p>Test mit Umlauten: äöüß</p>';
  const password = 'rewewein';

  const payload = encrypt(plaintext, password);

  assert(typeof payload.salt === 'string', 'salt must be base64 string');
  assert(typeof payload.iv === 'string', 'iv must be base64 string');
  assert(typeof payload.data === 'string', 'data must be base64 string');

  const decrypted = await decryptInNode(payload, password);
  assert.strictEqual(decrypted, plaintext, 'round-trip must preserve plaintext');

  try {
    await decryptInNode(payload, 'wrongpassword');
    assert.fail('decrypt with wrong password should throw');
  } catch (e) {
    assert(e.message.toLowerCase().includes('unsupported') || e.message.toLowerCase().includes('auth'), 'expected auth failure');
  }

  console.log('PASS: encryption round-trip works, wrong-password rejection works');
})();
```

- [ ] **Step 2: Run test — should fail with "Cannot find module './encrypt-offer.js'"**

Run: `node tools/test-encryption.js`
Expected: Error `Cannot find module './encrypt-offer.js'`

- [ ] **Step 3: Implement encrypt-offer.js**

Create `tools/encrypt-offer.js`:

```js
#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const data = Buffer.concat([ciphertext, tag]);
  return {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: data.toString('base64'),
    iterations: ITERATIONS,
  };
}

function build({ templatePath, contentPath, outputPath, password }) {
  const template = fs.readFileSync(templatePath, 'utf8');
  const content = fs.readFileSync(contentPath, 'utf8');
  const payload = encrypt(content, password);
  const json = JSON.stringify(payload);
  if (!template.includes('{{ENCRYPTED_PAYLOAD}}')) {
    throw new Error(`Template ${templatePath} missing {{ENCRYPTED_PAYLOAD}} placeholder`);
  }
  const finalHtml = template.replace('{{ENCRYPTED_PAYLOAD}}', json);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, finalHtml, 'utf8');
  console.log(`Wrote ${outputPath} (${finalHtml.length} bytes)`);
}

module.exports = { encrypt, build };

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

- [ ] **Step 4: Run test — should pass**

Run: `node tools/test-encryption.js`
Expected: `PASS: encryption round-trip works, wrong-password rejection works`

- [ ] **Step 5: Commit**

```bash
git add tools/encrypt-offer.js tools/test-encryption.js
git commit -m "$(cat <<'EOF'
Add AES-256-GCM build script for encrypted offer pages

PBKDF2 (100k iterations, SHA-256) derives the key from the
password. Output payload format (salt|iv|ciphertext+tag, base64)
is compatible with browser Web Crypto API.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Build Wrapper Template (Login UI + Decrypt JS)

**Files:**
- Create: `tools/offer-template.html`

- [ ] **Step 1: Create the wrapper template**

Create `tools/offer-template.html`. The file must contain three things:

1. The `<head>` with TSD design tokens (copied/adapted from `index.html` lines 1–500 — same `:root` variables, fonts, theme system)
2. A login overlay shown by default with TSD-styled password input
3. Decrypt JS that, on submit, derives the key from the password, decrypts the payload, and renders the result into `#offer-root`

Full content:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive">
<script>(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();</script>
<title>Angebot — TSD Design GmbH</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>
:root {
  --bg-dark: #111111;
  --bg-darker: #0a0a0a;
  --bg-section: #161616;
  --bg-card: #1c1c1c;
  --bg-light: #f5f4f0;
  --bg-cream: #eae8e3;
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
  --layer-green: #7a9e7e;
  --layer-blue: #6a8fb5;
  --layer-purple: #9b7ab8;
}
html[data-theme="light"] {
  --bg-dark: #fafaf7;
  --bg-darker: #f0ede7;
  --bg-section: #ffffff;
  --bg-card: #ffffff;
  --text-white: #1a1a1a;
  --text-light: #2d2d2d;
  --text-muted: #6b6b6b;
  --border-subtle: rgba(0,0,0,0.08);
  --border-light: rgba(0,0,0,0.15);
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
  position: relative;
  overflow: hidden;
}
.login-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #E5CA9C, #66F4C4, #C6E5EC, #A178BC);
  background-size: 200% 100%;
  animation: brand-flow 12s linear infinite;
}
@keyframes brand-flow {
  from { background-position: 0% 0; }
  to { background-position: 200% 0; }
}
.login-logo {
  width: 56px; height: 56px; margin: 0 auto 1.5rem;
}
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
.login-form button:disabled {
  opacity: 0.5; cursor: wait;
}
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

/* Hidden offer root — populated after decrypt */
#offer-root { display: none; }
#offer-root.revealed { display: block; }
</style>
</head>
<body>

<!-- ============= LOGIN OVERLAY ============= -->
<div class="login-overlay" id="loginOverlay">
  <div class="login-card">
    <img src="../images/logo/tsd_logo_animated.svg" alt="TSD Design" class="login-logo">
    <div class="login-overline">TSD Design GmbH</div>
    <h1>Angebot ansehen</h1>
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

<!-- ============= OFFER ROOT (populated after decrypt) ============= -->
<div id="offer-root"></div>

<!-- ============= ENCRYPTED PAYLOAD ============= -->
<script id="encrypted-payload" type="application/json">{{ENCRYPTED_PAYLOAD}}</script>

<!-- ============= DECRYPT LOGIC ============= -->
<script>
(function() {
  const payload = JSON.parse(document.getElementById('encrypted-payload').textContent);

  function base64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function decrypt(password) {
    const enc = new TextEncoder();
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const data = base64ToBytes(payload.data);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: payload.iterations, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    return new TextDecoder().decode(plaintextBuffer);
  }

  const form = document.getElementById('loginForm');
  const input = document.getElementById('passwordInput');
  const button = document.getElementById('loginButton');
  const errorEl = document.getElementById('loginError');
  const overlay = document.getElementById('loginOverlay');
  const offerRoot = document.getElementById('offer-root');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorEl.textContent = '';
    button.disabled = true;
    button.textContent = 'Entschlüsselt …';
    try {
      const html = await decrypt(input.value);
      offerRoot.innerHTML = html;
      offerRoot.classList.add('revealed');
      overlay.style.display = 'none';

      // Re-execute any inline scripts in the decrypted content
      offerRoot.querySelectorAll('script').forEach(function(oldScript) {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      window.scrollTo(0, 0);
    } catch (err) {
      errorEl.textContent = 'Passwort nicht korrekt.';
      button.disabled = false;
      button.textContent = 'Öffnen';
      input.select();
    }
  });
})();
</script>

</body>
</html>
```

- [ ] **Step 2: Verify placeholder is present**

Run: `grep -c "{{ENCRYPTED_PAYLOAD}}" tools/offer-template.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add tools/offer-template.html
git commit -m "$(cat <<'EOF'
Add wrapper template for encrypted offer pages

TSD-themed login overlay with password input and Web-Crypto-API
decryption. Decrypted content is injected into #offer-root and
inline scripts in the payload are re-executed after injection.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Build Offer Content — Style Foundation + Hero + Über TSD (Sections 01–02)

**Files:**
- Create: `tools/offer-content.html`

> **Note:** This file contains the entire encrypted body. We build it in 4 incremental tasks (Task 4 → 7), each appending content. After each section group, we run the build script to verify the page renders correctly. The file is gitignored — never committed in plaintext.

- [ ] **Step 1: Create offer-content.html with style block + Hero + Über TSD**

Create `tools/offer-content.html`. It starts with a `<style>` block (offer-specific styles, since the template only carries login styles) and the first two sections.

```html
<style>
/* ============================================================
   OFFER PAGE STYLES — appended to template via decrypt
   ============================================================ */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 4vw, 3rem);
}

/* HEADER */
.offer-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(17,17,17,0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border-subtle);
  height: 72px;
}
html[data-theme="light"] .offer-header {
  background: rgba(250,250,247,0.88);
}
.offer-header .container {
  height: 100%;
  display: flex; align-items: center; justify-content: space-between;
}
.offer-header .logo-lockup {
  display: flex; align-items: center; gap: 1rem;
}
.offer-header .logo-lockup img {
  height: 32px; width: auto;
}
.offer-header .logo-lockup .x-mark {
  font-family: var(--font-serif);
  color: var(--text-muted); font-size: 1.1rem;
  font-style: italic;
}
.offer-header .logo-lockup .partner-mark {
  font-family: var(--font-serif);
  font-size: 1.05rem; font-weight: 500;
  color: var(--text-light); letter-spacing: 0.01em;
}
html[data-theme="light"] .offer-header .logo-lockup img.tsd-logo {
  filter: brightness(0.55) saturate(1.3);
}
.offer-header .meta {
  font-size: 0.72rem; color: var(--text-muted);
  letter-spacing: 0.12em; text-transform: uppercase;
  font-weight: 500;
}
.theme-toggle-float {
  position: fixed; top: 84px; right: 24px; z-index: 99;
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  color: var(--text-muted); width: 40px; height: 40px;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; padding: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.theme-toggle-float:hover { color: var(--text-white); border-color: var(--border-light); }
.theme-toggle-float svg { width: 18px; height: 18px; }
.theme-toggle-float .sun-icon { display: block; }
.theme-toggle-float .moon-icon { display: none; }
html[data-theme="light"] .theme-toggle-float .sun-icon { display: none; }
html[data-theme="light"] .theme-toggle-float .moon-icon { display: block; }

/* SECTION DEFAULTS */
.section { padding: 7rem 0; border-bottom: 1px solid var(--border-subtle); }
.section:last-child { border-bottom: none; }
.section-head { margin-bottom: 4rem; }
.section-overline {
  font-size: 0.72rem; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent);
  margin-bottom: 1.25rem; display: block;
}
.section-head h2 {
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 400; line-height: 1.2;
  letter-spacing: -0.01em; max-width: 780px; margin-bottom: 1rem;
}
.section-head p {
  font-size: 1rem; line-height: 1.75; color: var(--text-muted);
  max-width: 680px; font-weight: 300;
}

/* HERO */
.hero { padding: 11rem 0 7rem; background: var(--bg-dark); position: relative; overflow: hidden; }
.hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 20%, rgba(197,164,109,0.08) 0%, transparent 55%);
  pointer-events: none;
}
.hero .container { position: relative; }
.hero .overline { color: var(--accent); font-size: 0.78rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 1.5rem; }
.hero h1 {
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 4.2vw, 3.6rem);
  font-weight: 400; line-height: 1.15;
  letter-spacing: -0.015em; max-width: 920px;
  margin-bottom: 2rem;
}
.hero h1 em { font-style: italic; color: var(--accent); }
.hero .lead {
  font-size: 1.05rem; line-height: 1.75; color: var(--text-light);
  max-width: 640px; font-weight: 300; margin-bottom: 2rem;
}
.hero .meta-pills { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.hero .pill {
  display: inline-block; font-size: 0.72rem; font-weight: 500;
  padding: 0.35rem 0.85rem;
  border-radius: 100px; border: 1px solid var(--border-subtle);
  color: var(--text-muted);
}

/* KONTEXT (3-Spalten) */
.kontext-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.kontext-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 2rem 1.75rem;
  transition: all 0.35s;
}
.kontext-card:hover { border-color: var(--border-light); transform: translateY(-3px); }
.kontext-card .tag {
  display: inline-block; font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 0.3rem 0.7rem; border-radius: 4px;
  background: rgba(197,164,109,0.12); color: var(--accent);
  margin-bottom: 1.25rem;
}
.kontext-card h3 {
  font-family: var(--font-serif); font-size: 1.2rem; font-weight: 400;
  line-height: 1.3; margin-bottom: 0.75rem;
}
.kontext-card p {
  font-size: 0.9rem; line-height: 1.7; color: var(--text-muted); font-weight: 300;
}

@media (max-width: 768px) {
  .kontext-grid { grid-template-columns: 1fr; }
  .section { padding: 5rem 0; }
  .hero { padding: 9rem 0 5rem; }
  .offer-header .meta { display: none; }
}
</style>

<!-- ============= HEADER ============= -->
<header class="offer-header">
  <div class="container">
    <div class="logo-lockup">
      <img src="../images/logo/tsd_logo_animated.svg" alt="TSD Design" class="tsd-logo">
      <span class="x-mark">×</span>
      <span class="partner-mark">Weinfreunde</span>
    </div>
    <span class="meta">Stand 20. April 2026 · Gültig bis 20. Juli 2026</span>
  </div>
</header>

<button class="theme-toggle-float" id="themeToggleOffer" aria-label="Theme wechseln" title="Theme wechseln">
  <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
</button>

<!-- ============= 01 — HERO ============= -->
<section class="hero">
  <div class="container">
    <div class="overline">Angebot für REWE Wein online GmbH</div>
    <h1>Creative Asset Produktion für <em>Weinfreunde</em></h1>
    <p class="lead">
      Liebe Kim Mathives, vielen Dank für das Interesse an einer Zusammenarbeit. Auf den folgenden Seiten finden Sie unsere Analyse Ihres aktuellen Marketing-Setups und drei konkrete Leistungsmodule, die wir auf Basis dieser Analyse für Weinfreunde vorschlagen.
    </p>
    <div class="meta-pills">
      <span class="pill">Creative Assets</span>
      <span class="pill">GEO Audit</span>
      <span class="pill">KI-Kreativsystem</span>
    </div>
  </div>
</section>

<!-- ============= 02 — KONTEXT / ÜBER TSD ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">02 — Über TSD</span>
      <h2>Strategisches Design, Software und KI — aus einer Hand.</h2>
      <p>Wir verbinden technisches Know-how, intelligentes Softwaredenken und strategisches Design. Für Marketing-Creative bedeutet das: handgemacht, wenn nötig — automatisiert, wenn möglich.</p>
    </div>
    <div class="kontext-grid">
      <div class="kontext-card">
        <span class="tag">Disziplinen</span>
        <h3>Vier Layer, ein Studio</h3>
        <p>Technik, Software, Design, Strategie — wir denken Marketing-Creative als integriertes System, nicht als Einzelgewerk.</p>
      </div>
      <div class="kontext-card">
        <span class="tag">Schnittstelle</span>
        <h3>Marke trifft Technologie</h3>
        <p>Unsere Stärke liegt dort, wo Markenführung auf skalierbare Produktionslogik trifft. Genau dort, wo Performance-Marketing heute steht.</p>
      </div>
      <div class="kontext-card">
        <span class="tag">Ansatz</span>
        <h3>Erst messen, dann bauen</h3>
        <p>Bevor wir produzieren, schauen wir hin. Welche Assets ziehen, wo sind blinde Flecken, welche Workflows lassen sich automatisieren?</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build and verify**

Run: `node tools/encrypt-offer.js`
Expected: `Wrote /Users/denis/code/D3n1s23/tsd_website/angebote/rewe-wein-online.html (NNNN bytes)`

- [ ] **Step 3: Open in browser and confirm visually**

Open `angebote/rewe-wein-online.html` in a browser. Enter password `rewewein`. Confirm:
- Login overlay disappears
- Hero with TSD × Weinfreunde lockup visible at top
- Section 02 with 3 cards visible
- Theme toggle works (top-right)
- No JS errors in console

> **No commit yet** — `tools/offer-content.html` is gitignored and we'll commit the final `angebote/...` artifact at the end.

---

## Task 5: Append Bedarfsanalyse + Handlungsempfehlungen (Sections 03–04)

**Files:**
- Modify: `tools/offer-content.html` (append at end)

- [ ] **Step 1: Append style block additions for sections 03–04**

Append to the existing `<style>` block (find the closing `</style>` and add these rules just before it):

```css
/* BEDARFSANALYSE */
.insights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.insight-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 2rem 1.75rem;
  transition: all 0.35s; position: relative; overflow: hidden;
}
.insight-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--layer-green);
}
.insight-card:hover { border-color: var(--border-light); transform: translateY(-3px); }
.insight-card .insight-num {
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--layer-green);
  margin-bottom: 1rem;
}
.insight-card h3 {
  font-family: var(--font-serif); font-size: 1.2rem; font-weight: 400;
  line-height: 1.3; margin-bottom: 0.75rem;
}
.insight-card p {
  font-size: 0.9rem; line-height: 1.7; color: var(--text-muted);
  font-weight: 300; margin-bottom: 1rem;
}
.insight-card .source-link {
  font-size: 0.78rem; color: var(--accent);
  display: inline-flex; align-items: center; gap: 0.4rem;
  border-bottom: 1px solid transparent; transition: border-color 0.3s;
}
.insight-card .source-link:hover { border-bottom-color: var(--accent); }
.insight-teaser {
  margin-top: 2.5rem; padding: 1.5rem 1.75rem;
  border: 1px solid var(--border-subtle); border-radius: 10px;
  background: rgba(197,164,109,0.04);
  font-size: 0.9rem; color: var(--text-light); font-weight: 300; line-height: 1.7;
}
.insight-teaser strong { color: var(--accent); font-weight: 500; }

/* HANDLUNGSEMPFEHLUNGEN */
.roadmap { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; position: relative; }
.roadmap::before {
  content: ''; position: absolute; top: 24px; left: 12.5%; right: 12.5%;
  height: 1px; background: var(--border-subtle); z-index: 0;
}
.roadmap-step {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 2rem 1.75rem;
  position: relative; z-index: 1;
}
.roadmap-step .horizon {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--bg-dark); border: 1px solid var(--layer-blue);
  color: var(--layer-blue);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-serif); font-size: 1.05rem; font-weight: 400;
  margin: 0 auto 1.25rem;
}
.roadmap-step .horizon-label {
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--layer-blue);
  text-align: center; margin-bottom: 0.75rem;
}
.roadmap-step h3 {
  font-family: var(--font-serif); font-size: 1.15rem; font-weight: 400;
  text-align: center; line-height: 1.3; margin-bottom: 0.75rem;
}
.roadmap-step p {
  font-size: 0.85rem; line-height: 1.65; color: var(--text-muted);
  font-weight: 300; text-align: center;
}
.roadmap-step .ref {
  display: block; margin-top: 1rem; text-align: center;
  font-size: 0.72rem; color: var(--accent);
  letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500;
}

@media (max-width: 768px) {
  .insights-grid { grid-template-columns: 1fr; }
  .roadmap { grid-template-columns: 1fr; }
  .roadmap::before { display: none; }
}
```

- [ ] **Step 2: Append Sections 03–04 to body**

Append to the end of `tools/offer-content.html`:

```html
<!-- ============= 03 — BEDARFSANALYSE ============= -->
<section class="section" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">03 — Was wir gesehen haben</span>
      <h2>Vier Beobachtungen zu Weinfreunde — und ein Hebel, der heute fehlt.</h2>
      <p>Grundlage sind öffentlich zugängliche Quellen: Karriere-Portal, Magazin, Social-Media-Kanäle, LinkedIn-Kommunikation und Pressemitteilungen.</p>
    </div>
    <div class="insights-grid">
      <div class="insight-card">
        <div class="insight-num">Insight 01</div>
        <h3>Skalierender Performance-Marketing-Bedarf</h3>
        <p>Aktuell offene Position Senior Performance Marketing Manager mit Fokus auf SEA, Paid Social, Display und Affiliate. Jeder dieser Kanäle braucht kontinuierlich frische Creative Assets in hoher Frequenz, um nicht zu ermüden.</p>
        <a class="source-link" href="https://karriere.rewe-group.com/weinfreunde/" target="_blank" rel="noopener">Quelle: REWE Karriere-Portal →</a>
      </div>
      <div class="insight-card">
        <div class="insight-num">Insight 02</div>
        <h3>Multi-Channel-Output mit hohem Volumen</h3>
        <p>Online-Shop, Weinfreunde-Magazin, „Bei Anruf Wein"-Podcast, Instagram (25.000 Follower / 1.559 Posts), LinkedIn und POS-Material in 3.800 REWE-Filialen. Ein vorhersehbarer, kontinuierlicher Asset-Bedarf über viele Touchpoints.</p>
        <a class="source-link" href="https://www.instagram.com/weinfreunde/" target="_blank" rel="noopener">Quelle: Instagram @weinfreunde →</a>
      </div>
      <div class="insight-card">
        <div class="insight-num">Insight 03</div>
        <h3>Saisonale Kampagnen-Cycles</h3>
        <p>Spargelweine, Frühlingsweine, Frizzante-Aktion, „Winzer des Monats" — wiederkehrende Strukturen mit kalkulierbarem Output-Bedarf. Genau die Art von Kampagnen-Pattern, die sich für KI-gestützte Workflows eignet.</p>
        <a class="source-link" href="https://www.weinfreunde.de/magazin/" target="_blank" rel="noopener">Quelle: Weinfreunde Magazin →</a>
      </div>
      <div class="insight-card">
        <div class="insight-num">Insight 04</div>
        <h3>Technologische Affinität bereits vorhanden</h3>
        <p>LinkedIn-Kommunikation zu „Agentic Marketing" und „RCS-Kampagnen", neue Shop-Generation mit überarbeitetem Frontend. Das Unternehmen ist anschlussfähig für KI-getriebene Creative-Workflows — kein Edukations-Anlauf nötig.</p>
        <a class="source-link" href="https://de.linkedin.com/company/weinfreunde-de" target="_blank" rel="noopener">Quelle: LinkedIn Weinfreunde →</a>
      </div>
    </div>
    <div class="insight-teaser">
      <strong>Eine fünfte Dimension fehlt heute in vielen Marketing-Setups:</strong> die Sichtbarkeit in KI-Antworten (ChatGPT, Claude, Gemini, Perplexity). Wein ist eine Beratungs-Kategorie — Kaufentscheidungen wandern dort hin. Mehr dazu in Sektion 06.
    </div>
  </div>
</section>

<!-- ============= 04 — HANDLUNGSEMPFEHLUNGEN ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">04 — Was wir empfehlen</span>
      <h2>Drei Horizonte, drei klare nächste Schritte.</h2>
      <p>Aus den Insights ergibt sich eine Roadmap, die nicht alles auf einmal will — sondern erst Kapazität sichert, dann Effizienz schafft, dann strategisch skaliert.</p>
    </div>
    <div class="roadmap">
      <div class="roadmap-step">
        <div class="horizon">1</div>
        <div class="horizon-label">Sofort · 1–4 Wochen</div>
        <h3>Externe Creative-Kapazität</h3>
        <p>Performance-Marketing-Backlog abbauen, frische Assets für laufende Kampagnen liefern. Ohne langfristige Bindung, ohne Recruiting-Aufwand.</p>
        <span class="ref">→ Sektion 05</span>
      </div>
      <div class="roadmap-step">
        <div class="horizon">2</div>
        <div class="horizon-label">Mittelfristig · Q3 2026</div>
        <h3>Verlässlicher Retainer</h3>
        <p>Planbare Pipeline für saisonale Cycles und Multi-Channel-Output. Eingespieltes Team, vorhersehbare Liefer-Slots, reduzierter Stundensatz.</p>
        <span class="ref">→ Sektion 05</span>
      </div>
      <div class="roadmap-step">
        <div class="horizon">3</div>
        <div class="horizon-label">Strategisch · H2 2026</div>
        <h3>GEO Audit + KI-Kreativsystem</h3>
        <p>Erst Sichtbarkeit in KI-Antworten messen, dann interne Kreativprozesse auditieren und gezielt Workflows automatisieren.</p>
        <span class="ref">→ Sektion 06 + 07</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Build and verify**

Run: `node tools/encrypt-offer.js`
Expected: `Wrote ... bytes` with larger file size than before.

- [ ] **Step 4: Browser check**

Reload the offer page, log in, scroll down. Confirm:
- Section 03 has 4 insight cards in a 2×2 grid (or 1-column on mobile) with green left-border
- Source links are clickable and underline on hover
- Teaser block at end of section 03 visible
- Section 04 has 3 roadmap steps with horizontal connector line on desktop

---

## Task 6: Append Creative Assets + GEO Audit + KI-Kreativsystem (Sections 05–07)

**Files:**
- Modify: `tools/offer-content.html` (append at end)

- [ ] **Step 1: Append style additions for service sections**

Append to the existing `<style>` block before `</style>`:

```css
/* SERVICE SECTIONS shared */
.service-intro { font-size: 1rem; line-height: 1.75; color: var(--text-muted); font-weight: 300; max-width: 720px; margin-bottom: 3rem; }

/* CREATIVE ASSETS — 3-Karten-Vergleich */
.assets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
.asset-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 2rem 1.75rem;
  display: flex; flex-direction: column;
  transition: all 0.35s; position: relative; overflow: hidden;
}
.asset-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--layer-purple);
}
.asset-card:hover { border-color: var(--border-light); transform: translateY(-3px); }
.asset-card.featured { border-color: var(--accent); }
.asset-card.featured::before { background: var(--accent); }
.asset-card .asset-badge {
  position: absolute; top: -1px; right: 1.5rem;
  background: var(--accent); color: var(--text-dark);
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 0.3rem 0.65rem 0.35rem;
  border-radius: 0 0 5px 5px;
}
.asset-card .asset-overline {
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--layer-purple); margin-bottom: 0.75rem;
}
.asset-card.featured .asset-overline { color: var(--accent); }
.asset-card h3 {
  font-family: var(--font-serif); font-size: 1.3rem; font-weight: 400;
  line-height: 1.3; margin-bottom: 0.5rem;
}
.asset-card .price {
  font-family: var(--font-serif); font-size: 1.7rem; font-weight: 400;
  color: var(--accent); margin-bottom: 0.25rem; line-height: 1.2;
}
.asset-card .price-meta { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.5rem; font-weight: 300; }
.asset-card ul { list-style: none; flex-grow: 1; margin-bottom: 1.5rem; padding: 0; }
.asset-card ul li {
  font-size: 0.85rem; color: var(--text-light); padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: flex-start; gap: 0.5rem; font-weight: 300;
}
.asset-card ul li:last-child { border-bottom: none; }
.asset-card ul li::before {
  content: '✓'; color: var(--layer-purple);
  font-size: 0.78rem; margin-top: 2px; flex-shrink: 0;
}
.asset-card.featured ul li::before { color: var(--accent); }

.asset-types-block {
  margin-top: 3rem; padding: 1.75rem;
  border: 1px solid var(--border-subtle); border-radius: 10px;
}
.asset-types-block .label {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem;
}
.asset-types-block .pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.asset-types-block .pill {
  display: inline-block; font-size: 0.78rem; font-weight: 400;
  padding: 0.35rem 0.85rem;
  border-radius: 100px; border: 1px solid var(--border-subtle);
  color: var(--text-light); background: var(--bg-card);
}

/* GEO AUDIT */
.geo-edu {
  background: var(--bg-card); border: 1px solid var(--accent);
  border-radius: 12px; padding: 2rem 2rem;
  margin-bottom: 2.5rem; position: relative; overflow: hidden;
}
.geo-edu::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--accent);
}
.geo-edu .geo-edu-label {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 0.75rem;
}
.geo-edu h3 {
  font-family: var(--font-serif); font-size: 1.4rem; font-weight: 400;
  line-height: 1.3; margin-bottom: 0.75rem;
}
.geo-edu p { font-size: 0.95rem; color: var(--text-light); line-height: 1.7; font-weight: 300; }
.geo-edu p em { color: var(--accent); font-style: normal; font-weight: 500; }

.geo-content { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2.5rem; align-items: start; }
.geo-bullets { list-style: none; padding: 0; }
.geo-bullets li {
  font-size: 0.92rem; color: var(--text-light); padding: 0.85rem 0;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: flex-start; gap: 0.75rem; font-weight: 300; line-height: 1.55;
}
.geo-bullets li:last-child { border-bottom: none; }
.geo-bullets li .check {
  color: var(--accent); font-size: 0.85rem; margin-top: 4px; flex-shrink: 0;
  font-weight: 700;
}
.geo-meta-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 1.75rem;
}
.geo-meta-card h4 {
  font-family: var(--font-serif); font-size: 1.05rem; font-weight: 400;
  margin-bottom: 1rem;
}
.geo-meta-row {
  display: flex; justify-content: space-between; padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-subtle);
}
.geo-meta-row:last-child { border-bottom: none; }
.geo-meta-row .key { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }
.geo-meta-row .val { font-size: 0.85rem; color: var(--text-light); font-weight: 500; text-align: right; }

/* KI-KREATIVSYSTEM */
.ki-phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
.ki-phase {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; padding: 2rem 1.75rem;
  position: relative; overflow: hidden;
}
.ki-phase::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--accent);
}
.ki-phase .phase-num {
  font-family: var(--font-serif); font-size: 2.4rem; font-weight: 400;
  color: var(--accent); line-height: 1; margin-bottom: 0.75rem;
}
.ki-phase .phase-label {
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 0.75rem;
}
.ki-phase h3 {
  font-family: var(--font-serif); font-size: 1.2rem; font-weight: 400;
  line-height: 1.3; margin-bottom: 0.75rem;
}
.ki-phase p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.7; font-weight: 300; }
.ki-meta {
  margin-top: 1rem; padding: 1rem 1.25rem;
  border: 1px solid var(--border-subtle); border-radius: 8px;
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; color: var(--text-light); font-weight: 400;
}
.ki-meta .key { color: var(--text-muted); font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; }

@media (max-width: 900px) {
  .geo-content { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .assets-grid { grid-template-columns: 1fr; }
  .ki-phases { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Append Sections 05–07 to body**

Append to the end of `tools/offer-content.html`:

```html
<!-- ============= 05 — LEISTUNG 1: CREATIVE ASSETS ============= -->
<section class="section" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">05 — Leistung 1</span>
      <h2>Creative Asset Produktion als Freelancer.</h2>
    </div>
    <p class="service-intro">Visuelle Assets für Performance-Kampagnen, Magazin, Social Media, POS und Newsletter — geliefert in der Frequenz, die Ihr Marketing-Setup tatsächlich braucht. Drei Modelle, je nach Phase und Volumen.</p>

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
          <li>Fester Liefer-Slot für saisonale Cycles</li>
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
          <li>Multi-Channel parallel: Performance + Magazin + POS</li>
          <li>Maximaler Rabatt, höchste Planungssicherheit</li>
          <li>Direkter Draht ohne Account-Layer</li>
        </ul>
      </div>
    </div>

    <div class="asset-types-block">
      <div class="label">Asset-Typen im Lieferumfang</div>
      <div class="pills">
        <span class="pill">Social Ads</span>
        <span class="pill">Display Banner</span>
        <span class="pill">POS-Material</span>
        <span class="pill">Magazin-Visuals</span>
        <span class="pill">Newsletter-Header</span>
        <span class="pill">Kampagnen-Keys</span>
        <span class="pill">Podcast-Cover</span>
        <span class="pill">Lifestyle-Stills</span>
      </div>
    </div>
  </div>
</section>

<!-- ============= 06 — LEISTUNG 2: GEO AUDIT ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">06 — Leistung 2</span>
      <h2>GEO Audit — Sichtbarkeit in KI-Antworten.</h2>
    </div>

    <div class="geo-edu">
      <div class="geo-edu-label">Warum GEO jetzt Thema wird</div>
      <h3>Immer mehr Kaufentscheidungen starten in KI-Chats statt in Google.</h3>
      <p>Wer dort nicht zitiert wird, existiert für diese User-Gruppe nicht. Bei Beratungs-Kategorien wie Wein <em>(„Welcher Riesling passt zu Spargel?", „Bester Online-Weinhändler?")</em> ist das besonders relevant.</p>
    </div>

    <div class="geo-content">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 1.3rem; font-weight: 400; margin-bottom: 1.25rem;">Was wir analysieren</h3>
        <ul class="geo-bullets">
          <li><span class="check">✓</span> Wein-relevante Prompts auf 4 Plattformen (ChatGPT, Claude, Gemini, Perplexity) — Anlass-, Pairing-, Regions-, Preis- und Geschenk-Prompts</li>
          <li><span class="check">✓</span> Wettbewerbsmatrix vs. Vinos, Hawesko, Vicampo, Geile Weine, Belvini & Co. — Sichtbarkeit, Nennungsanteil, Position</li>
          <li><span class="check">✓</span> Channel-Breakdown: Magazine, YouTube-Sommeliers, Foodie-Sites, Reddit, REWE.de — wer treibt die Wein-Kategorie in KI-Antworten?</li>
          <li><span class="check">✓</span> Top-zitierte Weinfreunde-URLs + meistzitierte Drittquellen + konkrete PR-Outreach-Liste</li>
        </ul>
      </div>
      <div class="geo-meta-card">
        <h4>Format & Konditionen</h4>
        <div class="geo-meta-row"><span class="key">Lieferung</span><span class="val">PDF + Live-Präsentation</span></div>
        <div class="geo-meta-row"><span class="key">Umfang</span><span class="val">40–60 Seiten</span></div>
        <div class="geo-meta-row"><span class="key">Plattformen</span><span class="val">ChatGPT, Claude, Gemini, Perplexity</span></div>
        <div class="geo-meta-row"><span class="key">Volumen</span><span class="val">nach Absprache</span></div>
        <div class="geo-meta-row"><span class="key">Investition</span><span class="val">auf Anfrage</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ============= 07 — LEISTUNG 3: KI-KREATIVSYSTEM ============= -->
<section class="section" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">07 — Leistung 3</span>
      <h2>KI-Kreativsystem — Workflows nach Audit, nicht von der Stange.</h2>
    </div>
    <p class="service-intro">Wir bauen kein generisches KI-Tool. Wir auditieren erst Ihre internen Kreativprozesse — Tools, Briefings, Approval-Loops, Output-Volumen — und designen dann die Automatisierungs-Pfade, die für Weinfreunde tatsächlich Sinn ergeben.</p>

    <div class="ki-phases">
      <div class="ki-phase">
        <div class="phase-num">01</div>
        <div class="phase-label">Phase 1</div>
        <h3>Analyse</h3>
        <p>Audit interner Kreativprozesse: welche Tools, welche Briefings, welche Approval-Loops, welches Output-Volumen pro Kanal. Wo entstehen Wartezeiten, wo Doppelarbeit?</p>
      </div>
      <div class="ki-phase">
        <div class="phase-num">02</div>
        <div class="phase-label">Phase 2</div>
        <h3>Workflow-Design</h3>
        <p>Identifikation automatisierbarer Pfade: saisonale Asset-Varianten, Magazin-Bild-Pipelines, Newsletter-Personalisierung, POS-Material-Adaption. Was bleibt handgemacht, was skaliert die Maschine?</p>
      </div>
      <div class="ki-phase">
        <div class="phase-num">03</div>
        <div class="phase-label">Phase 3</div>
        <h3>Implementierung</h3>
        <p>Custom Pipelines mit Claude, GPT, Stable Diffusion und Bestandstools (DAM, CMS, Newsletter-System). Übergabe inklusive Schulung und Wartungs-Setup.</p>
      </div>
    </div>

    <div class="ki-meta">
      <span class="key">Investition</span>
      <span>auf Anfrage nach Analyse</span>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Build and verify**

Run: `node tools/encrypt-offer.js`

- [ ] **Step 4: Browser check**

Reload the offer page (re-enter password). Confirm:
- Section 05: 3 service cards in a row, „Empfohlen"-Badge on Retainer 30 (gold accent)
- Asset-types-block at bottom of section 05 with all 8 pills
- Section 06: gold-bordered education block, 2-column layout (bullets left, meta-card right)
- Section 07: 3 KI-phase cards with large serif numbers, single „auf Anfrage"-pill at bottom
- All pricing values match: 75 €, 70 €, 60 €, ca. 6.067 €, ca. 7.800 €

---

## Task 7: Append Investitionsübersicht + Kontakt (Sections 08–09)

**Files:**
- Modify: `tools/offer-content.html` (append at end)

- [ ] **Step 1: Append style additions for table + contact**

Append to the existing `<style>` block before `</style>`:

```css
/* INVESTITIONSÜBERSICHT */
.invest-table {
  width: 100%; border-collapse: collapse;
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 12px; overflow: hidden;
}
.invest-table thead {
  background: rgba(197,164,109,0.06);
}
.invest-table th {
  text-align: left; padding: 1.1rem 1.5rem;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--text-muted);
  border-bottom: 1px solid var(--border-subtle);
}
.invest-table td {
  padding: 1.25rem 1.5rem;
  font-size: 0.92rem; color: var(--text-light); font-weight: 300;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
}
.invest-table tr:last-child td { border-bottom: none; }
.invest-table .module-name {
  font-weight: 500; color: var(--text-white);
}
.invest-table .module-name .stripe {
  display: inline-block; width: 3px; height: 16px; vertical-align: middle;
  margin-right: 10px; border-radius: 2px;
}
.invest-table .price-cell {
  font-family: var(--font-serif); font-size: 1.05rem; font-weight: 400;
  color: var(--accent); white-space: nowrap;
}
.invest-table .price-cell.muted {
  color: var(--text-muted); font-style: italic; font-size: 0.92rem;
}
.invest-footnote {
  margin-top: 1.5rem; font-size: 0.82rem; color: var(--text-muted);
  font-weight: 300; line-height: 1.6;
}

@media (max-width: 768px) {
  .invest-table thead { display: none; }
  .invest-table, .invest-table tbody, .invest-table tr, .invest-table td { display: block; width: 100%; }
  .invest-table tr {
    border-bottom: 1px solid var(--border-subtle);
    padding: 1rem 1.25rem;
  }
  .invest-table tr:last-child { border-bottom: none; }
  .invest-table td {
    border: none; padding: 0.35rem 0; font-size: 0.9rem;
  }
  .invest-table td::before {
    content: attr(data-label); display: block;
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.15rem;
  }
}

/* KONTAKT */
.contact-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 3rem; position: relative; }
.contact-steps::before {
  content: ''; position: absolute; top: 24px; left: 12.5%; right: 12.5%;
  height: 1px; background: var(--border-subtle); z-index: 0;
}
.contact-step { text-align: center; position: relative; z-index: 1; }
.contact-step .num {
  width: 48px; height: 48px; border-radius: 50%;
  border: 1px solid var(--accent); background: var(--bg-dark);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
  font-family: var(--font-serif); font-size: 1.05rem; color: var(--accent);
}
.contact-step h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.4rem; }
.contact-step p { font-size: 0.82rem; color: var(--text-muted); font-weight: 300; line-height: 1.6; }

.contact-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: 14px; padding: 2.5rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center;
}
.contact-card .who .name {
  font-family: var(--font-serif); font-size: 1.4rem; font-weight: 400;
  margin-bottom: 0.25rem;
}
.contact-card .who .role {
  font-size: 0.82rem; color: var(--text-muted); font-weight: 300;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.contact-card .channels { display: flex; flex-direction: column; gap: 0.85rem; }
.contact-card .channel {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.95rem; color: var(--text-light); font-weight: 400;
}
.contact-card .channel .key {
  font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--text-muted);
  min-width: 70px;
}
.contact-card a { color: var(--text-light); border-bottom: 1px solid var(--border-subtle); transition: border-color 0.3s, color 0.3s; }
.contact-card a:hover { color: var(--accent); border-bottom-color: var(--accent); }

.closing-quote {
  margin-top: 4rem; text-align: center;
  padding: 2.5rem; max-width: 700px; margin-left: auto; margin-right: auto;
}
.closing-quote blockquote {
  font-family: var(--font-serif); font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 400; font-style: italic; line-height: 1.5;
  color: var(--text-light); margin-bottom: 1rem;
}
.closing-quote cite {
  font-style: normal; font-size: 0.78rem; color: var(--text-muted);
  letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500;
}

@media (max-width: 768px) {
  .contact-card { grid-template-columns: 1fr; gap: 1.5rem; }
  .contact-steps { grid-template-columns: 1fr; }
  .contact-steps::before { display: none; }
}
</style>
```

> **Note:** Insert this CSS block ABOVE the closing `</style>` tag — at this point the file structure makes appending CSS easier than wedging it in. If you want strictly one `<style>` block, manually consolidate; otherwise multiple `<style>` blocks render fine in HTML5.

- [ ] **Step 2: Append Sections 08–09 to body**

Append to the end of `tools/offer-content.html`:

```html
<!-- ============= 08 — INVESTITIONSÜBERSICHT ============= -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="section-overline">08 — Konditionen</span>
      <h2>Investitionsübersicht.</h2>
      <p>Alle fünf Module im Vergleich, sortiert von niedrigem zu hohem Commitment.</p>
    </div>
    <table class="invest-table">
      <thead>
        <tr>
          <th>Modul</th>
          <th>Volumen</th>
          <th>Investition (netto)</th>
          <th>Geeignet für</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Creative Assets — Flexibel</td>
          <td data-label="Volumen">nach Bedarf</td>
          <td data-label="Investition" class="price-cell">75 €/h</td>
          <td data-label="Geeignet für">Punktuelle Projekte</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--layer-purple);"></span>Creative Assets — Retainer 20</td>
          <td data-label="Volumen">20 h / Woche</td>
          <td data-label="Investition" class="price-cell">ca. 6.067 €/Monat</td>
          <td data-label="Geeignet für">Kontinuierliche Pipeline</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span>Creative Assets — Retainer 30</td>
          <td data-label="Volumen">30 h / Woche</td>
          <td data-label="Investition" class="price-cell">ca. 7.800 €/Monat</td>
          <td data-label="Geeignet für">Hohe Multi-Channel-Frequenz</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span>GEO Audit</td>
          <td data-label="Volumen">nach Absprache</td>
          <td data-label="Investition" class="price-cell muted">auf Anfrage</td>
          <td data-label="Geeignet für">Strategischer Einstieg, Hebel identifizieren</td>
        </tr>
        <tr>
          <td data-label="Modul" class="module-name"><span class="stripe" style="background: var(--accent);"></span>KI-Kreativsystem</td>
          <td data-label="Volumen">nach Audit</td>
          <td data-label="Investition" class="price-cell muted">auf Anfrage</td>
          <td data-label="Geeignet für">Strategische Skalierung</td>
        </tr>
      </tbody>
    </table>
    <div class="invest-footnote">
      Alle Preise netto zzgl. 19% USt. Retainer-Monatspreise basieren auf 4,33 Wochen pro Monat. Stundensätze gelten für Creative-Asset-Produktion; Konzeption und Strategie ggf. zu separat vereinbarten Konditionen.
    </div>
  </div>
</section>

<!-- ============= 09 — KONTAKT ============= -->
<section class="section" style="background: var(--bg-darker);">
  <div class="container">
    <div class="section-head" style="text-align: center; max-width: none;">
      <span class="section-overline" style="display: block;">09 — Wie es weitergeht</span>
      <h2 style="margin-left: auto; margin-right: auto;">Lassen Sie uns sprechen.</h2>
    </div>

    <div class="contact-steps">
      <div class="contact-step">
        <div class="num">1</div>
        <h4>Kontakt</h4>
        <p>Kurze Mail oder Anruf — eine Zeile reicht.</p>
      </div>
      <div class="contact-step">
        <div class="num">2</div>
        <h4>Erstgespräch</h4>
        <p>30 Minuten, unverbindlich, persönlich oder remote.</p>
      </div>
      <div class="contact-step">
        <div class="num">3</div>
        <h4>Konkretisierung</h4>
        <p>Wir präzisieren Modul-Auswahl, Onboarding und Start-Datum.</p>
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
      <blockquote>„Gute Creative Assets entstehen aus Verständnis für die Marke. Wir freuen uns darauf, Weinfreunde kennenzulernen."</blockquote>
      <cite>— Denis Papadopulos, TSD Design GmbH</cite>
    </div>
  </div>
</section>

<!-- ============= THEME TOGGLE WIRING ============= -->
<script>
(function(){
  var btn = document.getElementById('themeToggleOffer');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var cur = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();
</script>
```

- [ ] **Step 3: Build and verify**

Run: `node tools/encrypt-offer.js`
Expected: `Wrote /Users/denis/code/D3n1s23/tsd_website/angebote/rewe-wein-online.html (NNNN bytes)`

- [ ] **Step 4: Browser check — full end-to-end**

Reload the offer page, log in. Verify all 9 sections render top to bottom:
1. Header with TSD × Weinfreunde lockup
2. Hero with persönliche Anrede
3. Über TSD (3 cards)
4. Bedarfsanalyse (4 insight cards + teaser)
5. Handlungsempfehlungen (3-step roadmap)
6. Creative Assets (3 cards, Retainer 30 featured)
7. GEO Audit (gold edu-block + 2-col content)
8. KI-Kreativsystem (3 phases + auf-Anfrage-pill)
9. Investitionsübersicht (5-row table)
10. Kontakt (3-step flow + contact card + closing quote)

Theme toggle (top-right) switches dark ↔ light. All pricing values correct. All source links open in new tab.

---

## Task 8: Final Quality Checks & Commit Artifact

**Files:**
- Verify: `angebote/rewe-wein-online.html`
- Commit: `angebote/rewe-wein-online.html`

- [ ] **Step 1: Verify no plaintext content leaks in source**

Run: `grep -c "Weinfreunde" angebote/rewe-wein-online.html`
Expected: A small number (likely 1–3, only from the login overlay's `<title>`/lockup label). Should NOT contain insight text, pricing, or section content.

Run: `grep -c "rewewein" angebote/rewe-wein-online.html`
Expected: `0` — the password must NOT appear in the output (it's only used at build time).

Run: `grep -c "75 €" angebote/rewe-wein-online.html`
Expected: `0` — pricing values must be encrypted.

- [ ] **Step 2: Verify noindex meta is present**

Run: `grep "noindex" angebote/rewe-wein-online.html`
Expected: One line containing `<meta name="robots" content="noindex, nofollow, noarchive">`

- [ ] **Step 3: Verify wrong-password rejection in browser**

Open `angebote/rewe-wein-online.html`, enter `wrongpass`, click Öffnen. Expected: Error message „Passwort nicht korrekt." appears, no content reveals.

- [ ] **Step 4: Verify mobile layout (375px width)**

In browser dev-tools, set viewport to 375px wide. Reload, log in, scroll through. Confirm:
- Login card fits with padding
- Header lockup wraps gracefully (or hides date pill)
- All grids collapse to single column
- Investitionsübersicht switches to card-style stacked layout (with `data-label` overlines)
- Theme toggle still accessible

- [ ] **Step 5: Verify the page is NOT linked from index.html**

Run: `grep -l "rewe-wein-online" *.html`
Expected: NO output (no main page references the offer URL).

- [ ] **Step 6: Commit final artifact**

```bash
git add angebote/rewe-wein-online.html
git commit -m "$(cat <<'EOF'
Add encrypted offer page for REWE Wein online GmbH

Single-file artifact at /angebote/rewe-wein-online.html with
AES-256-GCM encrypted body. Login UI, theme toggle, and decrypt
logic in cleartext; offer content (9 sections, pricing, contact)
encrypted. Page is noindex/nofollow and unlinked from main site.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

**Spec coverage:**
- Sections 01–09 ✓ (Tasks 4–7)
- AES-256-GCM with PBKDF2 100k ✓ (Task 2)
- Build script ✓ (Task 2)
- Wrapper template with login UI ✓ (Task 3)
- robots.txt ✓ (Task 1)
- noindex meta ✓ (in template, Task 3)
- .gitignore for plaintext source ✓ (Task 1)
- Acceptance-Kriterien — all 11 covered across Tasks 4–8

**Type/naming consistency:**
- Payload format: `{salt, iv, data, iterations}` — used identically in `encrypt-offer.js`, `test-encryption.js`, and template decrypt JS ✓
- CSS class names: `--layer-green`, `--layer-blue`, `--layer-purple` introduced in Task 4 styles, used in Tasks 5–7 ✓
- Theme toggle id: `themeToggleOffer` defined in Task 4, wired in Task 7 ✓

**No placeholders:** All steps contain executable code or specific commands.

**Risks called out:**
- `tools/offer-content.html` MUST be gitignored (Task 1 handles this; Task 4 onward warns).
- Plaintext content review possible only in browser, not via static-site generator.

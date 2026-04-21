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

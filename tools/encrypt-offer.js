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

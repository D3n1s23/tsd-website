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

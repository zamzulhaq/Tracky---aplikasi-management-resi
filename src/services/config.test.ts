import assert from 'node:assert';
import {
  clearCredentials,
  displayOrigin,
  getSavedCredentials,
  normalizeBaseUrl,
  saveCredentials,
} from './config';

const store: Record<string, string> = {};
(globalThis as unknown as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => {
    store[k] = v;
  },
  removeItem: (k: string) => {
    delete store[k];
  },
  key: (_i: number) => null,
  length: 0,
};

function main() {
  // normalizeBaseUrl: domain apa pun di-append /wp-json/wc/v3; path yang
  // sudah ada tetap; trailing slash dibuang; tanpa skema ditambah https://.
  assert.equal(normalizeBaseUrl('https://azrahstore.com'), 'https://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('https://azrahstore.com/'), 'https://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('https://azrahstore.com/wp-json/wc/v3'), 'https://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('https://azrahstore.com/wp-json/wc/v3/'), 'https://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('azrahstore.com'), 'https://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('azrahstore.com/'), 'https://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('http://azrahstore.com'), 'http://azrahstore.com/wp-json/wc/v3');
  assert.equal(normalizeBaseUrl('   '), '');

  // displayOrigin: hanya host yang tampil, path disembunyikan.
  assert.equal(displayOrigin('https://azrahstore.com/wp-json/wc/v3'), 'https://azrahstore.com');
  assert.equal(displayOrigin('bukan-url'), 'bukan-url');

  // save/get/clear credentials via localStorage.
  assert.equal(getSavedCredentials(), null);
  saveCredentials({
    baseUrl: 'https://azrahstore.com/wp-json/wc/v3',
    consumerKey: 'ck_xxx',
    consumerSecret: 'cs_yyy',
  });
  assert.deepEqual(getSavedCredentials(), {
    baseUrl: 'https://azrahstore.com/wp-json/wc/v3',
    consumerKey: 'ck_xxx',
    consumerSecret: 'cs_yyy',
  });
  clearCredentials();
  assert.equal(getSavedCredentials(), null);

  console.log('config self-check: OK');
}

main();

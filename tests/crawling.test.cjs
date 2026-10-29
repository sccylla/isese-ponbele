const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dictionary = require('../api/dictionary.js');
const word = require('../api/word.js');
const orisa = require('../api/orisa.js');
const words = require('../api/dictionary-data.json');
const orisas = require('../api/orisa-data.json');
const {SITE} = require('../lib/dictionary.cjs');
const root = path.join(__dirname, '..');

function render(handler, query) {
  const response = {statusCode:200, headers:{}, setHeader(name, value) { this.headers[name] = value; }, end(html) { this.html = html; }};
  handler({query}, response);
  return response;
}

const links = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m => new URL(m[1].replace(/&amp;/g, '&'), SITE));

test('all 3,365 definitions are reachable through HTML links without JavaScript', t => {
  const queue = ['/dictionary.html'];
  const visited = new Set();
  const reachedWords = new Set();
  while (queue.length) {
    const next = queue.shift();
    if (visited.has(next)) continue;
    visited.add(next);
    const url = new URL(next, SITE);
    let html;
    if (url.pathname === '/dictionary.html') html = fs.readFileSync(path.join(root, 'dictionary.html'), 'utf8');
    else if (url.pathname.startsWith('/word/')) {
      const slug = decodeURIComponent(url.pathname.slice('/word/'.length));
      const response = render(word, {slug});
      assert.equal(response.statusCode, 200, next);
      assert.equal(response.headers['X-Robots-Tag'], 'index, follow');
      assert.ok(response.html.includes('rel="canonical" href="' + SITE + url.pathname + '"'), next);
      reachedWords.add(slug);
      html = response.html;
    } else {
      const response = render(dictionary, {letter:url.pathname.split('/')[2] || '', page:url.searchParams.get('page') || '1'});
      assert.equal(response.statusCode, 200, next);
      assert.ok(response.html.includes('rel="canonical" href="' + SITE + next + '"'), next);
      html = response.html;
    }
    for (const link of links(html)) {
      if (link.origin !== SITE) continue;
      if (link.pathname === '/dictionary' || link.pathname.startsWith('/dictionary/') || link.pathname.startsWith('/word/')) queue.push(link.pathname + link.search);
    }
  }
  assert.deepEqual([...reachedWords].sort(), words.map(entry => entry.slug).sort());
  t.diagnostic(`Reached ${reachedWords.size} definitions through real HTML anchors.`);
});

test('unknown dictionary letters, invalid pagination and missing words return real 404s', () => {
  for (const query of [{letter:'unknown'}, {letter:'a',page:'0'}, {letter:'a',page:'9999'}, {letter:'a',page:'1.5'}, {letter:'a',page:'x'}, {page:'2'}]) {
    const response = render(dictionary, query);
    assert.equal(response.statusCode, 404, JSON.stringify(query));
    assert.equal(response.headers['X-Robots-Tag'], 'noindex, follow');
  }
  const response = render(word, {slug:'not-a-real-word-onboarding'});
  assert.equal(response.statusCode, 404);
  assert.equal(response.headers['X-Robots-Tag'], 'noindex, follow');
});

test('all 20 Orisa publications are linked in HTML and have indexable content', () => {
  const html = fs.readFileSync(path.join(root, 'orisas.html'), 'utf8');
  const slugs = links(html).filter(url => url.pathname.startsWith('/orisa/')).map(url => decodeURIComponent(url.pathname.slice('/orisa/'.length)));
  assert.deepEqual(slugs.sort(), orisas.map(entry => entry.slug).sort());
  for (const entry of orisas) {
    const response = render(orisa, {slug:entry.slug});
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['X-Robots-Tag'], 'index, follow');
    assert.ok(response.html.includes('rel="canonical" href="' + SITE + '/orisa/' + entry.slug + '"'));
  }
});

test('every browse sitemap URL serves the corresponding directory page', () => {
  const xml = fs.readFileSync(path.join(root, 'sitemap-browse.xml'), 'utf8');
  for (const [, location] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url = new URL(location.replace(/&amp;/g, '&'));
    const response = render(dictionary, {letter:url.pathname.split('/')[2] || '', page:url.searchParams.get('page') || '1'});
    assert.equal(response.statusCode, 200, location);
    assert.ok(response.html.includes('rel="canonical" href="' + location + '"'), location);
  }
});

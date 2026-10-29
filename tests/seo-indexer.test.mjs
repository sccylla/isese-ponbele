import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sitemapUrls, choose, submit, main} from '../scripts/seo-indexer.mjs';

const base = 'https://www.onisese.ng';
const localFetch = async url => new Response(await readFile(new URL('../' + new URL(url).pathname.slice(1), import.meta.url), 'utf8'));

test('canonical sitemap discovery includes all public words and excludes private routes', async () => {
  const entries = await sitemapUrls(base + '/sitemap.xml', localFetch);
  const urls = entries.map(entry => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(urls.filter(url => url.startsWith(base + '/word/')).length, 3365);
  const words = JSON.parse(await readFile(new URL('../api/dictionary-data.json', import.meta.url), 'utf8'));
  assert.deepEqual(urls.filter(url => url.startsWith(base + '/word/')).sort(), words.map(entry => base + '/word/' + encodeURIComponent(entry.slug)).sort());
  assert.equal(urls.filter(url => url.startsWith(base + '/orisa/')).length, 20);
  assert.ok(urls.includes(base + '/dictionary/a?page=2'));
  assert.ok(urls.every(url => url.startsWith(base + '/')));
  assert.ok(urls.every(url => !/\/(api\/|admin-analytics|access-manager|oogun-document)/.test(url)));
});

test('a mismatched sitemap host fails instead of silently selecting zero URLs', async () => {
  const fetchImpl = async () => new Response('<urlset><url><loc>https://isese-ponbele.vercel.app/word/wura</loc></url></urlset>');
  await assert.rejects(sitemapUrls(base + '/sitemap.xml', fetchImpl), /outside SEO_BASE_URL/);
});

test('indented XML retains lastmod dates for scheduled selection', async () => {
  const xml = `<urlset><url>\n<loc>${base}/word/wura</loc>\n<lastmod>2026-10-29</lastmod>\n</url><url><loc>${base}/word/a</loc><lastmod>2026-10-01</lastmod></url></urlset>`;
  const entries = await sitemapUrls(base + '/sitemap.xml', async () => new Response(xml));
  assert.deepEqual(choose(entries, {mode:'recent',now:Date.parse('2026-10-29T12:00:00Z')}), [base + '/word/wura']);
});

test('changed-file selection includes Orisa content and never notifies private admin pages', async () => {
  const entries = await sitemapUrls(base + '/sitemap.xml', localFetch);
  assert.equal(choose(entries, {mode:'changed',files:['api/orisa-data.json']}).length, 21);
  assert.deepEqual(choose(entries, {mode:'changed',files:['admin-analytics.html','access-manager.html']}), []);
  assert.equal(choose(entries, {mode:'changed',files:['api/dictionary.js']}).length, entries.length);
});

test('dry run discovers thousands of canonical URLs without sending notifications', async () => {
  const requests = [];
  const result = await main({dryRun:true,mode:'all',fetchImpl:async (url, options) => {
    requests.push({url,options});
    return localFetch(url);
  }});
  assert.ok(result.length > 3365);
  assert.ok(requests.every(request => request.url.endsWith('.xml') && request.options?.method !== 'POST'));
});

test('IndexNow notifications deduplicate and batch URLs on the canonical domain', async () => {
  const urls = Array.from({length:501}, (_, i) => base + '/word/test-' + i);
  const batches = [];
  await submit([...urls, urls[0]], async (url, options) => {
    assert.equal(url, 'https://api.indexnow.org/indexnow');
    const body = JSON.parse(options.body);
    assert.equal(body.host, 'www.onisese.ng');
    assert.ok(body.keyLocation.startsWith(base + '/'));
    batches.push(body.urlList);
    return new Response('', {status:batches.length === 1 ? 200 : 202});
  }, async () => {});
  assert.deepEqual(batches.map(batch => batch.length), [500, 1]);
});

test('a missing IndexNow verification file reports failure before sending notifications', async () => {
  let posts = 0;
  await assert.rejects(main({dryRun:false,mode:'all',fetchImpl:async (url, options) => {
    if (options?.method === 'POST') posts++;
    if (url.endsWith('.txt')) return new Response('missing', {status:404});
    return localFetch(url);
  }}), /key file is missing or incorrect/);
  assert.equal(posts, 0);
});

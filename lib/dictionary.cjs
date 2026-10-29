const words = require('../api/dictionary-data.json');

const SITE = 'https://www.onisese.ng';
const PAGE_SIZE = 100;
const plain = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const letterFor = entry => /^[a-z]/.test(plain(entry.term)) ? plain(entry.term)[0] : 'other';
const sorted = [...words].sort((a, b) => plain(a.term).localeCompare(plain(b.term), 'en') || a.slug.localeCompare(b.slug));
const buckets = new Map();
const positions = new Map();
for (const [index, entry] of sorted.entries()) {
  const letter = letterFor(entry);
  if (!buckets.has(letter)) buckets.set(letter, []);
  const bucket = buckets.get(letter);
  positions.set(entry.slug, {index, letter, page: Math.floor(bucket.length / PAGE_SIZE) + 1});
  bucket.push(entry);
}
const browsePath = (letter, page = 1) => '/dictionary/' + encodeURIComponent(letter) + (page > 1 ? '?page=' + page : '');
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

module.exports = {SITE, PAGE_SIZE, sorted, buckets, positions, browsePath, esc};

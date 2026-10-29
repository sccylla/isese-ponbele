// Keep visible HTML links and sitemap entries in sync with the published datasets.
const fs = require('node:fs');
const path = require('node:path');
const {SITE, PAGE_SIZE, buckets, browsePath, esc} = require('../lib/dictionary.cjs');
const orisas = require('../api/orisa-data.json');
const root = path.join(__dirname, '..');
const check = process.argv.includes('--check');

function write(relativePath, content) {
  const file = path.join(root, relativePath);
  const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (previous === content) return;
  if (check) throw new Error(relativePath + ' is out of date; run npm run seo:generate');
  fs.writeFileSync(file, content);
  console.log('Updated ' + relativePath);
}

const urls = [SITE + '/dictionary'];
for (const [letter, entries] of buckets) {
  for (let page = 1; page <= Math.ceil(entries.length / PAGE_SIZE); page++) {
    urls.push(SITE + browsePath(letter, page));
  }
}
write('sitemap-browse.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => '  <url><loc>' + esc(url) + '</loc></url>').join('\n') + '\n</urlset>\n');

const file = path.join(root, 'orisas.html');
const html = fs.readFileSync(file, 'utf8');
const markers = /<!-- ORISA_PUBLICATIONS_START -->[\s\S]*?<!-- ORISA_PUBLICATIONS_END -->/;
if (!markers.test(html)) throw new Error('Missing publication link markers in orisas.html');
const cards = orisas.map(o => `    <a class="orisa-card orisa-publication-card" href="/orisa/${encodeURIComponent(o.slug)}">
      <div class="orisa-card-media"><img src="${esc(o.image)}" alt="${esc(o.imageCaption || ('Cultural context for ' + o.name))}" loading="lazy" referrerpolicy="no-referrer"><span>LONG-FORM DOCUMENTARY</span></div>
      <div class="orisa-card-content"><small>${esc(o.classification)}</small><h3>${esc(o.name)}</h3><p>${esc(o.lead)}</p><div class="domain-row">${o.domains.map(d => '<span>' + esc(d) + '</span>').join('')}</div><b>Read publication →</b></div>
    </a>`).join('\n');
write('orisas.html', html.replace(markers, '<!-- ORISA_PUBLICATIONS_START -->\n' + cards + '\n    <!-- ORISA_PUBLICATIONS_END -->'));

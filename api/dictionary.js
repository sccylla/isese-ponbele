const {SITE, PAGE_SIZE, sorted, buckets, browsePath, esc} = require('../lib/dictionary.cjs');

module.exports = (req, res) => {
  const letter = String(req.query.letter || '');
  const rawPage = String(req.query.page || '1');
  const page = Number(rawPage);
  const entries = buckets.get(letter);
  const pages = entries ? Math.ceil(entries.length / PAGE_SIZE) : 1;
  const valid = (!letter || entries) && /^\d+$/.test(rawPage) && Number.isSafeInteger(page) && page >= 1 && page <= pages;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!valid) {
    res.statusCode = 404;
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    return res.end('<!doctype html><html lang="en"><head><title>Dictionary page not found</title><meta name="robots" content="noindex,follow"></head><body><h1>Dictionary page not found</h1><a href="/dictionary">Browse the Yoruba dictionary</a></body></html>');
  }
  const path = letter ? browsePath(letter, page) : '/dictionary';
  const label = letter === 'other' ? 'Other words' : letter.toUpperCase();
  const title = letter ? `Yoruba words beginning with ${label}${page > 1 ? ' — page ' + page : ''}` : 'Browse the Yoruba dictionary A–Z';
  const description = letter ? `Read meanings of Yoruba words beginning with ${label}. Page ${page} of ${pages}, with links to individual definitions.` : `Browse all ${sorted.length.toLocaleString('en')} Yoruba words by first letter, with English meanings, cultural context and links to individual definitions.`;
  const letters = [...buckets].map(([key, rows]) => `<a href="${browsePath(key)}"${letter === key ? ' aria-current="page"' : ''}>${esc(key.toUpperCase())}<small>${rows.length} words</small></a>`).join('');
  const pagination = entries && pages > 1 ? '<nav class="browse-pages" aria-label="Dictionary pages">' + Array.from({length: pages}, (_, i) => `<a href="${esc(browsePath(letter, i + 1))}"${page === i + 1 ? ' aria-current="page"' : ''}>Page ${i + 1}</a>`).join('') + '</nav>' : '';
  const rows = entries ? entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(entry => `<article><h2><a href="/word/${encodeURIComponent(entry.slug)}">${esc(entry.term)}</a></h2><p>${esc(entry.meaning)}</p>${entry.context ? `<p class="context">${esc(entry.context)}</p>` : ''}</article>`).join('') : `<p>Choose a letter to browse every word and its English meaning. Prefer searching? <a href="/dictionary.html">Open dictionary search</a>.</p>`;
  const jsonLd = JSON.stringify({'@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:SITE + path, isPartOf:{'@type':'WebSite', name:'Isese Ponbele', url:SITE + '/'}}).replace(/</g, '\\u003c');
  res.statusCode = 200;
  res.setHeader('X-Robots-Tag', 'index, follow');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Isese Ponbele</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large"><link rel="canonical" href="${esc(SITE + path)}"><link rel="icon" href="/assets/isese-ponbele-logo-polished.webp"><link rel="stylesheet" href="/styles.css?v=20261008-global-footer-v1"><script type="application/ld+json">${jsonLd}</script>
<style>body{background:#ead8bc;color:#31180b}.browse-shell{max-width:1000px;margin:auto;padding:36px 24px 64px}.browse-shell h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.5rem);line-height:1.1;margin:24px 0}.browse-shell p{line-height:1.7;margin:12px 0}.browse-shell a{color:#664522;text-decoration:underline}.browse-letters,.browse-pages{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}.browse-letters a,.browse-pages a{display:block;padding:10px 14px;background:#fff8ed;border:1px solid #d5bd99;border-radius:8px;text-decoration:none}.browse-letters small{display:block;font-size:.7rem}.browse-shell [aria-current="page"]{background:#31180b;color:#fff8ed}.browse-shell article{background:#fff8ed;border:1px solid #d5bd99;border-radius:10px;margin:14px 0;padding:22px}.browse-shell article h2{font-family:Georgia,serif;font-size:1.7rem;margin:0}.browse-shell .context{color:#655444}.browse-shell footer{margin-top:36px;border-top:1px solid #d5bd99;padding-top:20px}</style></head>
<body><main class="browse-shell"><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/dictionary.html">Dictionary search</a>${letter ? ' / <a href="/dictionary">Browse A–Z</a> / ' + esc(label) : ''}</nav><h1>${esc(title)}</h1><p>${esc(description)}</p><nav class="browse-letters" aria-label="Browse words by first letter">${letters}</nav>${pagination}${rows}${pagination}<footer><p>This dictionary uses simplified unmarked Yoruba spelling. Meanings vary by dialect, region and context. General vocabulary is adapted from Wiktionary/Kaikki; cultural entries include Isese Ponbele editorial material.</p><a href="/about.html">About our editorial approach</a> · <a href="/credits.html">Sources and credits</a></footer></main></body></html>`);
};

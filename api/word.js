const words = require('./dictionary-data.json');

const SITE = 'https://isese-ponbele.vercel.app';
const bySlug = new Map(words.map(x => [x.slug, x]));
const byTerm = new Map(words.map(x => [String(x.term || '').toLowerCase(), x]));

function esc(v='') {
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function page(entry) {
  const canonical = SITE + '/word/' + encodeURIComponent(entry.slug);
  const title = entry.term + ' Meaning in Yoruba | Isese Ponbele Dictionary';
  const desc = String(entry.meaning || entry.context || ('Meaning of ' + entry.term + ' in Yoruba')).slice(0,155);
  const related = (entry.related || []).map(name => {
    const match = byTerm.get(String(name).toLowerCase());
    const href = match ? '/word/' + encodeURIComponent(match.slug) : '/dictionary.html?q=' + encodeURIComponent(name);
    return '<a href="' + href + '">' + esc(name) + '</a>';
  }).join('');
  const variants = (entry.aliases || []).length
    ? '<div class="variants"><strong>Variants:</strong> ' + entry.aliases.map(esc).join(' · ') + '</div>' : '';
  const jsonLd = JSON.stringify({
    '@context':'https://schema.org',
    '@type':'DefinedTerm',
    name:entry.term,
    description:entry.meaning || entry.context || '',
    url:canonical,
    inDefinedTermSet:{'@type':'DefinedTermSet',name:'Isese Ponbele Yoruba Dictionary',url:SITE+'/dictionary.html'}
  }).replace(/</g,'\\u003c');

  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title><meta name="description" content="' + esc(desc) + '">' +
    '<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">' +
    '<link rel="canonical" href="' + esc(canonical) + '"><link rel="icon" type="image/webp" href="/assets/isese-ponbele-logo-polished.webp">' +
    '<meta property="og:type" content="article"><meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(desc) + '"><meta property="og:url" content="' + esc(canonical) + '">' +
    '<link rel="stylesheet" href="/styles.css?v=20261007-word-pages-v1"><script type="application/ld+json">' + jsonLd + '</script>' +
    '<style>.word-page{min-height:70vh;background:#ead8bc;padding:54px 0 70px}.word-shell{max-width:900px;margin:auto;padding:0 24px}.word-back{display:inline-flex;margin-bottom:24px;color:#81572c;text-decoration:none;font-weight:800;font-size:.78rem}.word-card{background:#fff8ed;border:1px solid #d5bd99;border-radius:12px;padding:clamp(26px,5vw,54px);box-shadow:0 18px 42px rgba(64,36,17,.08)}.word-type{font-size:.66rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#9a682f}.word-title{font-family:Georgia,serif;font-size:clamp(3rem,8vw,6rem);line-height:.9;margin:12px 0 24px;color:#31180b}.word-meaning{font-size:1.2rem;line-height:1.65;color:#30261e;font-weight:700}.word-context{font-size:1rem;line-height:1.7;color:#655444;margin-top:15px}.variants{margin-top:18px;color:#745532;line-height:1.6}.related{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}.related a{padding:8px 11px;border-radius:999px;background:#efe0c7;color:#664522;text-decoration:none;font-size:.72rem;font-weight:800}.word-note{margin-top:24px;padding-top:18px;border-top:1px solid #e3cfb0;color:#806c58;font-size:.72rem;line-height:1.6}@media(max-width:600px){.word-page{padding-top:30px}.word-shell{padding:0 15px}.word-card{padding:24px 18px}.word-meaning{font-size:1.05rem}}</style></head><body>' +
    '<header class="site-header"><div class="container nav"><a class="brand" href="/index.html"><img src="/assets/isese-ponbele-logo-polished.webp" alt="Isese Ponbele"><span class="brand-copy"><strong>ISESE PONBELE</strong><small>Yoruba Traditional Knowledge House</small></span></a><nav class="nav-links"><a href="/index.html">Home</a><a href="/orisas.html">Orisa</a><a href="/oogun.html">Oogun & Iwosan</a><a href="/dictionary.html">Dictionary</a><a href="/store.html">Store</a></nav></div></header>' +
    '<main class="word-page"><div class="word-shell"><a class="word-back" href="/dictionary.html">← Yoruba Dictionary</a><article class="word-card">' +
    '<div class="word-type">' + esc(entry.partOfSpeech || entry.category || 'Yoruba word') + '</div>' +
    '<h1 class="word-title">' + esc(entry.term) + '</h1><div class="word-meaning">' + esc(entry.meaning || '') + '</div>' +
    (entry.context ? '<div class="word-context">' + esc(entry.context) + '</div>' : '') + variants +
    (related ? '<div class="related">' + related + '</div>' : '') +
    '<div class="word-note">This dictionary uses simplified unmarked Yoruba spelling for consistency. Meanings can vary by dialect, region and context.</div>' +
    '</article></div></main><footer class="site-footer"><div class="container"><div class="footer-bottom"><span>© Isese Ponbele</span><span>Yoruba language • culture • traditional knowledge</span></div></div></footer></body></html>';
}

module.exports = (req,res) => {
  const slug = String(req.query.slug || '').replace(/^\/+|\/+$/g,'');
  const entry = bySlug.get(slug);
  if(!entry){
    res.statusCode = 404;
    res.setHeader('X-Robots-Tag','noindex, follow');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.end('<!doctype html><html><head><meta name="robots" content="noindex"><title>Word not found</title></head><body><p>Word not found. <a href="/dictionary.html">Open the Yoruba Dictionary</a>.</p></body></html>');
  }
  res.statusCode = 200;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Robots-Tag','index, follow');
  res.end(page(entry));
};

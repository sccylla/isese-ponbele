const ORISAS=require('./orisa-data.json');
const SITE='https://isese-ponbele.vercel.app';
const bySlug=new Map(ORISAS.map(x=>[x.slug,x]));
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function graph(o){
  return '<div class="orisa-domain-graphic" aria-label="Domain map for '+esc(o.name)+'"><div class="orisa-domain-center"><strong>'+esc(o.name)+'</strong><small>cultural map</small></div>'+
  (o.domains||[]).slice(0,4).map((d,i)=>'<span class="domain-node node-'+(i+1)+'">'+esc(d)+'</span>').join('')+'</div>';
}
function page(o){
  const url=SITE+'/orisa/'+encodeURIComponent(o.slug);
  const title=o.name+': Yoruba Orisa Documentary | Isese Ponbele';
  const desc=String(o.lead||'').slice(0,158);
  const sections=[
    ['identity','Identity & worldview','<p class="lead-paragraph">'+esc(o.lead)+'</p>'+(o.overview||[]).map(p=>'<p>'+esc(p)+'</p>').join('')],
    ['visual','Visual & conceptual map',graph(o)],
    ['names','Names, titles & praise language','<p>'+esc(o.titles)+'</p>'],
    ['oral','Oral tradition & cultural memory','<p>'+esc(o.oral)+'</p>'],
    ['material','Material culture & representation','<p>'+esc(o.material)+'</p>'],
    ['worship','Worship, priesthood & institutions','<p>'+esc(o.worship)+'</p>'],
    ['geography','Sacred geography','<p>'+esc(o.geography)+'</p>'],
    ['festivals','Festivals & public life','<p>'+esc(o.festivals)+'</p>'],
    ['variation','Regional & lineage variation','<p>'+esc(o.variation)+'</p>'],
    ['diaspora','Diaspora & historical movement','<p>'+esc(o.diaspora)+'</p>'],
    ['study','Extended documentation',(o.deepDive||[]).map(p=>'<p>'+esc(p)+'</p>').join('')],
    ['misconceptions','Common misconceptions','<p>'+esc(o.misconceptions)+'</p>'],
    ['references','Reference trail','<ul class="reference-list">'+(o.refs||[]).map(r=>'<li>'+esc(r)+'</li>').join('')+'</ul><div class="source-links">'+(o.sources||[]).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+' ↗</a>').join('')+'</div>']
  ];
  const related=ORISAS.filter(x=>x.slug!==o.slug).sort((a,b)=>{
    const A=(a.domains||[]).filter(d=>(o.domains||[]).includes(d)).length;
    const B=(b.domains||[]).filter(d=>(o.domains||[]).includes(d)).length;
    return B-A;
  }).slice(0,4);
  const jsonLd=JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'Article','@id':url+'#article',headline:o.name+' — Yoruba Orisa documentary',description:desc,image:o.image,datePublished:'2026-10-08',dateModified:'2026-10-08',mainEntityOfPage:url,inLanguage:'en',publisher:{'@type':'Organization',name:'Isese Ponbele',url:SITE+'/',logo:{'@type':'ImageObject',url:SITE+'/assets/isese-ponbele-logo-polished.webp'}},about:['Yoruba culture','Isese','Orisa',o.name]},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE+'/'},{'@type':'ListItem',position:2,name:'Yoruba Orisa',item:SITE+'/orisas.html'},{'@type':'ListItem',position:3,name:o.name,item:url}]}
  ]}).replace(/</g,'\\u003c');
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#120704"><title>'+esc(title)+'</title><meta name="description" content="'+esc(desc)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="'+esc(url)+'"><link rel="icon" type="image/webp" href="/assets/isese-ponbele-logo-polished.webp"><link rel="stylesheet" href="/styles.css?v=20261008-premium-v1"><meta property="og:type" content="article"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(desc)+'"><meta property="og:url" content="'+esc(url)+'"><meta property="og:image" content="'+esc(o.image)+'"><script type="application/ld+json">'+jsonLd+'</script></head><body data-page="orisa"><header class="site-header"><div class="container nav"><a class="brand" href="/index.html"><img src="/assets/isese-ponbele-logo-polished.webp" alt="Isese Ponbele emblem"><span class="brand-copy"><strong>ISESE PONBELE</strong><small>Yoruba Traditional Knowledge House</small></span></a><nav class="nav-links"><a href="/index.html">Home</a><a class="active" href="/orisas.html">Orisa</a><a href="/oogun.html">Oogun & Iwosan</a><a href="/dictionary.html">Dictionary</a><a href="/store.html">Store</a><a class="consult-link" href="/consultation.html">Consultation</a></nav></div></header><main><section class="page-hero orisa-pub-hero"><div class="container"><div class="breadcrumbs"><a href="/index.html">Home</a><span>/</span><a href="/orisas.html">Orisa</a><span>/</span><span>'+esc(o.name)+'</span></div><p class="eyebrow">ISESE PONBELE • ORISA PUBLICATION</p><h1 class="page-title">'+esc(o.name)+'</h1><p class="page-lead">'+esc(o.lead)+'</p><div class="domain-row">'+(o.domains||[]).map(d=>'<span>'+esc(d)+'</span>').join('')+'</div></div></section><section class="section alt"><div class="container doc-shell"><article class="doc-article"><figure class="doc-media premium-orisa-media"><img src="'+esc(o.image)+'" alt="'+esc(o.imageCaption||('Cultural documentation for '+o.name))+'" referrerpolicy="no-referrer"><figcaption>'+esc(o.imageCaption||'Documented cultural context.')+'</figcaption></figure>'+sections.map(s=>'<section id="'+s[0]+'"><p class="eyebrow">Documentary chapter</p><h2>'+esc(s[1])+'</h2>'+s[2]+'</section>').join('')+'<section class="related-orisa-section"><p class="eyebrow">Continue exploring</p><h2>Related Yoruba sacred traditions</h2><div class="seo-topic-grid">'+related.map(r=>'<a href="/orisa/'+encodeURIComponent(r.slug)+'"><strong>'+esc(r.name)+'</strong><span>'+esc(r.classification)+'</span></a>').join('')+'</div></section></article><aside class="doc-toc"><strong>On this page</strong>'+sections.map(s=>'<a href="#'+s[0]+'">'+esc(s[1])+'</a>').join('')+'</aside></div></section></main><footer class="site-footer"><div class="container"><div class="footer-bottom"><span>© Isese Ponbele</span><span>Yoruba culture • Isese • documented traditional knowledge</span></div></div></footer></body></html>';
}
module.exports=(req,res)=>{const slug=String(req.query.slug||'').replace(/^\/+|\/+$/g,'');const o=bySlug.get(slug);if(!o){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex, follow');return res.end('Orisa publication not found');}res.statusCode=200;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');res.setHeader('X-Robots-Tag','index, follow');res.end(page(o));};
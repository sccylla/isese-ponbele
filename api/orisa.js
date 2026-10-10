const ORISAS=require('./orisa-data.json');
const SITE='https://www.onisese.ng';
const bySlug=new Map(ORISAS.map(x=>[x.slug,x]));
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function relatedFor(o){
  return ORISAS.filter(x=>x.slug!==o.slug).sort((a,b)=>{
    const A=(a.domains||[]).filter(d=>(o.domains||[]).includes(d)).length;
    const B=(b.domains||[]).filter(d=>(o.domains||[]).includes(d)).length;
    return B-A;
  }).slice(0,4);
}
function chaptersFor(o){
  if(Array.isArray(o.chapters)&&o.chapters.length) return o.chapters;
  const d=[...(o.deepDive||[])],take=n=>d.splice(0,n);
  return [
    {id:'identity',title:'Identity, meaning & worldview',paragraphs:[o.lead,...(o.overview||[]),...take(3)]},
    {id:'language',title:'Names, praise language & oral memory',paragraphs:[o.titles,o.oral,...take(3)]},
    {id:'material',title:'Material culture, symbols & visual language',paragraphs:[o.material,...take(3)]},
    {id:'institutions',title:'Worship, priesthood & transmission',paragraphs:[o.worship,...take(3)]},
    {id:'geography',title:'Landscape, place & sacred geography',paragraphs:[o.geography,...take(3)]},
    {id:'public-life',title:'Festivals, public life & community memory',paragraphs:[o.festivals,...take(3)]},
    {id:'variation',title:'Regional variation, diaspora & historical change',paragraphs:[o.variation,o.diaspora,...take(4)]},
    {id:'continuity',title:'Contemporary interpretation & continuity',paragraphs:[...d,o.misconceptions]}
  ];
}
function socialIcons(){
  return '<div class="footer-socials" aria-label="Isese Ponbele social media">'+
    '<a href="https://www.tiktok.com/@iseseponbele" target="_blank" rel="me noopener" aria-label="TikTok"><span class="social-mark">TT</span><b>TikTok</b></a>'+
    '<a href="https://www.youtube.com/@iseseponbele" target="_blank" rel="me noopener" aria-label="YouTube"><span class="social-mark">▶</span><b>YouTube</b></a>'+
    '<a href="https://wa.me/2347047604452" target="_blank" rel="noopener" aria-label="WhatsApp"><span class="social-mark">WA</span><b>WhatsApp</b></a>'+
  '</div>';
}
function page(o){
  const url=SITE+'/orisa/'+encodeURIComponent(o.slug);
  const title=o.name+': Yoruba Òrìṣà Documentary | Isese Ponbele';
  const desc=String(o.lead||'').slice(0,158);
  const chapters=chaptersFor(o).map((ch,i)=>({
    id:ch.id||('chapter-'+(i+1)),
    title:ch.title||('Chapter '+(i+1)),
    paragraphs:(ch.paragraphs||[]).filter(Boolean)
  })).filter(ch=>ch.paragraphs.length);
  const related=relatedFor(o);
  const jsonLd=JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'Article','@id':url+'#article',headline:o.name+' — Yoruba Òrìṣà documentary',description:desc,image:o.image,datePublished:'2026-10-08',dateModified:'2026-10-09',mainEntityOfPage:url,inLanguage:'en',publisher:{'@type':'Organization',name:'Isese Ponbele',url:SITE+'/',logo:{'@type':'ImageObject',url:SITE+'/assets/isese-ponbele-logo-polished.webp'}},about:['Yoruba culture','Isese','Orisa',o.name]},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE+'/'},{'@type':'ListItem',position:2,name:'Yoruba Òrìṣà',item:SITE+'/orisas.html'},{'@type':'ListItem',position:3,name:o.name,item:url}]}
  ]}).replace(/</g,'\\u003c');

  const chapterHtml=chapters.map((ch,i)=>
    '<section id="'+esc(ch.id)+'" class="orisa-live-chapter">'+
      '<div class="orisa-live-chapter-head"><span class="orisa-live-number">'+String(i+1).padStart(2,'0')+'</span><h2>'+esc(ch.title)+'</h2></div>'+
      '<div class="orisa-live-prose">'+ch.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+
    '</section>'
  ).join('');

  const toc=chapters.map((ch,i)=>'<a href="#'+esc(ch.id)+'">'+String(i+1).padStart(2,'0')+' &nbsp; '+esc(ch.title)+'</a>').join('');
  const relatedHtml=related.map(r=>
    '<a href="/orisa/'+encodeURIComponent(r.slug)+'">'+
      '<img src="'+esc(r.image)+'" alt="" referrerpolicy="no-referrer">'+
      '<span><strong>'+esc(r.name)+'</strong><small>'+esc(r.classification)+'</small></span><b>›</b>'+
    '</a>'
  ).join('');
  const themes=(o.domains||[]).join(' • ');
  const intro='This long-form publication follows '+esc(o.name)+' through oral tradition, social history, material culture, sacred geography, ritual institutions, regional variation and modern continuity. The chapters are written as one connected documentary rather than a set of short dictionary entries.';

  return '<!doctype html><html lang="en"><head>'+
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#120704">'+
    '<title>'+esc(title)+'</title><meta name="description" content="'+esc(desc)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">'+
    '<link rel="canonical" href="'+esc(url)+'"><link rel="icon" type="image/webp" href="/assets/isese-ponbele-logo-polished.webp">'+
    '<link rel="stylesheet" href="/styles.css?v=20261009-live-doc-v2">'+
    '<meta property="og:type" content="article"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(desc)+'"><meta property="og:url" content="'+esc(url)+'"><meta property="og:image" content="'+esc(o.image)+'">'+
    '<script type="application/ld+json">'+jsonLd+'</script></head>'+
    '<body data-page="orisa">'+
    '<header class="site-header"><div class="container nav">'+
      '<a class="brand" href="/index.html" aria-label="Isese Ponbele home"><img src="/assets/isese-ponbele-logo-polished.webp" alt=""><span class="brand-copy"><strong>ISESE PONBELE</strong><small>Yoruba Traditional Knowledge House</small></span></a>'+
      '<button class="menu-btn" type="button" aria-label="Open navigation" aria-expanded="false"><span></span></button>'+
      '<nav class="nav-links" aria-label="Primary navigation"><a href="/index.html">Home</a><a class="active" href="/orisas.html">Òrìṣà</a><a href="/oogun.html">Oogun & Ìwòsàn</a><a href="/dictionary.html">Dictionary</a><a href="/store.html">Store</a><a class="consult-link" href="/consultation.html">Consultation</a></nav>'+
    '</div></header>'+
    '<main>'+
      '<section class="orisa-live-hero"><div class="container">'+
        '<div class="breadcrumbs"><a href="/index.html">Home</a><span>/</span><a href="/orisas.html">Òrìṣà</a><span>/</span><span>'+esc(o.name)+'</span></div>'+
        '<div class="orisa-live-hero-grid"><div>'+
          '<p class="orisa-live-kicker">ISESE PONBELE • YORUBA CULTURAL PUBLICATION</p>'+
          '<h1 class="orisa-live-title">'+esc(o.name)+'</h1>'+
          '<p class="orisa-live-lead">'+esc(o.lead)+'</p>'+
        '</div>'+
        '<figure class="orisa-live-hero-media"><img src="'+esc(o.image)+'" alt="'+esc(o.imageCaption||('Cultural documentation for '+o.name))+'" referrerpolicy="no-referrer"><figcaption>'+esc(o.imageCaption||('Cultural documentation for '+o.name))+'</figcaption></figure></div>'+
        '<div class="orisa-live-meta">'+
          '<div><small>Classification</small><strong>'+esc(o.classification)+'</strong></div>'+
          '<div><small>Core themes</small><strong>'+esc(themes)+'</strong></div>'+
          '<div><small>Format</small><strong>Long-form documentary</strong></div>'+
          '<div><small>Chapters</small><strong>'+chapters.length+' chapters</strong></div>'+
        '</div>'+
      '</div></section>'+
      '<section class="orisa-live-body"><div class="container orisa-live-layout">'+
        '<article class="orisa-live-article">'+
          '<section class="orisa-live-intro"><p class="eyebrow">Documentary overview</p><h2>Understanding '+esc(o.name)+'</h2><p>'+intro+'</p></section>'+
          chapterHtml+
        '</article>'+
        '<aside class="orisa-live-aside">'+
          '<div class="orisa-live-aside-block orisa-live-toc"><strong>On this page</strong>'+toc+'</div>'+
          '<div class="orisa-live-note"><small>Key themes</small><strong>'+esc((o.domains||[]).slice(0,4).join(' • '))+'</strong></div>'+
          '<div class="orisa-live-aside-block"><strong>Related Òrìṣà</strong><div class="orisa-live-related">'+relatedHtml+'</div></div>'+
        '</aside>'+
      '</div></section>'+
    '</main>'+
    '<footer class="site-footer rich-footer orisa-live-footer"><div class="container"><div class="footer-grid">'+
      '<div><div class="footer-brand"><img src="/assets/isese-ponbele-logo-polished.webp" alt="Isese Ponbele logo"><div><strong>ISESE PONBELE</strong><small>Yoruba Traditional Knowledge House</small></div></div><p class="footer-copy">Preserving Yoruba knowledge. Empowering generations. Rooted in tradition, relevant for today.</p>'+socialIcons()+'</div>'+
      '<div class="footer-col"><h4>Knowledge</h4><a href="/isese.html">Ìṣẹ̀ṣe</a><a href="/ifa.html">Ifá</a><a href="/yoruba-culture.html">Yoruba Culture</a><a href="/orisas.html">Òrìṣà</a></div>'+
      '<div class="footer-col"><h4>Resources</h4><a href="/dictionary.html">Yoruba Dictionary</a><a href="/oogun.html">Oogun Library</a><a href="/about.html">About</a><a href="/consultation.html">Consultation</a></div>'+
      '<div class="footer-col footer-motto"><strong>Àṣẹ.<br>Ìmọ̀.<br>Ilé.<br>Generations.</strong></div>'+
    '</div><div class="footer-bottom"><span>© 2026 ISESE PONBELE. All rights reserved.</span><span>Knowledge • Culture • Spirituality • Community</span></div></div></footer>'+
    '<script>(function(){var b=document.querySelector(".menu-btn"),n=document.querySelector(".nav-links");if(!b||!n)return;b.addEventListener("click",function(){var o=n.classList.toggle("open");b.setAttribute("aria-expanded",String(o));document.body.classList.toggle("menu-open",o)});})();</script>'+
    '</body></html>';
}
module.exports=(req,res)=>{
  const slug=String(req.query.slug||'').replace(/^\/+|\/+$/g,'');
  const o=bySlug.get(slug);
  if(!o){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex, follow');return res.end('Orisa publication not found');}
  res.statusCode=200;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=60, stale-while-revalidate=60');
  res.setHeader('X-Robots-Tag','index, follow');
  res.end(page(o));
};

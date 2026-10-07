(() => {
  const DATA = window.ISESE_DATA || {orisas:[],oogun:[],dictionary:[],products:[]};
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];

  const page = document.body.dataset.page || '';
  const menuBtn = $('.menu-btn');
  const nav = $('.nav-links');
  const setMenu = open => {
    if(!menuBtn || !nav) return;
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn?.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  addEventListener('resize',()=>{if(innerWidth>900)setMenu(false)},{passive:true});

  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a[data-nav]').forEach(a=>{
    const key=a.dataset.nav;
    const active =
      (key==='home' && (path==='index.html' || path==='')) ||
      (key==='orisa' && ['orisas.html','orisa.html'].includes(path)) ||
      (key==='oogun' && path==='oogun.html') ||
      (key==='dictionary' && path==='dictionary.html') ||
      (key==='store' && path==='store.html') ||
      (key==='consultation' && path==='consultation.html');
    a.classList.toggle('active',active);
    if(active)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.12}) : null;
  $$('.reveal').forEach(el=>io?io.observe(el):el.classList.add('in'));

  const esc = v => String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function renderFeaturedProducts(){
    const track=$('#featured-products-track');
    if(!track || track.children.length) return;
    const products=DATA.products.slice(0,3);
    track.innerHTML=products.map((p,i)=>`<article class="rich-product-card ${i===1?'featured-product':''}">
      <div class="rich-card-image product-photo"><img src="${p.image}" alt="${esc(p.name)} by ${esc(p.brand||'IP HERBSELIXIR')}"></div>
      <div class="rich-card-body">
        <span class="badge ${i===1?'badge-green':''}">${esc(p.brand||'PRODUCT')}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <a class="featured-order-link" href="${esc(p.orderUrl||'store.html')}" target="_blank" rel="noopener"><strong>${esc(p.price)}</strong><span>Order on WhatsApp →</span></a>
      </div>
    </article>`).join('');
    const dots=$('#featured-products-dots');
    if(dots) dots.innerHTML=products.map((_,i)=>`<i class="${i===0?'active':''}"></i>`).join('');
  }

  function renderHomeProducts(){
    const root=$('#home-products'); if(!root) return;
    root.innerHTML=DATA.products.slice(0,3).map(p=>productCard(p)).join('');
  }

  function productCard(p){
    return `<article class="product-card">
      <div class="product-body">
        <small>${esc(p.cat)}</small>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="product-meta"><strong>${esc(p.price)}</strong><a class="text-link" href="store.html">Open store</a></div>
      </div>
    </article>`;
  }

  function renderOrisaDirectory(){
    const root=$('#orisa-grid'); if(!root) return;
    root.innerHTML=DATA.orisas.map(o=>`<a class="orisa-card reveal" href="orisa.html?id=${encodeURIComponent(o.slug)}">
      <small>${esc(o.classification)}</small>
      <h3>${esc(o.name)}</h3>
      <p>${esc(o.lead)}</p>
      <div class="domain-row">${o.domains.map(d=>`<span>${esc(d)}</span>`).join('')}</div>
      <b>Open documentary →</b>
    </a>`).join('');
    $$('.reveal',root).forEach(el=>io?io.observe(el):el.classList.add('in'));
  }

  function renderOrisaDocumentary(){
    const root=$('#orisa-documentary'); if(!root) return;
    const id=new URLSearchParams(location.search).get('id') || 'orunmila';
    const o=DATA.orisas.find(x=>x.slug===id) || DATA.orisas[0];
    if(!o) return;
    const seoTitle=`${o.name}: Yoruba Òrìṣà Guide | Isese Ponbele`;
    const seoDescription=String(o.lead||'').slice(0,160);
    const canonicalUrl=`https://isese-ponbele.vercel.app/orisa.html?id=${encodeURIComponent(o.slug)}`;
    const seoImage=o.image||'https://isese-ponbele.vercel.app/assets/isese-ponbele-logo-polished.webp';
    document.title=seoTitle;
    const setMeta=(selector,attrs)=>{
      let el=document.head.querySelector(selector);
      if(!el){el=document.createElement('meta');document.head.appendChild(el);}
      Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
      return el;
    };
    setMeta('meta[name="description"]',{name:'description',content:seoDescription});
    setMeta('meta[property="og:type"]',{property:'og:type',content:'article'});
    setMeta('meta[property="og:site_name"]',{property:'og:site_name',content:'Isese Ponbele'});
    setMeta('meta[property="og:title"]',{property:'og:title',content:seoTitle});
    setMeta('meta[property="og:description"]',{property:'og:description',content:seoDescription});
    setMeta('meta[property="og:url"]',{property:'og:url',content:canonicalUrl});
    setMeta('meta[property="og:image"]',{property:'og:image',content:seoImage});
    setMeta('meta[name="twitter:card"]',{name:'twitter:card',content:'summary_large_image'});
    setMeta('meta[name="twitter:title"]',{name:'twitter:title',content:seoTitle});
    setMeta('meta[name="twitter:description"]',{name:'twitter:description',content:seoDescription});
    setMeta('meta[name="twitter:image"]',{name:'twitter:image',content:seoImage});
    let canonical=document.head.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}
    canonical.href=canonicalUrl;
    let ld=document.head.querySelector('#orisa-seo-jsonld');
    if(!ld){ld=document.createElement('script');ld.type='application/ld+json';ld.id='orisa-seo-jsonld';document.head.appendChild(ld);}
    ld.textContent=JSON.stringify({
      '@context':'https://schema.org',
      '@type':'Article',
      headline:`${o.name}: Yoruba Òrìṣà Guide`,
      description:seoDescription,
      url:canonicalUrl,
      image:seoImage,
      mainEntityOfPage:canonicalUrl,
      publisher:{'@type':'Organization',name:'Isese Ponbele',url:'https://isese-ponbele.vercel.app/',logo:{'@type':'ImageObject',url:'https://isese-ponbele.vercel.app/assets/isese-ponbele-logo-polished.webp'}},
      inLanguage:'en',
      about:['Yoruba culture','Òrìṣà','Ìṣẹ̀ṣe',o.name]
    });
    const media = o.image ? `<figure class="doc-media"><img src="${esc(o.image)}" alt="Documented Yoruba cultural representation associated with ${esc(o.name)}" referrerpolicy="no-referrer"><figcaption>Documented cultural image used as context; not presented as a literal photograph of the Òrìṣà.</figcaption></figure>` : '';
    const sections=[
      ['identity','Identity & worldview',`<p class="lead-paragraph">${esc(o.lead)}</p>${o.overview.map(p=>`<p>${esc(p)}</p>`).join('')}`],
      ['names','Names, titles & praise language',`<p>${esc(o.titles)}</p>`],
      ['oral','Oral tradition & cultural memory',`<p>${esc(o.oral)}</p>`],
      ['material','Material culture & representation',`<p>${esc(o.material)}</p>`],
      ['worship','Worship, priesthood & institutions',`<p>${esc(o.worship)}</p>`],
      ['geography','Sacred geography',`<p>${esc(o.geography)}</p>`],
      ['festivals','Festivals & public life',`<p>${esc(o.festivals)}</p>`],
      ['variation','Regional & lineage variation',`<p>${esc(o.variation)}</p>`],
      ['diaspora','Diaspora & historical movement',`<p>${esc(o.diaspora)}</p>`],
      ['misconceptions','Common misconceptions',`<p>${esc(o.misconceptions)}</p>`],
      ['references','Reference trail',`<ul class="reference-list">${o.refs.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`]
    ];
    root.innerHTML=`
      <section class="page-hero">
        <div class="container">
          <div class="breadcrumbs"><a href="index.html">Home</a><span>/</span><a href="orisas.html">Òrìṣà</a><span>/</span><span>${esc(o.name)}</span></div>
          <p class="eyebrow">Ilé Àwọn Òrìṣà • Documentary</p>
          <h1 class="page-title">${esc(o.name)}</h1>
          <p class="page-lead">${esc(o.lead)}</p>
          <div class="domain-row">${o.domains.map(d=>`<span>${esc(d)}</span>`).join('')}</div>
        </div>
      </section>
      <section class="section alt">
        <div class="container doc-shell">
          <article class="doc-article">
            ${media}
            ${sections.map(([id,title,body])=>`<section id="${id}"><p class="eyebrow">Documentary chapter</p><h2>${esc(title)}</h2>${body}</section>`).join('')}
          </article>
          <aside class="doc-toc" aria-label="Documentary contents">
            <strong>On this page</strong>
            ${sections.map(([id,title])=>`<a href="#${id}">${esc(title)}</a>`).join('')}
          </aside>
        </div>
      </section>`;
  }

  function renderOogun(){
    const root=$('#oogun-list'); if(!root) return;
    const q=$('#oogun-search');
    const chips=$$('#oogun-filters .chip');
    const count=$('#oogun-count');
    let cat='All';
    const draw=()=>{
      const query=(q?.value||'').trim().toLowerCase();
      const rows=DATA.oogun.filter(x=>{
        const catOk=cat==='All'||x.cat===cat;
        const qOk=!query||[x.name,x.cat,x.summary].join(' ').toLowerCase().includes(query);
        return catOk&&qOk;
      });
      if(count) count.textContent=`${rows.length} archive ${rows.length===1?'entry':'entries'}`;
      root.innerHTML=rows.length?rows.map(x=>`<article class="archive-row">
        <small>${esc(x.cat)}</small><h3>${esc(x.name)}</h3><p>${esc(x.summary)}</p>
      </article>`).join(''):`<div class="empty-state">No archive entries match this search.</div>`;
    };
    q?.addEventListener('input',draw);
    chips.forEach(ch=>ch.addEventListener('click',()=>{
      cat=ch.dataset.cat;chips.forEach(c=>c.classList.toggle('active',c===ch));draw();
    }));
    draw();
  }

  function renderDictionary(){
    const root=$('#dictionary-list'); if(!root) return;
    const q=$('#dictionary-search');
    const count=$('#dictionary-count');
    const alphabet=$('#alphabet');
    const categoryRoot=$('#dictionary-category-filters');
    const more=$('#dictionary-load-more');
    let letter='';
    let category='All';
    let visible=80;

    const strip=v=>String(v??'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[ẹẸ]/g,m=>m==='Ẹ'?'E':'e')
      .replace(/[ọỌ]/g,m=>m==='Ọ'?'O':'o')
      .replace(/[ṣṢ]/g,m=>m==='Ṣ'?'S':'s')
      .toLowerCase();

    const rowsAll=[...DATA.dictionary].sort((a,b)=>
      strip(a.term).localeCompare(strip(b.term),'en',{sensitivity:'base'}) ||
      String(a.term).localeCompare(String(b.term),'yo')
    );

    const letters=[...new Set(rowsAll.map(x=>strip(x.term).charAt(0).toUpperCase()).filter(Boolean))].sort();
    if(alphabet) alphabet.innerHTML=['All',...letters].map(l=>`<button type="button" data-letter="${l==='All'?'':l}" class="${l==='All'?'active':''}">${l}</button>`).join('');

    const preferred=['General Yoruba','Ìṣẹ̀ṣe & Ifá','Culture & Society','Slang & Colloquial'];
    const present=[...new Set(rowsAll.map(x=>x.category||'General Yoruba'))];
    const cats=['All',...preferred.filter(x=>present.includes(x)),...present.filter(x=>!preferred.includes(x))];
    if(categoryRoot) categoryRoot.innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" type="button" data-category="${esc(c)}">${esc(c)}</button>`).join('');

    const params=new URLSearchParams(location.search);
    const urlQ=params.get('q'); if(q&&urlQ)q.value=urlQ;

    const draw=()=>{
      const query=strip((q?.value||'').trim());
      const rows=rowsAll.filter(x=>{
        const termNorm=strip(x.term);
        const letterOk=!letter||termNorm.startsWith(letter.toLowerCase());
        const catOk=category==='All'||(x.category||'General Yoruba')===category;
        const hay=strip([
          x.term,x.meaning,x.context,x.category,x.partOfSpeech,
          ...(x.related||[]),...(x.aliases||[])
        ].join(' '));
        const qOk=!query||hay.includes(query);
        return letterOk&&catOk&&qOk;
      });

      if(count) count.textContent=`${rows.length.toLocaleString()} ${rows.length===1?'entry':'entries'}`;
      const shown=rows.slice(0,visible);
      root.innerHTML=shown.length?shown.map(x=>`<article class="dictionary-entry">
        <div class="dictionary-entry-top">
          <h3>${esc(x.term)}</h3>
          <div class="dictionary-entry-badges">
            <span>${esc(x.category||'General Yoruba')}</span>
            ${x.partOfSpeech?`<span class="pos-badge">${esc(x.partOfSpeech)}</span>`:''}
          </div>
        </div>
        ${x.aliases?.length?`<p class="dictionary-aliases">Also written/said: ${x.aliases.map(esc).join(', ')}</p>`:''}
        <p class="meaning">${esc(x.meaning)}</p>
        <p>${esc(x.context||'')}</p>
        ${x.related?.length?`<div class="related">${x.related.map(r=>`<span>${esc(r)}</span>`).join('')}</div>`:''}
      </article>`).join(''):`<div class="empty-state">No dictionary entry matches this search.</div>`;

      if(more){
        more.hidden=shown.length>=rows.length;
        more.textContent=`Load more words (${Math.max(0,rows.length-shown.length).toLocaleString()} remaining)`;
      }
    };

    q?.addEventListener('input',()=>{visible=80;draw()});
    alphabet?.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      letter=b.dataset.letter||'';
      visible=80;
      $$('button',alphabet).forEach(x=>x.classList.toggle('active',x===b));
      draw();
    });
    categoryRoot?.addEventListener('click',e=>{
      const b=e.target.closest('[data-category]');if(!b)return;
      category=b.dataset.category||'All';
      visible=80;
      $$('[data-category]',categoryRoot).forEach(x=>x.classList.toggle('active',x===b));
      draw();
    });
    more?.addEventListener('click',()=>{visible+=80;draw()});
    draw();
  }

  function renderStore(){
    const root=$('#store-grid'); if(!root)return;
    const chips=$$('#store-filters .chip');
    const cats=['All',...new Set(DATA.products.map(p=>p.cat))];
    const holder=$('#store-filters');
    if(holder) holder.innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    let cat='All';
    const draw=()=>{
      const rows=DATA.products.filter(p=>cat==='All'||p.cat===cat);
      root.innerHTML=rows.map(p=>`<article class="store-card real-product-card">
        <div class="store-product-image"><img src="${p.image}" alt="${esc(p.name)} by ${esc(p.brand||'IP HERBSELIXIR')}"></div>
        <div class="product-body">
          <small>${esc(p.brand||p.cat)}</small><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
          <div class="product-meta"><strong>${esc(p.price)}</strong><span>${esc(p.cat)}</span></div>
          <div class="store-product-actions">
            <a class="btn btn-gold" href="${esc(p.orderUrl||'#')}" target="_blank" rel="noopener">Order on WhatsApp</a>
            <a class="btn btn-dark-outline" href="consultation.html?subject=${encodeURIComponent('Store enquiry: '+p.name)}">Enquire</a>
          </div>
        </div>
      </article>`).join('');
    };
    holder?.addEventListener('click',e=>{
      const b=e.target.closest('.chip');if(!b)return;
      cat=b.dataset.cat;$$('.chip',holder).forEach(x=>x.classList.toggle('active',x===b));draw();
    });
    draw();
  }

  function homeDictionary(){
    const form=$('#home-dictionary-form');const input=$('#home-dictionary-input');
    form?.addEventListener('submit',e=>{e.preventDefault();location.href='dictionary.html?q='+encodeURIComponent(input.value.trim())});
  }

  function consultation(){
    const form=$('#consultation-form');if(!form)return;
    const params=new URLSearchParams(location.search);
    const subject=$('#subject');if(subject&&params.get('subject'))subject.value=params.get('subject');
    const output=$('#request-output'), pre=$('#request-text'), copy=$('#copy-request');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const fd=new FormData(form);
      const lines=[
        'ISESE PONBELE — CONSULTATION REQUEST',
        '',
        'Name: '+(fd.get('name')||''),
        'Email / WhatsApp: '+(fd.get('contact')||''),
        'Country: '+(fd.get('country')||''),
        'Subject: '+(fd.get('subject')||''),
        'Enquiry type: '+(fd.get('type')||''),
        '',
        'Message:',
        fd.get('message')||''
      ];
      if(pre)pre.textContent=lines.join('\n');
      output?.classList.add('show');
      output?.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
    copy?.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(pre?.textContent||'');copy.textContent='Copied';setTimeout(()=>copy.textContent='Copy request',1600)}
      catch{copy.textContent='Select and copy the text'}
    });
  }

  // Homepage horizontal carousels
  $$('[data-carousel]').forEach(carousel => {
    const track = $('.rich-card-track', carousel);
    const prev = $('.carousel-arrow.prev', carousel);
    const next = $('.carousel-arrow.next', carousel);
    const move = dir => {
      if(!track) return;
      const card = $('.rich-product-card', track);
      const amount = card ? card.getBoundingClientRect().width + 12 : Math.max(260, track.clientWidth * .7);
      track.scrollBy({left: amount * dir, behavior:'smooth'});
    };
    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
  });

  // Lightweight newsletter interaction
  $$('.subscribe-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const button = $('button', form);
      const input = $('input[type="email"]', form);
      if(!input?.value.trim()) return;
      const old = button?.textContent;
      if(button) button.textContent = 'Subscribed ✓';
      form.classList.add('submitted');
      setTimeout(() => { if(button) button.textContent = old || 'Subscribe →'; }, 2200);
    });
  });

  function initSocialLinks(){
    const links=[
      {label:'TikTok',mark:'TT',href:'https://www.tiktok.com/@iseseponbele',rel:'me noopener'},
      {label:'Facebook',mark:'f',href:'https://www.facebook.com/iseseponbele',rel:'me noopener'},
      {label:'YouTube',mark:'▶',href:'https://www.youtube.com/@iseseponbele',rel:'me noopener'},
      {label:'WhatsApp',mark:'WA',href:'https://wa.me/2347047604452',rel:'noopener'}
    ];

    const footerCopy=$('.footer-copy');
    if(footerCopy && !document.querySelector('.footer-socials')){
      const row=document.createElement('div');
      row.className='footer-socials';
      row.setAttribute('aria-label','Isese Ponbele social media');
      row.innerHTML=links.map(x=>`<a href="${x.href}" target="_blank" rel="${x.rel}" aria-label="Isese Ponbele on ${x.label}"><span class="social-mark">${x.mark}</span><b>${x.label}</b></a>`).join('');
      footerCopy.insertAdjacentElement('afterend',row);
    }

    if(!document.querySelector('.social-dock')){
      const dock=document.createElement('nav');
      dock.className='social-dock';
      dock.setAttribute('aria-label','Follow Isese Ponbele');
      dock.innerHTML=links.map(x=>`<a href="${x.href}" target="_blank" rel="${x.rel}" aria-label="${x.label}"><span>${x.mark}</span><b>${x.label}</b></a>`).join('');
      document.body.appendChild(dock);
    }
  }

  function initMotionSystem(){
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('motion-ready');

    // Thin gold scroll progress line.
    let progress = document.querySelector('.site-scroll-progress');
    if(!progress){
      progress=document.createElement('div');
      progress.className='site-scroll-progress';
      progress.setAttribute('aria-hidden','true');
      document.body.appendChild(progress);
    }

    // Staggered reveal for the main visual blocks.
    const revealTargets = [
      ...$('.section-heading-rich'),
      ...$('.seo-topic-grid > a'),
      ...$('.rich-product-card'),
      ...$('.document-card'),
      ...$('.knowledge-house-head'),
      ...$('.knowledge-feature'),
      ...$('.knowledge-story'),
      ...$('.dark-panel'),
      ...$('.newsletter-inner'),
      ...$('.store-card'),
      ...$('.orisa-card'),
      ...$('.dictionary-entry')
    ];
    revealTargets.forEach((el,i)=>{
      el.classList.add('motion-item');
      el.style.setProperty('--motion-delay', ((i%6)*70)+'ms');
    });

    if(!reduce && 'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('motion-visible');
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.10,rootMargin:'0px 0px -4% 0px'});
      revealTargets.forEach(el=>observer.observe(el));
    }else{
      revealTargets.forEach(el=>el.classList.add('motion-visible'));
    }

    // Ambient gold motes in the hero, generated only on the homepage.
    const heroBg=$('.hero-reference-bg');
    if(heroBg && !reduce && !heroBg.querySelector('.hero-mote')){
      for(let i=0;i<14;i++){
        const mote=document.createElement('i');
        mote.className='hero-mote';
        mote.style.setProperty('--x', ((i*37)%97)+'%');
        mote.style.setProperty('--y', ((i*61)%93)+'%');
        mote.style.setProperty('--s', (2+(i%4))+'px');
        mote.style.setProperty('--d', (7+(i%6)*1.4)+'s');
        mote.style.setProperty('--delay', (-i*.73)+'s');
        heroBg.appendChild(mote);
      }
    }

    // Desktop pointer parallax for the emblem panel.
    const brandPanel=$('.hero-brand-panel');
    if(brandPanel && !reduce && matchMedia('(min-width: 901px)').matches){
      brandPanel.addEventListener('pointermove',e=>{
        const r=brandPanel.getBoundingClientRect();
        const x=((e.clientX-r.left)/r.width-.5);
        const y=((e.clientY-r.top)/r.height-.5);
        brandPanel.style.setProperty('--parallax-x',(x*10).toFixed(2)+'px');
        brandPanel.style.setProperty('--parallax-y',(y*8).toFixed(2)+'px');
      },{passive:true});
      brandPanel.addEventListener('pointerleave',()=>{
        brandPanel.style.setProperty('--parallax-x','0px');
        brandPanel.style.setProperty('--parallax-y','0px');
      });
    }

    // Scroll-linked motion without layout thrashing.
    let ticking=false;
    const onScroll=()=>{
      if(ticking)return;
      ticking=true;
      requestAnimationFrame(()=>{
        const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        const pct=Math.min(1,Math.max(0,scrollY/max));
        document.documentElement.style.setProperty('--page-progress',pct);
        if(progress) progress.style.transform='scaleX('+pct+')';

        const hero=$('.hero-reference');
        if(hero && !reduce){
          const offset=Math.min(1,Math.max(0,scrollY/Math.max(1,hero.offsetHeight)));
          hero.style.setProperty('--hero-scroll',(offset*24).toFixed(1)+'px');
        }
        ticking=false;
      });
    };
    addEventListener('scroll',onScroll,{passive:true});
    onScroll();

    // Product carousel glides automatically; pauses on interaction.
    $('[data-carousel]').forEach(carousel=>{
      const track=$('.rich-card-track',carousel);
      if(!track || reduce) return;
      let timer=null;
      let paused=false;
      const step=()=>{
        if(paused || track.scrollWidth<=track.clientWidth+4) return;
        const card=$('.rich-product-card',track);
        const amount=(card?.getBoundingClientRect().width||260)+12;
        const atEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-12;
        track.scrollTo({left:atEnd?0:track.scrollLeft+amount,behavior:'smooth'});
      };
      const start=()=>{ if(!timer) timer=setInterval(step,4200); };
      const stop=()=>{ if(timer){clearInterval(timer);timer=null;} };
      carousel.addEventListener('mouseenter',()=>{paused=true;});
      carousel.addEventListener('mouseleave',()=>{paused=false;});
      carousel.addEventListener('focusin',()=>{paused=true;});
      carousel.addEventListener('focusout',()=>{paused=false;});
      carousel.addEventListener('touchstart',()=>{paused=true;stop();},{passive:true});
      start();
    });
  }

    renderFeaturedProducts();
  renderHomeProducts();
  renderOrisaDirectory();
  renderOrisaDocumentary();
  renderOogun();
  renderDictionary();
  renderStore();
  homeDictionary();
  consultation();
  initSocialLinks();
  initMotionSystem();
})();
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
    document.title=`${o.name} — Isese Ponbele`;
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
    let letter='';
    const letters=[...new Set(DATA.dictionary.map(x=>x.term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase()))].sort();
    if(alphabet) alphabet.innerHTML=['All',...letters].map(l=>`<button type="button" data-letter="${l==='All'?'':l}" class="${l==='All'?'active':''}">${l}</button>`).join('');
    const urlQ=new URLSearchParams(location.search).get('q'); if(q&&urlQ)q.value=urlQ;
    const draw=()=>{
      const query=(q?.value||'').trim().toLowerCase();
      const rows=DATA.dictionary.filter(x=>{
        const norm=x.term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
        const lOk=!letter||norm.startsWith(letter);
        const qOk=!query||[x.term,x.meaning,x.context,...x.related].join(' ').toLowerCase().includes(query);
        return lOk&&qOk;
      });
      if(count)count.textContent=`${rows.length} ${rows.length===1?'term':'terms'}`;
      root.innerHTML=rows.length?rows.map(x=>`<article class="dictionary-entry">
        <h3>${esc(x.term)}</h3>
        <p class="meaning">${esc(x.meaning)}</p>
        <p>${esc(x.context)}</p>
        <div class="related">${x.related.map(r=>`<span>${esc(r)}</span>`).join('')}</div>
      </article>`).join(''):`<div class="empty-state">No dictionary term matches this search.</div>`;
    };
    q?.addEventListener('input',draw);
    alphabet?.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      letter=b.dataset.letter||'';$$('button',alphabet).forEach(x=>x.classList.toggle('active',x===b));draw();
    });
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
      root.innerHTML=rows.map(p=>`<article class="store-card">
        <div class="product-body">
          <small>${esc(p.cat)}</small><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
          <div class="product-meta"><strong>${esc(p.price)}</strong></div>
          <a class="btn btn-dark" href="consultation.html?subject=${encodeURIComponent('Store enquiry: '+p.name)}">Enquire about this category</a>
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

  renderHomeProducts();
  renderOrisaDirectory();
  renderOrisaDocumentary();
  renderOogun();
  renderDictionary();
  renderStore();
  homeDictionary();
  consultation();
})();
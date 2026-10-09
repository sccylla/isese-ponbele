(() => {
  const DATA = window.ISESE_DATA || {orisas:[],oogun:[],dictionary:[],products:[]};
  const ORISAS = window.ORISA_PUBLICATIONS || DATA.orisas || [];
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
    if(!track) return;

    const presentation={
      'Infection Crusher':{
        eyebrow:'BOTANICAL FORMULA',
        tagline:'Traditional botanical blend',
        points:['Botanical blend','Traditional formula']
      },
      'Gorilla Max':{
        eyebrow:'MEN’S HERBAL FORMULA',
        tagline:'Traditional herbal blend for men',
        points:['Herbal blend','Men’s formula']
      },
      'IP Pile Elixir Combo (Agbo + Agunmu)':{
        eyebrow:'HERBAL COMBO',
        tagline:'Traditional herbal combo',
        points:['Herbal blend','Combo pack']
      }
    };

    const products=DATA.products.slice(0,3);

    track.innerHTML=products.map(function(p,i){
      const meta=presentation[p.name]||{
        eyebrow:'IP HERBS ELIXIR',
        tagline:p.cat||'Traditional herbal product',
        points:['Herbal blend','Traditional formula']
      };

      return '<article class="clear-product-card clear-tone-'+(i+1)+'">'+
        '<a class="clear-product-media" href="'+esc(p.orderUrl||'store.html')+'" target="_blank" rel="noopener" aria-label="Order '+esc(p.name)+' on WhatsApp">'+
          '<span class="clear-media-brand">IP HERBS <b>ELIXIR</b></span>'+
          '<img src="'+p.image+'" alt="'+esc(p.name)+' product" loading="'+(i===0?'eager':'lazy')+'">'+
        '</a>'+
        '<div class="clear-product-content">'+
          '<span class="clear-kicker">'+esc(meta.eyebrow)+'</span>'+
          '<h3>'+esc(p.name)+'</h3>'+
          '<p>'+esc(meta.tagline)+'</p>'+
          '<div class="clear-product-points">'+meta.points.map(function(point){return '<span><i>✓</i>'+esc(point)+'</span>';}).join('')+'</div>'+
          '<div class="clear-product-footer">'+
            '<strong>'+esc(p.price)+'</strong>'+
            '<a href="'+esc(p.orderUrl||'store.html')+'" target="_blank" rel="noopener">ORDER NOW <b>→</b></a>'+
          '</div>'+
        '</div>'+
      '</article>';
    }).join('');

    const dots=$('#featured-products-dots');
    const cards=$$('.clear-product-card',track);
    if(!dots || !cards.length) return;

    dots.innerHTML=cards.map(function(_,i){
      return '<button type="button" class="'+(i===0?'active':'')+'" aria-label="Show product '+(i+1)+'" data-index="'+i+'"></button>';
    }).join('');

    const buttons=$$('button',dots);
    let activeIndex=0;
    let autoTimer=0;
    let resumeTimer=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setActive=function(index){
      activeIndex=index;
      buttons.forEach(function(button,i){button.classList.toggle('active',i===index);});
    };

    const centerCard=function(index,behavior){
      const card=cards[index];
      if(!card) return;
      const left=card.offsetLeft-((track.clientWidth-card.offsetWidth)/2);
      track.scrollTo({left:Math.max(0,left),behavior:behavior||'smooth'});
      setActive(index);
    };

    const stopAuto=function(){
      if(autoTimer){clearInterval(autoTimer);autoTimer=0;}
      if(resumeTimer){clearTimeout(resumeTimer);resumeTimer=0;}
    };

    const startAuto=function(){
      stopAuto();
      if(reduced || innerWidth>640 || cards.length<2) return;
      autoTimer=setInterval(function(){
        const next=(activeIndex+1)%cards.length;
        centerCard(next,'smooth');
      },4200);
    };

    const pauseThenResume=function(){
      stopAuto();
      if(reduced || innerWidth>640) return;
      resumeTimer=setTimeout(startAuto,6500);
    };

    buttons.forEach(function(btn){
      btn.addEventListener('click',function(){
        centerCard(Number(btn.dataset.index),'smooth');
        pauseThenResume();
      });
    });

    let raf=0;
    track.addEventListener('scroll',function(){
      if(raf) return;
      raf=requestAnimationFrame(function(){
        raf=0;
        if(innerWidth>640) return;
        const center=track.scrollLeft+(track.clientWidth/2);
        let best=0, distance=Infinity;
        cards.forEach(function(card,i){
          const d=Math.abs((card.offsetLeft+card.offsetWidth/2)-center);
          if(d<distance){distance=d;best=i;}
        });
        setActive(best);
      });
    },{passive:true});

    ['touchstart','pointerdown','wheel'].forEach(function(evt){
      track.addEventListener(evt,pauseThenResume,{passive:true});
    });

    addEventListener('resize',startAuto,{passive:true});
    document.addEventListener('visibilitychange',function(){
      if(document.hidden) stopAuto(); else startAuto();
    });

    startAuto();
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
    root.innerHTML=ORISAS.map(o=>`<a class="orisa-card orisa-publication-card reveal" href="/orisa/${encodeURIComponent(o.slug)}">
      <div class="orisa-card-media"><img src="${esc(o.image)}" alt="${esc(o.imageCaption||('Cultural context for '+o.name))}" loading="lazy" referrerpolicy="no-referrer"><span>LONG-FORM DOCUMENTARY</span></div>
      <div class="orisa-card-content">
        <small>${esc(o.classification)}</small>
        <h3>${esc(o.name)}</h3>
        <p>${esc(o.lead)}</p>
        <div class="domain-row">${o.domains.map(d=>`<span>${esc(d)}</span>`).join('')}</div>
        <b>Read publication →</b>
      </div>
    </a>`).join('');
    $$('.reveal',root).forEach(el=>io?io.observe(el):el.classList.add('in'));
  }

  function renderOrisaDocumentary(){
    const root=$('#orisa-documentary'); if(!root) return;
    const id=new URLSearchParams(location.search).get('id') || 'orunmila';
    const o=ORISAS.find(x=>x.slug===id) || ORISAS[0];
    if(!o) return;

    const canonicalUrl=`https://isese-ponbele.vercel.app/orisa/${encodeURIComponent(o.slug)}`;
    document.title=`${o.name}: Yoruba Òrìṣà — History, Tradition & Living Culture | Isese Ponbele`;
    let canonical=document.head.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}
    canonical.href=canonicalUrl;

    const setMeta=(selector,attrs)=>{
      let el=document.head.querySelector(selector);
      if(!el){el=document.createElement('meta');document.head.appendChild(el);}
      Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
      return el;
    };
    setMeta('meta[name="description"]',{name:'description',content:String(o.lead||'').slice(0,158)});

    const graph=`<div class="orisa-domain-graphic documentary-domain-map" aria-label="Cultural domain map for ${esc(o.name)}">
      <div class="orisa-domain-center"><strong>${esc(o.name)}</strong><small>cultural map</small></div>
      ${o.domains.slice(0,4).map((d,i)=>`<span class="domain-node node-${i+1}">${esc(d)}</span>`).join('')}
    </div>`;

    const media=`<figure class="doc-media premium-orisa-media">
      <img src="${esc(o.image)}" alt="${esc(o.imageCaption||('Cultural documentation for '+o.name))}" referrerpolicy="no-referrer">
      <figcaption>${esc(o.imageCaption||'Documented cultural context.')}</figcaption>
    </figure>`;

    const genericChapters=()=>{
      const d=[...(o.deepDive||[])];
      const take=n=>d.splice(0,n);
      return [
        {id:'identity',title:'Identity, meaning & worldview',paragraphs:[o.lead,...(o.overview||[]),...take(2)]},
        {id:'language',title:'Names, praise language & remembered character',paragraphs:[o.titles,o.oral,...take(2)]},
        {id:'material',title:'Sacred imagery, material culture & symbols',paragraphs:[o.material,...take(3)]},
        {id:'institutions',title:'Worship, priesthood, apprenticeship & transmission',paragraphs:[o.worship,...take(3)]},
        {id:'geography',title:'Landscape, place & sacred geography',paragraphs:[o.geography,...take(2)]},
        {id:'public-life',title:'Festivals, public life & community memory',paragraphs:[o.festivals,...take(2)]},
        {id:'variation',title:'Regional traditions, historical change & the Atlantic world',paragraphs:[o.variation,o.diaspora,...take(3)]},
        {id:'continuity',title:'Contemporary meaning, interpretation & continuity',paragraphs:[...d,o.misconceptions]}
      ];
    };

    const chapters=(o.chapters?.length?o.chapters:genericChapters())
      .map((ch,i)=>({
        id:ch.id||('chapter-'+(i+1)),
        title:ch.title||('Chapter '+(i+1)),
        paragraphs:(ch.paragraphs||[]).filter(Boolean)
      }))
      .filter(ch=>ch.paragraphs.length);

    const chapterHtml=chapters.map((ch,i)=>`
      <section id="${esc(ch.id)}" class="orisa-documentary-chapter">
        <div class="documentary-chapter-heading">
          <span class="chapter-index">${String(i+1).padStart(2,'0')}</span>
          <h2>${esc(ch.title)}</h2>
        </div>
        <div class="documentary-prose">
          ${ch.paragraphs.map((p,j)=>`<p class="${j===0?'chapter-opening':''}">${esc(p)}</p>`).join('')}
        </div>
      </section>`).join('');

    const summary=`<div class="orisa-publication-summary">
      <div><small>Classification</small><strong>${esc(o.classification)}</strong></div>
      <div><small>Core themes</small><strong>${o.domains.map(esc).join(' • ')}</strong></div>
      <div><small>Publication format</small><strong>Long-form cultural documentary</strong></div>
    </div>`;

    root.innerHTML=`
      <section class="page-hero orisa-pub-hero">
        <div class="container">
          <div class="breadcrumbs"><a href="index.html">Home</a><span>/</span><a href="orisas.html">Òrìṣà</a><span>/</span><span>${esc(o.name)}</span></div>
          <p class="eyebrow">ISESE PONBELE • YORUBA CULTURAL PUBLICATION</p>
          <h1 class="page-title">${esc(o.name)}</h1>
          <p class="page-lead">${esc(o.lead)}</p>
          <div class="domain-row">${o.domains.map(d=>`<span>${esc(d)}</span>`).join('')}</div>
        </div>
      </section>
      <section class="section alt">
        <div class="container doc-shell orisa-documentary-full">
          <article class="doc-article">
            ${media}
            ${summary}
            <section class="orisa-map-intro">
              <div>
                <p class="eyebrow">Cultural map</p>
                <h2>A tradition with several connected dimensions</h2>
                <p>The domains associated with ${esc(o.name)} overlap with social history, landscape, ritual institutions, oral memory and regional practice. The map below is an orientation to the publication, not a substitute for the fuller chapters that follow.</p>
              </div>
              ${graph}
            </section>
            ${chapterHtml}
          </article>
          <aside class="doc-toc">
            <strong>On this page</strong>
            ${chapters.map(ch=>`<a href="#${esc(ch.id)}">${esc(ch.title)}</a>`).join('')}
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
    const alphabet=$('#alphabet');
    const categoryRoot=$('#dictionary-category-filters');
    const more=$('#dictionary-load-more');
    const status=$('#dictionary-status');
    const randomBtn=$('#dictionary-random');

    let letter='';
    let category='All';
    let visible=60;

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

    const letterOrder=['A','B','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U','W','Y'];
    const presentLetters=new Set(rowsAll.map(x=>strip(x.term).charAt(0).toUpperCase()).filter(Boolean));
    const letters=letterOrder.filter(x=>presentLetters.has(x));
    if(alphabet) alphabet.innerHTML=['All',...letters].map(l=>`<button type="button" data-letter="${l==='All'?'':l}" class="${l==='All'?'active':''}">${l}</button>`).join('');

    const preferred=['General Yoruba','Ìṣẹ̀ṣe & Ifá','Culture & Society','Names & Places','Slang & Colloquial'];
    const present=[...new Set(rowsAll.map(x=>x.category||'General Yoruba'))];
    const cats=['All',...preferred.filter(x=>present.includes(x)),...present.filter(x=>!preferred.includes(x))];
    if(categoryRoot) categoryRoot.innerHTML=cats.map((c,i)=>`<button class="dictionary-category-btn ${i===0?'active':''}" type="button" data-category="${esc(c)}">${esc(c)}</button>`).join('');

    const urlQ=new URLSearchParams(location.search).get('q'); if(q&&urlQ) q.value=urlQ;

    const cleanPos=p=>{
      const map={n:'noun',v:'verb',adj:'adjective',adv:'adverb',pron:'pronoun',num:'number',excl:'exclamation',name:'name'};
      return map[p]||p||'';
    };

    const draw=()=>{
      const query=strip((q?.value||'').trim());
      const rows=rowsAll.filter(x=>{
        const termNorm=strip(x.term);
        const letterOk=!letter||termNorm.startsWith(letter.toLowerCase());
        const catOk=category==='All'||(x.category||'General Yoruba')===category;
        const hay=strip([x.term,x.meaning,x.context,x.category,x.partOfSpeech,...(x.related||[]),...(x.aliases||[])].join(' '));
        return letterOk&&catOk&&(!query||hay.includes(query));
      });

      if(status){
        if(query) status.textContent='Search results';
        else if(category!=='All') status.textContent=category;
        else if(letter) status.textContent='Words beginning with '+letter;
        else status.textContent='Browse all words';
      }

      const shown=rows.slice(0,visible);
      root.innerHTML=shown.length?shown.map(x=>`<article class="dictionary-entry dictionary-row">
        <div class="dictionary-word-column">
          <h3><a class="dictionary-word-link" href="/word/${esc(x.slug||'')}">${esc(x.term)}</a></h3>
          ${x.partOfSpeech?`<span class="dictionary-pos">${esc(cleanPos(x.partOfSpeech))}</span>`:''}
          <span class="dictionary-category-label">${esc(x.category||'General Yoruba')}</span>
        </div>
        <div class="dictionary-definition-column">
          <p class="meaning">${esc(x.meaning)}</p>
          ${x.context?`<p class="dictionary-context">${esc(x.context)}</p>`:''}
          ${x.aliases?.length?`<p class="dictionary-variants"><strong>Variants:</strong> ${x.aliases.map(esc).join(' · ')}</p>`:''}
          ${x.related?.length?`<div class="related dictionary-related">${x.related.map(r=>`<button type="button" data-related="${esc(r)}">${esc(r)}</button>`).join('')}</div>`:''}
        </div>
      </article>`).join(''):`<div class="empty-state dictionary-empty"><strong>No matching word found.</strong><span>Try a plain spelling without tone marks or search an English meaning.</span></div>`;

      if(more){
        more.hidden=shown.length>=rows.length;
        more.textContent='Load more words';
      }
    };

    q?.addEventListener('input',()=>{visible=60;draw()});
    alphabet?.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      letter=b.dataset.letter||'';
      visible=60;
      $$('button',alphabet).forEach(x=>x.classList.toggle('active',x===b));
      draw();
      root.scrollIntoView({behavior:'smooth',block:'start'});
    });
    categoryRoot?.addEventListener('click',e=>{
      const b=e.target.closest('[data-category]');if(!b)return;
      category=b.dataset.category||'All';
      visible=60;
      $$('[data-category]',categoryRoot).forEach(x=>x.classList.toggle('active',x===b));
      draw();
    });
    root.addEventListener('click',e=>{
      const b=e.target.closest('[data-related]');if(!b||!q)return;
      q.value=b.dataset.related||'';
      letter=''; category='All'; visible=60;
      $$('button',alphabet).forEach((x,i)=>x.classList.toggle('active',i===0));
      $$('[data-category]',categoryRoot).forEach((x,i)=>x.classList.toggle('active',i===0));
      draw();
      q.focus();
      scrollTo({top:q.getBoundingClientRect().top+scrollY-100,behavior:'smooth'});
    });
    randomBtn?.addEventListener('click',()=>{
      if(!rowsAll.length||!q)return;
      const x=rowsAll[Math.floor(Math.random()*rowsAll.length)];
      q.value=x.term;
      letter=''; category='All'; visible=60;
      draw();
      q.focus();
    });
    more?.addEventListener('click',()=>{visible+=60;draw()});
    draw();
  }

  function renderStore(){
    const root=$('#store-grid'); if(!root)return;

    const presentation={
      'Infection Crusher':{
        eyebrow:'BOTANICAL FORMULA',
        tagline:'Traditional botanical blend',
        points:['Botanical blend','Traditional formula']
      },
      'Gorilla Max':{
        eyebrow:'MEN’S HERBAL FORMULA',
        tagline:'Traditional herbal blend for men',
        points:['Herbal blend','Men’s formula']
      },
      'IP Pile Elixir Combo (Agbo + Agunmu)':{
        eyebrow:'HERBAL COMBO',
        tagline:'Traditional herbal combo',
        points:['Herbal blend','Combo pack']
      }
    };

    const cats=['All',...new Set(DATA.products.map(p=>p.cat))];
    const holder=$('#store-filters');
    if(holder) holder.innerHTML=cats.map((c,i)=>'<button class="chip '+(i===0?'active':'')+'" type="button" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('');
    let cat='All';
    let autoTimer=0;
    let resumeTimer=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stopAuto=function(){
      if(autoTimer){clearInterval(autoTimer);autoTimer=0;}
      if(resumeTimer){clearTimeout(resumeTimer);resumeTimer=0;}
    };

    const startAuto=function(){
      stopAuto();
      if(reduced || innerWidth>640) return;
      const cards=$$('.store-clear-card',root);
      if(cards.length<2) return;
      let index=0;
      autoTimer=setInterval(function(){
        index=(index+1)%cards.length;
        const card=cards[index];
        const left=card.offsetLeft-((root.clientWidth-card.offsetWidth)/2);
        root.scrollTo({left:Math.max(0,left),behavior:'smooth'});
      },4400);
    };

    const pauseThenResume=function(){
      stopAuto();
      if(reduced || innerWidth>640) return;
      resumeTimer=setTimeout(startAuto,6500);
    };

    const draw=()=>{
      stopAuto();
      const rows=DATA.products.filter(p=>cat==='All'||p.cat===cat);
      root.innerHTML=rows.map((p,i)=>{
        const meta=presentation[p.name]||{
          eyebrow:'IP HERBS ELIXIR',
          tagline:p.cat||'Traditional herbal product',
          points:['Herbal blend','Traditional formula']
        };

        return '<article class="clear-product-card store-clear-card clear-tone-'+((i%3)+1)+'">'+
          '<a class="clear-product-media" href="'+esc(p.orderUrl||'#')+'" target="_blank" rel="noopener" aria-label="Order '+esc(p.name)+' on WhatsApp">'+
            '<span class="clear-media-brand">IP HERBS <b>ELIXIR</b></span>'+
            '<img src="'+p.image+'" alt="'+esc(p.name)+' product" loading="lazy">'+
          '</a>'+
          '<div class="clear-product-content">'+
            '<span class="clear-kicker">'+esc(meta.eyebrow)+'</span>'+
            '<h3>'+esc(p.name)+'</h3>'+
            '<p>'+esc(meta.tagline)+'</p>'+
            '<div class="clear-product-points">'+meta.points.map(function(point){return '<span><i>✓</i>'+esc(point)+'</span>';}).join('')+'</div>'+
            '<div class="clear-product-footer">'+
              '<strong>'+esc(p.price)+'</strong>'+
              '<a href="'+esc(p.orderUrl||'#')+'" target="_blank" rel="noopener">ORDER NOW <b>→</b></a>'+
            '</div>'+
          '</div>'+
        '</article>';
      }).join('');

      ['touchstart','pointerdown','wheel'].forEach(function(evt){
        root.addEventListener(evt,pauseThenResume,{passive:true});
      });
      startAuto();
    };

    holder?.addEventListener('click',e=>{
      const b=e.target.closest('.chip');if(!b)return;
      cat=b.dataset.cat;$$('.chip',holder).forEach(x=>x.classList.toggle('active',x===b));draw();
    });

    addEventListener('resize',startAuto,{passive:true});
    document.addEventListener('visibilitychange',function(){
      if(document.hidden) stopAuto(); else startAuto();
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

/* Social platform SVG icons — 2026-10-08 */
(()=>{
  const icons={
    whatsapp:'<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.1 4.2a11.5 11.5 0 0 0-9.9 17.4L4.5 27.8l6.4-1.7a11.5 11.5 0 1 0 5.2-21.9Zm0 20.9c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.8 1 1-3.7-.2-.4a9.4 9.4 0 1 1 8.7 4.8Zm5.2-7c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-4-3.4-.3-.5.3-.5.8-1.7.1-.2 0-.4 0-.6l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4Z"/></svg>',
    youtube:'<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M29.2 9.2a4 4 0 0 0-2.8-2.8C23.9 5.7 16 5.7 16 5.7s-7.9 0-10.4.7a4 4 0 0 0-2.8 2.8A41.8 41.8 0 0 0 2.1 16a41.8 41.8 0 0 0 .7 6.8 4 4 0 0 0 2.8 2.8c2.5.7 10.4.7 10.4.7s7.9 0 10.4-.7a4 4 0 0 0 2.8-2.8 41.8 41.8 0 0 0 .7-6.8 41.8 41.8 0 0 0-.7-6.8ZM13.2 20.4v-8.8l7.3 4.4-7.3 4.4Z"/></svg>',
    tiktok:'<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M21.3 4c.5 3.2 2.4 5.1 5.7 5.3v4.2c-1.9.1-3.6-.4-5.6-1.5v7.9c0 10-10.9 13.1-15.3 6-2.8-4.6-1.1-12.8 7.9-13.1v4.4c-.6.1-1.3.2-1.9.4-1.8.6-2.8 1.8-2.5 3.9.6 4 7.9 5.2 7.3-2.6V4h4.4Z"/></svg>'
  };
  const platformFor=a=>{
    const s=((a.getAttribute("aria-label")||"")+" "+(a.href||"")).toLowerCase();
    if(s.includes("whatsapp")||s.includes("wa.me")) return "whatsapp";
    if(s.includes("youtube")||s.includes("youtu")) return "youtube";
    if(s.includes("tiktok")) return "tiktok";
    return "";
  };
  document.querySelectorAll(".social-dock a,.footer-socials a").forEach(a=>{
    const p=platformFor(a);
    if(!p||!icons[p]) return;
    let mark=a.querySelector(".social-mark, span");
    if(!mark){
      mark=document.createElement("span");
      a.prepend(mark);
    }
    mark.classList.add("social-platform-icon");
    mark.innerHTML=icons[p];
  });
})();

(() => {
  document.documentElement.classList.add('js');
  document.body.classList.add('loading');

  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // Loader
  const finishLoading = () => {
    $('.site-loader')?.classList.add('done');
    document.body.classList.remove('loading');
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(finishLoading, 300));
  else setTimeout(finishLoading, 300);
  setTimeout(finishLoading, 1600); // failsafe if an external font or asset is slow

  // Header + progress
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 18);
    if(progress){
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${h ? (scrollY / h) * 100 : 0}%`;
    }
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Global responsive navigation
  const menuBtn = $('.menu-btn'), nav = $('.nav-links'), siteHeader = $('.site-header');
  const setNavOpen = open => {
    if(!menuBtn || !nav) return;
    nav.classList.toggle('open', !!open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('site-nav-open', !!open);
  };
  menuBtn?.addEventListener('click', () => setNavOpen(!nav?.classList.contains('open')));
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>setNavOpen(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){setNavOpen(false);menuBtn?.focus();}});
  addEventListener('resize',()=>{if(innerWidth>1120)setNavOpen(false);},{passive:true});
  document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&siteHeader&&!siteHeader.contains(e.target))setNavOpen(false);});

  // Reveal observer
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in-view'); revealObserver.unobserve(e.target); } });
  }, {threshold:.13});
  $$('.reveal').forEach(el=>revealObserver.observe(el));

  // Counter animation
  const counters = $$('[data-count]');
  const counterObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el=e.target, target=+el.dataset.count, suffix=el.dataset.suffix||'';
    const start=performance.now(), duration=1200;
    const tick = now => {
      const p=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-p,3);
      el.textContent=Math.floor(target*eased)+suffix;
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick); counterObserver.unobserve(e.target);
  }),{threshold:.5});
  counters.forEach(c=>counterObserver.observe(c));

  // Cursor
  const dot=$('.cursor-dot'), ring=$('.cursor-ring');
  if(dot && ring && matchMedia('(hover:hover) and (pointer:fine)').matches){
    let mx=0,my=0,rx=0,ry=0;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
    const follow=()=>{rx+=(mx-rx)*.24;ry+=(my-ry)*.24;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(follow)};follow();
    $$('a,button,.entry-card,.category-card').forEach(el=>{
      el.addEventListener('mouseenter',()=>ring.classList.add('hover'));
      el.addEventListener('mouseleave',()=>ring.classList.remove('hover'));
    });
  }

  // Subtle tilt cards
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.tilt-card').forEach(card=>{
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${y*-4}deg) rotateY(${x*5}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave',()=>card.style.transform='');
    });
  }

  // Magnetic buttons
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.magnetic').forEach(btn=>{
      btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;btn.style.transform=`translate(${x*.12}px,${y*.12}px)`});
      btn.addEventListener('mouseleave',()=>btn.style.transform='');
    });
  }

  // Archive interactive panel
  const archiveData = {
    protection:{index:'01',kicker:'Idaabobo',title:'Protection Archive',text:'A structured area for documenting named protective workings, variant spellings, source notes and cultural context without losing the original Yoruba terminology.',meta:['Protection','Archive-ready','Source fields'],link:'catalogue.html'},
    victory:{index:'02',kicker:'Isegun',title:'Victory & Overcoming',text:'Organise preparations and terms associated with overcoming opposition, difficult circumstances and personal obstacles into a searchable study collection.',meta:['Victory','Terminology','Cross-references'],link:'catalogue.html'},
    ori:{index:'03',kicker:'Ori • Ayanmo • Ipin',title:'Destiny Knowledge',text:'A deeper knowledge path for concepts of Ori, destiny, choice, character, alignment and the relationship between personal responsibility and spiritual thought.',meta:['Knowledge','Ori','Long-form articles'],link:'knowledge.html#ori'},
    herbs:{index:'04',kicker:'Ewe',title:'Herbal Reference',text:'Keep Yoruba plant names, common names, botanical identifications, plant parts and certainty levels in separate fields for cleaner documentation.',meta:['Plants','Botany','Reference'],link:'herbs.html'}
  };
  const archivePanel=$('#archiveContent');
  $$('.archive-tab').forEach(tab=>tab.addEventListener('click',()=>{
    $$('.archive-tab').forEach(t=>t.classList.remove('active')); tab.classList.add('active');
    const d=archiveData[tab.dataset.archive];
    if(archivePanel && d){
      archivePanel.innerHTML=`<div class="archive-index">${d.index}</div><div class="kicker">${d.kicker}</div><h3>${d.title}</h3><p>${d.text}</p><div class="archive-meta">${d.meta.map(x=>`<span>${x}</span>`).join('')}</div><div class="archive-actions"><a class="btn btn-primary" href="${d.link}">Open collection <span class="btn-arrow">→</span></a></div>`;
      archivePanel.style.animation='none'; archivePanel.offsetHeight; archivePanel.style.animation='panelIn .42s var(--ease)';
    }
  }));

  // Catalogue filtering + modal
  const entryCards=$$('.entry-card');
  const catSearch=$('#catalogueSearch');
  let activeFilter='all';
  const updateCatalogue=()=>{
    const q=(catSearch?.value||'').trim().toLowerCase(); let shown=0;
    entryCards.forEach(card=>{
      const matchesFilter=activeFilter==='all'||card.dataset.category===activeFilter;
      const matchesQuery=!q||card.innerText.toLowerCase().includes(q);
      const visible=matchesFilter&&matchesQuery;
      card.style.display=visible?'block':'none'; if(visible) shown++;
    });
    const count=$('#resultCount'); if(count) count.textContent=`${shown} ${shown===1?'entry':'entries'}`;
    $('.empty-state')?.style.setProperty('display',shown?'none':'block');
  };
  $$('.filter-btn[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.filter-btn[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.filter;updateCatalogue();
  }));
  catSearch?.addEventListener('input',updateCatalogue);
  $$('.view-toggle button').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.view-toggle button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    $('#entryGrid')?.classList.toggle('list-view',btn.dataset.view==='list');
  }));
  const modal=$('#detailModal');
  const modalBody=$('#modalBody');
  entryCards.forEach(card=>card.addEventListener('click',()=>{
    if(!modal||!modalBody) return;
    modalBody.innerHTML=`<div class="kicker">${card.dataset.label||'Archive entry'}</div><h2>${card.dataset.title}</h2><div class="translation">${card.dataset.translation}</div><div class="modal-meta"><span>${card.dataset.category}</span><span>${card.dataset.type||'Reference'}</span><span>Documentation entry</span></div><p>${card.dataset.description}</p><div class="modal-note"><strong>Archive note:</strong> This public demo keeps the entry descriptive. Add your own verified source history, notes and publication-safe details before going live.</div>`;
    modal.classList.add('open'); document.body.style.overflow='hidden';
  }));
  const closeModal=()=>{modal?.classList.remove('open');document.body.style.overflow=''};
  $('.modal-close')?.addEventListener('click',closeModal);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
  updateCatalogue();

  // Knowledge accordion + TOC active state
  $$('.accordion-btn').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.accordion-item')?.classList.toggle('open')));
  const articleSections=$$('.knowledge-article[id]'), tocLinks=$$('.toc-link');
  if(articleSections.length){
    const tocObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){tocLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));}
    }),{rootMargin:'-25% 0px -60% 0px'});
    articleSections.forEach(s=>tocObserver.observe(s));
  }

  // Herbs search + alphabet
  const herbCards=$$('.herb-card'), herbSearch=$('#herbSearch'); let herbLetter='all';
  const filterHerbs=()=>{
    const q=(herbSearch?.value||'').toLowerCase();
    herbCards.forEach(card=>{
      const name=(card.dataset.name||'').toLowerCase();
      const okL=herbLetter==='all'||name.startsWith(herbLetter.toLowerCase());
      const okQ=!q||card.innerText.toLowerCase().includes(q);
      card.style.display=okL&&okQ?'block':'none';
    });
  };
  herbSearch?.addEventListener('input',filterHerbs);
  $$('.alphabet button').forEach(b=>b.addEventListener('click',()=>{$$('.alphabet button').forEach(x=>x.classList.remove('active'));b.classList.add('active');herbLetter=b.dataset.letter;filterHerbs()}));

  // Social/contact buttons at the end of every Leaves Documentary post
  if($$('.leaf-entry').length){
    if(!$('#leaf-social-style')){
      const style=document.createElement('style');
      style.id='leaf-social-style';
      style.textContent=`.leaf-post-social{margin-top:20px;padding-top:16px;border-top:1px solid rgba(111,66,31,.14)}.leaf-post-social-label{display:block;margin-bottom:9px;font-size:.66rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#7b6248}.leaf-post-social-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.leaf-post-social a{display:flex;align-items:center;justify-content:center;min-height:38px;padding:7px 8px;border-radius:10px;color:#fff!important;text-decoration:none!important;font-size:.68rem;font-weight:900}.leaf-social-tiktok{background:#090909}.leaf-social-facebook{background:#1877f2}.leaf-social-youtube{background:#e00028}.leaf-social-whatsapp{background:#159447}@media(max-width:560px){.leaf-post-social-links{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
      document.head.appendChild(style);
    }
    $$('.leaf-entry').forEach(card=>{
      const content=$('.leaf-content',card);
      if(!content || $('.leaf-post-social',content)) return;
      const leaf=card.dataset.name || $('h3',card)?.textContent?.trim() || 'this leaf';
      const msg=encodeURIComponent(`Hello Isese Ponbele, I am asking about the ${leaf} leaf documentary.`);
      const block=document.createElement('div');
      block.className='leaf-post-social';
      block.innerHTML=`<span class="leaf-post-social-label">Follow & contact Isese Ponbele</span><div class="leaf-post-social-links"><a class="leaf-social-tiktok" href="https://www.tiktok.com/@iseseponbele" target="_blank" rel="noopener noreferrer">TikTok</a><a class="leaf-social-facebook" href="https://www.facebook.com/iseseponbele" target="_blank" rel="noopener noreferrer">Facebook</a><a class="leaf-social-youtube" href="https://www.youtube.com/@iseseponbele" target="_blank" rel="noopener noreferrer">YouTube</a><a class="leaf-social-whatsapp" href="https://wa.me/2347047604452?text=${msg}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div>`;
      content.appendChild(block);
    });
  }

  // Multi-step consultation form
  const form=$('#consultationForm');
  if(form){
    const steps=$$('.form-step',form), bars=$$('.form-progress span',form); let current=0;
    const showStep=i=>{current=Math.max(0,Math.min(i,steps.length-1));steps.forEach((s,n)=>s.classList.toggle('active',n===current));bars.forEach((b,n)=>{b.classList.toggle('active',n===current);b.classList.toggle('done',n<current)});};
    $$('[data-next]',form).forEach(b=>b.addEventListener('click',()=>showStep(current+1)));
    $$('[data-prev]',form).forEach(b=>b.addEventListener('click',()=>showStep(current-1)));
    $$('.choice',form).forEach(c=>c.addEventListener('click',()=>{$$('.choice',form).forEach(x=>x.classList.remove('selected'));c.classList.add('selected');$('input',c).checked=true;}));
    form.addEventListener('submit',e=>{e.preventDefault();const status=$('.form-status',form);if(status){status.style.display='block';status.textContent='Your enquiry has been prepared. Connect this form to your email, WhatsApp or booking service before publishing.';}form.reset();showStep(0)});
    showStep(0);
  }

  // Iwure ti Oni — daily homepage blessing
  const isHome = /(^|\/)index\.html$/.test(location.pathname) || location.pathname === '/' || location.pathname.endsWith('/isese-ponbele/');
  if(isHome && !document.querySelector('.iwure-overlay')){
    const iwure = [
      {yo:'Kí Orí wa gbé wa. Kí ọ̀nà wa là. Kí ire gbogbo máa bá wa rìn lónìí. Àṣẹ.',en:'May our Ori uphold us. May our paths open. May every form of goodness walk with us today.'},
      {yo:'Kí a jí sí ire, kí a rìn sí ire, kí a sì padà sí ilé pẹ̀lú ire. Àṣẹ.',en:'May we wake into goodness, walk in goodness, and return home carrying goodness.'},
      {yo:'Kí ọwọ́ wa má di òfo. Kí iṣẹ́ wa ní èso. Kí àánú àti ojú rere máa tẹ̀lé wa. Àṣẹ.',en:'May our hands never be empty. May our work bear fruit. May mercy and favourable regard follow us.'},
      {yo:'Kí àlàáfíà gbé inú ilé wa. Kí ibi jìnà sí wa. Kí ayọ̀ àti ìlera máa kún ọjọ́ wa. Àṣẹ.',en:'May peace live in our homes. May harm remain far from us. May joy and wellbeing fill our day.'},
      {yo:'Kí Orí rere darí wa sí ibi tí ire wa wà. Kí a má ṣe àṣìṣe ọ̀nà. Kí a rí òpin rere. Àṣẹ.',en:'May good Ori guide us toward where our blessings are. May we not lose our way. May our matters end well.'},
      {yo:'Kí ọ̀nà owó, ọ̀nà iṣẹ́ àti ọ̀nà àánú ṣí fún wa. Kí ohun rere tí a ń wá máa wá wa. Àṣẹ.',en:'May the roads of prosperity, work and mercy open for us. May the good things we seek also seek us.'},
      {yo:'Kí agbára wa má dínkù. Kí ọgbọ́n wa má ṣù. Kí a ní sùúrù, ìgboyà àti àṣẹ láti parí ohun rere. Àṣẹ.',en:'May our strength not diminish. May wisdom not fail us. May we have patience, courage and authority to complete good things.'}
    ];
    const now=new Date();
    const startOfYear=new Date(now.getFullYear(),0,0);
    const day=Math.floor((now-startOfYear)/86400000);
    const b=iwure[day % iwure.length];
    const overlay=document.createElement('div');
    overlay.className='iwure-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','iwureTitle');
    overlay.setAttribute('aria-describedby','iwureText');
    overlay.innerHTML=`<div class="iwure-card" tabindex="-1">
      <button class="iwure-x" type="button" aria-label="Close daily blessing">×</button>
      <div class="iwure-content">
        <div class="iwure-emblem" aria-hidden="true"></div>
        <div class="iwure-kicker">Isese Ponbele • Iwure of the day</div>
        <h2 class="iwure-title" id="iwureTitle">Ìwúre Tí Òní</h2>
        <div class="iwure-rule" aria-hidden="true"><span></span></div>
        <p class="iwure-yoruba" id="iwureText">${b.yo}</p>
        <p class="iwure-english">${b.en}</p>
        <div class="iwure-date">${now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        <button class="iwure-close" type="button">Àṣẹ • Enter the house</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    const card=overlay.querySelector('.iwure-card');
    const previousFocus=document.activeElement;
    const closeIwure=()=>{
      overlay.classList.remove('open');
      document.body.classList.remove('iwure-open');
      setTimeout(()=>{
        overlay.remove();
        if(previousFocus && typeof previousFocus.focus==='function') previousFocus.focus({preventScroll:true});
      },300);
    };
    overlay.querySelector('.iwure-x')?.addEventListener('click',closeIwure);
    overlay.querySelector('.iwure-close')?.addEventListener('click',closeIwure);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeIwure()});
    addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.isConnected)closeIwure()});
    const openIwure=()=>{
      if(!overlay.isConnected) return;
      document.body.classList.add('iwure-open');
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        overlay.classList.add('open');
        setTimeout(()=>card?.focus({preventScroll:true}),220);
      }));
    };
    if(document.body.classList.contains('loading')){
      setTimeout(openIwure,700);
    }else{
      setTimeout(openIwure,450);
    }
  }

  // Back top
  $('.back-top')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
})();
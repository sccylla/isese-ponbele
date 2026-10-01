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

  // Mobile nav
  const menuBtn = $('.menu-btn'), nav = $('.nav-links');
  menuBtn?.addEventListener('click', () => {
    nav?.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', nav?.classList.contains('open') ? 'true' : 'false');
  });
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));

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
    requestAnimationFrame(tick); counterObserver.unobserve(el);
  }),{threshold:.5});
  counters.forEach(c=>counterObserver.observe(c));

  // Cursor
  const dot=$('.cursor-dot'), ring=$('.cursor-ring');
  if(dot && ring && matchMedia('(hover:hover) and (pointer:fine)').matches){
    let mx=0,my=0,rx=0,ry=0;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
    const follow=()=>{rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(follow)};follow();
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
  if(isHome){
    const iwure = [
      {yo:'Ki Ori wa gbe wa. Ki ona wa la. Ki ire gbogbo maa ba wa rin loni. Ase.',en:'May our Ori uphold us. May our paths open. May every form of goodness walk with us today.'},
      {yo:'Ki a ji si ire, ki a rin si ire, ki a si pada si ile pelu ire. Ase.',en:'May we wake into goodness, walk in goodness, and return home carrying goodness.'},
      {yo:'Ki owo wa ma di ofo. Ki ise wa ni eso. Ki aanu ati oju rere maa tele wa. Ase.',en:'May our hands never be empty. May our work bear fruit. May mercy and favourable regard follow us.'},
      {yo:'Ki alaafia gbe inu ile wa. Ki ibi jina si wa. Ki ayo ati ilera maa kun ojo wa. Ase.',en:'May peace live in our homes. May harm remain far from us. May joy and wellbeing fill our day.'},
      {yo:'Ki Ori rere dari wa si ibi ti ire wa wa. Ki a ma se asise ona. Ki a ri opin rere. Ase.',en:'May good Ori guide us toward where our blessings are. May we not lose our way. May our matters end well.'},
      {yo:'Ki ona owo, ona ise ati ona aanu si fun wa. Ki ohun rere ti a n wa maa wa wa. Ase.',en:'May the roads of prosperity, work and mercy open for us. May the good things we seek also seek us.'},
      {yo:'Ki agbara wa ma dinku. Ki ogbon wa ma su. Ki a ni suuru, igboya ati ase lati pari ohun rere. Ase.',en:'May our strength not diminish. May wisdom not fail us. May we have patience, courage and authority to complete good things.'}
    ];
    const now=new Date();
    const start=new Date(now.getFullYear(),0,0);
    const day=Math.floor((now-start)/86400000);
    const b=iwure[day % iwure.length];
    const overlay=document.createElement('div');
    overlay.className='iwure-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Iwure ti Oni');
    overlay.innerHTML=`<div class="iwure-card"><button class="iwure-x" aria-label="Close daily blessing">×</button><div class="iwure-content"><div class="iwure-cowries" aria-hidden="true"><span style="--r:-18deg"></span><span style="--r:11deg"></span><span style="--r:-7deg"></span><span style="--r:19deg"></span><span style="--r:-13deg"></span></div><div class="iwure-kicker">Isese Ponbele • Daily blessing</div><h2 class="iwure-title">Iwure ti Oni</h2><p class="iwure-yoruba">${b.yo}</p><p class="iwure-english">${b.en}</p><div class="iwure-date">${now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><button class="iwure-close">Ase • Enter the house</button></div></div>`;
    document.body.appendChild(overlay);
    const closeIwure=()=>{overlay.classList.remove('open');setTimeout(()=>overlay.remove(),450)};
    overlay.querySelector('.iwure-x')?.addEventListener('click',closeIwure);
    overlay.querySelector('.iwure-close')?.addEventListener('click',closeIwure);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeIwure()});
    addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.isConnected)closeIwure()});
    setTimeout(()=>overlay.classList.add('open'),1150);
  }

  // Back top
  $('.back-top')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
})();

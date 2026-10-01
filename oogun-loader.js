(async () => {
  const grid = document.getElementById('entryGrid');
  const filterBox = document.getElementById('oogunFilters');
  const count = document.getElementById('resultCount');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const social = title => {
    const msg = encodeURIComponent(`Hello Isese Ponbele, I am asking about ${title}.`);
    return `<div class="post-social" aria-label="Isese Ponbele social media">
      <span class="post-social-label">Connect with Isese Ponbele</span>
      <a class="social-btn social-tiktok" href="https://www.tiktok.com/@iseseponbele" target="_blank" rel="noopener noreferrer">TikTok</a>
      <a class="social-btn social-facebook" href="https://www.facebook.com/iseseponbele" target="_blank" rel="noopener noreferrer">Facebook</a>
      <a class="social-btn social-youtube" href="https://www.youtube.com/@iseseponbele" target="_blank" rel="noopener noreferrer">YouTube</a>
      <a class="social-btn social-whatsapp" href="https://wa.me/2347047604452?text=${msg}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    </div>`;
  };

  const list = (title, items, ordered=false) => {
    if(!items || !items.length) return '';
    const tag = ordered ? 'ol' : 'ul';
    return `<div class="formula-block"><h4>${esc(title)}</h4><${tag}>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</${tag}></div>`;
  };

  const loadArchive = async () => {
    window.OOGUN_GZ = '';
    for(let i=1;i<=12;i++) {
      await new Promise((resolve,reject)=>{
        const s=document.createElement('script');
        s.src=`oogun-data-${i}.js`;
        s.onload=resolve;
        s.onerror=()=>reject(new Error(`Could not load archive data part ${i}.`));
        document.head.appendChild(s);
      });
    }
  };

  try {
    if(!('DecompressionStream' in window)) throw new Error('This browser does not support compressed archive data.');
    await loadArchive();
    const raw = atob(window.OOGUN_GZ || '');
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    const entries = JSON.parse(text).sort((a,b)=>a.q-b.q);
    window.OOGUN_ENTRIES = entries;
    window.OOGUN_GZ = '';

    document.querySelectorAll('.hero-badge').forEach(b=>{
      if(/220 entries imported/i.test(b.textContent)) b.textContent='1,220 entries imported';
    });
    const archiveNote=document.querySelector('.oogun-source-note');
    if(archiveNote) archiveNote.innerHTML='<strong>Archive note:</strong> The archive now combines the original 220-record Oogun collection with 1,000 source-derived entries from <em>AKOJOPO ASIRI YORUBA</em>. PDF page references are retained for the new additions.';

    const cats = [...new Set(entries.map(e=>e.c))].sort((a,b)=>a.localeCompare(b));
    const counts = Object.fromEntries(cats.map(c=>[c,entries.filter(e=>e.c===c).length]));
    if(filterBox) filterBox.innerHTML = [
      `<button class="filter-btn active" data-filter="all"><span>All formulas</span><span>${entries.length}</span></button>`,
      ...cats.map(c=>`<button class="filter-btn" data-filter="${slug(c)}"><span>${esc(c)}</span><span>${counts[c]}</span></button>`)
    ].join('');

    if(grid) grid.innerHTML = entries.map(e=>{
      const restricted = e.r && e.r.length;
      const short = e.m || 'Traditional Oogun archive entry';
      return `<article class="entry-card reveal" data-category="${slug(e.c)}" data-entry-id="${e.q}" data-label="${esc(e.c)}" data-title="${esc(e.t)}" data-translation="${esc(short)}" data-type="${esc(e.c)}" data-description="${esc(short)}">
        <div class="entry-top"><span class="entry-tag">${esc(e.c)}</span><span class="entry-id">${esc(e.s)}</span></div>
        <h3>${esc(e.t)}</h3>
        <div class="translation">${esc(short)}</div>
        <p>${restricted ? 'Independent archive entry' : 'Open the formula to view materials, preparation and usage'}</p>
        ${social(e.t)}
        <span class="entry-open">↗</span>
      </article>`;
    }).join('');
    if(count) count.textContent = `${entries.length} entries`;

    await new Promise((resolve,reject)=>{
      const s=document.createElement('script'); s.src='script.js'; s.onload=resolve; s.onerror=reject; document.body.appendChild(s);
    });

    document.querySelectorAll('.post-social a').forEach(a=>a.addEventListener('click',e=>e.stopPropagation()));

    const modal=document.getElementById('detailModal'), body=document.getElementById('modalBody');
    document.querySelectorAll('.entry-card[data-entry-id]').forEach(card=>{
      card.addEventListener('click',()=>{
        const e=entries.find(x=>x.q===Number(card.dataset.entryId));
        if(!e || !modal || !body) return;
        const restricted = e.r && e.r.length;
        const sourceName = e.src || 'OOGUN BABA OGUN YORUBA TRADITIONAL CHARMS';
        const sourcePage = e.pg ? ` • PDF page ${e.pg}` : '';
        const details = restricted ? '' : `${list('Materials needed',e.a)}${list('Preparation',e.p,true)}${list('Usage',e.u,true)}${list('Incantation / Ofo',e.i)}${list('Translation',e.x)}${list('Source notes',e.o)}`;
        body.innerHTML = `<div class="kicker">Source entry ${esc(e.s)} • ${esc(e.c)}</div>
          <h2>${esc(e.t)}</h2>
          <div class="translation">${esc(e.m||'Traditional Oogun archive entry')}</div>
          <div class="modal-meta"><span>${esc(e.c)}</span><span>Independent formula</span></div>
          ${details}
          <div class="source-line">Source: <em>${esc(sourceName)}</em>${esc(sourcePage)} — wording organized from the supplied source.</div>
          ${social(e.t)}`;
        modal.classList.add('open');
        document.body.style.overflow='hidden';
        body.querySelectorAll('.post-social a').forEach(a=>a.addEventListener('click',ev=>ev.stopPropagation()));
      });
    });
  } catch(err) {
    console.error(err);
    if(grid) grid.innerHTML='<div class="empty-state" style="display:block">The Oogun archive could not be loaded in this browser.</div>';
    if(count) count.textContent='Archive unavailable';
    const s=document.createElement('script'); s.src='script.js'; document.body.appendChild(s);
  }
})();
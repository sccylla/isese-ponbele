(async () => {
  const grid = document.getElementById('entryGrid');
  const filterBox = document.getElementById('oogunFilters');
  const count = document.getElementById('resultCount');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => String(s ?? '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

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

  const decompress = async b64 => {
    if(!b64) return [];
    if(!('DecompressionStream' in window)) throw new Error('Compressed archive data is not supported by this browser.');
    const raw = atob(b64);
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  };

  const render = entries => {
    entries = [...entries].sort((a,b)=>(Number(a.q)||0)-(Number(b.q)||0));
    window.OOGUN_ENTRIES = entries;

    document.querySelectorAll('.hero-badge').forEach(b=>{
      if(/entries imported/i.test(b.textContent)) b.textContent=`${entries.length.toLocaleString()} entries imported`;
    });
    const archiveNote=document.querySelector('.oogun-source-note');
    if(archiveNote) archiveNote.innerHTML = entries.length > 220
      ? '<strong>Archive note:</strong> This archive combines the original Oogun collection with 1,000 source-derived entries from <em>AKOJOPO ASIRI YORUBA</em>. New additions retain their PDF page references.'
      : '<strong>Archive note:</strong> The original Oogun archive is available. The expanded PDF archive did not finish loading.';

    const cats = [...new Set(entries.map(e=>e.c || 'Other'))].sort((a,b)=>a.localeCompare(b));
    const counts = Object.fromEntries(cats.map(c=>[c,entries.filter(e=>(e.c||'Other')===c).length]));
    if(filterBox) filterBox.innerHTML = [
      `<button class="filter-btn active" data-filter="all"><span>All formulas</span><span>${entries.length}</span></button>`,
      ...cats.map(c=>`<button class="filter-btn" data-filter="${slug(c)}"><span>${esc(c)}</span><span>${counts[c]}</span></button>`)
    ].join('');

    if(grid) grid.innerHTML = entries.map(e=>{
      const restricted = e.r && e.r.length;
      const short = e.m || 'Traditional Oogun archive entry';
      return `<article class="entry-card reveal" data-category="${slug(e.c||'Other')}" data-entry-id="${esc(e.q)}" data-label="${esc(e.c||'Other')}" data-title="${esc(e.t)}" data-translation="${esc(short)}" data-type="${esc(e.c||'Other')}" data-description="${esc(short)}">
        <div class="entry-top"><span class="entry-tag">${esc(e.c||'Other')}</span><span class="entry-id">${esc(e.s||e.q)}</span></div>
        <h3>${esc(e.t||'Untitled entry')}</h3>
        <div class="translation">${esc(short)}</div>
        <p>${restricted ? 'Independent archive entry' : 'Open the formula to view materials, preparation and usage'}</p>
        ${social(e.t||'this entry')}
        <span class="entry-open">↗</span>
      </article>`;
    }).join('');
    if(count) count.textContent = `${entries.length.toLocaleString()} entries`;

    document.querySelectorAll('.post-social a').forEach(a=>a.addEventListener('click',e=>e.stopPropagation()));

    const modal=document.getElementById('detailModal'), body=document.getElementById('modalBody');
    document.querySelectorAll('.entry-card[data-entry-id]').forEach(card=>{
      card.addEventListener('click',()=>{
        const id = card.dataset.entryId;
        const e=entries.find(x=>String(x.q)===String(id));
        if(!e || !modal || !body) return;
        const restricted = e.r && e.r.length;
        const sourceName = e.src || 'OOGUN BABA OGUN YORUBA TRADITIONAL CHARMS';
        const sourcePage = e.pg ? ` • PDF page ${e.pg}` : '';
        const details = restricted ? '' : `${list('Materials needed',e.a)}${list('Preparation',e.p,true)}${list('Usage',e.u,true)}${list('Incantation / Ofo',e.i)}${list('Translation',e.x)}${list('Source notes',e.o)}`;
        body.innerHTML = `<div class="kicker">Source entry ${esc(e.s||e.q)} • ${esc(e.c||'Other')}</div>
          <h2>${esc(e.t||'Untitled entry')}</h2>
          <div class="translation">${esc(e.m||'Traditional Oogun archive entry')}</div>
          <div class="modal-meta"><span>${esc(e.c||'Other')}</span><span>Independent formula</span></div>
          ${details}
          <div class="source-line">Source: <em>${esc(sourceName)}</em>${esc(sourcePage)} — wording organized from the supplied source.</div>
          ${social(e.t||'this entry')}`;
        modal.classList.add('open');
        document.body.style.overflow='hidden';
        body.querySelectorAll('.post-social a').forEach(a=>a.addEventListener('click',ev=>ev.stopPropagation()));
      });
    });
  };

  try {
    let baseEntries = [];
    let expandedEntries = [];

    try {
      baseEntries = await decompress(window.OOGUN_BASE_GZ || window.OOGUN_GZ || '');
    } catch(baseErr) {
      console.error('Base archive error:', baseErr);
    }

    try {
      expandedEntries = await decompress(window.OOGUN_EXPANDED_GZ || '');
    } catch(expandedErr) {
      console.error('Expanded archive error:', expandedErr);
    }

    let entries = baseEntries;
    if(expandedEntries.length > baseEntries.length) {
      entries = expandedEntries;
    } else if(expandedEntries.length) {
      const merged = [...baseEntries, ...expandedEntries];
      const seen = new Set();
      entries = merged.filter(e => {
        const key = `${e.src||''}|${e.s||''}|${e.q||''}|${e.t||''}`;
        if(seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    if(!entries.length) throw new Error('No archive entries could be decoded.');
    render(entries);

    try {
      await new Promise((resolve,reject)=>{
        const s=document.createElement('script');
        s.src='script.js?v=20261001-3';
        s.onload=resolve;
        s.onerror=reject;
        document.body.appendChild(s);
      });
    } catch(scriptErr) {
      console.error('Archive interface helper error:', scriptErr);
    }
  } catch(err) {
    console.error(err);
    if(grid) grid.innerHTML='<div class="empty-state" style="display:block">The Oogun archive could not be loaded. Please refresh the page.</div>';
    if(count) count.textContent='Archive unavailable';
  }
})();
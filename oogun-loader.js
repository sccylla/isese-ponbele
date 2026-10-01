(async () => {
  const grid = document.getElementById('entryGrid');
  const filterBox = document.getElementById('oogunFilters');
  const count = document.getElementById('resultCount');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  try {
    if(!('DecompressionStream' in window)) throw new Error('This browser does not support compressed archive data.');
    const raw = atob(window.OOGUN_GZ || '');
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    const entries = JSON.parse(text).sort((a,b)=>a.q-b.q);
    window.OOGUN_ENTRIES = entries;
    window.OOGUN_GZ = '';

    const cats = [...new Set(entries.map(e=>e.c))].sort((a,b)=>a.localeCompare(b));
    const counts = Object.fromEntries(cats.map(c=>[c,entries.filter(e=>e.c===c).length]));
    if(filterBox) filterBox.innerHTML = [
      `<button class="filter-btn active" data-filter="all"><span>All formulas</span><span>${entries.length}</span></button>`,
      ...cats.map(c=>`<button class="filter-btn" data-filter="${slug(c)}"><span>${esc(c)}</span><span>${counts[c]}</span></button>`)
    ].join('');

    if(grid) grid.innerHTML = entries.map(e=>{
      const restricted=e.r&&e.r.length;
      const short=e.m||'Traditional Oogun archive entry';
      return `<div class="entry-card reveal" data-category="${slug(e.c)}" data-entry-id="${e.q}" data-label="${esc(e.c)}" data-title="${esc(e.t)}" data-translation="${esc(short)}" data-type="${esc(e.c)}" data-description="${esc(restricted?'Archival entry. Operational details are not republished because the source includes higher-risk instructions.':'Independent formula entry transcribed from the uploaded Oogun source document.')}">
        <div class="entry-top"><span class="entry-tag">${esc(e.c)}</span><span class="entry-id">${esc(e.s)}</span></div>
        <h3>${esc(e.t)}</h3><div class="translation">${esc(short)}</div>
        <p>${restricted?'Archive record • procedural details restricted':'Independent source formula • materials, preparation and usage available'}</p><span class="entry-open">↗</span>
      </div>`;
    }).join('');
    if(count) count.textContent=`${entries.length} entries`;

    await new Promise((resolve,reject)=>{
      const s=document.createElement('script'); s.src='script.js'; s.onload=resolve; s.onerror=reject; document.body.appendChild(s);
    });

    const modal=document.getElementById('detailModal'), body=document.getElementById('modalBody');
    const list=(title,items,ordered=false)=>{
      if(!items||!items.length) return '';
      const tag=ordered?'ol':'ul';
      return `<div class="formula-block"><h4>${esc(title)}</h4><${tag}>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</${tag}></div>`;
    };
    document.querySelectorAll('.entry-card[data-entry-id]').forEach(card=>{
      card.addEventListener('click',()=>{
        const e=entries.find(x=>x.q===Number(card.dataset.entryId)); if(!e||!modal||!body) return;
        const restricted=e.r&&e.r.length;
        body.innerHTML=`<div class="kicker">Source entry ${esc(e.s)} • ${esc(e.c)}</div><h2>${esc(e.t)}</h2><div class="translation">${esc(e.m||'Traditional Oogun archive entry')}</div><div class="modal-meta"><span>${esc(e.c)}</span><span>Independent formula</span>${restricted?'<span>Archival only</span>':'<span>Source transcription</span>'}</div>${restricted?`<div class="modal-note formula-restriction"><strong>Archive safety note:</strong> This source entry contains operational details involving ${esc(e.r.join(', '))}. The title, stated purpose and classification are preserved, but the materials, preparation and usage instructions are not republished here.</div>`:`${list('Materials needed',e.a)}${list('Preparation',e.p,true)}${list('Usage',e.u,true)}${list('Incantation / Ofo',e.i)}${list('Translation',e.x)}${list('Source notes',e.o)}`}<div class="modal-note"><strong>Source note:</strong> Transcribed from the user-supplied <em>OOGUN BABA OGUN YORUBA TRADITIONAL CHARMS</em> document. Wording is preserved as supplied; botanical identification, safety and claimed effects have not been independently verified.</div>`;
        modal.classList.add('open'); document.body.style.overflow='hidden';
      });
    });
  } catch(err) {
    console.error(err);
    if(grid) grid.innerHTML='<div class="empty-state" style="display:block">The Oogun archive could not be loaded in this browser.</div>';
    if(count) count.textContent='Archive unavailable';
    const s=document.createElement('script'); s.src='script.js'; document.body.appendChild(s);
  }
})();

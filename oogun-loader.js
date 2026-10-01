(async () => {
  const grid = document.getElementById('entryGrid');
  const filterBox = document.getElementById('oogunFilters');
  const count = document.getElementById('resultCount');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const social = (title) => {
    const msg = encodeURIComponent(`Hello Isese Ponbele, I am asking about ${title}.`);
    return `<div class="post-social" aria-label="Isese Ponbele social media">
      <span class="post-social-label">Connect / enquire</span>
      <a class="social-btn social-tiktok" href="https://www.tiktok.com/@iseseponbele" target="_blank" rel="noopener noreferrer" aria-label="Isese Ponbele on TikTok">TikTok</a>
      <a class="social-btn social-facebook" href="https://www.facebook.com/iseseponbele" target="_blank" rel="noopener noreferrer" aria-label="Isese Ponbele on Facebook">Facebook</a>
      <a class="social-btn social-youtube" href="https://www.youtube.com/iseseponbele" target="_blank" rel="noopener noreferrer" aria-label="Isese Ponbele on YouTube">YouTube</a>
      <a class="social-btn social-whatsapp" href="https://wa.me/2347047604452?text=${msg}" target="_blank" rel="noopener noreferrer" aria-label="Contact Isese Ponbele on WhatsApp">WhatsApp</a>
    </div>`;
  };
  const list = (title, items, ordered=false) => {
    if(!items || !items.length) return '';
    const tag = ordered ? 'ol' : 'ul';
    return `<div class="formula-block"><h4>${esc(title)}</h4><${tag}>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</${tag}></div>`;
  };

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

    if(grid) {
      grid.classList.add('oogun-full-grid');
      grid.innerHTML = entries.map(e=>{
        const restricted = e.r && e.r.length;
        const short = e.m || 'Traditional Oogun archive entry';
        const details = restricted
          ? `<div class="modal-note formula-restriction"><strong>Source entry retained:</strong> This formula remains visible by title, stated purpose and category. Its source contains operational directions involving ${esc(e.r.join(', '))}; those dangerous action steps are not published on the public page.</div>`
          : `${list('Materials needed',e.a)}${list('Preparation',e.p,true)}${list('Usage',e.u,true)}${list('Incantation / Ofo',e.i)}${list('Translation',e.x)}${list('Source notes',e.o)}`;
        return `<article class="entry-card oogun-post reveal" id="oogun-${esc(e.s)}" data-category="${slug(e.c)}" data-entry-id="${e.q}" data-label="${esc(e.c)}" data-title="${esc(e.t)}" data-translation="${esc(short)}" data-type="${esc(e.c)}" data-description="${esc(short)}">
          <div class="entry-top"><span class="entry-tag">${esc(e.c)}</span><span class="entry-id">${esc(e.s)}</span></div>
          <h3>${esc(e.t)}</h3>
          <div class="translation">${esc(short)}</div>
          ${details}
          <div class="source-line">Source: <em>OOGUN BABA OGUN YORUBA TRADITIONAL CHARMS</em> — wording preserved as supplied; claimed effects and botanical identifications are not independently verified.</div>
          ${social(e.t)}
        </article>`;
      }).join('');
    }
    if(count) count.textContent=`${entries.length} entries • full posts shown below`;

    await new Promise((resolve,reject)=>{
      const s=document.createElement('script'); s.src='script.js'; s.onload=resolve; s.onerror=reject; document.body.appendChild(s);
    });
  } catch(err) {
    console.error(err);
    if(grid) grid.innerHTML='<div class="empty-state" style="display:block">The Oogun archive could not be loaded in this browser.</div>';
    if(count) count.textContent='Archive unavailable';
    const s=document.createElement('script'); s.src='script.js'; document.body.appendChild(s);
  }
})();
(async () => {
  const grid = document.getElementById('entryGrid');
  const filterBox = document.getElementById('oogunFilters');
  const count = document.getElementById('resultCount');
  const search = document.getElementById('catalogueSearch');
  const modal = document.getElementById('detailModal');
  const modalBody = document.getElementById('modalBody');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => String(s ?? '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const finishLoading = () => {
    document.querySelector('.site-loader')?.classList.add('done');
    document.body.classList.remove('loading');
  };
  setTimeout(finishLoading, 120);
  setTimeout(finishLoading, 900);

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

  const closeModal = () => {
    modal?.classList.remove('open');
    document.body.style.overflow='';
  };
  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  menuBtn?.addEventListener('click', () => nav?.classList.toggle('open'));
  document.querySelector('.back-top')?.addEventListener('click', () => scrollTo({top:0,behavior:'smooth'}));

  try {
    const [baseEntries, extraEntries] = await Promise.all([
      decompress(window.OOGUN_BASE_GZ || ''),
      decompress(window.OOGUN_EXTRA_GZ || '')
    ]);

    if(!baseEntries.length) throw new Error('Original archive could not be decoded.');
    if(extraEntries.length !== 1000) throw new Error(`Expected 1,000 PDF entries, decoded ${extraEntries.length}.`);

    const entries = [...baseEntries, ...extraEntries];
    window.OOGUN_ENTRIES = entries;

    document.querySelectorAll('.hero-badge').forEach(b => {
      if(/entries imported/i.test(b.textContent)) b.textContent = `${entries.length.toLocaleString()} entries imported`;
    });
    const archiveNote = document.querySelector('.oogun-source-note');
    if(archiveNote) archiveNote.innerHTML = '<strong>Archive note:</strong> This archive combines the original 220-record Oogun collection with 1,000 source-derived entries from <em>AKOJOPO ASIRI YORUBA</em>.';

    const cats = [...new Set(entries.map(e => e.c || 'Other'))].sort((a,b)=>a.localeCompare(b));
    const counts = Object.fromEntries(cats.map(c => [c, entries.filter(e => (e.c || 'Other') === c).length]));
    if(filterBox) filterBox.innerHTML = [
      `<button class="filter-btn active" data-filter="all"><span>All formulas</span><span>${entries.length}</span></button>`,
      ...cats.map(c => `<button class="filter-btn" data-filter="${slug(c)}"><span>${esc(c)}</span><span>${counts[c]}</span></button>`)
    ].join('');

    let activeFilter = 'all';
    let query = '';
    let visibleLimit = 48;
    const pageSize = 48;

    let moreBtn = document.getElementById('oogunLoadMore');
    if(!moreBtn){
      moreBtn = document.createElement('button');
      moreBtn.id = 'oogunLoadMore';
      moreBtn.className = 'btn btn-secondary';
      moreBtn.style.cssText = 'display:none;margin:28px auto 0;';
      moreBtn.textContent = 'Load more entries';
      grid?.insertAdjacentElement('afterend', moreBtn);
    }

    const filteredEntries = () => entries.filter(e => {
      const category = slug(e.c || 'Other');
      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      if(!matchesFilter) return false;
      if(!query) return true;
      const hay = `${e.t||''} ${e.m||''} ${e.c||''} ${e.s||''}`.toLowerCase();
      return hay.includes(query);
    });

    const cardHtml = e => {
      const restricted = e.r && e.r.length;
      const short = e.m || 'Traditional Oogun archive entry';
      return `<article class="entry-card reveal in-view" data-entry-id="${esc(e.q)}">
        <div class="entry-top"><span class="entry-tag">${esc(e.c||'Other')}</span><span class="entry-id">${esc(e.s||e.q)}</span></div>
        <h3>${esc(e.t||'Untitled entry')}</h3>
        <div class="translation">${esc(short)}</div>
        <p>${restricted ? 'Independent archive entry' : (e.a?.length || e.p?.length || e.u?.length ? 'Open the formula to view materials, preparation and usage' : 'Open the record to view its source reference')}</p>
        ${social(e.t||'this entry')}
        <span class="entry-open">↗</span>
      </article>`;
    };

    const renderCards = () => {
      const matches = filteredEntries();
      const shown = matches.slice(0, visibleLimit);
      if(grid) grid.innerHTML = shown.map(cardHtml).join('');
      if(count) count.textContent = shown.length < matches.length
        ? `${shown.length.toLocaleString()} of ${matches.length.toLocaleString()} entries`
        : `${matches.length.toLocaleString()} ${matches.length === 1 ? 'entry' : 'entries'}`;
      const empty = document.querySelector('.empty-state');
      if(empty) empty.style.display = matches.length ? 'none' : 'block';
      if(moreBtn){
        moreBtn.style.display = shown.length < matches.length ? 'block' : 'none';
        moreBtn.textContent = `Load more entries (${matches.length - shown.length} remaining)`;
      }
    };

    filterBox?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn[data-filter]');
      if(!btn) return;
      filterBox.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      visibleLimit = pageSize;
      renderCards();
    });

    search?.addEventListener('input', () => {
      query = search.value.trim().toLowerCase();
      visibleLimit = pageSize;
      renderCards();
    });

    moreBtn?.addEventListener('click', () => {
      visibleLimit += pageSize;
      renderCards();
    });

    document.querySelectorAll('.view-toggle button').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grid?.classList.toggle('list-view', btn.dataset.view === 'list');
    }));

    grid?.addEventListener('click', e => {
      if(e.target.closest('.post-social a')) return;
      const card = e.target.closest('.entry-card[data-entry-id]');
      if(!card || !modal || !modalBody) return;
      const item = entries.find(x => String(x.q) === String(card.dataset.entryId));
      if(!item) return;
      const restricted = item.r && item.r.length;
      const sourceName = item.src || 'OOGUN BABA OGUN YORUBA TRADITIONAL CHARMS';
      const sourcePage = item.pg ? ` • PDF page ${item.pg}` : '';
      const details = restricted ? '' : `${list('Materials needed',item.a)}${list('Preparation',item.p,true)}${list('Usage',item.u,true)}${list('Incantation / Ofo',item.i)}${list('Translation',item.x)}${list('Source notes',item.o)}`;
      modalBody.innerHTML = `<div class="kicker">Source entry ${esc(item.s||item.q)} • ${esc(item.c||'Other')}</div>
        <h2>${esc(item.t||'Untitled entry')}</h2>
        <div class="translation">${esc(item.m||'Traditional Oogun archive entry')}</div>
        <div class="modal-meta"><span>${esc(item.c||'Other')}</span><span>Independent formula</span></div>
        ${details}
        <div class="source-line">Source: <em>${esc(sourceName)}</em>${esc(sourcePage)} — wording organized from the supplied source.</div>
        ${social(item.t||'this entry')}`;
      modal.classList.add('open');
      document.body.style.overflow='hidden';
    });

    renderCards();
  } catch(err) {
    console.error(err);
    if(grid) grid.innerHTML = '<div class="empty-state" style="display:block">The archive could not be loaded. Please refresh the page.</div>';
    if(count) count.textContent = 'Archive unavailable';
  } finally {
    finishLoading();
  }
})();
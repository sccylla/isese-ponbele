(() => {
  const DATA = window.ISESE_ORISA_DATA || [];
  const bySlug = Object.fromEntries(DATA.map(x => [x.slug, x]));
  const escape = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const hrefFor = o => o.dedicated || `orisa-documentary.html?id=${encodeURIComponent(o.slug)}`;

  const svg = inner => `<svg class="yoruba-symbol-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${inner}</svg>`;
  const ICONS = {
    opon: svg('<circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="16"/><circle cx="32" cy="10" r="2.2"/><circle cx="54" cy="32" r="2.2"/><circle cx="32" cy="54" r="2.2"/><circle cx="10" cy="32" r="2.2"/><path d="M32 22l7 10-7 10-7-10z"/>'),
    crossroads: svg('<path d="M32 7v50M7 32h50"/><path d="M32 7l-4 7M32 7l4 7M57 32l-7-4M57 32l-7 4M32 57l-4-7M32 57l4-7M7 32l7-4M7 32l7 4"/><circle cx="32" cy="32" r="5"/>'),
    iron: svg('<path d="M16 49L43 18M22 15l27 34"/><path d="M11 50l9-2-7-7zM42 13l9 2-7 7z"/><path d="M18 13l8 2-6 7zM48 50l-8-2 6-7z"/>'),
    river: svg('<path d="M6 20c8-7 14 7 22 0s14 7 22 0 8 0 8 0M6 32c8-7 14 7 22 0s14 7 22 0 8 0 8 0M6 44c8-7 14 7 22 0s14 7 22 0 8 0 8 0"/>'),
    oshe: svg('<path d="M32 14v38M24 52h16"/><path d="M31 18C22 8 12 12 10 22c8 1 15-1 21-6M33 18C42 8 52 12 54 22c-8 1-15-1-21-6"/><circle cx="32" cy="29" r="4"/>'),
    staff: svg('<path d="M32 10v44M25 54h14"/><circle cx="32" cy="16" r="7"/><path d="M27 16h10M32 9v14"/>'),
    wind: svg('<path d="M10 23h26c9 0 10-12 1-13-5 0-7 3-7 6M8 34h38c10 0 12 15 1 17-6 1-9-3-9-7M12 45h16"/>'),
    leaf: svg('<path d="M51 11C31 12 15 22 13 42c15 3 34-5 38-31z"/><path d="M16 46c8-12 16-19 29-28M28 35c-3-3-7-5-11-6M35 29c4 0 8 1 11 3"/>'),
    cowrie: svg('<ellipse cx="32" cy="32" rx="17" ry="24"/><path d="M32 14c-5 7-6 13-3 18-3 5-2 12 3 18M32 14c5 7 6 13 3 18 3 5 2 12-3 18"/><path d="M26 32h12"/>'),
    farm: svg('<path d="M8 47c12-8 36-8 48 0M10 38c11-6 33-6 44 0M13 29c9-5 29-5 38 0"/><path d="M36 11l-9 18M34 14l11 4M26 30l7 4"/>'),
    bow: svg('<path d="M17 9c18 12 18 34 0 46M17 9l0 46M13 32h40M47 27l6 5-6 5"/>'),
    bird: svg('<path d="M9 36c9-2 14-8 18-16 4 8 10 12 18 13 5 1 8 5 10 10-11-5-20-4-28 5-5-7-11-11-18-12z"/><path d="M29 20c3-7 8-10 14-9-2 5-6 8-11 10M46 34l8-5"/><circle cx="42" cy="15" r="1.5"/>'),
    twins: svg('<circle cx="22" cy="18" r="7"/><circle cx="42" cy="18" r="7"/><path d="M14 50V34c0-7 4-11 8-11s8 4 8 11v16M34 50V34c0-7 4-11 8-11s8 4 8 11v16M10 50h24M30 50h24"/>'),
    crown: svg('<path d="M10 23l8 10 8-15 7 15 10-15 11 15v15H10z"/><path d="M14 48h36M16 38h32"/><circle cx="18" cy="18" r="2"/><circle cx="33" cy="13" r="2"/><circle cx="49" cy="17" r="2"/>'),
    raffia: svg('<circle cx="32" cy="15" r="6"/><path d="M18 51l8-31M24 52l5-32M30 53l2-33M36 53l-2-33M42 52l-5-32M48 51l-8-31"/><path d="M17 31h30M15 42h34"/>'),
    wavebow: svg('<path d="M6 44c8-6 14 6 22 0s14 6 22 0 8 0 8 0"/><path d="M18 12c16 10 16 30 0 40M18 12v40M15 31h35M44 26l6 5-6 5"/>'),
    beads: svg('<circle cx="12" cy="31" r="4"/><circle cx="22" cy="20" r="4"/><circle cx="32" cy="16" r="4"/><circle cx="42" cy="20" r="4"/><circle cx="52" cy="31" r="4"/><circle cx="45" cy="43" r="4"/><circle cx="32" cy="48" r="4"/><circle cx="19" cy="43" r="4"/><path d="M15 28l4-5M26 18l2-1M36 17l2 1M45 23l4 5M50 35l-3 5M41 45l-5 2M28 47l-5-2M17 40l-3-5"/>'),
    shrine: svg('<path d="M9 27l23-16 23 16M14 25v28h36V25M24 53V35h16v18"/><path d="M20 28h24M26 19h12"/>')
  };
  const SLUG_ICON = {
    'orunmila':'opon','esu':'crossroads','ogun':'iron','osun':'river','sango':'oshe','obatala':'staff','yemoja':'river','oya':'wind','osanyin':'leaf','olokun':'cowrie','orisa-oko':'farm','erinle':'wavebow','iyami-aje':'bird','obaluaye':'raffia','ibeji':'twins','aje':'cowrie','logun-ede':'wavebow','osoosi':'bow','oba':'river','oduduwa':'crown','oranmiyan':'staff'
  };
  const iconSvg = name => ICONS[name] || ICONS.opon;
  const orisaIcon = o => iconSvg(SLUG_ICON[o.slug] || 'opon');

  const hydrateStaticSymbols = () => {
    document.querySelectorAll('[data-yoruba-symbol]').forEach(el => {
      const name = el.getAttribute('data-yoruba-symbol');
      el.innerHTML = iconSvg(name);
    });
  };

  const grid = document.getElementById('orisaDirectoryGrid');
  if (grid) {
    grid.innerHTML = DATA.map((o,i) => `
      <a class="orisa-card orisa-directory-card" href="${hrefFor(o)}">
        <div class="orisa-photo">
          <img src="${o.image}" alt="${escape(o.name)} — documented cultural representation" loading="lazy" referrerpolicy="no-referrer"/>
          <span class="orisa-symbol-badge" aria-hidden="true">${orisaIcon(o)}</span>
        </div>
        <div class="orisa-card-copy" data-index="${String(i+1).padStart(2,'0')}">
          <div class="orisa-card-cultural-line"><span class="orisa-card-cultural-dot"></span><small>${escape(o.classification)}</small></div>
          <h3>${escape(o.name)}</h3>
          <p>${escape(o.short)}</p>
          <div class="orisa-domain-row">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          <span class="learn">Open documentary →</span>
        </div>
      </a>`).join('');
    const count = document.getElementById('orisaCount');
    if (count) count.textContent = DATA.length;
  }

  const homeGrid = document.getElementById('homeOrisaDirectory');
  if (homeGrid) {
    homeGrid.innerHTML = DATA.map(o => `
      <a class="home-orisa-photo-tile" href="${hrefFor(o)}" aria-label="${escape(o.name)} documentary">
        <img src="${o.image}" alt="" loading="lazy" referrerpolicy="no-referrer"/>
        <span>${escape(o.name)}</span>
      </a>`).join('');
  }

  hydrateStaticSymbols();

  const root = document.getElementById('orisaDocumentary');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('id') || 'orunmila';
  const o = bySlug[slug];
  if (!o) {
    root.innerHTML = `<section class="orisa-detail-hero"><div class="doc-shell"><div class="orisa-not-found"><div class="orisa-premium-kicker">Documentary archive</div><h1>Òrìṣà entry not found.</h1><p>Return to the directory to choose a documented entry.</p><a class="btn btn-primary" href="orisas.html">Open Òrìṣà directory →</a></div></div></section>`;
    return;
  }

  document.title = `${o.name} — Isese Ponbele Òrìṣà Documentary`;
  const index = DATA.indexOf(o);
  const next = DATA[(index + 1) % DATA.length];
  const prev = DATA[(index - 1 + DATA.length) % DATA.length];
  const refs = o.refs.map(([label, url]) => `<li>${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>` : escape(label)}</li>`).join('');
  const imageSource = o.refs[o.refs.length - 1]?.[1] || '#';

  root.innerHTML = `
    <section class="orisa-detail-hero">
      <div class="doc-shell orisa-detail-hero-grid">
        <div class="orisa-detail-copy">
          <div class="orisa-detail-symbol-wrap">
            <span class="orisa-detail-symbol-seal" aria-hidden="true">${orisaIcon(o)}</span>
            <div class="orisa-detail-symbol-copy"><small>Àmì / cultural symbol</small><strong>${escape(o.name)}</strong></div>
          </div>
          <div class="orisa-premium-kicker">Ilé Òrìṣà • Documentary ${String(index+1).padStart(2,'0')}</div>
          <h1>${escape(o.name)}</h1>
          <p class="orisa-classification">${escape(o.classification)}</p>
          <p class="orisa-lede">${escape(o.short)}</p>
          <div class="orisa-domain-row large">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          <div class="orisa-detail-actions"><a class="btn btn-primary" href="#documentary">Read documentary ↓</a><a class="btn btn-ghost" href="orisas.html">All Òrìṣà</a></div>
        </div>
        <figure class="orisa-detail-figure">
          <img src="${o.image}" alt="${escape(o.name)} — documented cultural representation" referrerpolicy="no-referrer"/>
          <figcaption>Documented shrine, ritual object, monument or cultural representation connected with ${escape(o.name)}. <a href="${imageSource}" target="_blank" rel="noopener noreferrer">Image/source ↗</a></figcaption>
        </figure>
      </div>
    </section>

    <div class="orisa-ancestral-band" aria-hidden="true"><div class="doc-shell"><span>Ìbá</span><span>Àṣẹ</span><span>Oríkì</span><span>Ìdílé</span><span>Àṣà</span><span>Ìṣẹ̀ṣe</span><span>Ìwà</span></div></div>

    <section class="orisa-detail-body" id="documentary">
      <div class="doc-shell orisa-detail-layout">
        <aside class="orisa-detail-toc">
          <span class="toc-symbol" aria-hidden="true">${orisaIcon(o)}</span>
          <strong>${escape(o.name)}</strong>
          <a href="#identity">01 • Identity & worldview</a>
          <a href="#character">02 • Cultural meaning</a>
          <a href="#representation">03 • Visual culture</a>
          <a href="#geography">04 • Sacred geography</a>
          <a href="#variation">05 • Lineage variation</a>
          <a href="#references">06 • References</a>
          ${o.slug === 'iyami-aje' ? '<a href="iyami-aje.html">Extended Ìyámi documentary →</a>' : ''}
        </aside>
        <article class="orisa-detail-article">
          <div class="orisa-documentary-note"><strong>Ìbá fún ìmọ̀ ìbílẹ̀:</strong> This page documents cultural and historical traditions. Yoruba Òrìṣà knowledge varies by town, priestly lineage, period and diaspora history; no single local version is presented as universal.</div>

          <section id="identity" data-chapter="01"><div class="doc-eyebrow with-symbol"><span class="doc-mini-symbol" aria-hidden="true">${iconSvg('opon')}</span><span>01 • Ta ni? • Identity & worldview</span></div><h2>Who is ${escape(o.name)}?</h2><p>${escape(o.overview)}</p></section>
          <section id="character" data-chapter="02"><div class="doc-eyebrow with-symbol"><span class="doc-mini-symbol" aria-hidden="true">${iconSvg('beads')}</span><span>02 • Ìtumọ̀ • Cultural meaning</span></div><h2>What the tradition expresses.</h2><p>${escape(o.character)}</p></section>
          <section id="representation" data-chapter="03"><div class="doc-eyebrow with-symbol"><span class="doc-mini-symbol" aria-hidden="true">${orisaIcon(o)}</span><span>03 • Àwòrán • Pictures & representations</span></div><h2>Material culture, sacred objects and visual language.</h2><p>${escape(o.material)}</p><div class="orisa-visual-study"><figure><img src="${o.image}" alt="${escape(o.name)} cultural representation — full view" loading="lazy" referrerpolicy="no-referrer"/><figcaption>Primary documented representation.</figcaption></figure><figure class="detail-crop"><img src="${o.image}" alt="${escape(o.name)} cultural representation — detail view" loading="lazy" referrerpolicy="no-referrer"/><figcaption>Detail study of the same documented object or sacred setting.</figcaption></figure></div><div class="representation-tags">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div></section>
          <section id="geography" data-chapter="04"><div class="doc-eyebrow with-symbol"><span class="doc-mini-symbol" aria-hidden="true">${iconSvg('river')}</span><span>04 • Ibi mímọ́ • Sacred geography</span></div><h2>Place, community and living tradition.</h2><p>${escape(o.geography)}</p></section>
          <section id="variation" data-chapter="05"><div class="doc-eyebrow with-symbol"><span class="doc-mini-symbol" aria-hidden="true">${iconSvg('twins')}</span><span>05 • Ìdílé • Lineage & regional variation</span></div><h2>Tradition lives through many lineages.</h2><p>${escape(o.variation)}</p></section>
          <section id="references" data-chapter="06"><div class="doc-eyebrow with-symbol"><span class="doc-mini-symbol" aria-hidden="true">${iconSvg('staff')}</span><span>06 • Àwọn ìtọ́kasí • References</span></div><h2>Selected documentary sources.</h2><ul class="orisa-reference-list">${refs}</ul></section>

          <nav class="orisa-next-prev" aria-label="More Orisa documentaries"><a href="${hrefFor(prev)}"><small>Previous / Sẹ́yìn</small><strong>← ${escape(prev.name)}</strong></a><a href="${hrefFor(next)}"><small>Next / Tẹ̀síwájú</small><strong>${escape(next.name)} →</strong></a></nav>
        </article>
      </div>
    </section>`;
})();

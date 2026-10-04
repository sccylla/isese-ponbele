(() => {
  const DATA = window.ISESE_ORISA_DATA || [];
  const bySlug = Object.fromEntries(DATA.map(x => [x.slug, x]));
  const escape = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const hrefFor = o => o.dedicated || `orisa-documentary.html?id=${encodeURIComponent(o.slug)}`;

  const grid = document.getElementById('orisaDirectoryGrid');
  if (grid) {
    grid.innerHTML = DATA.map(o => `
      <a class="orisa-card orisa-directory-card" href="${hrefFor(o)}">
        <div class="orisa-photo"><img src="${o.image}" alt="${escape(o.name)} — documented cultural representation" loading="lazy" referrerpolicy="no-referrer"/></div>
        <div class="orisa-card-copy">
          <small>${escape(o.classification)}</small>
          <h3>${escape(o.name)}</h3>
          <p>${escape(o.short)}</p>
          <div class="orisa-domain-row">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          <span class="learn">Open full documentary →</span>
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

  const root = document.getElementById('orisaDocumentary');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get('id') || 'orunmila';
  const o = bySlug[slug];

  if (!o) {
    root.innerHTML = `<section class="orisa-detail-hero"><div class="doc-shell"><div class="orisa-not-found"><div class="doc-eyebrow">Documentary archive</div><h1>Òrìṣà entry not found.</h1><p>Return to the directory to choose a documented entry.</p><a class="btn btn-primary" href="orisas.html">Open Òrìṣà directory →</a></div></div></section>`;
    return;
  }

  document.title = `${o.name} — Isese Ponbele Òrìṣà Documentary`;
  const nextIndex = (DATA.indexOf(o) + 1) % DATA.length;
  const prevIndex = (DATA.indexOf(o) - 1 + DATA.length) % DATA.length;
  const next = DATA[nextIndex], prev = DATA[prevIndex];

  const refs = o.refs.map(([label, url]) => `
    <li>${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>` : escape(label)}</li>
  `).join('');

  root.innerHTML = `
    <section class="orisa-detail-hero">
      <div class="doc-shell orisa-detail-hero-grid">
        <div class="orisa-detail-copy">
          <div class="doc-eyebrow">Isese Ponbele • Òrìṣà documentary archive</div>
          <h1>${escape(o.name)}</h1>
          <p class="orisa-classification">${escape(o.classification)}</p>
          <p class="orisa-lede">${escape(o.short)}</p>
          <div class="orisa-domain-row large">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          <div class="orisa-detail-actions">
            <a class="btn btn-primary" href="#documentary">Read documentary ↓</a>
            <a class="btn btn-ghost" href="orisas.html">All Òrìṣà</a>
          </div>
        </div>
        <figure class="orisa-detail-figure">
          <img src="${o.image}" alt="${escape(o.name)} — documented cultural representation" referrerpolicy="no-referrer"/>
          <figcaption>Documented shrine, ritual object, monument or cultural representation connected with ${escape(o.name)}. <a href="${o.refs[o.refs.length-1][1] || '#'}" target="_blank" rel="noopener noreferrer">Image/source ↗</a></figcaption>
        </figure>
      </div>
    </section>

    <section class="orisa-detail-body" id="documentary">
      <div class="doc-shell orisa-detail-layout">
        <aside class="orisa-detail-toc">
          <strong>${escape(o.name)}</strong>
          <a href="#identity">Identity & worldview</a>
          <a href="#character">Cultural meaning</a>
          <a href="#representation">Pictures & representations</a>
          <a href="#geography">Sacred geography</a>
          <a href="#variation">Lineage variation</a>
          <a href="#references">References</a>
          ${o.slug === 'iyami-aje' ? '<a href="iyami-aje.html">Extended Ìyámi documentary →</a>' : ''}
        </aside>

        <article class="orisa-detail-article">
          <div class="orisa-documentary-note">This is cultural and historical documentation. Yoruba Òrìṣà traditions vary by town, priestly lineage, period and diaspora history; the page does not claim that one local version is universal.</div>

          <section id="identity">
            <div class="doc-eyebrow">01 • Identity & worldview</div>
            <h2>Who is ${escape(o.name)}?</h2>
            <p>${escape(o.overview)}</p>
          </section>

          <section id="character">
            <div class="doc-eyebrow">02 • Cultural meaning</div>
            <h2>What the tradition expresses.</h2>
            <p>${escape(o.character)}</p>
          </section>

          <section id="representation">
            <div class="doc-eyebrow">03 • Pictures & representations</div>
            <h2>Material culture, sacred objects and visual language.</h2>
            <p>${escape(o.material)}</p>
            <div class="orisa-visual-study">
              <figure>
                <img src="${o.image}" alt="${escape(o.name)} cultural representation — full view" loading="lazy" referrerpolicy="no-referrer"/>
                <figcaption>Primary documented representation.</figcaption>
              </figure>
              <figure class="detail-crop">
                <img src="${o.image}" alt="${escape(o.name)} cultural representation — detail view" loading="lazy" referrerpolicy="no-referrer"/>
                <figcaption>Detail study of the same documented object or sacred setting.</figcaption>
              </figure>
            </div>
            <div class="representation-tags">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          </section>

          <section id="geography">
            <div class="doc-eyebrow">04 • Sacred geography</div>
            <h2>Place, community and living tradition.</h2>
            <p>${escape(o.geography)}</p>
          </section>

          <section id="variation">
            <div class="doc-eyebrow">05 • Lineage & regional variation</div>
            <h2>There is no single universal chart.</h2>
            <p>${escape(o.variation)}</p>
          </section>

          <section id="references">
            <div class="doc-eyebrow">06 • References</div>
            <h2>Selected documentary sources.</h2>
            <ul class="orisa-reference-list">${refs}</ul>
          </section>

          <nav class="orisa-next-prev" aria-label="More Orisa documentaries">
            <a href="${hrefFor(prev)}"><small>Previous</small><strong>← ${escape(prev.name)}</strong></a>
            <a href="${hrefFor(next)}"><small>Next</small><strong>${escape(next.name)} →</strong></a>
          </nav>
        </article>
      </div>
    </section>`;
})();

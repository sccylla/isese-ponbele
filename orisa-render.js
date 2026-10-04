(() => {
  const DATA = window.ISESE_ORISA_DATA || [];
  const LONG = window.ISESE_ORISA_LONGFORM || {};
  const bySlug = Object.fromEntries(DATA.map(x => [x.slug, x]));
  const escape = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const hrefFor = o => o.dedicated || `orisa-documentary.html?id=${encodeURIComponent(o.slug)}`;
  const paragraphs = value => {
    const arr = Array.isArray(value) ? value : (value ? [value] : []);
    return arr.map(p => `<p>${escape(p)}</p>`).join('');
  };

  const grid = document.getElementById('orisaDirectoryGrid');
  if (grid) {
    grid.innerHTML = DATA.map((o,i) => `
      <a class="orisa-card orisa-directory-card" href="${hrefFor(o)}">
        <div class="orisa-photo">
          <img src="${o.image}" alt="${escape(o.name)} — documented cultural representation" loading="lazy" referrerpolicy="no-referrer"/>
        </div>
        <div class="orisa-card-copy" data-index="${String(i+1).padStart(2,'0')}">
          <small>${escape(o.classification)}</small>
          <h3>${escape(o.name)}</h3>
          <p>${escape(o.short)}</p>
          <div class="orisa-domain-row">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          <span class="learn">Read full documentary →</span>
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
    root.innerHTML = `<section class="orisa-detail-hero"><div class="doc-shell"><div class="orisa-not-found"><div class="orisa-premium-kicker">Ilé Òrìṣà</div><h1>Òrìṣà entry not found.</h1><p>Return to the directory to choose a documentary.</p><a class="btn btn-primary" href="orisas.html">Open Òrìṣà directory →</a></div></div></section>`;
    return;
  }

  const lf = LONG[o.slug] || {};
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
          <div class="orisa-premium-kicker">Ilé Òrìṣà • Documentary ${String(index+1).padStart(2,'0')} of ${String(DATA.length).padStart(2,'0')}</div>
          <h1>${escape(o.name)}</h1>
          <p class="orisa-classification">${escape(o.classification)}</p>
          <p class="orisa-lede">${escape(o.short)}</p>
          <div class="orisa-domain-row large">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          <div class="orisa-detail-actions"><a class="btn btn-primary" href="#documentary">Begin documentary ↓</a><a class="btn btn-ghost" href="orisas.html">All Òrìṣà</a></div>
        </div>
        <figure class="orisa-detail-figure">
          <img src="${o.image}" alt="${escape(o.name)} — documented cultural representation" referrerpolicy="no-referrer"/>
          <figcaption>Documented shrine, ritual object, monument or cultural representation connected with ${escape(o.name)}. ${imageSource !== '#' ? `<a href="${imageSource}" target="_blank" rel="noopener noreferrer">Image/source ↗</a>` : ''}</figcaption>
        </figure>
      </div>
    </section>

    <div class="orisa-ancestral-band"><div class="doc-shell"><span>Identity</span><span>Oral tradition</span><span>Worship</span><span>Material culture</span><span>Sacred geography</span><span>History</span><span>References</span></div></div>

    <section class="orisa-detail-body" id="documentary">
      <div class="doc-shell orisa-detail-layout">
        <aside class="orisa-detail-toc">
          <strong>${escape(o.name)}</strong>
          <small class="toc-subtitle">Full documentary • 12 chapters</small>
          <a href="#identity">01 • Identity & names</a>
          <a href="#oral">02 • Oral traditions</a>
          <a href="#meaning">03 • Cultural meaning</a>
          <a href="#worship">04 • Worship & priesthood</a>
          <a href="#representation">05 • Material culture</a>
          <a href="#geography">06 • Sacred geography</a>
          <a href="#festivals">07 • Festivals & public life</a>
          <a href="#history">08 • Historical development</a>
          <a href="#variation">09 • Lineage variation</a>
          <a href="#diaspora">10 • Diaspora & modern life</a>
          <a href="#misconceptions">11 • Misconceptions & cautions</a>
          <a href="#references">12 • References</a>
          ${o.slug === 'iyami-aje' ? '<a class="toc-special" href="iyami-aje.html">Extended Ìyámi documentary →</a>' : ''}
        </aside>

        <article class="orisa-detail-article">
          <div class="orisa-documentary-note"><strong>Documentary note:</strong> Yoruba sacred traditions vary by town, priestly lineage, family, historical period and diaspora community. This page compares documented themes without presenting one local version as universal.</div>

          <section id="identity" data-chapter="01">
            <div class="doc-eyebrow">01 • Ta ni? • Identity, names & worldview</div>
            <h2>Who is ${escape(o.name)}?</h2>
            ${paragraphs(o.overview)}
            ${paragraphs(lf.names)}
          </section>

          <section id="oral" data-chapter="02">
            <div class="doc-eyebrow">02 • Àlọ́, itan & oral memory</div>
            <h2>Oral traditions and sacred narratives.</h2>
            ${paragraphs(lf.oral)}
          </section>

          <section id="meaning" data-chapter="03">
            <div class="doc-eyebrow">03 • Ìtumọ̀ • Cultural and religious meaning</div>
            <h2>What the tradition expresses.</h2>
            ${paragraphs(o.character)}
          </section>

          <section id="worship" data-chapter="04">
            <div class="doc-eyebrow">04 • Ìjọsìn • Worship, priesthood & devotional life</div>
            <h2>How the tradition is maintained.</h2>
            ${paragraphs(lf.worship)}
          </section>

          <section id="representation" data-chapter="05">
            <div class="doc-eyebrow">05 • Àwòrán • Material culture & representation</div>
            <h2>Shrines, sacred objects and visual language.</h2>
            ${paragraphs(o.material)}
            <div class="orisa-visual-study">
              <figure><img src="${o.image}" alt="${escape(o.name)} cultural representation — full view" loading="lazy" referrerpolicy="no-referrer"/><figcaption>Primary documented cultural representation.</figcaption></figure>
              <figure class="detail-crop"><img src="${o.image}" alt="${escape(o.name)} cultural representation — detail view" loading="lazy" referrerpolicy="no-referrer"/><figcaption>Detail study of the same documented object, monument or sacred setting.</figcaption></figure>
            </div>
            <div class="representation-tags">${o.domains.map(d => `<span>${escape(d)}</span>`).join('')}</div>
          </section>

          <section id="geography" data-chapter="06">
            <div class="doc-eyebrow">06 • Ibi mímọ́ • Sacred geography</div>
            <h2>Place, landscape and community.</h2>
            ${paragraphs(o.geography)}
          </section>

          <section id="festivals" data-chapter="07">
            <div class="doc-eyebrow">07 • Ayẹyẹ • Festivals & public life</div>
            <h2>Public ceremony and community memory.</h2>
            ${paragraphs(lf.festivals)}
          </section>

          <section id="history" data-chapter="08">
            <div class="doc-eyebrow">08 • Ìtàn • Historical development</div>
            <h2>How the documentary record changed over time.</h2>
            ${paragraphs(lf.history)}
          </section>

          <section id="variation" data-chapter="09">
            <div class="doc-eyebrow">09 • Ìdílé • Lineage & regional variation</div>
            <h2>There is no single universal local version.</h2>
            ${paragraphs(o.variation)}
          </section>

          <section id="diaspora" data-chapter="10">
            <div class="doc-eyebrow">10 • Àgbáyé • Diaspora & contemporary life</div>
            <h2>Tradition across the Atlantic and the modern world.</h2>
            ${paragraphs(lf.diaspora)}
          </section>

          <section id="misconceptions" data-chapter="11">
            <div class="doc-eyebrow">11 • Ìtúmọ̀ tó yẹ • Misconceptions & cautions</div>
            <h2>What should not be oversimplified.</h2>
            ${paragraphs(lf.misconceptions)}
          </section>

          <section id="references" data-chapter="12">
            <div class="doc-eyebrow">12 • Àwọn ìtọ́kasí • References</div>
            <h2>Selected documentary sources.</h2>
            <ul class="orisa-reference-list">${refs}</ul>
          </section>

          <nav class="orisa-next-prev" aria-label="More Orisa documentaries">
            <a href="${hrefFor(prev)}"><small>Previous / Sẹ́yìn</small><strong>← ${escape(prev.name)}</strong></a>
            <a href="${hrefFor(next)}"><small>Next / Tẹ̀síwájú</small><strong>${escape(next.name)} →</strong></a>
          </nav>
        </article>
      </div>
    </section>`;
})();
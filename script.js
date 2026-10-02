(() => {
  const LOGO = '/assets/isese-ponbele-logo.png?v=20261002-home-clean';

  const applyLogo = () => {
    let icon = document.querySelector('link[rel~="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.type = 'image/png';
    icon.href = LOGO;

    let apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      document.head.appendChild(apple);
    }
    apple.href = LOGO;
  };

  const enhanceHomepage = () => {
    const path = location.pathname;
    const isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('index.html');
    if (!isHome) return;

    document.body.classList.add('homepage-clean-hero');

    document.querySelectorAll('.hero-logo-wrap').forEach(el => el.remove());

    const referenceHouse = document.querySelector('.knowledge-journey')?.closest('section');
    if (referenceHouse) referenceHouse.remove();

    if (document.getElementById('homeArchivePreviews')) return;

    const hero = document.querySelector('.hero-immersive');
    if (!hero) return;

    const previewWrap = document.createElement('div');
    previewWrap.id = 'homeArchivePreviews';
    previewWrap.innerHTML = `
      <section class="home-preview-section ogun-preview-section">
        <div class="container">
          <div class="home-preview-head">
            <div>
              <div class="kicker">Ogun archive preview</div>
              <h2>8 featured Ogun entries.</h2>
            </div>
            <p>A quick look into the private Ogun archive. Open the archive to view the complete collection.</p>
          </div>
          <div class="preview-grid-ogun">
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 01</span><h3>ISEGUN AROKA</h3><p>Victory and overcoming gossip, hostility or opposition.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 02</span><h3>ARISOYIN</h3><p>Traditional preparation associated with being spoken of favourably while absent.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 03</span><h3>IMU IRINAJO DARA</h3><p>Safe travelling and making a journey go well.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 04</span><h3>ISAN GBESE</h3><p>Traditional working connected with release from debt and repayment.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 05</span><h3>OOGUN KOSOFO</h3><p>Traditional preparation associated with preventing loss.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 06</span><h3>IKUJENJO</h3><p>Protective archive entry traditionally associated with warding off death.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 07</span><h3>IMU OJO DURO</h3><p>Traditional rain-stopping preparation in the archive.</p><span class="preview-open">Open archive →</span></a>
            <a class="ogun-preview-card" href="catalogue.html"><span class="preview-no">Ogun 08</span><h3>WIWA OJU RERE IFA</h3><p>Traditional preparation associated with seeking favour from Ifa.</p><span class="preview-open">Open archive →</span></a>
          </div>
          <div class="home-preview-actions"><a class="btn" href="catalogue.html">View all Ogun entries →</a></div>
        </div>
      </section>

      <section class="home-preview-section ewe-preview-section">
        <div class="container">
          <div class="home-preview-head">
            <div>
              <div class="kicker">Ewe documentary preview</div>
              <h2>3 featured Ewe.</h2>
            </div>
            <p>Yoruba names paired with common names, botanical references and identification notes.</p>
          </div>
          <div class="preview-grid-ewe">
            <a class="ewe-preview-card" href="herbs.html">
              <div class="ewe-preview-photo"><img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/Starr_071024-8809_Kalanchoe_crenata.jpg?width=1100" alt="Odundun - Kalanchoe crenata leaves"></div>
              <div class="ewe-preview-body"><span class="preview-no">Ewe 01</span><h3>Odundun</h3><div class="common">Never-die / Kalanchoe</div><div class="botanical">Kalanchoe crenata (Andrews) Haw.</div><p>A fleshy-leaved succulent with rounded to crenate leaf margins.</p></div>
            </a>
            <a class="ewe-preview-card" href="herbs.html">
              <div class="ewe-preview-photo"><img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/Vernonia_amygdalina_plant.jpg?width=1100" alt="Ewuro bitter leaf plant"></div>
              <div class="ewe-preview-body"><span class="preview-no">Ewe 02</span><h3>Ewuro</h3><div class="common">Bitter leaf</div><div class="botanical">Gymnanthemum amygdalinum</div><p>A familiar bitter-leaf shrub widely documented across tropical Africa.</p></div>
            </a>
            <a class="ewe-preview-card" href="herbs.html">
              <div class="ewe-preview-photo"><img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/Milicia_excelsa_%28iroko%29_Moraceae.jpg?width=1100" alt="Iroko tree Milicia excelsa"></div>
              <div class="ewe-preview-body"><span class="preview-no">Ewe 03</span><h3>Iroko</h3><div class="common">African iroko</div><div class="botanical">Milicia excelsa (Welw.) C.C.Berg</div><p>A major tropical African tree in the mulberry family.</p></div>
            </a>
          </div>
          <div class="home-preview-actions"><a class="btn" href="herbs.html">View the Leaves Documentary →</a></div>
        </div>
      </section>`;

    hero.insertAdjacentElement('afterend', previewWrap);
  };

  const enhanceLeaves = () => {
    const path = location.pathname;
    const isLeaves = path.endsWith('/herbs.html') || path.endsWith('herbs.html');
    if (!isLeaves || document.querySelector('script[data-rich-leaves]')) return;
    const rich = document.createElement('script');
    rich.src = 'leaves-rich.js?v=20261002-rich-leaves-v2';
    rich.dataset.richLeaves = 'true';
    document.head.appendChild(rich);
  };

  const addFooterCredit = () => {
    const footerBottom = document.querySelector('.footer-bottom');
    if (!footerBottom || footerBottom.querySelector('.ifadare-credit')) return;
    const credit = document.createElement('span');
    credit.className = 'ifadare-credit';
    credit.textContent = 'Credits: Dr. Ifadare';
    footerBottom.appendChild(credit);
  };

  applyLogo();
  enhanceHomepage();
  enhanceLeaves();
  addFooterCredit();

  const main = document.createElement('script');
  main.src = 'site-main.js?v=20261002-deploy-retry';
  main.async = false;
  document.head.appendChild(main);
})();
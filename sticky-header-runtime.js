(() => {
  const header = document.querySelector('body > .site-header');
  const ticker = document.querySelector('body > .top-ticker');
  if (!header) return;

  document.body.classList.add('home-sticky-header');

  let spacer = document.querySelector('body > .site-header-spacer');
  if (!spacer) {
    spacer = document.createElement('div');
    spacer.className = 'site-header-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    header.insertAdjacentElement('afterend', spacer);
  }

  const pinThreshold = () => ticker ? ticker.offsetHeight : 0;

  const syncHeader = () => {
    const shouldPin = window.scrollY >= pinThreshold();
    header.classList.toggle('is-pinned', shouldPin);
    spacer.style.height = shouldPin ? `${header.offsetHeight}px` : '0px';
  };

  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', syncHeader, { passive: true });
  window.addEventListener('load', syncHeader, { once: true });
  requestAnimationFrame(syncHeader);
})();

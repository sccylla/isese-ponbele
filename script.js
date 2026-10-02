(() => {
  const LOGO_B64_URL = '/logo-chunks/chunk-00.txt?v=20261002-png-final';
  const FALLBACK = '/assets/isese-ponbele-logo.webp?v=20261002-static-final';

  const setBrand = (src, type = 'image/png') => {
    document.documentElement.style.setProperty('--isese-exact-logo', `url("${src}")`);

    let icon = document.querySelector('link[rel~="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.type = type;
    icon.href = src;

    let apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      document.head.appendChild(apple);
    }
    apple.href = src;
  };

  setBrand(FALLBACK, 'image/webp');

  fetch(LOGO_B64_URL, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error(`Logo payload HTTP ${r.status}`);
      return r.text();
    })
    .then(b64 => {
      const clean = b64.trim();
      if (!clean.startsWith('iVBORw0KGgo')) throw new Error('Logo payload is not PNG data');
      setBrand(`data:image/png;base64,${clean}`, 'image/png');
    })
    .catch(err => console.warn('PNG logo fallback in use:', err));

  const main = document.createElement('script');
  main.src = 'site-main.js?v=20261002-png-final';
  main.async = false;
  document.head.appendChild(main);
})();

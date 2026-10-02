(() => {
  const LOGO = '/assets/isese-ponbele-logo.webp?v=20261002-static-final';

  const applyStaticBrand = () => {
    document.documentElement.style.setProperty('--isese-exact-logo', `url("${LOGO}")`);

    let icon = document.querySelector('link[rel~="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.type = 'image/webp';
    icon.href = LOGO;

    let apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      document.head.appendChild(apple);
    }
    apple.href = LOGO;
  };

  applyStaticBrand();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyStaticBrand, { once: true });
  }

  const main = document.createElement('script');
  main.src = 'site-main.js?v=20261002-static-final';
  main.async = false;
  document.head.appendChild(main);
})();

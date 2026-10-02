(() => {
  const u = 'assets/isese-ponbele-logo.webp?v=20261002-exact-3';
  document.documentElement.style.setProperty('--isese-exact-logo', `url("${u}")`);

  let st = document.getElementById('isese-exact-brand-style');
  if (!st) {
    st = document.createElement('style');
    st.id = 'isese-exact-brand-style';
    st.textContent = '.brand-mark,.loader-mark,.story-symbol{background-image:var(--isese-exact-logo)!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important}.hero-grid::after{background-image:var(--isese-exact-logo)!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important}';
    document.head.appendChild(st);
  }

  let icon = document.querySelector('link[rel~="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.appendChild(icon);
  }
  icon.type = 'image/webp';
  icon.href = u;

  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    document.head.appendChild(apple);
  }
  apple.href = u;
})();

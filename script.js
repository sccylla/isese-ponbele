(() => {
  const LOGO = '/assets/isese-ponbele-logo.png?v=20261002-exact-upload-2';

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

  applyLogo();

  const main = document.createElement('script');
  main.src = 'site-main.js?v=20261002-exact-upload-2';
  main.async = false;
  document.head.appendChild(main);
})();

(() => {
  const loadMain = () => {
    const main = document.createElement('script');
    main.src = 'site-main.js?v=20261002-exact-brand-3';
    main.async = false;
    document.head.appendChild(main);
  };

  const exactBrand = document.createElement('script');
  exactBrand.src = 'brand-exact-data.js?v=20261002-exact-brand-3';
  exactBrand.async = false;
  exactBrand.onload = loadMain;
  exactBrand.onerror = loadMain;
  document.head.appendChild(exactBrand);
})();

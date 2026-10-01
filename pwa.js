(() => {
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  const isStandalone = matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) return;

  let deferredPrompt = null;
  let installButton = null;

  const ensureButton = () => {
    if (installButton) return installButton;
    installButton = document.createElement('button');
    installButton.type = 'button';
    installButton.textContent = 'Install Isese Ponbele App';
    installButton.setAttribute('aria-label', 'Install Isese Ponbele App');
    installButton.style.cssText = [
      'position:fixed',
      'right:18px',
      'bottom:18px',
      'z-index:9998',
      'border:1px solid rgba(255,230,177,.35)',
      'background:#17100b',
      'color:#f4dcae',
      'padding:12px 16px',
      'border-radius:999px',
      'font:800 13px/1.2 Nunito Sans,Arial,sans-serif',
      'box-shadow:0 10px 30px rgba(0,0,0,.28)',
      'cursor:pointer',
      'display:none'
    ].join(';');
    document.body.appendChild(installButton);
    return installButton;
  };

  addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    const button = ensureButton();
    button.style.display = 'block';
    button.onclick = async () => {
      if (!deferredPrompt) return;
      button.style.display = 'none';
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
    };
  });

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    const button = ensureButton();
    button.style.display = 'block';
    button.onclick = () => alert('To install Isese Ponbele on iPhone or iPad: tap the Share button in Safari, then choose “Add to Home Screen”.');
  }

  addEventListener('appinstalled', () => {
    if (installButton) installButton.remove();
    deferredPrompt = null;
  });
})();

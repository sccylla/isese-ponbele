(() => {
  const SECRET = 'bQrPPCjAcT2XgHqxGsZHTkMbiB-cXaUJ_sRzlbBwj40';
  const ADMIN_SALT = 'b4e0e69757fecd1e1bd2d2fbcb932067';
  const ADMIN_HASH = '548cdf142124be0b778781ea24bdc603b62e9b60fcdc645e8c88038b684a4763';
  const STORE_KEY = 'ipOgunAccessUntil';
  const enc = new TextEncoder();

  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }

  async function hmac(payload) {
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return hex(new Uint8Array(signature)).slice(0, 16);
  }

  function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    let out = 0;
    for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return out === 0;
  }

  async function isAdminPassword(password) {
    if (!password) return false;
    const digest = await sha256(ADMIN_SALT + password);
    return safeEqual(digest, ADMIN_HASH);
  }

  async function generate(days = 7) {
    const safeDays = Math.min(365, Math.max(1, Number(days) || 7));
    const expires = Math.floor(Date.now() / 1000) + Math.round(safeDays * 86400);
    const exp = expires.toString(36).toUpperCase();
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const nonce = hex(random);
    const payload = `${exp}.${nonce}`;
    const sig = await hmac(payload);
    return {
      code: `IP-${exp}-${nonce}-${sig}`,
      expiresAt: expires * 1000,
      days: safeDays
    };
  }

  async function validateCode(raw) {
    const code = String(raw || '').trim().toUpperCase();
    const match = code.match(/^IP-([0-9A-Z]+)-([0-9A-F]{8})-([0-9A-F]{16})$/);
    if (!match) return { ok: false, reason: 'format' };
    const [, exp, nonce, sig] = match;
    const expires = parseInt(exp, 36);
    if (!Number.isFinite(expires) || expires * 1000 <= Date.now()) {
      return { ok: false, reason: 'expired' };
    }
    const expected = await hmac(`${exp}.${nonce}`);
    return safeEqual(expected, sig)
      ? { ok: true, expiresAt: expires * 1000, admin: false }
      : { ok: false, reason: 'invalid' };
  }

  async function validateCredential(raw) {
    const value = String(raw || '').trim();
    if (await isAdminPassword(value)) {
      return { ok: true, expiresAt: Date.now() + 3650 * 86400 * 1000, admin: true };
    }
    return validateCode(value);
  }

  function remember(expiresAt, persistent = true) {
    const value = String(Number(expiresAt) || 0);
    try {
      (persistent ? localStorage : sessionStorage).setItem(STORE_KEY, value);
      if (persistent) sessionStorage.removeItem(STORE_KEY);
      else localStorage.removeItem(STORE_KEY);
    } catch (_) {}
  }

  function rememberedUntil() {
    let value = 0;
    try {
      value = Math.max(
        Number(localStorage.getItem(STORE_KEY) || 0),
        Number(sessionStorage.getItem(STORE_KEY) || 0)
      );
    } catch (_) {}
    return value;
  }

  function hasAccess() {
    return rememberedUntil() > Date.now();
  }

  function clearAccess() {
    try {
      localStorage.removeItem(STORE_KEY);
      sessionStorage.removeItem(STORE_KEY);
    } catch (_) {}
  }

  window.OgunAccess = {
    generate,
    validateCode,
    validateCredential,
    isAdminPassword,
    remember,
    rememberedUntil,
    hasAccess,
    clearAccess
  };
})();
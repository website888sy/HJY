/* ======================= UTILITIES ======================= */
const $ = (id) => document.getElementById(id);
const toast = (msg, ok=true) => {
  const t = $('toast');
  t.textContent = String(msg);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
};
const log = (msg, ok=true, doAlert=false) => {
  try {
    const t = new Date().toLocaleTimeString('ar', { hour12: false });
    const make = () => {
      const div = document.createElement('div');
      div.className = 'log-entry ' + (ok ? 'log-ok' : 'log-err');
      div.textContent = `[${t}] ${msg}`;
      return div;
    };
    const box = $('opLog');
    const boxIn = $('opLogInline');
    if (box) { box.appendChild(make()); box.scrollTop = box.scrollHeight; while (box.children.length > 150) box.removeChild(box.firstChild); }
    if (boxIn) { boxIn.appendChild(make()); boxIn.scrollTop = boxIn.scrollHeight; while (boxIn.children.length > 40) boxIn.removeChild(boxIn.firstChild); }
    const fb = $('logFloatBadge');
    if (fb) {
      if (!ok) { fb.textContent = '!'; fb.classList.add('show'); }
      clearTimeout(window.__fbT);
      window.__fbT = setTimeout(() => { fb.textContent = ''; fb.classList.remove('show'); }, 5000);
    }
    if (doAlert && !ok) alertFailure(msg);
  } catch {}
};
const toggleInlineLog = () => {
  const w = $('opLogInlineWrap');
  const b = $('opLogInline');
  const t = $('inlineLogToggle');
  if (w) w.classList.toggle('open');
  if (t) t.textContent = w && w.classList.contains('open') ? '▼' : '▲';
};
const openLogModal = () => { $('logModal')?.classList.add('open'); };
const closeLogModal = () => { $('logModal')?.classList.remove('open'); };
let _alertTimer = null;
const alertFailure = (msg) => {
  try {
    const box = $('alertBox');
    if (box) box.textContent = String(msg || 'حدث خطأ غير معروف');
    $('alertModal')?.classList.add('open');
    clearTimeout(_alertTimer);
    _alertTimer = setTimeout(() => $('alertModal')?.classList.remove('open'), 6000);
  } catch {}
};
const closeAlert = () => { $('alertModal')?.classList.remove('open'); };
const confirmAsync = (title, msg, okText='نعم', requireCheck=false) => new Promise(r => {
  $('confirmTitle').textContent = title;
  $('confirmMsg').textContent = msg;
  $('confirmOk').textContent = okText;
  const wrap = $('confirmCheckWrap');
  const chk = $('confirmCheck');
  const okBtn = $('confirmOk');
  if (requireCheck && wrap && chk) {
    wrap.style.display = 'flex';
    chk.checked = false;
    okBtn.disabled = true;
    chk.onchange = () => { okBtn.disabled = !chk.checked; };
  } else {
    if (wrap) wrap.style.display = 'none';
    okBtn.disabled = false;
    if (chk) chk.onchange = null;
  }
  $('confirmDialog').classList.add('open');
  const off = () => { $('confirmCancel').onclick = null; $('confirmOk').onclick = null; if (chk) chk.onchange = null; $('confirmDialog').classList.remove('open'); okBtn.disabled = false; };
  $('confirmCancel').onclick = () => { off(); r(false); };
  $('confirmOk').onclick = () => { if (requireCheck && chk && !chk.checked) return; off(); r(true); };
});
const promptModal = {
  resolve: null,
  open(title, defaultValue='') {
    $('promptTitle').textContent = title;
    const inp = $('promptInput');
    inp.value = defaultValue;
    $('promptModal').classList.add('open');
    setTimeout(() => { inp.focus(); inp.select(); }, 50);
    return new Promise(res => { this.resolve = res; });
  },
  ok() {
    const v = $('promptInput').value;
    const r = this.resolve;
    this.resolve = null;
    $('promptModal').classList.remove('open');
    if (r) r(v);
  },
  close() {
    const r = this.resolve;
    this.resolve = null;
    $('promptModal').classList.remove('open');
    if (r) r(null);
  }
};
const discountModal = {
  type: 'percent',
  resolve: null,
  open(type='percent') {
    this.type = type;
    $('discountTitle').textContent = type === 'percent' ? 'إضافة خصم نسبة' : 'إضافة خصم سعر ثابت';
    $('discValueLabel').textContent = type === 'percent' ? 'نسبة الخصم %' : 'السعر الجديد بالدولار بعد الخصم';
    $('discValue').value = type === 'percent' ? '15' : '2.4';
    $('discQty').value = '5';
    $('discountModal').classList.add('open');
    setTimeout(() => { $('discQty').focus(); $('discQty').select(); }, 50);
    return new Promise(res => { this.resolve = res; });
  },
  ok() {
    const qty = $('discQty').value;
    const val = $('discValue').value;
    const r = this.resolve;
    this.resolve = null;
    $('discountModal').classList.remove('open');
    if (r) r({ qty, val });
  },
  close() {
    const r = this.resolve;
    this.resolve = null;
    $('discountModal').classList.remove('open');
    if (r) r(null);
  }
};
if ($('promptOk')) $('promptOk').addEventListener('click', () => promptModal.ok());
if ($('promptInput')) $('promptInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') promptModal.ok(); });
if ($('discountOk')) $('discountOk').addEventListener('click', () => discountModal.ok());
if ($('discQty')) $('discQty').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const dv = $('discValue'); if (dv) dv.focus(); } });
if ($('discValue')) $('discValue').addEventListener('keydown', (e) => { if (e.key === 'Enter') discountModal.ok(); });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* أدوات تنسيق النص: تُدرج العلامات التي يفهمها الموقع (**غامق** و RED//ملون//) */
const TextTools = {
  wrap(targetId, before, after = before) {
    const el = document.getElementById(targetId);
    if (!(el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)) return;
    const start = Number.isInteger(el.selectionStart) ? el.selectionStart : el.value.length;
    const end = Number.isInteger(el.selectionEnd) ? el.selectionEnd : start;
    const selected = el.value.slice(start, end) || 'نص';
    const inserted = String(before) + selected + String(after);
    el.value = el.value.slice(0, start) + inserted + el.value.slice(end);
    const caret = start + String(before).length;
    el.focus();
    try { el.setSelectionRange(caret, caret + selected.length); } catch {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
};
window.TextTools = TextTools;
const nf = (n) => { const v = Number(n); if(isNaN(v)) return ''; return (Math.round(v*100)/100).toFixed(2).replace(/\.00$/,''); };

/* ---- Monochrome SVG icons (fixed single color = currentColor) ---- */
const ICONS = {
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>'
};
const ico = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const NO_IMG_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="12" fill="#94a3b8" font-family="Arial">لا صورة</text></svg>`);
window.NO_IMG_SVG = NO_IMG_SVG;
const PHOTO_SUBDIRS = [
  '',
  'BATT-LI','add','bike-battery','bms','electroincs','electroincs/cells','eva','inverter','our-prod',
  'qiachip','qiachip/home-smart-eq','qiachip/power-supply','qiachip/reciver-remote','qiachip/remote-a','qiachip/remote-b','qiachip/wifi-qiachip',
  'sensor-smart','smart-home-wifi','wifi-smart-home'
];
const PHOTO_EXTS = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];
function genPhotoCandidates(code, photoField, idx=0) {
  const list = [];
  const photoNames = String(photoField || '').split(',').map(s => s.trim()).filter(Boolean);
  const targetName = photoNames[idx] || (idx === 0 ? code : `${code}-${idx}`);
  if (photoNames[idx]) {
    const hasExt = PHOTO_EXTS.some(e => photoNames[idx].toLowerCase().endsWith(e));
    for (const sub of PHOTO_SUBDIRS) {
      if (hasExt) list.push(sub ? `../photo/${sub}/${photoNames[idx]}` : `../photo/${photoNames[idx]}`);
      else for (const ext of PHOTO_EXTS) list.push(sub ? `../photo/${sub}/${photoNames[idx]}${ext}` : `../photo/${photoNames[idx]}${ext}`);
    }
  }
  const base = idx === 0 ? code : `${code}-${idx}`;
  for (const sub of PHOTO_SUBDIRS) {
    for (const ext of PHOTO_EXTS) {
      const p = sub ? `../photo/${sub}/${base}${ext}` : `../photo/${base}${ext}`;
      if (!list.includes(p)) list.push(p);
    }
  }
  // صورة ثانوية -1 تُستخدم كبديل تلقائي عند غياب الأصلية
  if (idx === 0 && code) {
    const secBase = `${code}-1`;
    for (const sub of PHOTO_SUBDIRS) {
      for (const ext of PHOTO_EXTS) {
        const p = sub ? `../photo/${sub}/${secBase}${ext}` : `../photo/${secBase}${ext}`;
        if (!list.includes(p)) list.push(p);
      }
    }
  }
  // photo/files.txt index: finds photos in any subfolder (including older uploads)
  try {
    const mp = App.photoIndexMap;
    if (mp instanceof Map && mp.size) {
      const lookups = [String(code || '').toLowerCase(), String(targetName || '').toLowerCase(), `${String(code || '').toLowerCase()}-1`, `${String(targetName || '').toLowerCase()}-1`];
      for (const k of lookups) {
        const arr = k ? mp.get(k) : null;
        if (!Array.isArray(arr)) continue;
        for (const rel of arr) {
          const local = '../' + rel;
          if (!list.includes(local)) list.push(local);
          const cfg2 = GH.getCfg();
          const parts2 = String(cfg2.repo || '').split('/');
          if (parts2.length >= 2) {
            const raw = `https://raw.githubusercontent.com/${encodeURIComponent(parts2[0])}/${encodeURIComponent(parts2[1])}/${encodeURIComponent(cfg2.branch || 'main')}/${rel}`;
            if (!list.includes(raw)) list.push(raw);
          }
        }
      }
    }
  } catch {}
  // GitHub raw fallback: shows photos stored in the repo even when running locally
  try {
    const cfg = GH.getCfg();
    const parts = String(cfg.repo || '').split('/');
    if (parts.length >= 2) {
      const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}/${encodeURIComponent(cfg.branch || 'main')}`;
      const snapshot = list.slice();
      for (const p of snapshot) {
        const rel = String(p).replace(/^\.\.\//, '');
        const raw = rel ? `${rawBase}/${rel}` : '';
        if (raw && !list.includes(raw)) list.push(raw);
      }
    }
  } catch {}
  return list;
}
window.__adminImgFallback = function(img) {
  try {
    if (!(img instanceof HTMLImageElement)) return;
    const raw = img.getAttribute('data-src-list');
    const list = raw ? JSON.parse(raw) : [];
    const idx = Number(img.getAttribute('data-src-idx') || '0');
    if (!Array.isArray(list) || list.length === 0 || idx >= list.length - 1) { img.onerror = null; img.src = NO_IMG_SVG; return; }
    img.setAttribute('data-src-idx', String(idx + 1));
    img.src = String(list[idx + 1]);
  } catch { img.onerror = null; img.src = NO_IMG_SVG; }
};
function normalizeProduct(p) {
  if (!p) return {};
  const n = {};
  Object.keys(p).forEach(k => {
    const nk = String(k).replace(/^\uFEFF/, '').trim().toLowerCase();
    let v = p[k];
    if (typeof v === 'string') { v = v.replace(/^\uFEFF/, ''); }
    n[nk] = v;
  });
  n.code = String(n.code || '').trim();
  n.name = String(n.name || '').trim();
  n.about1 = String(n.about1 || '').trim();
  n.about2 = String(n.about2 || '').trim();
  n.photo = String(n.photo || '').trim();
  n.dis = String(n.dis || '').trim().replace(/\r?\n/g, ', ');
  n.h = (n.h === '' || n.h == null) ? '' : (Number(n.h) || 0);
  n.p = (n.p === '' || n.p == null) ? '' : (Number(n.p) || 0);
  if ((!n.price || String(n.price).trim() === '') && (Number(n.h) || Number(n.p))) n.price = Number(((Number(n.h) + Number(n.p)).toFixed(2)));
  else n.price = Number(n.price) || 0;
  n.keywords = String(n.keywords || '');
  n.category = String(n.category || '');
  return n;
}
function normalizeProducts(arr) { return (arr || []).map(normalizeProduct).filter(p => p.code); }
function stripBom(s) { if (typeof s !== 'string') return ''; if (s.charCodeAt(0) === 0xFEFF) return s.slice(1); return s; }
function tryParseWithDelimiter(clean, delimiter) {
  try {
    const p = Papa.parse(clean, { header: true, skipEmptyLines: true, delimiter });
    const arr = p.data || [];
    return normalizeProducts(arr);
  } catch { return []; }
}
function smartParseCsv(raw) {
  const clean = stripBom(raw || '');
  if (!clean.trim()) return [];
  const firstLine = (clean.split(/\r?\n/)[0] || '').trim();
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const primaryDelim = semiCount >= commaCount ? ';' : ',';
  const secondaryDelim = primaryDelim === ';' ? ',' : ';';
  let products = tryParseWithDelimiter(clean, primaryDelim);
  const allCodesEmpty = products.every(p => !String(p.code || '').trim());
  if (products.length === 0 || allCodesEmpty) {
    const tryAlt = tryParseWithDelimiter(clean, secondaryDelim);
    const altCodesOk = tryAlt.length && tryAlt.some(p => String(p.code || '').trim());
    if (altCodesOk) products = tryAlt;
  }
  if (products.length && products.every(p => !String(p.name || '').trim() && !String(p.about1 || '').trim())) {
    const tryAlt = tryParseWithDelimiter(clean, secondaryDelim);
    if (tryAlt.length && tryAlt.some(p => String(p.name || '').trim())) products = tryAlt;
  }
  return products.map(p => normalizeProduct(p));
}
async function fetchTextRelatively(pathRelativeToRoot) {
  const p = String(pathRelativeToRoot || '').trim();
  if (!p) return null;
  const candidates = [];
  if (p.startsWith('../')) {
    candidates.push(p);
    candidates.push(p.replace(/^\.\.\//, ''));
  } else {
    candidates.push('../' + p);
    candidates.push('./' + p);
    candidates.push(p);
  }
  for (const url of candidates) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) return await r.text();
    } catch {}
  }
  return null;
}

/* ======================= GITHUB ======================= */
const GH = {
  getCfg() {
    return {
      token: localStorage.getItem('gh_token') || '',
      repo: localStorage.getItem('gh_repo') || '',
      branch: localStorage.getItem('gh_branch') || 'main',
    };
  },
  // Persistent settings file: admin/github-settings.json (via the local server).
  // It travels with the project folder, so nothing is lost when moving to a new PC.
  async loadFileSettings() {
    if (!LocalSync.serverUrl) return false;
    try {
      const r = await fetch(LocalSync.serverUrl + '/settings', { cache: 'no-store' });
      if (!r.ok) return false;
      const j = await r.json();
      const s = j && j.ok ? j.settings : null;
      if (!s) return false;
      if (s.token) localStorage.setItem('gh_token', String(s.token));
      if (s.repo) localStorage.setItem('gh_repo', String(s.repo));
      if (s.branch) localStorage.setItem('gh_branch', String(s.branch));
      this._fileSettingsLoaded = true;
      return true;
    } catch { return false; }
  },
  async saveFileSettings() {
    for (let i = 0; i < 10 && !LocalSync.serverUrl; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!LocalSync.serverUrl) return false;
    try {
      const r = await fetch(LocalSync.serverUrl + '/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.getCfg()),
        cache: 'no-store',
      });
      if (!r.ok) return false;
      const j = await r.json();
      return !!(j && j.ok);
    } catch { return false; }
  },
  headers(tok=this.getCfg().token) {
    const h = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (tok) h['Authorization'] = `Bearer ${tok}`;
    return h;
  },
  encPath(path) {
    return String(path).split('/').map(s => encodeURIComponent(s)).join('/');
  },
  isAuthError(status, j) {
    return status === 401 || status === 403 || (j && /bad credentials|unauthorized|authentication failed|invalid token/i.test(String(j.message || '')));
  },
  handleAuthError() {
    toast('رمز GitHub غير صالح (Bad credentials) — حدّثه من الإعدادات', false);
    log('رمز GitHub غير صالح (Bad credentials) — افتح الإعدادات وحدّث Token ثم أعد النشر', false, true);
    setTimeout(() => { try { App.openSettings(); } catch {} }, 900);
  },
  async testConnection() {
    const cfg = this.getCfg();
    if (!cfg.token || !cfg.repo) return { ok: false, msg: 'أدخل Token و Repo أولاً في الإعدادات' };
    try {
      const r = await fetch('https://api.github.com/user', { headers: this.headers(), cache: 'no-store' });
      if (!r.ok) {
        let m = 'رمز غير صالح (' + r.status + ')';
        try { const j = await r.json(); if (j && j.message) m = j.message; } catch {}
        return { ok: false, msg: m };
      }
      const u = await r.json();
      const r2 = await fetch(`https://api.github.com/repos/${cfg.repo}?ref=${cfg.branch}`, { headers: this.headers(), cache: 'no-store' });
      if (!r2.ok) return { ok: false, msg: 'لا يمكن الوصول للمستودع — تحقق من الاسم والصلاحيات' };
      const repo = await r2.json();
      return { ok: true, msg: `اتصال ناجح ✓ الحساب: ${u.login || ''} — المستودع: ${repo.full_name || cfg.repo}` };
    } catch (e) { return { ok: false, msg: 'خطأ اتصال: ' + (e.message || e) }; }
  },
  async getFileSHA(path) {
    const cfg = this.getCfg();
    if (!cfg.repo) return null;
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${this.encPath(path)}?ref=${cfg.branch}`, { headers: this.headers(), cache: 'no-store' });
      if (r.ok) { const j = await r.json(); return j.sha || null; }
      return null;
    } catch { return null; }
  },
  async putFile(path, content, message='Update file', isBinary=false) {
    const cfg = this.getCfg();
    if (!cfg.token || !cfg.repo) { toast('الرجاء تعيين إعدادات GitHub أولاً', false); return false; }
    const enc = isBinary ? content : btoa(unescape(encodeURIComponent(content)));
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const sha = await this.getFileSHA(path);
      const body = { message, branch: cfg.branch, content: enc };
      if (sha) body.sha = sha;
      try {
        const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${this.encPath(path)}`, {
          method: 'PUT', headers: this.headers(), body: JSON.stringify(body)
        });
        if (r.ok) { log('تم النشر: ' + path, true); return true; }
        const j = await r.json();
        const errMsg = (j && j.message) || r.status;
        if (r.status === 409 && attempt < maxAttempts - 1) {
          // sha changed concurrently -> wait a moment (GitHub propagation) then retry with a fresh sha
          log('تعارض (409) في ' + path + ' — إعادة المحاولة...', false);
          await new Promise(r2 => setTimeout(r2, 1300));
          continue;
        }
        if (this.isAuthError(r.status, j)) { this.handleAuthError(); return false; }
        if (r.status === 409) {
          toast('تعارض أثناء نشر ' + path + ' — الملف يتغير على GitHub الآن. يبدو أن هناك نافذة أخرى أو جهازاً ينشر حالياً. أغلق النوافذ الإضافية وأعد المحاولة.', false);
          log('فشل نشر ' + path + ' — تعارض (409) بعد المحاولات. قد يكون نشر متزامن من نافذة/جهاز آخر.', false, true);
          return false;
        }
        toast('خطأ GitHub: ' + errMsg, false);
        log('فشل نشر ' + path + ' — ' + errMsg, false, true);
        return false;
      } catch (e) {
        toast('خطأ اتصال: ' + e.message, false);
        log('فشل نشر ' + path + ' — ' + e.message, false, true);
        return false;
      }
    }
    return false;
  },
  async getFile(path) {
    const cfg = this.getCfg();
    if (!cfg.repo) return null;
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${this.encPath(path)}?ref=${cfg.branch}`, { headers: this.headers(), cache: 'no-store' });
      if (!r.ok) return null;
      const j = await r.json();
      if (!j.content) return null;
      const raw = atob(j.content.replace(/\s/g, ''));
      const dec = new TextDecoder('utf-8').decode(new Uint8Array([...raw].map(c=>c.charCodeAt(0))));
      return dec;
    } catch { return null; }
  },
  async listFilesInDir(dir) {
    const cfg = this.getCfg();
    if (!cfg.repo) return [];
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${this.encPath(dir)}?ref=${cfg.branch}`, { headers: this.headers(), cache: 'no-store' });
      if (!r.ok) return [];
      const j = await r.json();
      if (!Array.isArray(j)) return [];
      return j.filter(x => x.type === 'file').map(x => x.name);
    } catch { return []; }
  },
  async listFilesRecursive(dir, seen = {}, out = []) {
    const cfg = this.getCfg();
    if (!cfg.repo || seen[dir]) return out;
    seen[dir] = true;
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${this.encPath(dir)}?ref=${cfg.branch}`, { headers: this.headers(), cache: 'no-store' });
      if (!r.ok) return out;
      const j = await r.json();
      if (!Array.isArray(j)) return out;
      for (const it of j) {
        if (!it || typeof it !== 'object') continue;
        if (it.type === 'dir') { await this.listFilesRecursive(`${dir}/${it.name}`, seen, out); continue; }
        if (it.type === 'file' && String(it.name || '') !== 'files.txt') out.push(`${dir}/${it.name}`);
      }
    } catch {}
    return out;
  },
  async deleteFile(path) {
    const cfg = this.getCfg();
    if (!cfg.token || !cfg.repo) return false;
    const sha = await this.getFileSHA(path);
    if (!sha) return false; // not found
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${this.encPath(path)}`, {
        method: 'DELETE', headers: this.headers(),
        body: JSON.stringify({ message: `حذف ${path}`, branch: cfg.branch, sha })
      });
      if (r.ok) { log('تم حذف من GitHub: ' + path, true); return true; }
      const j = await r.json();
      if (this.isAuthError(r.status, j)) { this.handleAuthError(); return false; }
      log('فشل حذف من GitHub: ' + path + ' — ' + ((j && j.message) || r.status), false, true);
      return false;
    } catch (e) { log('فشل حذف من GitHub: ' + path + ' — ' + e.message, false, true); return false; }
  },
  async regenerateManifests() {
    const cfg = this.getCfg();
    if (!cfg.repo) return false;
    let ok = true;
    try {
      const photoList = await this.listFilesRecursive('photo');
      if (photoList.length) {
        const ok1 = await this.putFile('photo/files.txt', photoList.join('\n') + '\n', 'تحديث فهرس الصور photo/files.txt');
        if (!ok1) ok = false;
      }
    } catch { ok = false; }
    try {
      const custList = await this.listFilesRecursive('customer_photo');
      if (custList.length) {
        const ok2 = await this.putFile('customer_photo/files.txt', custList.join('\n') + '\n', 'تحديث فهرس customer_photo/files.txt');
        if (!ok2) ok = false;
      }
    } catch { ok = false; }
    try {
      const galList = await this.listFilesRecursive('gallery');
      if (galList.length) {
        const ok3 = await this.putFile('gallery/files.txt', galList.join('\n') + '\n', 'تحديث فهرس gallery/files.txt');
        if (!ok3) ok = false;
      }
    } catch { ok = false; }
    return ok;
  }
};

/* ======================= WEBP CONVERTER ======================= */
const ImgConv = {
  async toWebP(file, maxDim = 1000) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) { URL.revokeObjectURL(url); reject(new Error('صورة غير صالحة')); return; }
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        try { ctx.drawImage(img, 0, 0, w, h); } catch { URL.revokeObjectURL(url); reject(new Error('صورة غير صالحة')); return; }
        URL.revokeObjectURL(url);
        const attempt = (quality, onDone) => {
          canvas.toBlob((blob) => {
            if (blob && blob.size > 0) onDone(blob);
            else onDone(null);
          }, 'image/webp', quality);
        };
        attempt(0.8, (b1) => {
          if (b1) return resolve(b1);
          attempt(0.65, (b2) => {
            if (b2) return resolve(b2);
            reject(new Error('فشل تحويل الصورة'));
          });
        });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('صورة غير صالحة')); };
      img.src = url;
    });
  },
  blobToBase64(blob) {
    return new Promise(r => {
      const r2 = new FileReader();
      r2.onload = () => r(r2.result.split(',')[1]);
      r2.readAsDataURL(blob);
    });
  }
};

/* ======================= APP STATE ======================= */
const App = {
  products: [],       // loaded products from selected CSV
  categories: [],     // array of cols: { name: string, codes: string[], fixed?: boolean }
  mainCats: [],       // array of { name, subs: [{ name, codes: [] }] } from SubcategoriesA/B
  currentCsv: '',
  currentCsvBasename: '',
  pendingPhotos: [],  // { name, base64, blob }
  photoUploads: [],   // pending GitHub uploads: { path, base64 }
  photoDeletions: [], // pending photo deletions: [ 'photo/X.webp', ... ]
  fileDeletions: [],  // pending arbitrary file deletions: [ 'about/x.txt', 'QA/y.txt', ... ]
  photoIndexMap: null, // basename(lower) -> photo paths from photo/files.txt
  dirtyCount: 0,      // number of unpublished local edits
  csvFiles: [],       // list of CSV basenames in data-csv
  remoteOnlyCsvFiles: new Set(), // CSV موجود على GitHub فقط (لا يوجد محلياً)
  csvStats: {},       // basename -> { count, loaded }
  globalIndex: null,  // Map lower(code) -> { code, name, price, about1, photo, csv }
  otherCsvDrafts: {}, // path -> csv text for CSVs modified by move/copy (pending publish)
  currentCsvDirty: false, // true when the currently-open CSV's products were edited
  categoriesDirty: false, // true only when categories.csv was actually changed
  subcatsDirty: false,    // true only when SubcategoriesA/B.csv were actually changed

  /* ---- durable local drafts (all unpublished edits survive reload / app restart) ---- */
  _pendingPersistKey: 'hjy_pending_v2',
  _persistTimer: null,
  _persistFailed: false,   // true when photo queue could not be persisted (storage quota)
  _restoredPending: false, // a previous session's drafts were loaded on boot
  _catsLoaded: false,      // categories.csv parsed into this.categories at least once
  _subcatsLoaded: false,   // SubcategoriesA/B parsed into this.mainCats at least once
  _catsPromise: null,
  _subcatsPromise: null,

  collectPhotosForCode(code, photoField) {
    const paths = [];
    const names = [code];
    if (photoField) String(photoField).split(',').map(s => s.trim()).filter(Boolean).forEach(n => { if (!names.includes(n)) names.push(n); });
    if (this.photoIndexMap instanceof Map && this.photoIndexMap.size) {
      for (const n of names) {
        const arr = this.photoIndexMap.get(String(n).toLowerCase());
        if (Array.isArray(arr)) for (const p of arr) if (!paths.includes(p)) paths.push(p);
      }
    }
    return paths;
  },

  /* ---------- CSV FILES LIST ---------- */
  async refreshCsvList() {
    const seen = new Set();
    const localCsv = new Set();
    const add = (list) => {
      (Array.isArray(list) ? list : []).forEach(f => {
        let n = String(f || '').trim();
        if (!n) return;
        // skip files that clearly are NOT csv (e.g. CV.bat, files.txt, photos)
        if (/\.[^./\\]+$/.test(n) && !/\.csv$/i.test(n)) return;
        if (!/\.csv$/i.test(n)) n += '.csv';
        seen.add(n);
      });
    };
    // 1) authoritative local listing from the local server (catches manual renames/additions)
    try {
      const url = LocalSync.serverUrl || '';
      if (url) {
        const r = await fetch(url + '/list', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dir: 'data-csv' }), cache: 'no-store'
        });
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j.files)) {
            add(j.files);
            for (const f of j.files) localCsv.add(String(f || '').trim().toLowerCase());
          }
        }
      }
    } catch {}
    // 2) the files.txt index (محلي؛ يُستخدم أيضاً لتمييز ملفات GitHub فقط)
    const idx = await fetchTextRelatively('data-csv/files.txt');
    if (idx) {
      const lines = idx.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      add(lines);
      for (const f of lines) localCsv.add(f.toLowerCase());
    }
    // 3) the actual GitHub directory (catches files pushed to GitHub)
    const ghList = await GH.listFilesInDir('data-csv');
    add(ghList);
    // ملفات موجودة على GitHub فقط: لا نطلبها من الخادم المحلي حتى لا تولّد 404
    this.remoteOnlyCsvFiles = localCsv.size
      ? new Set(
          (Array.isArray(ghList) ? ghList : [])
            .map((f) => String(f || '').trim().toLowerCase())
            .filter((f) => f.endsWith('.csv') && !localCsv.has(f))
        )
      : new Set();
    // fallback if nothing found
    if (!seen.size) {
      ['cell-bms.csv','add.csv','aurd-elec.csv','e-bike-battery.csv','eva-prod.csv','hjy-code-remote-rx.csv','inverter.csv','our-prod.csv','qiachip-home-smart-eq.csv','remote-B.csv','rx.csv','smart-home-wifi.csv','smart-sensor-home.csv','solar-battery.csv','wifi-qiachip.csv','remote-A.csv','batt-acc.csv','home-smart-eq.csv','bike-charger.csv'].forEach(f => seen.add(f));
    }
    this.csvFiles = Array.from(seen).sort();
    this.populateCsvSelector();
    CsvSidebar.render();
    ProductData.refresh();
  },

  loadCsvByName(el) {
    const name = el && el.dataset ? el.dataset.basename : null;
    if (name) this.loadCsv('data-csv/' + name);
  },

  async getCsvText(path) {
    if (this.otherCsvDrafts && this.otherCsvDrafts[path]) return this.otherCsvDrafts[path];
    const base = String(path || '').split('/').pop().toLowerCase();
    if (String(path || '').startsWith('data-csv/') && this.remoteOnlyCsvFiles instanceof Set && this.remoteOnlyCsvFiles.has(base)) {
      // موجود على GitHub فقط — تجنب طلب محلي سيفشل بـ 404
      return await GH.getFile(path);
    }
    let raw = await fetchTextRelatively(path);
    if (raw == null) raw = await GH.getFile(path);
    return raw;
  },

  /* Build a global code -> product index across ALL CSVs + refresh counts */
  async buildGlobalIndex() {
    const map = new Map();
    const stats = {};
    for (const f of (this.csvFiles || [])) {
      let raw = null;
      try { raw = await this.getCsvText('data-csv/' + f); } catch {}
      let count = 0;
      if (raw) {
        const prods = smartParseCsv(raw);
        count = prods.length;
        for (const p of prods) {
          const code = String(p.code || '').trim();
          if (!code) continue;
          const lower = code.toLowerCase();
          if (!map.has(lower)) map.set(lower, { code, name: p.name || '', price: p.price, about1: p.about1 || '', photo: p.photo || '', csv: f });
        }
      }
      stats[f] = { count, loaded: true };
    }
    this.globalIndex = map;
    this.csvStats = stats;
    return map;
  },

  /* ---------- PHOTO MANIFEST SYNC ---------- */
  async syncPhotoManifests() {
    let ok = true;
    try { ok = await GH.regenerateManifests(); } catch { ok = false; }
    if (LocalSync.isActive()) {
      try { const mf = await GH.getFile('photo/files.txt'); if (mf != null) await LocalSync.writeText('photo/files.txt', mf); } catch {}
      try { const cf = await GH.getFile('customer_photo/files.txt'); if (cf != null) await LocalSync.writeText('customer_photo/files.txt', cf); } catch {}
      try { const gf = await GH.getFile('gallery/files.txt'); if (gf != null) await LocalSync.writeText('gallery/files.txt', gf); } catch {}
    }
    return ok;
  },

  /* ---------- UPDATE data-csv/files.txt INDEX ---------- */
  async updateCsvIndex(basename, mode) {
    let idx = await fetchTextRelatively('data-csv/files.txt');
    if (!idx) idx = await GH.getFile('data-csv/files.txt');
    if (idx == null) idx = this.csvFiles.join('\n') + '\n';
    let lines = idx.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (mode === 'add') { if (!lines.includes(basename)) lines.push(basename); }
    else if (mode === 'remove') { lines = lines.filter(l => l !== basename); }
    const txt = lines.join('\n') + '\n';
    const ok = await GH.putFile('data-csv/files.txt', txt, `تحديث فهرس الملفات (${mode}: ${basename})`);
    if (LocalSync.isActive()) await LocalSync.writeText('data-csv/files.txt', txt);
    return ok;
  },

  /* ---------- DELETE CSV FILE (local + GitHub + unique photos) ---------- */
  async deleteCsv(basename) {
    if (!basename) return;
    const path = 'data-csv/' + basename;
    const isCurrent = this.currentCsvBasename === basename;
    toast('جارٍ فحص الملف والصور المرتبطة...');
    const uniquePhotos = await this.computeUniquePhotosForCsv(basename);
    const msg =
      `سيتم حذف الملف ${basename} من مجلد المشروع المحلي ومن مستودع GitHub.` +
      (uniquePhotos.length
        ? `\nكما سيتم حذف ${uniquePhotos.length} صورة لا يستخدمها أي ملف آخر:\n${uniquePhotos.slice(0, 12).map(x => '• ' + x).join('\n')}${uniquePhotos.length > 12 ? `\n• و ${uniquePhotos.length - 12} أخرى...` : ''}`
        : '\nلن يتم حذف أي صورة (جميع صوره مشتركة مع ملفات أخرى).') +
      `\n\nهل أنت متأكد من الحذف؟`;
    const ok = await confirmAsync('حذف ملف CSV', msg, 'نعم، احذف', true);
    if (!ok) return;
    toast('جاري حذف الملف والصور...');
    for (const ph of uniquePhotos) {
      await GH.deleteFile(ph);
      if (LocalSync.isActive()) await LocalSync.deleteFile(ph);
    }
    await GH.deleteFile(path);
    if (LocalSync.isActive()) await LocalSync.deleteFile(path);
    await this.updateCsvIndex(basename, 'remove');
    if (uniquePhotos.length) await this.syncPhotoManifests();
    delete this.otherCsvDrafts[path];
    this.persistPendingNow();
    if (isCurrent) {
      this.currentCsv = ''; this.currentCsvBasename = '';
      this.products = [];
      $('workspace').classList.add('hidden');
      $('welcomeState').classList.remove('hidden');
    }
    await this.refreshCsvList();
    const sel = $('csvSelector');
    if (sel) sel.value = this.currentCsv || '';
    toast(`تم حذف ${basename}` + (uniquePhotos.length ? ` و ${uniquePhotos.length} صورة` : ''));
    log(`تم حذف ملف ${basename}` + (uniquePhotos.length ? ` و ${uniquePhotos.length} صورة` : ''), true);
  },

  /* Uses cached globalIndex + categories (fast, no re-fetching every CSV) */
  async computeUniquePhotosForCsv(basename) {
    if (this.photoIndexMap == null) await this.loadPhotoIndex();
    if (!this.globalIndex) await this.buildGlobalIndex();
    if (!this.categories || !this.categories.some(c => c.name === 'رائج')) {
      try { await this.ensureCategories(); } catch {}
    }
    const exact = new Set();
    const prefixes = [];
    for (const [, p] of this.globalIndex) {
      if (p.csv === basename) continue;
      const code = String(p.code || '').trim().toLowerCase();
      if (code) { exact.add(code); prefixes.push(code); }
      String(p.photo || '').split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
        const k = n.replace(/\.[^./]+$/, '').toLowerCase();
        if (k) exact.add(k);
      });
    }
    for (const col of (this.categories || [])) for (const c of (col.codes || [])) {
      const ck = String(c).replace(/\.[^./]+$/, '').toLowerCase();
      if (ck && ck.length >= 2 && !/^\d+(\.\d+)?$/.test(ck)) exact.add(ck);
    }
    const isUsed = (key) => {
      if (exact.has(key)) return true;
      for (const pre of prefixes) {
        if (key === pre) return true;
        if (key.startsWith(pre + '-') && /^\d+$/.test(key.slice(pre.length + 1))) return true;
      }
      return false;
    };
    let prods = [];
    try {
      const raw = await this.getCsvText('data-csv/' + basename);
      if (raw) prods = smartParseCsv(raw);
    } catch {}
    const unique = [];
    for (const p of prods) {
      const code = String(p.code || '').trim();
      if (!code) continue;
      const names = [code];
      String(p.photo || '').split(',').map(s => s.trim()).filter(Boolean).forEach(n => { if (!names.includes(n)) names.push(n); });
      for (const nm of names) {
        const key = nm.replace(/\.[^./]+$/, '').toLowerCase();
        if (!key || isUsed(key)) continue;
        const arr = this.photoIndexMap instanceof Map ? this.photoIndexMap.get(key) : null;
        if (Array.isArray(arr)) for (const ph of arr) if (!unique.includes(ph)) unique.push(ph);
      }
    }
    return unique;
  },

  hasProductsUI() { return !!document.getElementById('workspace'); },

  init() {
    this.loadSettings();
    this.applyFontSize(localStorage.getItem('hjy_admin_font') || 'md');
    // restore drafts from a previous session (survives closing/reopening the app)
    const restored = this.restorePending();
    Sidebar.init();
    if (this.hasProductsUI()) {
      this.refreshCsvList().then(async () => {
        try {
          await this.ensureCategories();
          await this.ensureSubcategories();
          // re-open the file that had staged edits so the user sees them immediately
          if (this.currentCsv && this.otherCsvDrafts[this.currentCsv]) {
            await this.loadCsv(this.currentCsv);
          }
        } catch {}
        try { CatView.refresh(); } catch {}
      });
      this.loadPhotoIndex();
    }
    LocalSync.init();
    Products.applyPricesVisibility();
    Products.applyDensity();
    Sidebar.updateDefaultUI();
    this._setupInstall();
    if (restored) {
      setTimeout(() => {
        this._applyPublishState();
        toast('تم استرجاع تعديلات محلية غير منشورة من جلسة سابقة', true);
      }, 300);
    }
    // data is persisted to localStorage on every edit -> reload is safe. Warn only
    // when queued photos could not be persisted (would be lost on reload).
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty()) {
        this.persistPendingNow();
        if (this._persistFailed) { e.preventDefault(); e.returnValue = ''; }
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const s = $('searchInput');
        if (s) { s.focus(); s.select(); }
      }
    });
    // warn when another tab/window is publishing (prevents 409 conflicts)
    try {
      this._bc = new BroadcastChannel('hjy_admin_publish');
      this._bc.onmessage = (e) => {
        if (e.data === 'publishing') toast('جاري النشر في نافذة أخرى — انتظر حتى ينتهي قبل النشر هنا', false);
      };
    } catch {}
  },

  markDirty() {
    if (this.dirtyCount < 1) this.dirtyCount = 1;
    try { this.stageDerivedFiles(); } catch (e) { console.error('stageDerivedFiles:', e); }
    this._persistPendingSoon();
    this._applyPublishState();
  },
  resetDirty() {
    this.dirtyCount = 0;
    this._applyPublishState();
  },

  /* ---------- DURABLE LOCAL STAGING (edit now, publish everything later) ---------- */
  // Every unpublished edit is captured as a file draft (path -> full text) in
  // this.otherCsvDrafts and mirrored to localStorage so it survives navigating
  // between files/sections AND closing/reopening the admin page. "نشر التعديلات"
  // then pushes all staged drafts to GitHub in one click.
  stageDerivedFiles() {
    // snapshot the currently-open products CSV whenever its rows are dirty
    if (this.currentCsv && this.currentCsvDirty) {
      this.otherCsvDrafts[this.currentCsv] = this.buildCsvFromProducts();
    }
    // keep category edits (categories.csv) as a staged draft ONLY when they changed
    if (this.categoriesDirty && this.categories && this.categories.length) {
      this.otherCsvDrafts['data/categories.csv'] = Categories.toCSV();
    }
    // keep subcategory edits (SubcategoriesA/B) as staged drafts ONLY when they changed
    if (this.subcatsDirty && this.mainCats && this.mainCats.length) {
      const subFiles = this.buildSubcategoryFiles();
      this.otherCsvDrafts['data/SubcategoriesA.csv'] = subFiles.A;
      this.otherCsvDrafts['data/SubcategoriesB.csv'] = subFiles.B;
    }
  },
  pendingCount() {
    return Object.keys(this.otherCsvDrafts || {}).length +
      ((this.photoUploads && this.photoUploads.length) ? 1 : 0) +
      ((this.photoDeletions && this.photoDeletions.length) ? 1 : 0) +
      ((this.fileDeletions && this.fileDeletions.length) ? 1 : 0) +
      (this._pendingRename ? 1 : 0);
  },
  _persistPendingSoon() {
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => { this._persistTimer = null; this.persistPendingNow(); }, 400);
  },
  persistPendingNow() {
    try {
      const payload = {
        v: 2, savedAt: Date.now(),
        currentCsv: this.currentCsv || '',
        drafts: this.otherCsvDrafts || {},
        photoUploads: (this.photoUploads || []).map(p => ({ path: p.path, base64: p.base64 })),
        photoDeletions: (this.photoDeletions || []).slice(),
        fileDeletions: (this.fileDeletions || []).slice(),
        pendingRename: this._pendingRename || null
      };
      localStorage.setItem(this._pendingPersistKey, JSON.stringify(payload));
      this._persistFailed = false;
    } catch (e) {
      // quota exceeded (usually a big queued photo) -> store drafts only, keep photos in RAM
      try {
        const payload = {
          v: 2, savedAt: Date.now(),
          currentCsv: this.currentCsv || '',
          drafts: this.otherCsvDrafts || {},
          photoUploads: [], photoDeletions: (this.photoDeletions || []).slice(),
          fileDeletions: (this.fileDeletions || []).slice(),
          pendingRename: this._pendingRename || null, photosOmitted: true
        };
        localStorage.setItem(this._pendingPersistKey, JSON.stringify(payload));
        this._persistFailed = (this.photoUploads || []).length > 0;
      } catch (e2) {
        this._persistFailed = true;
      }
    }
  },
  restorePending() {
    try {
      const raw = localStorage.getItem(this._pendingPersistKey);
      if (!raw) return 0;
      const p = JSON.parse(raw);
      if (!p || p.v !== 2) return 0;
      this.otherCsvDrafts = (p.drafts && typeof p.drafts === 'object') ? p.drafts : {};
      this.photoUploads = Array.isArray(p.photoUploads) ? p.photoUploads.filter(x => x && x.path) : [];
      this.photoDeletions = Array.isArray(p.photoDeletions) ? p.photoDeletions : [];
      this.fileDeletions = Array.isArray(p.fileDeletions) ? p.fileDeletions : [];
      this._pendingRename = p.pendingRename || null;
      this.dirtyCount = Object.keys(this.otherCsvDrafts).length ? 1 : 0;
      this._persistFailed = !!p.photosOmitted && this.photoUploads.length > 0;
      this._restoredPending = this.pendingCount() > 0;
      if (p.currentCsv && this.otherCsvDrafts[p.currentCsv]) {
        this.currentCsv = p.currentCsv;
        this.currentCsvBasename = String(p.currentCsv).split('/').pop();
      }
      return this.pendingCount();
    } catch { return 0; }
  },
  clearPendingLocal() {
    this._pendingRename = null;
    try { localStorage.removeItem(this._pendingPersistKey); } catch {}
  },
  _applyPublishState() {
    const b = $('saveAllBtn');
    const badge = $('publishBadge');
    const total = this.pendingCount() || this.dirtyCount;
    if (b) { b.disabled = total === 0; if (badge) badge.textContent = total ? String(total) : ''; }
    this.updatePendingBanner();
  },
  updatePendingBanner() {
    const b = $('pendingBanner');
    if (!b) return;
    const count = Object.keys(this.otherCsvDrafts || {}).length;
    const photoN = (this.photoUploads || []).length;
    const delN = (this.photoDeletions || []).length;
    const fileDelN = (this.fileDeletions || []).length;
    const renameN = this._pendingRename ? 1 : 0;
    if (!count && !photoN && !delN && !fileDelN && !renameN) { b.classList.add('hidden'); return; }
    const parts = [];
    if (count) parts.push(`${count} ملف`);
    if (photoN) parts.push(`${photoN} صورة جديدة`);
    if (delN) parts.push(`حذف ${delN} صورة`);
    if (fileDelN) parts.push(`حذف ${fileDelN} ملف`);
    if (renameN) parts.push('إعادة تسمية ملف');
    const el = b.querySelector('.pending-banner-txt');
    if (el) {
      el.textContent = this._restoredPending
        ? `تم استرجاع تعديلاتك المحلية من الجلسة السابقة (${parts.join('، ')}) — اضغط "نشر التعديلات" لرفعها كلها دفعة واحدة للجميع.`
        : `لديك تعديلات محلية غير منشورة (${parts.join('، ')}) — تُحفظ تلقائياً حتى بعد إغلاق الصفحة. اضغط "نشر التعديلات" لرفعها للجميع.`;
    }
    b.classList.remove('hidden');
  },
  async discardPendingLocal() {
    const n = this.pendingCount();
    if (!n) { toast('لا توجد تعديلات محلية لتجاهلها', false); return; }
    const ok = await confirmAsync('تجاهل التعديلات المحلية', `سيتم حذف التعديلات المحلية غير المنشورة نهائياً (${n} معلّقة) ولن تُرفع إلى GitHub.\n\nلا يمكن التراجع. هل تريد المتابعة؟`, 'نعم، تجاهل الكل', true);
    if (!ok) return;
    this.otherCsvDrafts = {};
    this.photoUploads = [];
    this.photoDeletions = [];
    this.fileDeletions = [];
    this._pendingRename = null;
    this.currentCsvDirty = false;
    this.categoriesDirty = false;
    this.subcatsDirty = false;
    this._restoredPending = false;
    this.clearPendingLocal();
    this.resetDirty();
    if (this.currentCsv) { try { await this.loadCsv(this.currentCsv); } catch {} }
    try { CatView.refresh(); } catch {}
    toast('تم تجاهل التعديلات المحلية');
    log('تم تجاهل كل التعديلات المحلية غير المنشورة', true);
  },

  /* ---- load-once helpers (so navigation never re-fetches over pending edits) ---- */
  ensureCategories() {
    if (this._catsLoaded) return Promise.resolve(this.categories);
    if (!this._catsPromise) {
      this._catsPromise = this.loadCategories()
        .then(() => { this._catsLoaded = true; this._catsPromise = null; })
        .catch(() => { this._catsPromise = null; });
    }
    return this._catsPromise;
  },
  ensureSubcategories() {
    if (this._subcatsLoaded) return Promise.resolve(this.mainCats);
    if (!this._subcatsPromise) {
      this._subcatsPromise = this.loadSubcategories()
        .then(() => { this._subcatsLoaded = true; this._subcatsPromise = null; })
        .catch(() => { this._subcatsPromise = null; });
    }
    return this._subcatsPromise;
  },

  async loadPhotoIndex() {
    if (this.photoIndexMap) return;
    let raw = await fetchTextRelatively('photo/files.txt');
    if (!raw) raw = await GH.getFile('photo/files.txt');
    const map = new Map();
    if (raw) {
      const lines = String(raw).split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
      for (const line of lines) {
        const p = String(line).replace(/\\/g, '/').replace(/^\/+/, '');
        const base = p.split('/').pop() || '';
        const key = String(base).toLowerCase().replace(/\.[^./]+$/, '');
        if (!key) continue;
        const arr = map.get(key) || [];
        arr.push(p);
        map.set(key, arr);
      }
    }
    this.photoIndexMap = map;
  },

  isDirty() {
    return this.dirtyCount > 0 || this.pendingCount() > 0;
  },

  fillSettingsInputs() {
    const c = GH.getCfg();
    const t = $('s_token'); if (t) t.value = c.token;
    const r = $('s_repo'); if (r) r.value = c.repo;
    const b = $('s_branch'); if (b) b.value = c.branch;
  },

  loadSettings() {
    this.fillSettingsInputs();
    this._loadSettingsFromSources();
  },

  async _loadSettingsFromSources() {
    const fromFile = await GH.loadFileSettings();
    if (!fromFile) await this.tryAutoLoadToken();
    this.fillSettingsInputs();
  },

  async tryAutoLoadToken() {
    if (GH._fileSettingsLoaded) return;
    try {
      const raw = await fetchTextRelatively('token-github.txt');
      if (raw) {
        const t = String(raw).trim();
        if (t && /^[A-Za-z0-9_]{20,}$/.test(t) && !GH._fileSettingsLoaded) {
          if (localStorage.getItem('gh_token') !== t) {
            localStorage.setItem('gh_token', t);
            if ($('s_token')) $('s_token').value = t;
            log('تم تحديث رمز GitHub تلقائياً من token-github.txt ✓', true);
          }
        }
      }
    } catch {}
  },

  async importTokenFromFile() {
    const raw = await fetchTextRelatively('token-github.txt');
    if (!raw) { toast('تعذر قراءة token-github.txt — شغّل الخادم المحلي', false); return; }
    const t = String(raw).trim();
    if (!t) { toast('الملف فارغ', false); return; }
    $('s_token').value = t;
    toast('تم استيراد الرمز من الملف — اضغط حفظ الإعدادات');
  },
  openSettings() { $('settingsModal').classList.add('open'); this.loadSettings(); this.applyFontSize(localStorage.getItem('hjy_admin_font') || 'md', true); Products.applyDensity(); Products.updatePricesToggleUI(); Sidebar.updateDefaultUI(); },
  closeSettings() { $('settingsModal').classList.remove('open'); try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {} },

  /* ---------- INSTALL AS PWA APP (opens outside the browser) ---------- */
  _setupInstall() {
    try {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window._hjyInstallPrompt = e;
        const ib = $('installAppBtn');
        if (ib && !window.matchMedia('(display-mode: standalone)').matches) ib.style.display = 'inline-flex';
      });
      window.addEventListener('appinstalled', () => {
        window._hjyInstallPrompt = null;
        const ib = $('installAppBtn');
        if (ib) ib.style.display = 'none';
        toast('تم تثبيت التطبيق بنجاح ✓ — ستجده الآن في قائمة ابدأ وسطح المكتب');
      });
    } catch {}
  },
  async installAsApp() {
    const promptEvt = window._hjyInstallPrompt;
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) { toast('التطبيق يعمل الآن كنافذة مستقلة ✓'); return; }
    if (promptEvt && promptEvt.prompt) {
      try {
        promptEvt.prompt();
        await promptEvt.userChoice;
        window._hjyInstallPrompt = null;
        const ib = $('installAppBtn');
        if (ib) ib.style.display = 'none';
      } catch {}
      return;
    }
    // PWA install not available yet (e.g. needs a secure context / first visit)
    const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
    if (!secure) {
      toast('لتفعيل التثبيت افتح اللوحة عبر https أو الخادم المحلي (admin\\start_admin.bat)', false);
      return;
    }
    alertFailure('ظهور زر "تثبيت" يتطلب أن تزور اللوحة عبر خادم محلي أو https.\n\nمن متصفح Chrome/Edge: اضغط أيقونة التثبيت (⤓) في شريط العنوان، أو من القائمة ⋮ → تثبيت التطبيق → تثبيت.\n\nبعد التثبيت ستفتح اللوحة كنافذة تطبيق مستقلة من سطح المكتب أو قائمة ابدأ.');
  },
  async saveSettings() {
    localStorage.setItem('gh_token', $('s_token').value.trim());
    localStorage.setItem('gh_repo', $('s_repo').value.trim());
    localStorage.setItem('gh_branch', $('s_branch').value.trim());
    const saved = await GH.saveFileSettings();
    toast(saved ? 'تم حفظ الإعدادات داخل مجلد المشروع ✓' : 'تم حفظ الإعدادات في المتصفح');
    this.closeSettings();
    this.populateCsvSelector();
  },

  async testGithubConnection() {
    localStorage.setItem('gh_token', $('s_token').value.trim());
    localStorage.setItem('gh_repo', $('s_repo').value.trim());
    localStorage.setItem('gh_branch', $('s_branch').value.trim());
    await GH.saveFileSettings();
    const box = $('githubTestResult');
    if (box) { box.textContent = 'جارٍ فحص الاتصال...'; box.style.color = '#475569'; }
    const res = await GH.testConnection();
    if (box) {
      box.textContent = res.msg;
      box.style.color = res.ok ? '#047857' : '#b91c1c';
    }
    log(res.msg, res.ok);
  },

  applyFontSize(size, highlightOnly=false) {
    const root = document.documentElement;
    root.classList.remove('font-sm', 'font-md', 'font-lg');
    root.classList.add('font-' + size);
    ['sm','md','lg'].forEach(s => {
      const b = $('fs-' + s);
      if (b) {
        b.classList.remove('border-primary', 'bg-sky-50');
        if (s === size) b.classList.add('border-primary', 'bg-sky-50');
      }
    });
    if (!highlightOnly) localStorage.setItem('hjy_admin_font', size);
  },
  setFontSize(size) { this.applyFontSize(size); },

  async populateCsvSelector() {
    const sel = $('csvSelector');
    if (!sel) return;
    const files = (this.csvFiles && this.csvFiles.length) ? this.csvFiles : [];
    sel.innerHTML = '<option value="">-- اختر ملف المنتجات CSV للبدء --</option>' +
      files.map(f => `<option value="data-csv/${f}">${esc(f)}</option>`).join('');
    if (this.currentCsv) sel.value = this.currentCsv;
    const prevVal = sel.value;
    sel.onclick = () => { sel.dataset.prev = sel.value; };
    sel.onchange = () => {
      const nv = sel.value;
      if (!nv && sel.dataset.prev) { sel.value = sel.dataset.prev; return; }
      if (nv === sel.dataset.prev && nv) { this.loadCsv(nv); return; }
      this.loadCsv(nv);
    };
  },

  async reloadCurrentCsv() {
    if (!this.currentCsv) { toast('اختر ملفاً أولاً', false); return; }
    // If this file has staged (unpublished) local edits, reloading from the source
    // discards ONLY those edits for this file.
    if (this.otherCsvDrafts && this.otherCsvDrafts[this.currentCsv]) {
      const ok = await confirmAsync('إعادة تحميل من المصدر',
        'يوجد تعديلات محلية غير منشورة لهذا الملف. إعادة التحميل ستتجاهل تعديلات هذا الملف فقط (تبقى باقي تعديلاتك كما هي).\n\nهل تريد المتابعة؟',
        'نعم، تجاهل محلي هذا الملف');
      if (!ok) return;
      delete this.otherCsvDrafts[this.currentCsv];
      this.currentCsvDirty = false;
      this.persistPendingNow();
    }
    toast('جاري إعادة تحميل الملف...');
    await this.loadCsv(this.currentCsv);
  },

  async _openFilePickerFallback(reason) {
    const cfg = GH.getCfg();
    if (!cfg.token || !cfg.repo) {
      toast(reason + ' — افتح الإعدادات وضبط Token و Repo ليتم جلب البيانات من GitHub تلقائياً', false);
      setTimeout(() => App.openSettings(), 700);
      return;
    }
    toast(reason + ' — اختر الملف يدوياً من جهازك', false);
    const fallback = document.createElement('input');
    fallback.type = 'file'; fallback.accept = '.csv,text/csv';
    fallback.onchange = (ev) => {
      const f = ev.target.files?.[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { this.loadCsv(this.currentCsv || ('data-csv/' + f.name), r.result); };
      r.onerror = () => { toast('فشل قراءة الملف من جهازك', false); };
      r.readAsText(f, 'utf-8');
    };
    fallback.click();
  },

  async loadCsv(path, manualText=null) {
    if (!path && !manualText) return;
    const sel = $('csvSelector');
    // Persist edits of the currently-open CSV before switching to another file,
    // so "نشر التعديلات" publishes ALL edited files, not just the current one.
    if (path && this.currentCsv && path !== this.currentCsv && this.currentCsvDirty && this.products.length) {
      this.otherCsvDrafts[this.currentCsv] = this.buildCsvFromProducts();
    }
    if (path) {
      this.currentCsv = path;
      this.currentCsvBasename = path.split('/').pop();
      if (sel && sel.value !== path) sel.value = path;
      this.currentCsvDirty = false;
      // clear the previous file's products so a failed load can never be staged/published
      this.products = [];
      try { if ($('productsTableBody')) $('productsTableBody').innerHTML = ''; } catch {}
    }
    // a manually-chosen file replaces any staged draft of that same path
    if (manualText && path && this.otherCsvDrafts[path]) {
      delete this.otherCsvDrafts[path];
      this.persistPendingNow();
    }
    let raw = manualText;
    let rawSource = '';
    if (!raw && path && this.otherCsvDrafts[path]) {
      raw = this.otherCsvDrafts[path];
      rawSource = 'تعديلات معلقة (نقل/نسخ)';
    }
    if (!raw && path) {
      raw = await fetchTextRelatively(path);
      if (raw) rawSource = 'تحميل محلي مباشر';
    }
    if (!raw && path) {
      raw = await GH.getFile(path);
      if (raw) rawSource = 'GitHub API';
    }
    if (!raw && !manualText) {
      if (sel.value && sel.value !== path) sel.value = '';
      await this._openFilePickerFallback('تعذر الوصول للملف عبر الشبكة');
      return;
    }
    if (raw && raw.length < 20) {
      if (sel.value && sel.value !== path) sel.value = '';
      await this._openFilePickerFallback('الملف يبدو فارغاً');
      return;
    }
    try {
      const parsedRaw = smartParseCsv(raw);
      this.products = parsedRaw;
    } catch (e) {
      console.error('Parse error:', e);
      toast('خطأ أثناء تحليل الملف: ' + (e.message || e), false);
      return;
    }
    if (!this.products || this.products.length === 0) {
      toast('لم يتم العثور على أي منتجات صالحة في الملف. تحقق من التنسيق أو اختر ملفاً آخر.', false);
      const ok = await confirmAsync('اختيار ملف يدوي', 'هل تريد تجربة اختيار الملف يدوياً من جهازك؟');
      if (ok) {
        const fallback = document.createElement('input');
        fallback.type = 'file'; fallback.accept = '.csv,text/csv';
        fallback.onchange = (ev) => {
          const f = ev.target.files?.[0]; if (!f) return;
          const r = new FileReader();
          r.onload = () => { this.loadCsv(this.currentCsv || ('data-csv/' + f.name), r.result); };
          r.readAsText(f, 'utf-8');
        };
        fallback.click();
      }
      return;
    }
    const sample = this.products[0] || {};
    $('welcomeState').classList.add('hidden');
    $('workspace').classList.remove('hidden');
    this.resetDirty();
    // Load categories/subcategories only when not yet in memory — this is what keeps
    // pending category edits intact while the user navigates between CSV files/sections.
    await this.ensureCategories();
    await this.ensureSubcategories();
    Products.renderTable();
    // selection belongs to a single file — clear it when switching
    Products.selected = new Set();
    Products.updateBulkBar();
    try { CatView.refresh(); } catch {}
    const srcInfo = manualText ? 'اختيار يدوي' : rawSource;
    toast(`${this.products.length} منتج | الكود الأول: ${sample.code || '—'} | المصدر: ${srcInfo}`);
  },

  manualCsvUpload() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.csv,text/csv';
    inp.onchange = (ev) => {
      const f = ev.target.files?.[0]; if (!f) return;
      toast('جاري قراءة الملف: ' + f.name + ' ...');
      const r = new FileReader();
      r.onload = () => this.loadCsv('data-csv/' + f.name, r.result);
      r.onerror = () => toast('فشل قراءة الملف', false);
      r.readAsText(f, 'utf-8');
    };
    inp.click();
  },

  async createNewCsv() {
    const name = await promptModal.open('اسم الملف الجديد (يكفي الاسم فقط — يُضاف .csv تلقائياً):', 'new-file');
    if (!name) return;
    let n = String(name).trim().replace(/\.csv$/i, '');
    if (!n) return;
    n += '.csv';
    const path = 'data-csv/' + n;
    const HEADER = ['CODE','NAME','PRICE','ABOUT1','ABOUT2','dis','PHOTO','P','H'];
    const csv = '\uFEFF' + Papa.unparse([HEADER], { delimiter: ';' });
    toast('جاري إنشاء الملف ورفعه إلى المستودع...');
    const ok = await GH.putFile(path, csv, `إنشاء ملف جديد: ${n}`);
    if (!ok) return;
    // update data-csv/files.txt index (via GitHub so it works from file:// too)
    let idx = await fetchTextRelatively('data-csv/files.txt');
    if (!idx) idx = await GH.getFile('data-csv/files.txt');
    if (idx != null) {
      const lines = idx.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (!lines.includes(n)) {
        lines.push(n);
        await GH.putFile('data-csv/files.txt', lines.join('\n') + '\n', 'إضافة الملف الجديد إلى الفهرس');
      }
    }
    toast(`تم إنشاء الملف ${n}`);
    log(`تم إنشاء الملف ${n}`, true);
    this.currentCsv = '';
    await this.refreshCsvList();
    await this.loadCsv(path);
  },

  async renameCurrentFile() {
    if (!this.currentCsvBasename) { toast('اختر ملفاً أولاً', false); return; }
    const base = this.currentCsvBasename.replace(/\.csv$/i, '');
    const newName = await promptModal.open('الاسم الجديد للملف (يكفي الاسم فقط — يُضاف .csv تلقائياً):', base);
    if (!newName) return;
    let n = String(newName).trim().replace(/\.csv$/i, '');
    if (!n) { toast('الاسم غير صالح', false); return; }
    n += '.csv';
    const ok = await confirmAsync('تغيير اسم الملف', `هل تريد تغيير اسم ${this.currentCsvBasename} إلى ${n}؟\n(سيتم حذف القديم وإنشاء الجديد بعد الضغط على حفظ ونشر)`);
    if (!ok) return;
    const oldPath = this.currentCsv;
    this.currentCsvBasename = n;
    this.currentCsv = 'data-csv/' + n;
    // update selector
    const sel = $('csvSelector');
    if (![...sel.options].some(o => o.value === this.currentCsv)) {
      const opt = document.createElement('option');
      opt.value = this.currentCsv; opt.textContent = n;
      sel.appendChild(opt);
    }
    sel.value = this.currentCsv;
    this._pendingRename = { from: oldPath, to: this.currentCsv };
    // any staged draft of the old path moves under the new path (products live in RAM now)
    if (this.otherCsvDrafts[oldPath]) delete this.otherCsvDrafts[oldPath];
    this.currentCsvDirty = true;
    this.markDirty();
    this.persistPendingNow();
    toast('تم تغيير الاسم محلياً — اضغط "نشر التعديلات" للتنفيذ (حذف القديم + رفع الجديد)');
  },

  async loadCategories(preferRemote = false) {
    let raw = null;
    if (preferRemote) raw = await GH.getFile('data/categories.csv');
    else if (this.otherCsvDrafts && this.otherCsvDrafts['data/categories.csv']) raw = this.otherCsvDrafts['data/categories.csv'];
    if (!raw) raw = await fetchTextRelatively('data/categories.csv');
    if (!raw) raw = await GH.getFile('data/categories.csv');
    const fixedNames = ['منتهي كمية', 'رائج', 'صفحة رئيسية'];
    const cleanHeader = (s) => String(s ?? '').replace(/^\uFEFF/, '').trim();
    if (raw) {
      const cleanRaw = stripBom(raw);
      const firstLine = (cleanRaw.split(/\r?\n/)[0] || '').trim();
      const semiCount = (firstLine.match(/;/g) || []).length, commaCount = (firstLine.match(/,/g) || []).length;
      const delimiter = semiCount > commaCount ? ';' : ',';
      const p = Papa.parse(cleanRaw, { skipEmptyLines: true, delimiter });
      const rows = p.data || [];
      if (rows.length) {
        const width = Math.max(...rows.map(r => r.length), 0);
        const parsedCols = [];
        for (let c = 0; c < width; c++) {
          const name = cleanHeader(rows[0]?.[c]);
          const codes = [];
          for (let r = 1; r < rows.length; r++) {
            const v = (rows[r]?.[c] ?? '').trim();
            if (v) codes.push(v);
          }
          if (name || codes.length) parsedCols.push({ name: name || `فئة ${c+1}`, codes });
        }
        const used = new Set();
        const fixedCols = fixedNames.map(name => {
          const idx = parsedCols.findIndex((cl, i) => !used.has(i) && cl.name === name);
          if (idx >= 0) { used.add(idx); return { name, codes: parsedCols[idx].codes, fixed: true }; }
          return { name, codes: [], fixed: true };
        });
        const customCols = parsedCols.filter((cl, i) => !used.has(i)).map(cl => ({ name: cl.name, codes: cl.codes, fixed: false }));
        this.categories = [...fixedCols, ...customCols];
        return;
      }
    }
    this.categories = fixedNames.map(n => ({ name: n, codes: [], fixed: true }));
  },

  /* ---------- SUBCATEGORIES (SubcategoriesA.csv + SubcategoriesB.csv) ---------- */
  async loadSubcategories() {
    this.mainCats = [];
    const rawA = await this.getCsvText('data/SubcategoriesA.csv');
    const rawB = await this.getCsvText('data/SubcategoriesB.csv');
    const parseGrid = (raw) => {
      if (!raw) return [];
      const fl = (raw.split(/\r?\n/)[0] || '');
      const delim = (fl.match(/;/g) || []).length >= (fl.match(/,/g) || []).length ? ';' : ',';
      return Papa.parse(stripBom(raw), { skipEmptyLines: true, delimiter: delim }).data || [];
    };
    const rowsA = parseGrid(rawA);
    const rowsB = parseGrid(rawB);
    const mainByName = new Map();
    if (rowsA.length) {
      const width = Math.max(...rowsA.map(r => r.length), 0);
      for (let c = 0; c < width; c++) {
        const name = String(rowsA[0]?.[c] ?? '').replace(/^\uFEFF/, '').trim();
        if (!name) continue;
        const subs = [];
        for (let r = 1; r < rowsA.length; r++) {
          const s = String(rowsA[r]?.[c] ?? '').trim();
          if (s && !subs.includes(s)) subs.push(s);
        }
        // dedupe main categories that appear more than once (corrupted/duplicated columns)
        if (!mainByName.has(name)) {
          mainByName.set(name, { name, subs });
        } else {
          const existing = mainByName.get(name);
          for (const s of subs) if (!existing.subs.includes(s)) existing.subs.push(s);
        }
      }
    }
    this.mainCats = Array.from(mainByName.values())
      .map(m => ({ name: m.name, subs: m.subs.map(s => ({ name: s, codes: [] })) }));
    // attach codes from B (sub name -> codes); merge duplicate sub columns
    const subCodes = {};
    if (rowsB.length) {
      const width = Math.max(...rowsB.map(r => r.length), 0);
      for (let c = 0; c < width; c++) {
        const sname = String(rowsB[0]?.[c] ?? '').replace(/^\uFEFF/, '').trim();
        if (!sname) continue;
        const codes = [];
        for (let r = 1; r < rowsB.length; r++) {
          const v = String(rowsB[r]?.[c] ?? '').trim();
          if (v && !codes.includes(v)) codes.push(v);
        }
        subCodes[sname] = subCodes[sname] || [];
        for (const v of codes) if (!subCodes[sname].includes(v)) subCodes[sname].push(v);
      }
    }
    for (const m of this.mainCats) {
      for (const s of m.subs) s.codes = subCodes[s.name] || [];
    }
    return this.mainCats;
  },

  buildSubcategoryFiles() {
    const mains = this.mainCats || [];
    // A: main -> subs
    const rowsA = [mains.map(m => m.name)];
    const maxSubs = Math.max(...mains.map(m => (m.subs || []).length), 0);
    for (let r = 0; r < maxSubs; r++) rowsA.push(mains.map(m => (m.subs[r] ? m.subs[r].name : '')));
    const csvA = '\uFEFF' + Papa.unparse(rowsA);
    // B: sub -> codes
    const subs = [];
    mains.forEach(m => (m.subs || []).forEach(s => subs.push(s)));
    const rowsB = [subs.map(s => s.name)];
    const maxCodes = Math.max(...subs.map(s => (s.codes || []).length), 0);
    for (let r = 0; r < maxCodes; r++) rowsB.push(subs.map(s => (s.codes[r] || '')));
    const csvB = '\uFEFF' + Papa.unparse(rowsB);
    return { A: csvA, B: csvB };
  },

  removeCodeFromAllSubcats(code) {
    for (const m of (this.mainCats || [])) {
      for (const s of (m.subs || [])) {
        s.codes = (s.codes || []).filter(c => c !== code);
      }
    }
  },

  categoriesOf(code) {
    const out = [];
    for (const m of (this.mainCats || [])) {
      for (const s of (m.subs || [])) {
        if ((s.codes || []).includes(code)) out.push({ main: m.name, sub: s.name });
      }
    }
    return out;
  },

  buildCsvFromProducts(list) {
    const HEADER_ORDER = ['CODE','NAME','PRICE','ABOUT1','ABOUT2','dis','PHOTO','P','H'];
    const rows = [];
    rows.push(HEADER_ORDER);
    for (const pRaw of (Array.isArray(list) ? list : (this.products || []))) {
      const p = normalizeProduct(pRaw);
      rows.push([
        p.code || '', p.name || '', String(nf(p.price) || ''),
        p.about1 || '', p.about2 || '', p.dis || '',
        p.photo || '', (p.p === '' || p.p == null) ? '' : String(nf(p.p) || ''), (p.h === '' || p.h == null) ? '' : String(nf(p.h) || '')
      ]);
    }
    // BOM for Arabic/Excel support
    return '\uFEFF' + Papa.unparse(rows, { delimiter: ';' });
  },

  async saveAllToGithub() {
    const cfg = GH.getCfg();
    if (!cfg.token || !cfg.repo) { toast('قم بتعيين إعدادات GitHub أولاً', false); App.openSettings(); return; }
    if (!this.currentCsv) { toast('اختر ملف CSV للمنتجات أولاً', false); return; }
    toast('جاري الحفظ والرفع...');

    // 1) Upload pending photos
    if (this.photoUploads.length) {
      for (const ph of this.photoUploads) {
        await GH.putFile(ph.path, ph.base64, `إضافة صورة ${ph.path}`, true);
      }
      this.photoUploads = [];
    }

    // 2) Save products CSV
    const csv = this.buildCsvFromProducts();
    const okP = await GH.putFile(this.currentCsv, csv, `تحديث المنتجات: ${this.currentCsvBasename}`);
    if (!okP) return;
    if (this._pendingRename) {
      // delete old path
      const cfg2 = GH.getCfg();
      try {
        const sha = await GH.getFileSHA(this._pendingRename.from);
        if (sha) {
          await fetch(`https://api.github.com/repos/${cfg2.repo}/contents/${GH.encPath(this._pendingRename.from)}`, {
            method: 'DELETE', headers: GH.headers(),
            body: JSON.stringify({ message: `حذف: ${this._pendingRename.from}`, branch: cfg2.branch, sha })
          });
        }
      } catch {}
      this._pendingRename = null;
      this.populateCsvSelector();
    }

    // 3) Save categories CSV (always)
    const catsCSV = Categories.toCSV();
    await GH.putFile('data/categories.csv', catsCSV, 'تحديث categories.csv');

    // 4) Maintain legacy files (out_products.csv, hot-price.csv, home.txt) derived from categories.csv
    await this.syncLegacyFiles();

    // 5) Regenerate photo/customer_photo manifests (avoid GitHub API rate limits on the site)
    const manifestOk = await GH.regenerateManifests();
    if (!manifestOk) toast('تم النشر لكن فشل تحديث فهارس الصور', false);

    toast('تم الحفظ والنشر بنجاح');
  },

  async syncLegacyFiles() {
    const col = (name) => (this.categories.find(c => c.name === name)?.codes || []);
    const outs = col('منتهي كمية');
    const hots = col('رائج');
    const homes = col('صفحة رئيسية');
    await GH.putFile('data/out_products.csv', outs.map(c => `${c}`).join('\n') + (outs.length ? '\n' : ''), 'تحديث out_products.csv');
    await GH.putFile('data/hot-price.csv', hots.map(c => `${c}`).join('\n') + (hots.length ? '\n' : ''), 'تحديث hot-price.csv');
    await GH.putFile('data/home.txt', homes.map(c => `${c}`).join('\n') + (homes.length ? '\n' : ''), 'تحديث home.txt');
  },

  // Publishes the current products + categories + legacy files to GitHub immediately
  async publishProducts(includeManifests = false) {
    if (this._publishing) { this._publishAgain = true; return true; }
    // cross-tab lock: block publishing while another tab/window is publishing
    const now = Date.now();
    const lockTs = Number(localStorage.getItem('hjy_publishing') || 0);
    if (lockTs && now - lockTs < 90000 && lockTs !== this._myLockTs) {
      toast('جاري النشر في نافذة أخرى — انتظر حتى ينتهي ثم أعد المحاولة', false);
      log('تم منع النشر: نافذة/تبويب آخر ينشر حالياً (لمنع تعارض 409)', false, true);
      return false;
    }
    this._myLockTs = now;
    localStorage.setItem('hjy_publishing', String(now));
    this._publishing = true;
    let ok = false;
    try {
      this._broadcastPublishing();
      ok = await this._doPublish(includeManifests);
    } finally {
      this._publishing = false;
      this._myLockTs = 0;
      localStorage.removeItem('hjy_publishing');
      if (this._publishAgain) {
        this._publishAgain = false;
        // only auto re-publish if the previous attempt succeeded
        if (ok) this.publishProducts(false);
      }
    }
    return ok;
  },
  _bc: null,
  _broadcastPublishing() {
    try {
      if (!this._bc) this._bc = new BroadcastChannel('hjy_admin_publish');
      this._bc.postMessage('publishing');
    } catch {}
  },
  async _doPublish(includeManifests) {
    const cfg = GH.getCfg();
    if (!cfg.token || !cfg.repo) { toast('اضبط إعدادات GitHub أولاً حتى تُحفظ التعديلات', false); App.openSettings(); log('مطلوب ضبط إعدادات GitHub أولاً', false); return false; }
    // capture the current open file + derived files (categories / subcategories) as drafts
    try { this.stageDerivedFiles(); } catch {}
    const totalPending = this.pendingCount();
    if (!totalPending && !this.currentCsvDirty) { toast('لا توجد تعديلات غير منشورة للنشر', false); log('لا توجد تعديلات للنشر', false); return false; }

    toast('جاري حفظ التعديلات ونشرها...');
    log('بدء نشر التعديلات...', true);
    const pendingPhotos = (this.photoUploads || []).slice();
    const photosChanged = pendingPhotos.length > 0 || (this.photoDeletions || []).length > 0;

    // 1) upload queued photos first (they were queued on save)
    if (this.photoUploads.length) {
      let okP = 0, failP = 0;
      for (const ph of this.photoUploads.slice()) {
        let ok = await GH.putFile(ph.path, ph.base64, `رفع صورة ${ph.path}`, true);
        if (!ok) {
          // one retry per photo
          await new Promise(r => setTimeout(r, 400));
          ok = await GH.putFile(ph.path, ph.base64, `رفع صورة ${ph.path} (محاولة 2)`, true);
        }
        if (ok) { okP++; const i = this.photoUploads.findIndex(x => x.path === ph.path); if (i >= 0) this.photoUploads.splice(i, 1); }
        else { failP++; log(`فشل رفع الصورة ${ph.path}`, false, true); }
      }
      if (failP) log(`رُفعت ${okP} صورة وفشل ${failP}`, failP === 0);
      else if (okP) log(`تم رفع ${okP} صورة`, true);
    }

    // 2) publish EVERY staged file in one pass: product CSVs + categories.csv +
    //    SubcategoriesA/B. Each file is removed from the draft list only on success,
    //    so a failed file stays saved locally for the next attempt.
    const draftPaths = Object.keys(this.otherCsvDrafts || {});
    let okD = 0, failD = 0, catsPublished = false;
    for (const path of draftPaths) {
      const txt = this.otherCsvDrafts[path];
      // SAFETY: never silently overwrite a non-empty product CSV with a header-only file
      if (/^data-csv\/.+\.csv$/i.test(path)) {
        const newRows = String(txt).split(/\r?\n/).filter(l => l.trim()).length;
        if (newRows <= 1) {
          let cur = await fetchTextRelatively(path);
          if (cur == null) cur = await GH.getFile(path);
          const curRows = cur ? String(cur).split(/\r?\n/).filter(l => l.trim()).length : 0;
          if (curRows > 1) {
            const proceed = await confirmAsync(
              'تحذير: ملف منتجات سيصبح فارغاً',
              `الملف "${path.split('/').pop()}" سيُنشر فارغاً (0 منتج)، بينما النسخة الحالية تحتوي ${curRows - 1} منتج.\n\nهل أنت متأكد؟ (هذا يحذف كل منتجات هذا الملف)`,
              'نعم، أفرغه'
            );
            if (!proceed) {
              delete this.otherCsvDrafts[path];
              log(`حماية البيانات: أُلغي نشر ملف فارغ ${path}`, false);
              continue;
            }
          }
        }
      }
      const ok = await GH.putFile(path, txt, `تحديث: ${path.split('/').pop()}`);
      if (ok) {
        okD++;
        delete this.otherCsvDrafts[path];
        if (LocalSync.isActive()) await LocalSync.writeText(path, txt);
        if (path === 'data/categories.csv') catsPublished = true;
      } else {
        failD++;
        log(`فشل نشر ${path} — سيبقى محفوظاً محلياً`, false);
      }
    }
    if (draftPaths.length) {
      if (failD) log(`نشر الملفات: نجح ${okD} فشل ${failD}`, failD === 0);
      else if (okD) log(`تم نشر ${okD} ملف`, true);
    }

    // 3) legacy files (out_products.csv / hot-price.csv / home.txt) derive from categories.csv
    if (catsPublished) await this.syncLegacyFiles();

    // 4) handle pending rename (delete the old path + update data-csv/files.txt index)
    if (this._pendingRename) {
      const oldPath = this._pendingRename.from;
      const oldName = oldPath.split('/').pop();
      const sha = await GH.getFileSHA(oldPath);
      if (sha) {
        try {
          await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${GH.encPath(oldPath)}`, {
            method: 'DELETE', headers: GH.headers(),
            body: JSON.stringify({ message: `حذف: ${oldPath}`, branch: cfg.branch, sha })
          });
        } catch {}
      }
      if (LocalSync.isActive()) await LocalSync.deleteFile(oldPath);
      let idx = await fetchTextRelatively('data-csv/files.txt');
      if (!idx) idx = await GH.getFile('data-csv/files.txt');
      if (idx != null) {
        const lines = idx.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const iOld = lines.indexOf(oldName); if (iOld >= 0) lines.splice(iOld, 1);
        const newName = this.currentCsvBasename;
        if (!lines.includes(newName)) lines.push(newName);
        const txt = lines.join('\n') + '\n';
        await GH.putFile('data-csv/files.txt', txt, 'تحديث فهرس الملفات بعد إعادة التسمية');
        if (LocalSync.isActive()) await LocalSync.writeText('data-csv/files.txt', txt);
      }
      this._pendingRename = null;
      await this.refreshCsvList();
      log(`تمت إعادة تسمية الملف: ${oldName} → ${this.currentCsvBasename}`, true);
    }

    // 5) delete queued photos (product deletion) from GitHub + local
    if (this.photoDeletions.length) {
      let delOk = 0, delFail = 0;
      for (const path of this.photoDeletions.slice()) {
        const ok = await GH.deleteFile(path);
        if (ok) { delOk++; const i = this.photoDeletions.indexOf(path); if (i >= 0) this.photoDeletions.splice(i, 1); }
        else delFail++;
        if (ok && LocalSync.isActive()) await LocalSync.deleteFile(path);
      }
      if (delOk) log(`تم حذف ${delOk} صورة من GitHub` + (delFail ? `، فشل ${delFail}` : ''), delFail === 0);
    }
    // 5b) delete queued arbitrary files (about/QA pages ...) from GitHub + local
    if ((this.fileDeletions || []).length) {
      let fOk = 0;
      for (const path of this.fileDeletions.slice()) {
        const ok = await GH.deleteFile(path);
        if (ok) fOk++;
        if (LocalSync.isActive()) await LocalSync.deleteFile(path);
        const i = this.fileDeletions.indexOf(path); if (i >= 0) this.fileDeletions.splice(i, 1);
      }
      log(`تم حذف ${fOk} ملف من GitHub`, true);
    }
    // 6) regenerate photo/customer_photo manifests ONLY if photos actually changed
    if (photosChanged) await GH.regenerateManifests();
    // 7) local sync: write the same changes into the local project folder (server or linked folder)
    //    NOTE: must run BEFORE reloading categories, otherwise the stale local categories.csv
    //    would be reloaded first and syncAll() would overwrite the local file with it again.
    if (LocalSync.isActive()) {
      if (photosChanged) {
        try { const mf = await GH.getFile('photo/files.txt'); if (mf != null) await LocalSync.writeText('photo/files.txt', mf); } catch {}
        try { const cf = await GH.getFile('customer_photo/files.txt'); if (cf != null) await LocalSync.writeText('customer_photo/files.txt', cf); } catch {}
        try { const gf = await GH.getFile('gallery/files.txt'); if (gf != null) await LocalSync.writeText('gallery/files.txt', gf); } catch {}
      }
      await LocalSync.syncAll(pendingPhotos);
    }
    // 8) reload categories/subcategories so the admin reflects what was published
    //    (drafts-first: if a file failed it stays as a local draft and is re-applied)
    try {
      this._catsLoaded = false;
      const catStillPending = !!(this.otherCsvDrafts && this.otherCsvDrafts['data/categories.csv']);
      await this.loadCategories(!catStillPending);
      this._catsLoaded = true;
      this._subcatsLoaded = false;
      await this.loadSubcategories();
      this._subcatsLoaded = true;
    } catch {}
    this.resetDirty();
    this.currentCsvDirty = false;
    this.categoriesDirty = false;
    this.subcatsDirty = false;
    this._restoredPending = false;
    // refresh counts / sidebar after publish
    ProductData.refresh();
    CsvSidebar.render();
    try { CatView.refresh(); } catch {}
    // keep anything that failed saved locally, otherwise clear the durable store
    if (this.pendingCount() > 0) this.persistPendingNow(); else this.clearPendingLocal();
    const hadFails = failD > 0;
    toast(hadFails ? `تم نشر التعديلات (نجح ${okD}، فشل ${failD} — تبقّت محفوظة محلياً)` : 'تم نشر التعديلات بنجاح ✓');
    log(hadFails ? `اكتمل النشر مع أخطاء: نجح ${okD} فشل ${failD}` : 'تم نشر التعديلات بنجاح ✓', !hadFails);
    return !hadFails;
  },

  openCategoriesManager() {
    this.ensureCategories().then(() => { Categories.render(); $('categoriesModal').classList.add('open'); try { CatView.refresh(); } catch {} });
  },

  /* ---------- PULL FROM GITHUB → LOCAL ----------
     Downloads the products (CSV), category data and the missing product
     photos from the GitHub repo into the local project folder. */
  async pullFromGithub() {
    const cfg = GH.getCfg();
    if (!cfg.repo) { toast('اضبط إعدادات GitHub (Repo) أولاً', false); App.openSettings(); return; }
    if (!LocalSync.isActive()) {
      const ok = await confirmAsync('تفعيل المزامنة المحلية', 'لسحب الملفات من GitHub إلى مجلدك المحلي يجب تفعيل المزامنة المحلية أولاً (ربط مجلد أو تشغيل الخادم المحلي).\nهل تريد ربط مجلد المشروع الآن؟');
      if (!ok) return;
      if (!await LocalSync.pickDir()) { toast('لم يتم ربط مجلد — تم إلغاء السحب', false); return; }
    }
    const ok = await confirmAsync('سحب من GitHub إلى المحلي', `سيتم تنزيل البيانات من GitHub (${cfg.repo}) إلى مجلدك المحلي:\n\n• ملفات المنتجات (data-csv) — تُحدَّث دائماً\n• بيانات الفئات والتصنيفات (data) — تُحدَّث دائماً\n• الصور المفقودة محلياً فقط (photo + customer_photo)\n\nهل تريد المتابعة؟`, 'سحب الآن');
    if (!ok) return;

    const parts = String(cfg.repo).split('/');
    const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1] || '')}/${encodeURIComponent(cfg.branch || 'main')}`;
    const encPath = (p) => String(p).split('/').map(encodeURIComponent).join('/');

    const fetchRaw = async (path, binary) => {
      try {
        const r = await fetch(`${rawBase}/${encPath(path)}`, { cache: 'no-store' });
        if (!r.ok) return null;
        if (binary) {
          const blob = await r.blob();
          return await new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result).split(',')[1]);
            fr.onerror = rej;
            fr.readAsDataURL(blob);
          });
        }
        return await r.text();
      } catch { return null; }
    };

    toast('جاري جلب قائمة الملفات من GitHub...');
    log('بدء السحب من GitHub إلى المحلي', true);

    // 1) text files: all product CSVs + category/legacy data
    const textPaths = [];
    const csvs = await GH.listFilesInDir('data-csv');
    (csvs || []).forEach(f => textPaths.push('data-csv/' + f));
    const dataFiles = await GH.listFilesInDir('data');
    (dataFiles || []).forEach(f => { if (/\.(csv|txt)$/i.test(String(f))) textPaths.push('data/' + f); });

    // 2) photos: only the ones missing locally
    const photoPaths = await GH.listFilesRecursive('photo');
    const custPaths = await GH.listFilesRecursive('customer_photo');
    const galPaths = await GH.listFilesRecursive('gallery');
    const allPhotos = [...photoPaths, ...custPaths, ...galPaths];
    let localExists = {};
    try { localExists = (await LocalSync.existsBatch(allPhotos)) || {}; } catch {}
    const missingPhotos = allPhotos.filter(p => !localExists[p]);
    // also pull the photo index manifests (needed by the site + admin photo lookup)
    textPaths.push('photo/files.txt', 'customer_photo/files.txt', 'gallery/files.txt');

    log(`سحب نصي: ${textPaths.length} ملف | صور مفقودة محلياً: ${missingPhotos.length}`, true);

    let okN = 0, failN = 0;
    const count = (p, ok) => { if (ok) okN++; else { failN++; log('تعذر: ' + p, false); } };

    for (const p of textPaths) {
      const txt = await fetchRaw(p, false);
      if (txt == null) { count(p, false); continue; }
      count(p, await LocalSync.writeText(p, txt));
    }
    for (let i = 0; i < missingPhotos.length; i++) {
      const p = missingPhotos[i];
      const b64 = await fetchRaw(p, true);
      if (b64 == null) { count(p, false); continue; }
      count(p, await LocalSync.writeBinary(p, b64));
      if ((i + 1) % 25 === 0) log(`الصور: ${i + 1}/${missingPhotos.length}`, true);
    }

    log(`اكتمل السحب من GitHub: ${okN} ملف بنجاح` + (failN ? `، فشل ${failN}` : ''), failN === 0);
    toast(failN ? `اكتمل السحب (${okN} نجحت، ${failN} فشلت)` : `اكتمل السحب: ${okN} ملف`);

    // reload the current CSV so the admin reflects the pulled data
    if (this.currentCsv) { try { await this.loadCsv(this.currentCsv); } catch {} }
    return okN;
  },
};

/* ======================= SIDEBAR ======================= */
const Sidebar = {
  get collapsed() { return document.documentElement.classList.contains('sidebar-collapsed'); },
  init() {
    if (localStorage.getItem('hjy_sidebar') === 'collapsed') document.documentElement.classList.add('sidebar-collapsed');
  },
  toggle() {
    const collapsed = document.documentElement.classList.toggle('sidebar-collapsed');
    localStorage.setItem('hjy_sidebar', collapsed ? 'collapsed' : 'open');
  },
  setDefault(mode) {
    localStorage.setItem('hjy_sidebar', mode === 'collapsed' ? 'collapsed' : 'open');
    document.documentElement.classList.toggle('sidebar-collapsed', mode === 'collapsed');
    this.updateDefaultUI();
    toast(mode === 'collapsed' ? 'سيفتح البرنامج بالبار الجانبي مغلقاً' : 'سيفتح البرنامج بالبار الجانبي مفتوحاً');
  },
  updateDefaultUI() {
    const open = localStorage.getItem('hjy_sidebar') !== 'collapsed';
    ['sidebarDefaultOpen', 'sidebarDefaultClosed'].forEach(id => {
      const b = $(id);
      if (b) b.classList.remove('border-primary', 'bg-sky-50');
    });
    const active = open ? $('sidebarDefaultOpen') : $('sidebarDefaultClosed');
    if (active) active.classList.add('border-primary', 'bg-sky-50');
  },
  onSelect() {
    const sel = $('sidebarCsvSelect');
    const val = sel && sel.value;
    if (!val) return;
    App.loadCsv('data-csv/' + val);
  },
  currentQuery() { return String($('csvSearchInput')?.value || '').trim().toLowerCase(); },
  matches(basename) {
    const q = this.currentQuery();
    if (!q) return true;
    return basename.toLowerCase().includes(q);
  },
  onSearch() {
    CsvSidebar.render();
    ProductData.render();
  }
};

/* ======================= CSV SIDEBAR LIST ======================= */
const CsvSidebar = {
  render() {
    const box = $('csvSidebarList');
    const sel = $('sidebarCsvSelect');
    if (sel) {
      sel.innerHTML = '<option value="">-- اختر ملف CSV --</option>' +
        App.csvFiles.map(f => `<option value="${esc(f)}"${App.currentCsvBasename === f ? ' selected' : ''}>${esc(f)}</option>`).join('');
    }
    if (!box) return;
    const list = App.csvFiles.filter(f => Sidebar.matches(f));
    if (!list.length) { box.innerHTML = '<div class="csv-empty">لا توجد ملفات مطابقة</div>'; return; }
    box.innerHTML = list.map(f => this.item(f)).join('');
  },
  item(basename) {
    const current = App.currentCsvBasename === basename;
    const st = App.csvStats[basename];
    const count = st ? st.count : '';
    return `<div class="csv-item ${current ? 'active' : ''}">
      <div class="csv-item-row">
        <div class="csv-item-main" onclick="App.loadCsvByName(this)" data-basename="${esc(basename)}" title="فتح ${esc(basename)}">
          <span class="csv-item-name">${esc(basename)}</span>
        </div>
        ${count !== '' ? `<span class="csv-item-badge">${count} منتج</span>` : ''}
        <div class="csv-item-actions">
          <button class="btn-icon del" onclick="App.deleteCsv('${esc(basename)}')" title="حذف الملف من المحلي و GitHub">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }
};

/* ======================= PRODUCT DATA (counts) ======================= */
const ProductData = {
  async refresh() {
    await App.buildGlobalIndex();
    this.render();
  },
  render() {
    const box = $('productDataList');
    if (!box) return;
    const list = App.csvFiles.filter(f => Sidebar.matches(f));
    if (!list.length) { box.innerHTML = '<div class="csv-empty">لا توجد ملفات مطابقة</div>'; return; }
    box.innerHTML = list.map(f => {
      const st = App.csvStats[f] || { count: 0 };
      return `<div class="csv-item">
        <div class="csv-item-row">
          <div class="csv-item-main" onclick="App.loadCsvByName(this)" data-basename="${esc(f)}" title="فتح ${esc(f)}">
            <span class="csv-item-name">${esc(f)}</span>
          </div>
          <span class="csv-item-badge">${st.count} منتج</span>
        </div>
      </div>`;
    }).join('');
  }
};

/* ======================= CATEGORIES READ-ONLY VIEW ======================= */
const CatView = {
  expanded: new Set(),      // main category names that are open
  subExpanded: new Set(),   // subcategory names that are open
  loaded: false,
  async refresh(force = false) {
    try {
      await App.ensureCategories();
      await App.ensureSubcategories();
    } catch {}
    if (!App.globalIndex) await App.buildGlobalIndex();
    this.render();
  },
  render() {
    const box = $('sidebarCatsList');
    if (!box) return;
    const mains = App.mainCats || [];
    const fixedCats = (App.categories || []).filter(c => c.fixed && (c.codes || []).length > 0);
    if (!mains.length && !fixedCats.length) { box.innerHTML = '<div class="cat-empty">لا توجد فئات بعد</div>'; return; }
    const pricesHidden = document.body.classList.contains('prices-hidden');
    let html = '';
    // fixed status categories first (منتهي / رائج / رئيسية)
    for (const c of fixedCats) {
      const isOpen = this.expanded.has('__fixed__' + c.name);
      const rows = c.codes.map(code => ({ code, p: App.globalIndex ? App.globalIndex.get(String(code).toLowerCase()) : null }));
      const found = rows.filter(r => r.p).length;
      const tone = c.name === 'منتهي كمية' ? 'chip-rose' : c.name === 'رائج' ? 'chip-amber' : 'chip-sky';
      html += `<div class="cat-accordion${isOpen ? ' open' : ''}">
        <div class="cat-acc-head" onclick="CatView.toggle('__fixed__${esc(c.name)}')" title="عرض المنتجات">
          <span class="chip ${tone}">${esc(c.name)}</span>
          <span class="cat-acc-count">${c.codes.length}${found !== c.codes.length ? ` (متوفر ${found})` : ''}</span>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        ${isOpen ? `<div class="cat-acc-body">${this.rowsHtml(rows, pricesHidden)}</div>` : ''}
      </div>`;
    }
    // main categories -> subcategories -> products
    for (const m of mains) {
      const isOpen = this.expanded.has(m.name);
      const total = (m.subs || []).reduce((a, s) => a + (s.codes || []).length, 0);
      html += `<div class="cat-accordion${isOpen ? ' open' : ''}">
        <div class="cat-acc-head" onclick="CatView.toggle('${esc(m.name)}')" title="عرض الفئات الفرعية">
          <span class="chip chip-indigo">${esc(m.name)}</span>
          <span class="cat-acc-count">${(m.subs || []).length} فرعية · ${total} منتج</span>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        ${isOpen ? `<div class="cat-acc-body">${this.subsHtml(m, pricesHidden)}</div>` : ''}
      </div>`;
    }
    box.innerHTML = html;
  },
  subsHtml(m, pricesHidden) {
    const subs = (m.subs || []).filter(s => (s.codes || []).length > 0);
    if (!subs.length) return '<div class="cat-empty">لا توجد فئات فرعية</div>';
    let out = '';
    for (const s of subs) {
      const isOpen = this.subExpanded.has(m.name + '::' + s.name);
      const rows = s.codes.map(code => ({ code, p: App.globalIndex ? App.globalIndex.get(String(code).toLowerCase()) : null }));
      const found = rows.filter(r => r.p).length;
      out += `<div class="cat-accordion cat-sub-acc${isOpen ? ' open' : ''}">
        <div class="cat-acc-head cat-sub-head" onclick="CatView.toggleSub('${esc(m.name)}', '${esc(s.name)}')" title="عرض المنتجات">
          <span class="chip chip-gray">${esc(s.name)}</span>
          <span class="cat-acc-count">${s.codes.length}${found !== s.codes.length ? ` (متوفر ${found})` : ''}</span>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        ${isOpen ? `<div class="cat-acc-body">${this.rowsHtml(rows, pricesHidden)}</div>` : ''}
      </div>`;
    }
    return out;
  },
  rowsHtml(rows, pricesHidden) {
    if (!rows.length) return '<div class="cat-empty">لا توجد منتجات</div>';
    let out = '';
    for (const { code, p } of rows) {
      if (!p) continue;
      const cands = genPhotoCandidates(p.code, p.photo || '', 0);
      const first = cands[0] || NO_IMG_SVG;
      const candJson = esc(JSON.stringify(cands));
      out += `<div class="cat-prod">
        <img class="cat-prod-img" loading="lazy" src="${esc(first)}" data-src-list="${candJson}" data-src-idx="0" onerror="window.__adminImgFallback && window.__adminImgFallback(this)" alt="">
        <div class="cat-prod-info">
          <div class="cat-prod-code">${esc(code)}</div>
          <div class="cat-prod-name">${esc(p.name || '')}</div>
          ${p.about1 ? `<div class="cat-prod-about">${esc(p.about1)}</div>` : ''}
        </div>
        ${pricesHidden ? '' : `<div class="cat-prod-price">$${nf(p.price)}</div>`}
      </div>`;
    }
    return out || '<div class="cat-empty">لا توجد منتجات متوفرة</div>';
  },
  toggle(name) {
    if (this.expanded.has(name)) this.expanded.delete(name); else this.expanded.add(name);
    this.render();
  },
  toggleSub(mainName, subName) {
    const key = mainName + '::' + subName;
    if (this.subExpanded.has(key)) this.subExpanded.delete(key); else this.subExpanded.add(key);
    this.render();
  }
};

/* ======================= MOVE / COPY PRODUCTS ======================= */
const MoveProducts = {
  codes: [],
  target: '',
  mode: 'move',
  open(codes, label) {
    this.codes = Array.isArray(codes) ? codes : [codes];
    this.target = '';
    this.mode = 'move';
    const el = $('moveProductsInfo');
    if (el) el.textContent = label || `${this.codes.length} منتج`;
    $('moveModalTitle').textContent = 'نقل المنتجات إلى ملف CSV آخر';
    $('moveTargetSearch').value = '';
    this.updateConfirmLabel();
    $('moveModal').classList.add('open');
    const r = document.querySelector('input[name="moveMode"][value="move"]');
    if (r) r.checked = true;
    this.render();
  },
  updateConfirmLabel() {
    const n = this.codes.length;
    const act = this.mode === 'move' ? 'نقل' : 'نسخ';
    $('moveConfirmBtn').textContent = n === 1 ? `${act} المنتج` : `${act} ${n} منتجات`;
  },
  onModeChange() {
    const r = document.querySelector('input[name="moveMode"]:checked');
    this.mode = r ? r.value : 'move';
    this.updateConfirmLabel();
  },
  render() {
    const box = $('moveTargetList');
    if (!box) return;
    const q = String($('moveTargetSearch')?.value || '').trim().toLowerCase();
    const list = App.csvFiles.filter(f => f !== App.currentCsvBasename && (!q || f.toLowerCase().includes(q)));
    if (!list.length) { box.innerHTML = '<div class="csv-empty">لا توجد ملفات وجهة</div>'; return; }
    box.innerHTML = list.map(f => {
      const st = App.csvStats[f] || { count: 0 };
      const sel = f === this.target ? ' sel' : '';
      return `<div class="move-target${sel}" onclick="MoveProducts.pick('${esc(f)}')">
        <div class="mt-main">
          <span class="mt-name">${esc(f)}</span>
        </div>
        <span class="mt-count">${st.count} منتج</span>
      </div>`;
    }).join('');
  },
  pick(f) { this.target = f; this.render(); },
  close() { $('moveModal').classList.remove('open'); },
  confirm() {
    if (!this.target) { toast('اختر ملف الوجهة أولاً', false); return; }
    this.doMove(this.target, this.mode);
  },
  async doMove(targetBasename, mode) {
    const srcPath = App.currentCsv;
    const tgtPath = 'data-csv/' + targetBasename;
    if (srcPath === tgtPath) { toast('الوجهة هي نفسها الملف الحالي', false); return; }
    // load target products
    let tgtProds = [];
    if (App.otherCsvDrafts[tgtPath]) {
      tgtProds = smartParseCsv(App.otherCsvDrafts[tgtPath]);
    } else {
      const raw = await App.getCsvText(tgtPath);
      if (raw) tgtProds = smartParseCsv(raw);
    }
    const tgtCodes = new Set(tgtProds.map(p => String(p.code || '').trim().toUpperCase()));
    let added = 0;       // added to the target (new)
    let movedSrc = 0;    // removed from the source (move mode)
    let skipped = 0;     // not found in the source at all
    for (const code of this.codes) {
      const src = (App.products || []).find(p => String(p.code || '').trim() === code);
      if (!src) { skipped++; continue; }
      const inTarget = tgtCodes.has(String(code).toUpperCase());
      // add to target only if not already there (avoid duplicates)
      if (!inTarget) {
        tgtProds.push(normalizeProduct({ ...src }));
        tgtCodes.add(String(code).toUpperCase());
        added++;
      }
      // move = remove from source even if the product already exists in the target
      if (mode === 'move') {
        const idx = App.products.findIndex(p => String(p.code || '').trim() === code);
        if (idx >= 0) App.products.splice(idx, 1);
        movedSrc++;
      }
    }
    const nothingHappened = mode === 'move' ? movedSrc === 0 : added === 0;
    if (nothingHappened) {
      this.close();
      toast(skipped ? 'المنتجات المحددة غير موجودة في الملف الحالي' : 'لا يوجد منتجات لنقلها', false);
      log(`لم يُنقل أي منتج إلى ${targetBasename} (محدد: ${this.codes.length})`, false);
      return;
    }
    if (added > 0) App.otherCsvDrafts[tgtPath] = App.buildCsvFromProducts(tgtProds);
    if (mode === 'move' && srcPath && movedSrc) {
      App.currentCsvDirty = true;
      for (const code of this.codes) Products.selected.delete(code);
      Products.renderTable();
      App.markDirty();
    } else {
      App.markDirty();
    }
    this.close();
    let msg;
    if (mode === 'move') {
      const existed = movedSrc - added;
      msg = `تم نقل ${movedSrc} من أصل ${this.codes.length} منتجات إلى ${targetBasename}${existed > 0 ? ` (منها ${existed} كانت موجودة مسبقاً في الوجهة فأزيلت من المصدر فقط)` : ''} — اضغط "نشر التعديلات" للرفع إلى GitHub`;
    } else {
      msg = `تم نسخ ${added} من أصل ${this.codes.length} منتجات إلى ${targetBasename}${skipped ? ` (تخطي ${skipped} موجودة مسبقاً)` : ''} — اضغط "نشر التعديلات" للرفع إلى GitHub`;
    }
    toast(msg);
    log(`تمت ${mode === 'move' ? 'نقل' : 'نسخ'} ${mode === 'move' ? movedSrc : added}/${this.codes.length} منتجات إلى ${targetBasename} محلياً (بانتظار النشر)`, true);
    ProductData.refresh();
  }
};

/* ======================= COMPATIBILITY TEST (code <-> photo <-> csv) ======================= */
const CompatTest = {
  orphanPhotos: [],   // photo paths with no matching code
  noPhotoCodes: [],   // codes that have no photo file
  async open() {
    $('compatModal').classList.add('open');
    $('compatStatus').textContent = 'جارٍ الفحص...';
    $('compatSummary').innerHTML = '';
    $('compatBody').innerHTML = '';
    $('compatCleanupBtn').style.display = 'none';
    if (App.photoIndexMap == null) await App.loadPhotoIndex();
    if (!App.globalIndex) await App.buildGlobalIndex();
    await this.run();
  },
  close() { $('compatModal').classList.remove('open'); },
  async run() {
    // gather codes + photo references from all CSVs + categories + subcategories
    const codes = new Set();
    const photoRefs = new Set();
    const prefixes = [];
    for (const [, p] of App.globalIndex) {
      const code = String(p.code || '').trim().toLowerCase();
      if (code) { codes.add(code); prefixes.push(code); photoRefs.add(code); }
      String(p.photo || '').split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
        const k = n.replace(/\.[^./]+$/, '').toLowerCase();
        if (k) photoRefs.add(k);
      });
    }
    for (const c of (App.categories || [])) for (const code of (c.codes || [])) codes.add(String(code).toLowerCase());
    for (const m of (App.mainCats || [])) for (const s of (m.subs || [])) for (const code of (s.codes || [])) codes.add(String(code).toLowerCase());

    const photoKeys = App.photoIndexMap instanceof Map ? new Set(App.photoIndexMap.keys()) : new Set();

    const isRef = (key) => {
      if (photoRefs.has(key)) return true;
      for (const pre of prefixes) {
        if (key === pre) return true;
        if (key.startsWith(pre + '-') && /^\d+$/.test(key.slice(pre.length + 1))) return true;
      }
      return false;
    };

    // 1) orphan photos
    const orphanKeys = [];
    for (const key of photoKeys) if (!isRef(key)) orphanKeys.push(key);
    orphanKeys.sort();
    this.orphanPhotos = [];
    for (const key of orphanKeys) {
      const arr = App.photoIndexMap.get(key) || [];
      for (const p of arr) if (!this.orphanPhotos.includes(p)) this.orphanPhotos.push(p);
    }

    // 2) codes with no photo
    this.noPhotoCodes = [];
    for (const code of codes) {
      let has = false;
      for (const key of photoKeys) {
        if (key === code || (key.startsWith(code + '-') && /^\d+$/.test(key.slice(code.length + 1)))) { has = true; break; }
      }
      if (!has) this.noPhotoCodes.push(code);
    }
    this.noPhotoCodes.sort();

    // render
    const ok = this.orphanPhotos.length === 0 && this.noPhotoCodes.length === 0;
    $('compatStatus').textContent = ok ? 'النظام متوافق ✓ — كل كود له صورة، وكل صورة لها كود' : 'توجد ملاحظات يجب معالجتها:';
    const chips = [];
    chips.push(`<span class="stat-chip">منتجات (أكواد): <b>${codes.size}</b></span>`);
    chips.push(`<span class="stat-chip">صور: <b>${photoKeys.size}</b></span>`);
    chips.push(`<span class="stat-chip" style="border-color:#fecdd3;color:#be123c">صور يتيمة: <b>${this.orphanPhotos.length}</b></span>`);
    chips.push(`<span class="stat-chip" style="border-color:#fde68a;color:#b45309">أكواد بلا صورة: <b>${this.noPhotoCodes.length}</b></span>`);
    $('compatSummary').innerHTML = chips.join('');

    let body = '';
    if (this.noPhotoCodes.length) {
      body += `<div class="set-group"><div class="set-group-title"><span class="dot"></span>أكواد بدون صورة (${this.noPhotoCodes.length})</div>
        <div class="orphan-list" style="max-height:220px"><div class="orphan-item"><div class="oi-name" style="white-space:normal">${esc(this.noPhotoCodes.slice(0, 80).join('، '))}${this.noPhotoCodes.length > 80 ? ' ...' : ''}</div></div></div></div>`;
    }
    if (this.orphanPhotos.length) {
      body += `<div class="set-group" style="margin-top:12px"><div class="set-group-title"><span class="dot"></span>صور يتيمة بدون كود (${this.orphanPhotos.length})</div>
        <div class="orphan-list" style="max-height:220px">${this.orphanPhotos.slice(0, 60).map(p => {
          const name = p.split('/').pop();
          return `<div class="orphan-item"><div style="flex:1;min-width:0"><div class="oi-name">${esc(name)}</div><div class="oi-path">${esc(p)}</div></div></div>`;
        }).join('')}</div>${this.orphanPhotos.length > 60 ? `<div class="text-xs text-slate-400 mt-1">و ${this.orphanPhotos.length - 60} أخرى...</div>` : ''}</div>`;
    }
    if (!body) body = '<div class="csv-empty">لا توجد أي ملاحظات — كل شيء متوافق تماماً ✓</div>';
    $('compatBody').innerHTML = body;
    $('compatCleanupBtn').style.display = this.orphanPhotos.length ? 'inline-flex' : 'none';
    $('compatCleanupBtn').textContent = `حذف ${this.orphanPhotos.length} صورة يتيمة`;
  },
  async cleanup() {
    const list = this.orphanPhotos.slice();
    if (!list.length) { toast('لا توجد صور يتيمة', false); return; }
    const ok = await confirmAsync('حذف الصور اليتيمة', `سيتم حذف ${list.length} صورة من مجلد photo المحلي ومن GitHub، ثم تحديث فهرس الصور.\n\nهل أنت متأكد؟`, 'نعم، احذف', true);
    if (!ok) return;
    toast('جارٍ حذف الصور اليتيمة...');
    let okN = 0, failN = 0;
    for (const p of list) {
      const a = await GH.deleteFile(p);
      const b = LocalSync.isActive() ? await LocalSync.deleteFile(p) : true;
      if (a && b) okN++; else failN++;
    }
    await App.syncPhotoManifests();
    if (App.photoIndexMap instanceof Map) {
      for (const p of list) {
        const key = p.split('/').pop().replace(/\.[^./]+$/, '').toLowerCase();
        const arr = App.photoIndexMap.get(key);
        if (Array.isArray(arr)) { const i = arr.indexOf(p); if (i >= 0) arr.splice(i, 1); if (!arr.length) App.photoIndexMap.delete(key); }
      }
    }
    this.close();
    toast(failN ? `تم حذف ${okN}، فشل ${failN}` : `تم حذف ${okN} صورة يتيمة`);
    log(`اختبار التوافق: حذف ${okN} صورة يتيمة` + (failN ? `، فشل ${failN}` : ''), failN === 0);
  }
};

/* ======================= ORPHAN PHOTO CLEANUP ======================= */
const OrphanCleanup = {
  orphans: [],
  async open() {
    $('orphanModal').classList.add('open');
    $('orphanStatus').textContent = 'جارٍ الفحص...';
    $('orphanSummary').style.display = 'none';
    $('orphanList').innerHTML = '';
    $('orphanRunBtn').style.display = 'none';
    if (App.photoIndexMap == null) await App.loadPhotoIndex();
    await this.scan();
  },
  close() { $('orphanModal').classList.remove('open'); },
  async scan() {
    const exact = new Set();
    const prefixes = [];
    for (const f of App.csvFiles) {
      let raw = null;
      try { raw = await App.getCsvText('data-csv/' + f); } catch {}
      if (!raw) continue;
      const prods = smartParseCsv(raw);
      for (const p of prods) {
        const code = String(p.code || '').trim().toLowerCase();
        if (code) { exact.add(code); prefixes.push(code); }
        String(p.photo || '').split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          const k = n.replace(/\.[^./]+$/, '').toLowerCase();
          if (k) exact.add(k);
        });
      }
    }
    try {
      const raw = await App.getCsvText('data/categories.csv');
      if (raw) {
        const fl = (raw.split(/\r?\n/)[0] || '');
        const delim = (fl.match(/;/g) || []).length >= (fl.match(/,/g) || []).length ? ';' : ',';
        const p = Papa.parse(stripBom(raw), { skipEmptyLines: true, delimiter: delim });
        for (const row of (p.data || [])) for (const cell of row) {
          const c = String(cell || '').trim().replace(/\.[^./]+$/, '').toLowerCase();
          if (c && c.length >= 2 && !/^\d+(\.\d+)?$/.test(c)) exact.add(c);
        }
      }
    } catch {}
    const isUsed = (key) => {
      if (exact.has(key)) return true;
      for (const pre of prefixes) {
        if (key === pre) return true;
        if (key.startsWith(pre + '-') && /^\d+$/.test(key.slice(pre.length + 1))) return true;
      }
      return false;
    };
    const orphans = [];
    if (App.photoIndexMap instanceof Map) {
      for (const [key, arr] of App.photoIndexMap) {
        if (isUsed(key)) continue;
        for (const p of arr) orphans.push(p);
      }
    }
    const seen = new Set();
    const final = [];
    for (const p of orphans) { if (!seen.has(p)) { seen.add(p); final.push(p); } }
    final.sort();
    this.orphans = final;
    const box = $('orphanList');
    $('orphanStatus').textContent = final.length ? `تم العثور على ${final.length} صورة يتيمة` : 'لا توجد صور يتيمة ✓';
    $('orphanSummary').style.display = final.length ? 'block' : 'none';
    $('orphanSummary').textContent = 'هذه الصور لا يظهر لها أي كود أو مرجع في أي ملف CSV (المنتجات والفئات). سيتم حذفها من GitHub والمجلد المحلي وتحديث فهرس الصور.';
    if (!final.length) {
      box.innerHTML = '<div class="csv-empty">جميع الصور مستخدمة ولا توجد صور يتيمة.</div>';
      $('orphanRunBtn').style.display = 'none';
      return;
    }
    box.innerHTML = final.map(p => {
      const name = p.split('/').pop();
      const cands = genPhotoCandidates(name, '', 0);
      const thumb = cands[0] || NO_IMG_SVG;
      return `<div class="orphan-item">
        <img src="${esc(thumb)}" onerror="this.style.visibility='hidden'" alt="">
        <div style="flex:1;min-width:0">
          <div class="oi-name">${esc(name)}</div>
          <div class="oi-path">${esc(p)}</div>
        </div>
      </div>`;
    }).join('');
    $('orphanRunBtn').style.display = 'inline-flex';
    $('orphanRunBtn').textContent = `حذف ${final.length} صورة`;
  },
  async run() {
    const list = this.orphans.slice();
    if (!list.length) { toast('لا توجد صور للحذف', false); return; }
    const ok = await confirmAsync('حذف الصور اليتيمة', `سيتم حذف ${list.length} صورة من مجلد photo المحلي ومن مستودع GitHub، ثم تحديث فهرس الصور.\n\nهل أنت متأكد من الحذف؟`, 'نعم، احذف', true);
    if (!ok) return;
    toast('جارٍ حذف الصور اليتيمة...');
    let okN = 0, failN = 0;
    for (const p of list) {
      const a = await GH.deleteFile(p);
      const b = LocalSync.isActive() ? await LocalSync.deleteFile(p) : true;
      if (a && b) okN++; else failN++;
    }
    await App.syncPhotoManifests();
    if (App.photoIndexMap instanceof Map) {
      for (const p of list) {
        const key = p.split('/').pop().replace(/\.[^./]+$/, '').toLowerCase();
        const arr = App.photoIndexMap.get(key);
        if (Array.isArray(arr)) {
          const i = arr.indexOf(p); if (i >= 0) arr.splice(i, 1);
          if (!arr.length) App.photoIndexMap.delete(key);
        }
      }
    }
    if (App.currentCsv) Products.renderTable();
    this.close();
    toast(failN ? `تم حذف ${okN}، فشل ${failN}` : `تم حذف ${okN} صورة يتيمة`);
    log(`تنظيف الصور اليتيمة: تم حذف ${okN}` + (failN ? `، فشل ${failN}` : ''), failN === 0);
  }
};

/* ======================= LOCAL SYNC (auto server + File System Access) ======================= */
const LocalSync = {
  rootHandle: null,
  serverUrl: '',
  serverMode: false,
  _db: null,
  supported: typeof window !== 'undefined' && 'showDirectoryPicker' in window && 'indexedDB' in window,

  init() {
    this.probeServer();
    if (!this.supported) return;
    this._db = new Promise((resolve) => {
      try {
        const req = indexedDB.open('hjy_admin_local_v1', 1);
        req.onupgradeneeded = () => { try { req.result.createObjectStore('handles'); } catch {} };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
    this.restoreHandle();
  },
  async probeServer() {
    const urls = ['http://localhost:8333', 'http://127.0.0.1:8333'];
    for (const u of urls) {
      try {
        const r = await fetch(u + '/ping', { cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          if (j && j.ok) {
            this.serverUrl = u;
            this.serverMode = true;
            try {
              if (await GH.loadFileSettings()) App.fillSettingsInputs();
            } catch {}
            this.updateStatus();
            return;
          }
        }
      } catch {}
    }
    this.updateStatus();
  },
  isActive() {
    return !!this.rootHandle || this.serverMode;
  },
  async _serverPost(path, body) {
    if (!this.serverUrl) return null;
    try {
      const r = await fetch(this.serverUrl + path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store'
      });
      if (r.ok) return await r.json();
    } catch {}
    return null;
  },
  async restoreHandle() {
    try {
      const db = await this._db;
      if (!db) return;
      const tx = db.transaction('handles', 'readonly');
      const g = tx.objectStore('handles').get('root');
      g.onsuccess = () => { if (g.result) this.rootHandle = g.result; this.updateStatus(); };
    } catch {}
  },
  async persistHandle() {
    try {
      const db = await this._db;
      if (!db || !this.rootHandle) return;
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(this.rootHandle, 'root');
    } catch {}
  },
  async pickDir() {
    if (!this.supported) { toast('متصفحك لا يدعم الكتابة المحلية — استخدم Chrome أو Edge', false); return false; }
    try {
      this.rootHandle = await window.showDirectoryPicker();
      await this.persistHandle();
      toast('تم ربط مجلد المشروع المحلي ✓');
      log('تم ربط مجلد المشروع المحلي للمزامنة ✓', true);
      this.updateStatus();
      return true;
    } catch (e) { log('لم يتم ربط مجلد محلي', false); return false; }
  },
  async clearDir() {
    this.rootHandle = null;
    try { const db = await this._db; if (db) { const tx = db.transaction('handles', 'readwrite'); tx.objectStore('handles').delete('root'); } } catch {}
    this.updateStatus();
  },
  updateStatus() {
    const on = this.isActive();
    const mode = this.serverMode ? 'تلقائي (خادم محلي)' : (this.rootHandle ? 'مرتبط' : 'غير مفعل');
    const el = $('localSyncStatus');
    if (el) el.textContent = on ? `✓ ${mode} — التعديلات تُكتب محلياً` : 'غير مفعل';
    const el2 = $('localSyncStatus2');
    if (el2) el2.textContent = mode;
    const b = $('localSyncToggle');
    if (b) {
      const s = b.querySelector('span');
      if (s) s.textContent = on ? `المزامنة المحلية: ${mode}` : 'المزامنة المحلية: معطلة';
    }
    const banner = $('localSyncBanner');
    if (banner) {
      if (!on && this.supported && this._enabled !== false) banner.style.display = 'flex';
      else banner.style.display = 'none';
    }
  },
  async getFileHandle(path, create = true) {
    if (!this.rootHandle) return null;
    const parts = String(path).split('/').filter(Boolean);
    let dir = this.rootHandle;
    try {
      for (let i = 0; i < parts.length - 1; i++) dir = await dir.getDirectoryHandle(parts[i], { create });
      return await dir.getFileHandle(parts[parts.length - 1], { create });
    } catch { return null; }
  },
  async writeText(path, content) {
    // server mode first (no permission needed)
    if (this.serverUrl) {
      const j = await this._serverPost('/write', { files: [{ path, content: String(content ?? '') }] });
      return !!(j && j.written > 0);
    }
    try {
      const fh = await this.getFileHandle(path);
      if (!fh) return false;
      const w = await fh.createWritable();
      await w.write(String(content ?? ''));
      await w.close();
      return true;
    } catch { return false; }
  },
  async writeBinary(path, base64) {
    if (this.serverUrl) {
      const j = await this._serverPost('/write', { files: [{ path, base64: String(base64 || '') }] });
      return !!(j && j.written > 0);
    }
    try {
      const fh = await this.getFileHandle(path);
      if (!fh) return false;
      const bin = atob(String(base64 || ''));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const w = await fh.createWritable();
      await w.write(bytes);
      await w.close();
      return true;
    } catch { return false; }
  },
  async deleteFile(path) {
    if (this.serverUrl) {
      const j = await this._serverPost('/delete', { paths: [path] });
      return !!(j && j.deleted > 0);
    }
    try {
      const parts = String(path).split('/').filter(Boolean);
      if (!parts.length || !this.rootHandle) return false;
      let dir = this.rootHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i], { create: false });
      }
      await dir.removeEntry(parts[parts.length - 1]);
      return true;
    } catch { return false; }
  },
  async existsBatch(paths) {
    const list = (paths || []).filter(Boolean);
    if (!list.length) return {};
    if (this.serverUrl) {
      const j = await this._serverPost('/exists', { paths: list });
      if (j && j.exists) return j.exists;
    }
    // File System Access mode: probe each handle
    const out = {};
    if (this.rootHandle) {
      for (const p of list) {
        const parts = String(p).split('/').filter(Boolean);
        try {
          let dir = this.rootHandle;
          for (let i = 0; i < parts.length - 1; i++) dir = await dir.getDirectoryHandle(parts[i], { create: false });
          await dir.getFileHandle(parts[parts.length - 1], { create: false });
          out[p] = true;
        } catch { out[p] = false; }
      }
    } else {
      list.forEach(p => { out[p] = false; });
    }
    return out;
  },
  async syncAll(pendingPhotos) {
    if (!this.isActive()) return 0;
    const files = [];
    if (App.currentCsv) files.push({ path: App.currentCsv, content: App.buildCsvFromProducts() });
    for (const [path, txt] of Object.entries(App.otherCsvDrafts || {})) {
      // data/ files (categories + SubcategoriesA/B + legacy) are re-derived below
      if (path !== App.currentCsv && !String(path).startsWith('data/')) files.push({ path, content: txt });
    }
    // only (re)write the category-derived files when categories are actually loaded
    // (prevents clobbering them with empty content when publishing from the site page)
    if (App.categories && App.categories.length) {
      files.push({ path: 'data/categories.csv', content: Categories.toCSV() });
      try {
        const subFiles = App.buildSubcategoryFiles();
        files.push({ path: 'data/SubcategoriesA.csv', content: subFiles.A });
        files.push({ path: 'data/SubcategoriesB.csv', content: subFiles.B });
      } catch {}
      const col = (name) => (App.categories.find(c => c.name === name)?.codes || []);
      files.push({ path: 'data/out_products.csv', content: col('منتهي كمية').join('\n') + '\n' });
      files.push({ path: 'data/hot-price.csv', content: col('رائج').join('\n') + '\n' });
      files.push({ path: 'data/home.txt', content: col('صفحة رئيسية').join('\n') + '\n' });
    }
    for (const ph of (pendingPhotos || [])) files.push({ path: ph.path, base64: ph.base64 });
    let n = 0, fail = 0;
    for (const f of files) {
      const ok = f.base64 ? await this.writeBinary(f.path, f.base64) : await this.writeText(f.path, f.content);
      if (ok) n++; else fail++;
    }
    if (n) log(`تمت المزامنة المحلية: ${n} ملف` + (fail ? `، تعذر ${fail}` : ''), fail === 0);
    return n;
  }
};

/* ======================= CATEGORIES MANAGER ======================= */
const Categories = {
  render() {
    const fixedNames = ['منتهي كمية', 'رائج', 'صفحة رئيسية'];
    // Ensure first 3 fixed exist (by name) without overwriting custom names
    for (let i = 0; i < 3; i++) {
      const fi = App.categories.findIndex(c => c.name === fixedNames[i]);
      if (fi >= 0) { App.categories[fi].fixed = true; continue; }
      if (!App.categories[i]) App.categories[i] = { name: fixedNames[i], codes: [], fixed: true };
    }
    const cols = App.categories;
    const maxR = Math.max(...cols.map(c => c.codes.length), 3) + 3;
    const th = $('catsHeader');
    const tb = $('catsBody');
    let thHtml = '<tr>';
    cols.forEach((c, i) => {
      const isFixed = c.fixed;
      const colTone = isFixed ? (i === 0 ? 'color:#e11d48' : i === 1 ? 'color:#c2410c' : i === 2 ? 'color:#0369a1' : 'color:#4338ca') : 'color:#374151';
      thHtml += `<th style="min-width:150px;padding:12px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:7px">
          ${isFixed ? `<span class="chip chip-solid">ثابت</span>` : `<div style="display:flex;gap:5px"><button onclick="Categories.renameCol(${i})" class="btn btn-sm btn-ghost">تعديل</button><button onclick="Categories.deleteCol(${i})" class="btn btn-sm btn-ghost" style="color:#e11d48">حذف</button></div>`}
          <div style="font-weight:800;font-size:12.5px;${colTone}">${esc(c.name)}</div>
        </div>
      </th>`;
    });
    thHtml += '<th style="width:8px"></th></tr>';
    th.innerHTML = thHtml;
    let tbHtml = '';
    for (let r = 0; r < maxR; r++) {
      tbHtml += `<tr>`;
      cols.forEach((c, ci) => {
        const val = c.codes[r] || '';
        const tone = c.fixed && ci===0 ? '#be123c' : c.fixed && ci===1 ? '#c2410c' : c.fixed && ci===2 ? '#0369a1' : '#374151';
        tbHtml += `<td><input data-col="${ci}" data-row="${r}" value="${esc(val)}" oninput="Categories.onCellInput(event)" dir="ltr" style="color:${tone}"></td>`;
      });
      tbHtml += `<td></td></tr>`;
    }
    tb.innerHTML = tbHtml;
  },

  onCellInput(e) {
    const ci = +e.target.dataset.col;
    const ri = +e.target.dataset.row;
    const cols = App.categories;
    if (!cols[ci]) return;
    // Trim empty trailing cells live
    cols[ci].codes[ri] = e.target.value;
    App.categoriesDirty = true;
    App.markDirty();
  },

  async addCategoryColumn() {
    const name = await promptModal.open('اسم الفئة الجديدة (مثل: بطاريات ليثيوم):', '');
    if (!name || !name.trim()) return;
    App.categories.push({ name: name.trim(), codes: [], fixed: false });
    App.categoriesDirty = true;
    App.markDirty();
    this.render();
  },

  async renameCol(i) {
    const c = App.categories[i];
    if (!c || c.fixed) return;
    const n = await promptModal.open('اسم جديد للفئة:', c.name);
    if (!n || !n.trim()) return;
    c.name = n.trim();
    App.categoriesDirty = true;
    App.markDirty();
    this.render();
  },

  async deleteCol(i) {
    const c = App.categories[i];
    if (!c || c.fixed) return;
    const ok = await confirmAsync('حذف فئة', `هل تريد حذف الفئة "${c.name}" كاملاً مع كل الأكواد التي تحتها؟`, 'حذف');
    if (!ok) return;
    App.categories.splice(i, 1);
    App.categoriesDirty = true;
    App.markDirty();
    this.render();
  },

  save() {
    // Clean up: trailing empty cells
    App.categories.forEach(c => {
      while (c.codes.length && !String(c.codes[c.codes.length-1]).trim()) c.codes.pop();
    });
    this.close();
    App.categoriesDirty = true;
    App.markDirty();
    try { CatView.refresh(); } catch {}
    toast('تم حفظ الفئات محلياً — اضغط "نشر التعديلات" لنشرها');
    log('تم حفظ الفئات محلياً (بانتظار النشر)', true);
  },

  close() { $('categoriesModal').classList.remove('open'); try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {} },

  toCSV() {
    // Clean
    const cols = App.categories.map(c => ({
      ...c,
      codes: c.codes.map(v => String(v ?? '').trim()).filter(Boolean)
    }));
    const h = Math.max(...cols.map(c => c.codes.length), 0);
    const rows = [];
    rows.push(cols.map(c => c.name));
    for (let i = 0; i < h; i++) {
      rows.push(cols.map(c => c.codes[i] || ''));
    }
    // BOM for Arabic/Excel support
    return '\uFEFF' + Papa.unparse(rows);
  }
};

/* ======================= SUBCATEGORIES MANAGER ======================= */
const SubCat = {
  expanded: new Set(),
  async open() {
    await App.ensureSubcategories();
    $('subCatsModal').classList.add('open');
    this.render();
  },
  close() { $('subCatsModal').classList.remove('open'); try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {} },
  render() {
    const box = $('subCatsList');
    if (!box) return;
    const mains = App.mainCats || [];
    if (!mains.length) { box.innerHTML = '<div class="csv-empty">لا توجد فئات أساسية بعد — أضف واحدة</div>'; return; }
    box.innerHTML = mains.map((m, mi) => {
      const isOpen = this.expanded.has(mi);
      const count = (m.subs || []).reduce((a, s) => a + (s.codes || []).length, 0);
      return `<div class="scat-main ${isOpen ? 'open' : ''}">
        <div class="scat-main-head">
          <input class="input" value="${esc(m.name)}" onchange="SubCat.renameMain(${mi}, this.value)" style="flex:1;font-weight:700" dir="rtl">
          <span class="csv-item-badge">${count} منتج</span>
          <button class="btn-icon" onclick="SubCat.addSub(${mi})" title="إضافة فئة فرعية">${ico('plus')}</button>
          <button class="btn-icon del" onclick="SubCat.deleteMain(${mi})" title="حذف الفئة الأساسية">${ico('trash')}</button>
          <button class="btn-icon" onclick="SubCat.toggle(${mi})" title="فتح/طي">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
        ${isOpen ? `<div class="scat-subs">${this.renderSubs(mi)}</div>` : ''}
      </div>`;
    }).join('');
  },
  renderSubs(mi) {
    const m = App.mainCats[mi]; if (!m) return '';
    const subs = m.subs || [];
    if (!subs.length) return '<div class="csv-empty">لا توجد فئات فرعية — أضف واحدة</div>';
    return subs.map((s, si) => `
      <div class="scat-sub">
        <div class="scat-sub-head">
          <span class="chip chip-indigo">${esc(s.name)}</span>
          <button class="btn-icon" onclick="SubCat.deleteSub(${mi}, ${si})" title="حذف الفئة الفرعية">${ico('trash')}</button>
        </div>
        <textarea class="input font-mono" dir="ltr" rows="${Math.max(2, Math.min(6, s.codes.length))}" oninput="SubCat.onCodesInput(${mi}, ${si}, this.value)" placeholder="أكواد المنتجات — كود في كل سطر">${esc((s.codes || []).join('\n'))}</textarea>
      </div>`).join('');
  },
  toggle(mi) {
    if (this.expanded.has(mi)) this.expanded.delete(mi); else this.expanded.add(mi);
    this.render();
  },
  onCodesInput(mi, si, val) {
    const s = App.mainCats[mi]?.subs?.[si]; if (!s) return;
    s.codes = String(val || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    App.subcatsDirty = true;
    App.markDirty();
  },
  async addMain() {
    const name = await promptModal.open('اسم الفئة الأساسية الجديدة:', '');
    if (!name || !name.trim()) return;
    App.mainCats.push({ name: name.trim(), subs: [] });
    App.subcatsDirty = true;
    App.markDirty();
    this.render();
  },
  async renameMain(mi, val) {
    const m = App.mainCats[mi]; if (m && val) m.name = String(val).trim();
    if (m && val) { App.subcatsDirty = true; App.markDirty(); }
  },
  async deleteMain(mi) {
    const m = App.mainCats[mi]; if (!m) return;
    const ok = await confirmAsync('حذف فئة أساسية', `حذف الفئة الأساسية "${m.name}" وجميع فئاتها الفرعية؟`, 'حذف');
    if (!ok) return;
    App.mainCats.splice(mi, 1);
    this.expanded.delete(mi);
    App.subcatsDirty = true;
    App.markDirty();
    this.render();
  },
  async addSub(mi) {
    const m = App.mainCats[mi]; if (!m) return;
    const name = await promptModal.open(`اسم الفئة الفرعية ضمن "${m.name}":`, '');
    if (!name || !name.trim()) return;
    m.subs.push({ name: name.trim(), codes: [] });
    App.subcatsDirty = true;
    App.markDirty();
    this.render();
  },
  async deleteSub(mi, si) {
    const m = App.mainCats[mi]; if (!m) return;
    const s = m.subs[si]; if (!s) return;
    const ok = await confirmAsync('حذف فئة فرعية', `حذف الفئة الفرعية "${s.name}" مع ${s.codes.length} كود؟`, 'حذف');
    if (!ok) return;
    m.subs.splice(si, 1);
    App.subcatsDirty = true;
    App.markDirty();
    this.render();
  },
  save() {
    App.subcatsDirty = true;
    App.markDirty();
    this.close();
    toast('تم حفظ الفئات الفرعية — اضغط "نشر التعديلات" لرفعها');
    log('تم حفظ الفئات الفرعية محلياً (بانتظار النشر)', true);
  }
};

/* ======================= PRODUCTS MANAGER ======================= */
const Products = {
  editingIndex: -1,
  tempPhotos: [], // { name, base64, previewUrl }
  disRules: [],   // { type, qty, value }
  selected: new Set(), // codes selected for bulk actions

  /* ---------- BULK SELECTION ---------- */
  toggleSelect(input) {
    const code = String(input?.dataset?.code || '').trim();
    if (!code) return;
    if (input.checked) this.selected.add(code);
    else this.selected.delete(code);
    this.updateBulkBar();
  },
  selectAll(checked) {
    this.selected = new Set();
    if (checked) (App.products || []).forEach(p => this.selected.add(String(p.code || '')));
    this.renderTable();
    this.updateBulkBar();
  },
  clearSelection() {
    this.selected = new Set();
    this.renderTable();
    this.updateBulkBar();
  },
  updateBulkBar() {
    const bar = $('bulkBar');
    const count = this.selected.size;
    if (bar) bar.classList.toggle('hidden', count === 0);
    const c = $('bulkCount');
    if (c) c.textContent = count ? `${count} منتج محدد` : '';
    const selAll = $('selectAllChk');
    if (selAll) selAll.checked = count > 0 && count === (App.products || []).length;
  },

  async bulkClassify() {
    if (this.selected.size === 0) { toast('اختر منتجات أولاً', false); return; }
    const box = $('bulkCatsBox');
    if (!box) return;
    await App.ensureSubcategories();
    let html = '';
    const fixedNames = ['منتهي كمية', 'رائج', 'صفحة رئيسية'];
    html += `<div class="flex flex-wrap gap-2" style="width:100%">`;
    fixedNames.forEach(n => {
      const c = App.categories.find(x => x.name === n);
      html += `<button onclick="Products.applyBulkCategory(this)" data-cat="${esc(n)}" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-2 rounded-lg text-sm font-bold border border-indigo-200">${esc(n)} (${c ? c.codes.length : 0})</button>`;
    });
    html += `</div>`;
    (App.mainCats || []).forEach((m, mi) => {
      html += `<div style="width:100%;margin-top:8px">
        <div style="font-weight:800;font-size:12px;color:#4338ca;margin-bottom:6px">${esc(m.name)}</div>
        <div class="flex flex-wrap gap-2">`;
      (m.subs || []).forEach((s, si) => {
        html += `<button onclick="Products.applyBulkCategory(this)" data-sub="${mi}:${si}" class="bg-white hover:bg-indigo-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold border border-slate-200">${esc(s.name)} (${s.codes.length})</button>`;
      });
      html += `</div></div>`;
    });
    box.innerHTML = html || '<div class="text-slate-400 text-sm">لا توجد فئات</div>';
    $('bulkCatsModal').classList.add('open');
  },
  closeBulkCats() { $('bulkCatsModal').classList.remove('open'); },
  applyBulkCategory(btn) {
    const replace = $('bulkReplaceCheck')?.checked || false;
    const codes = Array.from(this.selected);
    const fixedName = String(btn?.dataset?.cat || '').trim();
    const subKey = String(btn?.dataset?.sub || '').trim();
    let label = '';
    if (subKey) {
      const [mi, si] = subKey.split(':').map(Number);
      const sub = App.mainCats[mi]?.subs?.[si];
      if (!sub) return;
      if (replace) codes.forEach(c => App.removeCodeFromAllSubcats(c));
      for (const code of codes) { if (!sub.codes.includes(code)) sub.codes.push(code); }
      label = sub.name;
    } else if (fixedName) {
      const target = App.categories.find(c => c.name === fixedName);
      if (!target) return;
      if (replace) App.categories.forEach(col => { if (col.fixed) col.codes = col.codes.filter(c => !codes.includes(c)); });
      for (const code of codes) { if (!target.codes.includes(code)) target.codes.push(code); }
      label = fixedName;
    } else return;
    this.closeBulkCats();
    this.renderTable();
    if (subKey) App.subcatsDirty = true;
    else App.categoriesDirty = true;
    App.markDirty();
    toast(`تم تصنيف ${codes.length} منتجات ضمن "${label}" — اضغط نشر التعديلات`);
    log(`تم تصنيف ${codes.length} منتجات ضمن "${label}" محلياً`, true);
  },

  async bulkDelete() {
    if (this.selected.size === 0) { toast('اختر منتجات أولاً', false); return; }
    const count = this.selected.size;
    const ok = await confirmAsync(`حذف ${count} منتج`, `هل أنت متأكد من حذف ${count} منتج محدد؟\nسيتم حذفها من ملف CSV المنتجات وجميع الفئات.`, 'نعم، احذف', true);
    if (!ok) return;
    const codes = Array.from(this.selected);
    codes.forEach(code => {
      const idx = App.products.findIndex(p => String(p.code || '') === code);
      if (idx >= 0) {
        const pp = App.products[idx];
        const photoPaths = App.collectPhotosForCode(code, pp.photo || '');
        for (const ph of photoPaths) if (!App.photoDeletions.includes(ph)) App.photoDeletions.push(ph);
        App.products.splice(idx, 1);
      }
      App.categories.forEach(col => { col.codes = col.codes.filter(c => c !== code); });
      App.removeCodeFromAllSubcats(code);
    });
    App.currentCsvDirty = true;
    App.categoriesDirty = true;
    App.subcatsDirty = true;
    this.clearSelection();
    this.renderTable();
    App.markDirty();
    toast(`تم حذف ${count} منتج محلياً — اضغط نشر التعديلات`);
    log(`تم حذف ${count} منتج محلياً (بانتظار النشر)`, true);
  },

  onCodeChange() {
    const el = $('f_code');
    if (el) {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const v = String(el.value || '');
      const upper = v.toUpperCase();
      if (upper !== v) { el.value = upper; try { el.setSelectionRange(start, end); } catch {} }
    }
    clearTimeout(this._codeTimer);
    this._codeTimer = setTimeout(() => {
      this.refreshPhotoPreview();
      this.updatePhotoField();
    }, 200);
  },
  onSearchInput() {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.renderTable(), 250);
  },

  /* ---------- HIDE PRICES (eye toggle) ---------- */
  applyPricesVisibility() {
    if (localStorage.getItem('hjy_prices_hidden') === '1') document.body.classList.add('prices-hidden');
    else document.body.classList.remove('prices-hidden');
    this.updatePricesToggleUI();
  },
  togglePricesVisibility() {
    document.body.classList.toggle('prices-hidden');
    localStorage.setItem('hjy_prices_hidden', document.body.classList.contains('prices-hidden') ? '1' : '0');
    this.updatePricesToggleUI();
    try { CatView.render(); } catch {}
  },
  updatePricesToggleUI() {
    const hidden = document.body.classList.contains('prices-hidden');
    const btn = $('togglePricesBtn');
    const lbl = $('togglePricesLabel');
    const eye = $('togglePricesEye');
    if (btn) btn.title = hidden ? 'إظهار رأس المال والربح (H / P)' : 'إخفاء رأس المال والربح (H / P)';
    if (lbl) lbl.textContent = hidden ? 'إظهار H و P' : 'إخفاء H و P';
    if (eye) {
      eye.innerHTML = hidden
        ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
    }
    const sBtn = $('settingsPricesBtn');
    if (sBtn) sBtn.textContent = hidden ? 'إظهار رأس المال والربح (H / P)' : 'إخفاء رأس المال والربح (H / P)';
  },

  /* ---------- TABLE DENSITY ---------- */
  applyDensity() {
    const d = localStorage.getItem('hjy_table_density') === 'compact' ? 'compact' : 'normal';
    document.body.classList.toggle('table-compact', d === 'compact');
    ['densityNormal', 'densityCompact'].forEach(id => {
      const b = $(id);
      if (b) b.classList.remove('border-primary', 'bg-sky-50');
    });
    const active = $(d === 'compact' ? 'densityCompact' : 'densityNormal');
    if (active) active.classList.add('border-primary', 'bg-sky-50');
  },
  setDensity(mode) {
    localStorage.setItem('hjy_table_density', mode === 'compact' ? 'compact' : 'normal');
    this.applyDensity();
    toast(mode === 'compact' ? 'جدول مضغوط' : 'جدول عادي');
  },

  /* ---------- STOCK TOGGLE (متوفر / منتهي كمية) ---------- */
  toggleStock(i) {
    const p = App.products[i]; if (!p) return;
    const code = String(p.code || '');
    let col = App.categories.find(c => c.name === 'منتهي كمية');
    if (!col) { col = { name: 'منتهي كمية', codes: [], fixed: true }; App.categories.push(col); }
    const idx = col.codes.indexOf(code);
    if (idx >= 0) col.codes.splice(idx, 1);
    else col.codes.push(code);
    App.categoriesDirty = true;
    this.renderTable();
    App.markDirty();
    try { CatView.refresh(); } catch {}
    toast(idx >= 0 ? `تم إرجاع ${code} للمتوفر` : `تم وضع ${code} ضمن منتهي الكمية`);
    log(`تغيير حالة التوفر لـ ${code}: ${idx >= 0 ? 'متوفر' : 'منتهي الكمية'} (بانتظار النشر)`, true);
  },

  /* ---------- ACTION POPUP MENU (حذف / نقل) ---------- */
  _menuDocHandler: null,
  closeActionMenu() {
    const menu = $('productActionMenu');
    if (menu) menu.classList.remove('open');
    if (this._menuDocHandler) { document.removeEventListener('click', this._menuDocHandler); this._menuDocHandler = null; }
  },
  openActionMenu(btn, i) {
    const p = App.products[i]; if (!p) return;
    this.closeActionMenu();
    const menu = $('productActionMenu');
    menu.innerHTML = `
      <button class="action-menu-item danger" onclick="Products.deleteProduct(${i}); Products.closeActionMenu()">
        ${ico('trash')} حذف المنتج
      </button>
      <button class="action-menu-item" onclick="Products.openFromProduct(${i}); Products.closeActionMenu()">
        ${ico('folder')} نقل / نسخ إلى CSV
      </button>`;
    const r = btn.getBoundingClientRect();
    const menuW = 168;
    let right = window.innerWidth - r.right + 4;
    right = Math.max(8, right);
    const maxRight = window.innerWidth - menuW - 8;
    if (right > maxRight) right = maxRight;
    let top = r.bottom + 4;
    if (top + 100 > window.innerHeight) top = Math.max(8, r.top - 100 - 4);
    menu.style.right = right + 'px';
    menu.style.top = top + 'px';
    menu.classList.add('open');
    this._menuBtn = btn;
    this._menuDocHandler = (e) => {
      const m = $('productActionMenu');
      if (!m.classList.contains('open')) return;
      if (m.contains(e.target) || (this._menuBtn && this._menuBtn.contains(e.target))) return;
      this.closeActionMenu();
    };
    setTimeout(() => document.addEventListener('click', this._menuDocHandler), 0);
  },

  /* ---------- INLINE EDIT (double-click on table cells) ---------- */
  inlineEdit(cell, field, i) {
    const p = App.products[i]; if (!p) return;
    const isNum = field === 'h' || field === 'p';
    const isAbout = field === 'about1';
    const isCode = field === 'code';
    const el = document.createElement(isAbout ? 'textarea' : 'input');
    el.className = 'inline-edit';
    if (isNum) { el.type = 'number'; el.step = '0.01'; }
    el.value = String(p[field] ?? '');
    el.dir = isCode ? 'ltr' : 'rtl';
    cell.innerHTML = '';
    cell.appendChild(el);
    el.focus();
    el.select();
    let done = false;
    const commit = () => {
      if (done) return; done = true;
      Products.inlineCommit(cell, field, i, el.value);
    };
    const cancel = () => {
      if (done) return; done = true;
      Products.renderTable();
    };
    el.onkeydown = (e) => {
      if (e.key === 'Enter' && !(isAbout && e.shiftKey)) { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.stopPropagation(); cancel(); }
    };
    el.onblur = () => setTimeout(commit, 120);
  },
  inlineCommit(cell, field, i, rawVal) {
    const p = App.products[i]; if (!p) return;
    const val = String(rawVal ?? '').trim();
    if (field === 'h' || field === 'p') {
      const num = val === '' ? '' : (Number(val) || 0);
      if (field === 'h') p.h = num; else p.p = num;
      const h = Number(p.h) || 0, pp = Number(p.p) || 0;
      if (h || pp) p.price = Math.round((h + pp) * 100) / 100;
    } else if (field === 'code') {
      const newCode = val.toUpperCase();
      if (!newCode) { this.renderTable(); return; }
      const oldCode = String(p.code || '');
      if (newCode !== oldCode) {
        if (App.products.some(x => x !== p && String(x.code || '').trim() === newCode)) {
          toast('يوجد منتج آخر بنفس الكود', false);
          this.renderTable(); return;
        }
        p.code = newCode;
        // keep photo references working + update categories references
        App.categories.forEach(col => {
          col.codes = col.codes.map(c => (String(c).trim() === oldCode ? newCode : c));
        });
        App.categoriesDirty = true;
        let subChanged = false;
        (App.mainCats || []).forEach(m => (m.subs || []).forEach(s => {
          const idx = (s.codes || []).indexOf(oldCode);
          if (idx >= 0) { s.codes[idx] = newCode; subChanged = true; }
        }));
        if (subChanged) App.subcatsDirty = true;
      }
    } else {
      p[field] = val;
    }
    App.currentCsvDirty = true;
    App.markDirty();
    this.renderTable();
    try { CatView.refresh(); } catch {}
  },

  /* ---------- MOVE / COPY ---------- */
  bulkMove() {
    if (this.selected.size === 0) { toast('اختر منتجات أولاً', false); return; }
    const codes = Array.from(this.selected);
    MoveProducts.open(codes, `${codes.length} منتج محدد من الملف ${App.currentCsvBasename}`);
  },
  openFromProduct(i) {
    const p = App.products[i]; if (!p) return;
    const code = String(p.code || '');
    let codes;
    // if multiple products are already selected, move/copy ALL of them (more convenient)
    if (this.selected.size > 1 && this.selected.has(code)) codes = Array.from(this.selected);
    else codes = [code];
    MoveProducts.open(codes, codes.length > 1 ? `${codes.length} منتج محدد` : `منتج واحد: ${p.code} — ${p.name || ''}`);
  },

  /* ---------- PRODUCT ORDER (inside the current CSV) ---------- */
  moveProduct(index, dir) {
    if (String($('searchInput')?.value || '').trim()) {
      return toast('امسح البحث أولاً حتى يكون الترتيب واضحاً', false);
    }
    const arr = App.products || [];
    const j = Number(index) + Number(dir);
    if (!Number.isInteger(index) || index < 0 || j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    App.currentCsvDirty = true;
    if (App.currentCsv) App.otherCsvDrafts[App.currentCsv] = App.buildCsvFromProducts();
    App.markDirty();
    App.persistPendingNow();
    this.renderTable();
    toast('تم تغيير الترتيب محلياً — اضغط نشر التعديلات');
  },

  /* ---------- RENDER TABLE ---------- */
  renderTable() {
    const q = String($('searchInput')?.value || '').trim().toLowerCase();
    let list = App.products || [];
    if (q) list = list.filter(p => String(p.code||'').toLowerCase().includes(q) || String(p.name||'').toLowerCase().includes(q));
    const tbody = $('productsTableBody');
    const colOut = (App.categories.find(c => c.name === 'منتهي كمية')?.codes || []);
    const colHot = (App.categories.find(c => c.name === 'رائج')?.codes || []);
    const colHome = (App.categories.find(c => c.name === 'صفحة رئيسية')?.codes || []);

    let html = '';
    let outCount = 0, hotCount = 0, homeCount = 0;
    (App.products || []).forEach(p => {
      const code = String(p.code || '');
      if (colOut.includes(code)) outCount++;
      if (colHot.includes(code)) hotCount++;
      if (colHome.includes(code)) homeCount++;
    });
    $('statTotal').textContent = App.products?.length || 0;
    $('statHot').textContent = hotCount;
    $('statHome').textContent = homeCount;
    $('statOut').textContent = outCount;

    list.forEach((p, i) => {
      const realIndex = App.products.indexOf(p);
      const code = String(p.code || '');
      const candList = genPhotoCandidates(code, p.photo || '', 0);
      const firstSrc = candList[0] || '';
      const candJson = esc(JSON.stringify(candList));
      const cats = [];
      if (colOut.includes(code)) cats.push('<span class="chip chip-rose">منتهي</span>');
      if (colHot.includes(code)) cats.push('<span class="chip chip-amber">HOT</span>');
      if (colHome.includes(code)) cats.push('<span class="chip chip-sky">رئيسية</span>');
      // Subcategories (main -> sub)
      App.categoriesOf(code).forEach(x => {
        cats.push(`<span class="chip chip-indigo" title="${esc(x.main)}">${esc(x.sub)}</span>`);
      });
      const isSel = this.selected.has(code) ? ' checked' : '';
      const isOut = colOut.includes(code);
      const priceHtml = `<div class="price">$${nf(p.price)}</div>${p.dis ? `<span class="chip chip-amber" style="margin-top:4px">عروض</span>` : ''}`;
      html += `<tr class="row-hover group${this.selected.has(code) ? ' row-selected' : ''}">
        <td class="cell cell-center" style="width:44px"><input type="checkbox" class="w-4 h-4 cursor-pointer row-select" data-code="${esc(code)}"${isSel} onchange="Products.toggleSelect(this)"></td>
        <td class="cell code-cell editable" title="دبل كليك للتعديل السريع" ondblclick="Products.inlineEdit(this,'code',${realIndex})">${esc(code)}</td>
        <td class="cell name-cell editable" title="دبل كليك للتعديل السريع" ondblclick="Products.inlineEdit(this,'name',${realIndex})">${esc(p.name || '')}</td>
        <td class="cell about-cell editable" title="دبل كليك للتعديل السريع" ondblclick="Products.inlineEdit(this,'about1',${realIndex})">${esc(p.about1 || '')}</td>
        <td class="cell num-cell">${priceHtml}</td>
        <td class="cell num-cell editable" title="دبل كليك للتعديل (يُحدّث السعر تلقائياً)" ondblclick="Products.inlineEdit(this,'h',${realIndex})">${p.h === '' || p.h == null ? '' : nf(p.h)}</td>
        <td class="cell num-cell editable" title="دبل كليك للتعديل (يُحدّث السعر تلقائياً)" ondblclick="Products.inlineEdit(this,'p',${realIndex})">${p.p === '' || p.p == null ? '' : nf(p.p)}</td>
        <td class="cell img-cell">
          <img loading="lazy" src="${esc(firstSrc)}" alt="" data-src-list="${candJson}" data-src-idx="0" onerror="window.__adminImgFallback && window.__adminImgFallback(this)" class="pimg">
        </td>
        <td class="cell cats-cell"><div class="cats-wrap">${cats.join('') || '<span class="text-xs" style="color:#c0c4cc">—</span>'}</div></td>
        <td class="cell actions-cell">
          <button onclick="Products.moveProduct(${realIndex}, -1)" class="btn btn-sm btn-ghost" title="رفع المنتج للأعلى">↑</button>
          <button onclick="Products.moveProduct(${realIndex}, 1)" class="btn btn-sm btn-ghost" title="إنزال المنتج للأسفل">↓</button>
          <button onclick="Products.openEditor(${realIndex})" class="btn btn-sm btn-ghost" title="تعديل">${ico('edit')} تعديل</button>
          <button class="stock-toggle${isOut ? ' out' : ''}" onclick="Products.toggleStock(${realIndex})" role="switch" aria-checked="${isOut}" title="${isOut ? 'غير متوفر — اضغط لإعادته متوفراً' : 'اضغط لوضعه ضمن منتهي الكمية (غير متوفر)'}">
            <span class="stock-knob"></span>
            <span class="stock-txt">${isOut ? 'غير متوفر' : 'متوفر'}</span>
          </button>
          <button class="btn btn-sm btn-ghost" onclick="Products.openActionMenu(this, ${realIndex})" title="المزيد: حذف / نقل">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </td>
      </tr>`;
    });
    if (!html) html = `<tr><td colspan="10" style="padding:56px 24px;text-align:center;color:#9ca3af;font-weight:600">لا توجد منتجات مطابقة لعملية البحث</td></tr>`;
    tbody.innerHTML = html;
    $('tableCountInfo').textContent = `${list.length} منتج ${list.length !== (App.products||[]).length ? `(من أصل ${App.products.length})` : ''}`;
    this.updateBulkBar();
  },

  /* ---------- OPEN / CLOSE EDITOR ---------- */
  async openEditor(index = -1) {
    this.editingIndex = index;
    this.disRules = [];
    this.disNote = '';
    this.tempPhotos = [];
    $('productModalTitle').textContent = index < 0 ? 'إضافة منتج جديد' : 'تعديل المنتج';
    if (App.photoIndexMap == null) await App.loadPhotoIndex();
    await App.ensureSubcategories();
    const p = index >= 0 ? App.products[index] : { code:'', name:'', about1:'', about2:'', price:'', h:'', p:'', photo:'', dis:'' };
    $('f_code').value = p.code || '';
    $('f_name').value = p.name || '';
    $('f_about1').value = p.about1 || '';
    $('f_about2').value = p.about2 || '';
    if (typeof autoGrow === 'function') { autoGrow($('f_about1')); autoGrow($('f_about2')); }
    $('f_h').value = p.h ?? '';
    $('f_p').value = p.p ?? '';
    const hRaw = String(p.h ?? '').trim();
    const pRaw = String(p.p ?? '').trim();
    const hasHP = hRaw !== '' || pRaw !== '';
    const calcSum = hasHP ? Math.round((Number(hRaw)||0) * 100 + (Number(pRaw)||0) * 100) / 100 : '';
    $('f_price').value = calcSum !== '' ? calcSum : (p.price ?? '');
    // auto-fill photo names from photo/files.txt index if the field is empty (old products)
    let photoVal = String(p.photo || '').trim();
    if (!photoVal && p.code && App.photoIndexMap) {
      const found = App.photoIndexMap.get(String(p.code).toLowerCase());
      if (Array.isArray(found) && found.length) {
        photoVal = found.map(rel => String(rel).split('/').pop().replace(/\.[^./]+$/, '')).join(', ');
      }
    }
    $('f_photo').value = photoVal;
    // Checkboxes from categories
    const catCodes = (name) => App.categories.find(c => c.name === name)?.codes || [];
    const colOut = catCodes('منتهي كمية');
    const colHot = catCodes('رائج');
    const colHome = catCodes('صفحة رئيسية');
    $('cat_out').checked = colOut.includes(String(p.code||''));
    $('cat_hot').checked = colHot.includes(String(p.code||''));
    $('cat_home').checked = colHome.includes(String(p.code||''));
    // Parse dis
    this.parseDisToRules(p.dis || '');
    if ($('f_dis_note')) $('f_dis_note').value = this.disNote || '';
    this.renderDisRules();
    // Custom categories checkboxes
    this.renderCustomCatsCheckboxes(String(p.code||''));
    // photo preview
    this.refreshPhotoPreview();
    // photo file listeners (main + extras)
    $('photoFileInputMain').onchange = (e) => { this.onPhotoFilesMain(e); e.target.value = ''; };
    $('photoFileInputExtra').onchange = (e) => { this.onPhotoFilesExtra(e); e.target.value = ''; };
    $('photoFileInputMain').value = '';
    $('photoFileInputExtra').value = '';
    $('productModal').classList.add('open');
  },
  closeEditor() { $('productModal').classList.remove('open'); this.tempPhotos = []; },

  renderCustomCatsCheckboxes(currentCode) {
    const box = $('customCatsBox');
    const mains = App.mainCats || [];
    if (mains.length === 0) { box.innerHTML = '<div class="text-xs text-slate-400">لا توجد فئات بعد. أضفها من زر "إدارة الفئات" في البار الجانبي</div>'; return; }
    let html = '';
    mains.forEach((m, mi) => {
      html += `<div style="width:100%">
        <div style="font-weight:800;font-size:12px;color:#4338ca;margin:2px 0 6px">${esc(m.name)}</div>
        <div class="flex flex-wrap gap-2">`;
      (m.subs || []).forEach((s, si) => {
        const checked = (s.codes || []).includes(currentCode) ? 'checked' : '';
        html += `<label class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300"><input type="checkbox" data-subcat="${mi}:${si}" ${checked} class="w-4 h-4 text-indigo-600"><span class="text-sm font-bold text-slate-700">${esc(s.name)}</span></label>`;
      });
      html += `</div></div>`;
    });
    box.innerHTML = html;
  },

  /* ---------- PRICE ---------- */
  calcPrice() {
    const h = Number($('f_h').value || 0);
    const p = Number($('f_p').value || 0);
    $('f_price').value = (Math.round((h+p)*100)/100);
    this.renderDisRules();
  },

  /* ---------- DISCOUNT RULES ---------- */
  parseDisToRules(dis) {
    this.disRules = [];
    this.disNote = '';
    if (!dis) return;
    const d = String(dis);
    let noteMatch = d.match(/^\s*"([\s\S]*?)"\s*$/);
    if (noteMatch) this.disNote = String(noteMatch[1] || '').trim();
    else {
      noteMatch = d.match(/"([^"]*)"/);
      if (noteMatch) this.disNote = String(noteMatch[1] || '').trim();
      else {
        noteMatch = d.match(/--([\s\S]*?)--/);
        if (noteMatch) this.disNote = String(noteMatch[1] || '').trim();
      }
    }
    const cleaned = noteMatch ? d.replace(/"[\s\S]*?"/, '').replace(/--[\s\S]*?--/, '') : d;
    const parts = cleaned.split(/\s*,\s*/).filter(Boolean);
    for (const part of parts) {
      const m1 = part.match(/^(\d+)\s*[Pp]\s*=\s*(\d+(?:\.\d+)?)\s*%?$/);
      if (m1) { this.disRules.push({ type: 'percent', qty: +m1[1], value: +m1[2] }); continue; }
      const m2 = part.match(/^(\d+)\s*[+＋]?\s*[Pp]\s*=\s*(\d+(?:\.\d+)?)$/);
      if (m2) { this.disRules.push({ type: 'fixed', qty: +m2[1], value: +m2[2] }); continue; }
    }
  },
  rulesToDisString() {
    const rules = this.disRules.map(r => r.type === 'percent' ? `${r.qty}P=${r.value}%` : `${r.qty}+P=${r.value}`).join(', ');
    const note = String(this.disNote || '').trim();
    if (note) return rules ? `${rules}, "${note}"` : `"${note}"`;
    return rules;
  },
  async addDiscount(type) {
    const res = await discountModal.open(type);
    if (!res) return;
    const qty = Number(res.qty), val = Number(res.val);
    if (!qty || isNaN(qty) || qty <= 0) return;
    if (isNaN(val) || val < 0) return;
    if (type === 'percent') {
      this.disRules.push({ type: 'percent', qty, value: val });
    } else {
      this.disRules.push({ type: 'fixed', qty, value: val });
    }
    this.renderDisRules();
  },
  removeDis(i) { this.disRules.splice(i, 1); this.renderDisRules(); },
  updateDisQty(i, v) { if (!isNaN(+v) && +v > 0) this.disRules[i].qty = +v; this.renderDisRules(); },
  updateDisValue(i, v) { if (!isNaN(+v) && +v >= 0) this.disRules[i].value = +v; this.renderDisRules(); },

  renderDisRules() {
    const box = $('disBox');
    const price = Number($('f_price').value || 0);
    if (this.disRules.length === 0) {
      box.innerHTML = '<div class="dis-empty">لم تتم إضافة أي خصومات بعد. اضغط على زر الأعلى لإضافة عرض.</div>';
      $('f_dis').value = '';
      return;
    }
    $('f_dis').value = this.rulesToDisString();
    let html = '';
    this.disRules.forEach((r, i) => {
      if (r.type === 'percent') {
        const newP = Math.max(0, (price * (1 - r.value/100)));
        html += `<div class="dis-entry grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div class="md:col-span-1 text-center"><span class="chip bg-orange-100 text-orange-700">% نسبة</span></div>
          <div class="md:col-span-3 flex items-center gap-2 text-sm">عند <input type="number" min="1" value="${r.qty}" oninput="Products.updateDisQty(${i},this.value)" class="w-16 border border-amber-300 rounded px-2 py-1 font-bold text-center"> قطعة فما فوق</div>
          <div class="md:col-span-3 flex items-center gap-2 text-sm">خصم <input type="number" min="0" step="0.1" value="${r.value}" oninput="Products.updateDisValue(${i},this.value)" class="w-20 border border-amber-300 rounded px-2 py-1 font-bold text-center"> %</div>
          <div class="md:col-span-4 flex items-center gap-2 text-sm font-bold">
            <span class="text-slate-500 line-through">$${nf(price)}</span>
            <span class="mx-1">→</span>
            <span class="text-success text-lg">$${nf(newP)}</span>
          </div>
          <div class="md:col-span-1 text-left"><button onclick="Products.removeDis(${i})" class="text-danger hover:text-red-700 text-xl leading-none">×</button></div>
        </div>`;
      } else {
        html += `<div class="dis-entry grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div class="md:col-span-1 text-center"><span class="chip bg-green-100 text-green-700">$ ثابت</span></div>
          <div class="md:col-span-3 flex items-center gap-2 text-sm">عند <input type="number" min="1" value="${r.qty}" oninput="Products.updateDisQty(${i},this.value)" class="w-16 border border-amber-300 rounded px-2 py-1 font-bold text-center"> قطعة فما فوق</div>
          <div class="md:col-span-3 flex items-center gap-2 text-sm">خصم بالسعر ليصبح <input type="number" min="0" step="0.01" value="${r.value}" oninput="Products.updateDisValue(${i},this.value)" class="w-24 border border-amber-300 rounded px-2 py-1 font-bold text-center"> $</div>
          <div class="md:col-span-4 flex items-center gap-2 text-sm font-bold">
            <span class="text-slate-500 line-through">$${nf(price)}</span>
            <span class="mx-1">→</span>
            <span class="text-success text-lg">$${nf(r.value)}</span>
          </div>
          <div class="md:col-span-1 text-left"><button onclick="Products.removeDis(${i})" class="text-danger hover:text-red-700 text-xl leading-none">×</button></div>
        </div>`;
      }
    });
    box.innerHTML = html;
  },

  /* ---------- PHOTOS ---------- */
  async onPhotoFilesMain(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    const code = String($('f_code').value || '').trim().toUpperCase();
    if (!code) { toast('اكتب الكود CODE أولاً لتسمية الصورة', false); return; }
    toast('جاري تحويل الصورة الأساسية إلى WEBP...');
    const names = ($('f_photo').value || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    let okCount = 0, failCount = 0;
    for (const file of files) {
      try {
        const blob = await ImgConv.toWebP(file);
        const base64 = await ImgConv.blobToBase64(blob);
        const name = `${code}.webp`;
        const ti = this.tempPhotos.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
        if (ti >= 0) { try { URL.revokeObjectURL(this.tempPhotos[ti].preview); } catch {} this.tempPhotos.splice(ti, 1); }
        const preview = URL.createObjectURL(blob);
        this.tempPhotos.push({ name, base64, preview, blob });
        const noMain = names.filter(n => n !== code);
        noMain.unshift(code);
        $('f_photo').value = noMain.join(', ');
        okCount++;
      } catch (err) {
        failCount++;
        toast('فشل تحويل الصورة: ' + file.name, false);
        log('فشل تحويل صورة ' + file.name + ' — ' + (err && err.message || err), false);
      }
    }
    this.refreshPhotoPreview();
    if (failCount) toast(`تم تحويل ${okCount} صورة أساسية، فشل ${failCount}`);
    else toast(`تم تحويل الصورة الأساسية ${code}.webp`);
    log(`تم تحويل ${okCount} صورة أساسية` + (failCount ? ` وفشل ${failCount}` : ''), failCount === 0);
  },

  async onPhotoFilesExtra(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    const code = String($('f_code').value || '').trim().toUpperCase();
    if (!code) { toast('اكتب الكود CODE أولاً لتسمية الصور', false); return; }
    toast('جاري تحويل الصور الإضافية إلى WEBP...');
    const names = ($('f_photo').value || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    let currentIdx = 1;
    while (names.includes(`${code}-${currentIdx}`)) currentIdx++;
    let okCount = 0, failCount = 0;
    for (const file of files) {
      try {
        const blob = await ImgConv.toWebP(file);
        const base64 = await ImgConv.blobToBase64(blob);
        let name = `${code}-${currentIdx}.webp`;
        while (names.includes(name.replace(/\.webp$/i, ''))) { currentIdx++; name = `${code}-${currentIdx}.webp`; }
        const preview = URL.createObjectURL(blob);
        this.tempPhotos.push({ name, base64, preview, blob });
        names.push(name.replace(/\.webp$/i, ''));
        currentIdx++;
        okCount++;
      } catch (err) {
        failCount++;
        toast('فشل تحويل صورة: ' + file.name, false);
        log('فشل تحويل صورة ' + file.name + ' — ' + (err && err.message || err), false);
      }
    }
    $('f_photo').value = names.join(', ');
    this.refreshPhotoPreview();
    if (failCount) toast(`تم تحويل ${okCount} صورة إضافية، فشل ${failCount}`);
    else toast(`تم تحويل ${okCount} صورة إضافية`);
    log(`تم تحويل ${okCount} صورة إضافية` + (failCount ? ` وفشل ${failCount}` : ''), failCount === 0);
  },

  refreshPhotoPreview() {
    const box = $('photoPreview');
    const code = String($('f_code').value || '').trim();
    const names = ($('f_photo').value || '').split(',').map(s => s.trim()).filter(Boolean);
    const tempByName = Object.fromEntries(this.tempPhotos.map(t => [t.name.replace(/\.webp$/i,''), t]));
    const items = names.map((nRaw, idx) => {
      const n = nRaw.replace(/\.webp$/i,'');
      const t = tempByName[n];
      if (t) return { kind:'temp', src: t.preview, name: n, cands: null };
      const cands = genPhotoCandidates(code, names.join(','), idx);
      return { kind:'remote', src: cands[0] || NO_IMG_SVG, name: n, cands };
    });
    if (items.length === 0) { box.innerHTML = '<div class="photo-empty">لم تتم إضافة أي صور بعد</div>'; return; }
    box.innerHTML = items.map((it, i) => {
      const candsAttr = it.cands ? ` data-src-list="${esc(JSON.stringify(it.cands))}" data-src-idx="0" onerror="window.__adminImgFallback && window.__adminImgFallback(this)"` : ` onerror="this.onerror=null;this.src=NO_IMG_SVG"`;
      const star = i === 0
        ? `<button type="button" class="main-mark active" title="هذه الصورة الأساسية">★</button>`
        : `<button type="button" class="main-mark" onclick="Products.setAsMain(${i})" title="تعيين هذه الصورة كأساسية (تظهر باسم الكود)">☆</button>`;
      return `<div class="photo-item">
        ${star}
        <img src="${esc(it.src)}"${candsAttr} alt="">
        <button type="button" onclick="Products.removePhoto(${i})" class="rm" title="إزالة">×</button>
        <div class="cap">${esc(it.name)}</div>
      </div>`;
    }).join('');
  },

  updatePhotoField() { this.refreshPhotoPreview(); },

  removePhoto(i) {
    const names = ($('f_photo').value || '').split(',').map(s => s.trim()).filter(Boolean);
    const removed = names[i];
    names.splice(i, 1);
    // also remove from tempPhotos if present
    const idxT = this.tempPhotos.findIndex(t => t.name.replace(/\.webp$/i,'') === (removed||'').replace(/\.webp$/i,''));
    if (idxT >= 0) { try { URL.revokeObjectURL(this.tempPhotos[idxT].preview); } catch {} this.tempPhotos.splice(idxT, 1); }
    $('f_photo').value = names.join(', ');
    this.refreshPhotoPreview();
  },

  /* ---------- SET AS MAIN PHOTO ----------
     Rotates photos so the chosen one becomes CODE.webp (the main image).
     New uploads (temp) are renamed; existing photos are downloaded and
     re-uploaded under their new names on save. */
  async setAsMain(idx) {
    const names = ($('f_photo').value || '').split(',').map(s => s.trim()).filter(Boolean);
    if (idx <= 0 || idx >= names.length) { toast(idx === 0 ? 'هذه هي الصورة الأساسية أصلاً' : 'لا توجد صورة محددة', false); return; }
    const code = String($('f_code').value || '').trim().toUpperCase();
    if (!code) { toast('اكتب الكود CODE أولاً', false); return; }
    const target = names[idx];
    const rest = names.slice(0, idx).concat(names.slice(idx + 1));
    const newOrder = [target, ...rest];
    const newNames = newOrder.map((_, k) => (k === 0 ? code : `${code}-${k}`));
    const tempByName = Object.fromEntries(this.tempPhotos.map(t => [t.name.replace(/\.webp$/i, '').toLowerCase(), t]));
    toast('جاري إعادة ترتيب الصور...');
    // 1) free the names that are about to change (avoid collisions between temps)
    let phCount = 0;
    for (let k = 0; k < newOrder.length; k++) {
      const oldName = newOrder[k], newName = newNames[k];
      if (oldName.toLowerCase() === newName.toLowerCase()) continue;
      const t = tempByName[oldName.toLowerCase()];
      if (t) t.name = `__ph${phCount++}.webp`;
    }
    // 2) assign final names to temps + download remote photos that moved
    for (let k = 0; k < newOrder.length; k++) {
      const oldName = newOrder[k], newName = newNames[k];
      if (oldName.toLowerCase() === newName.toLowerCase()) continue;
      const t = tempByName[oldName.toLowerCase()];
      if (t) {
        t.name = newName + '.webp';
      } else {
        const b64 = await this._fetchPhotoBase64(oldName);
        if (!b64) { toast('تعذر تحميل الصورة: ' + oldName, false); this.refreshPhotoPreview(); return; }
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'image/webp' });
        const preview = URL.createObjectURL(blob);
        this.tempPhotos.push({ name: newName + '.webp', base64: b64, preview, blob });
      }
    }
    $('f_photo').value = newNames.join(', ');
    this.refreshPhotoPreview();
    App.markDirty();
    toast(`تم تعيين ${target} كصورة أساسية (ستظهر باسم ${code})`);
    log(`تعيين ${target} كصورة أساسية للمنتج ${code}`, true);
  },

  async _fetchPhotoBase64(name) {
    const clean = String(name || '').replace(/\.webp$/i, '');
    const urls = [];
    for (const sub of PHOTO_SUBDIRS) urls.push(sub ? `../photo/${sub}/${clean}.webp` : `../photo/${clean}.webp`);
    const cfg = GH.getCfg();
    const parts = String(cfg.repo || '').split('/');
    if (parts.length >= 2) {
      const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}/${encodeURIComponent(cfg.branch || 'main')}`;
      for (const sub of PHOTO_SUBDIRS) urls.push(sub ? `${rawBase}/photo/${sub}/${encodeURIComponent(clean)}.webp` : `${rawBase}/photo/${encodeURIComponent(clean)}.webp`);
    }
    for (const u of urls) {
      try {
        const r = await fetch(u, { cache: 'no-store' });
        if (r.ok) {
          const blob = await r.blob();
          if (blob.size) return await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
        }
      } catch {}
    }
    return null;
  },

  /* ---------- SAVE / DELETE ---------- */
  async saveEditor() {
    const code = String($('f_code').value || '').trim().toUpperCase();
    const name = String($('f_name').value || '').trim();
    if (!code) { toast('يجب إدخال الكود CODE', false); return; }
    if (!name) { toast('يجب إدخال الاسم NAME', false); return; }
    $('f_code').value = code;
    this.disNote = $('f_dis_note') ? String($('f_dis_note').value || '').trim() : (this.disNote || '');
    const obj = {
      code,
      name,
      about1: $('f_about1').value || '',
      about2: $('f_about2').value || '',
      h: Number($('f_h').value || 0),
      p: Number($('f_p').value || 0),
      price: Number($('f_price').value || 0),
      photo: ($('f_photo').value || '').trim(),
      dis: this.rulesToDisString(),
      keywords: App.products[this.editingIndex]?.keywords || '',
      category: App.products[this.editingIndex]?.category || '',
    };

    // capture the previous code BEFORE replacing the product
    const prevCode = this.editingIndex >= 0 ? String(App.products[this.editingIndex]?.code || '') : code;

    // Update product in list
    if (this.editingIndex < 0) App.products.unshift(obj);
    else App.products[this.editingIndex] = obj;
    App.currentCsvDirty = true;

    // Checkboxes -> categories (only touch them when the classification really changed)
    const desiredOut = $('cat_out').checked;
    const desiredHot = $('cat_hot').checked;
    const desiredHome = $('cat_home').checked;
    const checkedSubs = new Set();
    document.querySelectorAll('input[data-subcat]').forEach(chk => {
      if (chk.checked) checkedSubs.add(chk.dataset.subcat);
    });
    const codeChanged = prevCode !== code;
    const hasCode = (name) => !!App.categories.find(c => c.name === name)?.codes.includes(prevCode);
    const catsNeed = codeChanged || desiredOut !== hasCode('منتهي كمية') || desiredHot !== hasCode('رائج') || desiredHome !== hasCode('صفحة رئيسية');
    const curSubs = new Set();
    (App.mainCats || []).forEach((m, mi) => (m.subs || []).forEach((s, si) => { if ((s.codes || []).includes(prevCode)) curSubs.add(`${mi}:${si}`); }));
    const sameSet = (a, b) => a.size === b.size && Array.from(a).every(x => b.has(x));
    const subsNeed = codeChanged || !sameSet(curSubs, checkedSubs);

    if (catsNeed) {
      App.categories.forEach(col => { col.codes = col.codes.filter(c => c !== prevCode && c !== code); });
      const ensureCat = (name) => {
        let col = App.categories.find(c => c.name === name);
        if (!col) { col = { name, codes: [], fixed: true }; App.categories.push(col); }
        return col;
      };
      if (desiredOut) ensureCat('منتهي كمية').codes.push(code);
      if (desiredHot) ensureCat('رائج').codes.push(code);
      if (desiredHome) ensureCat('صفحة رئيسية').codes.push(code);
      App.categoriesDirty = true;
    }
    if (subsNeed) {
      App.removeCodeFromAllSubcats(prevCode);
      App.removeCodeFromAllSubcats(code);
      for (const key of checkedSubs) {
        const [mi, si] = String(key).split(':').map(Number);
        const sub = App.mainCats[mi]?.subs?.[si];
        if (sub) { if (!sub.codes.includes(code)) sub.codes.push(code); }
      }
      App.subcatsDirty = true;
    }

    // Queue photos to be uploaded on publish (manual)
    for (const ph of this.tempPhotos) {
      App.photoUploads.push({ path: `photo/${ph.name}`, base64: ph.base64 });
      try { URL.revokeObjectURL(ph.preview); } catch {}
    }
    this.tempPhotos = [];
    this.closeEditor();
    this.renderTable();
    App.markDirty();
    toast(`تم حفظ المنتج ${code} محلياً — اضغط "نشر التعديلات" لرفعه للموقع`);
    log(`تم حفظ المنتج ${code} محلياً (بانتظار النشر)`, true);
  },

  async deleteProduct(i) {
    const p = App.products[i]; if (!p) return;
    const ok = await confirmAsync('حذف منتج', `هل أنت متأكد من حذف المنتج:\n${p.code} - ${p.name}\n\nسيتم حذفه من ملف CSV المنتجات فقط.`, 'حذف');
    if (!ok) return;
    const code = String(p.code || '');
    // queue the product's photos for deletion (GitHub + local on publish)
    const photoPaths = App.collectPhotosForCode(code, p.photo || '');
    for (const ph of photoPaths) if (!App.photoDeletions.includes(ph)) App.photoDeletions.push(ph);
    App.products.splice(i, 1);
    // Also remove from all categories + subcategories
    App.categories.forEach(col => { col.codes = col.codes.filter(c => c !== code); });
    App.removeCodeFromAllSubcats(code);
    App.categoriesDirty = true;
    App.subcatsDirty = true;
    App.currentCsvDirty = true;
    this.renderTable();
    App.markDirty();
    toast('تم حذف المنتج محلياً — اضغط "نشر التعديلات" لرفعه');
    log(`تم حذف المنتج ${code} محلياً (بانتظار النشر)` + (photoPaths.length ? ` + ${photoPaths.length} صورة` : ''), true);
  }
};

/* ======================= SITE TEXT EDITOR (promo / what_new / new_offer) ======================= */
const SiteText = {
  _path: null,
  async open(title, path, hint) {
    this._path = String(path || '');
    const t = $('siteTextTitle'); if (t) t.textContent = String(title || 'تحرير النص');
    const h = $('siteTextHint'); if (h) h.textContent = String(hint || '');
    const area = $('siteTextArea');
    if (area) { area.value = 'جارٍ التحميل...'; area.disabled = true; }
    $('siteTextModal').classList.add('open');
    let txt = null;
    try { txt = await App.getCsvText(this._path); } catch {}
    if (txt == null) txt = '';
    if (area) { area.value = String(txt); area.disabled = false; area.focus(); }
  },
  close() { $('siteTextModal').classList.remove('open'); this._path = null; },
  save() {
    if (!this._path) return;
    const area = $('siteTextArea'); if (!area) return;
    App.otherCsvDrafts[this._path] = String(area.value ?? '');
    App.markDirty();
    App.persistPendingNow();
    log('تم تعديل ' + this._path + ' محلياً (بانتظار النشر)', true);
    toast('تم الحفظ محلياً — اضغط "نشر التعديلات"');
    this.close();
  }
};

/* ======================= SITE PAGES MANAGER (about / QA) ======================= */
const SitePages = {
  type: 'about',
  _lines: [],
  indexPath() { return this.type === 'qa' ? 'data/qa_files.txt' : 'data/about_files.txt'; },
  dir() { return this.type === 'qa' ? 'QA' : 'about'; },
  async open(type) {
    this.type = (type === 'qa') ? 'qa' : 'about';
    const isQa = this.type === 'qa';
    const t = $('sitePagesTitle'); if (t) t.textContent = isQa ? 'إدارة أقسام الأسئلة الشائعة (QA)' : 'إدارة صفحات about';
    const s = $('sitePagesSub');
    if (s) s.textContent = isQa
      ? 'كل ملف = قسم/زر في صفحة الأسئلة الشائعة. يمكنك الإضافة والتعديل والحذف.'
      : 'كل ملف = صفحة تظهر في شريط الأسفل. يمكنك الإضافة والتعديل والحذف (ملفات CSV غير مشمولة).';
    $('sitePagesModal').classList.add('open');
    await this.render();
  },
  close() { $('sitePagesModal').classList.remove('open'); try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {} },
  async reload() { await this.render(); },
  async loadIndex() {
    let raw = null;
    try { raw = await App.getCsvText(this.indexPath()); } catch {}
    return String(raw || '').split(/\r?\n/).map(s => s.trim()).filter(l => l && !l.startsWith('#'));
  },
  saveIndex(lines) {
    App.otherCsvDrafts[this.indexPath()] = lines.join('\n') + (lines.length ? '\n' : '');
    App.markDirty();
    App.persistPendingNow();
  },
  async render() {
    const box = $('sitePagesList'); if (!box) return;
    box.innerHTML = '<div class="hint">جارٍ التحميل...</div>';
    const lines = await this.loadIndex();
    this._lines = lines;
    if (!lines.length) { box.innerHTML = '<div class="hint" style="margin:0">لا يوجد صفحات بعد. أضف صفحة/قسم جديد.</div>'; return; }
    let html = '';
    lines.forEach((name, i) => {
      const path = this.dir() + '/' + name;
      const isDraft = Object.prototype.hasOwnProperty.call(App.otherCsvDrafts, path);
      html += `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;background:#fff">
        <div style="min-width:0">
          <div style="font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(name)}</div>
          <div class="hint" style="margin:0">${esc(path)}${isDraft ? ' <b style="color:#2563eb">— تعديل محلي</b>' : ''}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-sm btn-ghost" onclick="SitePages.edit(${i})">تعديل</button>
          <button class="btn btn-sm btn-danger" onclick="SitePages.remove(${i})">حذف</button>
        </div>
      </div>`;
    });
    box.innerHTML = html;
  },
  async edit(i) {
    const lines = await this.loadIndex();
    const name = lines[i]; if (!name) return;
    const path = this.dir() + '/' + name;
    SiteText.open('تحرير: ' + name.replace(/\.txt$/i, ''), path, 'محتوى ' + path);
  },
  async addNew() {
    const nameRaw = await promptModal.open('اسم الصفحة/القسم الجديد:', '');
    const name = String(nameRaw || '').trim().replace(/[\/\\:*?"<>|]/g, '').replace(/\.txt$/i, '').trim();
    if (!name) return;
    const fileName = name + '.txt';
    const lines = await this.loadIndex();
    if (lines.some(l => l.toLowerCase() === fileName.toLowerCase())) { toast('يوجد صفحة بنفس الاسم', false); return; }
    const path = this.dir() + '/' + fileName;
    App.otherCsvDrafts[path] = '';
    const nl = lines.concat([fileName]);
    this.saveIndex(nl);
    await this.render();
    SiteText.open('تحرير: ' + name, path, 'اكتب محتوى الصفحة ثم احفظ.');
  },
  async remove(i) {
    const lines = await this.loadIndex();
    const name = lines[i]; if (!name) return;
    const ok = await confirmAsync('حذف صفحة', `سيتم حذف «${name}» من مجلد ${this.dir()} ونشر الحذف.\nهل أنت متأكد؟`, 'نعم، احذف', true);
    if (!ok) return;
    const path = this.dir() + '/' + name;
    delete App.otherCsvDrafts[path];
    const nl = lines.filter((_, idx) => idx !== i);
    this.saveIndex(nl);
    if (!App.fileDeletions.includes(path)) App.fileDeletions.push(path);
    App.markDirty();
    App.persistPendingNow();
    await this.render();
    toast('تم الحذف محلياً — اضغط "نشر التعديلات"');
    log('حذف صفحة ' + path + ' محلياً', true);
  }
};

/* ======================= CUSTOMER PHOTOS MANAGER ======================= */
const CustomerPhotos = {
  open() { $('customerPhotosModal').classList.add('open'); this.render(); },
  close() { $('customerPhotosModal').classList.remove('open'); try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {} },
  async list() {
    let lines = [];
    try {
      const raw = await App.getCsvText('customer_photo/files.txt');
      lines = String(raw || '').split(/\r?\n/).map(s => s.trim()).filter(l => l && !l.startsWith('#'));
    } catch {}
    const out = []; const seen = new Set();
    for (const l of lines) {
      let p = String(l).replace(/\\/g, '/').replace(/^\/+/, '');
      if (!p.toLowerCase().startsWith('customer_photo/')) p = 'customer_photo/' + p;
      if (seen.has(p)) continue; seen.add(p);
      if ((App.photoDeletions || []).includes(p)) continue;
      out.push(p);
    }
    for (const up of (App.photoUploads || [])) {
      if (!String(up.path).toLowerCase().startsWith('customer_photo/')) continue;
      if (!seen.has(up.path)) { seen.add(up.path); out.push(up.path); }
    }
    return out;
  },
  srcFor(p) {
    const up = (App.photoUploads || []).find(x => x.path === p);
    if (up) return 'data:image/webp;base64,' + up.base64;
    return '../' + String(p).split('/').map(encodeURIComponent).join('/');
  },
  async render() {
    const grid = $('customerPhotosGrid'); if (!grid) return;
    grid.innerHTML = '<div class="hint">جارٍ التحميل...</div>';
    const items = await this.list();
    if (!items.length) { grid.innerHTML = '<div class="hint" style="margin:0">لا يوجد صور حالياً.</div>'; return; }
    let html = '';
    for (const p of items) {
      const up = (App.photoUploads || []).find(x => x.path === p);
      const src = this.srcFor(p);
      html += `<div style="position:relative;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;aspect-ratio:1;background:#fff">
        <img src="${esc(src)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;cursor:zoom-in;display:block" onclick="CustomerPhotos.view(this.src)">
        <button title="حذف" onclick="CustomerPhotos.remove('${esc(p)}')" style="position:absolute;top:6px;${'inset-inline-end'}:6px;background:#e11d48;color:#fff;border:0;border-radius:8px;padding:4px 8px;cursor:pointer;font-size:12px">حذف</button>
        ${up ? '<span style="position:absolute;bottom:6px;inset-inline-start:6px;background:#2563eb;color:#fff;border-radius:8px;padding:2px 6px;font-size:10px">جديدة</span>' : ''}
      </div>`;
    }
    grid.innerHTML = html;
  },
  view(src) {
    try { const w = window.open('', '_blank'); if (w) w.document.write('<title>صورة</title><body style="margin:0;background:#111"><img src="' + src + '" style="max-width:100%;max-height:100vh;display:block;margin:auto"></body>'); } catch {}
  },
  async upload(files) {
    const arr = Array.from(files || []).filter(f => f && /^image\//.test(f.type));
    const inp = $('customerPhotosInput'); if (inp) inp.value = '';
    if (!arr.length) return;
    const status = $('customerPhotosStatus');
    let n = 0;
    for (const f of arr) {
      n++;
      if (status) status.textContent = `جارٍ ضغط وتحويل ${n}/${arr.length}...`;
      try {
        const blob = await ImgConv.toWebP(f, 1200);
        const b64 = await ImgConv.blobToBase64(blob);
        const name = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
        App.photoUploads.push({ path: 'customer_photo/' + name, base64: b64 });
      } catch (e) { log('فشل تحويل صورة: ' + (e.message || e), false); }
    }
    App.markDirty();
    App.persistPendingNow();
    if (status) status.textContent = `تم تجهيز ${arr.length} صورة — اضغط "نشر التعديلات" لرفعها`;
    await this.render();
    toast('تم تجهيز الصور — اضغط "نشر التعديلات"');
  },
  async remove(path) {
    const ok = await confirmAsync('حذف صورة', 'سيتم حذف الصورة نهائياً من الموقع عند النشر. هل أنت متأكد؟', 'حذف');
    if (!ok) return;
    const i = (App.photoUploads || []).findIndex(x => x.path === path);
    if (i >= 0) App.photoUploads.splice(i, 1);
    else if (!App.photoDeletions.includes(path)) App.photoDeletions.push(path);
    App.markDirty();
    App.persistPendingNow();
    await this.render();
    toast('تم تجهيز الحذف — اضغط "نشر التعديلات"');
  }
};

/* ======================= GALLERY MANAGER (photos / videos) ======================= */
function csvCell(v) {
  const s = String(v ?? '');
  return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const GalleryManager = {
  type: 'photos',
  items: [],
  categories: [],
  editingId: null,
  _pickedPath: null,
  _pickedBase64: null,
  open() {
    $('galleryModal').classList.add('open');
    this.type = 'photos';
    this.setTabs();
    this.loadData().then(() => this.render());
  },
  close() { $('galleryModal').classList.remove('open'); this.cancelItem(); try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {} },
  async reload() { await this.loadData(); this.render(); },
  setTabs() {
    const p = $('galleryTabPhotos'), v = $('galleryTabVideos');
    if (p) p.className = 'btn ' + (this.type === 'photos' ? 'btn-primary' : 'btn-ghost');
    if (v) v.className = 'btn ' + (this.type === 'videos' ? 'btn-primary' : 'btn-ghost');
    const wrap = $('galPhotoWrap');
    if (wrap) wrap.style.display = this.type === 'photos' ? '' : 'none';
  },
  switchType(t) { this.type = (t === 'videos') ? 'videos' : 'photos'; this.setTabs(); this.cancelItem(); this.loadData().then(() => this.render()); },
  listPath() { return 'data/' + this.type + '_list.csv'; },
  catPath() { return 'data/' + this.type + '_categories.csv'; },
  async loadData() {
    let listTxt = '', catTxt = '';
    try { listTxt = String((await App.getCsvText(this.listPath())) || ''); } catch {}
    try { catTxt = String((await App.getCsvText(this.catPath())) || ''); } catch {}
    this.items = this.parseList(listTxt);
    const parsed = this.parseCats(catTxt);
    this.categories = parsed.categories;
    for (const it of this.items) it.category = parsed.byId[it.id] || '';
    for (const c of this.categories) { /* keep */ }
  },
  parseList(txt) {
    if (!String(txt).trim()) return [];
    let data = [];
    try { data = (Papa.parse(String(txt).trim(), { header: true, skipEmptyLines: true }).data) || []; } catch { return []; }
    const out = [];
    for (const r of data) {
      const keys = Object.keys(r || {});
      const get = (names) => {
        for (const k of keys) {
          const kk = String(k).replace(/^\uFEFF/, '').trim().toLowerCase();
          if (names.includes(kk)) return String(r[k] ?? '').trim();
        }
        return '';
      };
      const id = get(['#', 'id', 'رقم']);
      const title = get(['title', 'name', 'اسم', 'عنوان']);
      const url = get(['url', 'link', 'رابط', 'لينك']);
      if (!id && !url && !title) continue;
      out.push({
        id: id || String(out.length + 1),
        title,
        url,
        description: get(['description', 'desc', 'about', 'وصف']),
        order: Number(get(['order', 'sort', 'ترتيب']) || 0) || 0,
        category: ''
      });
    }
    return out;
  },
  parseCats(txt) {
    const categories = []; const byId = {};
    if (!String(txt).trim()) return { categories, byId };
    let rows = [];
    try { rows = (Papa.parse(String(txt).trim(), { header: false, skipEmptyLines: true }).data) || []; } catch { return { categories, byId }; }
    if (!rows.length) return { categories, byId };
    const header = (rows[0] || []).map(c => String(c ?? '').trim());
    header.forEach((name, i) => {
      if (!name) return;
      categories.push(name);
      for (let r = 1; r < rows.length; r++) {
        const id = String((rows[r] || [])[i] ?? '').trim();
        if (id && byId[id] === undefined) byId[id] = name;
      }
    });
    return { categories, byId };
  },
  persist() {
    this.items.forEach((it, i) => { if (!it.id) it.id = String(i + 1); });
    const titleKey = this.type === 'videos' ? 'title' : 'name';
    const listRows = [`#;${titleKey};url;description;order`];
    for (const it of this.items) {
      listRows.push([it.id, it.title || '', it.url || '', it.description || '', Number(it.order) || 0].map(csvCell).join(';'));
    }
    App.otherCsvDrafts[this.listPath()] = listRows.join('\n') + '\n';
    const cats = [];
    for (const c of this.categories) if (c && !cats.includes(c)) cats.push(c);
    for (const it of this.items) if (it.category && !cats.includes(it.category)) cats.push(it.category);
    const idCols = cats.map(c => this.items.filter(it => it.category === c).map(it => it.id));
    const maxLen = Math.max(0, ...idCols.map(a => a.length));
    const catRows = [cats.map(csvCell).join(';')];
    for (let r = 0; r < maxLen; r++) catRows.push(idCols.map(a => csvCell(a[r] || '')).join(';'));
    App.otherCsvDrafts[this.catPath()] = catRows.join('\n') + '\n';
    App.markDirty();
    App.persistPendingNow();
  },
  srcFor(it) {
    const url = String(it.url || '');
    if (!url) return '';
    if (/^https?:/i.test(url)) return url;
    const up = (App.photoUploads || []).find(x => x.path === url);
    if (up) return 'data:image/webp;base64,' + up.base64;
    return '../' + url.split('/').map(encodeURIComponent).join('/');
  },
  onSearch() { this.render(); },
  render() {
    const box = $('galleryList'); if (!box) return;
    const filter = $('galleryFilter');
    if (filter) {
      const cur = filter.value;
      filter.innerHTML = '<option value="">كل الأقسام</option>' +
        this.categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('') +
        '<option value="__none__">غير مصنّف</option>';
      if (cur && Array.from(filter.options).some(o => o.value === cur)) filter.value = cur;
    }
    const catSel = $('galCategory');
    if (catSel) {
      const cur = catSel.value;
      catSel.innerHTML = '<option value="">— بدون قسم —</option>' + this.categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
      if (cur) catSel.value = cur;
    }
    const q = String($('gallerySearch')?.value || '').trim().toLowerCase();
    const cat = String(filter?.value || '');
    const sortBy = String($('gallerySortBy')?.value || 'order');
    let items = this.items.slice();
    if (cat === '__none__') items = items.filter(it => !it.category);
    else if (cat) items = items.filter(it => it.category === cat);
    if (q) items = items.filter(it => `${it.title} ${it.url} ${it.description}`.toLowerCase().includes(q));
    if (sortBy === 'title') items.sort((a, b) => String(a.title).localeCompare(String(b.title), 'ar'));
    else if (sortBy === 'new') items.sort((a, b) => Number(b.id) - Number(a.id));
    else items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const st = $('galleryStatus');
    if (st) st.textContent = `${items.length} من ${this.items.length} عنصر — ${this.categories.length} قسم`;
    if (!items.length) { box.innerHTML = '<div class="hint" style="margin:0">لا يوجد عناصر.</div>'; return; }
    let html = '<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">';
    for (const it of items) {
      const src = this.srcFor(it);
      const yt = this.type === 'videos' ? extractYtId(it.url) : '';
      const thumb = yt ? `https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg` : (this.type === 'photos' ? src : '');
      html += `<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;display:flex;flex-direction:column">
        <div style="aspect-ratio:16/9;background:#f1f5f9;overflow:hidden">
          ${thumb ? `<img src="${esc(thumb)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : `<div style="height:100%;display:grid;place-items:center;color:#94a3b8;font-weight:800">${this.type === 'videos' ? 'VIDEO' : 'لا صورة'}</div>`}
        </div>
        <div style="padding:10px;display:grid;gap:4px;flex:1">
          <div style="font-weight:800;line-height:1.35">${esc(it.title || '(بدون عنوان)')}</div>
          <div class="hint" style="margin:0">${esc(it.category || 'غير مصنّف')} • ترتيب: ${esc(Number(it.order) || 0)} • #${esc(it.id)}</div>
          ${it.description ? `<div style="font-size:12px;color:#475569;line-height:1.5">${esc(String(it.description).slice(0, 140))}</div>` : ''}
          <div class="hint" style="margin:0;direction:ltr;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.url || '')}</div>
        </div>
        <div style="display:flex;gap:6px;padding:0 10px 10px">
          <button class="btn btn-sm btn-ghost" style="flex:1" onclick="GalleryManager.editItem('${esc(it.id)}')">تعديل</button>
          <button class="btn btn-sm btn-danger" onclick="GalleryManager.deleteItem('${esc(it.id)}')">حذف</button>
        </div>
      </div>`;
    }
    html += '</div>';
    box.innerHTML = html;
  },
  addItem() {
    this.editingId = null;
    this._pickedPath = null; this._pickedBase64 = null;
    const set = (id, v) => { const e = $(id); if (e) e.value = v; };
    set('galTitle', ''); set('galUrl', ''); set('galDesc', ''); set('galOrder', '0');
    const c = $('galCategory'); if (c) c.value = '';
    const pv = $('galPhotoPreview'); if (pv) pv.textContent = '';
    const t = $('galleryEditorTitle'); if (t) t.textContent = this.type === 'videos' ? 'إضافة فيديو' : 'إضافة صورة';
    const ed = $('galleryEditor'); if (ed) ed.style.display = 'block';
    setTimeout(() => { try { $('galTitle')?.focus(); } catch {} }, 50);
  },
  editItem(id) {
    const it = this.items.find(x => String(x.id) === String(id));
    if (!it) return;
    this.editingId = it.id;
    this._pickedPath = null; this._pickedBase64 = null;
    const set = (i, v) => { const e = $(i); if (e) e.value = v; };
    set('galTitle', it.title || ''); set('galUrl', it.url || ''); set('galDesc', it.description || ''); set('galOrder', String(Number(it.order) || 0));
    const c = $('galCategory'); if (c) c.value = it.category || '';
    const pv = $('galPhotoPreview'); if (pv) pv.textContent = '';
    const t = $('galleryEditorTitle'); if (t) t.textContent = 'تعديل العنصر';
    const ed = $('galleryEditor'); if (ed) ed.style.display = 'block';
  },
  cancelItem() {
    this.editingId = null; this._pickedPath = null; this._pickedBase64 = null;
    const ed = $('galleryEditor'); if (ed) ed.style.display = 'none';
  },
  async onPickPhoto(files) {
    const f = (files || [])[0];
    const inp = $('galPhotoInput'); if (inp) inp.value = '';
    if (!f) return;
    const pv = $('galPhotoPreview'); if (pv) pv.textContent = 'جارٍ تحويل الصورة...';
    try {
      const blob = await ImgConv.toWebP(f, 1400);
      const b64 = await ImgConv.blobToBase64(blob);
      const name = `gal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
      this._pickedPath = 'gallery/' + name;
      this._pickedBase64 = b64;
      const u = $('galUrl'); if (u) u.value = this._pickedPath;
      if (pv) pv.textContent = 'تم تجهيز الصورة: ' + this._pickedPath;
    } catch (e) {
      if (pv) pv.textContent = 'فشل تحويل الصورة: ' + (e.message || e);
    }
  },
  saveItem() {
    const title = String($('galTitle')?.value || '').trim();
    const url = String($('galUrl')?.value || '').trim();
    const description = String($('galDesc')?.value || '').trim();
    const category = String($('galCategory')?.value || '').trim();
    const order = Number($('galOrder')?.value || 0) || 0;
    if (!title && !url) { toast('ضع عنواناً أو رابطاً على الأقل', false); return; }
    if (this.editingId != null) {
      const it = this.items.find(x => String(x.id) === String(this.editingId));
      if (it) { it.title = title; it.url = url; it.description = description; it.category = category; it.order = order; }
    } else {
      let maxId = 0;
      for (const it of this.items) { const n = parseInt(String(it.id).replace(/\D/g, ''), 10); if (Number.isFinite(n) && n > maxId) maxId = n; }
      this.items.push({ id: String(maxId + 1), title, url, description, category, order });
    }
    if (this._pickedPath && this._pickedBase64) {
      App.photoUploads.push({ path: this._pickedPath, base64: this._pickedBase64 });
    }
    this.persist();
    this.cancelItem();
    this.render();
    toast('تم الحفظ محلياً — اضغط "نشر التعديلات"');
    log('حفظ عنصر ' + this.type + ' محلياً', true);
  },
  async deleteItem(id) {
    const it = this.items.find(x => String(x.id) === String(id));
    if (!it) return;
    const ok = await confirmAsync('حذف عنصر', `سيتم حذف «${it.title || it.url}» من القائمة.`, 'حذف');
    if (!ok) return;
    const url = String(it.url || '');
    if (/^gallery\//i.test(url)) {
      const i = (App.photoUploads || []).findIndex(x => x.path === url);
      if (i >= 0) App.photoUploads.splice(i, 1);
      else if (!App.photoDeletions.includes(url)) App.photoDeletions.push(url);
    }
    this.items = this.items.filter(x => String(x.id) !== String(id));
    this.persist();
    this.render();
    toast('تم تجهيز الحذف — اضغط "نشر التعديلات"');
  },
  async addCategory() {
    const name = await promptModal.open('اسم القسم الجديد:', '');
    const n = String(name || '').trim();
    if (!n) return;
    if (this.categories.includes(n)) { toast('القسم موجود', false); return; }
    this.categories.push(n);
    this.persist();
    this.render();
    toast('تمت إضافة القسم محلياً');
  }
};
function extractYtId(url) {
  const u = String(url || '');
  let m = u.match(/[?&]v=([\w-]{6,})/);
  if (m) return m[1];
  m = u.match(/youtu\.be\/([\w-]{6,})/);
  if (m) return m[1];
  m = u.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  if (m) return m[1];
  return '';
}

/* ======================= ADMIN TABS ======================= */
const AdminTabs = {
  setActive(tab) {
    const t = String(tab || 'products');
    document.querySelectorAll('#adminTabs .admin-tab').forEach((b) => {
      b.classList.toggle('active', String(b.getAttribute('data-admin-tab') || '') === t);
    });
  },
  open(tab) {
    const t = String(tab || 'products');
    this.setActive(t);
    if (t === 'products') {
      ['categoriesModal', 'settingsModal', 'sitePagesModal', 'galleryModal', 'shippingModal', 'customerPhotosModal']
        .forEach((id) => { const el = $(id); if (el) el.classList.remove('open'); });
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
      return;
    }
    if (t === 'categories') { try { App.openCategoriesManager(); } catch {} return; }
    if (t === 'shipping') { try { ShippingManager.open(); } catch {} return; }
    if (t === 'pages') { try { SitePages.open('about'); } catch {} return; }
    if (t === 'media') { try { GalleryManager.open(); } catch {} return; }
    if (t === 'settings') { try { App.openSettings(); } catch {} return; }
  }
};
window.AdminTabs = AdminTabs;

/* ======================= SHIPPING MANAGER ======================= */
const ShippingManager = {
  tab: 'gov',
  govs: [],
  carriers: [],
  branches: [],
  _branchView: [],
  open() { $('shippingModal').classList.add('open'); this.loadAll().then(() => this.render()); },
  close() {
    $('shippingModal').classList.remove('open');
    try { if (window.AdminTabs) AdminTabs.setActive('products'); } catch {}
  },
  async loadAll() {
    this.govs = await this.loadLines('data/governorates.csv');
    this.carriers = await this.loadLines('data/carriers.csv');
    this.branches = await this.loadBranches();
  },
  async loadLines(path) {
    let raw = '';
    try { raw = String((await App.getCsvText(path)) || ''); } catch {}
    return raw.split(/\r?\n/).map(s => s.trim()).filter(l => l && !l.startsWith('#') && !/^(name|governorate|محافظة|شركة)$/i.test(l));
  },
  async loadBranches() {
    let raw = '';
    try { raw = String((await App.getCsvText('data/branches.csv')) || ''); } catch {}
    if (!raw.trim()) return [];
    let data = [];
    try { data = (Papa.parse(raw.trim(), { header: true, skipEmptyLines: true }).data) || []; } catch { return []; }
    const out = [];
    for (const r of data) {
      const keys = Object.keys(r || {});
      const get = (names) => { for (const k of keys) { const kk = String(k).replace(/^\uFEFF/, '').trim().toLowerCase(); if (names.includes(kk)) return String(r[k] ?? '').trim(); } return ''; };
      const company = get(['company', 'carrier', 'شركة']);
      const gov = get(['governorate', 'gov', 'محافظة']);
      const branch = get(['branch', 'center', 'فرع', 'مركز']);
      const note = get(['note', 'notes', 'ملاحظة', 'ملاحظات']);
      if (company || branch) out.push({ company, gov, branch, note });
    }
    return out;
  },
  switchTab(t) {
    this.tab = t;
    const map = { gov: 'shipTabGov', carriers: 'shipTabCarriers', branches: 'shipTabBranches' };
    for (const [k, id] of Object.entries(map)) { const b = $(id); if (b) b.className = 'btn ' + (k === this.tab ? 'btn-primary' : 'btn-ghost'); }
    this.render();
  },
  render() {
    const box = $('shippingBody'); if (!box) return;
    if (this.tab === 'gov') return this.renderGov(box);
    if (this.tab === 'carriers') return this.renderCarriers(box);
    return this.renderBranches(box);
  },
  rowStyle: 'display:flex;gap:8px;align-items:center;justify-content:space-between;padding:9px 12px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;background:#fff',
  moveBtns(kind, i) {
    return `<button class="btn btn-sm btn-ghost" title="أعلى" onclick="ShippingManager.move${kind}(${i},-1)">↑</button>
      <button class="btn btn-sm btn-ghost" title="أسفل" onclick="ShippingManager.move${kind}(${i},1)">↓</button>`;
  },
  renderGov(box) {
    let html = `<div style="display:flex;gap:8px;margin-bottom:12px"><input id="shipGovNew" class="input" placeholder="اسم محافظة جديدة..." style="max-width:320px"><button class="btn btn-primary" onclick="ShippingManager.addGov()">إضافة محافظة</button></div>`;
    html += this.govs.length ? this.govs.map((g, i) => `<div style="${this.rowStyle}"><div style="font-weight:800">${esc(g)}</div><div style="display:flex;gap:6px">${this.moveBtns('Gov', i)}<button class="btn btn-sm btn-ghost" onclick="ShippingManager.editGov(${i})">تعديل</button><button class="btn btn-sm btn-danger" onclick="ShippingManager.delGov(${i})">حذف</button></div></div>`).join('') : '<div class="hint" style="margin:0">لا يوجد محافظات بعد.</div>';
    box.innerHTML = html;
  },
  renderCarriers(box) {
    let html = `<div style="display:flex;gap:8px;margin-bottom:12px"><input id="shipCarrierNew" class="input" placeholder="اسم شركة شحن جديدة..." style="max-width:320px"><button class="btn btn-primary" onclick="ShippingManager.addCarrier()">إضافة شركة</button></div>`;
    html += this.carriers.length ? this.carriers.map((g, i) => {
      const count = this.branches.filter(b => b.company === g).length;
      return `<div style="${this.rowStyle}"><div style="font-weight:800">${esc(g)} <span class="hint" style="font-weight:600">— ${count} فرع</span></div><div style="display:flex;gap:6px">${this.moveBtns('Carrier', i)}<button class="btn btn-sm btn-ghost" onclick="ShippingManager.editCarrier(${i})">تعديل</button><button class="btn btn-sm btn-danger" onclick="ShippingManager.delCarrier(${i})">حذف</button></div></div>`;
    }).join('') : '<div class="hint" style="margin:0">لا يوجد شركات بعد.</div>';
    box.innerHTML = html;
  },
  renderBranches(box) {
    const compOpts = this.carriers.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    const govOpts = this.govs.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    const filterComp = this.carriers.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    const filterGov = this.govs.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    let html = `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px;background:#f8fafc;margin-bottom:12px">
      <div style="font-weight:800;margin-bottom:8px">إضافة فرع/مركز شحن</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 2fr;gap:8px">
        <div><label class="field-label">شركة الشحن</label><select id="shipBrCompany" class="input"><option value="">اختر الشركة</option>${compOpts}</select></div>
        <div><label class="field-label">المحافظة</label><select id="shipBrGov" class="input"><option value="">اختر المحافظة</option>${govOpts}</select></div>
        <div><label class="field-label">اسم الفرع/المركز</label><input id="shipBrName" class="input"></div>
      </div>
      <div style="margin-top:8px"><label class="field-label">ملاحظة صغيرة (اختياري)</label><input id="shipBrNote" class="input" placeholder="مثال: يفتح 9-5 / لا يوجد رقم هاتف / ..."></div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="ShippingManager.addBranch()">إضافة</button>
    </div>`;
    html += `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <div class="side-search" style="flex:1;min-width:200px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input id="shipBranchSearch" placeholder="بحث في الفروع..." oninput="ShippingManager.renderBranchesList()"></div>
      <select id="shipBranchFilterCompany" class="input" style="max-width:180px" onchange="ShippingManager.renderBranchesList()"><option value="">كل الشركات</option>${filterComp}</select>
      <select id="shipBranchFilterGov" class="input" style="max-width:180px" onchange="ShippingManager.renderBranchesList()"><option value="">كل المحافظات</option>${filterGov}</select>
    </div>`;
    html += '<div id="shipBranchesList"></div>';
    box.innerHTML = html;
    this.renderBranchesList();
  },
  renderBranchesList() {
    const box = $('shipBranchesList'); if (!box) return;
    const q = String($('shipBranchSearch')?.value || '').trim().toLowerCase();
    const fc = String($('shipBranchFilterCompany')?.value || '').trim();
    const fg = String($('shipBranchFilterGov')?.value || '').trim();
    this._branchView = this.branches.map((b, i) => ({ ...b, _i: i })).filter(b => {
      if (fc && b.company !== fc) return false;
      if (fg && b.gov !== fg) return false;
      if (q && !`${b.company} ${b.gov} ${b.branch} ${b.note || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    box.innerHTML = this._branchView.length ? this._branchView.map((b, vi) => `<div style="${this.rowStyle}">
      <div style="min-width:0"><div style="font-weight:800">${esc(b.branch)}</div><div class="hint" style="margin:0">${esc(b.company || '—')} • ${esc(b.gov || '—')}${b.note ? ' • ' + esc(b.note) : ''}</div></div>
      <div style="display:flex;gap:6px">${this.moveBtns('BranchView', vi)}<button class="btn btn-sm btn-ghost" onclick="ShippingManager.editBranch(${b._i})">تعديل</button><button class="btn btn-sm btn-danger" onclick="ShippingManager.delBranch(${b._i})">حذف</button></div>
    </div>`).join('') : '<div class="hint" style="margin:0">لا يوجد فروع مطابقة.</div>';
  },
  persistGov() { App.otherCsvDrafts['data/governorates.csv'] = this.govs.join('\n') + (this.govs.length ? '\n' : ''); App.markDirty(); App.persistPendingNow(); },
  persistCarriers() { App.otherCsvDrafts['data/carriers.csv'] = this.carriers.join('\n') + (this.carriers.length ? '\n' : ''); App.markDirty(); App.persistPendingNow(); },
  persistBranches() {
    const rows = ['company;governorate;branch;note'];
    for (const b of this.branches) rows.push([b.company, b.gov, b.branch, b.note || ''].map(csvCell).join(';'));
    App.otherCsvDrafts['data/branches.csv'] = rows.join('\n') + '\n';
    App.markDirty(); App.persistPendingNow();
  },
  moveGov(i, dir) { const j = i + dir; if (i < 0 || j < 0 || j >= this.govs.length) return; [this.govs[i], this.govs[j]] = [this.govs[j], this.govs[i]]; this.persistGov(); this.render(); },
  moveCarrier(i, dir) { const j = i + dir; if (i < 0 || j < 0 || j >= this.carriers.length) return; [this.carriers[i], this.carriers[j]] = [this.carriers[j], this.carriers[i]]; this.persistCarriers(); this.render(); },
  moveBranchView(vi, dir) {
    const cur = this._branchView[vi], other = this._branchView[vi + dir];
    if (!cur || !other) return;
    const a = cur._i, b = other._i;
    [this.branches[a], this.branches[b]] = [this.branches[b], this.branches[a]];
    this.persistBranches();
    this.renderBranchesList();
  },
  addGov() { const v = String($('shipGovNew')?.value || '').trim(); if (!v) return; if (this.govs.includes(v)) return toast('موجود', false); this.govs.push(v); this.persistGov(); this.render(); },
  async editGov(i) {
    const oldName = this.govs[i] || '';
    const v = await promptModal.open('تعديل المحافظة:', oldName);
    if (v === null) return;
    const n = String(v).trim(); if (!n) return;
    this.govs[i] = n;
    if (oldName && n !== oldName) {
      for (const b of this.branches) if (b.gov === oldName) b.gov = n;
      this.persistBranches();
    }
    this.persistGov(); this.render();
  },
  async delGov(i) {
    const name = this.govs[i] || '';
    const count = this.branches.filter(b => b.gov === name).length;
    const ok = await confirmAsync('حذف محافظة', `حذف «${name}»${count ? ` و${count} فرع مرتبط بها` : ''}؟`, 'حذف');
    if (!ok) return;
    this.govs.splice(i, 1);
    if (count) { this.branches = this.branches.filter(b => b.gov !== name); this.persistBranches(); }
    this.persistGov(); this.render();
  },
  addCarrier() { const v = String($('shipCarrierNew')?.value || '').trim(); if (!v) return; if (this.carriers.includes(v)) return toast('موجود', false); this.carriers.push(v); this.persistCarriers(); this.render(); },
  async editCarrier(i) {
    const oldName = this.carriers[i] || '';
    const v = await promptModal.open('تعديل الشركة:', oldName);
    if (v === null) return;
    const n = String(v).trim(); if (!n) return;
    this.carriers[i] = n;
    if (oldName && n !== oldName) {
      for (const b of this.branches) if (b.company === oldName) b.company = n;
      this.persistBranches();
    }
    this.persistCarriers(); this.render();
  },
  async delCarrier(i) {
    const name = this.carriers[i] || '';
    const count = this.branches.filter(b => b.company === name).length;
    const ok = await confirmAsync('حذف شركة', `حذف «${name}»${count ? ` و${count} فرع مرتبط بها` : ''}؟`, 'حذف');
    if (!ok) return;
    this.carriers.splice(i, 1);
    if (count) { this.branches = this.branches.filter(b => b.company !== name); this.persistBranches(); }
    this.persistCarriers(); this.render();
  },
  addBranch() {
    const company = String($('shipBrCompany')?.value || '').trim();
    const gov = String($('shipBrGov')?.value || '').trim();
    const branch = String($('shipBrName')?.value || '').trim();
    const note = String($('shipBrNote')?.value || '').trim();
    if (!company) return toast('اختر شركة الشحن', false);
    if (!gov) return toast('اختر المحافظة', false);
    if (!branch) return toast('اكتب اسم الفرع', false);
    this.branches.push({ company, gov, branch, note });
    this.persistBranches();
    const n = $('shipBrName'); if (n) n.value = '';
    const nt = $('shipBrNote'); if (nt) nt.value = '';
    this.renderBranchesList();
    toast('تمت إضافة الفرع محلياً');
  },
  async editBranch(i) {
    const b = this.branches[i]; if (!b) return;
    const v = await promptModal.open('اسم الفرع/المركز:', b.branch || '');
    if (v === null) return;
    const n = String(v).trim(); if (!n) return;
    b.branch = n;
    const nt = await promptModal.open('ملاحظة صغيرة (اختياري):', b.note || '');
    if (nt !== null) b.note = String(nt).trim();
    this.persistBranches();
    this.renderBranchesList();
  },
  async delBranch(i) { const b = this.branches[i]; if (!b) return; const ok = await confirmAsync('حذف فرع', `حذف «${b.branch}»?`, 'حذف'); if (!ok) return; this.branches.splice(i, 1); this.persistBranches(); this.renderBranchesList(); }
};

/* ======================= BOOT ======================= */
document.addEventListener('DOMContentLoaded', () => App.init());

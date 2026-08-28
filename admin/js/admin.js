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
$('promptOk').addEventListener('click', () => promptModal.ok());
$('promptInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') promptModal.ok(); });
$('discountOk').addEventListener('click', () => discountModal.ok());
$('discQty').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('discValue').focus(); });
$('discValue').addEventListener('keydown', (e) => { if (e.key === 'Enter') discountModal.ok(); });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
  // photo/files.txt index: finds photos in any subfolder (including older uploads)
  try {
    const mp = App.photoIndexMap;
    if (mp instanceof Map && mp.size) {
      const lookups = [String(code || '').toLowerCase(), String(targetName || '').toLowerCase()];
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
  photoIndexMap: null, // basename(lower) -> photo paths from photo/files.txt
  dirtyCount: 0,      // number of unpublished local edits
  csvFiles: [],       // list of CSV basenames in data-csv
  csvAliases: {},     // basename -> display alias (localStorage only, never pushed)
  csvStats: {},       // basename -> { count, loaded }
  globalIndex: null,  // Map lower(code) -> { code, name, price, about1, photo, csv }
  otherCsvDrafts: {}, // path -> csv text for CSVs modified by move/copy (pending publish)
  currentCsvDirty: false, // true when the currently-open CSV's products were edited

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

  /* ---------- CSV ALIASES (local only) ---------- */
  loadAliases() {
    try { this.csvAliases = JSON.parse(localStorage.getItem('hjy_csv_aliases') || '{}') || {}; }
    catch { this.csvAliases = {}; }
  },
  aliasOf(basename) { return String(this.csvAliases[basename] || '').trim(); },
  setAlias(basename, name) {
    const n = String(name || '').trim();
    if (n) this.csvAliases[basename] = n; else delete this.csvAliases[basename];
    try { localStorage.setItem('hjy_csv_aliases', JSON.stringify(this.csvAliases)); } catch {}
  },
  csvLabel(basename) {
    const alias = this.aliasOf(basename);
    return alias ? `${basename} — ${alias}` : basename;
  },

  /* ---------- CSV FILES LIST ---------- */
  async refreshCsvList() {
    const seen = new Set();
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
        if (r.ok) { const j = await r.json(); if (Array.isArray(j.files)) add(j.files); }
      }
    } catch {}
    // 2) the files.txt index
    const idx = await fetchTextRelatively('data-csv/files.txt');
    if (idx) add(idx.split(/\r?\n/));
    // 3) the actual GitHub directory (catches files pushed to GitHub)
    const ghList = await GH.listFilesInDir('data-csv');
    add(ghList);
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

  async setAliasPrompt(basename) {
    const current = this.aliasOf(basename);
    const name = await promptModal.open(`الاسم البديل الافتراضي للملف ${basename}\n(للبحث والتنظيم داخل البرنامج فقط — لا يُرفع للمستودع):`, current);
    if (name === null) return;
    this.setAlias(basename, name);
    this.populateCsvSelector();
    CsvSidebar.render();
    ProductData.render();
    toast(name ? `تم ضبط الاسم البديل: ${name}` : 'تم إزالة الاسم البديل');
    log(name ? `الاسم البديل للملف ${basename}: ${name}` : `إزالة الاسم البديل للملف ${basename}`, true);
  },

  /* ---------- PHOTO MANIFEST SYNC ---------- */
  async syncPhotoManifests() {
    let ok = true;
    try { ok = await GH.regenerateManifests(); } catch { ok = false; }
    if (LocalSync.isActive()) {
      try { const mf = await GH.getFile('photo/files.txt'); if (mf != null) await LocalSync.writeText('photo/files.txt', mf); } catch {}
      try { const cf = await GH.getFile('customer_photo/files.txt'); if (cf != null) await LocalSync.writeText('customer_photo/files.txt', cf); } catch {}
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
      try { await this.loadCategories(); } catch {}
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

  init() {
    this.loadSettings();
    this.loadAliases();
    this.applyFontSize(localStorage.getItem('hjy_admin_font') || 'md');
    Sidebar.init();
    this.refreshCsvList().then(() => { try { CatView.refresh(); } catch {} });
    this.loadPhotoIndex();
    LocalSync.init();
    Products.applyPricesVisibility();
    Products.applyDensity();
    Sidebar.updateDefaultUI();
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty()) { e.preventDefault(); e.returnValue = ''; }
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
    this.dirtyCount++;
    this._applyPublishState();
  },
  resetDirty() {
    this.dirtyCount = 0;
    this._applyPublishState();
  },
  _applyPublishState() {
    const b = $('saveAllBtn');
    const badge = $('publishBadge');
    const total = this.dirtyCount + Object.keys(this.otherCsvDrafts || {}).length +
      (this.photoUploads && this.photoUploads.length ? 1 : 0) +
      (this.photoDeletions && this.photoDeletions.length ? 1 : 0);
    if (b) { b.disabled = total === 0; if (badge) badge.textContent = total ? String(total) : ''; }
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
    return this.dirtyCount > 0 || this.photoUploads.length > 0 || this.photoDeletions.length > 0 || Object.keys(this.otherCsvDrafts).length > 0;
  },

  loadSettings() {
    const c = GH.getCfg();
    $('s_token').value = c.token;
    $('s_repo').value = c.repo;
    $('s_branch').value = c.branch;
    this.tryAutoLoadToken();
  },

  async tryAutoLoadToken() {
    try {
      const raw = await fetchTextRelatively('token-github.txt');
      if (raw) {
        const t = String(raw).trim();
        if (t && /^[A-Za-z0-9_]{20,}$/.test(t)) {
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
  closeSettings() { $('settingsModal').classList.remove('open'); },
  saveSettings() {
    localStorage.setItem('gh_token', $('s_token').value.trim());
    localStorage.setItem('gh_repo', $('s_repo').value.trim());
    localStorage.setItem('gh_branch', $('s_branch').value.trim());
    toast('تم حفظ الإعدادات');
    this.closeSettings();
    this.populateCsvSelector();
  },

  async testGithubConnection() {
    localStorage.setItem('gh_token', $('s_token').value.trim());
    localStorage.setItem('gh_repo', $('s_repo').value.trim());
    localStorage.setItem('gh_branch', $('s_branch').value.trim());
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
    const files = (this.csvFiles && this.csvFiles.length) ? this.csvFiles : [];
    sel.innerHTML = '<option value="">-- اختر ملف المنتجات CSV للبدء --</option>' +
      files.map(f => `<option value="data-csv/${f}">${esc(this.csvLabel(f))}</option>`).join('');
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
    if (path) { this.currentCsv = path; this.currentCsvBasename = path.split('/').pop(); if (sel.value !== path) sel.value = path; this.currentCsvDirty = false; }
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
    await this.loadCategories();
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
      opt.value = this.currentCsv; opt.textContent = this.csvLabel(n);
      sel.appendChild(opt);
    }
    sel.value = this.currentCsv;
    this._pendingRename = { from: oldPath, to: this.currentCsv };
    toast('تم تغيير الاسم. اضغط "حفظ ونشر" للتنفيذ');
  },

  async loadCategories() {
    let raw = await fetchTextRelatively('data/categories.csv');
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
        this.mainCats.push({ name, subs: subs.map(s => ({ name: s, codes: [] })) });
      }
    }
    // attach codes from B (sub name -> codes)
    const subCodes = {};
    if (rowsB.length) {
      const width = Math.max(...rowsB.map(r => r.length), 0);
      for (let c = 0; c < width; c++) {
        const sname = String(rowsB[0]?.[c] ?? '').replace(/^\uFEFF/, '').trim();
        if (!sname) continue;
        const codes = [];
        for (let r = 1; r < rowsB.length; r++) {
          const v = String(rowsB[r]?.[c] ?? '').trim();
          if (v) codes.push(v);
        }
        subCodes[sname] = codes;
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
    if (!this.currentCsv) { toast('اختر ملف CSV أولاً', false); log('لم يُنشر: لا يوجد ملف CSV محدد', false); return false; }
    toast('جاري حفظ التعديلات ونشرها...');
    log('بدء نشر التعديلات...', true);
    const pendingPhotos = this.photoUploads.slice();
    // upload pending photos first (they were queued on save)
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
    const csv = this.buildCsvFromProducts();
    const okP = await GH.putFile(this.currentCsv, csv, `تحديث المنتجات: ${this.currentCsvBasename}`);
    if (!okP) { log('توقف النشر بسبب فشل رفع CSV المنتجات', false, true); return false; }
    const catsCSV = Categories.toCSV();
    const okC = await GH.putFile('data/categories.csv', catsCSV, 'تحديث categories.csv');
    if (!okC) log('فشل نشر categories.csv', false, true);
    // publish the subcategory structure (SubcategoriesA.csv + SubcategoriesB.csv)
    try {
      const subFiles = this.buildSubcategoryFiles();
      await GH.putFile('data/SubcategoriesA.csv', subFiles.A, 'تحديث الفئات الفرعية SubcategoriesA.csv');
      await GH.putFile('data/SubcategoriesB.csv', subFiles.B, 'تحديث الفئات الفرعية SubcategoriesB.csv');
      if (LocalSync.isActive()) {
        await LocalSync.writeText('data/SubcategoriesA.csv', subFiles.A);
        await LocalSync.writeText('data/SubcategoriesB.csv', subFiles.B);
      }
    } catch {}
    await this.syncLegacyFiles();

    // handle pending rename (old file deleted + index updated)
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

    // publish CSVs modified by move/copy (other than the current one)
    const draftPaths = Object.keys(this.otherCsvDrafts || {});
    if (draftPaths.length) {
      let okD = 0, failD = 0;
      for (const path of draftPaths) {
        if (path === this.currentCsv) continue;
        const txt = this.otherCsvDrafts[path];
        const ok = await GH.putFile(path, txt, `تحديث المنتجات: ${path.split('/').pop()}`);
        if (ok) { okD++; if (LocalSync.isActive()) await LocalSync.writeText(path, txt); }
        else failD++;
      }
      this.otherCsvDrafts = {};
      if (failD) log(`نشر الملفات الأخرى: نجح ${okD} فشل ${failD}`, failD === 0);
      else if (okD) log(`تم نشر ${okD} ملف CSV إضافي (نقل/نسخ)`, true);
    }

    // delete queued photos (product deletion) from GitHub + local
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
    // always regenerate photo/customer_photo manifests so the site shows every uploaded photo
    await GH.regenerateManifests();
    // reload categories from GitHub so the admin always reflects the latest state
    try { await this.loadCategories(); } catch {}
    this.resetDirty();
    this.currentCsvDirty = false;
    // refresh counts / sidebar after publish
    ProductData.refresh();
    CsvSidebar.render();
    // local sync: write the same changes into the local project folder (auto server or linked folder)
    if (LocalSync.isActive()) {
      try { const mf = await GH.getFile('photo/files.txt'); if (mf != null) await LocalSync.writeText('photo/files.txt', mf); } catch {}
      try { const cf = await GH.getFile('customer_photo/files.txt'); if (cf != null) await LocalSync.writeText('customer_photo/files.txt', cf); } catch {}
      await LocalSync.syncAll(pendingPhotos);
    }
    toast('تم نشر التعديلات بنجاح');
    log('تم نشر التعديلات بنجاح ✓', true);
    return true;
  },

  openCategoriesManager() {
    this.loadCategories().then(() => { Categories.render(); $('categoriesModal').classList.add('open'); try { CatView.refresh(); } catch {} });
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
    const allPhotos = [...photoPaths, ...custPaths];
    let localExists = {};
    try { localExists = (await LocalSync.existsBatch(allPhotos)) || {}; } catch {}
    const missingPhotos = allPhotos.filter(p => !localExists[p]);
    // also pull the photo index manifests (needed by the site + admin photo lookup)
    textPaths.push('photo/files.txt', 'customer_photo/files.txt');

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
    const alias = App.aliasOf(basename);
    return basename.toLowerCase().includes(q) || String(alias || '').toLowerCase().includes(q);
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
        App.csvFiles.map(f => `<option value="${esc(f)}"${App.currentCsvBasename === f ? ' selected' : ''}>${esc(App.csvLabel(f))}</option>`).join('');
    }
    if (!box) return;
    const list = App.csvFiles.filter(f => Sidebar.matches(f));
    if (!list.length) { box.innerHTML = '<div class="csv-empty">لا توجد ملفات مطابقة</div>'; return; }
    box.innerHTML = list.map(f => this.item(f)).join('');
  },
  item(basename) {
    const current = App.currentCsvBasename === basename;
    const alias = App.aliasOf(basename);
    const st = App.csvStats[basename];
    const count = st ? st.count : '';
    return `<div class="csv-item ${current ? 'active' : ''}">
      <div class="csv-item-row">
        <div class="csv-item-main" onclick="App.loadCsvByName(this)" data-basename="${esc(basename)}" title="فتح ${esc(basename)}">
          <span class="csv-item-name">${esc(basename)}</span>
          ${alias ? `<span class="csv-item-alias">${esc(alias)}</span>` : ''}
        </div>
        ${count !== '' ? `<span class="csv-item-badge">${count} منتج</span>` : ''}
        <div class="csv-item-actions">
          <button class="btn-icon alias" onclick="App.setAliasPrompt('${esc(basename)}')" title="تعيين اسم بديل">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="btn-icon del" onclick="App.deleteCsv('${esc(basename)}')" title="حذف الملف من المحلي و GitHub">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }
};

/* ======================= PRODUCT DATA (counts + aliases) ======================= */
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
      const alias = App.aliasOf(f);
      const st = App.csvStats[f] || { count: 0 };
      return `<div class="csv-item">
        <div class="csv-item-row">
          <div class="csv-item-main" onclick="App.loadCsvByName(this)" data-basename="${esc(f)}" title="فتح ${esc(f)}">
            <span class="csv-item-name">${esc(f)}</span>
            ${alias ? `<span class="csv-item-alias">${esc(alias)}</span>` : `<span class="csv-item-alias" style="color:#c0c4cc">بدون اسم بديل</span>`}
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
    if (!App.categories.length || !App.categories.some(c => c.name === 'رائج') || force) {
      try { await App.loadCategories(); } catch {}
    }
    try { await App.loadSubcategories(); } catch {}
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
    const list = App.csvFiles.filter(f => f !== App.currentCsvBasename && (!q || f.toLowerCase().includes(q) || App.aliasOf(f).toLowerCase().includes(q)));
    if (!list.length) { box.innerHTML = '<div class="csv-empty">لا توجد ملفات وجهة</div>'; return; }
    box.innerHTML = list.map(f => {
      const st = App.csvStats[f] || { count: 0 };
      const alias = App.aliasOf(f);
      const sel = f === this.target ? ' sel' : '';
      return `<div class="move-target${sel}" onclick="MoveProducts.pick('${esc(f)}')">
        <div class="mt-main">
          <span class="mt-name">${esc(f)}</span>
          ${alias ? `<span class="mt-alias">${esc(alias)}</span>` : ''}
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
      if (path !== App.currentCsv) files.push({ path, content: txt });
    }
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
  },

  async addCategoryColumn() {
    const name = await promptModal.open('اسم الفئة الجديدة (مثل: بطاريات ليثيوم):', '');
    if (!name || !name.trim()) return;
    App.categories.push({ name: name.trim(), codes: [], fixed: false });
    this.render();
  },

  async renameCol(i) {
    const c = App.categories[i];
    if (!c || c.fixed) return;
    const n = await promptModal.open('اسم جديد للفئة:', c.name);
    if (!n || !n.trim()) return;
    c.name = n.trim();
    this.render();
  },

  async deleteCol(i) {
    const c = App.categories[i];
    if (!c || c.fixed) return;
    const ok = await confirmAsync('حذف فئة', `هل تريد حذف الفئة "${c.name}" كاملاً مع كل الأكواد التي تحتها؟`, 'حذف');
    if (!ok) return;
    App.categories.splice(i, 1);
    this.render();
  },

  save() {
    // Clean up: trailing empty cells
    App.categories.forEach(c => {
      while (c.codes.length && !String(c.codes[c.codes.length-1]).trim()) c.codes.pop();
    });
    this.close();
    App.markDirty();
    try { CatView.refresh(); } catch {}
    toast('تم حفظ الفئات محلياً — اضغط "نشر التعديلات" لنشرها');
    log('تم حفظ الفئات محلياً (بانتظار النشر)', true);
  },

  close() { $('categoriesModal').classList.remove('open'); },

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
    await App.loadSubcategories();
    $('subCatsModal').classList.add('open');
    this.render();
  },
  close() { $('subCatsModal').classList.remove('open'); },
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
  },
  async addMain() {
    const name = await promptModal.open('اسم الفئة الأساسية الجديدة:', '');
    if (!name || !name.trim()) return;
    App.mainCats.push({ name: name.trim(), subs: [] });
    this.render();
  },
  async renameMain(mi, val) {
    const m = App.mainCats[mi]; if (m && val) m.name = String(val).trim();
  },
  async deleteMain(mi) {
    const m = App.mainCats[mi]; if (!m) return;
    const ok = await confirmAsync('حذف فئة أساسية', `حذف الفئة الأساسية "${m.name}" وجميع فئاتها الفرعية؟`, 'حذف');
    if (!ok) return;
    App.mainCats.splice(mi, 1);
    this.expanded.delete(mi);
    this.render();
  },
  async addSub(mi) {
    const m = App.mainCats[mi]; if (!m) return;
    const name = await promptModal.open(`اسم الفئة الفرعية ضمن "${m.name}":`, '');
    if (!name || !name.trim()) return;
    m.subs.push({ name: name.trim(), codes: [] });
    this.render();
  },
  async deleteSub(mi, si) {
    const m = App.mainCats[mi]; if (!m) return;
    const s = m.subs[si]; if (!s) return;
    const ok = await confirmAsync('حذف فئة فرعية', `حذف الفئة الفرعية "${s.name}" مع ${s.codes.length} كود؟`, 'حذف');
    if (!ok) return;
    m.subs.splice(si, 1);
    this.render();
  },
  save() {
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
    let html = '';
    const fixedNames = ['منتهي كمية', 'رائج', 'صفحة رئيسية'];
    const allCats = [];
    fixedNames.forEach(n => { const c = App.categories.find(x => x.name === n); allCats.push({ name: n, codes: c ? c.codes : [] }); });
    App.categories.filter(c => !c.fixed).forEach(c => allCats.push({ name: c.name, codes: c.codes }));
    if (allCats.length === 0) { toast('لا توجد فئات متاحة', false); return; }
    allCats.forEach(c => {
      html += `<button onclick="Products.applyBulkCategory(this)" data-cat="${esc(c.name)}" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-2 rounded-lg text-sm font-bold border border-indigo-200">${esc(c.name)} (${c.codes.length})</button>`;
    });
    box.innerHTML = html || '<div class="text-slate-400 text-sm">لا توجد فئات</div>';
    $('bulkCatsModal').classList.add('open');
  },
  closeBulkCats() { $('bulkCatsModal').classList.remove('open'); },
  applyBulkCategory(btn) {
    const name = String(btn?.dataset?.cat || '').trim();
    if (!name) return;
    const replace = $('bulkReplaceCheck')?.checked || false;
    const target = App.categories.find(c => c.name === name);
    const codes = Array.from(this.selected);
    if (replace) {
      // remove all selected codes from every column
      App.categories.forEach(col => { col.codes = col.codes.filter(c => !codes.includes(c)); });
    }
    if (target) {
      target.codes = target.codes.filter(c => !codes.includes(c));
      target.codes.push(...codes);
    }
    this.closeBulkCats();
    this.renderTable();
    App.markDirty();
    toast(`تم تصنيف ${codes.length} منتجات ضمن "${name}" — اضغط نشر التعديلات`);
    log(`تم تصنيف ${codes.length} منتجات ضمن "${name}" محلياً`, true);
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
    });
    App.currentCsvDirty = true;
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
      // Custom categories
      App.categories.filter(c => !c.fixed).forEach(c => {
        if (c.codes.includes(code)) cats.push(`<span class="chip chip-indigo">${esc(c.name)}</span>`);
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
    const cols = App.categories.map((c, ci) => ({ c, ci })).filter(x => !x.c.fixed);
    if (cols.length === 0) { box.innerHTML = '<div class="text-xs text-slate-400">لا توجد فئات مخصصة بعد. أضفها من زر "إدارة الفئات" بالأعلى</div>'; return; }
    let html = '';
    cols.forEach(({ c, ci }) => {
      const checked = c.codes.includes(currentCode) ? 'checked' : '';
      html += `<label class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300"><input type="checkbox" data-custom-cat="${ci}" ${checked} class="w-4 h-4 text-indigo-600"><span class="text-sm font-bold text-slate-700">${esc(c.name)}</span></label>`;
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

    // Update product in list
    if (this.editingIndex < 0) App.products.unshift(obj);
    else App.products[this.editingIndex] = obj;
    App.currentCsvDirty = true;

    // Update checkboxes -> categories (fixed 3 + custom)
    const prevCode = this.editingIndex >= 0 ? String(App.products[this.editingIndex]?.code || '') : code;
    // Remove all old codes first in all columns for this product being edited
    App.categories.forEach(col => {
      col.codes = col.codes.filter(c => c !== prevCode && c !== code);
    });
    const ensureCat = (name) => {
      let col = App.categories.find(c => c.name === name);
      if (!col) { col = { name, codes: [], fixed: true }; App.categories.push(col); }
      return col;
    };
    // Re-add based on checkboxes
    if ($('cat_out').checked) ensureCat('منتهي كمية').codes.push(code);
    if ($('cat_hot').checked) ensureCat('رائج').codes.push(code);
    if ($('cat_home').checked) ensureCat('صفحة رئيسية').codes.push(code);
    // Custom cats
    document.querySelectorAll('input[data-custom-cat]').forEach(chk => {
      const ci = +chk.dataset.customCat;
      const col = App.categories[ci];
      if (chk.checked && col) col.codes.push(code);
    });

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
    // Also remove from all categories
    App.categories.forEach(col => { col.codes = col.codes.filter(c => c !== code); });
    App.currentCsvDirty = true;
    this.renderTable();
    App.markDirty();
    toast('تم حذف المنتج محلياً — اضغط "نشر التعديلات" لرفعه');
    log(`تم حذف المنتج ${code} محلياً (بانتظار النشر)` + (photoPaths.length ? ` + ${photoPaths.length} صورة` : ''), true);
  }
};

/* ======================= BOOT ======================= */
document.addEventListener('DOMContentLoaded', () => App.init());

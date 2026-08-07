/* ======================= UTILITIES ======================= */
const $ = (id) => document.getElementById(id);
const toast = (msg, ok=true) => {
  const t = $('toast');
  t.innerHTML = String(msg);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
};
const confirmAsync = (title, msg, okText='نعم') => new Promise(r => {
  $('confirmTitle').textContent = title;
  $('confirmMsg').textContent = msg;
  $('confirmOk').textContent = okText;
  $('confirmDialog').classList.add('open');
  const off = () => { $('confirmCancel').onclick = null; $('confirmOk').onclick = null; $('confirmDialog').classList.remove('open'); };
  $('confirmCancel').onclick = () => { off(); r(false); };
  $('confirmOk').onclick = () => { off(); r(true); };
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
    this.close();
    if (this.resolve) { this.resolve(v); this.resolve = null; }
  },
  close() {
    $('promptModal').classList.remove('open');
    if (this.resolve) { this.resolve(null); this.resolve = null; }
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
    this.close();
    if (this.resolve) { this.resolve({ qty, val }); this.resolve = null; }
  },
  close() {
    $('discountModal').classList.remove('open');
    if (this.resolve) { this.resolve(null); this.resolve = null; }
  }
};
$('promptOk').addEventListener('click', () => promptModal.ok());
$('promptInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') promptModal.ok(); });
$('discountOk').addEventListener('click', () => discountModal.ok());
$('discQty').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('discValue').focus(); });
$('discValue').addEventListener('keydown', (e) => { if (e.key === 'Enter') discountModal.ok(); });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nf = (n) => { const v = Number(n); if(isNaN(v)) return ''; return (Math.round(v*100)/100).toFixed(2).replace(/\.00$/,''); };
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
  try {
    const prefix = pathRelativeToRoot.startsWith('../') ? '' : '../';
    const url = prefix + pathRelativeToRoot;
    const r = await fetch(url, { cache: 'no-store' });
    if (r.ok) return await r.text();
    return null;
  } catch { return null; }
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
  async getFileSHA(path) {
    const cfg = this.getCfg();
    if (!cfg.repo) return null;
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`, { headers: this.headers() });
      if (r.ok) { const j = await r.json(); return j.sha || null; }
      return null;
    } catch { return null; }
  },
  async putFile(path, content, message='Update file', isBinary=false) {
    const cfg = this.getCfg();
    if (!cfg.token || !cfg.repo) { toast('الرجاء تعيين إعدادات GitHub أولاً', false); return false; }
    const sha = await this.getFileSHA(path);
    const enc = isBinary ? content : btoa(unescape(encodeURIComponent(content)));
    const body = { message, branch: cfg.branch, content: enc };
    if (sha) body.sha = sha;
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}`, {
        method: 'PUT', headers: this.headers(), body: JSON.stringify(body)
      });
      if (r.ok) return true;
      const j = await r.json(); toast('خطأ GitHub: ' + (j.message || r.status), false); return false;
    } catch (e) { toast('خطأ اتصال: ' + e.message, false); return false; }
  },
  async getFile(path) {
    const cfg = this.getCfg();
    if (!cfg.repo) return null;
    try {
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`, { headers: this.headers() });
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
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${dir}?ref=${cfg.branch}`, { headers: this.headers() });
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
      const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${dir}?ref=${cfg.branch}`, { headers: this.headers() });
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
  async toWebP(file, maxDim = 1200) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('فشل تحويل الصورة'));
        }, 'image/webp', 0.8);
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
  currentCsv: '',
  currentCsvBasename: '',
  pendingPhotos: [],  // { name, base64, blob }
  photoUploads: [],   // pending GitHub uploads: { path, base64 }

  init() {
    this.loadSettings();
    this.applyFontSize(localStorage.getItem('hjy_admin_font') || 'md');
    this.populateCsvSelector();
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty()) { e.preventDefault(); e.returnValue = ''; }
    });
  },

  isDirty() {
    return (this.currentCsv && this.products.length >= 0);
  },

  loadSettings() {
    const c = GH.getCfg();
    $('s_token').value = c.token;
    $('s_repo').value = c.repo;
    $('s_branch').value = c.branch;
  },
  openSettings() { $('settingsModal').classList.add('open'); this.loadSettings(); this.applyFontSize(localStorage.getItem('hjy_admin_font') || 'md', true); },
  closeSettings() { $('settingsModal').classList.remove('open'); },
  saveSettings() {
    localStorage.setItem('gh_token', $('s_token').value.trim());
    localStorage.setItem('gh_repo', $('s_repo').value.trim());
    localStorage.setItem('gh_branch', $('s_branch').value.trim());
    toast('تم حفظ الإعدادات');
    this.closeSettings();
    this.populateCsvSelector();
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
    sel.innerHTML = '<option value="">-- جاري تجهيز قائمة الملفات --</option>';
    let files = [];
    const idx = await fetchTextRelatively('data-csv/files.txt');
    if (idx) {
      files = idx.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(s => s.endsWith('.csv') ? s : s + '.csv');
    }
    if (!files.length) files = await GH.listFilesInDir('data-csv');
    if (!files || files.length === 0) {
      files = ['cell-bms.csv','add.csv','aurd-elec.csv','box-more.csv','e-bike-batt.csv','eva-prod.csv','hjy-code-remote-rx.csv','inverter.csv','our-prod.csv','qiachip-home-smart-eq.csv','remote-B.csv','rx.csv','smart-home-wifi.csv','smart-sensor-home.csv','solar-batt.csv','wifi-qiachip.csv','remote-A.csv','‏‏remote-A.csv'];
    }
    files = files.filter(f => /\.csv$/i.test(f));
    const unique = [];
    files.forEach(f => { if (!unique.includes(f)) unique.push(f); });
    sel.innerHTML = '<option value="">-- اختر ملف المنتجات CSV للبدء --</option>' +
      unique.map(f => `<option value="data-csv/${f}">${f}</option>`).join('');
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
    if (path) { this.currentCsv = path; this.currentCsvBasename = path.split('/').pop(); if (sel.value !== path) sel.value = path; }
    let raw = manualText;
    let rawSource = '';
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
    $('saveAllBtn').disabled = false;
    await this.loadCategories();
    Products.renderTable();
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
    const name = await promptModal.open('اسم الملف الجديد (مع الامتداد .csv):', 'new-file.csv');
    if (!name) return;
    let n = String(name).trim();
    if (!n) return;
    if (!/\.csv$/i.test(n)) n += '.csv';
    const path = 'data-csv/' + n;
    const HEADER = ['CODE','NAME','PRICE','ABOUT1','ABOUT2','dis','PHOTO','P','H'];
    const csv = Papa.unparse([HEADER], { delimiter: ';' });
    toast('جاري إنشاء الملف ورفعه إلى المستودع...');
    const ok = await GH.putFile(path, csv, `إنشاء ملف جديد: ${n}`);
    if (!ok) return;
    const idx = await fetchTextRelatively('data-csv/files.txt');
    if (idx != null) {
      const lines = idx.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (!lines.includes(n)) {
        lines.push(n);
        await GH.putFile('data-csv/files.txt', lines.join('\n') + '\n', 'إضافة الملف الجديد إلى الفهرس');
      }
    }
    toast(`تم إنشاء الملف ${n}`);
    this.currentCsv = '';
    await this.populateCsvSelector();
    await this.loadCsv(path);
  },

  async renameCurrentFile() {
    if (!this.currentCsvBasename) { toast('اختر ملفاً أولاً', false); return; }
    const newName = await promptModal.open('الاسم الجديد للملف (مع الامتداد .csv):', this.currentCsvBasename);
    if (!newName) return;
    if (!/\.csv$/i.test(newName)) { toast('يجب أن ينتهي بالامتداد .csv', false); return; }
    const ok = await confirmAsync('تغيير اسم الملف', `هل تريد تغيير اسم ${this.currentCsvBasename} إلى ${newName}؟\n(سيتم حذف القديم وإنشاء الجديد بعد الضغط على حفظ ونشر)`);
    if (!ok) return;
    const oldPath = this.currentCsv;
    this.currentCsvBasename = newName;
    this.currentCsv = 'data-csv/' + newName;
    // update selector
    const sel = $('csvSelector');
    if (![...sel.options].some(o => o.value === this.currentCsv)) {
      const opt = document.createElement('option');
      opt.value = this.currentCsv; opt.textContent = newName;
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

  buildCsvFromProducts() {
    const HEADER_ORDER = ['CODE','NAME','PRICE','ABOUT1','ABOUT2','dis','PHOTO','P','H'];
    const rows = [];
    rows.push(HEADER_ORDER);
    for (const pRaw of (this.products || [])) {
      const p = normalizeProduct(pRaw);
      rows.push([
        p.code || '', p.name || '', String(nf(p.price) || ''),
        p.about1 || '', p.about2 || '', p.dis || '',
        p.photo || '', (p.p === '' || p.p == null) ? '' : String(nf(p.p) || ''), (p.h === '' || p.h == null) ? '' : String(nf(p.h) || '')
      ]);
    }
    return Papa.unparse(rows, { delimiter: ';' });
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
          await fetch(`https://api.github.com/repos/${cfg2.repo}/contents/${this._pendingRename.from}`, {
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

  openCategoriesManager() {
    if (this.categories.length === 0) this.loadCategories().then(() => { Categories.render(); $('categoriesModal').classList.add('open'); });
    else { Categories.render(); $('categoriesModal').classList.add('open'); }
  },
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
      thHtml += `<th class="px-2 py-3 text-center border-l border-indigo-100 min-w-[140px]">
        <div class="flex flex-col items-center gap-1">
          ${isFixed ? `<span class="chip bg-indigo-600 text-white">ثابت</span>` : `<div class="flex gap-1"><button onclick="Categories.renameCol(${i})" class="text-xs bg-white border border-indigo-300 text-indigo-700 px-2 py-0.5 rounded">تعديل</button><button onclick="Categories.deleteCol(${i})" class="text-xs bg-red-50 border border-red-300 text-red-600 px-2 py-0.5 rounded">حذف</button></div>`}
          <div class="font-extrabold ${isFixed ? 'text-indigo-800' : 'text-slate-700'}">${esc(c.name)}</div>
        </div>
      </th>`;
    });
    thHtml += '<th class="w-8"></th></tr>';
    th.innerHTML = thHtml;
    let tbHtml = '';
    for (let r = 0; r < maxR; r++) {
      tbHtml += `<tr class="row-hover">`;
      cols.forEach((c, ci) => {
        const val = c.codes[r] || '';
        tbHtml += `<td class="px-1 py-1 border-l border-indigo-50"><input data-col="${ci}" data-row="${r}" value="${esc(val)}" oninput="Categories.onCellInput(event)" dir="ltr" class="w-full border border-transparent hover:border-indigo-200 focus:border-indigo-400 rounded px-2 py-1.5 text-sm font-mono ${c.fixed && ci===0 ? 'text-danger' : c.fixed && ci===1 ? 'text-orange-600' : c.fixed && ci===2 ? 'text-sky-700' : 'text-slate-700'}"></td>`;
      });
      tbHtml += `<td class="w-8"></td></tr>`;
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
    toast('تم تحديث الفئات. اضغط "حفظ ونشر" لنشرها');
    this.close();
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
    return Papa.unparse(rows);
  }
};

/* ======================= PRODUCTS MANAGER ======================= */
const Products = {
  editingIndex: -1,
  tempPhotos: [], // { name, base64, previewUrl }
  disRules: [],   // { type, qty, value }

  onCodeChange() {
    const el = $('f_code');
    if (el) {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const v = String(el.value || '');
      const upper = v.toUpperCase();
      if (upper !== v) { el.value = upper; try { el.setSelectionRange(start, end); } catch {} }
    }
    // auto rename photos names
    this.refreshPhotoPreview();
    this.updatePhotoField();
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
      if (colOut.includes(code)) cats.push('<span class="chip bg-red-100 text-danger">منتهي</span>');
      if (colHot.includes(code)) cats.push('<span class="chip bg-orange-100 text-orange-700">HOT</span>');
      if (colHome.includes(code)) cats.push('<span class="chip bg-sky-100 text-sky-700">رئيسية</span>');
      // Custom categories
      App.categories.filter(c => !c.fixed).forEach(c => {
        if (c.codes.includes(code)) cats.push(`<span class="chip bg-indigo-50 text-indigo-700 border border-indigo-100">${esc(c.name)}</span>`);
      });
      html += `<tr class="row-hover group">
        <td class="px-3 py-3 font-mono font-extrabold text-primary">${esc(code)}</td>
        <td class="px-3 py-3 font-bold text-slate-800">${esc(p.name || '')}</td>
        <td class="px-3 py-3 text-slate-600 max-w-xs truncate">${esc(p.about1 || '')}</td>
        <td class="px-3 py-3 text-center">
          <div class="font-extrabold text-success text-lg">$${nf(p.price)}</div>
          ${p.dis ? `<div class="chip bg-amber-100 text-amber-800 mt-0.5">عروض</div>`:''}
        </td>
        <td class="px-3 py-3 text-center font-bold text-slate-600">${p.h === '' || p.h == null ? '' : nf(p.h)}</td>
        <td class="px-3 py-3 text-center font-bold text-slate-600">${p.p === '' || p.p == null ? '' : nf(p.p)}</td>
        <td class="px-3 py-3 text-center">
          <img loading="lazy" src="${esc(firstSrc)}" alt="" data-src-list="${candJson}" data-src-idx="0" onerror="window.__adminImgFallback && window.__adminImgFallback(this)" class="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-slate-50 inline-block">
        </td>
        <td class="px-3 py-3 text-center"><div class="flex flex-wrap gap-1 justify-center max-w-xs">${cats.join('') || '<span class="text-xs text-slate-400">—</span>'}</div></td>
        <td class="px-3 py-3 text-center">
          <div class="flex gap-1.5 justify-center">
            <button onclick="Products.openEditor(${realIndex})" class="bg-primary hover:bg-primaryDark text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm">تعديل</button>
            <button onclick="Products.deleteProduct(${realIndex})" class="bg-danger hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm">حذف</button>
          </div>
        </td>
      </tr>`;
    });
    if (!html) html = `<tr><td colspan="9" class="p-12 text-center text-slate-400 font-bold">لا توجد منتجات مطابقة لعملية البحث</td></tr>`;
    tbody.innerHTML = html;
    $('tableCountInfo').textContent = `${list.length} منتج ${list.length !== (App.products||[]).length ? `(من أصل ${App.products.length})` : ''}`;
  },

  /* ---------- OPEN / CLOSE EDITOR ---------- */
  openEditor(index = -1) {
    this.editingIndex = index;
    this.disRules = [];
    this.tempPhotos = [];
    $('productModalTitle').textContent = index < 0 ? 'إضافة منتج جديد' : 'تعديل المنتج';
    const p = index >= 0 ? App.products[index] : { code:'', name:'', about1:'', about2:'', price:'', h:'', p:'', photo:'', dis:'' };
    $('f_code').value = p.code || '';
    $('f_name').value = p.name || '';
    $('f_about1').value = p.about1 || '';
    $('f_about2').value = p.about2 || '';
    $('f_h').value = p.h ?? '';
    $('f_p').value = p.p ?? '';
    const hRaw = String(p.h ?? '').trim();
    const pRaw = String(p.p ?? '').trim();
    const hasHP = hRaw !== '' || pRaw !== '';
    const calcSum = hasHP ? Math.round((Number(hRaw)||0) * 100 + (Number(pRaw)||0) * 100) / 100 : '';
    $('f_price').value = calcSum !== '' ? calcSum : (p.price ?? '');
    $('f_photo').value = p.photo || '';
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
    this.renderDisRules();
    // Custom categories checkboxes
    this.renderCustomCatsCheckboxes(String(p.code||''));
    // photo preview
    this.refreshPhotoPreview();
    // photo file listener
    $('photoFileInput').onchange = (e) => this.onPhotoFiles(e);
    $('photoFileInput').value = '';
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
    if (!dis) return;
    const parts = String(dis).split(/\s*,\s*/).filter(Boolean);
    for (const part of parts) {
      const m1 = part.match(/^(\d+)\s*[Pp]\s*=\s*(\d+(?:\.\d+)?)\s*%?$/);
      if (m1) { this.disRules.push({ type: 'percent', qty: +m1[1], value: +m1[2] }); continue; }
      const m2 = part.match(/^(\d+)\s*[+＋]?\s*[Pp]\s*=\s*(\d+(?:\.\d+)?)$/);
      if (m2) { this.disRules.push({ type: 'fixed', qty: +m2[1], value: +m2[2] }); continue; }
    }
  },
  rulesToDisString() {
    return this.disRules.map(r => r.type === 'percent' ? `${r.qty}P=${r.value}%` : `${r.qty}+P=${r.value}`).join(', ');
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
      box.innerHTML = '<div class="text-sm text-amber-700 bg-white/60 p-3 rounded-lg border border-amber-200/60">لم تتم إضافة أي خصومات بعد. اضغط على زر الأعلى لإضافة عرض.</div>';
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
  async onPhotoFiles(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    const code = String($('f_code').value || '').trim();
    if (!code) { toast('اكتب الكود CODE أولاً لتسمية الصور', false); return; }
    toast('جاري تحويل الصور إلى WEBP...');
    const existingNames = ($('f_photo').value || '').split(',').map(s => s.trim()).filter(Boolean);
    let currentIdx = existingNames.length; // start from current count
    // Determine starting index: count existing photos
    if (currentIdx === 0) currentIdx = 0;
    else {
      // check if first photo uses plain code (without -1), if so next should be 1, 2...
      const first = existingNames[0];
      if (first === code || first === `${code}.webp`) {
        currentIdx = existingNames.length - 1; // existing 1 photo means idx=0 -> next is 1
      }
    }
    let isFirst = existingNames.length === 0;

    for (const file of files) {
      try {
        const blob = await ImgConv.toWebP(file);
        const base64 = await ImgConv.blobToBase64(blob);
        const name = isFirst ? `${code}.webp` : `${code}-${currentIdx}.webp`;
        if (isFirst) isFirst = false; else currentIdx++;
        const preview = URL.createObjectURL(blob);
        this.tempPhotos.push({ name, base64, preview, blob });
        existingNames.push(name.replace(/\.webp$/i,''));
      } catch (err) { toast('فشل تحويل صورة: '+file.name, false); }
    }
    $('f_photo').value = existingNames.join(', ');
    this.refreshPhotoPreview();
    toast(`تم تحويل ${files.length} صورة إلى WEBP`);
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
    if (items.length === 0) { box.innerHTML = '<div class="col-span-full text-center text-slate-400 text-sm py-5">لم تتم إضافة أي صور بعد</div>'; return; }
    box.innerHTML = items.map((it, i) => {
      const candsAttr = it.cands ? ` data-src-list="${esc(JSON.stringify(it.cands))}" data-src-idx="0" onerror="window.__adminImgFallback && window.__adminImgFallback(this)"` : ` onerror="this.onerror=null;this.src=NO_IMG_SVG"`;
      return `<div class="relative group">
        <img src="${esc(it.src)}"${candsAttr} class="w-full aspect-square object-cover rounded-lg border border-slate-200 bg-slate-50">
        <button type="button" onclick="Products.removePhoto(${i})" class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-danger text-white text-sm font-extrabold shadow opacity-0 group-hover:opacity-100 transition">×</button>
        <div class="text-[10px] text-slate-500 font-mono mt-1 truncate" dir="ltr">${esc(it.name)}</div>
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

  /* ---------- SAVE / DELETE ---------- */
  async saveEditor() {
    const code = String($('f_code').value || '').trim().toUpperCase();
    const name = String($('f_name').value || '').trim();
    if (!code) { toast('يجب إدخال الكود CODE', false); return; }
    if (!name) { toast('يجب إدخال الاسم NAME', false); return; }
    $('f_code').value = code;
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

    // Upload photos immediately (compressed) to photo/ folder in the repo
    const pending = this.tempPhotos.slice();
    this.tempPhotos = [];
    for (const ph of pending) App.photoUploads.push({ path: `photo/${ph.name}`, base64: ph.base64 });
    this.closeEditor();
    this.renderTable();
    if (pending.length) {
      toast('جاري رفع الصور وضغطها...');
      let okCount = 0, failCount = 0;
      for (const ph of pending) {
        const p = `photo/${ph.name}`;
        const ok = await GH.putFile(p, ph.base64, `رفع صورة ${p}`, true);
        if (ok) {
          okCount++;
          const i = App.photoUploads.findIndex(x => x.path === p);
          if (i >= 0) App.photoUploads.splice(i, 1);
        } else failCount++;
        try { URL.revokeObjectURL(ph.preview); } catch {}
      }
      if (failCount) toast(`تم حفظ المنتج، رفع ${okCount} صورة وفشل ${failCount} (ستُرفع عند الضغط على حفظ ونشر)`, okCount > 0);
      else toast(`تم حفظ المنتج ورفع ${okCount} صورة مضغوطة بنجاح`);
    } else {
      toast('تم حفظ المنتج');
    }
  },

  async deleteProduct(i) {
    const p = App.products[i]; if (!p) return;
    const ok = await confirmAsync('حذف منتج', `هل أنت متأكد من حذف المنتج:\n${p.code} - ${p.name}\n\nسيتم حذفه من ملف CSV المنتجات فقط.`, 'حذف');
    if (!ok) return;
    const code = String(p.code || '');
    App.products.splice(i, 1);
    // Also remove from all categories
    App.categories.forEach(col => { col.codes = col.codes.filter(c => c !== code); });
    this.renderTable();
    toast('تم حذف المنتج');
  }
};

/* ======================= BOOT ======================= */
document.addEventListener('DOMContentLoaded', () => App.init());

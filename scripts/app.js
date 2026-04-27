const SITE_NAME = "HJY STORE";
const MANIFEST_CANDIDATES = ["./root/site-manifest.json", "./site-manifest.json"];
const CART_STORAGE_KEY = "hjy-store-cart-v1";
const CACHE_KEY_PREFIX = "hjy-cache-v1-";
const FETCH_RETRY_COUNT = 3;
const FETCH_TIMEOUT_MS = 8000;

const state = {
  manifest: { generatedAt: null, files: [] },
  products: [],
  productsByCode: new Map(),
  categories: [],
  searchTerm: "",
  selectedCategory: "all",
  cart: loadCart(),
  isLoading: false,
};

const els = {
  catalogGrid: document.getElementById("catalogGrid"),
  catalogEmpty: document.getElementById("catalogEmpty"),
  categoryFilterContainer: document.getElementById("categoryFilterContainer"),
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  cartTrigger: document.getElementById("cartTrigger"),
  cartDrawer: document.getElementById("cartDrawer"),
  overlay: document.getElementById("overlay"),
  closeCart: document.getElementById("closeCart"),
  cartCount: document.getElementById("cartCount"),
  cartList: document.getElementById("cartList"),
  cartFinalTotal: document.getElementById("cartFinalTotal"),
  dataInfo: document.getElementById("dataInfo"),
  productCardTemplate: document.getElementById("productCardTemplate"),
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  init().catch(console.error);
});

async function init() {
  state.isLoading = true;
  updateDataInfo("جاري تحميل البيانات...");

  try {
    const manifest = await loadManifest();
    state.manifest = manifest;
    
    // Load logo if exists in manifest
    const logoFile = manifest.files.find(f => f.dir === "root" && f.baseName.toLowerCase() === "logo");
    if (logoFile) {
      const logoImg = document.querySelector("#brandLogo img");
      if (logoImg) logoImg.src = logoFile.path;
    }

    await processData();
    renderAll();
    updateDataInfo(`آخر تحديث: ${new Date(manifest.generatedAt).toLocaleString('ar-SA')}`);
  } catch (error) {
    console.error("Init error:", error);
    updateDataInfo("فشل تحميل البيانات. يرجى المحاولة لاحقاً.");
  } finally {
    state.isLoading = false;
  }
}

function updateDataInfo(text) {
  if (els.dataInfo) els.dataInfo.textContent = text;
}

async function loadManifest() {
  for (const candidate of MANIFEST_CANDIDATES) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (!response.ok) continue;
      return await response.json();
    } catch (e) {}
  }
  throw new Error("Manifest not found");
}

async function processData() {
  const dataFiles = state.manifest.files.filter(f => f.dir === "data" && (f.extension === ".csv" || f.extension === ".txt"));
  const products = [];
  const categoriesSet = new Set();

  for (const file of dataFiles) {
    try {
      const response = await fetch(file.path);
      const text = await response.text();
      const rows = parseCsv(text);
      
      // Assume header: code, name, price, about1, about2, dis, photo, category
      const headers = rows[0].map(h => String(h).trim().toLowerCase());
      const codeIdx = headers.indexOf("code");
      const nameIdx = headers.indexOf("name");
      const priceIdx = headers.indexOf("price");
      const disIdx = headers.indexOf("dis");
      const catIdx = headers.indexOf("category");

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[codeIdx] || !row[nameIdx]) continue;

        const product = {
          code: String(row[codeIdx]).trim(),
          name: String(row[nameIdx]).trim(),
          price: parseFloat(row[priceIdx]) || 0,
          discountRaw: row[disIdx] ? String(row[disIdx]).trim() : "",
          category: row[catIdx] ? String(row[catIdx]).trim() : "عام",
          image: resolveImagePath(String(row[codeIdx]).trim())
        };
        products.push(product);
        categoriesSet.add(product.category);
      }
    } catch (e) {
      console.error(`Error parsing ${file.path}:`, e);
    }
  }

  state.products = products;
  state.productsByCode = new Map(products.map(p => [p.code, p]));
  state.categories = Array.from(categoriesSet);
}

function resolveImagePath(code) {
  const photoFiles = state.manifest.files.filter(f => f.dir === "photo");
  const match = photoFiles.find(f => f.baseName.toLowerCase() === code.toLowerCase());
  return match ? match.path : "./root/placeholder.png";
}

function parseCsv(text) {
  // Enhanced CSV parser to handle multiple separators and empty lines
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Detect separator (comma or semicolon)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  return lines.map(line => {
    return line.split(separator).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
  });
}

function renderAll() {
  renderCategories();
  renderCatalog();
}

function renderCategories() {
  if (!els.categoryFilterContainer) return;
  const container = els.categoryFilterContainer;
  const currentActive = container.querySelector('.active')?.dataset.category || 'all';
  
  container.innerHTML = `<button class="filter-pill ${currentActive === 'all' ? 'active' : ''}" data-category="all">الكل</button>`;
  
  state.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `filter-pill ${currentActive === cat ? 'active' : ''}`;
    btn.dataset.category = cat;
    btn.textContent = cat;
    btn.onclick = () => {
      container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCategory = cat;
      renderCatalog();
    };
    container.appendChild(btn);
  });
}

function renderCatalog() {
  if (!els.catalogGrid) return;
  els.catalogGrid.innerHTML = "";

  const filtered = state.products.filter(p => {
    const matchesCat = state.selectedCategory === "all" || p.category === state.selectedCategory;
    const matchesSearch = !state.searchTerm || 
      p.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    els.catalogEmpty.classList.remove("hidden");
  } else {
    els.catalogEmpty.classList.add("hidden");
    filtered.forEach(p => {
      const card = els.productCardTemplate.content.cloneNode(true);
      const img = card.querySelector("img");
      img.src = p.image;
      img.alt = p.name;

      card.querySelector(".product-code").textContent = p.code;
      card.querySelector(".product-name").textContent = p.name;

      // Handle Price and Discount
      const priceNew = card.querySelector(".price-new");
      const priceOld = card.querySelector(".price-old");
      const badge = card.querySelector(".badge-discount");

      if (p.discountRaw) {
        const discountVal = parseFloat(p.discountRaw);
        if (!isNaN(discountVal)) {
          const isPercent = p.discountRaw.includes("%");
          const oldPrice = isPercent ? p.price / (1 - discountVal / 100) : p.price + discountVal;
          priceOld.textContent = `${oldPrice.toFixed(2)} $`;
          badge.textContent = isPercent ? `-${discountVal}%` : `-${discountVal}$`;
          badge.classList.remove("hidden");
        }
      }
      priceNew.textContent = `${p.price.toFixed(2)} $`;

      card.querySelector(".add-btn").onclick = () => addToCart(p.code);
      card.querySelector(".copy-btn").onclick = () => copyToClipboard(p.code);

      els.catalogGrid.appendChild(card);
    });
  }
}

function addToCart(code) {
  const item = state.cart.find(i => i.code === code);
  if (item) {
    item.qty++;
  } else {
    state.cart.push({ code, qty: 1 });
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
}

function loadCart() {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function renderCart() {
  els.cartCount.textContent = state.cart.reduce((sum, i) => sum + i.qty, 0);
  if (!els.cartList) return;
  els.cartList.innerHTML = "";
  
  let total = 0;
  state.cart.forEach(item => {
    const p = state.productsByCode.get(item.code);
    if (!p) return;
    total += p.price * item.qty;

    const div = document.createElement("div");
    div.style = "display: flex; gap: 10px; margin-bottom: 15px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px;";
    div.innerHTML = `
      <img src="${p.image}" style="width: 50px; height: 50px; object-fit: contain;">
      <div style="flex: 1;">
        <div style="font-size: 14px; font-weight: bold;">${p.name}</div>
        <div style="font-size: 12px; color: #888;">${p.price} $ × ${item.qty}</div>
      </div>
      <button onclick="removeFromCart('${item.code}')" style="background:none; border:none; color:red; cursor:pointer;">حذف</button>
    `;
    els.cartList.appendChild(div);
  });

  els.cartFinalTotal.textContent = `${total.toFixed(2)} $`;
}

window.removeFromCart = (code) => {
  state.cart = state.cart.filter(i => i.code !== code);
  saveCart();
  renderCart();
};

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`تم نسخ الكود: ${text}`);
  }).catch(err => {
    console.error('Copy failed', err);
  });
}

function bindEvents() {
  els.searchInput.addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    renderCatalog();
  });

  els.cartTrigger.onclick = () => {
    els.cartDrawer.classList.remove("hidden");
    els.overlay.style.display = "block";
  };

  els.closeCart.onclick = els.overlay.onclick = () => {
    els.cartDrawer.classList.add("hidden");
    els.overlay.style.display = "none";
  };
  
  document.getElementById("checkoutBtn").onclick = () => {
    if (state.cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }
    let message = "طلب جديد من متجر HJY STORE:\n\n";
    state.cart.forEach(item => {
        const p = state.productsByCode.get(item.code);
        message += `- ${p.name} (${p.code}) | الكمية: ${item.qty} | السعر: ${p.price * item.qty} $\n`;
    });
    const total = state.cart.reduce((sum, i) => sum + (state.productsByCode.get(i.code)?.price || 0) * i.qty, 0);
    message += `\nالإجمالي النهائي: ${total.toFixed(2)} $`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
}

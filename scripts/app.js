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
  homeLists: {
    fav: [],
    more_fav: [],
    more_sell: [],
    out_pro: []
  },
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
  const homeFiles = state.manifest.files.filter(f => f.dir === "home" && (f.extension === ".csv" || f.extension === ".txt"));
  
  const products = [];
  const categoriesSet = new Set();

  // 1. Process regular data products
  for (const file of dataFiles) {
    try {
      const response = await fetch(file.path);
      const text = await response.text();
      const rows = parseCsv(text);
      if (rows.length < 2) continue;

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
          // Use filename as category if column is missing or empty
          category: (catIdx !== -1 && row[catIdx]) ? String(row[catIdx]).trim() : file.baseName,
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

  // 2. Process home configurations (categories and lists)
  const categoryConfigFile = homeFiles.find(f => f.baseName.toLowerCase() === "categories");
  if (categoryConfigFile) {
    try {
      const response = await fetch(categoryConfigFile.path);
      const text = await response.text();
      const rows = parseCsv(text);
      // Assume categories.csv is just a list of names or has a Name column
      const definedCategories = rows.flat().filter(c => c && c.toLowerCase() !== "name").map(c => c.trim());
      if (definedCategories.length > 0) {
        state.categories = definedCategories;
      } else {
        state.categories = Array.from(categoriesSet);
      }
    } catch (e) {
      console.error("Error loading categories config:", e);
      state.categories = Array.from(categoriesSet);
    }
  } else {
    state.categories = Array.from(categoriesSet);
  }

  // 3. Load special lists (fav, more_sell, etc.)
  for (const listKey of Object.keys(state.homeLists)) {
    const listFile = homeFiles.find(f => f.baseName.toLowerCase() === listKey.toLowerCase());
    if (listFile) {
      try {
        const response = await fetch(listFile.path);
        const text = await response.text();
        const rows = parseCsv(text);
        // Assume lists are CSVs where the first column is the product code
        const codes = rows.map(r => String(r[0]).trim()).filter(c => c && c.toLowerCase() !== "code");
        state.homeLists[listKey] = codes;
      } catch (e) {
        console.error(`Error loading ${listKey} list:`, e);
      }
    }
  }
}

function resolveImagePath(code) {
  const photoFiles = state.manifest.files.filter(f => f.dir === "photo");
  const match = photoFiles.find(f => f.baseName.toLowerCase() === code.toLowerCase());
  return match ? match.path : "./root/placeholder.png";
}

function parseCsv(text) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  // Detect separator
  const firstLine = text.split('\n')[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === separator) {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        row.push(cell.trim());
        if (row.length > 0 && row.some(c => c !== '')) {
          result.push(row);
        }
        row = [];
        cell = '';
        if (char === '\r') i++;
      } else {
        cell += char;
      }
    }
  }

  // Handle last row/cell
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c !== '')) result.push(row);
  }

  return result;
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

  // Helper to check if a product is in a special list
  const getBadges = (p) => {
    const badges = [];
    if (state.homeLists.fav.includes(p.code)) badges.push({ text: "مفضل", class: "badge-fav" });
    if (state.homeLists.more_sell.includes(p.code)) badges.push({ text: "الأكثر مبيعاً", class: "badge-hot" });
    if (state.homeLists.out_pro.includes(p.code)) badges.push({ text: "نفذ", class: "badge-out" });
    return badges;
  };

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
      const container = card.querySelector(".product-card");
      const img = card.querySelector("img");
      img.src = p.image;
      img.alt = p.name;

      card.querySelector(".product-code").textContent = p.code;
      card.querySelector(".product-name").textContent = p.name;

      // Add special badges (fav, hot, out)
      const badges = getBadges(p);
      if (badges.length > 0) {
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "special-badges";
        badges.forEach(b => {
          const span = document.createElement("span");
          span.className = `badge ${b.class}`;
          span.textContent = b.text;
          badgeContainer.appendChild(span);
        });
        container.appendChild(badgeContainer);
      }

      // Handle Price and Discount
      const priceNew = card.querySelector(".price-new");
      const priceOld = card.querySelector(".price-old");
      const discountBadge = card.querySelector(".badge-discount");

      if (p.discountRaw) {
        const discountVal = parseFloat(p.discountRaw);
        if (!isNaN(discountVal)) {
          const isPercent = p.discountRaw.includes("%");
          const oldPrice = isPercent ? p.price / (1 - discountVal / 100) : p.price + discountVal;
          priceOld.textContent = `${oldPrice.toFixed(2)} $`;
          discountBadge.textContent = isPercent ? `-${discountVal}%` : `-${discountVal}$`;
          discountBadge.classList.remove("hidden");
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

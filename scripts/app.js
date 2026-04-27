const SITE_NAME = "HJY STORE";
const MANIFEST_CANDIDATES = ["./root/site-manifest.json", "./site-manifest.json"];
const SPECIAL_DATA_FILES = new Set([
  "fav",
  "more_fav",
  "more_sell",
  "out_pro",
  "categories",
]);
const CART_STORAGE_KEY = "hjy-store-cart-v1";
const CACHE_KEY_PREFIX = "hjy-cache-v1-";
const FETCH_RETRY_COUNT = 3;
const FETCH_TIMEOUT_MS = 8000;
const BACKGROUND_UPDATE_INTERVAL_MS = 1000 * 60 * 10; // Check every 10 mins
let autoReloadTimer = null;

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#edf4ff"/>
          <stop offset="100%" stop-color="#dceaff"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" rx="40" fill="url(#g)"/>
      <g fill="#6d7e95" font-family="Arial" text-anchor="middle">
        <text x="400" y="370" font-size="60" font-weight="700">HJY STORE</text>
        <text x="400" y="450" font-size="34">لا توجد صورة متاحة</text>
      </g>
    </svg>
  `);

const state = {
  manifest: { generatedAt: null, files: [] },
  products: [],
  productsByCode: new Map(),
  categories: [],
  codes: {
    fav: new Set(),
    more_fav: new Set(),
    more_sell: new Set(),
    out_pro: new Set(),
  },
  photoIndex: new Map(),
  searchTerm: "",
  selectedCategory: "all",
  cart: loadCart(),
  activeModalCode: null,
  featuredSliders: [],
  isLoading: false,
};

const els = {
  brandLogo: document.getElementById("brandLogo"),
  dataState: document.getElementById("dataState"),
  productCount: document.getElementById("productCount"),
  categoryCount: document.getElementById("categoryCount"),
  manifestDate: document.getElementById("manifestDate"),
  heroDescription: document.getElementById("heroDescription"),
  heroPills: document.getElementById("heroPills"),
  featuredSections: document.getElementById("featuredSections"),
  catalogGrid: document.getElementById("catalogGrid"),
  catalogEmpty: document.getElementById("catalogEmpty"),
  categoryFilter: document.getElementById("categoryFilter"),
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  searchSuggestions: document.getElementById("searchSuggestions"),
  clearSearch: document.getElementById("clearSearch"),
  objectTabs: document.getElementById("objectTabs"),
  objectContent: document.getElementById("objectContent"),
  aboutTabs: document.getElementById("aboutTabs"),
  aboutContent: document.getElementById("aboutContent"),
  cartTrigger: document.getElementById("cartTrigger"),
  cartDrawer: document.getElementById("cartDrawer"),
  overlay: document.getElementById("overlay"),
  closeCart: document.getElementById("closeCart"),
  cartCount: document.getElementById("cartCount"),
  cartList: document.getElementById("cartList"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartOriginalTotal: document.getElementById("cartOriginalTotal"),
  cartDiscountTotal: document.getElementById("cartDiscountTotal"),
  cartFinalTotal: document.getElementById("cartFinalTotal"),
  checkoutForm: document.getElementById("checkoutForm"),
  checkoutNote: document.getElementById("checkoutNote"),
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  customerNote: document.getElementById("customerNote"),
  productModal: document.getElementById("productModal"),
  closeProductModal: document.getElementById("closeProductModal"),
  modalMainImage: document.getElementById("modalMainImage"),
  modalThumbs: document.getElementById("modalThumbs"),
  modalCode: document.getElementById("modalCode"),
  modalTitle: document.getElementById("modalTitle"),
  modalPriceLine: document.getElementById("modalPriceLine"),
  modalAbout1: document.getElementById("modalAbout1"),
  modalDiscounts: document.getElementById("modalDiscounts"),
  modalAbout2: document.getElementById("modalAbout2"),
  modalQuantity: document.getElementById("modalQuantity"),
  modalAddToCart: document.getElementById("modalAddToCart"),
  productCardTemplate: document.getElementById("productCardTemplate"),
  sliderSectionTemplate: document.getElementById("sliderSectionTemplate"),
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  init().catch((error) => {
    console.error("Initialization failed:", error);
    showGlobalError();
  });
});

async function init() {
  state.isLoading = true;
  els.dataState.textContent = "جاري التحميل...";
  if (autoReloadTimer) clearInterval(autoReloadTimer);

  // 1. Try to load from Cache first for instant feel
  const cachedManifest = getCache("manifest");
  if (cachedManifest) {
    state.manifest = cachedManifest;
    await processManifestData(); // Fast render with cached data
    updateConnectionStatus("cached");
  }

  // 2. Fetch fresh data in background
  try {
    const freshManifest = await loadManifest();
    if (freshManifest && freshManifest.generatedAt !== state.manifest.generatedAt) {
      state.manifest = freshManifest;
      setCache("manifest", freshManifest);
      await processManifestData();
      updateConnectionStatus("online");
    } else {
      updateConnectionStatus("online");
    }
    
    // Start periodic background check
    setInterval(checkForUpdates, BACKGROUND_UPDATE_INTERVAL_MS);
  } catch (error) {
    console.warn("Could not refresh data, using cache if available:", error);
    if (!state.manifest.generatedAt) {
      showGlobalError();
      return;
    }
    updateConnectionStatus("offline");
  } finally {
    state.isLoading = false;
  }
}

async function processManifestData() {
  buildPhotoIndex();
  await Promise.all([
    loadBranding(),
    loadDataFiles(),
    loadInfoSections("about", els.aboutTabs, els.aboutContent),
    loadInfoSections("object", els.objectTabs, els.objectContent),
  ]);
  renderAll();
}

function renderAll() {
  renderCategoryOptions();
  renderFeaturedSections();
  renderCatalog();
  renderHeroStats();
  renderCart();
}

async function checkForUpdates() {
  try {
    const freshManifest = await loadManifest();
    if (freshManifest && freshManifest.generatedAt !== state.manifest.generatedAt) {
      console.log("New update found, updating in background...");
      state.manifest = freshManifest;
      setCache("manifest", freshManifest);
      await processManifestData();
      updateConnectionStatus("online");
    }
  } catch (e) {
    console.warn("Background update check failed", e);
  }
}

function updateConnectionStatus(type) {
  if (!els.dataState) return;
  
  switch (type) {
    case "online":
      els.dataState.textContent = "متصل ومحدث";
      els.dataState.style.color = "var(--success)";
      break;
    case "cached":
      els.dataState.textContent = "تحميل سريع (مخزن)";
      els.dataState.style.color = "var(--primary)";
      break;
    case "offline":
      els.dataState.textContent = "وضع الأوفلاين (قديم)";
      els.dataState.style.color = "var(--muted)";
      break;
    case "error":
      els.dataState.textContent = "فشل الاتصال";
      els.dataState.style.color = "var(--danger)";
      break;
  }
}

function showGlobalError() {
  updateConnectionStatus("error");
  let countdown = 10;
  
  const updateErrorUI = () => {
    els.heroDescription.innerHTML = `
      <div style="color: var(--danger); margin-bottom: 1rem; font-weight: bold;">
        تعذر تحميل البيانات. قد يكون الإنترنت ضعيفاً جداً.
      </div>
      <div style="margin-bottom: 1rem; font-size: 0.9rem;">
        سيتم إعادة المحاولة تلقائياً خلال ${countdown} ثانية...
      </div>
      <button class="primary-btn" onclick="location.reload()">حاول الآن يدوياً</button>
    `;
  };

  updateErrorUI();
  
  autoReloadTimer = setInterval(() => {
    countdown -= 1;
    if (countdown <= 0) {
      clearInterval(autoReloadTimer);
      location.reload();
    } else {
      updateErrorUI();
    }
  }, 1000);

  renderEmptyStates();
}

/**
 * Enhanced Fetch with Retry and Timeout
 */
async function fetchWithRetry(url, options = {}, retries = FETCH_RETRY_COUNT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      console.log(`Retrying fetch for ${url}... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 1000)); // wait 1s before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

function bindEvents() {
  els.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.searchTerm = els.searchInput.value.trim();
    renderCatalog();
  });

  els.searchInput.addEventListener("input", () => {
    state.searchTerm = els.searchInput.value.trim();
    renderSearchSuggestions();
    renderCatalog();
  });

  document.addEventListener("click", (event) => {
    if (!els.searchForm.contains(event.target)) {
      els.searchSuggestions.classList.add("hidden");
    }
  });

  els.clearSearch.addEventListener("click", () => {
    state.searchTerm = "";
    els.searchInput.value = "";
    els.searchSuggestions.classList.add("hidden");
    renderCatalog();
  });

  els.categoryFilter.addEventListener("change", () => {
    state.selectedCategory = els.categoryFilter.value;
    renderCatalog();
  });

  els.cartTrigger.addEventListener("click", openCart);
  els.closeCart.addEventListener("click", closeCart);
  els.overlay.addEventListener("click", () => {
    closeCart();
    closeProductModal();
  });

  els.closeProductModal.addEventListener("click", closeProductModal);
  els.productModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProductModal();
  });

  document.querySelectorAll("[data-qty-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.qtyAction;
      const current = Math.max(1, Number(els.modalQuantity.value) || 1);
      const next = action === "inc" ? current + 1 : Math.max(1, current - 1);
      els.modalQuantity.value = String(next);
    });
  });

  els.modalAddToCart.addEventListener("click", () => {
    const product = state.productsByCode.get(state.activeModalCode);
    if (!product || product.outOfStock) {
      return;
    }
    const quantity = Math.max(1, Number(els.modalQuantity.value) || 1);
    addToCart(product.code, quantity);
    openCart();
  });

  els.checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleCheckout();
  });
}

async function loadManifest() {
  for (const candidate of MANIFEST_CANDIDATES) {
    try {
      const response = await fetchWithRetry(candidate, { cache: "no-store" });
      const manifest = await response.json();
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      return {
        generatedAt: manifest.generatedAt || null,
        files: files.map(normalizeManifestEntry),
      };
    } catch (error) {
      console.warn("Manifest candidate failed:", candidate, error);
    }
  }
  throw new Error("All manifest candidates failed");
}

function normalizeManifestEntry(entry) {
  const path = String(entry.path || "").replace(/\\/g, "/");
  const parts = path.split("/").filter(Boolean);
  const name = String(entry.name || parts.at(-1) || "");
  const extension = String(entry.extension || getExtension(name)).toLowerCase();
  const baseName = String(entry.baseName || stripExtension(name)).toLowerCase();
  const dir = String(entry.dir || parts[0] || "").toLowerCase();
  return { path, name, extension, baseName, dir };
}

async function loadBranding() {
  const logoEntry = findRootFileByBase("logo");
  if (logoEntry) {
    const logoImg = document.createElement("img");
    logoImg.src = logoEntry.path;
    logoImg.alt = SITE_NAME;
    logoImg.addEventListener("error", () => {
      els.brandLogo.textContent = "HJY";
    });
    els.brandLogo.textContent = "";
    els.brandLogo.appendChild(logoImg);
  }
}

function buildPhotoIndex() {
  state.photoIndex.clear();
  getFilesByDir("photo").forEach((file) => {
    const key = normalizeLoose(file.baseName);
    if (!state.photoIndex.has(key)) {
      state.photoIndex.set(key, []);
    }
    state.photoIndex.get(key).push(file.path);
  });
}

async function loadDataFiles() {
  const dataFiles = getFilesByDir("data").filter((file) => {
    if (file.extension === ".csv") {
      return true;
    }
    return file.extension === "" || file.extension === ".txt";
  });

  const specialFiles = new Map();
  const productFiles = [];

  dataFiles.forEach((file) => {
    const base = normalizeLoose(file.baseName);
    if (SPECIAL_DATA_FILES.has(base)) {
      specialFiles.set(base, file);
    } else {
      productFiles.push(file);
    }
  });

  const specialResults = await Promise.all(
    ["fav", "more_fav", "more_sell", "out_pro", "categories"].map((key) =>
      readOptionalText(specialFiles.get(key))
    )
  );

  state.codes.fav = parseCodeSet(specialResults[0]);
  state.codes.more_fav = parseCodeSet(specialResults[1]);
  state.codes.more_sell = parseCodeSet(specialResults[2]);
  state.codes.out_pro = parseCodeSet(specialResults[3]);
  state.categories = parseCategories(specialResults[4]);

  const productTexts = await Promise.all(productFiles.map((file) => readOptionalText(file)));
  const products = [];
  productTexts.forEach((text, index) => {
    const file = productFiles[index];
    const parsed = parseProductCsv(text, file?.path || "");
    parsed.forEach((product) => products.push(product));
  });

  const uniqueProducts = new Map();
  products.forEach((product) => {
    if (!product.code) {
      return;
    }
    product.outOfStock = state.codes.out_pro.has(product.code);
    product.images = resolveProductImages(product);
    uniqueProducts.set(product.code, product);
  });

  state.products = Array.from(uniqueProducts.values());
  state.products.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  state.productsByCode = new Map(state.products.map((product) => [product.code, product]));
}

function parseProductCsv(text, sourcePath) {
  if (!text || !text.trim()) {
    return [];
  }
  const rows = parseCsv(text);
  if (!rows.length) {
    return [];
  }
  const headers = rows[0].map((header) => normalizeHeader(header));
  const hasHeader = headers.includes("code") && headers.includes("name");
  const startIndex = hasHeader ? 1 : 0;
  const items = [];

  for (let index = startIndex; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.some((cell) => String(cell || "").trim())) {
      continue;
    }

    const getValue = (preferredName, fallbackIndex) => {
      const headerIndex = headers.indexOf(preferredName);
      const value = row[headerIndex >= 0 ? headerIndex : fallbackIndex];
      return String(value || "").trim();
    };

    const code = normalizeCode(getValue("code", 0));
    const name = getValue("name", 1) || "قريباً - جاري تحديث";
    const price = toNumber(getValue("price", 2));
    const about1 = getValue("about1", 3);
    const about2 = getValue("about2", 4);
    const discountRaw = getValue("dis", 5);
    const photoField = getValue("photo", 6);
    if (!code || !name) {
      continue;
    }

    items.push({
      code,
      name,
      price,
      about1,
      about2,
      discountRaw,
      photoField,
      sourcePath,
      discountRules: parseDiscountRules(discountRaw, price),
    });
  }

  return items;
}

function parseDiscountRules(rawValue, basePrice) {
  if (!rawValue || !String(rawValue).trim()) {
    return [];
  }
  return String(rawValue)
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const percentMatch = line.match(/^(\d+)\s*\+?\s*p\s*=\s*([\d.]+)\s*%$/i);
      if (percentMatch) {
        const minQty = Number(percentMatch[1]);
        const percent = Number(percentMatch[2]);
        const discountedUnit = roundPrice(basePrice * (1 - percent / 100));
        return {
          raw: line,
          minQty,
          type: "percent",
          percent,
          discountedUnit,
          label: `اشترِ ${minQty} قطع لتحصل على خصم ${percent}% ويصبح السعر ${formatCurrency(
            discountedUnit
          )} بدل ${formatCurrency(basePrice)} للقطعة.`,
        };
      }

      const directMatch = line.match(/^(\d+)\s*\+?\s*p\s*=\s*([\d.]+)$/i);
      if (directMatch) {
        const minQty = Number(directMatch[1]);
        const discountedUnit = roundPrice(Number(directMatch[2]));
        return {
          raw: line,
          minQty,
          type: "fixed",
          percent: null,
          discountedUnit,
          label: `اشترِ ${minQty} قطع على الأقل ليصبح سعر القطعة ${formatCurrency(
            discountedUnit
          )} بدل ${formatCurrency(basePrice)}.`,
        };
      }

      return {
        raw: line,
        minQty: null,
        type: "text",
        percent: null,
        discountedUnit: basePrice,
        label: line,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.minQty || 0) - (b.minQty || 0));
}

function resolveProductImages(product) {
  const results = [];
  const pushUnique = (value) => {
    if (value && !results.includes(value)) {
      results.push(value);
    }
  };

  const codeMatches = state.photoIndex.get(normalizeLoose(product.code)) || [];
  codeMatches.forEach(pushUnique);

  String(product.photoField || "")
    .split(/[,،;\n]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => {
      if (isUrl(token)) {
        pushUnique(token);
        return;
      }
      const normalized = normalizeLoose(stripExtension(token));
      const matches = state.photoIndex.get(normalized) || [];
      if (matches.length) {
        matches.forEach(pushUnique);
      }
    });

  if (!results.length) {
    results.push(PLACEHOLDER_IMAGE);
  }

  return results;
}

async function loadInfoSections(dirName, tabsContainer, contentContainer) {
  const files = getFilesByDir(dirName).filter((file) => isTextLike(file.extension));
  if (!files.length) {
    tabsContainer.innerHTML = "";
    contentContainer.textContent = "قريباً";
    return;
  }

  const texts = await Promise.all(files.map((file) => readOptionalText(file)));
  const items = files.map((file, index) => ({
    title: stripExtension(file.name),
    path: file.path,
    raw: texts[index],
  }));

  tabsContainer.innerHTML = "";
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "info-tab" + (index === 0 ? " active" : "");
    button.textContent = item.title;
    button.addEventListener("click", () => {
      tabsContainer.querySelectorAll(".info-tab").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      renderTextPanel(dirName, item, contentContainer);
    });
    tabsContainer.appendChild(button);
  });

  renderTextPanel(dirName, items[0], contentContainer);
}

function renderTextPanel(dirName, item, container) {
  const text = item.raw && item.raw.trim() ? item.raw : "قريباً";
  const parts = [];
  if (dirName === "about" && normalizeLoose(item.title) === normalizeLoose("المطور")) {
    const profileEntry = findRootFileByBase("profile");
    if (profileEntry) {
      parts.push(
        `<img class="developer-profile" src="${escapeAttribute(profileEntry.path)}" alt="المطور" />`
      );
    }
  }
  parts.push(formatRichText(text));
  container.innerHTML = parts.join("");
}

function renderHeroStats() {
  els.productCount.textContent = String(state.products.length);
  els.categoryCount.textContent = String(state.categories.length);
  els.manifestDate.textContent = state.manifest.generatedAt
    ? new Date(state.manifest.generatedAt).toLocaleString("ar")
    : "غير متوفر";
  els.heroDescription.textContent =
    state.products.length > 0
      ? "تم تحميل بيانات المنتجات بنجاح من ملفات CSV مع دعم البحث والصور والخصومات الديناميكية."
      : "لم يتم العثور على منتجات بعد. أضف ملفات CSV داخل مجلد data ثم شغّل مولد manifest.";

  const pills = [
    `${state.codes.fav.size} رئيسية`,
    `${state.codes.more_fav.size} مميزة`,
    `${state.codes.more_sell.size} أكثر مبيعاً`,
    `${state.codes.out_pro.size} منتهية`,
  ];
  els.heroPills.innerHTML = pills.map((item) => `<span>${item}</span>`).join("");
}

function renderCategoryOptions() {
  const options = [
    `<option value="all">كل الأقسام</option>`,
    `<option value="out_of_stock">منتهية الكمية</option>`,
  ];

  state.categories.forEach((category) => {
    options.push(
      `<option value="${escapeAttribute(category.id)}">${escapeHtml(category.title)}</option>`
    );
  });
  els.categoryFilter.innerHTML = options.join("");
}

function renderFeaturedSections() {
  els.featuredSections.innerHTML = "";
  state.featuredSliders = [];

  const sections = [
    {
      id: "fav",
      tag: "الرئيسية",
      title: "منتجات الصفحة الرئيسية",
      products: pickProductsByCodeSet(state.codes.fav),
    },
    {
      id: "more_fav",
      tag: "مميز",
      title: "منتجات مميزة",
      products: pickProductsByCodeSet(state.codes.more_fav),
    },
    {
      id: "more_sell",
      tag: "الأكثر مبيعاً",
      title: "الأكثر مبيعاً",
      products: pickProductsByCodeSet(state.codes.more_sell),
    },
    {
      id: "out",
      tag: "المخزون",
      title: "منتهية الكمية",
      products: state.products.filter((product) => product.outOfStock),
    },
    ...state.categories.map((category) => ({
      id: category.id,
      tag: "قسم",
      title: category.title,
      products: state.products.filter((product) => matchesCategory(product, category)),
    })),
  ].filter((section) => section.products.length > 0);

  sections.forEach((section) => {
    const clone = els.sliderSectionTemplate.content.firstElementChild.cloneNode(true);
    clone.querySelector(".section-tag").textContent = section.tag;
    clone.querySelector(".section-title").textContent = section.title;
    const track = clone.querySelector(".slider-track");
    const prevButton = clone.querySelector(".slider-prev");
    const nextButton = clone.querySelector(".slider-next");
    const visibleCount = 5;
    let index = 0;

    section.products.forEach((product) => {
      track.appendChild(createProductCard(product, { compact: true }));
    });

    const updateSlider = () => {
      const card = track.firstElementChild;
      if (!card) {
        return;
      }
      const style = window.getComputedStyle(track);
      const gap = Number.parseFloat(style.columnGap || style.gap || "12") || 12;
      const width = card.getBoundingClientRect().width + gap;
      const maxIndex = Math.max(0, section.products.length - visibleCount);
      index = clamp(index, 0, maxIndex);
      track.style.transform = `translateX(${index * width}px)`;
      prevButton.disabled = index >= maxIndex;
      nextButton.disabled = index <= 0;
    };

    prevButton.addEventListener("click", () => {
      index += 1;
      updateSlider();
    });

    nextButton.addEventListener("click", () => {
      index -= 1;
      updateSlider();
    });

    window.addEventListener("resize", updateSlider);
    requestAnimationFrame(updateSlider);
    state.featuredSliders.push(updateSlider);
    els.featuredSections.appendChild(clone);
  });
}

function renderCatalog() {
  const products = getFilteredProducts();
  els.catalogGrid.innerHTML = "";
  if (!products.length) {
    els.catalogEmpty.classList.remove("hidden");
    return;
  }

  els.catalogEmpty.classList.add("hidden");
  products.forEach((product) => {
    els.catalogGrid.appendChild(createProductCard(product, { compact: false }));
  });
}

function renderSearchSuggestions() {
  const term = state.searchTerm.trim();
  if (!term) {
    els.searchSuggestions.classList.add("hidden");
    els.searchSuggestions.innerHTML = "";
    return;
  }
  const matches = searchProducts(term).slice(0, 8);
  if (!matches.length) {
    els.searchSuggestions.classList.add("hidden");
    return;
  }
  els.searchSuggestions.innerHTML = "";
  matches.forEach((product) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-item";
    button.innerHTML = `
      <strong>${escapeHtml(product.name)}</strong>
      <span>${escapeHtml(product.about1 || product.code)}</span>
    `;
    button.addEventListener("click", () => {
      state.searchTerm = product.name;
      els.searchInput.value = product.name;
      els.searchSuggestions.classList.add("hidden");
      renderCatalog();
      openProductModal(product.code);
    });
    els.searchSuggestions.appendChild(button);
  });
  els.searchSuggestions.classList.remove("hidden");
}

function createProductCard(product, options = {}) {
  const compact = Boolean(options.compact);
  const node = els.productCardTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.code = product.code;
  if (compact) {
    node.classList.add("compact-card");
  }

  const image = node.querySelector(".product-image");
  const code = node.querySelector(".product-code");
  const title = node.querySelector(".product-name");
  const about1 = node.querySelector(".product-about1");
  const price = node.querySelector(".product-price");
  const discounts = node.querySelector(".product-discounts");
  const detailsButton = node.querySelector(".details-btn");
  const quickButton = node.querySelector(".quick-view");
  const addButton = node.querySelector(".add-btn");

  image.src = product.images[0] || PLACEHOLDER_IMAGE;
  image.alt = product.name;
  image.addEventListener("error", () => {
    image.src = PLACEHOLDER_IMAGE;
  });

  code.textContent = product.code;
  title.textContent = product.name;
  about1.textContent = product.about1 || "قريباً - جاري تحديث";
  price.innerHTML = renderPriceLine(product.price);

  if (!compact && product.discountRules.length) {
    discounts.classList.remove("hidden");
    discounts.innerHTML = product.discountRules
      .map((rule) => `<div class="discount-item">${escapeHtml(rule.label)}</div>`)
      .join("");
  }

  detailsButton.addEventListener("click", () => openProductModal(product.code));
  quickButton.addEventListener("click", () => openProductModal(product.code));

  if (product.outOfStock) {
    addButton.textContent = "منتهية الكمية";
    addButton.classList.add("out-stock");
    addButton.disabled = true;
  } else {
    addButton.addEventListener("click", () => addToCart(product.code, 1));
  }

  return node;
}

function openProductModal(code) {
  const product = state.productsByCode.get(code);
  if (!product) {
    return;
  }

  state.activeModalCode = code;
  els.modalQuantity.value = "1";
  els.modalCode.textContent = product.code;
  els.modalTitle.textContent = product.name;
  els.modalPriceLine.innerHTML = renderPriceLine(product.price);
  els.modalAbout1.textContent = product.about1 || "قريباً - جاري تحديث";
  els.modalAbout2.innerHTML = formatRichText(product.about2 || "قريباً - جاري تحديث");

  if (product.discountRules.length) {
    els.modalDiscounts.classList.remove("hidden");
    els.modalDiscounts.innerHTML = product.discountRules
      .map((rule) => `<div class="discount-item">${escapeHtml(rule.label)}</div>`)
      .join("");
  } else {
    els.modalDiscounts.classList.add("hidden");
    els.modalDiscounts.innerHTML = "";
  }

  els.modalThumbs.innerHTML = "";
  const images = product.images.length ? product.images : [PLACEHOLDER_IMAGE];
  els.modalMainImage.src = images[0];
  els.modalMainImage.alt = product.name;
  els.modalMainImage.addEventListener("error", () => {
    els.modalMainImage.src = PLACEHOLDER_IMAGE;
  });
  images.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modal-thumb";
    button.innerHTML = `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(
      product.name
    )} ${index + 1}" />`;
    button.addEventListener("click", () => {
      els.modalMainImage.src = src;
    });
    els.modalThumbs.appendChild(button);
  });

  if (product.outOfStock) {
    els.modalAddToCart.textContent = "منتهية الكمية";
    els.modalAddToCart.disabled = true;
    els.modalAddToCart.classList.add("out-stock");
  } else {
    els.modalAddToCart.textContent = "إضافة إلى السلة";
    els.modalAddToCart.disabled = false;
    els.modalAddToCart.classList.remove("out-stock");
  }

  document.body.classList.add("modal-open");
  els.productModal.showModal();
}

function closeProductModal() {
  if (!els.productModal.open) {
    return;
  }
  els.productModal.close();
  document.body.classList.remove("modal-open");
  state.activeModalCode = null;
}

function openCart() {
  els.cartDrawer.classList.add("open");
  els.cartDrawer.setAttribute("aria-hidden", "false");
  els.overlay.classList.remove("hidden");
  document.body.classList.add("cart-open");
}

function closeCart() {
  els.cartDrawer.classList.remove("open");
  els.cartDrawer.setAttribute("aria-hidden", "true");
  if (!els.productModal.open) {
    els.overlay.classList.add("hidden");
  }
  document.body.classList.remove("cart-open");
}

function addToCart(code, quantity) {
  const product = state.productsByCode.get(code);
  if (!product || product.outOfStock) {
    return;
  }
  const current = state.cart[code] || 0;
  state.cart[code] = current + Math.max(1, quantity);
  saveCart();
  renderCart();
}

function updateCartQuantity(code, quantity) {
  if (quantity <= 0) {
    delete state.cart[code];
  } else {
    state.cart[code] = quantity;
  }
  saveCart();
  renderCart();
}

function renderCart() {
  const codes = Object.keys(state.cart);
  els.cartCount.textContent = String(
    codes.reduce((sum, code) => sum + (state.cart[code] || 0), 0)
  );

  if (!codes.length) {
    els.cartList.innerHTML = "";
    els.cartEmpty.classList.remove("hidden");
    els.cartOriginalTotal.textContent = formatCurrency(0);
    els.cartDiscountTotal.textContent = formatCurrency(0);
    els.cartFinalTotal.textContent = formatCurrency(0);
    return;
  }

  els.cartEmpty.classList.add("hidden");
  els.cartList.innerHTML = "";

  let originalTotal = 0;
  let finalTotal = 0;

  codes.forEach((code) => {
    const product = state.productsByCode.get(code);
    const quantity = state.cart[code];
    if (!product || quantity <= 0) {
      return;
    }
    const pricing = getAppliedPricing(product, quantity);
    originalTotal += pricing.originalTotal;
    finalTotal += pricing.finalTotal;

    const item = document.createElement("article");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${escapeAttribute(product.images[0] || PLACEHOLDER_IMAGE)}" alt="${escapeAttribute(
        product.name
      )}" />
      <div class="cart-item-main">
        <h4>${escapeHtml(product.name)}</h4>
        <div class="price-line">
          <del>${formatCurrency(pricing.originalTotal)}</del>
          <strong>${formatCurrency(pricing.finalTotal)}</strong>
        </div>
        <div class="cart-controls">
          <button class="mini-btn" type="button" data-action="inc">+</button>
          <button class="mini-btn" type="button" data-action="dec">-</button>
          <span>${quantity} قطعة</span>
          <button class="mini-btn" type="button" data-action="remove">x</button>
        </div>
        ${
          pricing.appliedRule
            ? `<div class="cart-note">لقد حصلت على خصم: ${escapeHtml(
                pricing.appliedRule.label
              )}</div>`
            : ""
        }
      </div>
    `;

    item.querySelector('[data-action="inc"]').addEventListener("click", () => {
      updateCartQuantity(code, quantity + 1);
    });
    item.querySelector('[data-action="dec"]').addEventListener("click", () => {
      updateCartQuantity(code, quantity - 1);
    });
    item.querySelector('[data-action="remove"]').addEventListener("click", () => {
      updateCartQuantity(code, 0);
    });
    els.cartList.appendChild(item);
  });

  const discountTotal = roundPrice(originalTotal - finalTotal);
  els.cartOriginalTotal.textContent = formatCurrency(originalTotal);
  els.cartDiscountTotal.textContent = formatCurrency(discountTotal);
  els.cartFinalTotal.textContent = formatCurrency(finalTotal);
}

async function handleCheckout() {
  const codes = Object.keys(state.cart);
  if (!codes.length) {
    els.checkoutNote.textContent = "السلة فارغة حالياً.";
    return;
  }

  const lines = [
    `طلب جديد من ${SITE_NAME}`,
    "",
    `الاسم: ${els.customerName.value.trim() || "غير محدد"}`,
    `الهاتف: ${els.customerPhone.value.trim() || "غير محدد"}`,
    `الملاحظة: ${els.customerNote.value.trim() || "لا توجد"}`,
    "",
    "تفاصيل المنتجات:",
  ];

  let originalTotal = 0;
  let finalTotal = 0;

  codes.forEach((code) => {
    const product = state.productsByCode.get(code);
    const quantity = state.cart[code];
    if (!product) {
      return;
    }
    const pricing = getAppliedPricing(product, quantity);
    originalTotal += pricing.originalTotal;
    finalTotal += pricing.finalTotal;
    lines.push(
      `- ${product.name} | ${product.code} | الكمية: ${quantity} | الإجمالي: ${formatCurrency(
        pricing.finalTotal
      )}`
    );
    if (pricing.appliedRule) {
      lines.push(`  العرض: ${pricing.appliedRule.label}`);
    }
  });

  lines.push("");
  lines.push(`الإجمالي قبل العروض: ${formatCurrency(originalTotal)}`);
  lines.push(`إجمالي الخصومات: ${formatCurrency(originalTotal - finalTotal)}`);
  lines.push(`الإجمالي النهائي: ${formatCurrency(finalTotal)}`);

  const message = lines.join("\n");
  try {
    await navigator.clipboard.writeText(message);
    els.checkoutNote.textContent =
      "تم تجهيز رسالة الطلب ونسخها إلى الحافظة. ربط تيليغرام المباشر يحتاج طبقة آمنة لحماية التوكن.";
  } catch (error) {
    console.warn("Clipboard write failed", error);
    els.checkoutNote.textContent =
      "تم تجهيز رسالة الطلب، لكن تعذر نسخها تلقائياً. اربط لاحقاً وسيطاً آمناً لإرسالها إلى تيليغرام.";
  }
}

function getAppliedPricing(product, quantity) {
  const applicable = product.discountRules.filter(
    (rule) => rule.minQty && quantity >= rule.minQty
  );
  const appliedRule = applicable.length ? applicable[applicable.length - 1] : null;
  const unitPrice = appliedRule ? appliedRule.discountedUnit : product.price;
  return {
    appliedRule,
    originalTotal: roundPrice(product.price * quantity),
    finalTotal: roundPrice(unitPrice * quantity),
  };
}

function renderPriceLine(price) {
  const marketing = roundPrice(price * 1.15);
  return `<del>${formatCurrency(marketing)}</del><strong>${formatCurrency(price)}</strong>`;
}

function getFilteredProducts() {
  let result = [...state.products];

  if (state.selectedCategory !== "all") {
    if (state.selectedCategory === "out_of_stock") {
      result = result.filter((product) => product.outOfStock);
    } else {
      const category = state.categories.find((item) => item.id === state.selectedCategory);
      if (category) {
        result = result.filter((product) => matchesCategory(product, category));
      }
    }
  }

  const term = state.searchTerm.trim();
  if (term) {
    const matchedCodes = new Set(searchProducts(term).map((product) => product.code));
    result = result.filter((product) => matchedCodes.has(product.code));
  }

  return result;
}

function searchProducts(term) {
  const normalizedTerm = normalizeLoose(term);
  if (!normalizedTerm) {
    return [...state.products];
  }

  const scored = state.products
    .map((product) => {
      const primaryText = normalizeLoose([product.name, product.about1].join(" "));
      const secondaryText = normalizeLoose(product.about2 || "");
      let score = 0;
      if (primaryText.includes(normalizedTerm)) {
        score += 20;
      }
      if (normalizeLoose(product.name).includes(normalizedTerm)) {
        score += 10;
      }
      if (secondaryText.includes(normalizedTerm)) {
        score += 4;
      }
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "ar"));

  return scored.map((item) => item.product);
}

function matchesCategory(product, category) {
  return category.keywords.some((keyword) => {
    const source = normalizeLoose(`${product.name} ${product.about1 || ""}`);
    return source.includes(normalizeLoose(keyword));
  });
}

function pickProductsByCodeSet(codeSet) {
  return Array.from(codeSet)
    .map((code) => state.productsByCode.get(code))
    .filter(Boolean);
}

function parseCodeSet(text) {
  if (!text || !text.trim()) {
    return new Set();
  }
  const rows = parseCsv(text);
  const values = [];

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      const value = String(cell || "").trim();
      if (!value) {
        return;
      }
      if (rowIndex === 0 && cellIndex === 0 && normalizeLoose(value) === "code") {
        return;
      }
      values.push(normalizeCode(value));
    });
  });

  return new Set(values.filter(Boolean));
}

function parseCategories(text) {
  if (!text || !text.trim()) {
    return [];
  }
  const rows = parseCsv(text);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => normalizeHeader(header));
  const hasHeader = headers.includes("keyword") || headers.includes("title");
  const startIndex = hasHeader ? 1 : 0;
  const items = [];

  for (let index = startIndex; index < rows.length; index += 1) {
    const row = rows[index];
    const title =
      String(
        row[headers.indexOf("title") >= 0 ? headers.indexOf("title") : 1] || ""
      ).trim() || "قريباً - جاري تحديث";
    const keywordRaw = String(
      row[headers.indexOf("keyword") >= 0 ? headers.indexOf("keyword") : 0] || ""
    ).trim();

    const keywords = keywordRaw
      .split(/[,،]+/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!title || !keywords.length) {
      continue;
    }

    items.push({
      id: `category-${index}-${normalizeLoose(title)}`,
      title,
      keywords,
    });
  }

  return items;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.map((cells) => cells.map((cell) => String(cell || "").trim()));
}

function formatRichText(text) {
  const safe = escapeHtml(text || "قريباً");
  const linked = safe.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noreferrer">$1</a>'
  );
  const emphasized = linked.replace(
    /\*([^*]+)\*/g,
    '<span class="rich-title">$1</span>'
  );
  return emphasized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line, index, array) => line || array[index - 1])
    .map((line) => {
      if (!line) {
        return "<p></p>";
      }
      if (/^<span class="rich-title">.*<\/span>$/.test(line)) {
        return line;
      }
      return `<p>${line}</p>`;
    })
    .join("");
}

async function readOptionalText(fileEntry) {
  if (!fileEntry) return "";
  
  // Check cache first
  const cacheKey = `file-${fileEntry.path}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetchWithRetry(fileEntry.path);
    const text = await response.text();
    setCache(cacheKey, text);
    return text;
  } catch (error) {
    console.warn(`Failed to load file: ${fileEntry.path}`, error);
    return "";
  }
}

function findRootFileByBase(baseName) {
  return getFilesByDir("root").find(
    (file) => normalizeLoose(file.baseName) === normalizeLoose(baseName)
  );
}

function getFilesByDir(dir) {
  return state.manifest.files.filter((file) => file.dir === dir);
}

function normalizeHeader(value) {
  return normalizeLoose(value).replace(/\s+/g, "");
}

function normalizeCode(value) {
  return normalizeLoose(value).toUpperCase();
}

function normalizeLoose(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

function stripExtension(name) {
  return String(name || "").replace(/\.[^.]+$/, "");
}

function getExtension(name) {
  const match = String(name || "").match(/(\.[^.]+)$/);
  return match ? match[1] : "";
}

function isTextLike(extension) {
  return extension === ".txt" || extension === "" || extension === ".md";
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function toNumber(value) {
  const normalized = String(value || "").replace(/[^\d.]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function roundPrice(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value) {
  return `${roundPrice(value).toFixed(2).replace(/\.00$/, "")} $`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn("Cart load failed", error);
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
}

function renderHeroStats() {
  els.productCount.textContent = String(state.products.length);
  els.categoryCount.textContent = String(state.categories.length);
  if (state.manifest.generatedAt) {
    const date = new Date(state.manifest.generatedAt);
    els.manifestDate.textContent = date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function renderEmptyStates() {
  els.catalogGrid.innerHTML = "";
  els.catalogEmpty.classList.remove("hidden");
  els.featuredSections.innerHTML = "";
  els.aboutTabs.innerHTML = "";
  els.objectTabs.innerHTML = "";
  els.aboutContent.textContent = "قريباً";
  els.objectContent.textContent = "قريباً";
}

// --- Cache Helpers ---
function setCache(key, value) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn("Cache write failed:", e);
  }
}

function getCache(key) {
  try {
    const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

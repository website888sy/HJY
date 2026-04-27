/**
 * HJY STORE - Advanced Catalog Logic
 * Robust CSV Parsing, Dynamic Categories, and Manifest Integration
 */

const SITE_NAME = "HJY STORE";
const MANIFEST_CANDIDATES = ["./root/site-manifest.json", "./site-manifest.json"];
const CART_STORAGE_KEY = "hjy-store-cart-v1";

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
    cart: [],
    isLoading: false,
};

const els = {
    catalogGrid: document.getElementById("catalogGrid"),
    catalogEmpty: document.getElementById("catalogEmpty"),
    categoryFilterContainer: document.getElementById("categoryFilterContainer"),
    searchInput: document.getElementById("searchInput"),
    cartTrigger: document.getElementById("cartTrigger"),
    cartDrawer: document.getElementById("cartDrawer"),
    overlay: document.getElementById("overlay"),
    closeCart: document.getElementById("closeCart"),
    cartCount: document.getElementById("cartCount"),
    cartList: document.getElementById("cartList"),
    cartFinalTotal: document.getElementById("cartFinalTotal"),
    dataInfo: document.getElementById("dataInfo"),
    loadingBar: document.getElementById("loadingBar"),
    productCardTemplate: document.getElementById("productCardTemplate"),
};

// --- Initialization ---

document.addEventListener("DOMContentLoaded", async () => {
    state.cart = loadCart();
    bindEvents();
    await init();
});

async function init() {
    setLoading(true, 30);
    updateStatus("جاري البحث عن ملفات البيانات...");

    try {
        const manifest = await loadManifest();
        state.manifest = manifest;
        setLoading(true, 60);

        // Load logo if exists
        const logoFile = manifest.files.find(f => f.dir === "root" && f.baseName.toLowerCase() === "logo");
        if (logoFile) {
            const logoImg = document.querySelector("#brandLogo img");
            if (logoImg) logoImg.src = logoFile.path;
        }

        await processData();
        setLoading(true, 90);
        
        renderAll();
        updateStatus(`تمت المزامنة بنجاح (${state.products.length} منتج)`);
    } catch (error) {
        console.error("Initialization Error:", error);
        updateStatus("⚠️ خطأ في تحميل البيانات. تأكد من وجود ملف site-manifest.json");
    } finally {
        setLoading(false);
    }
}

// --- Data Processing ---

async function loadManifest() {
    for (const path of MANIFEST_CANDIDATES) {
        try {
            const res = await fetch(`${path}?t=${Date.now()}`);
            if (res.ok) return await res.json();
        } catch (e) {}
    }
    throw new Error("Manifest not found");
}

async function processData() {
    const dataFiles = state.manifest.files.filter(f => f.dir === "data" && (f.extension === ".csv" || f.extension === ".txt" || f.extension === ".xlsx"));
    const homeFiles = state.manifest.files.filter(f => f.dir === "home" && (f.extension === ".csv" || f.extension === ".txt" || f.extension === ".xlsx"));
    
    const allProducts = [];
    const foundCategories = new Set();

    // 1. Load regular products from data/
    for (const file of dataFiles) {
        try {
            let rows = [];
            if (file.extension === ".xlsx") {
                rows = await parseXlsx(file.path);
            } else {
                const res = await fetch(file.path);
                const text = await res.text();
                rows = parseCsv(text);
            }
            
            if (rows.length < 1) continue;
            
            // If headers are missing or it's just one row, handle carefully
            const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
            
            // Flexible header detection
            const idx = {
                code: headers.findIndex(h => h.includes("code") || h.includes("كود") || h.includes("رمز")),
                name: headers.findIndex(h => h.includes("name") || h.includes("اسم") || h.includes("منتج")),
                price: headers.findIndex(h => h.includes("price") || h.includes("سعر") || h.includes("ثمن")),
                dis: headers.findIndex(h => h.includes("dis") || h.includes("خصم") || h.includes("تخفيض")),
                about: headers.findIndex(h => h.includes("about") || h.includes("وصف") || h.includes("تفاصيل") || h.includes("بيان") || h.includes("about1")),
                cat: headers.findIndex(h => h.includes("cat") || h.includes("فئة") || h.includes("قسم") || h.includes("نوع"))
            };

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row[idx.code] || !row[idx.name]) continue;

                const product = {
                    code: String(row[idx.code]).trim(),
                    name: String(row[idx.name]).trim(),
                    price: parseFloat(row[idx.price]) || 0,
                    discountRaw: idx.dis !== -1 ? String(row[idx.dis]).trim() : "",
                    desc: idx.about !== -1 ? String(row[idx.about]).trim() : "",
                    category: (idx.cat !== -1 && row[idx.cat]) ? String(row[idx.cat]).trim() : file.baseName,
                    image: resolveImagePath(String(row[idx.code]).trim())
                };
                allProducts.push(product);
                foundCategories.add(product.category);
            }
        } catch (e) {
            console.error(`Failed to parse ${file.path}:`, e);
        }
    }

    state.products = allProducts;
    state.productsByCode = new Map(allProducts.map(p => [p.code, p]));

    // 2. Load Home Configs
    const catFile = homeFiles.find(f => f.baseName.toLowerCase() === "categories");
    if (catFile) {
        try {
            let rows = [];
            if (catFile.extension === ".xlsx") {
                rows = await parseXlsx(catFile.path);
            } else {
                const res = await fetch(catFile.path);
                const text = await res.text();
                rows = parseCsv(text);
            }
            state.categories = rows.flat().filter(c => c && !String(c).toLowerCase().includes("name")).map(c => String(c).trim());
        } catch (e) { state.categories = Array.from(foundCategories); }
    } else {
        state.categories = Array.from(foundCategories);
    }

    // 3. Special Lists
    for (const key of Object.keys(state.homeLists)) {
        const listFile = homeFiles.find(f => f.baseName.toLowerCase() === key.toLowerCase());
        if (listFile) {
            try {
                let rows = [];
                if (listFile.extension === ".xlsx") {
                    rows = await parseXlsx(listFile.path);
                } else {
                    const res = await fetch(listFile.path);
                    const text = await res.text();
                    rows = parseCsv(text);
                }
                state.homeLists[key] = rows.map(r => String(r[0] || "").trim()).filter(c => c && !c.toLowerCase().includes("code"));
            } catch (e) {}
        }
    }
}

// --- UI Rendering ---

function renderAll() {
    renderCategories();
    renderCatalog();
    renderCart();
}

function renderCategories() {
    if (!els.categoryFilterContainer) return;
    const container = els.categoryFilterContainer;
    const active = state.selectedCategory;
    
    container.innerHTML = `<button class="filter-pill ${active === 'all' ? 'active' : ''}" data-category="all">الكل</button>`;
    
    state.categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `filter-pill ${active === cat ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            state.selectedCategory = cat;
            document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
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
            p.code.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            p.desc.toLowerCase().includes(state.searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        els.catalogEmpty.classList.remove("hidden");
        return;
    }

    els.catalogEmpty.classList.add("hidden");
    filtered.forEach(p => {
        const card = els.productCardTemplate.content.cloneNode(true);
        const container = card.querySelector(".product-card");
        
        // Image
        const img = card.querySelector("img");
        img.src = p.image;
        img.alt = p.name;
        img.onerror = () => { img.src = "./root/placeholder.png"; };

        // Meta
        card.querySelector(".product-code").textContent = p.code;
        card.querySelector(".product-name").textContent = p.name;
        card.querySelector(".product-desc").textContent = p.desc;

        // Special Badges
        const badgesArea = card.querySelector("#specialBadges");
        if (state.homeLists.fav.includes(p.code)) addBadge(badgesArea, "مفضل", "badge-fav");
        if (state.homeLists.more_sell.includes(p.code)) addBadge(badgesArea, "الأكثر مبيعاً", "badge-hot");
        if (state.homeLists.out_pro.includes(p.code)) {
            addBadge(badgesArea, "نفذ", "badge-out");
            container.classList.add("out-of-stock");
        }

        // Price & Discount
        const priceNew = card.querySelector(".price-new");
        const priceOld = card.querySelector(".price-old");
        const disBadge = card.querySelector("#discountBadge");

        if (p.discountRaw) {
            const val = parseFloat(p.discountRaw);
            if (!isNaN(val)) {
                const isPct = p.discountRaw.includes("%");
                const oldPriceVal = isPct ? p.price / (1 - val / 100) : p.price + val;
                priceOld.textContent = `${oldPriceVal.toFixed(2)} $`;
                disBadge.textContent = isPct ? `-${val}%` : `-${val}$`;
                disBadge.classList.remove("hidden");
            }
        }
        priceNew.textContent = `${p.price.toFixed(2)} $`;

        // Buttons
        card.querySelector(".add-btn").onclick = () => addToCart(p.code);
        card.querySelector(".copy-btn").onclick = () => copyToClipboard(p.code);

        els.catalogGrid.appendChild(card);
    });
}

// --- Cart Logic ---

function addToCart(code) {
    const existing = state.cart.find(i => i.code === code);
    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ code, qty: 1 });
    }
    saveCart();
    renderCart();
    // Simple visual feedback
    showStatus(`تمت إضافة ${code} إلى السلة`);
}

function renderCart() {
    els.cartCount.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
    if (!els.cartList) return;
    els.cartList.innerHTML = "";
    
    let total = 0;
    state.cart.forEach(item => {
        const p = state.productsByCode.get(item.code);
        if (!p) return;
        total += p.price * item.qty;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style = "display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #eee; align-items: center;";
        div.innerHTML = `
            <img src="${p.image}" style="width: 60px; height: 60px; object-fit: contain; background: #f9f9f9; border-radius: 8px;">
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 14px;">${p.name}</div>
                <div style="color: var(--primary); font-weight: bold;">${p.price} $</div>
                <div style="font-size: 12px; color: #888;">الكمية: ${item.qty}</div>
            </div>
            <button onclick="removeFromCart('${item.code}')" style="color: #f44336; background: none; border: none; cursor: pointer; font-size: 18px;">🗑️</button>
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

// --- Helpers ---

function parseCsv(text) {
    const result = [];
    let row = [], cell = '', inQuotes = false;
    const separator = text.split('\n')[0].includes(';') ? ';' : ',';

    for (let i = 0; i < text.length; i++) {
        const char = text[i], next = text[i + 1];
        if (inQuotes) {
            if (char === '"') {
                if (next === '"') { cell += '"'; i++; }
                else inQuotes = false;
            } else cell += char;
        } else {
            if (char === '"') inQuotes = true;
            else if (char === separator) { row.push(cell.trim()); cell = ''; }
            else if (char === '\n' || (char === '\r' && next === '\n')) {
                row.push(cell.trim());
                if (row.some(c => c !== '')) result.push(row);
                row = []; cell = '';
                if (char === '\r') i++;
            } else cell += char;
        }
    }
    if (cell || row.length > 0) {
        row.push(cell.trim());
        if (row.some(c => c !== '')) result.push(row);
    }
    return result;
}

async function parseXlsx(url) {
    try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // Convert to array of arrays (rows)
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (e) {
        console.error("Error parsing XLSX:", e);
        return [];
    }
}

function resolveImagePath(code) {
    const photos = state.manifest.files.filter(f => f.dir === "photo");
    const match = photos.find(f => f.baseName.toLowerCase() === code.toLowerCase());
    return match ? match.path : "./root/placeholder.png";
}

function addBadge(container, text, className) {
    const span = document.createElement("span");
    span.className = `badge ${className}`;
    span.textContent = text;
    container.appendChild(span);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus(`📋 تم نسخ الكود: ${text}`);
    });
}

function saveCart() { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart)); }
function loadCart() { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"); }

function setLoading(active, pct = 0) {
    if (els.loadingBar) els.loadingBar.style.width = active ? `${pct}%` : "100%";
    if (!active) setTimeout(() => { if (els.loadingBar) els.loadingBar.style.width = "0%"; }, 500);
}

function updateStatus(text) { if (els.dataInfo) els.dataInfo.textContent = text; }

function showStatus(msg) {
    // Simple notification logic can go here
    console.log(msg);
}

function bindEvents() {
    if (els.searchInput) {
        els.searchInput.addEventListener("input", (e) => {
            state.searchTerm = e.target.value;
            renderCatalog();
        });
    }

    if (els.cartTrigger) {
        els.cartTrigger.onclick = () => {
            els.cartDrawer.classList.remove("hidden");
            els.overlay.style.display = "block";
        };
    }

    if (els.closeCart) {
        els.closeCart.onclick = els.overlay.onclick = () => {
            els.cartDrawer.classList.add("hidden");
            els.overlay.style.display = "none";
        };
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (state.cart.length === 0) return alert("السلة فارغة!");
            let msg = `*طلب جديد من متجر ${SITE_NAME}*\n\n`;
            state.cart.forEach(item => {
                const p = state.productsByCode.get(item.code);
                msg += `• ${p.name}\n  الكود: ${p.code} | الكمية: ${item.qty} | السعر: ${p.price * item.qty} $\n\n`;
            });
            const total = state.cart.reduce((s, i) => s + (state.productsByCode.get(i.code)?.price || 0) * i.qty, 0);
            msg += `*الإجمالي النهائي: ${total.toFixed(2)} $*`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        };
    }
}

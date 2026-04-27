/**
 * HJY STORE - Advanced Catalog Logic
 */

const SITE_NAME = "HJY.co Store";
const MANIFEST_CANDIDATES = ["./root/site-manifest.json", "./site-manifest.json"];
const CART_STORAGE_KEY = "hjy-store-cart-v2";

const state = {
    manifest: { generatedAt: null, files: [] },
    products: [],
    productsByCode: new Map(),
    categories: [],
    outOfStockCodes: new Set(),
    homeLists: {
        fav: [],
        more_fav: [],
        more_sell: []
    },
    searchTerm: "",
    selectedCategory: "all",
    currentView: "grid",
    cart: [],
    isLoading: false,
};

// --- Selectors ---
const els = {
    productsGrid: document.getElementById("productsGrid"),
    categoryPills: document.getElementById("categoryPills"),
    searchInput: document.getElementById("searchInput"),
    sortFilter: document.getElementById("sortFilter"),
    productCount: document.getElementById("productCount"),
    emptyState: document.getElementById("emptyState"),
    loadingBar: document.getElementById("loadingBar"),
    
    // Cart
    cartToggle: document.getElementById("cartToggle"),
    cartBadge: document.getElementById("cartBadge"),
    cartDrawer: document.getElementById("cartDrawer"),
    closeCart: document.getElementById("closeCart"),
    cartList: document.getElementById("cartList"),
    cartFinalTotal: document.getElementById("cartFinalTotal"),
    checkoutBtn: document.getElementById("checkoutBtn"),
    
    // Modals
    overlay: document.getElementById("overlay"),
    productModal: document.getElementById("productModal"),
    aboutModal: document.getElementById("aboutModal"),
    
    // Footer
    footerLinks: document.getElementById("footerLinks"),
    
    // View modes
    viewBtns: document.querySelectorAll(".view-btn")
};

// --- Initialization ---

document.addEventListener("DOMContentLoaded", async () => {
    state.cart = loadCart();
    updateCartUI();
    bindEvents();
    await init();
});

async function init() {
    setLoading(true, 30);
    try {
        state.manifest = await loadManifest();
        setLoading(true, 60);
        await processData();
        setLoading(true, 90);
        renderAll();
    } catch (error) {
        console.error("Initialization Error:", error);
    } finally {
        setLoading(false);
    }
}

async function loadManifest() {
    for (const path of MANIFEST_CANDIDATES) {
        try {
            const res = await fetch(`${path}?t=${Date.now()}`);
            if (res.ok) return await res.json();
        } catch (e) {}
    }
    throw new Error("Manifest not found");
}

// --- Data Processing ---

async function processData() {
    const dataFiles = state.manifest.files.filter(f => f.dir === "data" && (f.extension === ".csv" || f.extension === ".xlsx"));
    const rootFiles = state.manifest.files.filter(f => f.dir === "root");
    const homeFiles = state.manifest.files.filter(f => f.dir === "home");

    // 1. Load Out of Stock
    const outProFile = rootFiles.find(f => f.baseName === "out_pro");
    if (outProFile) {
        const rows = await parseFile(outProFile);
        state.outOfStockCodes = new Set(rows.map(r => String(r[0] || "").trim().toUpperCase()).filter(c => c && c !== "CODE"));
    }

    // 2. Load Categories
    const catFile = rootFiles.find(f => f.baseName === "categories");
    if (catFile) {
        const rows = await parseFile(catFile);
        // Expecting title, keyword
        state.categories = rows.slice(1).map(r => ({
            title: String(r[0] || "").trim(),
            keywords: String(r[1] || "").split(",").map(k => k.trim().toLowerCase()).filter(k => k)
        })).filter(c => c.title);
    }

    // 3. Load Special Lists (Home)
    for (const key of Object.keys(state.homeLists)) {
        const file = homeFiles.find(f => f.baseName === key);
        if (file) {
            const rows = await parseFile(file);
            state.homeLists[key] = rows.slice(0, 11).map(r => String(r[0] || "").trim().toUpperCase()).filter(c => c && c !== "CODE");
        }
    }

    // 4. Load Products
    const allProducts = [];
    for (const file of dataFiles) {
        const rows = await parseFile(file);
        if (rows.length < 2) continue;

        const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
        const idx = {
            code: headers.indexOf("code"),
            name: headers.indexOf("name"),
            price: headers.indexOf("price"),
            about1: headers.indexOf("about1"),
            about2: headers.indexOf("about2"),
            dis: headers.indexOf("dis"),
            photo: headers.indexOf("photo")
        };

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const code = String(row[idx.code] || "").trim().toUpperCase();
            if (!code || !row[idx.name]) continue;

            const price = parseFloat(row[idx.price]) || 0;
            const product = {
                code,
                name: String(row[idx.name]).trim(),
                price,
                fakePrice: price * 1.15, // 15% increase as requested
                about1: String(row[idx.about1] || "").trim(),
                about2: String(row[idx.about2] || "").trim(),
                discountRaw: String(row[idx.dis] || "").trim(),
                extraPhotos: String(row[idx.photo] || "").split(",").map(p => p.trim()).filter(p => p),
                isOut: state.outOfStockCodes.has(code)
            };
            
            // Resolve Images
            product.images = resolveProductImages(product.code, product.extraPhotos);
            product.mainImage = product.images[0] || "./root/placeholder.png";

            allProducts.push(product);
            state.productsByCode.set(code, product);
        }
    }
    state.products = allProducts;

    // 5. Load Footer Links (from about/*.txt)
    await loadFooterLinks();
}

async function loadFooterLinks() {
    const aboutFiles = state.manifest.files.filter(f => f.dir === "about" && f.extension === ".txt");
    els.footerLinks.innerHTML = "";
    for (const file of aboutFiles) {
        const btn = document.createElement("button");
        btn.className = "footer-btn";
        btn.textContent = file.baseName;
        btn.onclick = async () => {
            const res = await fetch(file.path);
            const text = await res.text();
            showAboutModal(file.baseName, text);
        };
        els.footerLinks.appendChild(btn);
    }
}

// --- UI Rendering ---

function renderAll() {
    renderCategories();
    renderHomeSections();
    renderCatalog();
}

function renderCategories() {
    els.categoryPills.innerHTML = "";
    
    // Add "Home" and "Special" categories first
    const specials = [
        { title: "الرئيسية", id: "all" },
        { title: "الأكثر مبيعاً", id: "more_sell" },
        { title: "المميز", id: "more_fav" }
    ];

    specials.forEach(s => {
        const btn = document.createElement("button");
        btn.className = `pill ${state.selectedCategory === s.id ? 'active' : ''}`;
        btn.textContent = s.title;
        btn.onclick = () => {
            state.selectedCategory = s.id;
            updateActivePill(btn);
            renderCatalog();
        };
        els.categoryPills.appendChild(btn);
    });

    // Add dynamic categories
    state.categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `pill ${state.selectedCategory === cat.title ? 'active' : ''}`;
        btn.textContent = cat.title;
        btn.onclick = () => {
            state.selectedCategory = cat.title;
            updateActivePill(btn);
            renderCatalog();
        };
        els.categoryPills.appendChild(btn);
    });
}

function updateActivePill(activeBtn) {
    els.categoryPills.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
}

function renderHomeSections() {
    const homeContainer = document.getElementById("homeSections");
    homeContainer.innerHTML = "";
    
    const sections = [
        { id: "fav", title: "المفضلات" },
        { id: "more_fav", title: "منتجات مميزة" },
        { id: "more_sell", title: "الأكثر مبيعاً" }
    ];

    sections.forEach(sec => {
        const codes = state.homeLists[sec.id];
        if (!codes || codes.length === 0) return;

        const products = codes.map(c => state.productsByCode.get(c)).filter(p => p);
        if (products.length === 0) return;

        const sectionEl = document.createElement("div");
        sectionEl.className = "home-section";
        sectionEl.innerHTML = `
            <div class="section-header">
                <h3>${sec.title}</h3>
                <div class="carousel-nav">
                    <button class="nav-btn prev">❯</button>
                    <button class="nav-btn next">❮</button>
                </div>
            </div>
            <div class="carousel-track-container">
                <div class="carousel-track"></div>
            </div>
        `;
        
        const track = sectionEl.querySelector(".carousel-track");
        products.forEach(p => {
            track.appendChild(createProductCard(p));
        });

        // Carousel logic
        const prev = sectionEl.querySelector(".prev");
        const next = sectionEl.querySelector(".next");
        prev.onclick = () => track.scrollBy({ left: 300, behavior: 'smooth' });
        next.onclick = () => track.scrollBy({ left: -300, behavior: 'smooth' });

        homeContainer.appendChild(sectionEl);
    });
}

function renderCatalog() {
    const grid = els.productsGrid;
    grid.innerHTML = "";
    grid.setAttribute("data-view", state.currentView);

    let filtered = [];
    
    if (state.selectedCategory === "all") {
        filtered = [...state.products];
    } else if (state.homeLists[state.selectedCategory]) {
        const codes = state.homeLists[state.selectedCategory];
        filtered = codes.map(c => state.productsByCode.get(c)).filter(p => p);
    } else {
        const cat = state.categories.find(c => c.title === state.selectedCategory);
        if (cat) {
            filtered = state.products.filter(p => {
                const text = (p.name + " " + p.about1).toLowerCase();
                return cat.keywords.some(k => text.includes(k));
            });
        }
    }

    // Apply Search
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.code.toLowerCase().includes(term) ||
            p.about1.toLowerCase().includes(term)
        );
    }

    // Apply Sort
    const sort = els.sortFilter.value;
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "low") filtered.sort((a, b) => a.price - b.price);

    els.productCount.textContent = `${filtered.length} منتج`;

    if (filtered.length === 0) {
        els.emptyState.classList.remove("hidden");
    } else {
        els.emptyState.classList.add("hidden");
        filtered.forEach(p => grid.appendChild(createProductCard(p)));
    }
}

function createProductCard(p) {
    const card = document.createElement("div");
    card.className = "product-card";
    if (p.isOut) card.classList.add("out-of-stock");

    // Discount badge
    let discountBadge = "";
    if (p.discountRaw) {
        discountBadge = `<div class="badge-dis">خصومات كمية</div>`;
    }

    card.innerHTML = `
        <div class="card-img">
            <img src="${p.mainImage}" alt="${p.name}" loading="lazy">
            ${discountBadge}
            <div class="card-badges">
                ${state.homeLists.fav.includes(p.code) ? '<span class="badge badge-fav">مفضل</span>' : ''}
                ${state.homeLists.more_sell.includes(p.code) ? '<span class="badge badge-hot">الأكثر مبيعاً</span>' : ''}
            </div>
        </div>
        <div class="card-body">
            <div class="card-meta">
                <span class="card-code">${p.code}</span>
            </div>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-desc">${p.about1}</p>
            <div class="card-price-row">
                <span class="price-fake">${p.fakePrice.toFixed(2)} $</span>
                <span class="price-main">${p.price.toFixed(2)} $</span>
            </div>
            <div class="card-actions">
                <button class="btn-primary add-to-cart" ${p.isOut ? 'disabled' : ''}>
                    ${p.isOut ? 'نفذت الكمية' : 'إضافة للسلة'}
                </button>
            </div>
        </div>
    `;

    card.querySelector(".card-img").onclick = () => showProductDetails(p);
    card.querySelector(".card-title").onclick = () => showProductDetails(p);
    card.querySelector(".add-to-cart").onclick = (e) => {
        e.stopPropagation();
        addToCart(p.code);
    };

    return card;
}

// --- Cart Logic ---

function addToCart(code) {
    const product = state.productsByCode.get(code);
    if (!product || product.isOut) return;

    const existing = state.cart.find(i => i.code === code);
    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ code, qty: 1 });
    }
    
    saveCart();
    updateCartUI();
    showToast("تمت الإضافة إلى السلة");
    shakeCart();
}

function updateCartUI() {
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    els.cartBadge.textContent = count;
    
    if (!els.cartList) return;
    els.cartList.innerHTML = "";
    
    let total = 0;
    state.cart.forEach(item => {
        const p = state.productsByCode.get(item.code);
        if (!p) return;
        
        // Calculate price with potential discount
        const price = calculatePrice(p, item.qty);
        total += price * item.qty;

        const div = document.createElement("div");
        div.className = "cart-item-row";
        div.innerHTML = `
            <div class="cart-item-info">
                <img src="${p.mainImage}" alt="${p.name}">
                <div class="cart-item-details">
                    <h4>${p.name}</h4>
                    <div class="cart-item-price">${price.toFixed(2)} $ x ${item.qty}</div>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="changeQty('${item.code}', -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="changeQty('${item.code}', 1)">+</button>
                <button class="remove-item" onclick="removeFromCart('${item.code}')">🗑️</button>
            </div>
        `;
        els.cartList.appendChild(div);
    });

    els.cartFinalTotal.textContent = `${total.toFixed(2)} $`;
}

window.changeQty = (code, delta) => {
    const item = state.cart.find(i => i.code === code);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            state.cart = state.cart.filter(i => i.code !== code);
        }
        saveCart();
        updateCartUI();
    }
};

window.removeFromCart = (code) => {
    state.cart = state.cart.filter(i => i.code !== code);
    saveCart();
    updateCartUI();
};

function calculatePrice(product, qty) {
    if (!product.discountRaw) return product.price;
    
    // Split by newline to handle multiple discount rules
    const lines = product.discountRaw.split("\n").map(l => l.trim().toLowerCase()).filter(l => l);
    let bestPrice = product.price;

    for (const line of lines) {
        // Format 1: 10p=5% (xp=y%)
        const matchPct = line.match(/^(\d+)p=(\d+)%$/);
        if (matchPct) {
            const reqQty = parseInt(matchPct[1]);
            const pct = parseInt(matchPct[2]);
            if (qty >= reqQty) {
                const discounted = product.price * (1 - pct / 100);
                if (discounted < bestPrice) bestPrice = discounted;
            }
            continue;
        }

        // Format 2: 10+p=190 (x+p=y)
        const matchVal = line.match(/^(\d+)\+p=([\d.]+)$/);
        if (matchVal) {
            const reqQty = parseInt(matchVal[1]);
            const val = parseFloat(matchVal[2]);
            if (qty >= reqQty) {
                if (val < bestPrice) bestPrice = val;
            }
        }
    }
    return bestPrice;
}

// --- Modals & Details ---

function showProductDetails(p) {
    const modal = els.productModal;
    document.getElementById("modalMainImg").src = p.mainImage;
    document.getElementById("modalCode").textContent = p.code;
    document.getElementById("modalName").textContent = p.name;
    document.getElementById("modalPriceOld").textContent = `${p.fakePrice.toFixed(2)} $`;
    document.getElementById("modalPriceNew").textContent = `${p.price.toFixed(2)} $`;
    document.getElementById("modalAbout1").textContent = p.about1;
    document.getElementById("modalAbout2").textContent = p.about2;
    
    // Gallery
    const thumbs = document.getElementById("modalThumbnails");
    thumbs.innerHTML = "";
    p.images.forEach((img, idx) => {
        const div = document.createElement("div");
        div.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
        div.innerHTML = `<img src="${img}" alt="">`;
        div.onclick = () => {
            document.getElementById("modalMainImg").src = img;
            thumbs.querySelectorAll(".thumb-item").forEach(t => t.classList.remove("active"));
            div.classList.add("active");
        };
        thumbs.appendChild(div);
    });

    // Gallery Nav
    let currentImgIdx = 0;
    modal.querySelector(".prev").onclick = () => {
        currentImgIdx = (currentImgIdx - 1 + p.images.length) % p.images.length;
        document.getElementById("modalMainImg").src = p.images[currentImgIdx];
        updateThumbActive(thumbs, currentImgIdx);
    };
    modal.querySelector(".next").onclick = () => {
        currentImgIdx = (currentImgIdx + 1) % p.images.length;
        document.getElementById("modalMainImg").src = p.images[currentImgIdx];
        updateThumbActive(thumbs, currentImgIdx);
    };

    // Discounts
    const disArea = document.getElementById("modalDiscounts");
    disArea.innerHTML = "";
    if (p.discountRaw) {
        const lines = p.discountRaw.split("\n").map(l => l.trim()).filter(l => l);
        lines.forEach(line => {
            const item = document.createElement("div");
            item.className = "discount-item";
            
            // Format 1: 10p=5%
            const matchPct = line.match(/^(\d+)p=(\d+)%$/i);
            if (matchPct) {
                const qty = matchPct[1];
                const pct = matchPct[2];
                const price = p.price * (1 - pct / 100);
                item.textContent = `• اشتري ${qty} قطع لتحصل على خصم ${pct}% وبسعر ${price.toFixed(2)} بدل ${p.price.toFixed(2)} للقطعة الواحدة`;
            }
            // Format 2: 10+p=190
            const matchVal = line.match(/^(\d+)\+p=([\d.]+)$/i);
            if (matchVal) {
                const qty = matchVal[1];
                const val = matchVal[2];
                item.textContent = `• اشتري ${qty} قطع على الأقل ليصبح سعر الواحدة ${val} بدل ${p.price.toFixed(2)}`;
            }
            if (item.textContent) disArea.appendChild(item);
        });
    }

    // Actions
    const addBtn = document.getElementById("modalAddToCart");
    addBtn.disabled = p.isOut;
    addBtn.textContent = p.isOut ? "نفذت الكمية" : "إضافة للسلة";
    addBtn.onclick = () => addToCart(p.code);

    document.getElementById("modalShare").onclick = () => {
        const shareText = `*${p.name}*\n${p.about1}\nالسعر: ${p.price} $\nالخصم: ${p.discountRaw || 'لا يوجد'}\nرابط المنتج: ${window.location.origin}${window.location.pathname}?p=${p.code}`;
        
        // As requested: name, about1, price, dis, and link
        const fullShareInfo = `اسم المنتج: ${p.name}\nالتفاصيل: ${p.about1}\nالسعر الأصلي: ${p.price} $\nالخصومات: ${p.discountRaw || 'لا يوجد'}\nرابط المادة: ${window.location.origin}${window.location.pathname}?p=${p.code}`;
        
        navigator.clipboard.writeText(fullShareInfo).then(() => {
            showToast("تم نسخ بيانات المنتج للمشاركة 🔗");
        });
    };

    openModal(modal);
}

function updateThumbActive(container, idx) {
    container.querySelectorAll(".thumb-item").forEach((t, i) => {
        if (i === idx) t.classList.add("active");
        else t.classList.remove("active");
    });
}

function showAboutModal(title, content) {
    const modal = els.aboutModal;
    document.getElementById("aboutTitle").textContent = title;
    document.getElementById("aboutBody").textContent = content;
    openModal(modal);
}

// --- Helpers ---

async function parseFile(file) {
    if (file.extension === ".xlsx") {
        const res = await fetch(file.path);
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(sheet, { header: 1 });
    } else {
        const res = await fetch(file.path);
        const text = await res.text();
        return parseCsv(text);
    }
}

function parseCsv(text) {
    const result = [];
    let row = [], cell = '', inQuotes = false;
    // Auto detect separator: ; or ,
    const firstLine = text.split('\n')[0];
    const separator = firstLine.includes(';') ? ';' : ',';

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

function resolveProductImages(code, extraPhotos) {
    const photos = state.manifest.files.filter(f => f.dir === "photo");
    const result = [];
    
    // 1. Primary image (by code)
    const primary = photos.find(f => f.baseName.toLowerCase() === code.toLowerCase());
    if (primary) result.push(primary.path);
    
    // 2. Extra photos
    extraPhotos.forEach(pName => {
        const match = photos.find(f => f.baseName.toLowerCase() === pName.toLowerCase() || f.name.toLowerCase() === pName.toLowerCase());
        if (match && !result.includes(match.path)) result.push(match.path);
    });
    
    // 3. If still empty, search for code match anywhere in photos
    if (result.length === 0) {
        const fuzzyMatch = photos.find(f => f.name.toLowerCase().includes(code.toLowerCase()));
        if (fuzzyMatch) result.push(fuzzyMatch.path);
    }
    
    return result;
}

function openModal(modal) {
    modal.classList.add("active");
    els.overlay.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
    els.overlay.style.display = "none";
    document.body.style.overflow = "auto";
}

function showToast(msg) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function shakeCart() {
    els.cartToggle.classList.add("shake");
    setTimeout(() => els.cartToggle.classList.remove("shake"), 500);
}

function saveCart() { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart)); }
function loadCart() { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"); }

function setLoading(active, pct = 0) {
    if (els.loadingBar) {
        els.loadingBar.style.width = active ? `${pct}%` : "100%";
        if (!active) setTimeout(() => { els.loadingBar.style.width = "0%"; }, 500);
    }
}

// --- Events ---

function bindEvents() {
    els.searchInput.addEventListener("input", (e) => {
        state.searchTerm = e.target.value;
        renderCatalog();
    });

    els.sortFilter.addEventListener("change", () => renderCatalog());

    els.viewBtns.forEach(btn => {
        btn.onclick = () => {
            state.currentView = btn.getAttribute("data-view");
            els.viewBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderCatalog();
        };
    });

    els.cartToggle.onclick = () => {
        els.cartDrawer.classList.add("active");
        els.overlay.style.display = "block";
    };

    els.closeCart.onclick = els.overlay.onclick = () => {
        els.cartDrawer.classList.remove("active");
        closeModal();
    };

    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.onclick = closeModal;
    });

    els.checkoutBtn.onclick = () => {
        if (state.cart.length === 0) return showToast("السلة فارغة!");
        let msg = `*طلب جديد من متجر ${SITE_NAME}*\n\n`;
        let total = 0;
        state.cart.forEach(item => {
            const p = state.productsByCode.get(item.code);
            const price = calculatePrice(p, item.qty);
            msg += `• ${p.name}\n  الكود: ${p.code} | الكمية: ${item.qty} | السعر: ${price * item.qty} $\n\n`;
            total += price * item.qty;
        });
        msg += `*الإجمالي النهائي: ${total.toFixed(2)} $*`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };
}

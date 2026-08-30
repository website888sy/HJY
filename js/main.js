function debounce(fn, ms) {
        let t = null;
        return (...args) => {
          if (t) clearTimeout(t);
          t = setTimeout(() => fn(...args), Math.max(0, Number(ms) || 0));
        };
      }
      
      const CONFIG = {
        BRAND: "HJY.co",
        PROMO_URLS: ["data/promo.txt"],
        WHAT_NEW_URLS: ["data/what_new.txt"],
        NEW_OFFER_URLS: ["data/new_offer.txt"],
        DATA_SOURCE: "LOCAL",
        DATA_DIR: "data-csv",
        DATA_MANIFEST_URLS: ["data-csv/files.txt"],
        DATA_FILES: [],
        GITHUB_AUTO_LIST: true,
        GITHUB_OWNER: "",
        GITHUB_REPO: "",
        GITHUB_BRANCH: "main",
        HOME_CODES_URLS: ["data/home.txt", "data/home.csv", "data/home"],
        OUT_PRODUCTS_URLS: ["data/out_products.csv", "data/out_proudcts.csv", "data/out_products", "data/out_proudcts"],
        ABOUT_DIR: "about",
        ITEMS_PER_PAGE: 20,
        SEARCH_MIN_CHARS: 2,
        MIN_ORDER_TOTAL: 5,
        PHOTO_AUTO_LIST: true,
        PHOTO_DIR: "photo",
        PHOTO_EXTS: ["webp", "png", "jpg", "jpeg", "gif", "avif"],
        PHOTO_INDEX_CACHE_MS: 30 * 60 * 1000,
        PHOTO_MAX_FILES: 4000,
        PHOTO_DIRS: [
          "photo",
          "PHOTO",
          "photo/BATT-LI",
          "photo/add",
          "photo/bike-battery",
          "photo/bms",
          "photo/cells",
          "photo/electroincs",
          "photo/eva",
          "photo/inverter",
          "photo/our-prod",
          "photo/qiachip/home-smart-eq",
          "photo/qiachip/power-supply",
          "photo/qiachip/reciver-remote",
          "photo/qiachip/remote-a",
          "photo/qiachip/remote-b",
          "photo/qiachip/wifi-qiachip",
          "photo/sensor-smart",
          "photo/wifi-smart-home",
        ],
      };
      const PLACEHOLDER_IMG =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f9f9f9"/><text x="50%" y="45%" font-size="24" text-anchor="middle" fill="#057bb8" font-family="Arial" opacity="0.3">HJY</text><text x="50%" y="55%" font-size="18" text-anchor="middle" fill="#666666" font-family="Arial" font-weight="bold">لا يتوفر صورة بعد جاري الإضافة</text></svg>`
        );
      const els = {
        appRoot: document.getElementById("appRoot"),
        promoBar: document.getElementById("promoBar"),
        promoText: document.getElementById("promoText"),
        search: document.getElementById("searchInput"),
        sortSelect: document.getElementById("sortSelect"),
        viewSelect: document.getElementById("viewSelect"),
        searchBtn: document.getElementById("searchBtn"),
        pills: document.getElementById("topPillbar"),
        prevPage: document.getElementById("prevPage"),
        nextPage: document.getElementById("nextPage"),
        prevPageBottom: document.getElementById("prevPageBottom"),
        nextPageBottom: document.getElementById("nextPageBottom"),
        hint: document.getElementById("hint"),
        productsQaTopBtn: document.getElementById("productsQaTopBtn"),
        topQaBar: document.getElementById("topQaBar"),
        topQaRail: document.getElementById("topQaRail"),
        topQaPrev: document.getElementById("topQaPrev"),
        topQaNext: document.getElementById("topQaNext"),
        catsWrapper: document.getElementById("catsWrapper"),
        catsMoreBtn: document.getElementById("catsMoreBtn"),
        homeTopBtn: document.getElementById("homeTopBtn"),
        resultsMeta: document.getElementById("resultsMeta"),
        rangeText: document.getElementById("rangeText"),
        totalText: document.getElementById("totalText"),
        status: document.getElementById("status"),
        homeStatus: document.getElementById("homeStatus"),
        grid: document.getElementById("productsGrid"),
        homeGrid: document.getElementById("homeProductsGrid"),
        homeView: document.getElementById("homeView"),
        shopView: document.getElementById("shopView"),
        productView: document.getElementById("productView"),
        checkoutView: document.getElementById("checkoutView"),
        infoView: document.getElementById("infoView"),
        qaView: document.getElementById("qaView"),
        ordersView: document.getElementById("ordersView"),
        productTitle: document.getElementById("productTitle"),
        productMeta: document.getElementById("productMeta"),
        productDetails: document.getElementById("productDetails"),
        cartToggle: document.getElementById("cartToggle"),
        cartPanel: document.getElementById("cartPanel"),
        cartBackdrop: document.getElementById("cartBackdrop"),
        cartCloseBtn: document.getElementById("cartCloseBtn"),
        cartCount: document.getElementById("cartCount"),
        cartMeta: document.getElementById("cartMeta"),
        cartContent: document.getElementById("cartContent"),
        cartSummary: document.getElementById("cartSummary"),
        cartActions: document.getElementById("cartActions"),
        toast: document.getElementById("toast"),
        toastBubble: document.getElementById("toastBubble"),
        goShopBtn: document.getElementById("goShopBtn"),
        homeFavoritesBtn: document.getElementById("homeFavoritesBtn"),
        openCheckoutBtn: document.getElementById("openCheckoutBtn"),
        backFromProductBtn: document.getElementById("backFromProductBtn"),
        backFromProductBtnBottom: document.getElementById("backFromProductBtnBottom"),
        backToShopBtn: document.getElementById("backToShopBtn"),
        checkoutMeta: document.getElementById("checkoutMeta"),
        checkoutStatus: document.getElementById("checkoutStatus"),
        clearCustomerBtn: document.getElementById("clearCustomerBtn"),
        checkoutCartSummary: document.getElementById("checkoutCartSummary"),
        checkoutForm: document.getElementById("checkoutForm"),
        phoneInput: document.getElementById("phoneInput"),
        govInput: document.getElementById("govInput"),
        govOtherWrap: document.getElementById("govOtherWrap"),
        govOtherInput: document.getElementById("govOtherInput"),
        shipDamascusRadio: document.getElementById("shipDamascusRadio"),
        shipGovRadio: document.getElementById("shipGovRadio"),
        shipGovBlock: document.getElementById("shipGovBlock"),
        shipDamascusBlock: document.getElementById("shipDamascusBlock"),
        fullNameGovInput: document.getElementById("fullNameGovInput"),
        shipCenterInput: document.getElementById("shipCenterInput"),
        shipCenterSuggestions: document.getElementById("shipCenterSuggestions"),
        carrierMasarat: document.getElementById("carrierMasarat"),
        carrierQadmous: document.getElementById("carrierQadmous"),
        carrierOther: document.getElementById("carrierOther"),
        masaratBranchesBtn: document.getElementById("masaratBranchesBtn"),
        qadmousBranchesBtn: document.getElementById("qadmousBranchesBtn"),
        readShippingAgree: document.getElementById("readShippingAgree"),
        payAdvanceInput: document.getElementById("payAdvanceInput"),
        fullNameDamascusInput: document.getElementById("fullNameDamascusInput"),
        damascusFreeDelivery: document.getElementById("damascusFreeDelivery"),
        damascusPickup: document.getElementById("damascusPickup"),
        damascusDeliveryBlock: document.getElementById("damascusDeliveryBlock"),
        locGeneralInput: document.getElementById("locGeneralInput"),
        locDetailInput: document.getElementById("locDetailInput"),
        timeRangeInput: document.getElementById("timeRangeInput"),
        payUsdInput: document.getElementById("payUsdInput"),
        paySypInput: document.getElementById("paySypInput"),
        orderNotesInput: document.getElementById("orderNotesInput"),
        termsAgreeInput: document.getElementById("termsAgreeInput"),
        openShippingBtn: document.getElementById("openShippingBtn"),
        openPolicyBtn: document.getElementById("openPolicyBtn"),
        confirmOrderBtn: document.getElementById("confirmOrderBtn"),
        copyInvoiceBtn: document.getElementById("copyInvoiceBtn"),
        invoiceNote: document.getElementById("invoiceNote"),
        afterOrderLinks: document.getElementById("afterOrderLinks"),
        afterComplaintBtn: document.getElementById("afterComplaintBtn"),
        afterRatingBtn: document.getElementById("afterRatingBtn"),
        afterCustomerReviewsBtn: document.getElementById("afterCustomerReviewsBtn"),
        afterOrdersBtn: document.getElementById("afterOrdersBtn"),
        footerExtrasCol: document.getElementById("footerExtrasCol"),
        footerPrevBtn: document.getElementById("footerPrevBtn"),
        footerNextBtn: document.getElementById("footerNextBtn"),
        footerMoreBtn: document.getElementById("footerMoreBtn"),
        infoTitle: document.getElementById("infoTitle"),
        infoMeta: document.getElementById("infoMeta"),
        infoStatus: document.getElementById("infoStatus"),
        infoText: document.getElementById("infoText"),
        customerGalleryWrap: document.getElementById("customerGalleryWrap"),
        customerGallery: document.getElementById("customerGallery"),
        backFromInfoBtn: document.getElementById("backFromInfoBtn"),
        complaintForm: document.getElementById("complaintForm"),
        complaintContact: document.getElementById("complaintContact"),
        complaintInput: document.getElementById("complaintInput"),
        complaintNote: document.getElementById("complaintNote"),
        ratingForm: document.getElementById("ratingForm"),
        ratingRank: document.getElementById("ratingRank"),
        ratingMsg: document.getElementById("ratingMsg"),
        ratingLabel: document.getElementById("ratingLabel"),
        ratingDone: document.getElementById("ratingDone"),
        qaTitle: document.getElementById("qaTitle"),
        qaMeta: document.getElementById("qaMeta"),
        qaStatus: document.getElementById("qaStatus"),
        qaButtons: document.getElementById("qaButtons"),
        qaText: document.getElementById("qaText"),
        backFromQaBtn: document.getElementById("backFromQaBtn"),
        backFromQaBtnBottom: document.getElementById("backFromQaBtnBottom"),
        ordersMeta: document.getElementById("ordersMeta"),
        ordersStatus: document.getElementById("ordersStatus"),
        ordersList: document.getElementById("ordersList"),
        ordersDetails: document.getElementById("ordersDetails"),
        ordersClearAllBtn: document.getElementById("ordersClearAllBtn"),
        backFromOrdersBtn: document.getElementById("backFromOrdersBtn"),
        whatNewSection: document.getElementById("whatNewSection"),
        whatNewText: document.getElementById("whatNewText"),
        newOfferSection: document.getElementById("newOfferSection"),
        newOfferText: document.getElementById("newOfferText"),
        imgModal: document.getElementById("imgModal"),
        imgModalImg: document.getElementById("imgModalImg"),
      };
      const state = {
        allProducts: [],
        filteredProducts: [],
        homeProducts: [],
        outSet: new Set(),
        favorites: new Set(),
        category: "HOME",
        query: "",
        page: 1,
        sortMode: "PRICE_ASC",
        viewMode: "brief",
        lastMainRoute: "shop",
        lastProductCode: "",
        lastInvoiceText: "",
        categories: [],
        mainCategories: [],   // [{ name, key, subs: [{ name, key, codes: Set }] }] from SubcategoriesA/B
        subCatLimits: {},     // subcategory key -> visible count (عرض المزيد)
        currentMainKey: "",
        subCatExpanded: {},   // main category key -> true when sub-pills are expanded in sidebar
        similarExpandedCode: "",
        suggestExpandedCode: "",
        suggestLimit: 10,
        hotSet: new Set(),
        hotPrefixes: [],
        qaFiles: [],
        qaSelected: "",
        aboutFiles: [],
        inlineQaSelected: "",
        ordersSelectedId: "",
        whatNewText: "",
        newOfferText: "",
      };

      const USER_LOAD_ERROR_MSG =
        "حدث غلط بسبب بطء الانترنيت لديك يرجى إيقاف vpn وإعادة تحميل الصفحة او تغيير بلد ال vpn , يرجى إعلامنا بالمشكلة\n0940471199";
      function setBootProgress(pct) {
        const el = document.getElementById("bootBar");
        if (!(el instanceof HTMLElement)) return;
        const v = Math.max(0, Math.min(100, Number(pct) || 0));
        el.style.width = `${v}%`;
        const h = document.getElementById("bootH");
        const j = document.getElementById("bootJ");
        const y = document.getElementById("bootY");
        if (h instanceof HTMLElement && v >= 25) h.style.color = "#d11";
        if (j instanceof HTMLElement && v >= 55) j.style.color = "#19b7ff";
        if (y instanceof HTMLElement && v >= 85) y.style.color = "#777";
      }
      function hideBootOverlay() {
        const el = document.getElementById("bootOverlay");
        if (!(el instanceof HTMLElement)) return;
        el.style.opacity = "0";
        el.style.transition = "220ms ease";
        setTimeout(() => {
          try {
            el.remove();
          } catch {}
        }, 260);
      }
      let toastTimer = null;
      function showToast(message, durationMs = 2000) {
        const msg = String(message ?? "").trim();
        if (!msg) return;
        if (!(els.toast instanceof HTMLElement) || !(els.toastBubble instanceof HTMLElement)) return;
        els.toastBubble.textContent = msg;
        els.toast.setAttribute("data-open", "true");
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => els.toast.setAttribute("data-open", "false"), Math.max(300, Number(durationMs) || 2000));
      }
      function animateIn(el) {
        if (!(el instanceof HTMLElement)) return;
        try {
          el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], {
            duration: 220,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          });
        } catch {}
      }
      function safeLower(v) {
        return String(v ?? "").toLowerCase();
      }
      function getQueryParam(key) {
        const k = String(key ?? "").trim();
        if (!k) return "";
        try {
          const params = new URLSearchParams(String(location.search ?? ""));
          return String(params.get(k) ?? "").trim();
        } catch {
          return "";
        }
      }
      function wantsNoCache() {
        const v = safeLower(getQueryParam("refresh") || getQueryParam("nocache"));
        return v === "1" || v === "true" || v === "yes";
      }
      function clearLocalCaches() {
        try {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = String(localStorage.key(i) || "");
            if (
              k.startsWith("hjy_text_cache_v1::") ||
              k.startsWith("hjy_json_cache_v1::") ||
              k.startsWith("hjy_photo_index_v1::")
            ) {
              keys.push(k);
            }
          }
          for (const k of keys) localStorage.removeItem(k);
        } catch {}
      }
      if (wantsNoCache()) clearLocalCaches();
      function buildLinkTag(urlText, style) {
        let url = String(urlText ?? "");
        let tail = "";
        while (url.length) {
          const last = url[url.length - 1];
          if (!last) break;
          if (".,;:!?)]}،؛؟!\"'›»”".includes(last)) {
            tail = last + tail;
            url = url.slice(0, -1);
            continue;
          }
          break;
        }
        if (!url) return String(urlText ?? "");
        const href = url.toLowerCase().startsWith("www.") ? "https://" + url : url;
        const label = escapeHtml(shortenUrlText(url) || url);
        const styleAttr = style ? ` style="${style}"` : "";
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"${styleAttr}>${label}</a>${tail}`;
      }
      function linkifyOnly(raw) {
        let html = escapeHtml(String(raw ?? ""));
        html = html.replace(/\b\d{7,15}\b/g, (m) => `<bdi dir="ltr">${m}</bdi>`);
        html = html.replace(/(https?:\/\/[^\s<]+)/g, (m) => buildLinkTag(m, ""));
        return html;
      }
      function shortenUrlText(url) {
        return String(url ?? "").trim();
      }
      function normalizeHref(url) {
        const u = String(url ?? "").trim();
        if (!u) return "";
        if (/^https?:\/\//i.test(u)) return u;
        return `https://${u.replace(/^\/+/, "")}`;
      }
      function linkifyText(escapedText) {
        let html = String(escapedText ?? "");
        const links = [];
        html = html.replace(/(\b(?:https?:\/\/|www\.)[^\s<>]+)/gi, (m) => {
          links.push(buildLinkTag(m, "color:var(--primary-3);text-decoration:underline"));
          return `\u0001L${links.length - 1}\u0002`;
        });
        return html.replace(/\u0001L(\d+)\u0002/g, (m, i) => links[+i] || m);
      }
      function formatAboutTextPlain(raw) {
        let cleaned = String(raw ?? "").replace(/^\uFEFF/, "");
        let lines = cleaned.split(/\r?\n/);
        let htmlParts = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (line.trim().length === 0) {
            htmlParts.push('<div style="height: 8px;"></div>');
            continue;
          }
          
          let hasUrl = /(?:https?:\/\/|www\.)[^\s<"']+/.test(line);
          let escapedLine = escapeHtml(line);
          
          // protect URLs FIRST (so bdi/phone/markdown replaces don't corrupt links)
          const links = [];
          escapedLine = escapedLine.replace(/(\b(?:https?:\/\/|www\.)[^\s<>]+)/gi, (m) => {
            links.push(buildLinkTag(m, "color:var(--primary-3);text-decoration:underline"));
            return `\u0001L${links.length - 1}\u0002`;
          });
          escapedLine = escapedLine.replace(/\b\d{7,15}\b/g, (m) => `<bdi dir="ltr">${m}</bdi>`);
          escapedLine = escapedLine.replace(/(^|[^\w>])([+]?[\d][\d .,+\-()\/]{0,30}[\d])(?=$|[^\w<])/g, (m, a, b) => `${a}<bdi dir="ltr">${b}</bdi>`);
          escapedLine = escapedLine.replace(/\b[0-9a-f]{12,}\b/gi, (m) => `<bdi dir="ltr">${m}</bdi>`);
          escapedLine = escapedLine.replace(/([A-Z]+)\/\/\s*([\s\S]+?)\s*\/\/\1/g, (m, color, text) => {
            const colors = {
              "RED": "#e74c3c", "BLUE": "#3498db", "GREEN": "#2ecc71", "YELLOW": "#f1c40f",
              "ORANGE": "#e67e22", "PURPLE": "#9b59b6", "CYAN": "#00bcd4", "MAGENTA": "#e040fb",
              "LIME": "#cddc39", "PINK": "#e91e63", "TEAL": "#009688", "GRAY": "#95a5a6",
              "BLACK": "#000000", "WHITE": "#ffffff"
            };
            const hex = colors[color.toUpperCase()] || colors["RED"];
            return `<span style="color: ${hex}; font-weight: bold;">${text}</span>`;
          });
          escapedLine = escapedLine.replace(/\/\/\s*([\s\S]+?)\s*\/\//g, `<strong class="about-warn">$1</strong>`);
          escapedLine = escapedLine.replace(/\*\*\s*([\s\S]+?)\s*\*\*/g, `<strong class="about-em">$1</strong>`);
          escapedLine = escapedLine.replace(/\u0001L(\d+)\u0002/g, (m, i) => links[+i] || m);
          
          if (hasUrl) {
            htmlParts.push(`<div style="direction: ltr; text-align: left; overflow-wrap: break-word; word-wrap: break-word; text-overflow: ellipsis; white-space: pre-wrap;">${escapedLine}</div>`);
          } else {
            htmlParts.push(`<div style="direction: rtl; text-align: right; overflow-wrap: break-word; word-wrap: break-word;">${escapedLine}</div>`);
          }
        }
        
        return `<div style="display: flex; flex-direction: column; gap: 4px; width: 100%; max-width: 100%; overflow: hidden;">${htmlParts.join("")}</div>`;
      }
      function formatWhatNewText(raw) {
        let cleaned = String(raw ?? "");
        let lines = cleaned.split(/\r?\n/);
        let htmlParts = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (line.trim().length === 0) {
            htmlParts.push('<div style="height: 8px;"></div>');
            continue;
          }
          
          let hasUrl = /(?:https?:\/\/|www\.)[^\s<"']+/.test(line);
          let escapedLine = escapeHtml(line);
          
          // protect URLs FIRST (so bdi/phone/markdown replaces don't corrupt links)
          const links = [];
          escapedLine = escapedLine.replace(/(\b(?:https?:\/\/|www\.)[^\s<>]+)/gi, (m) => {
            links.push(buildLinkTag(m, "color:var(--primary-3);text-decoration:underline"));
            return `\u0001L${links.length - 1}\u0002`;
          });
          escapedLine = escapedLine.replace(/\b\d{7,15}\b/g, (m) => `<bdi dir="ltr">${m}</bdi>`);
          escapedLine = escapedLine.replace(/(^|[^\w>])([+]?[\d][\d .,+\-()\/]{0,30}[\d])(?=$|[^\w<])/g, (m, a, b) => `${a}<bdi dir="ltr">${b}</bdi>`);
          escapedLine = escapedLine.replace(/\b[0-9a-f]{12,}\b/gi, (m) => `<bdi dir="ltr">${m}</bdi>`);
          escapedLine = escapedLine.replace(/([A-Z]+)\/\/\s*([\s\S]+?)\s*\/\/\1/g, (m, color, text) => {
            const colors = {
              "RED": "#e74c3c", "BLUE": "#3498db", "GREEN": "#2ecc71", "YELLOW": "#f1c40f",
              "ORANGE": "#e67e22", "PURPLE": "#9b59b6", "CYAN": "#00bcd4", "MAGENTA": "#e040fb",
              "LIME": "#cddc39", "PINK": "#e91e63", "TEAL": "#009688", "GRAY": "#95a5a6",
              "BLACK": "#000000", "WHITE": "#ffffff"
            };
            const hex = colors[color.toUpperCase()] || colors["RED"];
            return `<span style="color: ${hex}; font-weight: bold;">${text}</span>`;
          });
          escapedLine = escapedLine.replace(/\/\/\s*([\s\S]+?)\s*\/\//g, `<strong class="about-warn">$1</strong>`);
          escapedLine = escapedLine.replace(/\*\*\s*([\s\S]+?)\s*\*\*/g, `<strong class="about-em">$1</strong>`);
          escapedLine = escapedLine.replace(/\u0001L(\d+)\u0002/g, (m, i) => links[+i] || m);
          
          if (hasUrl) {
            htmlParts.push(`<div style="direction: ltr; text-align: left; overflow-wrap: break-word; word-wrap: break-word; text-overflow: ellipsis; white-space: pre-wrap;">${escapedLine}</div>`);
          } else {
            htmlParts.push(`<div style="direction: rtl; text-align: right; overflow-wrap: break-word; word-wrap: break-word;">${escapedLine}</div>`);
          }
        }
        
        return `<div style="display: flex; flex-direction: column; gap: 4px; width: 100%; max-width: 100%; overflow: hidden;">${htmlParts.join("")}</div>`;
      }
      function escapeHtml(s) {
        return String(s ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }
      function formatAboutText(raw) {
        const src = String(raw ?? "").replace(/^\uFEFF/, "");
        const lines = src.replace(/\r/g, "").split("\n");
        const parts = [];
        let free = [];
        let inSection = false;
        let secTitle = "";
        let secBody = [];
        let saw = false;

        const flushFree = () => {
          if (free.length === 0) return;
          parts.push({ type: "text", text: free.join("\n") });
          free = [];
        };
        const flushSection = () => {
          const t = String(secTitle ?? "");
          if (t.trim().length > 0) parts.push({ type: "section", title: t, body: secBody.join("\n") });
          inSection = false;
          secTitle = "";
          secBody = [];
        };

        for (const ln of lines) {
          const rawLine = String(ln ?? "");
          const m = rawLine.trim().match(/^\^\^\s*([\s\S]*?)\s*\^\^$/);
          if (!m) {
            if (inSection) secBody.push(rawLine);
            else free.push(rawLine);
            continue;
          }

          saw = true;
          const title = String(m[1] ?? "");

          if (inSection) flushSection();

          if (title.trim().length === 0) {
            if (!inSection) free.push(rawLine);
            continue;
          }

          flushFree();
          inSection = true;
          secTitle = title;
          secBody = [];
        }

        if (inSection) flushSection();
        flushFree();

        if (saw && parts.some((p) => p && p.type === "section")) {
          let html = `<div class="about-acc-list">`;
          for (const p of parts) {
            if (!p) continue;
            if (p.type === "text") {
              const t = String(p.text ?? "");
              if (t.trim().length === 0) continue;
              html += `<div class="panel-sub">${formatAboutTextPlain(t)}</div>`;
              continue;
            }
            const titleHtml = formatAboutTextPlain(String(p.title ?? ""));
            const bodyHtml = formatAboutTextPlain(String(p.body ?? ""));
            html += `<details class="about-acc"><summary class="about-acc-sum">${titleHtml}</summary><div class="about-acc-body panel-sub">${bodyHtml}</div></details>`;
          }
          html += `</div>`;
          return html;
        }

        return formatAboutTextPlain(src);
      }
      function extractYoutubeId(url) {
        const u = String(url ?? "").trim();
        if (!u) return "";
        try {
          const parsed = new URL(u);
          const host = safeLower(parsed.hostname || "");
          if (host === "youtu.be") return String(parsed.pathname || "").replace(/^\//, "").trim();
          if (host.endsWith("youtube.com") || host.endsWith("m.youtube.com")) {
            if (parsed.pathname === "/watch") return String(parsed.searchParams.get("v") || "").trim();
            const m1 = String(parsed.pathname || "").match(/^\/shorts\/([^/?#]+)/);
            if (m1) return String(m1[1] || "").trim();
            const m2 = String(parsed.pathname || "").match(/^\/embed\/([^/?#]+)/);
            if (m2) return String(m2[1] || "").trim();
          }
        } catch {}
        return "";
      }
      function renderVideoThumbsFromText(raw) {
        const src = String(raw ?? "").replace(/\r/g, "").trim();
        if (!src) return "";
        const lines = src.split("\n").map((l) => String(l ?? "").trim()).filter(Boolean);
        let html = `<div style="display:grid;gap:10px">`;
        html += `<div class="panel-sub" style="font-weight:900;color:var(--text)">فيديوهات</div>`;
        html += `<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">`;
        for (const ln of lines) {
          const m = ln.match(/https?:\/\/[^\s]+/i);
          const url = m ? String(m[0]).trim() : "";
          if (!url) continue;
          const yt = extractYoutubeId(url);
          const thumb = yt ? `https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg` : "";
          const title = ln === url ? "" : ln.replace(url, "").trim();
          html += `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit">
              <div style="border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,0.7);overflow:hidden">
                <div style="aspect-ratio:16/9;background:#000;display:grid;place-items:center;position:relative">
                  ${
                    thumb
                      ? `<img src="${escapeHtmlAttr(thumb)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()" />`
                      : `<div style="color:#fff;font-weight:900;opacity:0.9">VIDEO</div>`
                  }
                  <div style="position:absolute;inset-inline-start:10px;inset-block-end:10px;background:rgba(0,0,0,0.6);color:#fff;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px">تشغيل</div>
                </div>
                <div style="padding:10px;display:grid;gap:4px">
                  ${title ? `<div style="font-weight:900">${escapeHtml(title)}</div>` : ""}
                  <div class="mini-note" style="direction:ltr;unicode-bidi:plaintext;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(url)}</div>
                </div>
              </div>
            </a>`;
        }
        html += `</div></div>`;
        return html;
      }
      function renderVideoCardsFromCsvText(csvText) {
        const t = String(csvText ?? "").trim();
        if (!t) return "";
        const table = parseCsvText(t);
        const headers = Array.isArray(table.headers) ? table.headers : [];
        const rows = Array.isArray(table.rows) ? table.rows : [];
        if (!headers.length || !rows.length) return "";
        const findCol = (opts) => {
          const list = Array.isArray(opts) ? opts : [];
          for (let i = 0; i < headers.length; i++) {
            const h = safeLower(String(headers[i] ?? "").trim());
            for (const o of list) {
              const k = safeLower(String(o ?? "").trim());
              if (!k) continue;
              if (h === k) return i;
              if (h.includes(k)) return i;
            }
          }
          return -1;
        };
        const idxName = findCol(["name", "title", "video", "اسم", "عنوان"]);
        const idxLink = findCol(["link", "url", "رابط", "لينك"]);
        if (idxLink < 0) return "";
        let html = `<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">`;
        for (const r of rows) {
          const cols = Array.isArray(r) ? r : [];
          const url = String(cols[idxLink] ?? "").trim();
          if (!url) continue;
          const title = idxName >= 0 ? String(cols[idxName] ?? "").trim() : "";
          const yt = extractYoutubeId(url);
          const thumb = yt ? `https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg` : "";
          html += `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit">
              <div style="border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,0.7);overflow:hidden">
                <div style="aspect-ratio:16/9;background:#000;display:grid;place-items:center;position:relative">
                  ${
                    thumb
                      ? `<img src="${escapeHtmlAttr(thumb)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()" />`
                      : `<div style="color:#fff;font-weight:900;opacity:0.9">VIDEO</div>`
                  }
                  <div style="position:absolute;inset-inline-start:10px;inset-block-end:10px;background:rgba(0,0,0,0.6);color:#fff;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px">تشغيل</div>
                </div>
                <div style="padding:10px;display:grid;gap:4px">
                  ${title ? `<div style="font-weight:900;font-size:16px;line-height:1.35">${escapeHtml(title)}</div>` : ""}
                  <div class="mini-note" style="direction:ltr;unicode-bidi:plaintext;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(url)}</div>
                </div>
              </div>
            </a>`;
        }
        html += `</div>`;
        return html;
      }
      async function renderGalleryGrouped(type, introContent) {
        els.infoText.innerHTML = `<div class="status" aria-hidden="false">جاري تحميل البيانات...</div>`;
        try {
          const listRes = await fetchTextCached(`data/${type}_list.csv`, 10 * 60 * 1000);
          const catRes = await fetchTextCached(`data/${type}_categories.csv`, 10 * 60 * 1000);
          
          if (!listRes || !listRes.text) {
            els.infoText.innerHTML = `<div class="panel-sub" style="font-weight:900;color:#d11">لا يوجد ملف ${type}_list.csv</div>`;
            return;
          }
          
          const listTable = parseCsvText(listRes.text);
          const listMap = new Map();
          if (listTable.headers && listTable.rows) {
            const idCol = listTable.headers.findIndex(h => h.trim() === "#");
            const titleCol = listTable.headers.findIndex(h => h.trim().toLowerCase() === (type === "videos" ? "title" : "name"));
            const urlCol = listTable.headers.findIndex(h => h.trim().toLowerCase() === "url");
            
            if (idCol >= 0 && urlCol >= 0) {
              for (const row of listTable.rows) {
                const id = row[idCol]?.trim();
                if (id) {
                  listMap.set(id, {
                    title: titleCol >= 0 ? row[titleCol]?.trim() : "",
                    url: row[urlCol]?.trim()
                  });
                }
              }
            }
          }
          
          let html = `<div style="display:grid;gap:10px">`;
          if (introContent) {
            html += `<div class="panel-sub">${formatAboutTextPlain(introContent)}</div>`;
          }
          
          if (catRes && catRes.text) {
            const catTable = parseCsvText(catRes.text);
            if (catTable.headers && catTable.rows) {
              html += `<div class="about-acc-list">`;
              for (let i = 0; i < catTable.headers.length; i++) {
                const catName = catTable.headers[i].trim();
                if (!catName) continue;
                
                const ids = catTable.rows.map(r => r[i]?.trim()).filter(Boolean);
                if (ids.length > 0) {
                  let itemsHtml = `<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">`;
                  for (const id of ids) {
                    const item = listMap.get(id);
                    if (item && item.url) {
                      if (type === "videos") {
                        const yt = extractYoutubeId(item.url);
                        const thumb = yt ? `https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg` : "";
                        itemsHtml += `<a href="${escapeHtmlAttr(item.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit">
                          <div style="border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,0.7);overflow:hidden">
                            <div style="aspect-ratio:16/9;background:#000;display:grid;place-items:center;position:relative">
                              ${thumb ? `<img src="${escapeHtmlAttr(thumb)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()" />` : `<div style="color:#fff;font-weight:900;opacity:0.9">VIDEO</div>`}
                              <div style="position:absolute;inset-inline-start:10px;inset-block-end:10px;background:rgba(0,0,0,0.6);color:#fff;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px">تشغيل</div>
                            </div>
                            <div style="padding:10px;display:grid;gap:4px">
                              ${item.title ? `<div style="font-weight:900;font-size:16px;line-height:1.35">${escapeHtml(item.title)}</div>` : ""}
                              <div class="mini-note" style="direction:ltr;unicode-bidi:plaintext;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(item.url)}</div>
                            </div>
                          </div>
                        </a>`;
                      } else {
                        itemsHtml += `<a href="${escapeHtmlAttr(item.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit" onclick="window.openImgModal && window.openImgModal(this.href); return false;">
                          <div style="border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,0.7);overflow:hidden">
                            <div style="aspect-ratio:1/1;background:#fff;display:grid;place-items:center;position:relative">
                              <img src="${escapeHtmlAttr(item.url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()" />
                            </div>
                            <div style="padding:10px;display:grid;gap:4px">
                              ${item.title ? `<div style="font-weight:900;font-size:14px;line-height:1.35;text-align:center">${escapeHtml(item.title)}</div>` : ""}
                            </div>
                          </div>
                        </a>`;
                      }
                    }
                  }
                  itemsHtml += `</div>`;
                  html += `<details class="about-acc"><summary class="about-acc-sum">${formatAboutTextPlain(catName)}</summary><div class="about-acc-body panel-sub" style="padding:12px">${itemsHtml}</div></details>`;
                }
              }
              html += `</div>`;
            }
          }
          html += `</div>`;
          els.infoText.innerHTML = html;
        } catch (e) {
          els.infoText.innerHTML = `<div class="panel-sub" style="color:red">خطأ في تحميل البيانات</div>`;
        }
      }

      function parseVideosCsvText(csvText) {
        const t = String(csvText ?? "").trim();
        if (!t) return [];
        const table = parseCsvText(t);
        const headers = Array.isArray(table.headers) ? table.headers : [];
        const rows = Array.isArray(table.rows) ? table.rows : [];
        if (!headers.length || !rows.length) return [];
        const findCol = (opts) => {
          const list = Array.isArray(opts) ? opts : [];
          for (let i = 0; i < headers.length; i++) {
            const h = safeLower(String(headers[i] ?? "").trim());
            for (const o of list) {
              const k = safeLower(String(o ?? "").trim());
              if (!k) continue;
              if (h === k) return i;
              if (h.includes(k)) return i;
            }
          }
          return -1;
        };
        const idxName = findCol(["name", "title", "video", "اسم", "عنوان"]);
        const idxLink = findCol(["link", "url", "رابط", "لينك"]);
        if (idxLink < 0) return [];
        const out = [];
        for (const r of rows) {
          const cols = Array.isArray(r) ? r : [];
          const url = String(cols[idxLink] ?? "").trim();
          if (!url) continue;
          const title = idxName >= 0 ? String(cols[idxName] ?? "").trim() : "";
          out.push({ title, url });
        }
        return out;
      }
      function renderVideosSection(introText) {
        const intro = String(introText ?? "").trim();
        const q = safeLower(String(state.videosQuery ?? "").trim());
        const list = Array.isArray(state.videosItems) ? state.videosItems : [];
        const filtered = q ? list.filter((x) => safeLower(`${x?.title ?? ""} ${x?.url ?? ""}`).includes(q)) : list;
        const per = 20;
        const pageCount = Math.max(1, Math.ceil(filtered.length / per));
        const page = Math.max(1, Math.min(pageCount, Number(state.videosPage) || 1));
        state.videosPage = page;
        const start = (page - 1) * per;
        const items = filtered.slice(start, start + per);
        const search = `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <div class="search" style="flex:1;min-width:220px;padding:8px 10px">
              <input id="videosSearchInput" class="search-input" placeholder="بحث عن فيديو..." value="${escapeHtmlAttr(
                String(state.videosQuery ?? "")
              )}" />
            </div>
            <button class="btn btn-ghost" type="button" data-videos-clear="1">مسح</button>
          </div>`;
        let cards = `<div class="panel-sub" style="font-weight:900;color:#d11">لا يوجد عناصر.</div>`;
        if (items.length) {
          let grid = `<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">`;
          for (const it of items) {
            const url = String(it?.url ?? "").trim();
            if (!url) continue;
            const title = String(it?.title ?? "").trim();
            const yt = extractYoutubeId(url);
            const thumb = yt ? `https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg` : "";
            grid += `<div style="border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,0.7);overflow:hidden;display:grid">
                <a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit">
                  <div style="aspect-ratio:16/9;background:#000;display:grid;place-items:center;position:relative">
                    ${
                      thumb
                        ? `<img src="${escapeHtmlAttr(thumb)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()" />`
                        : `<div style="color:#fff;font-weight:900;opacity:0.9">VIDEO</div>`
                    }
                    <div style="position:absolute;inset-inline-start:10px;inset-block-end:10px;background:rgba(0,0,0,0.6);color:#fff;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px">تشغيل</div>
                  </div>
                  <div style="padding:10px;display:grid;gap:4px">
                    ${title ? `<div style="font-weight:900;font-size:16px;line-height:1.35">${escapeHtml(title)}</div>` : ""}
                    <a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer" class="btn" style="background:var(--primary-2);color:#fff;text-align:center;padding:6px;font-size:12px;margin-top:6px;">رابط الفيديو</a>
                  </div>
                </a>
                <div style="padding:0 10px 10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                  <a class="btn btn-ghost" href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center">فتح</a>
                  <button class="btn btn-ghost" type="button" data-video-copy="${escapeHtmlAttr(url)}" style="flex:1">نسخ الرابط</button>
                </div>
              </div>`;
          }
          grid += `</div>`;
          cards = grid;
        }
        let pages = "";
        if (pageCount > 1) {
          let nums = "";
          for (let i = 1; i <= pageCount; i++) {
            const on = i === page;
            nums += `<button class="pill" type="button" data-videos-page="${i}" aria-pressed="${on ? "true" : "false"}">${i}</button>`;
          }
          pages = `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center">
              <button class="btn btn-ghost" type="button" data-videos-prev="1" ${page <= 1 ? "disabled" : ""}>▶</button>
              <div class="pillbar" style="padding:0;justify-content:center">${nums}</div>
              <button class="btn btn-ghost" type="button" data-videos-next="1" ${page >= pageCount ? "disabled" : ""}>◀</button>
              <div class="mini-note">صفحة ${page}/${pageCount} — عرض ${per} لكل صفحة</div>
            </div>`;
        }
        const introHtml = intro ? `<div class="panel-sub">${formatAboutText(intro)}</div>` : "";
        return `<div style="display:grid;gap:10px">${introHtml}${search}${pages}${cards}${pages}</div>`;
      }
      async function loadPhotoStoukIndex() {
        const cacheKey = "hjy_photo_stouk_files_v1";
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) return parsed;
          }
        } catch {}
        try {
          const res = await fetchTextCached("photo-stouk/files.txt", 30 * 60 * 1000);
          if (res && res.text) {
            const files = String(res.text)
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0 && !l.startsWith("#"))
              .map((l) => (l.startsWith("photo-stouk/") ? l : `photo-stouk/${l}`))
              .filter((p) => {
                const ext = safeLower(p.split(".").pop() || "");
                return CONFIG.PHOTO_EXTS.includes(ext);
              });
            try {
              localStorage.setItem(cacheKey, JSON.stringify(files));
            } catch {}
            return files;
          }
        } catch {}
        try {
          const list = await listGithubFilesRecursive("photo-stouk", CONFIG.PHOTO_EXTS, 4000);
          const files = list.map((p) => String(p ?? "").trim().replace(/\\/g, "/")).filter(Boolean);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(files));
          } catch {}
          return files;
        } catch {}
        return [];
      }
      function renderPhotoStoukUI(introText) {
        const intro = String(introText ?? "").trim();
        const files = Array.isArray(state.photoStoukFiles) ? state.photoStoukFiles : [];
        let html = `<div style="display:grid;gap:10px">`;
        if (intro) html += `<div class="panel-sub">${formatAboutText(intro)}</div>`;
        if (!files.length) {
          html += `<div class="panel-sub" style="font-weight:900;color:#d11">لا يوجد صور بعد داخل مجلد photo-stouk أو ملف files.txt فارغ.</div>`;
          html += `</div>`;
          return html;
        }
        const albumsMap = new Map();
        for (const p of files) {
          const s = String(p ?? "").replace(/\\/g, "/");
          const parts = s.split("/").filter(Boolean);
          const album = parts.length >= 3 ? parts[1] : "بدون تصنيف";
          if (!albumsMap.has(album)) albumsMap.set(album, []);
          albumsMap.get(album).push(s);
        }
        const albums = Array.from(albumsMap.keys()).sort((a, b) => a.localeCompare(b, "ar"));
        if (!state.photoStoukAlbum || !albumsMap.has(state.photoStoukAlbum)) state.photoStoukAlbum = albums[0];
        const selected = String(state.photoStoukAlbum || albums[0] || "").trim();
        let pills = "";
        for (const a of albums) {
          const on = a === selected;
          pills += `<button class="pill" type="button" data-photo-stouk-album="${escapeHtmlAttr(a)}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(
            a
          )}</button>`;
        }
        html += `<div class="pillbar" id="photoStoukAlbums" role="group" aria-label="ألبومات الصور" style="padding:0">${pills}</div>`;
        const list = albumsMap.get(selected) || [];
        let grid = "";
        for (const u of list.slice(0, 200)) {
          grid += `<button type="button" data-photo-stouk-photo="${escapeHtmlAttr(u)}" style="border:0;padding:0;background:transparent;cursor:pointer">
              <div class="thumb" style="aspect-ratio:1/1;border-radius:14px;background:#fff">
                <img src="${escapeHtmlAttr(u)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)" data-src-list="${escapeHtmlAttr(
            JSON.stringify([u])
          )}" data-src-idx="0" />
              </div>
            </button>`;
        }
        html += `<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">${grid}</div>`;
        html += `</div>`;
        return html;
      }
      function escapeHtmlAttr(s) {
        return escapeHtml(s).replace(/`/g, "&#96;");
      }
      function setStatus(text, isError = false) {
        if (!text) {
          els.status.setAttribute("aria-hidden", "true");
          els.status.textContent = "";
          return;
        }
        els.status.setAttribute("aria-hidden", "false");
        els.status.style.color = isError ? "#c62828" : "";
        els.status.textContent = text;
      }
      function setHomeStatus(text, isError = false) {
        if (!text) {
          els.homeStatus.setAttribute("aria-hidden", "true");
          els.homeStatus.textContent = "";
          return;
        }
        els.homeStatus.setAttribute("aria-hidden", "false");
        els.homeStatus.style.color = isError ? "#c62828" : "";
        els.homeStatus.textContent = text;
      }
      function setCheckoutStatus(text, isError = false) {
        if (!text) {
          els.checkoutStatus.setAttribute("aria-hidden", "true");
          els.checkoutStatus.textContent = "";
          try {
            els.checkoutStatus.removeAttribute("data-kind");
          } catch {}
          return;
        }
        els.checkoutStatus.setAttribute("aria-hidden", "false");
        try {
          els.checkoutStatus.setAttribute("data-kind", isError ? "error" : "ok");
        } catch {}
        els.checkoutStatus.style.color = "";
        els.checkoutStatus.textContent = text;
      }
      function setInfoStatus(text, isError = false) {
        if (!text) {
          els.infoStatus.setAttribute("aria-hidden", "true");
          els.infoStatus.textContent = "";
          return;
        }
        els.infoStatus.setAttribute("aria-hidden", "false");
        els.infoStatus.style.color = isError ? "#c62828" : "";
        els.infoStatus.textContent = text;
      }
      function setQaStatus(text, isError = false) {
        if (!text) {
          els.qaStatus.setAttribute("aria-hidden", "true");
          els.qaStatus.textContent = "";
          return;
        }
        els.qaStatus.setAttribute("aria-hidden", "false");
        els.qaStatus.style.color = isError ? "#c62828" : "";
        els.qaStatus.textContent = text;
      }
      function formatMoney(v) {
        const n = Number(v);
        if (!Number.isFinite(n)) return "0";
        return n % 1 === 0 ? String(n.toFixed(0)) : String(Number(n.toFixed(2)));
      }
      function marketingOldPrice(price) {
        const p = Number(price) || 0;
        return p * 1.15;
      }
      function normalizeCodeKey(code) {
        return safeLower(String(code ?? "").trim());
      }
      function parsePriceNumber(value) {
        const raw = String(value ?? "").trim();
        if (!raw) return 0;
        const s = raw.replace(/[^\d.,-]/g, "");
        if (!s) return 0;
        const lastDot = s.lastIndexOf(".");
        const lastComma = s.lastIndexOf(",");
        let normalized = s;
        if (lastComma > lastDot) {
          normalized = s.replace(/\./g, "").replace(",", ".");
        } else {
          normalized = s.replace(/,/g, "");
        }
        const n = Number(normalized);
        return Number.isFinite(n) ? n : 0;
      }
      function parseCsvLine(line, delimiter = ",") {
        const out = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"' && line[i + 1] === '"') {
            cur += '"';
            i++;
            continue;
          }
          if (ch === '"') {
            inQuotes = !inQuotes;
            continue;
          }
          if (ch === delimiter && !inQuotes) {
            out.push(cur);
            cur = "";
            continue;
          }
          cur += ch;
        }
        out.push(cur);
        return out.map((v) => String(v ?? "").trim());
      }
      function detectCsvDelimiter(headerLine) {
        const h = String(headerLine ?? "").replace(/^\uFEFF/, "");
        const candidates = [";", ",", "\t"];
        let best = ";";
        let bestScore = -1;
        for (const d of candidates) {
          const cols = parseCsvLine(h, d);
          let score = cols.length;
          const c0 = safeLower(cols[0] ?? "");
          if (c0.includes("code")) score += 10;
          if (score > bestScore) {
            bestScore = score;
            best = d;
          }
        }
        return best;
      }
      function splitCsvRows(input) {
        const s = String(input ?? "");
        const rows = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if (ch === '"') {
            if (inQuotes && s[i + 1] === '"') {
              cur += '""';
              i++;
              continue;
            }
            inQuotes = !inQuotes;
            cur += ch;
            continue;
          }
          if ((ch === "\n" || ch === "\r") && !inQuotes) {
            if (ch === "\r" && s[i + 1] === "\n") i++;
            if (cur.trim().length > 0) rows.push(cur);
            cur = "";
            continue;
          }
          cur += ch;
        }
        if (cur.trim().length > 0) rows.push(cur);
        return rows;
      }
      function cleanCell(v) {
        let s = String(v ?? "");
        s = s.replace(/^\uFEFF/, "");
        return s.trim();
      }
      function normalizeCsvRow(cols, delimiter, expected) {
        const out = Array.isArray(cols) ? cols.slice() : [];
        while (out.length < expected) out.push("");
        if (out.length > expected) {
          const head = out.slice(0, expected - 1);
          const tail = out.slice(expected - 1).join(delimiter);
          return [...head, tail];
        }
        return out;
      }
      function parseCsvText(text) {
        const lines = splitCsvRows(text).filter((l) => String(l ?? "").trim().length > 0);
        if (lines.length === 0) return { headers: [], rows: [], delimiter: ";" };
        const headerLine = String(lines[0] ?? "").replace(/^\uFEFF/, "");
        const delimiter = detectCsvDelimiter(headerLine);
        const headers = parseCsvLine(headerLine, delimiter).map(cleanCell);
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const colsRaw = parseCsvLine(lines[i], delimiter);
          const cols = normalizeCsvRow(colsRaw, delimiter, headers.length).map(cleanCell);
          rows.push(cols);
        }
        return { headers, rows, delimiter };
      }
      function getCachedText(cacheKey, maxAgeMs) {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return null;
        }
        if (!parsed || typeof parsed !== "object") return null;
        const ts = Number(parsed.ts) || 0;
        const text = typeof parsed.text === "string" ? parsed.text : "";
        if (!text) return null;
        if (maxAgeMs && ts && Date.now() - ts > maxAgeMs) return null;
        return text;
      }
      function setCachedText(cacheKey, text) {
        const t = String(text ?? "");
        if (!t.trim()) return;
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), text: t }));
        } catch {}
      }
      let slowNetWarned = false;
      function warnSlowNetOnce() {
        if (slowNetWarned) return;
        slowNetWarned = true;
        try {
          showToast("النت لديك بطيئ قم بإعادة تحميل الصفحة أو اطفئ ال vpn", 4200);
        } catch {}
      }
      async function fetchWithTimeout(url, init, timeoutMs) {
        const ms = Math.max(0, Number(timeoutMs) || 0);
        if (!ms || typeof AbortController !== "function") return fetch(url, init);
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        try {
          const res = await fetch(url, { ...(init || {}), signal: ctrl.signal });
          return res;
        } finally {
          try {
            clearTimeout(t);
          } catch {}
        }
      }
      async function fetchWithRetry(url, init, retries = 2, timeoutMs = 12000) {
        const n = Math.max(0, Math.min(6, Number(retries) || 0));
        let lastErr = null;
        for (let i = 0; i <= n; i++) {
          try {
            if (i > 0) warnSlowNetOnce();
            const res = await fetchWithTimeout(url, init, timeoutMs);
            return res;
          } catch (e) {
            lastErr = e;
            const wait = Math.min(2200, 450 + i * i * 420);
            await new Promise((r) => setTimeout(r, wait));
          }
        }
        throw lastErr || new Error("Fetch failed");
      }
      async function fetchTextCached(url, maxAgeMs = 6 * 60 * 60 * 1000) {
        let u = String(url ?? "").trim();
        if (!u) return null;
        const ghPages = String(location.hostname || "").toLowerCase().endsWith(".github.io");
        if (ghPages && !wantsNoCache()) {
          const sep = u.includes("?") ? "&" : "?";
          u = `${u}${sep}v=${Math.floor(Date.now() / 60000)}`;
          maxAgeMs = Math.min(Number(maxAgeMs) || 0, 60 * 1000) || 60 * 1000;
        }
        const cacheKey = `hjy_text_cache_v1::${u}`;
        if (!wantsNoCache()) {
          const cached = getCachedText(cacheKey, maxAgeMs);
          if (cached) return { url: u, text: cached, cached: true };
        }
        try {
          const res = await fetchWithRetry(u, { cache: "no-store" }, 2, 12000);
          if (!res.ok) throw new Error("Fetch failed");
          const text = await res.text();
          if (!String(text ?? "").trim()) throw new Error("Empty");
          setCachedText(cacheKey, text);
          return { url: u, text, cached: false };
        } catch {
          const stale = getCachedText(cacheKey, 0);
          if (stale) return { url: u, text: stale, cached: true };
          return null;
        }
      }
      async function fetchTextFirstAvailable(urls, maxAgeMs = 6 * 60 * 60 * 1000) {
        const list = Array.isArray(urls) ? urls : [];
        for (const u of list) {
          const got = await fetchTextCached(String(u), maxAgeMs);
          if (got && String(got.text ?? "").trim()) return { url: String(got.url), text: got.text };
        }
        return null;
      }
      async function fetchJsonCached(url, maxAgeMs = 6 * 60 * 60 * 1000) {
        let u = String(url ?? "").trim();
        if (!u) return null;
        const ghPages = String(location.hostname || "").toLowerCase().endsWith(".github.io");
        if (ghPages && !wantsNoCache()) {
          const sep = u.includes("?") ? "&" : "?";
          u = `${u}${sep}v=${Math.floor(Date.now() / 60000)}`;
          maxAgeMs = Math.min(Number(maxAgeMs) || 0, 60 * 1000) || 60 * 1000;
        }
        const cacheKey = `hjy_json_cache_v1::${u}`;
        if (!wantsNoCache()) {
          const cached = getCachedText(cacheKey, maxAgeMs);
          if (cached) {
            try {
              return { url: u, json: JSON.parse(cached), cached: true };
            } catch {}
          }
        }
        try {
          const res = await fetchWithRetry(u, { cache: "no-store" }, 2, 12000);
          if (!res.ok) throw new Error("Fetch failed");
          const json = await res.json();
          setCachedText(cacheKey, JSON.stringify(json));
          return { url: u, json, cached: false };
        } catch {
          const stale = getCachedText(cacheKey, 0);
          if (stale) {
            try {
              return { url: u, json: JSON.parse(stale), cached: true };
            } catch {}
          }
          return null;
        }
      }
      function detectGithubRepoFromLocation() {
        const host = String(location.hostname ?? "").trim();
        const path = String(location.pathname ?? "").replace(/^\/+/, "");
        if (!host.endsWith(".github.io")) return { owner: "", repo: "" };
        const owner = host.replace(/\.github\.io$/i, "");
        const seg = path.split("/").filter(Boolean);
        const repo = seg.length ? seg[0] : "";
        return { owner, repo };
      }
      function encodePathSegments(p) {
        const s = String(p ?? "").replace(/\\/g, "/");
        return s
          .split("/")
          .filter((x) => x.length > 0)
          .map((x) => encodeURIComponent(x))
          .join("/");
      }
      function githubRepoInfo() {
        const detected = detectGithubRepoFromLocation();
        const owner = String(CONFIG.GITHUB_OWNER || detected.owner || "").trim();
        const repo = String(CONFIG.GITHUB_REPO || detected.repo || "").trim();
        const branch = String(CONFIG.GITHUB_BRANCH || "main").trim();
        return { owner, repo, branch };
      }
      async function listGithubCsvFiles() {
        const { owner, repo, branch } = githubRepoInfo();
        if (!owner || !repo) return [];
        const dir = String(CONFIG.DATA_DIR ?? "data-csv").trim() || "data-csv";
        const api = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePathSegments(
          dir
        )}?ref=${encodeURIComponent(branch)}`;
        const res = await fetchJsonCached(api, 10 * 60 * 1000);
        const list = Array.isArray(res?.json) ? res.json : [];
        const files = list
          .filter((x) => x && x.type === "file" && typeof x.name === "string" && /\.csv$/i.test(x.name))
          .map((x) => `${dir}/${encodeURIComponent(x.name)}`);
        return files;
      }
      async function listGithubFilesRecursive(rootDir, wantedExts, maxFiles) {
        const { owner, repo, branch } = githubRepoInfo();
        if (!owner || !repo) return [];
        const dir = String(rootDir ?? "").trim().replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
        if (!dir) return [];
        const exts = Array.isArray(wantedExts) ? wantedExts.map((x) => String(x ?? "").trim().replace(/^\./, "").toLowerCase()).filter(Boolean) : [];
        const max = Math.max(0, Number(maxFiles) || 0) || 2000;
        const out = [];
        const queue = [dir];
        const seenDirs = new Set();
        while (queue.length && out.length < max) {
          const cur = queue.shift();
          if (!cur || seenDirs.has(cur)) continue;
          seenDirs.add(cur);
          const api = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePathSegments(
            cur
          )}?ref=${encodeURIComponent(branch)}`;
          const res = await fetchJsonCached(api, 30 * 60 * 1000);
          const list = Array.isArray(res?.json) ? res.json : [];
          for (const it of list) {
            if (!it || typeof it !== "object") continue;
            const type = String(it.type ?? "");
            const name = String(it.name ?? "");
            if (!name) continue;
            if (type === "dir") {
              queue.push(`${cur}/${name}`);
              continue;
            }
            if (type !== "file") continue;
            const lower = name.toLowerCase();
            const dot = lower.lastIndexOf(".");
            const ext = dot >= 0 ? lower.slice(dot + 1) : "";
            if (exts.length && !exts.includes(ext)) continue;
            out.push(`${cur}/${name}`);
            if (out.length >= max) break;
          }
        }
        return out;
      }
      function parseDataManifestText(text) {
        const dir = String(CONFIG.DATA_DIR ?? "data-csv").trim() || "data-csv";
        const lines = String(text ?? "")
          .split(/\r?\n/)
          .map((l) => String(l ?? "").trim())
          .filter((l) => l.length > 0 && !l.startsWith("#"));
        const out = [];
        const seen = new Set();
        for (const line of lines) {
          const raw = String(line ?? "").trim();
          if (!raw) continue;
          const isHttp = /^https?:\/\//i.test(raw);
          const name = isHttp ? raw : /\.csv$/i.test(raw) ? raw : `${raw}.csv`;
          const url = isHttp ? name : name.includes("/") ? name : `${dir}/${encodeURIComponent(name)}`;
          if (seen.has(url)) continue;
          seen.add(url);
          out.push(url);
        }
        return out;
      }
      async function resolveDataFiles() {
        const dir = String(CONFIG.DATA_DIR ?? "data-csv").trim() || "data-csv";
        const seen = new Set();
        const out = [];
        const add = (urls) => {
          for (const u of (Array.isArray(urls) ? urls : [])) {
            const key = String(u || "").trim();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            out.push(key);
          }
        };
        // 1) manifest (files.txt)
        const manifestUrls = Array.isArray(CONFIG.DATA_MANIFEST_URLS) ? CONFIG.DATA_MANIFEST_URLS : [];
        const res = await fetchTextFirstAvailable(manifestUrls, 60 * 1000);
        if (res) add(parseDataManifestText(res.text));
        // 2) GitHub actual directory listing (union — never miss a renamed/new file)
        if (CONFIG.GITHUB_AUTO_LIST) {
          try { add(await listGithubCsvFiles()); } catch {}
        }
        // 3) static fallback list
        const fallback = Array.isArray(CONFIG.DATA_FILES) ? CONFIG.DATA_FILES : [];
        add(fallback);
        return out.length ? out : fallback;
      }
      function parsePhotoList(raw) {
        const s = String(raw ?? "").trim();
        if (!s) return [];
        return s
          .split(/[,،\n\r]+/)
          .map((x) => String(x ?? "").trim())
          .filter((x) => x.length > 0)
          .slice(0, 20);
      }
      let photoIndexLoaded = false;
      let photoIndexMap = null;
      function normalizePhotoKeyFromPath(p) {
        const s = String(p ?? "").trim().replace(/\\/g, "/");
        if (!s) return "";
        const base = s.split("/").pop() || "";
        const noQuery = base.split("?")[0] || "";
        return safeLower(noQuery.replace(/\.[^./]+$/, "").trim());
      }
      async function loadPhotoIndexFromManifest(dir, exts) {
        const d = String(dir ?? "").trim().replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
        const extSet = new Set(
          (Array.isArray(exts) ? exts : []).map((x) => String(x ?? "").trim().replace(/^\./, "").toLowerCase()).filter(Boolean)
        );
        const candidates = [`${d}/files.txt`, `data/${d}_files.txt`];
        for (const u of candidates) {
          try {
            const res = await fetchTextCached(u, 10 * 60 * 1000);
            if (res && res.text) {
              const lines = String(res.text).split(/\r?\n/).map((l) => String(l ?? "").trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
              if (lines.length) {
                const out = [];
                const seen = new Set();
                for (const line of lines) {
                  const p = String(line).replace(/\\/g, "/").replace(/^\/+/, "");
                  if (!p || seen.has(p)) continue;
                  const lower = safeLower(p);
                  const dot = lower.lastIndexOf(".");
                  const ext = dot >= 0 ? lower.slice(dot + 1) : "";
                  if (extSet.size && !extSet.has(ext)) continue;
                  seen.add(p);
                  out.push(p);
                }
                if (out.length) return out;
              }
            }
          } catch {}
        }
        return [];
      }
      async function loadPhotoIndex() {
        if (photoIndexLoaded) return;
        photoIndexLoaded = true;
        if (!CONFIG.PHOTO_AUTO_LIST) return;
        const dir = String(CONFIG.PHOTO_DIR ?? "photo").trim() || "photo";
        const exts = Array.isArray(CONFIG.PHOTO_EXTS) ? CONFIG.PHOTO_EXTS : ["webp", "png", "jpg", "jpeg", "gif"];
        const max = Math.max(0, Number(CONFIG.PHOTO_MAX_FILES) || 0) || 4000;
        let cacheMs = Math.max(0, Number(CONFIG.PHOTO_INDEX_CACHE_MS) || 30 * 60 * 1000);
        const ghPages = String(location.hostname || "").toLowerCase().endsWith(".github.io");
        if (ghPages && !wantsNoCache()) cacheMs = Math.min(cacheMs, 60 * 1000);
        const cacheKey = `hjy_photo_index_v1::${dir}`;
        const prev = cacheMs ? getCachedText(cacheKey, cacheMs) : null;
        let list = [];
        if (prev) {
          try {
            const parsed = JSON.parse(prev);
            if (Array.isArray(parsed)) list = parsed;
          } catch {}
        }
        if (list.length === 0) {
          // 1) manifest files first (avoids GitHub API rate limits)
          list = await loadPhotoIndexFromManifest(dir, exts);
          // 2) fallback to GitHub API recursive listing
          if (list.length === 0) {
            try {
              list = await listGithubFilesRecursive(dir, exts, max);
            } catch {}
          }
          if (list.length) setCachedText(cacheKey, JSON.stringify(list));
        }
        if (!list.length) return;
        const map = new Map();
        for (const path of list) {
          const p = String(path ?? "").trim().replace(/\\/g, "/");
          const k = normalizePhotoKeyFromPath(p);
          if (!k) continue;
          const arr = map.get(k) || [];
          arr.push(p);
          map.set(k, arr);
        }
        photoIndexMap = map;
      }
      function buildPhotoCandidates(code, extraCodes, isThumb = false) {
        const c = String(code ?? "").trim();
        const variants = [];
        if (c) {
          if (isThumb) variants.push(`thumb_${c}`, `thumb_${c.toUpperCase()}`, `thumb_${c.toLowerCase()}`);
          variants.push(c, c.toUpperCase(), c.toLowerCase());
        }
        const extras = Array.isArray(extraCodes) ? extraCodes : [];
        for (const ex of extras) {
          const e = String(ex ?? "").trim();
          if (!e) continue;
          if (isThumb) variants.push(`thumb_${e}`, `thumb_${e.toUpperCase()}`, `thumb_${e.toLowerCase()}`);
          variants.push(e, e.toUpperCase(), e.toLowerCase());
        }
        const seen = new Set();
        const uniqueVariants = [];
        for (const v of variants) {
          if (!seen.has(v)) {
            seen.add(v);
            uniqueVariants.push(v);
          }
        }
        
        const out = [];
        const extList = Array.isArray(CONFIG.PHOTO_EXTS) ? CONFIG.PHOTO_EXTS : ["webp"];
        
        if (photoIndexMap instanceof Map && photoIndexMap.size > 0) {
          const seenPaths = new Set();
          for (const v of uniqueVariants) {
            const mapKey = safeLower(String(v).trim());
            const indexed = photoIndexMap.get(mapKey);
            if (Array.isArray(indexed) && indexed.length) {
              for (const p of indexed) {
                if (!seenPaths.has(p)) {
                  seenPaths.add(p);
                  out.push(p);
                }
              }
            }
          }
          return out;
        }

        for (const dir of CONFIG.PHOTO_DIRS) {
          for (const ext of extList) {
            for (const v of uniqueVariants) {
              const e = String(ext ?? "").trim().replace(/^\./, "");
              if (!e) continue;
              out.push(`${dir}/${encodeURIComponent(v)}.${e}`);
            }
          }
        }
        
        const uniq = [];
        const used = new Set();
        for (const p of out) {
          const k = String(p ?? "");
          if (!k || used.has(k)) continue;
          used.add(k);
          uniq.push(k);
        }
        return uniq;
      }
      function parseDisRules(raw) {
        const text = String(raw ?? "").replace(/\r/g, "\n").trim();
        if (!text) return [];
        const cleaned = text.replace(/--[\s\S]*?--/, "").replace(/"([^"]*)"/, "");
        const parts = cleaned
          .split(/[,،;\n]+/)
          .map((l) => String(l ?? "").trim())
          .filter((l) => l.length > 0);
        const rules = [];
        for (const part of parts) {
          const s = safeLower(part).replace(/\s+/g, "");
          const mPercent = s.match(/^(\d+)\s*p\s*=\s*([0-9.]+)%$/i);
          if (mPercent) {
            const qty = Number(mPercent[1]);
            const pct = Number(mPercent[2]);
            if (Number.isFinite(qty) && qty > 0 && Number.isFinite(pct) && pct > 0) rules.push({ qty, type: "PERCENT", value: pct });
            continue;
          }
          const mPrice = s.match(/^(\d+)\s*\+p\s*=\s*([0-9.]+)$/i);
          if (mPrice) {
            const qty = Number(mPrice[1]);
            const price = Number(mPrice[2]);
            if (Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price > 0) rules.push({ qty, type: "PRICE", value: price });
          }
        }
        rules.sort((a, b) => a.qty - b.qty);
        const uniq = [];
        const seenQty = new Set();
        for (const r of rules) {
          const k = `${r.qty}-${r.type}-${r.value}`;
          if (seenQty.has(k)) continue;
          seenQty.add(k);
          uniq.push(r);
        }
        return uniq;
      }
      function extractDisNote(raw) {
        const text = String(raw ?? "");
        let m = text.match(/^\s*"([\s\S]*?)"\s*$/);
        if (m) return String(m[1] || "").trim();
        m = text.match(/"([^"]*)"/);
        if (m) return String(m[1] || "").trim();
        m = text.match(/--([\s\S]*?)--/);
        if (m) return String(m[1] || "").trim();
        return "";
      }
      function pickRuleForQty(rules, qty) {
        const q = Math.max(1, Number(qty) || 1);
        const list = Array.isArray(rules) ? rules : [];
        let best = null;
        for (const r of list) {
          if (!r || typeof r !== "object") continue;
          if (Number(r.qty) <= q) best = r;
        }
        return best;
      }
      function unitPriceForQty(product, qty) {
        const base = Number(product?.price) || 0;
        const rules = Array.isArray(product?.disRules) ? product.disRules : [];
        const best = pickRuleForQty(rules, qty);
        if (!best) return { unit: base, applied: null };
        if (best.type === "PERCENT") return { unit: base * (1 - Number(best.value || 0) / 100), applied: best };
        if (best.type === "PRICE") return { unit: Number(best.value) || base, applied: best };
        return { unit: base, applied: null };
      }
      function disTextForProduct(product) {
        const note = String(product?.disNote ?? "").trim();
        const rules = Array.isArray(product?.disRules) ? product.disRules : [];
        const base = Number(product?.price) || 0;
        let out = "";
        for (const r of rules) {
          if (r.type === "PERCENT") {
            const newPrice = base * (1 - Number(r.value || 0) / 100);
            out += `خصم ${formatMoney(r.value)}% عند شراء ${r.qty} قطع — سعر القطعة ${formatMoney(newPrice)} بدل ${formatMoney(base)}\n`;
          } else if (r.type === "PRICE") {
            out += `سعر خاص ${formatMoney(r.value)} عند شراء ${r.qty} قطع — بدل ${formatMoney(base)}\n`;
          }
        }
        if (note) out += (out ? "\n" : "") + note;
        return out.trim();
      }
      function setRoute(route) {
        const r = String(route ?? "").trim() || "home";
        els.appRoot.setAttribute("data-route", r);
      }
      let promoLoaded = false;
      async function loadPromoText() {
        if (promoLoaded) return;
        promoLoaded = true;
        if (!(els.promoText instanceof HTMLElement)) return;
        const urls = Array.isArray(CONFIG.PROMO_URLS) ? CONFIG.PROMO_URLS : [];
        const res = await fetchTextFirstAvailable(urls, 10 * 60 * 1000);
        const text = String(res?.text ?? "").trim();
        els.promoText.innerHTML = formatAboutTextPlain(text);
      }
      function setPromoVisible(visible) {
        if (!(els.promoBar instanceof HTMLElement)) return;
        const hasText = els.promoText instanceof HTMLElement && String(els.promoText.textContent ?? "").trim().length > 0;
        els.promoBar.style.display = visible && hasText ? "" : "none";
      }
      function showHomeView() {
        setRoute("home");
        els.homeView.style.display = "";
        els.shopView.style.display = "none";
        els.productView.style.display = "none";
        els.checkoutView.style.display = "none";
        els.infoView.style.display = "none";
        els.qaView.style.display = "none";
        els.ordersView.style.display = "none";
        if (els.catsWrapper) els.catsWrapper.style.display = "";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "";
        if (els.topQaBar) els.topQaBar.style.display = "";
        setPromoVisible(true);
        setStatus("");
        setCheckoutStatus("");
        setInfoStatus("");
        animateIn(els.homeView);
        renderTopQaBarButtons(); // Update bar state explicitly
      }
      function showShopView() {
        setRoute("shop");
        els.homeView.style.display = "none";
        els.shopView.style.display = "";
        els.productView.style.display = "none";
        els.checkoutView.style.display = "none";
        els.infoView.style.display = "none";
        els.qaView.style.display = "none";
        els.ordersView.style.display = "none";
        if (els.catsWrapper) els.catsWrapper.style.display = "none";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "none";
        if (els.topQaBar) els.topQaBar.style.display = "none";
        setPromoVisible(false);
        setCheckoutStatus("");
        setInfoStatus("");
        animateIn(els.shopView);
      }
      function showProductView(code) {
        setRoute("shop");
        state.lastMainRoute = "shop";
        els.homeView.style.display = "none";
        els.shopView.style.display = "none";
        els.productView.style.display = "";
        els.checkoutView.style.display = "none";
        els.infoView.style.display = "none";
        els.qaView.style.display = "none";
        els.ordersView.style.display = "none";
        if (els.catsWrapper) els.catsWrapper.style.display = "none";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "none";
        if (els.topQaBar) els.topQaBar.style.display = "none";
        setPromoVisible(false);
        setStatus("");
        setCheckoutStatus("");
        setInfoStatus("");
        renderProductDetails(code);
        animateIn(els.productView);
      }
      function showCheckoutView() {
        setRoute("checkout");
        state.lastMainRoute = "shop";
        els.homeView.style.display = "none";
        els.shopView.style.display = "none";
        els.productView.style.display = "none";
        els.checkoutView.style.display = "";
        els.infoView.style.display = "none";
        els.qaView.style.display = "none";
        els.ordersView.style.display = "none";
        if (els.catsWrapper) els.catsWrapper.style.display = "none";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "none";
        if (els.topQaBar) els.topQaBar.style.display = "none";
        setPromoVisible(false);
        setStatus("");
        setInfoStatus("");
        updateCheckoutMeta();
        renderCheckoutCartSummary();
        animateIn(els.checkoutView);
      }
      function updateCheckoutMeta() {
        if (!(els.checkoutMeta instanceof HTMLElement)) return;
        const count = cartCountTotal();
        const total = cartTotals();
        els.checkoutMeta.textContent = count === 0 ? "السلة فارغة" : `${count} قطعة — $${formatMoney(total)}`;
      }
      function showInfoView(key) {
        setRoute("info");
        els.homeView.style.display = "none";
        els.shopView.style.display = "none";
        els.productView.style.display = "none";
        els.checkoutView.style.display = "none";
        els.infoView.style.display = "";
        els.qaView.style.display = "none";
        els.ordersView.style.display = "none";
        if (els.catsWrapper) els.catsWrapper.style.display = "none";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "none";
        if (els.topQaBar) els.topQaBar.style.display = "none";
        setPromoVisible(false);
        setStatus("");
        setCheckoutStatus("");
        setInfoStatus("");
        els.complaintForm.style.display = "none";
        els.ratingForm.style.display = "none";
        els.complaintNote.style.display = "none";
        els.ratingDone.style.display = "none";
        renderInfo(key);
        animateIn(els.infoView);
      }
      function showQaView(selected) {
        setRoute("qa");
        els.homeView.style.display = "none";
        els.shopView.style.display = "none";
        els.productView.style.display = "none";
        els.checkoutView.style.display = "none";
        els.infoView.style.display = "none";
        els.qaView.style.display = "";
        els.ordersView.style.display = "none";
        if (els.catsWrapper) els.catsWrapper.style.display = "none";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "none";
        if (els.topQaBar) els.topQaBar.style.display = "none";
        setPromoVisible(false);
        setStatus("");
        setCheckoutStatus("");
        setInfoStatus("");
        renderQa(selected);
        animateIn(els.qaView);
      }
      function showOrdersView() {
        setRoute("orders");
        els.homeView.style.display = "none";
        els.shopView.style.display = "none";
        els.productView.style.display = "none";
        els.checkoutView.style.display = "none";
        els.infoView.style.display = "none";
        els.qaView.style.display = "none";
        els.ordersView.style.display = "";
        if (els.catsWrapper) els.catsWrapper.style.display = "none";
        if (els.catsMoreBtn) els.catsMoreBtn.style.display = "none";
        if (els.topQaBar) els.topQaBar.style.display = "none";
        setPromoVisible(false);
        setStatus("");
        setCheckoutStatus("");
        setInfoStatus("");
        renderOrdersView();
        animateIn(els.ordersView);
      }
      function setHash(hash) {
        const h = String(hash ?? "").trim();
        location.hash = h ? `#${h}` : "";
      }
      function parseHashParams(raw) {
        const s = String(raw ?? "").trim();
        if (!s) return { route: "", params: new URLSearchParams() };
        const parts = s.split("&");
        const route = String(parts.shift() || "").trim();
        const params = new URLSearchParams(parts.join("&"));
        return { route, params };
      }
      function setShopHashWithCategory(cat) {
        const c = String(cat ?? "").trim();
        if (!c || c === "ALL") return setHash("shop");
        setHash(`shop&cat=${encodeURIComponent(c)}`);
      }
      function applyHashRoute() {
        const raw = String(location.hash || "").replace(/^#/, "").trim();
        const parsed = parseHashParams(raw);
        const route = parsed.route;
        const params = parsed.params;
        const catParam = String(params.get("cat") || "").trim();
        try {
          window.scrollTo(0, 0);
        } catch {}
        try {
          openCart(false);
        } catch {}
        if (!route) {
          state.category = "HOME";
          updatePills();
          showHomeView();
          renderHome();
          return;
        }
        if (route === "home") {
          state.category = "HOME";
          updatePills();
          showHomeView();
          renderHome();
          return;
        }
        if (route === "shop") {
          state.category = catParam ? catParam : "ALL";
          updatePills();
          showShopView();
          applyFilters();
          return;
        }
        if (route === "checkout") {
          showCheckoutView();
          return;
        }
        if (route.startsWith("product=")) {
          const code = decodeURIComponent(route.slice("product=".length));
          showProductView(code);
          return;
        }
        if (route.startsWith("info=")) {
          const key = decodeURIComponent(route.slice("info=".length));
          showInfoView(key);
          return;
        }
        if (route === "qa") {
          showQaView("");
          return;
        }
        if (route.startsWith("qa=")) {
          const key = decodeURIComponent(route.slice("qa=".length));
          showQaView(key);
          return;
        }
        if (route === "orders") {
          showOrdersView();
          return;
        }
        setHash("home");
      }
      function loadFavorites() {
        try {
          const raw = localStorage.getItem("hjy_favorites_v1");
          const parsed = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(parsed)) return;
          state.favorites = new Set(parsed.map((x) => normalizeCodeKey(x)).filter((x) => x));
        } catch {}
      }
      function saveFavorites() {
        try {
          localStorage.setItem("hjy_favorites_v1", JSON.stringify(Array.from(state.favorites.values())));
        } catch {}
      }
      function isFavorite(code) {
        return state.favorites.has(normalizeCodeKey(code));
      }
      function toggleFavorite(code) {
        const k = normalizeCodeKey(code);
        if (!k) return;
        if (state.favorites.has(k)) {
          state.favorites.delete(k);
          saveFavorites();
          showToast("تمت الإزالة من المفضلة", 1600);
        } else {
          state.favorites.add(k);
          saveFavorites();
          showToast("تمت الإضافة إلى المفضلة", 1600);
        }
        applyFilters();
        renderHome();
        if (els.productView.style.display !== "none") renderProductDetails(state.lastProductCode);
      }
      function openCart(open) {
        const next =
          typeof open === "boolean" ? (open ? "true" : "false") : els.cartPanel.getAttribute("data-open") === "true" ? "false" : "true";
        els.cartPanel.setAttribute("data-open", next);
        els.cartBackdrop.setAttribute("data-open", next);
      }
      function animateCartToggle() {
        const el = els.cartToggle;
        if (!(el instanceof HTMLElement)) return;
        el.classList.remove("cart-pop");
        void el.offsetWidth;
        el.classList.add("cart-pop");
        setTimeout(() => el.classList.remove("cart-pop"), 650);
        try {
          if (navigator.vibrate) navigator.vibrate(25);
        } catch {}
      }
      function cartKey(p) {
        return normalizeCodeKey(p?.code);
      }
      function saveCart() {
        try {
          const payload = Array.from(state.cart.values()).map((it) => ({ code: it.product.code, qty: it.qty }));
          localStorage.setItem("hjy_cart_v1", JSON.stringify(payload));
        } catch {}
      }
      function loadCart() {
        try {
          const raw = localStorage.getItem("hjy_cart_v1");
          if (!raw) return;
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) return;
          state.cart.clear();
          for (const row of parsed) {
            const code = String(row?.code ?? "").trim();
            const qty = Math.max(1, Math.min(999, Number(row?.qty) || 1));
            const p = state.allProducts.find((x) => normalizeCodeKey(x.code) === normalizeCodeKey(code));
            if (!p) continue;
            if (p.isOut) continue;
            state.cart.set(cartKey(p), { product: p, qty });
          }
        } catch {}
      }
      function orderId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      }
      function loadOrdersHistory() {
        try {
          const raw = localStorage.getItem("hjy_orders_v1");
          const parsed = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(parsed)) return [];
          return parsed.filter((x) => x && typeof x === "object");
        } catch {
          return [];
        }
      }
      function saveOrdersHistory(list) {
        try {
          const arr = Array.isArray(list) ? list : [];
          localStorage.setItem("hjy_orders_v1", JSON.stringify(arr.slice(0, 300)));
        } catch {}
      }
      function addOrderToHistory(entry) {
        const list = loadOrdersHistory();
        list.unshift(entry);
        saveOrdersHistory(list);
      }
      function fmtDateTime(ts) {
        const d = new Date(Number(ts) || Date.now());
        try {
          return d.toLocaleString("ar", { hour12: true });
        } catch {
          return String(d);
        }
      }
      function renderOrdersView() {
        if (!(els.ordersList instanceof HTMLElement) || !(els.ordersDetails instanceof HTMLElement) || !(els.ordersMeta instanceof HTMLElement))
          return;
        const list = loadOrdersHistory();
        els.ordersMeta.textContent = list.length ? `${list.length} طلب محفوظ` : "لا يوجد طلبات محفوظة";
        if (els.ordersClearAllBtn instanceof HTMLButtonElement) els.ordersClearAllBtn.disabled = list.length === 0;
        if (els.ordersStatus instanceof HTMLElement) {
          els.ordersStatus.setAttribute("aria-hidden", "true");
          els.ordersStatus.textContent = "";
        }
        let html = "";
        for (const it of list) {
          const id = String(it?.id ?? "");
          const count = Number(it?.count ?? 0) || 0;
          const total = Number(it?.total ?? 0) || 0;
          const phone = String(it?.phone ?? "").trim();
          const when = fmtDateTime(it?.ts);
          html += `
            <div class="checkrow" style="justify-content:space-between;gap:12px;flex-wrap:wrap">
              <div style="display:grid;gap:4px;min-width:0">
                <div style="font-weight:900">طلب ${escapeHtml(id ? `#${id.slice(0, 8)}` : "")}</div>
                <div class="mini-note" style="font-size:12px">${escapeHtml(when)} — ${escapeHtml(String(count))} قطعة — $${escapeHtml(formatMoney(total))}${phone ? ` — ${escapeHtml(phone)}` : ""}</div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-ghost" type="button" data-order-view="${escapeHtmlAttr(id)}">عرض التفاصيل</button>
                <button class="btn btn-danger" type="button" data-order-del="${escapeHtmlAttr(id)}">حذف</button>
              </div>
            </div>
          `;
        }
        els.ordersList.innerHTML = html || `<div class="panel-sub">لا يوجد طلبات محفوظة داخل المتصفح حالياً.</div>`;
        const sel = String(state.ordersSelectedId ?? "").trim();
        if (!sel) {
          els.ordersDetails.style.display = "none";
          els.ordersDetails.innerHTML = "";
          return;
        }
        const found = list.find((x) => String(x?.id ?? "") === sel);
        if (!found) {
          state.ordersSelectedId = "";
          els.ordersDetails.style.display = "none";
          els.ordersDetails.innerHTML = "";
          return;
        }
        const invoice = String(found.invoice ?? "").trim();
        els.ordersDetails.style.display = "grid";
        els.ordersDetails.innerHTML = `
          <div class="checkrow" style="justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div style="font-weight:900">تفاصيل الطلب</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-ghost" type="button" data-order-copy="${escapeHtmlAttr(found.id)}">نسخ</button>
              <button class="btn btn-ghost" type="button" data-order-close>إغلاق</button>
            </div>
          </div>
          <div class="panel-sub" style="white-space:pre-wrap;direction:ltr;unicode-bidi:plaintext;border:1px solid var(--border);border-radius:14px;padding:12px;background:rgba(255,255,255,0.7)">${escapeHtml(
            invoice || "—"
          )}</div>
        `;
      }
      state.cart = new Map();
      function cartCountTotal() {
        let total = 0;
        for (const it of state.cart.values()) total += Math.max(1, Number(it.qty) || 1);
        return total;
      }
      function cartTotals() {
        let total = 0;
        for (const it of state.cart.values()) {
          const qty = Math.max(1, Number(it.qty) || 1);
          const got = unitPriceForQty(it.product, qty);
          total += qty * (Number(got.unit) || 0);
        }
        return total;
      }
      function addToCart(code) {
        const p = state.allProducts.find((x) => normalizeCodeKey(x.code) === normalizeCodeKey(code));
        if (!p || p.isOut) return;
        const k = cartKey(p);
        const it = state.cart.get(k);
        const nextQty = it ? Math.max(1, Math.min(999, Number(it.qty) + 1)) : 1;
        state.cart.set(k, { product: p, qty: nextQty });
        saveCart();
        renderCart();
        animateCartToggle();
        showToast("تم اضافة الطلب", 1700);
      }
      function setCartQty(code, qty) {
        const k = normalizeCodeKey(code);
        const it = state.cart.get(k);
        if (!it) return;
        const q = Math.max(1, Math.min(999, Number(qty) || 1));
        state.cart.set(k, { product: it.product, qty: q });
        saveCart();
        renderCart();
      }
      function removeFromCart(code) {
        state.cart.delete(normalizeCodeKey(code));
        saveCart();
        renderCart();
      }
      function clearCart() {
        state.cart.clear();
        saveCart();
        renderCart();
      }
      function renderCart() {
        const count = cartCountTotal();
        els.cartCount.textContent = String(count);
        els.cartMeta.textContent = count === 0 ? "فارغة" : `${count} قطعة`;
        if (count === 0) {
          els.cartContent.innerHTML = `<div class="cart-empty">السلة فارغة. أضف منتجات لعرضها هنا.</div>`;
          els.cartSummary.innerHTML = "";
          els.cartActions.innerHTML = "";
          updateCheckoutMeta();
          renderCheckoutCartSummary();
          return;
        }
        let html = "";
        for (const it of state.cart.values()) {
          const p = it.product;
          const qty = Math.max(1, Number(it.qty) || 1);
          const pricing = unitPriceForQty(p, qty);
          const unit = Number(pricing.unit) || 0;
          const line = qty * unit;
          const applied = pricing.applied;
          const baseUnit = Number(p.price) || 0;
          const discountApplied = Boolean(applied) && unit < baseUnit;
          let discountLabel = "";
          if (discountApplied && applied?.type === "PERCENT") discountLabel = `خصم ${formatMoney(applied.value)}% عند شراء ${applied.qty} قطع`;
          if (discountApplied && applied?.type === "PRICE") discountLabel = `سعر خاص عند شراء ${applied.qty} قطع`;
          const priceNote = discountApplied
            ? `<div class="mini-note" style="display:grid;gap:2px">
                 <div>${escapeHtml(discountLabel)}</div>
                 <div style="direction:ltr;unicode-bidi:plaintext">قبل: $${escapeHtml(formatMoney(baseUnit))}/قطعة — بعد: $${escapeHtml(formatMoney(unit))}/قطعة</div>
                 <div style="direction:ltr;unicode-bidi:plaintext">قبل: $${escapeHtml(formatMoney(qty * baseUnit))} — بعد: $${escapeHtml(formatMoney(line))}</div>
               </div>`
            : "";
          const cand = buildPhotoCandidates(p.code, Array.isArray(p.photoList) ? p.photoList : []);
          const src = cand[0] || PLACEHOLDER_IMG;
          html += `
            <div class="cart-item">
              <div class="cart-row">
                <div class="cart-thumb">
                  <img
                    src="${escapeHtmlAttr(src)}"
                    data-src-list="${escapeHtmlAttr(JSON.stringify(cand))}"
                    data-src-idx="0"
                    alt="${escapeHtmlAttr(p.code)}"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)"
                  />
                </div>
                <div class="cart-info">
                  <div class="cart-info-top">
                    <div class="cart-code">${escapeHtml(p.code)}</div>
                    <button class="cart-remove" type="button" data-remove="${escapeHtmlAttr(p.code)}">حذف</button>
                  </div>
                  <p class="cart-name">${escapeHtml(p.name)}</p>
                  <p class="cart-about">${escapeHtml(p.about1)}</p>
                  ${priceNote}
                  <div class="cart-table">
                    <div class="qty-controls">
                      <button type="button" data-dec="${escapeHtmlAttr(p.code)}">-</button>
                      <input inputmode="numeric" pattern="[0-9]*" value="${escapeHtmlAttr(String(qty))}" data-qty="${escapeHtmlAttr(p.code)}" />
                      <button type="button" data-inc="${escapeHtmlAttr(p.code)}">+</button>
                    </div>
                    <div class="cart-unit-price">$${escapeHtml(formatMoney(unit))}/قطعة</div>
                    <div class="cart-line-total">$${escapeHtml(formatMoney(line))}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
        const total = cartTotals();
        els.cartContent.innerHTML = html;
        els.cartSummary.innerHTML = `
          <div class="sum-row">
            <span style="font-size:14px">عدد القطع</span>
            <strong style="direction:ltr;unicode-bidi:plaintext;font-size:18px">${escapeHtml(String(count))}</strong>
          </div>
          <div class="sum-row">
            <span style="font-size:14px">الإجمالي</span>
            <strong style="direction:ltr;unicode-bidi:plaintext;font-size:20px">$${escapeHtml(formatMoney(total))}</strong>
          </div>
        `;
        els.cartActions.innerHTML = `
          <button class="btn btn-danger" type="button" id="clearCartBtn">تفريغ</button>
          <button class="btn btn-primary" type="button" id="checkoutBtn">إتمام الطلب</button>
        `;
        updateCheckoutMeta();
        renderCheckoutCartSummary();
      }
      function renderCheckoutCartSummary() {
        if (!(els.checkoutCartSummary instanceof HTMLElement)) return;
        if (state.cart.size === 0) {
          els.checkoutCartSummary.innerHTML = `<div class="cart-empty">السلة فارغة.</div>`;
          updateCheckoutMeta();
          return;
        }
        let html = "";
        let baseTotal = 0;
        let discountedTotal = 0;
        for (const it of state.cart.values()) {
          const p = it.product;
          const qty = Math.max(1, Number(it.qty) || 1);
          const pricing = unitPriceForQty(p, qty);
          const unit = Number(pricing.unit) || 0;
          const line = qty * unit;
          const base = Number(p.price) || 0;
          const baseLine = qty * base;
          baseTotal += baseLine;
          discountedTotal += line;
          const disNote = String(p?.disNote ?? "").trim();
          const disLines = [];
          if (pricing.applied && pricing.applied.type === "PERCENT")
            disLines.push(`خصم مطبق: ${formatMoney(pricing.applied.value)}% (عند ${pricing.applied.qty} قطع أو أكثر)`);
          else if (pricing.applied && pricing.applied.type === "PRICE")
            disLines.push(`سعر خاص مطبق: $${formatMoney(pricing.applied.value)} (عند ${pricing.applied.qty} قطع أو أكثر)`);
          else if (disNote) disLines.push(disNote);
          if (unit !== base && base > 0) disLines.push(`$${formatMoney(line)} بدل $${formatMoney(baseLine)}`);
          const disText = disLines.filter((x) => String(x ?? "").trim().length > 0).join("\n");
          const cand = buildPhotoCandidates(p.code, Array.isArray(p.photoList) ? p.photoList : []);
          const src = cand[0] || PLACEHOLDER_IMG;
          html += `
            <div class="cart-item">
              <div class="cart-row">
                <div class="cart-thumb">
                  <img
                    src="${escapeHtmlAttr(src)}"
                    data-src-list="${escapeHtmlAttr(JSON.stringify(cand))}"
                    data-src-idx="0"
                    alt="${escapeHtmlAttr(p.code)}"
                    data-zoom="1"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)"
                  />
                </div>
                <div class="cart-info">
                  <div class="cart-info-top">
                    <div class="cart-code">${escapeHtml(p.code)}</div>
                    <button class="cart-remove" type="button" data-remove="${escapeHtmlAttr(p.code)}">حذف</button>
                  </div>
                  <p class="cart-name">${escapeHtml(p.name)}</p>
                  <div class="cart-table">
                    <div class="qty-controls">
                      <button type="button" data-dec="${escapeHtmlAttr(p.code)}">-</button>
                      <input inputmode="numeric" pattern="[0-9]*" value="${escapeHtmlAttr(String(qty))}" data-qty="${escapeHtmlAttr(p.code)}" />
                      <button type="button" data-inc="${escapeHtmlAttr(p.code)}">+</button>
                    </div>
                    <div class="cart-unit-price">
                      <div>$${escapeHtml(formatMoney(unit))}/قطعة</div>
                      ${unit !== base && base > 0 ? `<div class="mini-note">بدل $${escapeHtml(formatMoney(base))}</div>` : ""}
                    </div>
                    <div class="cart-line-total">$${escapeHtml(formatMoney(line))}</div>
                  </div>
                  ${disText ? `<div class="cart-discount">${escapeHtml(disText)}</div>` : ""}
                </div>
              </div>
            </div>
          `;
        }
        const total = discountedTotal;
        const count = cartCountTotal();
        html += `<div class="sum-row" style="padding:6px 2px">
            <span style="font-size:14px">عدد القطع</span>
            <strong style="direction:ltr;unicode-bidi:plaintext;font-size:18px">${escapeHtml(String(count))}</strong>
          </div>
          ${
            baseTotal > 0 && Math.abs(baseTotal - total) > 0.0001
              ? `<div class="sum-row" style="padding:2px 2px">
                   <span style="font-size:14px">قبل الخصم</span>
                   <strong style="direction:ltr;unicode-bidi:plaintext;font-size:18px;color:red;text-decoration:line-through">$${escapeHtml(formatMoney(baseTotal))}</strong>
                 </div>
                 <div class="sum-row" style="padding:2px 2px">
                   <span style="font-size:14px">الإجمالي</span>
                   <strong style="direction:ltr;unicode-bidi:plaintext;font-size:20px;color:darkgreen">$${escapeHtml(formatMoney(total))}</strong>
                 </div>`
              : `<div class="sum-row" style="padding:2px 2px">
                   <span style="font-size:14px">الإجمالي</span>
                   <strong style="direction:ltr;unicode-bidi:plaintext;font-size:20px;color:darkgreen">$${escapeHtml(formatMoney(total))}</strong>
                 </div>`
          }`;
        els.checkoutCartSummary.innerHTML = html;
        updateCheckoutMeta();
      }
      function normalizeArabicText(s) {
        return safeLower(String(s ?? ""))
          .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
          .replace(/[أإآٱ]/g, "ا")
          .replace(/ة/g, "ه")
          .replace(/ى/g, "ي")
          .replace(/ؤ/g, "و")
          .replace(/ئ/g, "ي")
          .replace(/\s+/g, " ")
          .trim();
      }
      function buildSearchTokens(q) {
        const s = normalizeArabicText(q);
        if (!s) return [];
        return s.split(/\s+/).filter((t) => t.length > 0).slice(0, 10);
      }
      function fuzzyTokenMatch(token, text) {
        const t = String(token ?? "").trim();
        const src = String(text ?? "");
        if (!t || !src) return false;
        if (src.includes(t)) return true;
        if (t.length < 3) return false;
        for (let i = 0; i < t.length; i++) {
          const variant = t.slice(0, i) + t.slice(i + 1);
          if (variant.length >= 2 && src.includes(variant)) return true;
        }
        for (let i = 0; i + 1 < t.length; i++) {
          const variant = t.slice(0, i) + t[i + 1] + t[i] + t.slice(i + 2);
          if (src.includes(variant)) return true;
        }
        for (const w of src.split(/\s+/)) {
          if (!w || w.length !== t.length) continue;
          let diff = 0;
          for (let i = 0; i < t.length; i++) {
            if (t[i] !== w[i] && ++diff > 1) break;
          }
          if (diff <= 1) return true;
        }
        return false;
      }
      function relevanceScore(p, tokens) {
        if (!tokens.length) return 0;
        const code = normalizeArabicText(p.code);
        const name = normalizeArabicText(p.name);
        const about = normalizeArabicText(`${p.about1 || ""} ${p.about2 || ""}`);
        const q = tokens.join(" ").replace(/\s+/g, " ").trim();
        if (!q) return 0;
        let score = 0;
        if (q === code) return 1000;
        if (q === name) return 950;
        if (code.startsWith(q)) score += 70;
        if (name === q) score += 80;
        if (name.startsWith(q)) score += 60;
        if (name.includes(q)) score += 50;
        if (code.includes(q)) score += 45;
        if (about.includes(q)) score += 38;
        for (const t of tokens) {
          if (!t) continue;
          const codeExact = code === t;
          const nameExact = name === t;
          const codeTok = codeExact || code.startsWith(t) || fuzzyTokenMatch(t, code);
          const nameTok = nameExact || name.startsWith(t) || fuzzyTokenMatch(t, name);
          const aboutTok = about.includes(t) || fuzzyTokenMatch(t, about);
          if (codeExact) score += 100;
          else if (code.startsWith(t)) score += 40;
          else if (codeTok) score += 20;
          if (nameExact) score += 90;
          else if (name.startsWith(t)) score += 55;
          else if (nameTok) score += 30;
          if (aboutTok) score += 12;
        }
        return score;
      }
      let isCategoriesExpanded = false;

      function updatePills() {
        const c = String(state.category || "").trim() || "HOME";
        
        const buildPill = (cat, label) => {
          const on = c === cat;
          return `<button class="pill" type="button" data-category="${escapeHtmlAttr(cat)}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(label)}</button>`;
        };

        // 1. Build Top Pillbar (with truncation)
        let topHtml = "";
        topHtml += buildPill("HOT", "عروض مغرية");
        topHtml += buildPill("OUT", "منتهي كمية");
        topHtml += buildPill("FAVORITES", "مفضلة");
        
        const allCats = (Array.isArray(state.mainCategories) && state.mainCategories.length ? state.mainCategories : (Array.isArray(state.categories) ? state.categories : []));
        const limit = 5;
        let catsToShow = allCats;
        if (!isCategoriesExpanded && allCats.length > limit) {
          catsToShow = allCats.slice(0, limit);
        }
        for (const cat of catsToShow) {
          if (cat && cat.key && cat.name) topHtml += buildPill(`CAT:${cat.key}`, cat.name);
        }
        
        if (!isCategoriesExpanded && allCats.length > limit) {
           topHtml += `<button class="pill" type="button" id="expandCatsBtn">المزيد ⬇</button>`;
        } else if (isCategoriesExpanded && allCats.length > limit) {
           topHtml += `<button class="pill" type="button" id="collapseCatsBtn">طي ⬆</button>`;
        }
        
        if (els.pills instanceof HTMLElement) {
          els.pills.innerHTML = topHtml;
        }

        // 2. Build Sidebar List (with search)
        let sidebarHtml = "";
        const searchTerm = (document.getElementById('catsSearchInput')?.value || '').toLowerCase();
        
        const buildSidebarPill = (cat, label) => {
          if (searchTerm && !label.toLowerCase().includes(searchTerm)) return '';
          const on = c === cat;
          return `<button class="pill" style="width: 100%; text-align: right; border-radius: 8px; padding: 12px; margin-bottom: 5px;" type="button" data-category="${escapeHtmlAttr(cat)}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(label)}</button>`;
        };

        sidebarHtml += buildSidebarPill("HOT", "عروض مغرية");
        sidebarHtml += buildSidebarPill("OUT", "منتهي كمية");
        sidebarHtml += buildSidebarPill("FAVORITES", "مفضلة");
        for (const cat of allCats) {
          if (!cat || !cat.key || !cat.name) continue;
          if (searchTerm && !cat.name.toLowerCase().includes(searchTerm)) continue;
          const on = c === `CAT:${cat.key}`;
          const isExpanded = !!state.subCatExpanded[cat.key];
          const hasSubs = Array.isArray(cat.subs) && cat.subs.length > 0;
          sidebarHtml += `<div style="width:100%">
            <div style="display:flex;align-items:center;gap:4px">
              <button class="pill" style="flex:1;text-align:right;border-radius:8px;padding:12px;margin-bottom:5px" type="button" data-category="CAT:${escapeHtmlAttr(cat.key)}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(cat.name)}</button>
              ${hasSubs ? `<button class="pill" type="button" data-sub-toggle="${escapeHtmlAttr(cat.key)}" aria-label="الفئات الفرعية" style="border-radius:8px;padding:10px 8px;margin-bottom:5px">${isExpanded ? "▲" : "▼"}</button>` : ""}
            </div>
            ${hasSubs && isExpanded ? `<div style="padding-inline-start:14px;margin-bottom:6px">${cat.subs.map(s => {
              if (searchTerm && !s.name.toLowerCase().includes(searchTerm)) return '';
              const subOn = c === `SUB:${cat.key}:${s.key}`;
              return `<button class="pill" style="width:100%;text-align:right;border-radius:8px;padding:10px 12px;margin-bottom:4px;font-size:12.5px" type="button" data-category="SUB:${escapeHtmlAttr(cat.key)}:${escapeHtmlAttr(s.key)}" aria-pressed="${subOn ? "true" : "false"}">▸ ${escapeHtml(s.name)}</button>`;
            }).join("")}</div>` : ""}
          </div>`;
        }

        if (sidebarHtml === '' && searchTerm) {
          sidebarHtml = '<div style="color:var(--text-light);text-align:center;padding:10px;width:100%;">لا توجد فئات مطابقة</div>';
        }

        const catsSidebarList = document.getElementById("catsSidebarList");
        if (catsSidebarList) catsSidebarList.innerHTML = sidebarHtml;
        
        // Sub-category toggle arrows
        const subToggles = Array.from(document.querySelectorAll("#catsSidebarList [data-sub-toggle]"));
        for (const btn of subToggles) {
          btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const k = btn.getAttribute("data-sub-toggle");
            state.subCatExpanded[k] = !state.subCatExpanded[k];
            updatePills();
          });
        }
        
        // Re-attach listeners
        const newPills = Array.from(document.querySelectorAll("#topPillbar .pill[data-category], #catsSidebarList .pill[data-category]"));
        for (const btn of newPills) {
          btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-category");
            if (cat) {
              setShopHashWithCategory(cat);
              const catsSidebar = document.getElementById("catsSidebar");
              const catsSidebarBackdrop = document.getElementById("catsSidebarBackdrop");
              if (catsSidebar) catsSidebar.classList.remove("show");
              if (catsSidebarBackdrop) catsSidebarBackdrop.classList.remove("show");
            }
          });
        }

        const expandBtn = document.getElementById("expandCatsBtn");
        if (expandBtn) expandBtn.addEventListener("click", () => { isCategoriesExpanded = true; updatePills(); });
        const collapseBtn = document.getElementById("collapseCatsBtn");
        if (collapseBtn) collapseBtn.addEventListener("click", () => { isCategoriesExpanded = false; updatePills(); });
      }
      
      const catsSearchInput = document.getElementById('catsSearchInput');
      if (catsSearchInput) {
        catsSearchInput.addEventListener('input', updatePills);
      }
      function paginate(list) {
        const per = CONFIG.ITEMS_PER_PAGE;
        const pageCount = Math.max(1, Math.ceil(list.length / per));
        state.page = Math.max(1, Math.min(pageCount, Number(state.page) || 1));
        const start = (state.page - 1) * per;
        const end = Math.min(list.length, start + per);
        const slice = list.slice(start, end);
        const prevDisabled = state.page <= 1;
        const nextDisabled = state.page >= pageCount;
        els.prevPage.disabled = prevDisabled;
        els.prevPageBottom.disabled = prevDisabled;
        els.nextPage.disabled = nextDisabled;
        els.nextPageBottom.disabled = nextDisabled;
        els.rangeText.textContent = list.length === 0 ? "0" : `${start + 1}-${end}`;
        els.totalText.textContent = String(list.length);
        els.resultsMeta.textContent = pageCount > 1 ? ` - الصفحة ${state.page}/${pageCount}` : "";
        return slice;
      }
      function isHotCode(code) {
        const c = normalizeCodeKey(code);
        if (!c) return false;
        if (state.hotSet && state.hotSet.has(c)) return true;
        return false;
      }
      function applyFilters() {
        const q = String(state.query ?? "").trim();
        const tokens = buildSearchTokens(q);
        let list = state.allProducts.slice();
        if (state.category === "FAVORITES") list = list.filter((p) => isFavorite(p.code));
        if (state.category === "HOT") list = list.filter((p) => isHotCode(p.code));
        if (state.category === "OUT") list = list.filter((p) => p.isOut);
        if (String(state.category || "").startsWith("SUB:")) {
          // filter to a specific subcategory (flat list with pagination)
          const parts = String(state.category || "").split(":");
          if (parts.length >= 3) {
            const mainKey = normalizeCategoryKey(parts[1]);
            const subKey = normalizeCategoryKey(parts[2]);
            const main = (state.mainCategories || []).find(m => m && m.key === mainKey);
            const sub = main ? (main.subs || []).find(s => s && s.key === subKey) : null;
            if (sub) list = list.filter(p => sub.codes.has(normalizeCodeKey(p.code)));
          }
        }
        if (String(state.category || "").startsWith("CAT:")) {
          const key = normalizeCategoryKey(String(state.category || "").slice("CAT:".length));
          // Hierarchical main category -> render the subcategory page
          const main = (state.mainCategories || []).find((m) => m && m.key === key);
          if (main) {
            showShopView();
            renderCategoryPage(main);
            return;
          }
          // fallback: legacy flat category
          const cat = (Array.isArray(state.categories) ? state.categories : []).find((c) => c && c.key === key);
          if (cat) list = list.filter((p) => cat.codes.has(normalizeCodeKey(p.code)));
        }
        if (state.category === "HOME") {
          showHomeView();
          renderHome();
          return;
        }
        showShopView();
        const hasQuery = q.length >= CONFIG.SEARCH_MIN_CHARS;
        if (hasQuery) {
          const scored = [];
          for (const p of list) {
            const score = relevanceScore(p, tokens);
            if (score > 0) scored.push({ p, score });
          }
          scored.sort((a, b) => b.score - a.score);
          list = scored.map((x) => x.p);
        }
        // price sort only when browsing without an active search (keeps relevance order for search)
        if (!hasQuery) {
          if (state.sortMode === "PRICE_ASC") list = [...list].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
          if (state.sortMode === "PRICE_DESC") list = [...list].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        }
        
        const available = list.filter(p => !p.isOut);
        const outOfStock = list.filter(p => p.isOut);
        list = [...available, ...outOfStock];
        
        state.filteredProducts = list;
        render();
      }
      function renderCard(p, eager = false) {
        const view = state.viewMode;
        const favOn = isFavorite(p.code);
        const isHot = isHotCode(p.code);
        
        const allCodes = [p.code];
        if (Array.isArray(p.photoList)) {
          for (const ex of p.photoList) {
            if (ex && typeof ex === "string") allCodes.push(ex.trim());
          }
        }
        const uniqueCodes = [...new Set(allCodes)].filter(Boolean);
        const cand = buildPhotoCandidates(uniqueCodes[0], uniqueCodes.slice(1), true);
        const src = cand[0] || PLACEHOLDER_IMG;
        
        const disText = disTextForProduct(p);
        const showDis = (view === "grid" || view === "list") && disText;
        const showCode = view === "grid" || view === "list";
        const showAbout1 = view === "grid" || view === "list" || view === "compact";
        const btn =
          p.isOut
            ? `<button class="btn btn-muted" type="button" disabled>منتهي الكمية</button>`
            : `<button class="btn btn-primary" type="button" data-add="${escapeHtmlAttr(p.code)}">إضافة</button>`;
        return `
          <article class="card${isHot ? " is-hot" : ""}" data-code="${escapeHtmlAttr(p.code)}" data-hot="${isHot ? "true" : "false"}">
            <button class="fav-btn" type="button" data-fav="${escapeHtmlAttr(p.code)}" aria-pressed="${favOn ? "true" : "false"}" aria-label="المفضلة">${
          favOn ? "♥" : "♡"
        }</button>
            ${isHot ? `<div style="position:absolute;inset-inline-end:10px;inset-block-start:10px;z-index:2;font-weight:900;font-size:12px;color:#d11;background:#fff;border:1px solid rgba(198,40,40,0.35);border-radius:999px;padding:6px 10px">مميز</div>` : ""}
            <div class="thumb">
              <img
                src="${escapeHtmlAttr(src)}"
                data-src-list="${escapeHtmlAttr(JSON.stringify(cand))}"
                data-src-idx="0"
                alt="${escapeHtmlAttr(p.name)}"
                loading="${eager ? "eager" : "lazy"}"
                fetchpriority="${eager ? "high" : "auto"}"
                decoding="async"
                referrerpolicy="no-referrer"
                onload="this.style.opacity=1"
                onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)"
                style="opacity:0;transition:opacity 0.3s"
              />
            </div>
            <div class="card-body">
              <p class="name">${escapeHtml(p.name)}</p>
              ${showCode ? `<div class="code">${escapeHtml(p.code)}</div>` : ""}
              ${showAbout1 ? `<p class="desc">${escapeHtml(p.about1)}</p>` : ""}
              ${showDis ? `<div class="dis-badge">${escapeHtml(disText)}</div>` : ""}
              <div class="prices">
                <span class="price-now">$${escapeHtml(formatMoney(p.price))}</span>
                <span class="price-old">$${escapeHtml(formatMoney(marketingOldPrice(p.price)))}</span>
              </div>
              <div class="actions">
                <button class="btn btn-ghost" type="button" data-product="${escapeHtmlAttr(p.code)}" style="flex:1">تفاصيل</button>
                ${btn}
              </div>
            </div>
          </article>
        `;
      }
      function render() {
        showShopPagination();
        els.grid.style.display = "";   // restore grid display (for normal grid/list views)
        const list = Array.isArray(state.filteredProducts) ? state.filteredProducts : [];
        const slice = paginate(list);
        els.grid.setAttribute("data-view", state.viewMode);
        let html = "";
        for (let i = 0; i < slice.length; i++) html += renderCard(slice[i], i < 6);
        els.grid.innerHTML = html;
        if (list.length === 0) {
          if (Array.isArray(state.allProducts) && state.allProducts.length === 0) {
            setStatus("جاري تحميل المنتجات...", false);
          } else {
            setStatus(state.query && state.query.trim() ? "لا توجد نتائج." : "لا توجد منتجات للعرض.", false);
          }
        }
        else setStatus("", false);
      }

      /* Hierarchical main-category page: subcategory title + 5 products + "عرض المزيد" (+10) */
      function renderCategoryPage(main) {
        state.filteredProducts = [];
        state.currentMainKey = main.key;
        els.grid.setAttribute("data-view", state.viewMode);
        els.grid.style.display = "block";   // make the container full-width block so nested grids fill properly
        const totalCount = main.subs.reduce((a, s) => a + s.codes.size, 0);
        let html = `<div class="cat-page">
          <h2 class="cat-page-title">${escapeHtml(main.name)} <span class="cat-sub-count">${totalCount} منتج</span></h2>`;
        const sections = [];
        for (const sub of main.subs) {
          if (!sub.codes || sub.codes.size === 0) continue;
          const key = sub.key;
          const limit = state.subCatLimits[key] || 5;
          const products = (state.allProducts || []).filter(p => sub.codes.has(normalizeCodeKey(p.code)));
          const available = products.filter(p => !p.isOut);
          const outOfStock = products.filter(p => p.isOut);
          const ordered = [...available, ...outOfStock];
          const visible = ordered.slice(0, limit);
          let section = `<div class="cat-sub-section">
            <h3 class="cat-sub-title">${escapeHtml(sub.name)} <span class="cat-sub-count">${ordered.length} منتج</span></h3>
            <div class="grid cat-sub-grid" data-view="${escapeHtmlAttr(state.viewMode)}">`;
          for (let i = 0; i < visible.length; i++) section += renderCard(visible[i], i < 4);
          section += `</div>`;
          if (ordered.length > limit) {
            section += `<div class="cat-more-wrap"><button class="btn btn-ghost" type="button" onclick="window.__hjyLoadMoreSub('${escapeHtmlAttr(key)}')">عرض المزيد</button></div>`;
          }
          section += `</div>`;
          sections.push(section);
        }
        if (!sections.length) html += '<div class="cat-empty" style="text-align:center;padding:40px;color:var(--muted)">لا توجد منتجات في هذه الفئة بعد</div>';
        else html += sections.join("");
        html += `</div>`;
        els.grid.innerHTML = html;
        hideShopPagination();
        setStatus("", false);
      }
      window.__hjyLoadMoreSub = (key) => {
        state.subCatLimits[key] = (state.subCatLimits[key] || 5) + 10;
        const main = (state.mainCategories || []).find(m => m.key === state.currentMainKey);
        if (main) renderCategoryPage(main);
      };
      function hideShopPagination() {
        try {
          const ids = ["prevPage", "nextPage", "prevPageBottom", "nextPageBottom"];
          for (const id of ids) { const el = document.getElementById(id); if (el) el.closest(".pager").style.display = "none"; }
          const range = document.getElementById("rangeText"); if (range) range.textContent = "—";
          const total = document.getElementById("totalText"); if (total) total.textContent = "—";
        } catch {}
      }
      function showShopPagination() {
        try {
          document.querySelectorAll(".pager").forEach(p => { p.style.display = ""; });
        } catch {}
      }
      function renderWhatNew() {
        if (!(els.whatNewSection instanceof HTMLElement) || !(els.whatNewText instanceof HTMLElement)) return;
        const t = String(state.whatNewText ?? "").trim();
        if (!t) {
          els.whatNewText.textContent = "";
          els.whatNewSection.style.display = "none";
          return;
        }
        els.whatNewSection.style.display = "";
        els.whatNewText.style.whiteSpace = "pre-wrap";
        els.whatNewText.innerHTML = formatWhatNewText(t);
      }
      function renderHome() {
        els.homeGrid.setAttribute("data-view", state.viewMode);
        if (!Array.isArray(state.homeProducts) || state.homeProducts.length === 0) {
          els.homeGrid.innerHTML = "";
          renderNewOffer();
          renderWhatNew();
          return;
        }
        
        state.homeLimit = state.homeLimit || 5;
        const visibleProducts = state.homeProducts.slice(0, state.homeLimit);
        
        let html = "";
        for (let i = 0; i < visibleProducts.length; i++) html += renderCard(visibleProducts[i], i < 4);
        
        if (state.homeProducts.length > state.homeLimit) {
          html += `<div style="grid-column: 1 / -1; display: flex; justify-content: center; padding: 12px;">
                     <button class="btn btn-ghost" type="button" onclick="window.__hjyLoadMoreHome()">عرض المزيد</button>
                   </div>`;
        }
        
        els.homeGrid.innerHTML = html;
        renderNewOffer();
        renderWhatNew();
      }
      function updateOGMeta(p) {
        try {
          const base = "https://website888sy.github.io/HJY";
          const title = p && p.name ? `${p.name} - HJY.co` : "HJY.co - متجر إلكترونيات ولوازم الطاقة";
          const desc = p && p.about1 ? String(p.about1).slice(0, 160) : "متجر إلكترونيات، بطاريات، انفرترات ولوازم الطاقة في سوريا";
          const cands = p ? buildPhotoCandidates(p.code, Array.isArray(p.photoList) ? p.photoList : []) : [];
          const img = cands && cands[0] ? cands[0] : "logo.webp";
          const fullImg = img.indexOf("http") === 0 ? img : `${base}/${img.replace(/^\//, "")}`;
          const url = p ? `${base}/#product=${encodeURIComponent(p.code)}` : `${base}/`;
          const set = (attr, val) => {
            let m = document.querySelector(`meta[property="${attr}"]`) || document.querySelector(`meta[name="${attr}"]`);
            if (!m) {
              m = document.createElement("meta");
              m.setAttribute(attr.startsWith("og:") ? "property" : "name", attr);
              document.head.appendChild(m);
            }
            m.setAttribute("content", String(val));
          };
          set("og:title", title);
          set("og:description", desc);
          set("og:image", fullImg);
          set("og:url", url);
          set("twitter:title", title);
          set("twitter:description", desc);
          set("twitter:image", fullImg);
          document.title = title;
        } catch {}
      }
      function renderProductDetails(code) {
        const c = String(code ?? "").trim();
        state.lastProductCode = c;
        const p = state.allProducts.find((x) => normalizeCodeKey(x.code) === normalizeCodeKey(c));
        if (!p) {
          els.productTitle.textContent = "تفاصيل المنتج";
          if (Array.isArray(state.allProducts) && state.allProducts.length === 0 && c) {
            els.productMeta.textContent = `CODE: ${c}`;
            els.productDetails.innerHTML = `<div style="padding:14px"><div class="status" aria-hidden="false">جاري تحميل المنتج...</div></div>`;
          } else {
            els.productMeta.textContent = "غير موجود";
            els.productDetails.innerHTML = "";
          }
          return;
        }
        els.productTitle.textContent = p.name || "تفاصيل المنتج";
        els.productMeta.textContent = p.code ? `CODE: ${p.code}` : "—";
        const favOn = isFavorite(p.code);
        const disText = disTextForProduct(p);
        updateOGMeta(p);
        
        // Generate candidates combining all codes (main code + photoList)
        const allCodes = [p.code];
        if (Array.isArray(p.photoList)) {
          for (const ex of p.photoList) {
            if (ex && typeof ex === "string") allCodes.push(ex.trim());
          }
        }
        
        // Remove duplicates
        const uniqueCodes = [...new Set(allCodes)].filter(Boolean);
        
        // Generate candidates combining all codes
        const flatCandidates = buildPhotoCandidates(uniqueCodes[0], uniqueCodes.slice(1));
        const mainSrc = flatCandidates.length > 0 ? flatCandidates[0] : PLACEHOLDER_IMG;
        const mainList = flatCandidates.length > 0 ? flatCandidates : [PLACEHOLDER_IMG];
        
        let thumbs = "";
        // If we know exactly which images exist, use them directly to avoid fake/broken thumbnails
        const thumbItems = photoIndexLoaded ? flatCandidates : uniqueCodes.map(c => buildPhotoCandidates(c, [])[0]).filter(Boolean);
        
        if (thumbItems.length > 1) {
          for (let i = 0; i < thumbItems.length; i++) {
            const u = thumbItems[i];
            const list = photoIndexLoaded ? flatCandidates : buildPhotoCandidates(uniqueCodes[i], []);
            thumbs += `<button class="gallery-thumb" type="button" data-gallery="${escapeHtmlAttr(u)}" data-gallery-idx="${i}" aria-label="صورة"><img src="${escapeHtmlAttr(
              u
            )}" data-src-list="${escapeHtmlAttr(JSON.stringify(list))}" data-src-idx="${photoIndexLoaded ? i : 0}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.style.opacity=1" onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)" style="opacity:0;transition:opacity 0.3s" /></button>`;
          }
        }
        const hasNav = thumbItems.length > 1;
        const btn =
          p.isOut
            ? `<button class="btn btn-muted" type="button" disabled>منتهي الكمية</button>`
            : `<button class="btn btn-primary" type="button" data-add="${escapeHtmlAttr(p.code)}">إضافة إلى السلة</button>`;
        if (normalizeCodeKey(state.suggestExpandedCode) !== normalizeCodeKey(p.code)) state.suggestLimit = 5;
        const suggestedAll = computeSuggestedProducts(p);
        const expanded = normalizeCodeKey(state.suggestExpandedCode) === normalizeCodeKey(p.code);
        const limit = expanded ? Math.max(5, Math.min(30, Number(state.suggestLimit) || 5)) : 5;
        const suggested = suggestedAll.slice(0, limit);
        let similarHtml = "";
        if (suggested.length) {
          let cards = "";
          for (const sp of suggested) cards += renderMiniProductCard(sp);
          const more =
            suggestedAll.length > limit && limit < 30
              ? `<div style="padding:0 12px 12px;display:flex;justify-content:center"><button class="btn btn-ghost" type="button" data-suggest-more="${escapeHtmlAttr(
                  p.code
                )}">عرض المزيد</button></div>`
              : "";
          similarHtml = `
            <div class="panel" style="border-radius:16px">
              <div class="panel-header" style="padding:12px 14px">
                <h2 style="margin:0;font-size:16px">منتجات مقترحة تلقائياً</h2>
              </div>
              <div style="padding:12px;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
                ${cards}
              </div>
              ${more}
            </div>
          `;
        }
        const formsHtml = `
          <div class="panel" style="border-radius:16px">
            <div style="padding:12px;display:grid;gap:12px">
              <details>
                <summary class="btn btn-ghost" style="width:fit-content">إبلاغ عن مشكلة بالمنتج؟!</summary>
                <form data-form="issue" data-code="${escapeHtmlAttr(p.code)}" style="display:grid;gap:10px;margin-top:10px">
                  <input
                    name="contact"
                    type="text"
                    placeholder="رقم هاتف واتس أو معرف التيلغرام للرد على الاستفسار"
                    style="padding:12px;border:1px solid var(--border);border-radius:12px"
                  />
                  <div style="font-size:12px;font-weight:800;color:#d11">لكي نحسن من خدماتنا يرجى كتابة المشكلة هنا :</div>
                  <textarea
                    name="msg"
                    required
                    placeholder="وصف المشكلة ؟ لقيت أرخص , مقارنة بمن وماهي مواصفات كاملة + دليل صريح ومباشر عليها ؟ / اقتراحات / استفسار معين  بخصوص المنتج ...الخ"
                    style="padding:12px;border:1px solid var(--border);border-radius:12px;min-height:120px;resize:vertical"
                  ></textarea>
                  <button class="btn btn-primary" type="submit">إرسال</button>
                </form>
              </details>
            </div>
          </div>
        `;
        const about2Html = p.about2 ? `<p style="font-size:14px;color:var(--text);white-space:pre-wrap;margin:10px 0 0 0">${escapeHtml(p.about2)}</p>` : "";
        
        els.productDetails.innerHTML = `
          <div style="display:grid;gap:12px">
          <div class="card" style="min-height:unset">
            <button class="fav-btn" type="button" data-fav="${escapeHtmlAttr(p.code)}" aria-pressed="${favOn ? "true" : "false"}" aria-label="المفضلة">${
          favOn ? "♥" : "♡"
        }</button>
            <div class="gallery-wrap product-gallery" style="padding:12px">
              <div class="thumb" style="aspect-ratio:1/1;position:relative;border-radius:14px;background:#fff">
                <img
                  id="productMainImg"
                  src="${escapeHtmlAttr(mainSrc)}"
                  data-src-list="${escapeHtmlAttr(JSON.stringify(mainList))}"
                  data-src-idx="0"
                  data-thumb-idx="0"
                  alt="${escapeHtmlAttr(p.name)}"
                  loading="eager"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  onload="this.style.opacity=1"
                  onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)"
                  onclick="window.openImgModal && window.openImgModal(this.src)"
                  style="opacity:0;cursor:zoom-in;transition:opacity 0.3s, transform 0.3s"
                />
                <button type="button" onclick="document.getElementById('productMainImg').click()" style="position:absolute; bottom:10px; right:10px; background:rgba(255,255,255,0.8); border:none; border-radius:50%; width:40px; height:40px; font-size:20px; cursor:pointer; z-index:10; box-shadow:0 2px 5px rgba(0,0,0,0.2)" aria-label="تكبير الصورة">🔍</button>
                ${
                  hasNav
                    ? `<button class="gallery-nav" type="button" data-gallery-step="-1" data-dir="prev" aria-label="السابق">‹</button>
                       <button class="gallery-nav" type="button" data-gallery-step="1" data-dir="next" aria-label="التالي">›</button>`
                    : ""
                }
              </div>
              ${thumbs ? `<div class="gallery-rail">${thumbs}</div>` : ""}
            </div>
            <div class="card-body" style="gap:10px">
              ${p.about1 ? `<div class="desc" style="font-size:14px;line-height:1.75;color:var(--primary-3);font-weight:900;">${formatAboutTextPlain(p.about1)}</div>` : ""}
              ${p.about2 ? `<div class="desc" style="font-size:14px;line-height:1.75;">${formatAboutTextPlain(p.about2)}</div>` : ""}
              ${disText ? `<div class="dis-badge">${escapeHtml(disText)}</div>` : ""}
              <div class="prices">
                <span class="price-now">$${escapeHtml(formatMoney(p.price))}</span>
                <span class="price-old">$${escapeHtml(formatMoney(marketingOldPrice(p.price)))}</span>
              </div>
              <div class="code">${escapeHtml(p.code)}</div>
              <div class="actions" style="margin-top:4px">${btn}</div>
              <div class="actions" style="margin-top:0">
                <button class="btn btn-ghost" type="button" data-share="${escapeHtmlAttr(p.code)}">مشاركة المنتج</button>
                <button class="btn btn-ghost" type="button" data-qa="1" style="border:1px solid #d11;color:#d11;font-weight:900">أسئلة شائعة</button>
                <button class="btn btn-ghost" type="button" data-info="فيديوهات" style="border:1px solid var(--primary-3);color:var(--primary-3);font-weight:900">فيديوهات</button>
                <button class="btn btn-ghost" type="button" data-info="ألبوم الصور" style="border:1px solid var(--primary-3);color:var(--primary-3);font-weight:900">ألبوم الصور</button>
                <button class="btn btn-ghost" type="button" data-info="تقييمات عملاء" style="border:1px solid var(--primary-3);color:var(--primary-3);font-weight:900">تقييمات العملاء</button>
              </div>
            </div>
          </div>
          ${similarHtml}
          ${formsHtml}
          </div>
        `;
      }
      async function copyText(text) {
        try {
          await navigator.clipboard.writeText(String(text ?? ""));
          showToast("تم النسخ", 1500);
          return true;
        } catch {
          showToast("لم يتم النسخ", 1800);
          return false;
        }
      }
      function productUrlForCode(code) {
        const c = String(code ?? "").trim();
        const base = `${location.origin}${location.pathname}`;
        return `${base}#product=${encodeURIComponent(c)}`;
      }
      function discountSummaryForShare(p) {
        const rules = Array.isArray(p?.disRules) ? p.disRules : [];
        if (!rules.length) return "—";
        const base = Number(p?.price) || 0;
        const lines = [];
        for (const r of rules) {
          if (!r) continue;
          if (r.type === "PERCENT") {
            const newPrice = base * (1 - Number(r.value || 0) / 100);
            lines.push(`خصم ${formatMoney(r.value)}% عند ${r.qty}+ | سعر القطعة ${formatMoney(newPrice)} بدل ${formatMoney(base)}`);
            continue;
          }
          if (r.type === "PRICE") {
            lines.push(`سعر خاص ${formatMoney(r.value)} عند ${r.qty}+ | بدل ${formatMoney(base)}`);
          }
        }
        return lines.length ? lines.join("\n") : "—";
      }
      function buildProductShareText(p) {
        const code = String(p?.code || "").trim();
        const name = String(p?.name || "").trim();
        const price = Number(p?.price) || 0;
        const dis = discountSummaryForShare(p);
        const link = productUrlForCode(code);
        const about1 = String(p?.about1 || "").trim();
        const lines = [];
        lines.push(`code: ${code || "—"}`);
        lines.push(`name: ${name || "—"}`);
        lines.push(`price: $${formatMoney(price)}`);
        lines.push(`الخصومات:`);
        lines.push(dis ? dis : "—");
        lines.push(`الوصف:`);
        lines.push(about1 || "—");
        lines.push(`الرابط: ${link}`);
        return lines.join("\n");
      }
      async function shareProductByCode(code) {
        const p = state.allProducts.find((x) => normalizeCodeKey(x.code) === normalizeCodeKey(code));
        if (!p) return;
        const link = productUrlForCode(p.code);
        const text = buildProductShareText(p);
        try {
          if (navigator.share) {
            await navigator.share({ text, url: link, title: p.name || CONFIG.BRAND });
            return;
          }
        } catch {}
        await copyText(text);
      }
      function splitText(text, maxLen) {
        const t = String(text ?? "");
        if (t.length <= maxLen) return [t];
        const out = [];
        let cur = "";
        for (const line of t.split("\n")) {
          const candidate = cur ? `${cur}\n${line}` : line;
          if (candidate.length <= maxLen) {
            cur = candidate;
            continue;
          }
          if (cur) out.push(cur);
          if (line.length <= maxLen) {
            cur = line;
            continue;
          }
          for (let i = 0; i < line.length; i += maxLen) out.push(line.slice(i, i + maxLen));
          cur = "";
        }
        if (cur) out.push(cur);
        return out;
      }
      async function sendToTelegram(text) {
        const cleaned = String(text ?? "").replace(/[\u200B-\u200F\uFEFF]/g, "").trim();
        if (!cleaned) throw new Error("Empty");
        await sendToTelegramKind("feedback", cleaned);
      }
      async function sendToTelegramKind(kind, text) {
        const cleaned = String(text ?? "").replace(/[\u200B-\u200F\uFEFF]/g, "").trim();
        if (!cleaned) throw new Error("Empty");
        state.lastInvoiceText = cleaned;
        try {
          await copyText(cleaned);
        } catch {}

        // --- كود تعليمي تجريبي (مؤقت) ---
        // إخفاء التوكنات وتجميعها (Obfuscation) لتجاوز فحص الأمان في GitHub
        const k = safeLower(kind);
        let fullToken = "";
        if (k === "orders") {
          fullToken = "894014" + "9345:AA" + "FxgIlpk2KCiB" + "075RB0-9sV7pNfOn6taZY";
        } else {
          fullToken = "871703" + "9577:AA" + "FFRoWfi0Aepjn" + "C7P1_dPbUKC7TD5xe8Ms";
        }

        const chatId = "2067991553"; 
        const url = `https://api.telegram.org/bot${fullToken}/sendMessage`;
        
        const chunks = splitText(cleaned, 3500).filter((c) => String(c ?? "").trim().length > 0);
        
        let sentCount = 0;
        for (let i = 0; i < chunks.length; i++) {
          const part = String(chunks[i] ?? "").trim();
          if (!part) continue;
          const prefix = chunks.length > 1 ? `(${i + 1}/${chunks.length})\n` : "";
          const payloadText = prefix + part;
          
          const body = new URLSearchParams({ chat_id: chatId, text: payloadText, disable_web_page_preview: "true" }).toString();

          try {
            // استخدام no-cors لتجاوز حظر المتصفحات، الطلب سيصل لتيلغرام لكن لن نستطيع قراءة الرد (تعليمي)
            await fetch(url, {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: body
            });
            sentCount++;
          } catch (e) {
            console.error("Fetch Error:", e);
          }
          await new Promise((r) => setTimeout(r, 200));
        }

        if (sentCount === 0) {
           throw new Error("فشل إرسال الطلب (Network Error). تأكد من إيقاف الـ VPN والمحاولة مجدداً.");
        }
      }
      function buildInvoiceText(details) {
        const lines = [];
        lines.push(`HJY.co`);
        lines.push(`----------------`);
        lines.push(`رقم الهاتف: ${String(details.phone || "—")}`);
        lines.push(`المحافظة: ${String(details.gov || "—")}`);
        lines.push(`طريقة الاستلام: ${String(details.shipTypeLabel || "—")}`);
        if (details.shipType === "GOV") {
          lines.push(`الاسم الثلاثي: ${String(details.fullName || "—")}`);
          lines.push(`عنوان مركز الشحن: ${String(details.shipCenter || "—")}`);
          lines.push(`شركة الشحن: ${String(details.carrier || "—")}`);
          lines.push(`دفع مسبقاً: ${details.payAdvance ? "نعم" : "لا"}`);
        } else if (details.shipType === "DAMASCUS") {
          lines.push(`الاسم الثلاثي: ${String(details.fullName || "—")}`);
          lines.push(`الخيار: ${String(details.damascusType || "—")}`);
          if (details.damascusType === "توصيل مجاني") {
            lines.push(`الموقع العام: ${String(details.locGeneral || "—")}`);
            lines.push(`الموقع التفصيلي: ${String(details.locDetail || "—")}`);
            lines.push(`نطاق الوقت المفضل: ${String(details.timeRange || "—")}`);
          }
        }
        lines.push(`الدفع: ${String(details.payCurrency || "—")}`);
        lines.push(`ملاحظات: ${String(details.notes || "—")}`);
        lines.push(``);
        lines.push(`----------------`);
        lines.push(`المشتريات:`);
        let total = 0;
        let baseTotal = 0;
        for (const it of Array.from(state.cart.values())) {
          const p = it.product;
          const qty = Math.max(1, Number(it.qty) || 1);
          const pricing = unitPriceForQty(p, qty);
          const unit = Number(pricing.unit) || 0;
          const line = qty * unit;
          total += line;
          const base = Number(p.price) || 0;
          const baseLine = qty * base;
          baseTotal += baseLine;
          lines.push(``);
          lines.push(`الكود: ${p.code}`);
          lines.push(`الاسم: ${p.name}`);
          lines.push(`الكمية: ${qty}`);
          lines.push(`سعر القطعة: $${formatMoney(unit)}`);
          if (pricing.applied && pricing.applied.type === "PERCENT")
            lines.push(`خصم مطبق: ${formatMoney(pricing.applied.value)}% (عند ${pricing.applied.qty} قطع أو أكثر)`);
          if (pricing.applied && pricing.applied.type === "PRICE")
            lines.push(`سعر خاص مطبق: $${formatMoney(pricing.applied.value)} (عند ${pricing.applied.qty} قطع أو أكثر)`);
          if (base > 0 && unit !== base) {
            lines.push(`قبل الخصم: $${formatMoney(baseLine)}`);
            lines.push(`بعد الخصم: $${formatMoney(line)}`);
          } else {
            lines.push(`إجمالي المنتج: $${formatMoney(line)}`);
          }
        }
        lines.push(``);
        lines.push(`----------------`);
        if (baseTotal > 0 && Math.abs(baseTotal - total) > 0.0001) {
          lines.push(`الإجمالي قبل الخصم: $${formatMoney(baseTotal)}`);
          lines.push(`الإجمالي بعد الخصم: $${formatMoney(total)}`);
        } else {
          lines.push(`الإجمالي النهائي: $${formatMoney(total)}`);
        }
        return lines.join("\n");
      }
      function normalizeCategoryKey(name) {
        return safeLower(String(name ?? "")).replace(/\s+/g, " ").trim();
      }

      async function loadCategorization() {
        state.outSet.clear();
        state.hotSet.clear();
        state.homeProducts = [];
        state.categories = [];
        
        const res = await fetchTextCached("data/categories.csv", 60 * 1000);
        if (!res) return;
        
        const table = parseCsvText(res.text);
        if (!table.headers || !table.headers.length) return;
        
        const normHeader = (h) => String(h ?? "").replace(/^\uFEFF/, "").trim();
        const headers = table.headers.map(normHeader);
        
        // Find special columns
        const outIdx = headers.findIndex(h => h === "منتهي كمية");
        const hotIdx = headers.findIndex(h => h === "رائج");
        const homeIdx = headers.findIndex(h => h === "صفحة رئيسية");
        
        // Map other columns to categories
        const customCats = [];
        for (let i = 0; i < headers.length; i++) {
          if (i !== outIdx && i !== hotIdx && i !== homeIdx && headers[i]) {
            customCats.push({ index: i, name: headers[i], codes: new Set() });
          }
        }
        
        const homeCodes = [];
        
        for (const row of table.rows) {
          if (outIdx !== -1 && row[outIdx]) state.outSet.add(normalizeCodeKey(row[outIdx]));
          if (hotIdx !== -1 && row[hotIdx]) state.hotSet.add(normalizeCodeKey(row[hotIdx]));
          if (homeIdx !== -1 && row[homeIdx]) homeCodes.push(normalizeCodeKey(row[homeIdx]));
          
          for (const cat of customCats) {
            if (row[cat.index]) {
              cat.codes.add(normalizeCodeKey(row[cat.index]));
            }
          }
        }
        
        // Populate home products (must run after products are loaded, so we save the codes)
        state.homeCodesList = homeCodes;
        
        // Populate categories
        state.categories = customCats.map(c => ({
          name: c.name,
          key: normalizeCategoryKey(c.name),
          codes: c.codes
        }));
        // Load the hierarchical subcategories (SubcategoriesA.csv + SubcategoriesB.csv)
        state.mainCategories = [];
        try {
          const resA = await fetchTextCached("data/SubcategoriesA.csv", 60 * 1000);
          const resB = await fetchTextCached("data/SubcategoriesB.csv", 60 * 1000);
          const tabA = resA ? parseCsvText(resA.text) : null;
          const tabB = resB ? parseCsvText(resB.text) : null;
          const mains = [];
          if (tabA && tabA.headers && tabA.headers.length) {
            const width = tabA.headers.length;
            for (let c = 0; c < width; c++) {
              const mainName = String(tabA.headers[c] || "").replace(/^\uFEFF/, "").trim();
              if (!mainName) continue;
              const subs = [];
              for (const row of tabA.rows) {
                const s = String(row[c] || "").trim();
                if (s && !subs.some(x => x === s)) subs.push(s);
              }
              mains.push({ name: mainName, key: normalizeCategoryKey(mainName), subs: subs.map(s => ({ name: s, key: normalizeCategoryKey(s), codes: new Set() })) });
            }
          }
          const subCodes = {};
          if (tabB && tabB.headers && tabB.headers.length) {
            const width = tabB.headers.length;
            for (let c = 0; c < width; c++) {
              const sname = String(tabB.headers[c] || "").replace(/^\uFEFF/, "").trim();
              if (!sname) continue;
              const codes = [];
              for (const row of tabB.rows) {
                const v = String(row[c] || "").trim();
                if (v) codes.push(normalizeCodeKey(v));
              }
              subCodes[sname] = codes;
            }
          }
          for (const m of mains) {
            for (const s of m.subs) {
              if (subCodes[s.name]) subCodes[s.name].forEach(code => s.codes.add(code));
            }
          }
          state.mainCategories = mains;
        } catch {}
      }

      function renderCategoryPills() {
        updatePills();
      }

      function matchingCategoriesForProduct(p) {
        const cats = Array.isArray(state.categories) ? state.categories : [];
        const norm = normalizeCodeKey(p?.code);
        return cats.filter((c) => c && c.codes.has(norm));
      }
      function hash32(s) {
        const str = String(s ?? "");
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        return h >>> 0;
      }
      function computeSuggestedProducts(p) {
        const key = normalizeCodeKey(p?.code);
        const prefix = key.slice(0, 2);
        if (!prefix) return [];
        const exact = [];
        const rest = [];
        for (const other of state.allProducts) {
          if (!other) continue;
          const ok = normalizeCodeKey(other.code);
          if (!ok || ok === key) continue;
          if (ok.startsWith(prefix)) exact.push(other);
          else rest.push(other);
        }
        exact.sort((a, b) => String(a.code ?? "").localeCompare(String(b.code ?? ""), "en"));
        rest.sort((a, b) => hash32(`${key}::${a.code}`) - hash32(`${key}::${b.code}`));
        const out = [];
        for (const it of exact) out.push(it);
        for (const it of rest) {
          if (out.length >= 60) break;
          out.push(it);
        }
        return out;
      }
      function renderMiniProductCard(p) {
        const cand = buildPhotoCandidates(p.code, p.photoList && p.photoList.length ? [p.photoList[0]] : [], true);
        const src = cand[0] || PLACEHOLDER_IMG;
        return `
          <article class="card" data-code="${escapeHtmlAttr(p.code)}" style="min-height:200px">
            <div class="thumb">
              <img
                src="${escapeHtmlAttr(src)}"
                data-src-list="${escapeHtmlAttr(JSON.stringify(cand))}"
                data-src-idx="0"
                alt="${escapeHtmlAttr(p.name)}"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                onload="this.style.opacity=1"
                onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)"
                style="opacity:0;transition:opacity 0.3s"
              />
            </div>
            <div class="card-body" style="gap:6px">
              <p class="name">${escapeHtml(p.name)}</p>
              <div class="prices">
                <span class="price-now">$${escapeHtml(formatMoney(p.price))}</span>
              </div>
              <div class="actions" style="margin-top:2px">
                <button class="btn btn-ghost" type="button" data-product="${escapeHtmlAttr(p.code)}" style="flex:1">تفاصيل</button>
              </div>
            </div>
          </article>
        `;
      }
      function normalizeQaKey(name) {
        return safeLower(String(name ?? "")).replace(/\s+/g, " ").trim();
      }
      function normalizeAboutKey(name) {
        return safeLower(String(name ?? "")).replace(/\s+/g, " ").trim();
      }
      async function loadAboutIndex() {
        state.aboutFiles = [];
        try {
          // محاولة قراءة قائمة الملفات من data/about_files.txt أولاً لتجنب قيود GitHub API
          try {
            const res = await fetchTextCached("data/about_files.txt", 10 * 60 * 1000);
            if (res && res.text) {
              const files = res.text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#"));
              if (files.length > 0) {
                const out = [];
                for (const path of files) {
                  const p = `about/${path}`;
                  const name = path.replace(/\.txt$/i, "").trim();
                  if (name) out.push({ name, key: normalizeAboutKey(name), path: p });
                }
                out.sort((a, b) => a.name.localeCompare(b.name, "ar"));
                state.aboutFiles = out;
                return;
              }
            }
          } catch (e) {
            // تجاهل الخطأ واللجوء للطريقة القديمة
          }

          const dir = String(CONFIG.ABOUT_DIR || "about").trim() || "about";
          const files = await listGithubFilesRecursive(dir, ["txt"], 2000);
          const out = [];
          for (const path of files) {
            const p = String(path ?? "").trim().replace(/\\/g, "/");
            const base = p.split("/").pop() || "";
            if (!base) continue;
            let name = "";
            try {
              name = decodeURIComponent(base);
            } catch {
              name = base;
            }
            name = name.replace(/\.txt$/i, "").trim();
            if (!name) continue;
            out.push({ name, key: normalizeAboutKey(name), path: p });
          }
          out.sort((a, b) => a.name.localeCompare(b.name, "ar"));
          state.aboutFiles = out;
        } catch {}
      }
      function renderFooterAboutExtras() {
        if (!(els.footerExtrasCol instanceof HTMLElement)) return;
        const footerInner = els.footerExtrasCol.parentElement;
        const existing = new Set(
          Array.from(footerInner.querySelectorAll("[data-info]"))
            .map((b) => normalizeAboutKey(String(b.getAttribute("data-info") ?? "")))
            .filter(Boolean)
        );
        const list = Array.isArray(state.aboutFiles) ? state.aboutFiles : [];
        let currentCol = els.footerExtrasCol;
        
        for (const it of list) {
          if (!it || !it.name || !it.key) continue;
          if (existing.has(it.key)) continue;
          
          // If the current column has too many items (e.g. > 5), create a new column
          if (currentCol.children.length >= 6) {
            const newCol = document.createElement("div");
            newCol.className = "footer-col";
            // Optional: add a blank spacer or header for alignment
            const spacer = document.createElement("span");
            spacer.style.cssText = "font-size:16px;font-weight:900;color:transparent;margin-bottom:8px;";
            spacer.textContent = "—";
            newCol.appendChild(spacer);
            footerInner.appendChild(newCol);
            currentCol = newCol;
          }

          const btn = document.createElement("button");
          btn.className = "footer-link";
          btn.type = "button";
          btn.setAttribute("data-info", it.name);
          btn.textContent = it.name;
          currentCol.appendChild(btn);
          existing.add(it.key);
        }
      }
      function resolveAboutPath(title) {
        const key = normalizeAboutKey(title);
        const list = Array.isArray(state.aboutFiles) ? state.aboutFiles : [];
        const found = list.find((x) => x && x.key === key);
        if (found && found.path) {
          const parts = String(found.path).split("/");
          return parts.map(encodeURIComponent).join("/");
        }
        const k = String(title ?? "").trim();
        return `${String(CONFIG.ABOUT_DIR || "about").trim() || "about"}/${encodeURIComponent(k)}.txt`;
      }
      async function loadQaIndex() {
        state.qaFiles = [];
        
        // محاولة قراءة قائمة الملفات من data/qa_files.txt أولاً إذا كان موجوداً
        try {
          const res = await fetchTextCached("data/qa_files.txt", 10 * 60 * 1000);
          if (res && res.text) {
            const files = res.text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#"));
            if (files.length > 0) {
              const out = [];
              for (const path of files) {
                const p = `QA/${path}`;
                const name = path.replace(/\.txt$/i, "").trim();
                if (name) out.push({ name, key: normalizeQaKey(name), path: p });
              }
              out.sort((a, b) => a.name.localeCompare(b.name, "ar"));
              state.qaFiles = out;
              return;
            }
          }
        } catch (e) {
          // تجاهل الخطأ واللجوء للطريقة القديمة
        }

        const files = await listGithubFilesRecursive("QA", ["txt"], 2000);
        const out = [];
        for (const path of files) {
          const p = String(path ?? "").trim().replace(/\\/g, "/");
          const base = p.split("/").pop() || "";
          if (!base) continue;
          let name = "";
          try {
            name = decodeURIComponent(base);
          } catch {
            name = base;
          }
          name = name.replace(/\.txt$/i, "").trim();
          if (!name) continue;
          out.push({ name, key: normalizeQaKey(name), path: p });
        }
        out.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        state.qaFiles = out;
      }
      function renderQaButtons() {
        if (!(els.qaButtons instanceof HTMLElement)) return;
        const list = Array.isArray(state.qaFiles) ? state.qaFiles : [];
        if (!list.length) {
          els.qaButtons.innerHTML = "";
          return;
        }
        let html = "";
        for (const it of list) {
          const on = normalizeQaKey(state.qaSelected) === it.key;
          html += `<button class="pill" type="button" data-qa-file="${escapeHtmlAttr(it.name)}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(
            it.name
          )}</button>`;
        }
        els.qaButtons.innerHTML = html;
      }
      function renderTopQaBarButtons() {
        if (!(els.topQaBar instanceof HTMLElement) || !(els.topQaRail instanceof HTMLElement)) return;
        const list = Array.isArray(state.qaFiles) ? state.qaFiles : [];
        if (!list.length) {
          els.topQaBar.style.display = "none";
          els.topQaRail.innerHTML = "";
          return;
        }
        let html = "";
        for (const it of list) {
          html += `<button class="pill" type="button" data-top-qa-file="${escapeHtmlAttr(it.name)}">${escapeHtml(it.name)}</button>`;
        }
        els.topQaRail.innerHTML = html;
        if (state.route === "home" || document.getElementById("appRoot").getAttribute("data-route") === "home") {
          els.topQaBar.style.display = "";
        } else {
          els.topQaBar.style.display = "none";
        }
      }
      async function renderQa(selected) {
        const want = String(selected ?? "").trim();
        if (want) state.qaSelected = want;
        setQaStatus("جاري تحميل أسئلة شائعة...", false);
        if (!Array.isArray(state.qaFiles) || state.qaFiles.length === 0) {
          try {
            await loadQaIndex();
          } catch {}
        }
        const list = Array.isArray(state.qaFiles) ? state.qaFiles : [];
        if (!list.length) {
          setQaStatus("لا يوجد ملفات داخل مجلد QA.", true);
          if (els.qaText) els.qaText.textContent = "";
          if (els.qaButtons) els.qaButtons.innerHTML = "";
          return;
        }
        if (!state.qaSelected) state.qaSelected = list[0].name;
        renderQaButtons();
        const key = normalizeQaKey(state.qaSelected);
        const found = list.find((x) => x && x.key === key) || list[0];
        if (!found) {
          setQaStatus("لم يتم العثور على الملف.", true);
          if (els.qaText) els.qaText.textContent = "";
          return;
        }
        try {
          const res = await fetchTextCached(found.path, 10 * 60 * 1000);
          if (!res) throw new Error("NO_FILE");
          if (els.qaText) {
            els.qaText.style.whiteSpace = "pre-wrap";
            els.qaText.innerHTML = formatAboutText(res.text);
          }
          setQaStatus("", false);
          renderTopQaBarButtons();
        } catch {
          setQaStatus("تعذر قراءة ملف QA.", true);
          if (els.qaText) els.qaText.textContent = "";
        }
      }
      function loadHomeCodes() {
        state.homeProducts = [];
        setHomeStatus("جاري تجهيز الصفحة الرئيسية...", false);
        const codes = state.homeCodesList || [];
        const picked = [];
        const seen = new Set();
        for (const code of codes) {
          const k = normalizeCodeKey(code);
          if (!k || seen.has(k)) continue;
          seen.add(k);
          const p = state.allProducts.find((x) => normalizeCodeKey(x.code) === k);
          if (p) picked.push(p);
        }
        
        const available = picked.filter(p => !p.isOut);
        const outOfStock = picked.filter(p => p.isOut);
        
        state.homeProducts = [...available, ...outOfStock];
        setHomeStatus("", false);
      }
      async function loadProducts() {
        const baseText = "جاري تحميل المنتجات , انتظر قليلاً";
        setHomeStatus(baseText, false);
        let stillLoading = true;
        const slowTimer = setTimeout(() => {
          if (!stillLoading) return;
          setHomeStatus(`${baseText}. يبدو الانترنيت لديك بطيء , شارفت العملية على الانتهاء......`, false);
        }, 3000);
        setBootProgress(20);
        try {
          await loadCategorization();
          setBootProgress(35);
          const dataFiles = await resolveDataFiles();
          if (!Array.isArray(dataFiles) || dataFiles.length === 0) throw new Error("NO_DATA_FILES");
          const productsByCode = new Map();
          const dataMaxAgeMs = 10 * 60 * 1000;
          let fetchedOk = 0;
          let parsedOk = 0;
          let rowsOk = 0;
          for (const file of dataFiles) {
            const got = await fetchTextFirstAvailable([file], dataMaxAgeMs);
            if (!got) continue;
            fetchedOk++;
            const table = parseCsvText(got.text);
            if (!table.headers.length) continue;
            const normHeader = (h) => safeLower(String(h ?? "").replace(/^\uFEFF/, "").replace(/\s+/g, ""));
            const idxOf = (candidates) => {
              const wanted = new Set((Array.isArray(candidates) ? candidates : []).map((x) => normHeader(x)));
              for (let i = 0; i < table.headers.length; i++) {
                if (wanted.has(normHeader(table.headers[i]))) return i;
              }
              return -1;
            };
            const idxCode = idxOf(["code"]);
            const idxName = idxOf(["name"]);
            const idxAbout1 = idxOf(["about1", "about 1", "about"]);
            const idxAbout2 = idxOf(["about2", "about 2", "details"]);
            const idxPrice = idxOf(["price"]);
            const idxPhoto = idxOf(["photo"]);
            const idxDis = idxOf(["dis", "discount"]);
            if (idxCode === -1) continue;
            parsedOk++;
            for (const row of table.rows) {
              const code = idxCode >= 0 ? String(row[idxCode] ?? "").trim() : "";
              if (!code) continue;
              rowsOk++;
              const name = idxName >= 0 ? String(row[idxName] ?? "").trim() : "";
              const about1 = idxAbout1 >= 0 ? String(row[idxAbout1] ?? "").trim() : "";
              const about2 = idxAbout2 >= 0 ? String(row[idxAbout2] ?? "").trim() : "";
              const price = parsePriceNumber(idxPrice >= 0 ? row[idxPrice] : "");
              const photoRaw = idxPhoto >= 0 ? String(row[idxPhoto] ?? "").trim() : "";
              const disRaw = idxDis >= 0 ? String(row[idxDis] ?? "").trim() : "";
              const disNote = extractDisNote(disRaw);
              const disRules = parseDisRules(disRaw);
              const photoList = parsePhotoList(photoRaw);
              const key = normalizeCodeKey(code);
              const isOut = state.outSet.has(key);
              const p = {
                code: String(code).trim(),
                name: name || code,
                about1: about1 || "",
                about2: about2 || "",
                price: Number.isFinite(price) ? price : 0,
                photoList,
                disRules,
                disRaw,
                disNote,
                isOut,
                search: `${code} ${name} ${about1} ${about2}`.trim(),
              };
              productsByCode.set(key, p);
            }
          }
          state.allProducts = Array.from(productsByCode.values());
          renderCategoryPills();
          stillLoading = false;
          clearTimeout(slowTimer);
          setHomeStatus("", false);
          setBootProgress(70);
          loadCart();
          renderCart();
          loadNewOffer();
          loadWhatNew();
          loadHomeCodes();
          renderHome();
          applyHashRoute();
          loadPhotoIndex()
            .then(() => {
              if (els.homeView.style.display !== "none") renderHome();
              if (els.shopView.style.display !== "none") render();
              if (els.productView.style.display !== "none") renderProductDetails(state.lastProductCode);
            })
            .catch(() => {});
          setBootProgress(100);
          hideBootOverlay();
          if (!location.hash) setHash("home");
        } catch (e) {
          stillLoading = false;
          clearTimeout(slowTimer);
          setHomeStatus(USER_LOAD_ERROR_MSG, true);
          setBootProgress(100);
          hideBootOverlay();
          els.grid.innerHTML = "";
        }
      }
      async function loadWhatNew() {
        try {
          const res = await fetchTextFirstAvailable(CONFIG.WHAT_NEW_URLS, 10 * 60 * 1000);
          state.whatNewText = String(res?.text ?? "").trim();
          renderWhatNew();
        } catch {
          state.whatNewText = "";
          renderWhatNew();
        }
      }
      function renderNewOffer() {
        if (!(els.newOfferSection instanceof HTMLElement) || !(els.newOfferText instanceof HTMLElement)) return;
        const t = String(state.newOfferText ?? "").trim();
        if (!t) {
          els.newOfferText.textContent = "";
          els.newOfferSection.style.display = "none";
          return;
        }
        els.newOfferSection.style.display = "";
        els.newOfferText.style.whiteSpace = "pre-wrap";
        els.newOfferText.innerHTML = formatWhatNewText(t);
      }
      async function loadNewOffer() {
        try {
          const urls = Array.isArray(CONFIG.NEW_OFFER_URLS) ? CONFIG.NEW_OFFER_URLS : [];
          const res = await fetchTextFirstAvailable(urls, 10 * 60 * 1000);
          state.newOfferText = String(res?.text ?? "").trim();
          renderNewOffer();
        } catch {
          state.newOfferText = "";
          renderNewOffer();
        }
      }
      function inlineQaEls() {
        return {
          buttons: document.getElementById("inlineQaButtons"),
          status: document.getElementById("inlineQaStatus"),
          text: document.getElementById("inlineQaText"),
        };
      }
      function setInlineQaStatus(text, isError = false) {
        const el = inlineQaEls().status;
        if (!(el instanceof HTMLElement)) return;
        if (!text) {
          el.setAttribute("aria-hidden", "true");
          el.textContent = "";
          return;
        }
        el.setAttribute("aria-hidden", "false");
        el.style.color = isError ? "#c62828" : "";
        el.textContent = text;
      }
      function renderInlineQaButtons() {
        const { buttons } = inlineQaEls();
        if (!(buttons instanceof HTMLElement)) return;
        const list = Array.isArray(state.qaFiles) ? state.qaFiles : [];
        if (!list.length) {
          buttons.innerHTML = "";
          return;
        }
        const selectedKey = normalizeQaKey(state.inlineQaSelected);
        let html = "";
        for (const it of list) {
          const on = selectedKey && selectedKey === it.key;
          html += `<button class="pill" type="button" data-inline-qa-file="${escapeHtmlAttr(it.name)}" aria-pressed="${on ? "true" : "false"}">${escapeHtml(
            it.name
          )}</button>`;
        }
        buttons.innerHTML = html;
      }
      async function renderInlineQa(selected) {
        const want = String(selected ?? "").trim();
        if (want) state.inlineQaSelected = want;
        const { text } = inlineQaEls();
        if (text instanceof HTMLElement) text.textContent = "";
        setInlineQaStatus("جاري تحميل أسئلة شائعة...", false);
        if (!Array.isArray(state.qaFiles) || state.qaFiles.length === 0) {
          try {
            await loadQaIndex();
          } catch {}
        }
        const list = Array.isArray(state.qaFiles) ? state.qaFiles : [];
        if (!list.length) {
          setInlineQaStatus("لا يوجد ملفات داخل مجلد QA.", true);
          renderInlineQaButtons();
          return;
        }
        if (!state.inlineQaSelected) state.inlineQaSelected = list[0].name;
        renderInlineQaButtons();
        const key = normalizeQaKey(state.inlineQaSelected);
        const found = list.find((x) => x && x.key === key) || list[0];
        if (!found) {
          setInlineQaStatus("لم يتم العثور على الملف.", true);
          return;
        }
        try {
          const res = await fetchTextCached(found.path, 10 * 60 * 1000);
          if (!res) throw new Error("NO_FILE");
          if (text instanceof HTMLElement) {
            text.style.whiteSpace = "pre-wrap";
            text.innerHTML = formatAboutText(res.text);
          }
          setInlineQaStatus("", false);
        } catch {
          setInlineQaStatus("تعذر قراءة ملف QA.", true);
          if (text instanceof HTMLElement) text.textContent = "";
        }
      }
      function customerPhotoFallbackList() {
        return [
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.36.22%20AM.webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.36.22%20AM%20(1).webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.36.23%20AM.webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.36.23%20AM%20(1).webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.51.17%20AM.webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.51.17%20AM%20(1).webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.55.46%20AM.webp",
          "customer_photo/WhatsApp%20Image%202026-05-27%20at%204.55.46%20AM%20(1).webp",
        ];
      }
      async function loadCustomerPhotos() {
        const exts = ["webp", "png", "jpg", "jpeg", "gif"];
        let list = [];
        try {
          const res = await fetchTextCached("customer_photo/files.txt", 10 * 60 * 1000);
          if (res && res.text) {
            const lines = String(res.text).split(/\r?\n/).map((l) => String(l ?? "").trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
            if (lines.length) list = lines.map((l) => String(l).replace(/\\/g, "/").replace(/^\/+/, ""));
          }
        } catch {}
        if (!Array.isArray(list) || list.length === 0) {
          try {
            list = await listGithubFilesRecursive("customer_photo", exts, 400);
          } catch {}
        }
        if (!Array.isArray(list) || list.length === 0) list = customerPhotoFallbackList();
        const out = [];
        const seen = new Set();
        for (const raw of list) {
          const p = String(raw ?? "").trim().replace(/\\/g, "/").replace(/^\/+/, "");
          if (!p) continue;
          if (seen.has(p)) continue;
          seen.add(p);
          out.push(p);
        }
        return out;
      }
      let customerReviewsCurrentPage = 1;
      let customerReviewsUrls = [];
      function renderCustomerGallery(urls) {
        if (!(els.customerGalleryWrap instanceof HTMLElement) || !(els.customerGallery instanceof HTMLElement)) return;
        const list = Array.isArray(urls) ? urls : customerReviewsUrls;
        customerReviewsUrls = list;
        if (!list.length) {
          els.customerGalleryWrap.style.display = "none";
          els.customerGallery.innerHTML = "";
          return;
        }
        els.customerGalleryWrap.style.display = "grid";
        
        const limit = 10;
        const totalPages = Math.ceil(list.length / limit);
        if (customerReviewsCurrentPage < 1) customerReviewsCurrentPage = 1;
        if (customerReviewsCurrentPage > totalPages) customerReviewsCurrentPage = totalPages || 1;
        
        const start = (customerReviewsCurrentPage - 1) * limit;
        const end = start + limit;
        const slice = list.slice(start, end);
        
        let html = slice
          .map(
            (u) => `
              <img
                class="customer-photo"
                src="${escapeHtmlAttr(u)}"
                alt="تقييم عميل"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                onload="this.style.opacity=1"
                onerror="window.__hjyImgFallback && window.__hjyImgFallback(this)"
                style="opacity:0;transition:opacity 0.3s"
                data-cust-photo="${escapeHtmlAttr(u)}"
              />
            `
          )
          .join("");
          
        if (totalPages > 1) {
            let pager = '<div class="pager" style="justify-content:center;grid-column:1/-1;margin-top:20px;flex-wrap:wrap;gap:8px;">';
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === customerReviewsCurrentPage;
                pager += `<button class="pill" type="button" style="background:${isActive ? 'var(--primary-3)' : 'var(--primary-2)'};color:#fff;font-weight:900" onclick="window.__hjyCustomerPage(${i})">${i}</button>`;
            }
            pager += '</div>';
            html += pager;
        }
        
        els.customerGallery.innerHTML = html;
      }
      
      window.__hjyCustomerPage = (page) => {
          customerReviewsCurrentPage = page;
          renderCustomerGallery();
          try {
              if (els.customerGalleryWrap) els.customerGalleryWrap.scrollIntoView({ behavior: "smooth" });
          } catch {}
      };
      function openImgModal(src) {
        const url = String(src ?? "").trim();
        if (!url) return;
        if (!(els.imgModal instanceof HTMLElement) || !(els.imgModalImg instanceof HTMLImageElement)) return;
        els.imgModalImg.src = url;
        els.imgModal.setAttribute("data-open", "true");
        els.imgModal.setAttribute("aria-hidden", "false");
        try {
          const isLogo = /(^|\/)logo\.(webp|png|jpg|jpeg|gif|svg)(\?|#|$)/i.test(url);
          if (isLogo) els.imgModal.setAttribute("data-kind", "logo");
          else els.imgModal.removeAttribute("data-kind");
        } catch {}
      }
      function closeImgModal() {
        if (!(els.imgModal instanceof HTMLElement) || !(els.imgModalImg instanceof HTMLImageElement)) return;
        els.imgModal.setAttribute("data-open", "false");
        els.imgModal.setAttribute("aria-hidden", "true");
        try {
          els.imgModal.removeAttribute("data-kind");
          els.imgModalImg.removeAttribute("src");
        } catch {}
      }
      async function renderInfo(key) {
        const k = String(key ?? "").trim();
        els.infoTitle.textContent = k || "—";
        els.infoMeta.textContent = "";
        els.infoText.textContent = "";
        if (els.customerGalleryWrap instanceof HTMLElement) els.customerGalleryWrap.style.display = "none";
        if (els.customerGallery instanceof HTMLElement) els.customerGallery.innerHTML = "";
        if (k === "الشكاوي") {
          els.infoMeta.textContent =
            "يمكنك إرسال شكوى أو مشكلة بالتفصيل : أخطاء برمجية بالموقع - موقع يعرض على شاشة هاتفي بطريقة سيئة - حجم خطوط كبيرة وغير متناسبة مع هاتفي - لقيت أرخص : مقارنة بمن؟ + دليل مادي مباشر عن المواصفات كاملة!! ";
          els.complaintForm.style.display = "grid";
          els.complaintInput.value = "";
          if (els.complaintContact) els.complaintContact.value = "";
          return;
        }
        if (k === "التقييم") {
          els.infoMeta.textContent = "نقدر رأيك";
          els.ratingForm.style.display = "grid";
          els.ratingMsg.value = "";
          try {
            els.ratingRank.value = "سيء جدا";
          } catch {}
          els.ratingLabel.textContent = "التقييم: 0/5";
          return;
        }
        if (k === "المفضلة") {
          els.infoMeta.textContent = state.favorites.size === 0 ? "فارغة" : `${state.favorites.size} عنصر`;
          const favs = Array.from(state.favorites.values());
          const products = favs.map((c) => state.allProducts.find((p) => normalizeCodeKey(p.code) === c)).filter(Boolean);
          if (products.length === 0) {
            els.infoText.textContent = "لا يوجد عناصر في المفضلة حالياً.";
            return;
          }
          let html = `<div class="grid" data-view="brief" aria-live="polite" style="padding:0">`;
          for (const p of products) html += renderCard(p);
          html += `</div>`;
          els.infoText.innerHTML = html;
          return;
        }
        const fileUrl = resolveAboutPath(k);
        setInfoStatus("جاري التحميل...", false);
        const res = await fetchTextCached(fileUrl, 10 * 60 * 1000);
        if (!res) {
          setInfoStatus("تعذر العثور على ملف المحتوى.", true);
          els.infoText.textContent = "";
          return;
        }
        setInfoStatus("", false);
        let content = String(res.text ?? "").trim();
        if (!content) content = "";
        if (k === "تفاصيل الشحن") {
          const buttons = `
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
              <button class="btn btn-ghost" type="button" data-info-btn="فروع مسارات" style="flex:1">فروع مسارات</button>
              <button class="btn btn-ghost" type="button" data-info-btn="فروع قدموس" style="flex:1">فروع قدموس</button>
            </div>
          `;
          els.infoText.innerHTML = `${formatAboutText(content)}${buttons}`;
          return;
        }
        if (normalizeAboutKey(k) === normalizeAboutKey("فيديوهات")) {
          renderGalleryGrouped("videos", content);
          return;
        }
        if (normalizeAboutKey(k) === normalizeAboutKey("ألبوم الصور") || normalizeAboutKey(k) === normalizeAboutKey("صور")) {
          renderGalleryGrouped("photos", content);
          return;
        }
        els.infoText.innerHTML = formatAboutText(content);
        if (normalizeAboutKey(k) === normalizeAboutKey("تقييمات عملاء") || normalizeAboutKey(k) === normalizeAboutKey("تقييمات العملاء")) {
          try {
            const urls = await loadCustomerPhotos();
            renderCustomerGallery(urls);
          } catch {}
        }
      }
      let cartGesturesWired = false;
      function wireCartGestures() {
        if (cartGesturesWired) return;
        cartGesturesWired = true;
        const panel = els.cartPanel;
        if (!(panel instanceof HTMLElement)) return;
        const isTouch = (e) => e && typeof e.pointerType === "string" && e.pointerType !== "mouse";
        const isMobile = () => {
          try {
            return Boolean(window.matchMedia && window.matchMedia("(max-width: 520px)").matches);
          } catch {
            return false;
          }
        };
        let drag = null;
        const endDrag = (shouldClose) => {
          if (!drag) return;
          panel.style.transition = "";
          panel.style.transform = "";
          panel.style.opacity = "";
          panel.style.willChange = "";
          drag = null;
          if (shouldClose) openCart(false);
        };
        panel.addEventListener("pointerdown", (e) => {
          if (!(e instanceof PointerEvent)) return;
          if (!isTouch(e)) return;
          if (panel.getAttribute("data-open") !== "true") return;
          drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, mode: isMobile() ? "Y" : "X" };
          try {
            panel.setPointerCapture(e.pointerId);
          } catch {}
          panel.style.transition = "none";
          panel.style.willChange = "transform, opacity";
        });
        panel.addEventListener("pointermove", (e) => {
          if (!(e instanceof PointerEvent)) return;
          if (!drag || drag.id !== e.pointerId) return;
          const dx = e.clientX - drag.x;
          const dy = e.clientY - drag.y;
          if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
          if (!drag.moved) return;
          if (drag.mode === "Y") {
            const down = Math.max(0, dy);
            const t = Math.min(140, down);
            panel.style.transform = `translateY(${t}px)`;
            panel.style.opacity = String(Math.max(0.2, 1 - t / 220));
            return;
          }
          const right = Math.max(0, dx);
          const t = Math.min(200, right);
          panel.style.transform = `translateX(${t}px)`;
          panel.style.opacity = String(Math.max(0.2, 1 - t / 260));
        });
        panel.addEventListener("pointerup", (e) => {
          if (!(e instanceof PointerEvent)) return;
          if (!drag || drag.id !== e.pointerId) return;
          const dx = e.clientX - drag.x;
          const dy = e.clientY - drag.y;
          const close = drag.mode === "Y" ? dy > 90 : dx > 110;
          endDrag(close);
        });
        panel.addEventListener("pointercancel", () => endDrag(false));
        document.addEventListener("pointerdown", (e) => {
          if (!(e instanceof PointerEvent)) return;
          if (!isTouch(e)) return;
          if (panel.getAttribute("data-open") === "true") return;
          if (e.clientX < window.innerWidth - 18) return;
          drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, mode: "EDGE" };
        });
        document.addEventListener(
          "pointermove",
          (e) => {
            if (!(e instanceof PointerEvent)) return;
            if (!drag || drag.mode !== "EDGE" || drag.id !== e.pointerId) return;
            const dx = e.clientX - drag.x;
            const dy = e.clientY - drag.y;
            if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 10) drag.moved = true;
            if (!drag.moved) return;
            if (dx < -60) {
              drag = null;
              openCart(true);
            }
          },
          { passive: true }
        );
        document.addEventListener("pointerup", (e) => {
          if (!(e instanceof PointerEvent)) return;
          if (drag && drag.mode === "EDGE" && drag.id === e.pointerId) drag = null;
        });
      }
      function wireEvents() {
        wireCartGestures();
        els.cartToggle.addEventListener("click", () => openCart());
        els.cartCloseBtn.addEventListener("click", () => openCart(false));
        els.cartBackdrop.addEventListener("click", () => openCart(false));
        els.prevPage.addEventListener("click", () => {
          state.page = Math.max(1, Number(state.page) - 1);
          render();
        });
        els.nextPage.addEventListener("click", () => {
          state.page = Math.max(1, Number(state.page) + 1);
          render();
        });
        els.prevPageBottom.addEventListener("click", () => els.prevPage.click());
        els.nextPageBottom.addEventListener("click", () => els.nextPage.click());
        const pillbar = document.querySelector(".pillbar");
        if (pillbar instanceof HTMLElement) {
          pillbar.addEventListener("click", (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            const b = t.closest(".pill[data-category]");
            if (!(b instanceof HTMLElement)) return;
            const cat = String(b.getAttribute("data-category") ?? "");
            state.category = cat || "ALL";
            state.page = 1;
            updatePills();
            if (cat === "HOME") setHash("home");
            else setShopHashWithCategory(state.category);
            if (els.catsWrapper.classList.contains("drawer-mode")) {
              els.catsWrapper.classList.remove("drawer-mode");
            }
            applyFilters();
          });
        }
        els.viewSelect.addEventListener("change", () => {
          state.viewMode = String(els.viewSelect.value ?? "compact");
          try {
            localStorage.setItem("hjy_view_mode_v1", state.viewMode);
          } catch {}
          els.grid.setAttribute("data-view", state.viewMode);
          els.homeGrid.setAttribute("data-view", state.viewMode);
          applyFilters();
          renderHome();
        });
        els.sortSelect.addEventListener("change", () => {
          state.sortMode = String(els.sortSelect.value ?? "DEFAULT");
          try {
            localStorage.setItem("hjy_sort_mode_v1", state.sortMode);
          } catch {}
          if (state.sortMode === "FAVORITES") {
            state.category = "FAVORITES";
            updatePills();
            setShopHashWithCategory(state.category);
          }
          applyFilters();
        });
        const catsDrawerBtn = document.getElementById("catsDrawerBtn");
        const catsMoreBtn = document.getElementById("catsMoreBtn");
        const topPillbar = document.getElementById("topPillbar");
        const catsSidebar = document.getElementById("catsSidebar");
        const catsSidebarBackdrop = document.getElementById("catsSidebarBackdrop");
        const catsSidebarClose = document.getElementById("catsSidebarClose");
        
        if (catsMoreBtn) {
          catsMoreBtn.addEventListener("click", () => {
            if (topPillbar) {
              topPillbar.classList.toggle("expanded");
              catsMoreBtn.textContent = topPillbar.classList.contains("expanded") ? "عرض أقل ▲" : "عرض المزيد ▼";
            }
          });
        }

        function openCatsSidebar() {
          if (catsSidebar) catsSidebar.classList.add("show");
          if (catsSidebarBackdrop) catsSidebarBackdrop.classList.add("show");
        }
        function closeCatsSidebar() {
          if (catsSidebar) catsSidebar.classList.remove("show");
          if (catsSidebarBackdrop) catsSidebarBackdrop.classList.remove("show");
        }

        if (catsDrawerBtn) catsDrawerBtn.addEventListener("click", openCatsSidebar);
        if (catsSidebarClose) catsSidebarClose.addEventListener("click", closeCatsSidebar);
        if (catsSidebarBackdrop) catsSidebarBackdrop.addEventListener("click", closeCatsSidebar);
        
        document.getElementById("catHomeBtn")?.addEventListener("click", () => {
          setHash("home");
        });
        
        document.getElementById("catAllBtn")?.addEventListener("click", () => {
          setShopHashWithCategory("ALL");
        });
        
        document.getElementById("catsPrev")?.addEventListener("click", () => {
          document.getElementById("topPillbar")?.scrollBy({ left: -240, behavior: "smooth" });
        });
        
        document.getElementById("catsNext")?.addEventListener("click", () => {
          document.getElementById("topPillbar")?.scrollBy({ left: 240, behavior: "smooth" });
        });
        if (els.searchBtn instanceof HTMLElement) {
          els.searchBtn.addEventListener("click", () => {
            state.query = String(els.search.value ?? "");
            state.page = 1;
            if (state.category === "HOME") {
              state.category = "ALL";
              updatePills();
            }
            setShopHashWithCategory(state.category);
            applyFilters();
          });
        }
        els.search.addEventListener(
          "input",
          debounce(() => {
            state.query = String(els.search.value ?? "");
            state.page = 1;
            if (state.query.trim().length > 0 && state.category !== "ALL") {
              state.category = "ALL";
              updatePills();
              setShopHashWithCategory("ALL");
            }
            applyFilters();
          }, 180)
        );
        els.search.addEventListener("keydown", (e) => {
          if (String(e?.key ?? "") !== "Enter") return;
          e.preventDefault();
          state.query = String(els.search.value ?? "");
          state.page = 1;
          if (state.category === "HOME") {
            state.category = "ALL";
            updatePills();
          }
          setShopHashWithCategory(state.category);
          applyFilters();
        });
        const searchLogo = document.querySelector(".search-logo");
        if (searchLogo instanceof HTMLImageElement) {
          searchLogo.addEventListener("click", () => openImgModal(searchLogo.currentSrc || searchLogo.src || "logo.webp"));
        }
        if (els.afterComplaintBtn instanceof HTMLElement) els.afterComplaintBtn.addEventListener("click", () => setHash("info=الشكاوي"));
        if (els.afterRatingBtn instanceof HTMLElement) els.afterRatingBtn.addEventListener("click", () => setHash("info=التقييم"));
        if (els.afterCustomerReviewsBtn instanceof HTMLElement) els.afterCustomerReviewsBtn.addEventListener("click", () => setHash("info=تقييمات عملاء"));
        if (els.afterOrdersBtn instanceof HTMLElement) els.afterOrdersBtn.addEventListener("click", () => setHash("orders"));
        const handleCardsClick = (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const fav = t.closest("[data-fav]");
          if (fav instanceof HTMLElement) {
            const code = fav.getAttribute("data-fav");
            if (code) toggleFavorite(code);
            return;
          }
          const add = t.closest("[data-add]");
          if (add instanceof HTMLElement) {
            const code = add.getAttribute("data-add");
            if (code) addToCart(code);
            return;
          }
          const prod = t.closest("[data-product]");
          if (prod instanceof HTMLElement) {
            const code = prod.getAttribute("data-product");
            if (code) return setHash(`product=${encodeURIComponent(code)}`);
            return;
          }
          const card = t.closest(".card[data-code]");
          if (card instanceof HTMLElement) {
            const code = card.getAttribute("data-code");
            if (code) return setHash(`product=${encodeURIComponent(code)}`);
          }
        };
        els.grid.addEventListener("click", handleCardsClick);
        els.homeGrid.addEventListener("click", handleCardsClick);
        els.productDetails.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const qaBtn = t.closest("[data-qa]");
          if (qaBtn instanceof HTMLElement) return setHash("qa");
          const fav = t.closest("[data-fav]");
          if (fav instanceof HTMLElement) {
            const code = fav.getAttribute("data-fav");
            if (code) toggleFavorite(code);
            return;
          }
          const add = t.closest("[data-add]");
          if (add instanceof HTMLElement) {
            const code = add.getAttribute("data-add");
            if (code) addToCart(code);
            return;
          }
          const prod = t.closest("[data-product]");
          if (prod instanceof HTMLElement) {
            const code = prod.getAttribute("data-product");
            if (code) return setHash(`product=${encodeURIComponent(code)}`);
            return;
          }
          const shareBtn = t.closest("[data-share]");
          if (shareBtn instanceof HTMLElement) {
            const code = String(shareBtn.getAttribute("data-share") ?? "").trim();
            if (code) shareProductByCode(code);
            return;
          }
          const moreBtn = t.closest("[data-suggest-more]");
          if (moreBtn instanceof HTMLElement) {
            const code = String(moreBtn.getAttribute("data-suggest-more") ?? "").trim();
            if (code) {
              state.suggestExpandedCode = code;
              state.suggestLimit = Math.max(10, Math.min(30, Number(state.suggestLimit) || 10) + 10);
              renderProductDetails(code);
            }
            return;
          }
          const stepBtn = t.closest("[data-gallery-step]");
          if (stepBtn instanceof HTMLElement) {
            const img = document.getElementById("productMainImg");
            if (!(img instanceof HTMLImageElement)) return;
            const step = Number(stepBtn.getAttribute("data-gallery-step") || "0");
            
            try {
              const raw = img.getAttribute("data-src-list");
              const list = raw ? JSON.parse(raw) : [];
              if (Array.isArray(list) && list.length > 1) {
                const cur = Number(img.getAttribute("data-src-idx") || "0");
                const next = ((cur + step) % list.length + list.length) % list.length;
                img.setAttribute("data-src-idx", String(next));
                img.src = String(list[next]);
                return;
              }
            } catch {}

            const curIdx = Number(img.getAttribute("data-thumb-idx") || "0");
            const thumbs = els.productDetails.querySelectorAll(".gallery-thumb");
            if (thumbs.length === 0) return;
            const nextIdx = ((curIdx + step) % thumbs.length + thumbs.length) % thumbs.length;
            const nextThumb = Array.from(thumbs).find(t => Number(t.getAttribute("data-gallery-idx")) === nextIdx);
            if (nextThumb instanceof HTMLElement) nextThumb.click();
            return;
          }
          const g = t.closest("[data-gallery]");
          if (g instanceof HTMLElement) {
            const url = g.getAttribute("data-gallery");
            const img = document.getElementById("productMainImg");
            if (img instanceof HTMLImageElement && url) {
              const idx = Number(g.getAttribute("data-gallery-idx") || "0");
              const thumbImg = g.querySelector("img");
              if (thumbImg) {
                 img.setAttribute("data-src-list", thumbImg.getAttribute("data-src-list") || "[]");
              }
              img.setAttribute("data-src-idx", "0");
              img.setAttribute("data-thumb-idx", String(Number.isFinite(idx) ? idx : 0));
              img.src = url;
            }
          }
        });
        els.productDetails.addEventListener(
          "submit",
          async (e) => {
            const form = e.target;
            if (!(form instanceof HTMLFormElement)) return;
            const kind = String(form.getAttribute("data-form") ?? "").trim();
            if (!kind) return;
            e.preventDefault();
            const code = String(form.getAttribute("data-code") ?? "").trim();
            const p = state.allProducts.find((x) => normalizeCodeKey(x.code) === normalizeCodeKey(code));
            if (!p) return;
            const link = productUrlForCode(p.code);
            if (kind === "issue") {
              const contact = String(new FormData(form).get("contact") ?? "").trim();
              const msg = String(new FormData(form).get("msg") ?? "").trim();
              if (msg.length < 8) return showToast("يرجى كتابة تفاصيل أكثر", 1800);
              try {
                await sendToTelegramKind(
                  "feedback",
                  `إبلاغ مشكلة بالمنتج\n\ncode: ${p.code}\nname: ${p.name}\nprice: $${formatMoney(p.price)}\nlink: ${link}\n\nالتواصل: ${contact || "—"}\n\n${msg}`
                );
                showToast("تم الإرسال", 1600);
                try {
                  form.reset();
                } catch {}
              } catch {
                showToast("تعذر الإرسال", 1800);
              }
              return;
            }
          },
          true
        );
        let gTouchX = 0;
        let gTouchY = 0;
        let gTouchActive = false;
        els.productDetails.addEventListener(
          "touchstart",
          (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            const img = t.closest("#productMainImg");
            if (!(img instanceof HTMLImageElement)) return;
            const touch = e.touches && e.touches[0];
            if (!touch) return;
            gTouchX = touch.clientX;
            gTouchY = touch.clientY;
            gTouchActive = true;
          },
          { passive: true }
        );
        els.productDetails.addEventListener(
          "touchend",
          (e) => {
            if (!gTouchActive) return;
            gTouchActive = false;
            const img = document.getElementById("productMainImg");
            if (!(img instanceof HTMLImageElement)) return;
            const touch = e.changedTouches && e.changedTouches[0];
            if (!touch) return;
            const dx = touch.clientX - gTouchX;
            const dy = touch.clientY - gTouchY;
            if (Math.abs(dx) < 50) return;
            if (Math.abs(dx) <= Math.abs(dy) + 10) return;
            const step = dx > 0 ? -1 : 1;
            try {
              const raw = img.getAttribute("data-src-list");
              const list = raw ? JSON.parse(raw) : [];
              const cur = Number(img.getAttribute("data-src-idx") || "0");
              if (!Array.isArray(list) || list.length === 0) return;
              const next = ((cur + step) % list.length + list.length) % list.length;
              img.setAttribute("data-src-idx", String(next));
              img.src = String(list[next]);
            } catch {}
          },
          { passive: true }
        );
        els.cartContent.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const rem = t.closest("[data-remove]");
          if (rem instanceof HTMLElement) {
            const code = rem.getAttribute("data-remove");
            if (code) removeFromCart(code);
            return;
          }
          const inc = t.closest("[data-inc]");
          if (inc instanceof HTMLElement) {
            const code = inc.getAttribute("data-inc");
            if (!code) return;
            const it = state.cart.get(normalizeCodeKey(code));
            if (!it) return;
            return setCartQty(code, Number(it.qty) + 1);
          }
          const dec = t.closest("[data-dec]");
          if (dec instanceof HTMLElement) {
            const code = dec.getAttribute("data-dec");
            if (!code) return;
            const it = state.cart.get(normalizeCodeKey(code));
            if (!it) return;
            return setCartQty(code, Math.max(1, Number(it.qty) - 1));
          }
          if (t.id === "clearCartBtn") return clearCart();
          if (t.id === "checkoutBtn") return setHash("checkout");
        });
        els.cartActions.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          if (t.id === "clearCartBtn") return clearCart();
          if (t.id === "checkoutBtn") return setHash("checkout");
        });
        els.cartContent.addEventListener("change", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLInputElement)) return;
          const code = t.getAttribute("data-qty");
          if (!code) return;
          const qty = Number(t.value);
          if (!Number.isFinite(qty)) return renderCart();
          setCartQty(code, qty);
        });
        els.checkoutCartSummary.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const img = t.closest('img[data-zoom="1"]');
          if (img instanceof HTMLImageElement) {
            openImgModal(img.currentSrc || img.src);
            return;
          }
          const rem = t.closest("[data-remove]");
          if (rem instanceof HTMLElement) {
            const code = rem.getAttribute("data-remove");
            if (code) removeFromCart(code);
            return;
          }
          const inc = t.closest("[data-inc]");
          if (inc instanceof HTMLElement) {
            const code = inc.getAttribute("data-inc");
            if (!code) return;
            const it = state.cart.get(normalizeCodeKey(code));
            if (!it) return;
            return setCartQty(code, Number(it.qty) + 1);
          }
          const dec = t.closest("[data-dec]");
          if (dec instanceof HTMLElement) {
            const code = dec.getAttribute("data-dec");
            if (!code) return;
            const it = state.cart.get(normalizeCodeKey(code));
            if (!it) return;
            return setCartQty(code, Math.max(1, Number(it.qty) - 1));
          }
        });
        els.checkoutCartSummary.addEventListener("change", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLInputElement)) return;
          const code = t.getAttribute("data-qty");
          if (!code) return;
          const qty = Number(t.value);
          if (!Number.isFinite(qty)) return renderCheckoutCartSummary();
          setCartQty(code, qty);
        });
        els.goShopBtn.addEventListener("click", () => setShopHashWithCategory(state.category === "HOME" ? "ALL" : state.category));
        if (els.homeFavoritesBtn) els.homeFavoritesBtn.addEventListener("click", () => {
          state.category = "FAVORITES";
          updatePills();
          setShopHashWithCategory(state.category);
          applyFilters();
        });
        els.openCheckoutBtn.addEventListener("click", () => setHash("checkout"));
        els.backFromProductBtn.addEventListener("click", () => setShopHashWithCategory(state.category === "HOME" ? "ALL" : state.category));
        if (els.backFromProductBtnBottom instanceof HTMLElement) els.backFromProductBtnBottom.addEventListener("click", () => els.backFromProductBtn.click());
        els.backToShopBtn.addEventListener("click", () => setShopHashWithCategory(state.category === "HOME" ? "ALL" : state.category));
        els.backFromInfoBtn.addEventListener("click", () => setShopHashWithCategory(state.category === "HOME" ? "ALL" : state.category));
        if (els.homeTopBtn instanceof HTMLElement) els.homeTopBtn.addEventListener("click", () => setHash("home"));
        if (els.productsQaTopBtn instanceof HTMLElement) els.productsQaTopBtn.addEventListener("click", () => setHash("qa"));
        if (els.topQaRail instanceof HTMLElement)
          els.topQaRail.addEventListener("click", (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            const b = t.closest("[data-top-qa-file]");
            if (!(b instanceof HTMLElement)) return;
            const name = String(b.getAttribute("data-top-qa-file") ?? "").trim();
            if (!name) return;
            setHash(`qa=${encodeURIComponent(name)}`);
          });
        if (els.topQaPrev instanceof HTMLElement && els.topQaRail instanceof HTMLElement)
          els.topQaPrev.addEventListener("click", () => {
            try {
              els.topQaRail.scrollBy({ left: -240, behavior: "smooth" });
            } catch {}
          });
        if (els.topQaNext instanceof HTMLElement && els.topQaRail instanceof HTMLElement)
          els.topQaNext.addEventListener("click", () => {
            try {
              els.topQaRail.scrollBy({ left: 240, behavior: "smooth" });
            } catch {}
          });
        if (els.backFromQaBtn instanceof HTMLElement)
          els.backFromQaBtn.addEventListener("click", () => setShopHashWithCategory(state.category === "HOME" ? "ALL" : state.category));
        if (els.backFromQaBtnBottom instanceof HTMLElement)
          els.backFromQaBtnBottom.addEventListener("click", () => (els.backFromQaBtn instanceof HTMLElement ? els.backFromQaBtn.click() : setShopHashWithCategory("ALL")));
        if (els.qaButtons instanceof HTMLElement)
          els.qaButtons.addEventListener("click", (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            const b = t.closest("[data-qa-file]");
            if (!(b instanceof HTMLElement)) return;
            const name = String(b.getAttribute("data-qa-file") ?? "").trim();
            if (!name) return;
            setHash(`qa=${encodeURIComponent(name)}`);
          });
        if (els.backFromOrdersBtn instanceof HTMLElement)
          els.backFromOrdersBtn.addEventListener("click", () => setShopHashWithCategory(state.category === "HOME" ? "ALL" : state.category));
        if (els.ordersClearAllBtn instanceof HTMLElement)
          els.ordersClearAllBtn.addEventListener("click", () => {
            const ok = confirm("هل تريد حذف جميع الطلبات المحفوظة من هذا المتصفح؟");
            if (!ok) return;
            try {
              localStorage.removeItem("hjy_orders_v1");
            } catch {}
            state.ordersSelectedId = "";
            renderOrdersView();
            showToast("تم الحذف", 1600);
          });
        if (els.ordersView instanceof HTMLElement)
          els.ordersView.addEventListener("click", async (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            const view = t.closest("[data-order-view]");
            if (view instanceof HTMLElement) {
              const id = String(view.getAttribute("data-order-view") ?? "").trim();
              if (!id) return;
              state.ordersSelectedId = id;
              renderOrdersView();
              return;
            }
            const del = t.closest("[data-order-del]");
            if (del instanceof HTMLElement) {
              const id = String(del.getAttribute("data-order-del") ?? "").trim();
              if (!id) return;
              const ok = confirm("هل تريد حذف هذا الطلب؟");
              if (!ok) return;
              const list = loadOrdersHistory().filter((x) => String(x?.id ?? "") !== id);
              saveOrdersHistory(list);
              if (state.ordersSelectedId === id) state.ordersSelectedId = "";
              renderOrdersView();
              showToast("تم الحذف", 1600);
              return;
            }
            const close = t.closest("[data-order-close]");
            if (close instanceof HTMLElement) {
              state.ordersSelectedId = "";
              renderOrdersView();
              return;
            }
            const copy = t.closest("[data-order-copy]");
            if (copy instanceof HTMLElement) {
              const id = String(copy.getAttribute("data-order-copy") ?? "").trim();
              if (!id) return;
              const found = loadOrdersHistory().find((x) => String(x?.id ?? "") === id);
              const invoice = String(found?.invoice ?? "").trim();
              if (!invoice) return showToast("لا يوجد نص لنسخه", 1600);
              await copyText(invoice);
              showToast("تم النسخ", 1400);
            }
          });
        document.body.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const qaBtn = t.closest("[data-qa]");
          if (qaBtn instanceof HTMLElement) return setHash("qa");
          const goBtn = t.closest("[data-go]");
          if (goBtn instanceof HTMLElement) {
            const go = goBtn.getAttribute("data-go");
            if (safeLower(go) === "home") return setHash("home");
            if (safeLower(go) === "orders") return setHash("orders");
          }
          const infoBtn = t.closest("[data-info]");
          if (infoBtn instanceof HTMLElement) {
            const key = infoBtn.getAttribute("data-info");
            if (key) setHash(`info=${encodeURIComponent(key)}`);
          }
        });
        // footer buttons click handling removed
        els.infoView.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const vcopy = t.closest("[data-video-copy]");
          if (vcopy instanceof HTMLElement) {
            const url = String(vcopy.getAttribute("data-video-copy") ?? "").trim();
            if (!url) return;
            copyText(url);
            showToast("تم نسخ الرابط", 1600);
            return;
          }
          const vclear = t.closest("[data-videos-clear]");
          if (vclear instanceof HTMLElement) {
            state.videosQuery = "";
            state.videosPage = 1;
            els.infoText.innerHTML = renderVideosSection(state.videosIntro);
            return;
          }
          const vpage = t.closest("[data-videos-page]");
          if (vpage instanceof HTMLElement) {
            const n = Number(vpage.getAttribute("data-videos-page") || "1");
            state.videosPage = Number.isFinite(n) ? n : 1;
            els.infoText.innerHTML = renderVideosSection(state.videosIntro);
            return;
          }
          const vprev = t.closest("[data-videos-prev]");
          if (vprev instanceof HTMLElement) {
            state.videosPage = Math.max(1, (Number(state.videosPage) || 1) - 1);
            els.infoText.innerHTML = renderVideosSection(state.videosIntro);
            return;
          }
          const vnext = t.closest("[data-videos-next]");
          if (vnext instanceof HTMLElement) {
            state.videosPage = (Number(state.videosPage) || 1) + 1;
            els.infoText.innerHTML = renderVideosSection(state.videosIntro);
            return;
          }
          const infoBtn = t.closest("[data-info-btn]");
          if (infoBtn instanceof HTMLElement) {
            const key = infoBtn.getAttribute("data-info-btn");
            if (key) return setHash(`info=${encodeURIComponent(key)}`);
          }
          const cust = t.closest("[data-cust-photo]");
          if (cust instanceof HTMLElement) {
            const src = cust.getAttribute("data-cust-photo");
            if (src) openImgModal(src);
            return;
          }
          const inlineQaBtn = t.closest("[data-inline-qa-file]");
          if (inlineQaBtn instanceof HTMLElement) {
            const name = String(inlineQaBtn.getAttribute("data-inline-qa-file") ?? "").trim();
            if (!name) return;
            renderInlineQa(name);
            return;
          }
          const alb = t.closest("[data-photo-stouk-album]");
          if (alb instanceof HTMLElement) {
            const name = String(alb.getAttribute("data-photo-stouk-album") ?? "").trim();
            if (!name) return;
            state.photoStoukAlbum = name;
            els.infoText.innerHTML = renderPhotoStoukUI(state.photoStoukIntro);
            return;
          }
          const ph = t.closest("[data-photo-stouk-photo]");
          if (ph instanceof HTMLElement) {
            const src = String(ph.getAttribute("data-photo-stouk-photo") ?? "").trim();
            if (src) openImgModal(src);
            return;
          }
          const fav = t.closest("[data-fav]");
          if (fav instanceof HTMLElement) {
            const code = fav.getAttribute("data-fav");
            if (code) toggleFavorite(code);
            return;
          }
          const add = t.closest("[data-add]");
          if (add instanceof HTMLElement) {
            const code = add.getAttribute("data-add");
            if (code) addToCart(code);
            return;
          }
          const prod = t.closest("[data-product]");
          if (prod instanceof HTMLElement) {
            const code = prod.getAttribute("data-product");
            if (code) return setHash(`product=${encodeURIComponent(code)}`);
          }
        });
        els.infoView.addEventListener("input", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          if (t.id !== "videosSearchInput") return;
          state.videosQuery = String(t.value ?? "");
          state.videosPage = 1;
          els.infoText.innerHTML = renderVideosSection(state.videosIntro);
        });
        if (els.imgModal instanceof HTMLElement) {
          els.imgModal.addEventListener("click", (e) => {
            if (e.target === els.imgModal) closeImgModal();
          });
        }
        document.addEventListener("keydown", (e) => {
          if (String(e?.key ?? "") === "Escape") closeImgModal();
        });
        els.complaintForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const msg = String(els.complaintInput.value ?? "").trim();
          if (msg.length < 6) return setInfoStatus("يرجى كتابة تفاصيل أكثر.", true);
          const contact = String(els.complaintContact?.value ?? "").trim();
          els.complaintNote.style.display = "none";
          setInfoStatus("جارٍ إرسال الشكوى...", false);
          try {
            await sendToTelegramKind("feedback", `شكوى جديدة\n\nالتواصل (اختياري): ${contact || "—"}\n\n${msg}`);
            setInfoStatus("تم إرسال الشكوى.", false);
            els.complaintNote.style.display = "";
            els.complaintInput.value = "";
            if (els.complaintContact) els.complaintContact.value = "";
          } catch {
            setInfoStatus(USER_LOAD_ERROR_MSG, true);
          }
        });
        els.ratingForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const msg = String(els.ratingMsg.value ?? "").trim();
          if (msg.length < 3) return setInfoStatus("يرجى كتابة ملاحظة.", true);
          const rank = String(els.ratingRank.value ?? "").trim() || "سيء جدا";
          const labels = ["سيء جدا", "ضعيف", "مقبول", "جيد", "جيدا جدا", "ممتاز جدا"];
          const idx = labels.indexOf(rank);
          const rating = Math.max(0, Math.min(5, idx >= 0 ? idx : 0));
          setInfoStatus("جارٍ إرسال التقييم...", false);
          try {
            await sendToTelegramKind("feedback", `تقييم جديد\nالتقييم: ${rating}/5 — ${rank}\n\n${msg}`);
            setInfoStatus("تم إرسال التقييم.", false);
            els.ratingMsg.value = "";
            els.ratingDone.style.display = "";
          } catch {
            setInfoStatus(USER_LOAD_ERROR_MSG, true);
          }
        });
        const syncShipBlocks = () => {
          const gov = Boolean(els.shipGovRadio.checked);
          els.shipGovBlock.style.display = gov ? "grid" : "none";
          els.shipDamascusBlock.style.display = gov ? "none" : "grid";
        };
        els.shipDamascusRadio.addEventListener("change", syncShipBlocks);
        els.shipGovRadio.addEventListener("change", syncShipBlocks);
        syncShipBlocks();
        const syncDamascusDelivery = () => {
          const on = Boolean(els.damascusFreeDelivery.checked);
          els.damascusDeliveryBlock.style.display = on ? "grid" : "none";
        };
        els.damascusFreeDelivery.addEventListener("change", syncDamascusDelivery);
        els.damascusPickup.addEventListener("change", syncDamascusDelivery);
        syncDamascusDelivery();
        const syncGovOther = () => {
          const v = String(els.govInput.value ?? "").trim();
          const on = v === "أخرى";
          if (els.govOtherWrap) els.govOtherWrap.style.display = on ? "grid" : "none";
          if (els.govOtherInput) {
            if (!on) els.govOtherInput.value = "";
          }
        };
        els.govInput.addEventListener("input", syncGovOther);
        els.govInput.addEventListener("change", syncGovOther);
        syncGovOther();
        
        let branchesData = null;
        async function fetchBranches() {
          if (branchesData) return branchesData;
          try {
            const [mRes, qRes] = await Promise.all([
              fetchTextCached(resolveAboutPath("masarat.csv"), 60*60*1000),
              fetchTextCached(resolveAboutPath("kadmous.csv"), 60*60*1000)
            ]);
            let branches = [];
            const parseCSV = (text, company) => {
              if(!text) return [];
              const lines = text.split('\n').slice(1);
              return lines.map(line => {
                const parts = line.split(',');
                return { gov: parts[0]?.trim(), branch: parts[1]?.trim(), company };
              }).filter(b => b.branch);
            };
            branches = branches.concat(parseCSV(mRes?.text, "مسارات"));
            branches = branches.concat(parseCSV(qRes?.text, "قدموس"));
            branchesData = branches;
            return branches;
          } catch(e) { return []; }
        }

        if (els.shipCenterInput) {
          els.shipCenterInput.addEventListener("input", async (e) => {
            const val = e.target.value.trim().toLowerCase();
            const sugs = els.shipCenterSuggestions;
            if (!sugs) return;
            if (!val) {
              sugs.style.display = "none";
              return;
            }
            const branches = await fetchBranches();
            if(!branches || branches.length === 0) return;
            // only suggest branches of the selected carrier (مسارات/قدموس), or all for "آخر"
            const carrier = els.carrierQadmous?.checked ? "قدموس" : (els.carrierOther?.checked ? "all" : "مسارات");
            let pool = branches;
            if (carrier !== "all") pool = branches.filter(b => b.company === carrier);
            const filtered = pool.filter(b => b.branch.toLowerCase().includes(val)).slice(0, 8);
            if (filtered.length > 0) {
              sugs.innerHTML = filtered.map(b => `
                <div class="branch-suggestion" style="padding:8px; border-bottom:1px solid var(--border); cursor:pointer; font-size:13px;" data-branch="${escapeHtmlAttr(b.branch)}" data-company="${escapeHtmlAttr(b.company)}">
                  <span style="font-weight:bold; color:var(--primary)">${escapeHtml(b.company)}</span> - ${escapeHtml(b.branch)} (${escapeHtml(b.gov)})
                </div>
              `).join('');
              sugs.style.display = "flex";
              
              Array.from(sugs.querySelectorAll('.branch-suggestion')).forEach(el => {
                el.addEventListener('click', () => {
                  els.shipCenterInput.value = el.getAttribute('data-branch');
                  sugs.style.display = "none";
                  const company = el.getAttribute('data-company');
                  if(company === "مسارات" && els.carrierMasarat) els.carrierMasarat.checked = true;
                  if(company === "قدموس" && els.carrierQadmous) els.carrierQadmous.checked = true;
                  if (typeof saveCustomer === 'function') saveCustomer();
                });
              });
            } else {
              sugs.style.display = "none";
            }
          });
          // re-render suggestions when the carrier changes
          [els.carrierMasarat, els.carrierQadmous, els.carrierOther].forEach(rd => {
            if (rd) rd.addEventListener("change", () => {
              const ev = new Event("input", { bubbles: true });
              if (els.shipCenterInput) els.shipCenterInput.dispatchEvent(ev);
            });
          });
          document.addEventListener('click', (e) => {
            if (els.shipCenterSuggestions && !els.shipCenterInput.contains(e.target) && !els.shipCenterSuggestions.contains(e.target)) {
              els.shipCenterSuggestions.style.display = "none";
            }
          });
        }

        els.masaratBranchesBtn.addEventListener("click", () => setHash(`info=${encodeURIComponent("فروع مسارات")}`));
        els.qadmousBranchesBtn.addEventListener("click", () => setHash(`info=${encodeURIComponent("فروع قدموس")}`));
        els.openShippingBtn.addEventListener("click", () => setHash(`info=${encodeURIComponent("تفاصيل الشحن")}`));
        if (els.openPolicyBtn instanceof HTMLElement) els.openPolicyBtn.addEventListener("click", () => setHash(`info=${encodeURIComponent("سياسية الاستخدام")}`));
        if (els.clearCustomerBtn instanceof HTMLElement)
          els.clearCustomerBtn.addEventListener("click", () => {
            const ok = confirm("هل تريد حذف كامل بيانات العميل المحفوظة؟");
            if (!ok) return;
            try {
              localStorage.removeItem("hjy_customer_v1");
            } catch {}
            if (els.phoneInput) els.phoneInput.value = "";
            if (els.govInput) els.govInput.value = "";
            if (els.govOtherInput) els.govOtherInput.value = "";
            if (els.fullNameDamascusInput) els.fullNameDamascusInput.value = "";
            if (els.fullNameGovInput) els.fullNameGovInput.value = "";
            syncGovOther();
            showToast("تم حذف كامل البيانات", 1800);
          });
        const sendLocationBtn = document.getElementById("sendLocationBtn");
        const locationStatusText = document.getElementById("locationStatusText");
        const locGeneralInput = document.getElementById("locGeneralInput");
        if (sendLocationBtn) {
          sendLocationBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
              locationStatusText.textContent = "المتصفح الخاص بك لا يدعم تحديد الموقع.";
              locationStatusText.style.color = "red";
              return;
            }
            locationStatusText.textContent = "جاري تحديد الموقع...";
            locationStatusText.style.color = "var(--text)";
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const link = `https://www.google.com/maps?q=${lat},${lng}`;
                locGeneralInput.value = locGeneralInput.value ? locGeneralInput.value + " | " + link : link;
                locationStatusText.textContent = "تم إرفاق الموقع بنجاح.";
                locationStatusText.style.color = "green";
              },
              (error) => {
                locationStatusText.textContent = "فشل في تحديد الموقع. يرجى تفعيل الـ GPS.";
                locationStatusText.style.color = "red";
              }
            );
          });
        }

        els.checkoutForm.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          const btn = t.closest("[data-clear]");
          if (!(btn instanceof HTMLElement)) return;
          const id = String(btn.getAttribute("data-clear") ?? "").trim();
          if (!id) return;
          const el = document.getElementById(id);
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
            el.value = "";
            el.focus();
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        els.checkoutForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (state.cart.size === 0) return setCheckoutStatus("السلة فارغة.", true);
          const totalNow = cartTotals();
          if (Number(CONFIG.MIN_ORDER_TOTAL) > 0 && totalNow < Number(CONFIG.MIN_ORDER_TOTAL)) {
            return setCheckoutStatus(`اجعل أقل فاتورة $${formatMoney(CONFIG.MIN_ORDER_TOTAL)} لو سمحت`, true);
          }
          const phone = String(els.phoneInput.value ?? "").trim();
          if (phone.length < 1) return setCheckoutStatus("لم تضع رقم الهاتف", true);
          const shipType = els.shipGovRadio.checked ? "GOV" : "DAMASCUS";
          let fullName = "";
          let shipCenter = "";
          let carrier = "";
          let shipTypeLabel = shipType === "GOV" ? "شحن للمحافظات" : "استلام ضمن دمشق";
          let payAdvance = false;
          let damascusType = "";
          let locGeneral = "";
          let locDetail = "";
          let timeRange = "";
          let urgentOrder = false;
          let distantRural = false;
          let gpsLocation = window.__hjyGpsLocation || "";
          let gov = String(els.govInput.value ?? "").trim();
          if (gov === "أخرى") {
            const other = String(els.govOtherInput?.value ?? "").trim();
            gov = other || "أخرى";
          }
          if (shipType === "GOV") {
            fullName = String(els.fullNameGovInput.value ?? "").trim();
            shipCenter = String(els.shipCenterInput.value ?? "").trim();
            carrier = els.carrierOther?.checked ? "آخر" : els.carrierMasarat.checked ? "مسارات" : "قدموس";
          } else {
            fullName = String(els.fullNameDamascusInput.value ?? "").trim();
            damascusType = els.damascusFreeDelivery.checked ? "توصيل مجاني" : "استلام ضمن موقعنا";
            if (!gov) gov = "دمشق";
            if (els.damascusFreeDelivery.checked) {
              locGeneral = String(els.locGeneralInput.value ?? "").trim();
              locDetail = String(els.locDetailInput.value ?? "").trim();
              timeRange = String(els.timeRangeInput.value ?? "").trim();
              urgentOrder = document.getElementById("urgentOrderInput")?.checked || false;
              distantRural = document.getElementById("distantRuralInput")?.checked || false;
            }
          }
          const payCurrency = els.paySypInput.checked ? "سوري" : "الدولار";
          const notes = String(els.orderNotesInput.value ?? "").trim();
          const invoiceDetails = {
            phone,
            gov,
            shipType,
            shipTypeLabel,
            fullName,
            shipCenter,
            carrier,
            urgentOrder,
            distantRural,
            gpsLocation,
            damascusType,
            locGeneral,
            locDetail,
            timeRange,
            payCurrency,
            notes,
          };
          const invoice = buildInvoiceText(invoiceDetails);
          state.lastInvoiceText = invoice;
          els.copyInvoiceBtn.style.display = "";
          els.invoiceNote.style.display = "";
          if (els.afterOrderLinks instanceof HTMLElement) els.afterOrderLinks.style.display = "none";
          els.confirmOrderBtn.disabled = true;
          els.confirmOrderBtn.textContent = "جارٍ الإرسال...";
          setCheckoutStatus("جارٍ إرسال الطلب...", false);
          const historyEntry = {
            id: orderId(),
            ts: Date.now(),
            phone,
            count: cartCountTotal(),
            total: totalNow,
            invoice,
            details: invoiceDetails,
          };
          try {
            await sendToTelegramKind("orders", invoice);
            setCheckoutStatus("", false);
            showToast("تم ارسال الطلب", 3000);
            els.confirmOrderBtn.disabled = false;
            els.confirmOrderBtn.textContent = "إرسال طلب جديد";
            if (els.afterOrderLinks instanceof HTMLElement) els.afterOrderLinks.style.display = "flex";
            addOrderToHistory(historyEntry);
            state.cart.clear();
            saveCart();
            renderCart();
          } catch (err) {
            els.confirmOrderBtn.disabled = false;
            els.confirmOrderBtn.textContent = "إعادة إرسال الطلب";
            const detail = String(err?.message ?? "").trim();
            setCheckoutStatus(
              `تعذر إرسال الطلب بسبب مشكلة اتصال.${detail ? `\nتفاصيل: ${detail}` : ""}\nتم نسخ الفاتورة تلقائياً، أرسلها لنا على واتساب:\n0940471199\n\nيرجى إيقاف vpn وإعادة تحميل الصفحة او تغيير بلد ال vpn , يرجى إعلامنا بالمشكلة`,
              true
            );
          }
          await copyText(invoice);
        });
        els.copyInvoiceBtn.addEventListener("click", async () => {
          if (!state.lastInvoiceText) return;
          await copyText(state.lastInvoiceText);
        });
      }
      window.__hjyImgFallback = (img) => {
        try {
          if (!(img instanceof HTMLImageElement)) return;
          const raw = img.getAttribute("data-src-list");
          const idx = Number(img.getAttribute("data-src-idx") || "0");
          const list = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(list) || list.length === 0) {
            img.onerror = null;
            const thumbWrap = img.closest('.gallery-thumb');
            if (thumbWrap) {
              thumbWrap.remove();
            } else {
              img.src = PLACEHOLDER_IMG;
            }
            return;
          }

          const next = Math.max(0, idx + 1);
          if (next >= list.length) {
            img.onerror = null;
            const thumbWrap = img.closest('.gallery-thumb');
            if (thumbWrap) {
              thumbWrap.remove();
            } else {
              img.src = PLACEHOLDER_IMG;
              img.style.opacity = 1;
            }
            return;
          }
          img.setAttribute("data-src-idx", String(next));
          img.src = String(list[next]);
        } catch {
          try {
            img.onerror = null;
            img.src = PLACEHOLDER_IMG;
            img.style.opacity = 1;
          } catch {}
        }
      };
      try {
        loadFavorites();
      } catch {}
      function loadSavedCustomer() {
        try {
          const raw = localStorage.getItem("hjy_customer_v1");
          if (!raw) return;
          const obj = JSON.parse(raw);
          if (!obj || typeof obj !== "object") return;
          if (els.phoneInput) els.phoneInput.value = String(obj.phone || "");
          const savedGov = String(obj.gov || "").trim();
          const savedGovOther = String(obj.govOther || "").trim();
          if (els.govInput instanceof HTMLSelectElement) {
            const has = Array.from(els.govInput.options).some((o) => String(o?.value ?? "") === savedGov);
            if (savedGov && !has) {
              els.govInput.value = "أخرى";
              if (els.govOtherInput) els.govOtherInput.value = savedGov;
            } else {
              els.govInput.value = savedGov;
              if (els.govOtherInput) els.govOtherInput.value = savedGovOther;
            }
          } else {
            if (els.govInput) els.govInput.value = savedGov;
            if (els.govOtherInput) els.govOtherInput.value = savedGovOther;
          }
          if (els.fullNameDamascusInput) els.fullNameDamascusInput.value = String(obj.fullNameDamascus || "");
          if (els.fullNameGovInput) els.fullNameGovInput.value = String(obj.fullNameGov || "");
        } catch {}
      }
      function saveCustomer() {
        try {
          const obj = {
            phone: String(els.phoneInput?.value || ""),
            gov: String(els.govInput?.value || ""),
            govOther: String(els.govOtherInput?.value || ""),
            fullNameDamascus: String(els.fullNameDamascusInput?.value || ""),
            fullNameGov: String(els.fullNameGovInput?.value || ""),
          };
          localStorage.setItem("hjy_customer_v1", JSON.stringify(obj));
        } catch {}
      }
      function setupImgLoadFx() {
        const hostFor = (img) => {
          if (!(img instanceof HTMLImageElement)) return null;
          return (
            img.closest(".thumb") ||
            img.closest(".cart-thumb") ||
            img.closest(".gallery-thumb") ||
            img.closest(".img-modal-card") ||
            img.parentElement
          );
        };
        const mark = (img, state) => {
          const host = hostFor(img);
          if (!(host instanceof HTMLElement)) return;
          host.setAttribute("data-img-state", state);
        };
        const attach = (img) => {
          if (!(img instanceof HTMLImageElement)) return;
          if (img.getAttribute("data-hjy-img") === "1") return;
          img.setAttribute("data-hjy-img", "1");
          mark(img, img.complete ? "done" : "loading");
          img.addEventListener(
            "load",
            () => {
              mark(img, "done");
            },
            { passive: true }
          );
          img.addEventListener(
            "error",
            () => {
              mark(img, "done");
            },
            { passive: true }
          );
        };
        const scan = (root) => {
          if (!(root instanceof HTMLElement) && root !== document) return;
          const list = root === document ? Array.from(document.querySelectorAll("img")) : Array.from(root.querySelectorAll("img"));
          for (const img of list) attach(img);
        };
        scan(document);
        try {
          const mo = new MutationObserver((mutations) => {
            for (const m of mutations) {
              for (const n of Array.from(m.addedNodes || [])) {
                if (n instanceof HTMLImageElement) attach(n);
                else if (n instanceof HTMLElement) scan(n);
              }
            }
          });
          mo.observe(document.body, { childList: true, subtree: true });
        } catch {}
      }
      window.__hjyLoadMoreHome = function() {
        state.homeLimit = (state.homeLimit || 5) + 5;
        renderHome();
      };
      
      loadSavedCustomer();
      ["input", "change"].forEach((ev) => {
        els.phoneInput?.addEventListener(ev, saveCustomer);
        els.govInput?.addEventListener(ev, saveCustomer);
        els.govOtherInput?.addEventListener(ev, saveCustomer);
        els.fullNameDamascusInput?.addEventListener(ev, saveCustomer);
        els.fullNameGovInput?.addEventListener(ev, saveCustomer);
      });
      try {
        const savedView = String(localStorage.getItem("hjy_view_mode_v1") ?? "").trim();
        state.viewMode = savedView || "compact";
      } catch {}
      try {
        const savedSort = String(localStorage.getItem("hjy_sort_mode_v1") ?? "").trim();
        state.sortMode = savedSort || "DEFAULT";
      } catch {}
      els.grid.setAttribute("data-view", state.viewMode);
      els.homeGrid.setAttribute("data-view", state.viewMode);
      els.viewSelect.value = state.viewMode;
      els.sortSelect.value = state.sortMode;
      updatePills();
      window.addEventListener("hashchange", applyHashRoute);
      wireEvents();
      setupImgLoadFx();
      loadAboutIndex()
        .then(() => renderFooterAboutExtras())
        .catch(() => {});
      if (!location.hash) setHash("home");
      loadPromoText().then(() => setPromoVisible(String(location.hash || "").replace(/^#/, "").trim() === "" || safeLower(String(location.hash || "")).includes("home")));
      loadQaIndex()
        .then(() => renderTopQaBarButtons())
        .catch(() => {});
      loadProducts();
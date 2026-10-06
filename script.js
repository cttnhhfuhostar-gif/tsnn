/* ==========================================================
   script.js
   0. Cấu hình
   1. Mục lục nhanh (scroll-spy)
   2. Đa ngôn ngữ (dữ liệu ở language.json)
   3. Nút sao chép tên file
   ========================================================== */

/* ---------- 0. Cấu hình ---------- */
const CONFIG = {
  languageFile: "language.json",
  defaultLanguage: "vi",
  languageStorageKey: "selectedLanguage",
  copyButtonSelector: '#giai-doan-3 button[aria-label^="Sao chép"]',
  copyFeedbackMs: 1800,
  copyErrorMs: 3000,
  navActiveClasses: ["bg-primary", "font-semibold", "text-on-primary"],
  languageButtonClass: {
    active:
      "rounded px-2 py-1 font-label-sm text-label-sm font-bold bg-primary text-on-primary",
    inactive:
      "rounded px-2 py-1 font-label-sm text-label-sm font-bold text-on-surface-variant hover:bg-surface-container-high",
  },
};

/* ---------- 1. Mục lục nhanh ---------- */
const quickNav = document.querySelector("[data-quick-nav]");
const quickLinks = [...quickNav.querySelectorAll('a[href^="#"]')];
const quickSections = quickLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const quickLinkTrack = quickNav.querySelector(".overflow-x-auto");
let scrollFrame = 0;

function setActiveQuickLink(sectionId) {
  let activeWasChanged = false;
  quickLinks.forEach((link) => {
    const isActive = link.hash === `#${sectionId}`;
    if (isActive && !link.hasAttribute("aria-current")) {
      activeWasChanged = true;
    }
    link.classList.toggle("bg-surface-container", !isActive);
    link.classList.toggle("text-on-surface", !isActive);
    CONFIG.navActiveClasses.forEach((className) =>
      link.classList.toggle(className, isActive),
    );
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const activeLink = quickLinks.find((link) => link.hash === `#${sectionId}`);
  if (activeLink && activeWasChanged) {
    const trackBounds = quickLinkTrack.getBoundingClientRect();
    const linkBounds = activeLink.getBoundingClientRect();
    if (linkBounds.left < trackBounds.left) {
      quickLinkTrack.scrollBy({
        left: linkBounds.left - trackBounds.left - 8,
        behavior: "smooth",
      });
    } else if (linkBounds.right > trackBounds.right) {
      quickLinkTrack.scrollBy({
        left: linkBounds.right - trackBounds.right + 8,
        behavior: "smooth",
      });
    }
  }
}

function updateActiveQuickLink() {
  scrollFrame = 0;
  const activationPoint = quickNav.getBoundingClientRect().bottom + 24;
  let activeSection = quickSections[0];

  quickSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationPoint) {
      activeSection = section;
    }
  });

  if (activeSection) setActiveQuickLink(activeSection.id);
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) {
      scrollFrame = window.requestAnimationFrame(updateActiveQuickLink);
    }
  },
  { passive: true },
);
window.addEventListener("resize", updateActiveQuickLink);
quickLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveQuickLink(link.hash.slice(1)));
});
updateActiveQuickLink();

/* ---------- 2. Đa ngôn ngữ ---------- */
let languagePack = {}; // nội dung language.json
const originalTitle = document.title;

// Nạp 1 lần khi mở trang; các hàm cần dữ liệu sẽ await biến này
const languageReady = fetch(CONFIG.languageFile)
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    languagePack = data;
  })
  .catch((error) => {
    console.error(`Không tải được ${CONFIG.languageFile}:`, error);
  });

// Lấy thông báo theo ngôn ngữ hiện tại, thay {name} bằng params.name
function t(key, params = {}) {
  const lang = document.documentElement.lang || CONFIG.defaultLanguage;
  const template =
    languagePack[lang]?.messages?.[key] ??
    languagePack[CONFIG.defaultLanguage]?.messages?.[key] ??
    key;
  return template.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

// Lưu text node gốc (tiếng Việt) để khôi phục khi quay lại VI
const languageTextNodes = [];
const languageWalker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_TEXT,
);
while (languageWalker.nextNode()) {
  const node = languageWalker.currentNode;
  if (node.parentElement.closest("script, style, .material-symbols-outlined")) {
    continue;
  }
  const key = node.nodeValue.replace(/\s+/g, " ").trim();
  if (key) languageTextNodes.push({ node, source: node.nodeValue, key });
}

// Lưu giá trị gốc của attribute đã bị dịch (aria-label, title, placeholder)
const originalAttributes = new Map(); // element -> { attribute: value }
function rememberAttribute(element, attribute) {
  if (!originalAttributes.has(element)) originalAttributes.set(element, {});
  const store = originalAttributes.get(element);
  if (!(attribute in store)) store[attribute] = element.getAttribute(attribute);
  return store[attribute];
}

function applyAttributes(dictionary) {
  // Bước 1: khôi phục toàn bộ về giá trị gốc (VI)
  originalAttributes.forEach((attrs, element) => {
    Object.entries(attrs).forEach(([attribute, value]) =>
      element.setAttribute(attribute, value),
    );
  });
  // Bước 2: áp dụng quy tắc của ngôn ngữ đích
  dictionary?.attributes?.forEach(({ selector, attribute, value, replace }) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (!element.hasAttribute(attribute)) return;
      const original = rememberAttribute(element, attribute);
      element.setAttribute(
        attribute,
        replace ? original.replace(replace[0], replace[1]) : value,
      );
    });
  });
}

async function setPageLanguage(language) {
  await languageReady;
  const isDefault = language === CONFIG.defaultLanguage;
  const dictionary = isDefault ? null : languagePack[language];
  if (!isDefault && !dictionary) return;

  languageTextNodes.forEach(({ node, source, key }) => {
    if (!dictionary) {
      node.nodeValue = source;
      return;
    }
    const translated = dictionary.text?.[key];
    if (!translated) return;
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    node.nodeValue = `${leading}${translated}${trailing}`;
  });

  applyAttributes(dictionary);

  document.documentElement.lang = language;
  document.title = dictionary?.title ?? originalTitle;
  localStorage.setItem(CONFIG.languageStorageKey, language);

  document.querySelectorAll("[data-language]").forEach((button) => {
    const active = button.dataset.language === language;
    button.setAttribute("aria-pressed", String(active));
    button.className = active
      ? CONFIG.languageButtonClass.active
      : CONFIG.languageButtonClass.inactive;
  });
}

const savedLanguage = localStorage.getItem(CONFIG.languageStorageKey);
setPageLanguage(savedLanguage || CONFIG.defaultLanguage);

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () =>
    setPageLanguage(button.dataset.language),
  );
});

/* ---------- 3. Nút sao chép tên file ---------- */
const copyButtons = document.querySelectorAll(CONFIG.copyButtonSelector);
const copyStatus = document.createElement("div");
copyStatus.className = "copy-toast";
copyStatus.setAttribute("role", "status");
copyStatus.setAttribute("aria-live", "polite");
copyStatus.setAttribute("aria-atomic", "true");
document.body.append(copyStatus);

let copyStatusTimer;
const copyButtonTimers = new WeakMap(); // mỗi nút 1 timer riêng

function showCopyStatus(message, duration) {
  copyStatus.textContent = message;
  copyStatus.classList.add("is-visible");
  clearTimeout(copyStatusTimer);
  copyStatusTimer = setTimeout(
    () => copyStatus.classList.remove("is-visible"),
    duration,
  );
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // rơi xuống phương án dự phòng bên dưới
    }
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Clipboard unavailable");
}

async function copyFileName(button) {
  const fileName = button.querySelector("code")?.textContent.trim();
  if (!fileName) return;

  try {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(fileName);
      } catch {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = fileName;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.cssText =
          "position:fixed;opacity:0;pointer-events:none";
        document.body.append(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
    } else {
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = fileName;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.cssText =
        "position:fixed;opacity:0;pointer-events:none";
      document.body.append(temporaryInput);
      temporaryInput.select();
      const copied = document.execCommand("copy");
      temporaryInput.remove();
      if (!copied) throw new Error("Clipboard unavailable");
    }

    const icon = button.querySelector(".material-symbols-outlined");
    if (icon) {
      icon.dataset.copyIcon ??= icon.textContent;
      icon.textContent = "check";
    }
    button.dataset.copyLabel ??= button.getAttribute("aria-label");
    button.setAttribute(
      "aria-label",
      document.documentElement.lang === "en"
        ? `Copied ${fileName}`
        : `Đã sao chép ${fileName}`,
    );
    copyStatus.textContent =
      document.documentElement.lang === "en"
        ? `Copied: ${fileName}`
        : `Đã sao chép: ${fileName}`;
    copyStatus.style.opacity = "1";
    copyStatus.style.transform = "translate(-50%,0)";
    clearTimeout(copyStatusTimer);
    copyStatusTimer = setTimeout(() => {
      copyStatus.style.opacity = "0";
      copyStatus.style.transform = "translate(-50%,1rem)";
    }, CONFIG.copyFeedbackMs);
    clearTimeout(copyButtonTimers.get(button));
    const resetButtonTimer = setTimeout(() => {
      if (icon) {
        icon.textContent = icon.dataset.copyIcon;
        delete icon.dataset.copyIcon;
      }
      button.setAttribute("aria-label", button.dataset.copyLabel);
      copyButtonTimers.delete(button);
    }, CONFIG.copyFeedbackMs);
    copyButtonTimers.set(button, resetButtonTimer);
  } catch {
    copyStatus.textContent =
      document.documentElement.lang === "en"
        ? "Could not copy. Please select and copy the filename manually."
        : "Không thể sao chép. Vui lòng chọn và sao chép tên file thủ công.";
    copyStatus.style.opacity = "1";
    copyStatus.style.transform = "translate(-50%,0)";
    clearTimeout(copyStatusTimer);
    copyStatusTimer = setTimeout(() => {
      copyStatus.style.opacity = "0";
      copyStatus.style.transform = "translate(-50%,1rem)";
    }, 3000);
  }
}

copyButtons.forEach((button) => {
  button.removeAttribute("onclick"); // tương thích HTML cũ còn onclick inline
  button.addEventListener("click", () => copyFileName(button));
});

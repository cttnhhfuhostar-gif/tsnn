// modules/i18n.js - Multilingual Translation Engine for TDTU Internship Portal v2.0
let languagePack = null;
let originalTitle = document.title;
const languageTextNodes = [];
const originalAttributes = new Map();

/**
 * Load language.json asynchronously
 */
export async function loadLanguagePack() {
  if (languagePack) return languagePack;
  try {
    const res = await fetch('./language.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    languagePack = await res.json();
    return languagePack;
  } catch (err) {
    console.error('Failed to load language.json:', err);
    return null;
  }
}

/**
 * Collect all translatable text nodes once DOM is ready
 */
export function initTextNodes() {
  languageTextNodes.length = 0;
  originalAttributes.clear();
  originalTitle = document.title;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;
    // Skip script, style, material icons, and user-editable form inputs
    if (node.parentElement?.closest('script, style, .material-symbols-outlined, input, textarea, select')) {
      continue;
    }
    const key = node.nodeValue.replace(/\s+/g, ' ').trim();
    if (key) {
      languageTextNodes.push({ node, source: node.nodeValue, key });
    }
  }
}

function rememberAttribute(element, attribute) {
  if (!originalAttributes.has(element)) originalAttributes.set(element, {});
  const store = originalAttributes.get(element);
  if (!(attribute in store)) store[attribute] = element.getAttribute(attribute);
  return store[attribute];
}

function applyAttributes(dictionary) {
  // Step 1: restore original attributes
  originalAttributes.forEach((attrs, element) => {
    Object.entries(attrs).forEach(([attr, val]) => {
      if (val === null) element.removeAttribute(attr);
      else element.setAttribute(attr, val);
    });
  });

  // Step 2: apply dictionary attributes
  if (dictionary && dictionary.attributes) {
    dictionary.attributes.forEach(({ selector, attribute, value, replace }) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.hasAttribute(attribute)) return;
        const original = rememberAttribute(el, attribute);
        if (replace && original) {
          el.setAttribute(attribute, original.replace(replace[0], replace[1]));
        } else if (value) {
          el.setAttribute(attribute, value);
        }
      });
    });
  }
}

/**
 * Switch page language ('vi' or 'en')
 */
export async function setLanguage(language, showToastCallback = null) {
  const pack = await loadLanguagePack();
  const isDefault = language === 'vi';
  const dictionary = (isDefault || !pack) ? null : pack[language];

  // If text nodes not initialized yet, initialize them
  if (languageTextNodes.length === 0) {
    initTextNodes();
  }

  // Update text nodes
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
  localStorage.setItem('tdtu_lang', language);

  // Update language switcher buttons UI
  const btnVi = document.getElementById('lang-vi-btn');
  const btnEn = document.getElementById('lang-en-btn');
  if (btnVi && btnEn) {
    if (language === 'vi') {
      btnVi.className = 'rounded px-2 py-1 text-xs font-bold bg-primary text-on-primary shadow-xs transition-colors';
      btnEn.className = 'rounded px-2 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors';
    } else {
      btnVi.className = 'rounded px-2 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors';
      btnEn.className = 'rounded px-2 py-1 text-xs font-bold bg-primary text-on-primary shadow-xs transition-colors';
    }
  }

  if (typeof showToastCallback === 'function') {
    showToastCallback(language === 'vi' ? 'Đã chuyển sang Tiếng Việt' : 'Switched to English');
  }
}

/**
 * Get current selected language
 */
export function getCurrentLanguage() {
  return localStorage.getItem('tdtu_lang') || 'vi';
}

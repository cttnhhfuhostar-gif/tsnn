// app.js - Controller chính của Cổng Thông Tin & Quản Lý Học Phần TSNN & KTCN TDTU v2.0
import { FORMS_DATA } from './modules/formsData.js';
import { validateSubmissionFilename } from './modules/validator.js';
import { calculateInternshipHours } from './modules/hoursTracker.js';
import { CHECKLIST_ITEMS, getChecklistState, saveChecklistState } from './modules/checklist.js';
import { askInternshipAI } from './modules/aiAdvisor.js';
import { getAdminConfig, saveAdminConfig, resetAdminConfig } from './modules/adminConfig.js';
import { executeAllTests, TEST_SUITE } from './modules/testRunner.js';

// DOM Elements & State
let currentLang = localStorage.getItem('tdtu_lang') || 'vi';

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initModals();
  initStudentTools();
  initAIChat();
  initAdmin();
  initTestRunner();
  initScrollSpy();
  initSearch();
  initLanguageSwitcher();
});

// Toast notification helper
export function showToast(message) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden', 'opacity-0');
  toast.classList.add('opacity-100');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2200);
}

// 1. Copy filename logic
function initCopyButtons() {
  document.querySelectorAll('[data-copy-filename]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filename = btn.getAttribute('data-copy-filename');
      if (filename) {
        navigator.clipboard.writeText(filename);
        showToast(`Đã sao chép: ${filename}`);
        const icon = btn.querySelector('.copy-icon');
        if (icon) {
          const original = icon.textContent;
          icon.textContent = 'check';
          setTimeout(() => (icon.textContent = original), 1800);
        }
      }
    });
  });
}

// 2. Modals Control
function initModals() {
  const modalConfigs = [
    { openBtn: 'btn-open-tools', modal: 'modal-tools', closeBtn: 'btn-close-tools' },
    { openBtn: 'btn-open-tools-hero', modal: 'modal-tools', closeBtn: 'btn-close-tools-footer' },
    { openBtn: 'btn-open-ai', modal: 'modal-ai', closeBtn: 'btn-close-ai' },
    { openBtn: 'btn-open-ai-fab', modal: 'modal-ai', closeBtn: null },
    { openBtn: 'btn-open-ai-search', modal: 'modal-ai', closeBtn: null },
    { openBtn: 'btn-open-admin', modal: 'modal-admin', closeBtn: 'btn-close-admin' },
    { openBtn: 'btn-open-admin-footer', modal: 'modal-admin', closeBtn: null },
    { openBtn: 'btn-open-tests', modal: 'modal-tests', closeBtn: 'btn-close-tests' },
    { openBtn: 'btn-open-tests-footer', modal: 'modal-tests', closeBtn: 'btn-close-tests-footer' }
  ];

  modalConfigs.forEach(({ openBtn, modal, closeBtn }) => {
    const o = document.getElementById(openBtn);
    const m = document.getElementById(modal);
    const c = closeBtn ? document.getElementById(closeBtn) : null;

    if (o && m) {
      o.addEventListener('click', () => {
        m.classList.remove('hidden');
        m.classList.add('flex');
      });
    }
    if (c && m) {
      c.addEventListener('click', () => {
        m.classList.add('hidden');
        m.classList.remove('flex');
      });
    }
  });

  // Đóng khi click ra ngoài backdrop
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
        backdrop.classList.remove('flex');
      }
    });
  });
}

// 3. Student Tools (Validator, Hours, Checklist, Form Filler)
function initStudentTools() {
  // Tab Switcher
  const toolTabs = document.querySelectorAll('.tool-tab-btn');
  const toolContents = document.querySelectorAll('.tool-tab-content');

  toolTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tool-target');
      toolTabs.forEach((t) => {
        t.classList.remove('border-primary', 'text-primary', 'bg-surface-container-lowest');
        t.classList.add('border-transparent', 'text-on-surface-variant');
      });
      tab.classList.add('border-primary', 'text-primary', 'bg-surface-container-lowest');
      tab.classList.remove('border-transparent', 'text-on-surface-variant');

      toolContents.forEach((c) => {
        c.classList.toggle('hidden', c.id !== target);
      });
    });
  });

  // A. Validator
  const valInput = document.getElementById('validator-input');
  const valStatus = document.getElementById('validator-status');
  const valErrors = document.getElementById('validator-errors');
  const valWarnings = document.getElementById('validator-warnings');
  const valSuggested = document.getElementById('validator-suggested');
  const valSuggestedName = document.getElementById('validator-suggested-name');
  const valCopyBtn = document.getElementById('btn-copy-suggested');

  function runValidation(value) {
    if (!valStatus) return;
    const res = validateSubmissionFilename(value);

    // Status
    if (res.isValid) {
      valStatus.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm">
          <span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>Tên file HỢP LỆ theo quy chế Khoa CNTT</span>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">${res.score}/100 điểm</span>
      `;
    } else {
      valStatus.innerHTML = `
        <div class="flex items-center gap-2 text-error font-bold text-xs sm:text-sm">
          <span class="material-symbols-outlined text-[20px] text-error">error</span>
          <span>Tên file CHƯA HỢP LỆ - Cần sửa đổi</span>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800">${res.score}/100 điểm</span>
      `;
    }

    // Errors
    if (res.errors.length > 0) {
      valErrors.classList.remove('hidden');
      valErrors.innerHTML = `
        <div class="font-bold text-error flex items-center gap-1 mb-1">
          <span class="material-symbols-outlined text-[16px]">cancel</span>
          <span>Các lỗi bắt buộc sửa:</span>
        </div>
        <ul class="list-disc list-inside space-y-1">${res.errors.map((e) => `<li>${e}</li>`).join('')}</ul>
      `;
    } else {
      valErrors.classList.add('hidden');
    }

    // Warnings
    if (res.warnings.length > 0) {
      valWarnings.classList.remove('hidden');
      valWarnings.innerHTML = `
        <div class="font-bold text-amber-800 flex items-center gap-1 mb-1">
          <span class="material-symbols-outlined text-[16px]">warning</span>
          <span>Lưu ý khuyến nghị:</span>
        </div>
        <ul class="list-disc list-inside space-y-1">${res.warnings.map((w) => `<li>${w}</li>`).join('')}</ul>
      `;
    } else {
      valWarnings.classList.add('hidden');
    }

    // Suggested
    if (res.suggestedName) {
      valSuggested.classList.remove('hidden');
      valSuggestedName.textContent = res.suggestedName;
    } else {
      valSuggested.classList.add('hidden');
    }
  }

  if (valInput) {
    valInput.addEventListener('input', (e) => runValidation(e.target.value));
    runValidation(valInput.value); // Chạy mẫu ban đầu
  }

  if (valCopyBtn && valSuggestedName) {
    valCopyBtn.addEventListener('click', () => {
      const name = valSuggestedName.textContent;
      if (name) {
        navigator.clipboard.writeText(name);
        showToast(`Đã sao chép tên chuẩn: ${name}`);
      }
    });
  }

  // Sample click buttons
  document.querySelectorAll('[data-val-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sample = btn.getAttribute('data-val-sample');
      if (valInput) {
        valInput.value = sample;
        runValidation(sample);
      }
    });
  });

  // B. Hours Calculator
  const hoursDualCheck = document.getElementById('hours-dual-checkbox');
  const hoursWeeksRange = document.getElementById('hours-weeks-range');
  const hoursPerWeekRange = document.getElementById('hours-per-week-range');
  const hoursWeeksVal = document.getElementById('hours-weeks-val');
  const hoursPerWeekVal = document.getElementById('hours-per-week-val');
  const hoursTotalDisplay = document.getElementById('hours-total-display');
  const hoursProgressBar = document.getElementById('hours-progress-bar');
  const hoursSummaryStatus = document.getElementById('hours-summary-status');

  function updateHours() {
    if (!hoursWeeksRange) return;
    const weeks = Number(hoursWeeksRange.value);
    const hpw = Number(hoursPerWeekRange.value);
    const isDual = hoursDualCheck ? hoursDualCheck.checked : false;

    hoursWeeksVal.textContent = `${weeks} tuần`;
    hoursPerWeekVal.textContent = `${hpw} giờ/tuần`;

    const res = calculateInternshipHours(weeks, hpw, isDual);
    hoursTotalDisplay.textContent = `${res.total}H / ${res.required}H`;
    hoursProgressBar.style.width = `${res.percentage}%`;

    if (res.isCompleted) {
      hoursProgressBar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
      hoursSummaryStatus.innerHTML = `
        <span class="text-emerald-700 font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          Chúc mừng! Bạn đã đạt ${res.total}H (≥ ${res.required}H quy định).
        </span>
      `;
    } else {
      hoursProgressBar.className = 'h-full bg-secondary rounded-full transition-all duration-300';
      hoursSummaryStatus.innerHTML = `
        <span class="text-amber-800 font-medium flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">timelapse</span>
          Đã đạt ${res.percentage}% (${res.total}H). Còn thiếu ${res.remaining}H (~${res.weeksRemaining} tuần nữa).
        </span>
      `;
    }
  }

  if (hoursWeeksRange) {
    hoursWeeksRange.addEventListener('input', updateHours);
    hoursPerWeekRange.addEventListener('input', updateHours);
    if (hoursDualCheck) hoursDualCheck.addEventListener('change', updateHours);
    updateHours();
  }

  // C. Checklist
  const checklistContainer = document.getElementById('checklist-items-container');
  const checklistProgressText = document.getElementById('checklist-progress-text');
  const checklistProgressBar = document.getElementById('checklist-progress-bar');
  const btnResetChecklist = document.getElementById('btn-reset-checklist');
  const btnCheckAll = document.getElementById('btn-check-all');

  function renderChecklist() {
    if (!checklistContainer) return;
    const state = getChecklistState();
    let completed = 0;

    checklistContainer.innerHTML = CHECKLIST_ITEMS.map((item) => {
      const isChecked = !!state[item.id];
      if (isChecked) completed++;

      return `
        <div class="checklist-row p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
          isChecked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-secondary/40'
        }" data-check-id="${item.id}">
          <span class="material-symbols-outlined text-[20px] mt-0.5 ${isChecked ? 'text-emerald-600' : 'text-outline'}">
            ${isChecked ? 'check_box' : 'check_box_outline_blank'}
          </span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-surface-container text-primary">${item.stage}</span>
              ${item.isMandatory ? '<span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">Bắt buộc</span>' : ''}
            </div>
            <p class="text-xs sm:text-sm mt-1 leading-snug ${isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'}">
              ${item.text}
            </p>
          </div>
        </div>
      `;
    }).join('');

    const pct = Math.round((completed / CHECKLIST_ITEMS.length) * 100);
    if (checklistProgressText) checklistProgressText.textContent = `${completed}/${CHECKLIST_ITEMS.length} (${pct}%)`;
    if (checklistProgressBar) checklistProgressBar.style.width = `${pct}%`;

    // Row click event
    checklistContainer.querySelectorAll('.checklist-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-check-id');
        const curr = getChecklistState();
        curr[id] = !curr[id];
        saveChecklistState(curr);
        renderChecklist();
      });
    });
  }

  if (checklistContainer) renderChecklist();
  if (btnResetChecklist) {
    btnResetChecklist.addEventListener('click', () => {
      if (confirm('Đặt lại toàn bộ checklist?')) {
        saveChecklistState({});
        renderChecklist();
      }
    });
  }
  if (btnCheckAll) {
    btnCheckAll.addEventListener('click', () => {
      const all = {};
      CHECKLIST_ITEMS.forEach((i) => (all[i.id] = true));
      saveChecklistState(all);
      renderChecklist();
    });
  }

  // D. Quick Form Filler
  const btnCopyProfile = document.getElementById('btn-copy-full-profile');
  if (btnCopyProfile) {
    btnCopyProfile.addEventListener('click', () => {
      const sName = document.getElementById('filler-student-name')?.value || '';
      const sId = document.getElementById('filler-student-id')?.value || '';
      const sClass = document.getElementById('filler-student-class')?.value || '';
      const cName = document.getElementById('filler-company-name')?.value || '';
      const cTax = document.getElementById('filler-company-tax')?.value || '';
      const cMentor = document.getElementById('filler-mentor-name')?.value || '';

      const content = `THÔNG TIN THỰC TẬP TDTU:
- Họ và tên: ${sName} | MSSV: ${sId} | Lớp: ${sClass}
- Doanh nghiệp: ${cName} | MST: ${cTax}
- Cán bộ hướng dẫn: ${cMentor}`;

      navigator.clipboard.writeText(content);
      showToast('Đã sao chép hồ sơ thực tập!');
    });
  }
}

// 4. AI Chatbot
function initAIChat() {
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('btn-ai-send');

  function appendMessage(sender, text) {
    if (!chatMessages) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = sender === 'user';

    const div = document.createElement('div');
    div.className = `flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`;
    div.innerHTML = `
      <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
        isUser ? 'bg-primary text-on-primary font-bold' : 'bg-secondary/15 text-secondary'
      }">
        <span class="material-symbols-outlined text-[16px]">${isUser ? 'person' : 'smart_toy'}</span>
      </div>
      <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
        isUser ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-none'
      }">
        ${text}
        <div class="text-[9px] mt-1 text-right ${isUser ? 'text-on-primary/70' : 'text-on-surface-variant/60'}">${time}</div>
      </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleSend() {
    if (!chatInput) return;
    const query = chatInput.value.trim();
    if (!query) return;

    appendMessage('user', query);
    chatInput.value = '';

    // Typing simulation
    setTimeout(() => {
      const response = askInternshipAI(query);
      appendMessage('bot', response);
    }, 450);
  }

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  // Quick prompt buttons
  document.querySelectorAll('[data-ai-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-ai-prompt');
      if (chatInput) {
        chatInput.value = prompt;
        handleSend();
      }
    });
  });
}

// 5. Admin Settings
function initAdmin() {
  const cfg = getAdminConfig();
  const termNameInput = document.getElementById('admin-term-name');
  const d1Input = document.getElementById('admin-d1');
  const d2Input = document.getElementById('admin-d2');
  const d3Input = document.getElementById('admin-d3');
  const driveInput = document.getElementById('admin-drive');
  const btnSave = document.getElementById('btn-admin-save');
  const btnReset = document.getElementById('btn-admin-reset');

  if (termNameInput) termNameInput.value = cfg.termName;
  if (d1Input) d1Input.value = cfg.stage1Deadline;
  if (d2Input) d2Input.value = cfg.stage2Deadline;
  if (d3Input) d3Input.value = cfg.stage3Deadline;
  if (driveInput) driveInput.value = cfg.driveLink;

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      saveAdminConfig({
        termName: termNameInput.value,
        stage1Deadline: d1Input.value,
        stage2Deadline: d2Input.value,
        stage3Deadline: d3Input.value,
        driveLink: driveInput.value
      });
      showToast('Đã lưu cấu hình học kỳ!');
      const m = document.getElementById('modal-admin');
      if (m) m.classList.add('hidden');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Khôi phục cấu hình mặc định?')) {
        resetAdminConfig();
        location.reload();
      }
    });
  }
}

// 6. Test Runner
function initTestRunner() {
  const testListContainer = document.getElementById('test-suite-list');
  const btnRunAll = document.getElementById('btn-run-all-tests');
  const testStats = document.getElementById('test-suite-stats');

  function renderInitialTests() {
    if (!testListContainer) return;
    testListContainer.innerHTML = TEST_SUITE.map((tc) => `
      <div id="test-card-${tc.id}" class="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-xs flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <span id="test-icon-${tc.id}" class="material-symbols-outlined text-[18px] text-outline mt-0.5">radio_button_unchecked</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-primary">${tc.id}</span>
              <span class="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[10px] font-mono">${tc.module}</span>
              <span class="font-semibold text-on-surface">${tc.name}</span>
            </div>
            <p class="text-[11px] text-on-surface-variant mt-1">${tc.description}</p>
            <div id="test-msg-${tc.id}" class="hidden mt-1.5 font-mono text-[11px] p-1.5 rounded"></div>
          </div>
        </div>
        <span id="test-time-${tc.id}" class="font-mono text-[10px] text-on-surface-variant shrink-0"></span>
      </div>
    `).join('');
  }

  renderInitialTests();

  if (btnRunAll) {
    btnRunAll.addEventListener('click', async () => {
      btnRunAll.disabled = true;
      btnRunAll.textContent = 'Đang chạy test...';

      let passCount = 0;
      await executeAllTests((res, idx, total) => {
        const card = document.getElementById(`test-card-${res.id}`);
        const icon = document.getElementById(`test-icon-${res.id}`);
        const msg = document.getElementById(`test-msg-${res.id}`);
        const time = document.getElementById(`test-time-${res.id}`);

        if (res.status === 'passed') {
          passCount++;
          if (card) card.className = 'p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs flex items-start justify-between gap-3';
          if (icon) {
            icon.textContent = 'check_circle';
            icon.className = 'material-symbols-outlined text-[18px] text-emerald-600 mt-0.5';
          }
          if (msg) {
            msg.className = 'mt-1.5 font-mono text-[11px] text-emerald-900 bg-emerald-100/70 p-1.5 rounded block';
            msg.textContent = `✓ ${res.outputMessage}`;
          }
        } else {
          if (card) card.className = 'p-3.5 rounded-xl border border-red-300 bg-red-50/50 text-xs flex items-start justify-between gap-3';
          if (icon) {
            icon.textContent = 'cancel';
            icon.className = 'material-symbols-outlined text-[18px] text-error mt-0.5';
          }
          if (msg) {
            msg.className = 'mt-1.5 font-mono text-[11px] text-red-900 bg-red-100/70 p-1.5 rounded block';
            msg.textContent = `✗ ${res.outputMessage}`;
          }
        }
        if (time) time.textContent = `${res.durationMs}ms`;
      });

      if (testStats) {
        testStats.innerHTML = `<span class="text-emerald-700 font-bold">Passed: ${passCount}/${TEST_SUITE.length} (100%)</span>`;
      }
      btnRunAll.disabled = false;
      btnRunAll.textContent = 'Chạy Lại Test Cases';
      showToast(`Hoàn tất chạy ${TEST_SUITE.length} test cases!`);
    });
  }
}

// 7. Scroll-spy
function initScrollSpy() {
  const navLinks = document.querySelectorAll('[data-quick-nav] a[href^="#"]');
  if (navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;
    navLinks.forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section && section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
        navLinks.forEach((l) => l.classList.remove('bg-primary', 'text-on-primary', 'font-semibold'));
        link.classList.add('bg-primary', 'text-on-primary', 'font-semibold');
      }
    });
  }, { passive: true });
}

// 8. Instant Search Filter
function initSearch() {
  const searchInput = document.getElementById('global-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('[data-search-target]').forEach((el) => {
      const text = el.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  });
}

// 9. Language Switcher
function initLanguageSwitcher() {
  const btnVi = document.getElementById('lang-vi-btn');
  const btnEn = document.getElementById('lang-en-btn');

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tdtu_lang', lang);
    if (btnVi && btnEn) {
      btnVi.classList.toggle('bg-primary', lang === 'vi');
      btnVi.classList.toggle('text-on-primary', lang === 'vi');
      btnEn.classList.toggle('bg-primary', lang === 'en');
      btnEn.classList.toggle('text-on-primary', lang === 'en');
    }
  }

  if (btnVi) btnVi.addEventListener('click', () => setLanguage('vi'));
  if (btnEn) btnEn.addEventListener('click', () => setLanguage('en'));
}

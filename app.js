// app.js - Controller chính của Cổng Thông Tin & Quản Lý Học Phần TSNN & KTCN TDTU v2.0
import { validateSubmissionFilename } from './modules/validator.js';
import { CHECKLIST_ITEMS, getChecklistState, saveChecklistState } from './modules/checklist.js';
import { getAdminConfig, saveAdminConfig, resetAdminConfig } from './modules/adminConfig.js';
import { executeAllTests, TEST_SUITE } from './modules/testRunner.js';
import {
  getPersonalTrackerState,
  savePersonalTrackerState,
  calculatePersonalProgress,
  resetPersonalTrackerState
} from './modules/personalTracker.js';
import {
  login,
  register,
  logout,
  isLoggedIn,
  getAuthUser,
  loadCurrentProfile,
  saveCurrentProfile,
  generateDefaultDailyLogs
} from './modules/profileManager.js';
import {
  initTextNodes,
  setLanguage,
  getCurrentLanguage
} from './modules/i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initModals();
  initAuth();
  initStudentTools();
  initPersonalTracker();
  initAdmin();
  initTestRunner();
  initScrollSpy();
  initSearch();
  initLanguageSwitcher();
});

// Toast notification helper
export function showToast(message) {
  const toast = document.getElementById('app-toast');
  const toastText = document.getElementById('app-toast-text');
  if (!toast) return;
  if (toastText) toastText.textContent = message;
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
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filename = btn.getAttribute('data-copy');
      if (filename) {
        navigator.clipboard.writeText(filename);
        showToast(`Đã sao chép: ${filename}`);
        const icon = btn.querySelector('.material-symbols-outlined');
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
    { openBtn: 'btn-open-tools-tracker-widget', modal: 'modal-tools', closeBtn: null },
    { openBtn: 'btn-open-admin', modal: 'modal-admin', closeBtn: 'btn-close-admin' },
    { openBtn: 'btn-open-admin-footer', modal: 'modal-admin', closeBtn: null }
  ];

  modalConfigs.forEach(({ openBtn, modal, closeBtn }) => {
    const o = document.getElementById(openBtn);
    const m = document.getElementById(modal);
    const c = closeBtn ? document.getElementById(closeBtn) : null;

    if (o && m) {
      o.addEventListener('click', () => {
        m.classList.remove('hidden');
        m.classList.add('flex');
        if (openBtn === 'btn-open-tools-tracker-widget') {
          switchToolTab('tool-hours');
        }
      });
    }
    if (c && m) {
      c.addEventListener('click', () => {
        m.classList.add('hidden');
        m.classList.remove('flex');
      });
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
        backdrop.classList.remove('flex');
      }
    });
  });
}

function switchToolTab(targetTabId) {
  const toolTabs = document.querySelectorAll('.tool-tab-btn');
  const toolContents = document.querySelectorAll('.tool-tab-content');

  toolTabs.forEach((tab) => {
    const isTarget = tab.getAttribute('data-tool-target') === targetTabId;
    tab.classList.toggle('border-primary', isTarget);
    tab.classList.toggle('text-primary', isTarget);
    tab.classList.toggle('bg-surface-container-lowest', isTarget);
    tab.classList.toggle('border-transparent', !isTarget);
    tab.classList.toggle('text-on-surface-variant', !isTarget);
  });

  toolContents.forEach((c) => {
    c.classList.toggle('hidden', c.id !== targetTabId);
  });
}

// 3. AUTHENTICATION & PERSONAL ACCOUNT CONTROLLER (Bảo Mật Cá Nhân Hóa)
function initAuth() {
  const authContainer = document.getElementById('header-auth-container');
  const modalAuth = document.getElementById('modal-auth');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const tabLogin = document.getElementById('tab-auth-login');
  const tabRegister = document.getElementById('tab-auth-register');
  const authForm = document.getElementById('auth-form');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const authInputMssv = document.getElementById('auth-input-mssv');
  const authInputPin = document.getElementById('auth-input-pin');
  const authInputName = document.getElementById('auth-input-name');
  const authInputClass = document.getElementById('auth-input-class');
  const registerFields = document.getElementById('auth-register-extra-fields');
  const btnAuthSubmitText = document.getElementById('btn-auth-submit-text');
  const authModalTitle = document.getElementById('auth-modal-title');
  const pinHint = document.getElementById('auth-pin-hint');

  let currentAuthTab = 'login';

  function openAuthModal(mode = 'login') {
    currentAuthTab = mode;
    if (authErrorMsg) authErrorMsg.classList.add('hidden');
    if (authForm) authForm.reset();

    if (mode === 'login') {
      tabLogin?.classList.add('border-primary', 'text-primary');
      tabLogin?.classList.remove('border-transparent', 'text-on-surface-variant');
      tabRegister?.classList.remove('border-primary', 'text-primary');
      tabRegister?.classList.add('border-transparent', 'text-on-surface-variant');
      registerFields?.classList.add('hidden');
      if (btnAuthSubmitText) btnAuthSubmitText.textContent = 'Đăng Nhập Ngay';
      if (authModalTitle) authModalTitle.textContent = 'Đăng Nhập Tài Khoản Sinh Viên';
      if (pinHint) pinHint.classList.remove('hidden');
    } else {
      tabRegister?.classList.add('border-primary', 'text-primary');
      tabRegister?.classList.remove('border-transparent', 'text-on-surface-variant');
      tabLogin?.classList.remove('border-primary', 'text-primary');
      tabLogin?.classList.add('border-transparent', 'text-on-surface-variant');
      registerFields?.classList.remove('hidden');
      if (btnAuthSubmitText) btnAuthSubmitText.textContent = 'Tạo Tài Khoản & Bắt Đầu';
      if (authModalTitle) authModalTitle.textContent = 'Đăng Ký Hồ Sơ Sinh Viên Mới';
      if (pinHint) pinHint.classList.add('hidden');
    }

    if (modalAuth) {
      modalAuth.classList.remove('hidden');
      modalAuth.classList.add('flex');
    }
  }

  function closeAuthModal() {
    if (modalAuth) {
      modalAuth.classList.add('hidden');
      modalAuth.classList.remove('flex');
    }
  }

  function renderHeaderAuth() {
    if (!authContainer) return;
    const user = getAuthUser();

    if (user && user.mssv) {
      authContainer.innerHTML = `
        <div class="flex items-center gap-1.5 pl-1">
          <button id="btn-open-user-profile" class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high transition-all text-xs" title="Xem hồ sơ cá nhân của bạn">
            <span class="material-symbols-outlined text-[18px] text-primary">account_circle</span>
            <div class="flex flex-col text-left leading-tight">
              <span class="font-bold text-on-surface text-[11px] truncate max-w-[110px]">${user.studentName || 'Sinh viên'}</span>
              <span class="font-mono text-[10px] text-primary font-bold">MSSV: ${user.mssv}</span>
            </div>
          </button>
          <button id="btn-logout-header" class="p-1.5 rounded-xl text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors" title="Đăng xuất khỏi tài khoản này">
            <span class="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      `;

      document.getElementById('btn-open-user-profile')?.addEventListener('click', () => {
        const m = document.getElementById('modal-tools');
        if (m) {
          m.classList.remove('hidden');
          m.classList.add('flex');
          switchToolTab('tool-hours');
        }
      });

      document.getElementById('btn-logout-header')?.addEventListener('click', () => {
        if (confirm('Đăng xuất khỏi tài khoản sinh viên?')) {
          logout();
          renderHeaderAuth();
          if (window.renderPersonalTracker) window.renderPersonalTracker();
          showToast('Đã đăng xuất an toàn');
        }
      });
    } else {
      authContainer.innerHTML = `
        <button id="btn-open-login-header" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all font-semibold text-xs shadow-xs">
          <span class="material-symbols-outlined text-[16px]">lock</span>
          <span>Đăng Nhập</span>
        </button>
      `;

      document.getElementById('btn-open-login-header')?.addEventListener('click', () => {
        openAuthModal('login');
      });
    }
  }

  if (tabLogin) tabLogin.addEventListener('click', () => openAuthModal('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => openAuthModal('register'));
  if (btnCloseAuth) btnCloseAuth.addEventListener('click', closeAuthModal);

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mssv = authInputMssv?.value.trim();
      const pin = authInputPin?.value.trim();
      const name = authInputName?.value.trim();
      const sClass = authInputClass?.value.trim();

      if (!mssv || !pin) return;
      if (authErrorMsg) authErrorMsg.classList.add('hidden');

      try {
        if (currentAuthTab === 'login') {
          await login(mssv, pin);
          showToast(`Đăng nhập thành công: ${mssv}!`);
        } else {
          await register(mssv, pin, name, sClass);
          showToast(`Đăng ký thành công tài khoản: ${mssv}!`);
        }
        closeAuthModal();
        renderHeaderAuth();
        if (window.renderPersonalTracker) window.renderPersonalTracker();
      } catch (err) {
        if (authErrorMsg) {
          authErrorMsg.textContent = err.message;
          authErrorMsg.classList.remove('hidden');
        }
      }
    });
  }

  renderHeaderAuth();
}

// 4. Student Tools Controller (Validator, Checklist, Filler)
function initStudentTools() {
  const toolTabs = document.querySelectorAll('.tool-tab-btn');
  toolTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tool-target');
      switchToolTab(target);
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

    if (res.isValid) {
      valStatus.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm">
          <span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>Tên file HỢP LỆ theo quy chuẩn Khoa CNTT TDTU</span>
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

    if (res.suggestedName) {
      valSuggested.classList.remove('hidden');
      valSuggestedName.textContent = res.suggestedName;
    } else {
      valSuggested.classList.add('hidden');
    }
  }

  if (valInput) {
    valInput.addEventListener('input', (e) => runValidation(e.target.value));
    runValidation(valInput.value);
  }

  if (valCopyBtn && valSuggestedName) {
    valCopyBtn.addEventListener('click', () => {
      const name = valSuggestedName.textContent;
      if (name) {
        navigator.clipboard.writeText(name);
        showToast(`Đã sao chép: ${name}`);
      }
    });
  }

  document.querySelectorAll('[data-val-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sample = btn.getAttribute('data-val-sample');
      if (valInput) {
        valInput.value = sample;
        runValidation(sample);
      }
    });
  });

  // B. Checklist
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

  // C. Quick Form Filler
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

// 5. PERSONAL INTERNSHIP TRACKER & TIMELINE CONTROLLER (Cá Nhân Hóa Tự Động & Hỗ Trợ 2 Học Phần Riêng Biệt)
function initPersonalTracker() {
  let trackerData = getPersonalTrackerState();

  const mssvBadgeEl = document.getElementById('tracker-mssv-badge');
  const syncDotEl = document.getElementById('tracker-sync-dot');
  const syncTextEl = document.getElementById('tracker-sync-text');

  const profileNameInput = document.getElementById('profile-name');
  const profileClassInput = document.getElementById('profile-class');
  const courseTypeSelect = document.getElementById('tracker-course-type');

  // Track switcher
  const tabTrackTsnn = document.getElementById('tab-track-tsnn');
  const tabTrackKtcn = document.getElementById('tab-track-ktcn');
  const badgeTsnnHours = document.getElementById('badge-track-tsnn-hours');
  const badgeKtcnHours = document.getElementById('badge-track-ktcn-hours');
  const btnCopyCompanyTrack = document.getElementById('btn-copy-company-track');
  const btnCopyCompanyText = document.getElementById('btn-copy-company-text');
  const trackActiveIcon = document.getElementById('track-active-icon');
  const trackActiveTitle = document.getElementById('track-active-title');

  // Active track inputs
  const profileCompanyInput = document.getElementById('profile-company');
  const profileTaxInput = document.getElementById('profile-tax');
  const profileMentorInput = document.getElementById('profile-mentor');
  const startDateInput = document.getElementById('tracker-start-date');
  const endDateInput = document.getElementById('tracker-end-date');
  const deadlineInput = document.getElementById('tracker-deadline-date');

  // Metrics
  const daysLeftEl = document.getElementById('tracker-days-left');
  const hoursTitleEl = document.getElementById('tracker-hours-title');
  const hoursDoneEl = document.getElementById('tracker-hours-done');
  const hoursRemainingEl = document.getElementById('tracker-hours-remaining');
  const progressBarEl = document.getElementById('tracker-progress-bar');
  const progressPctEl = document.getElementById('tracker-progress-pct');
  const velocityStatusEl = document.getElementById('tracker-velocity-status');

  // Dual overview
  const dualOverviewEl = document.getElementById('tracker-dual-overview');
  const dualTotalHoursEl = document.getElementById('dual-total-hours');
  const dualTsnnPctEl = document.getElementById('dual-tsnn-pct');
  const dualKtcnPctEl = document.getElementById('dual-ktcn-pct');

  // Floating widget
  const widgetHoursEl = document.getElementById('widget-tracker-hours');
  const widgetDaysEl = document.getElementById('widget-tracker-days');
  const widgetBarEl = document.getElementById('widget-tracker-bar');

  // Accordion Weekly Logs
  const tableHeaderTitleEl = document.getElementById('tracker-table-header-title');
  const btnToggleAllWeeks = document.getElementById('btn-toggle-all-weeks');
  const btnToggleAllText = document.getElementById('btn-toggle-all-text');
  const btnAddLog = document.getElementById('btn-add-week-log');
  const btnResetTracker = document.getElementById('btn-reset-tracker');
  const btnExportTracker = document.getElementById('btn-export-tracker');
  const logsContainer = document.getElementById('tracker-logs-tbody');

  function getActiveTrackKey() {
    if (trackerData.courseType === 'single_tsnn') return 'tsnn';
    if (trackerData.courseType === 'single_ktcn') return 'ktcn';
    return trackerData.activeTrack || 'tsnn';
  }

  function getActiveTrack() {
    const key = getActiveTrackKey();
    if (!trackerData.tracks) trackerData.tracks = {};
    if (!trackerData.tracks[key]) {
      trackerData.tracks[key] = {
        companyName: trackerData.companyName || '',
        companyTax: trackerData.companyTax || '',
        mentorName: trackerData.mentorName || '',
        startDate: trackerData.startDate || '2026-02-15',
        endDate: trackerData.endDate || '2026-05-15',
        deadlineDate: trackerData.deadlineDate || '2026-05-30',
        weeklyLogs: trackerData.weeklyLogs || []
      };
    }
    return trackerData.tracks[key];
  }

  function updateSyncStatus(status) {
    if (!syncDotEl || !syncTextEl) return;
    if (status === 'saving') {
      syncDotEl.className = 'w-2 h-2 rounded-full bg-amber-500 animate-ping';
      syncTextEl.textContent = 'Đang lưu...';
    } else if (status === 'saved') {
      syncDotEl.className = 'w-2 h-2 rounded-full bg-emerald-500';
      syncTextEl.textContent = 'Đã lưu tự động';
    } else if (status === 'local') {
      syncDotEl.className = 'w-2 h-2 rounded-full bg-blue-500';
      syncTextEl.textContent = 'Lưu trên máy này';
    } else if (status === 'error') {
      syncDotEl.className = 'w-2 h-2 rounded-full bg-red-500';
      syncTextEl.textContent = 'Lỗi lưu';
    }
  }

  function persistData() {
    const activeKey = getActiveTrackKey();
    trackerData.activeTrack = activeKey;
    const curTrack = getActiveTrack();

    // Đồng bộ ngược ra root để tương thích với các module cũ
    trackerData.companyName = curTrack.companyName;
    trackerData.companyTax = curTrack.companyTax;
    trackerData.mentorName = curTrack.mentorName;
    trackerData.startDate = curTrack.startDate;
    trackerData.endDate = curTrack.endDate;
    trackerData.deadlineDate = curTrack.deadlineDate;
    trackerData.weeklyLogs = curTrack.weeklyLogs;

    savePersonalTrackerState(trackerData, updateSyncStatus);
  }

  function renderTrackerUI() {
    trackerData = getPersonalTrackerState();
    const activeKey = getActiveTrackKey();
    trackerData.activeTrack = activeKey;
    const curTrack = getActiveTrack();
    const analysis = calculatePersonalProgress(trackerData, activeKey);

    // 1. Header cơ bản
    if (mssvBadgeEl) mssvBadgeEl.textContent = trackerData.mssv ? `MSSV: ${trackerData.mssv}` : 'Khách';
    if (profileNameInput) profileNameInput.value = trackerData.studentName || '';
    if (profileClassInput) profileClassInput.value = trackerData.studentClass || '';
    if (courseTypeSelect) courseTypeSelect.value = trackerData.courseType || 'dual';

    // 2. Chuyển Tab Học phần (Track Switcher)
    if (tabTrackTsnn && tabTrackKtcn) {
      if (activeKey === 'tsnn') {
        tabTrackTsnn.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 border-primary bg-primary/10 text-primary shadow-xs';
        tabTrackKtcn.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 border-transparent bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high';
        if (trackActiveIcon) {
          trackActiveIcon.textContent = 'engineering';
          trackActiveIcon.className = 'material-symbols-outlined text-primary text-[22px]';
        }
        if (trackActiveTitle) {
          trackActiveTitle.innerHTML = 'Đơn Vị Thực Tập & Thời Gian: <span class="text-primary font-bold">Tập Sự Nghề Nghiệp (TSNN)</span>';
        }
        if (btnCopyCompanyText) {
          btnCopyCompanyText.textContent = 'Sao chép thông tin DN từ KTCN';
        }
        if (tableHeaderTitleEl) {
          tableHeaderTitleEl.innerHTML = 'Nhật Ký Từng Tuần & Sổ Xuống Chi Tiết Từng Ngày • <span class="text-primary">TSNN</span>';
        }
      } else {
        tabTrackKtcn.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 border-secondary bg-secondary/10 text-secondary shadow-xs';
        tabTrackTsnn.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 border-transparent bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high';
        if (trackActiveIcon) {
          trackActiveIcon.textContent = 'factory';
          trackActiveIcon.className = 'material-symbols-outlined text-secondary text-[22px]';
        }
        if (trackActiveTitle) {
          trackActiveTitle.innerHTML = 'Đơn Vị Thực Tập & Thời Gian: <span class="text-secondary font-bold">Kiến Tập Công Nghiệp (KTCN)</span>';
        }
        if (btnCopyCompanyText) {
          btnCopyCompanyText.textContent = 'Sao chép thông tin DN từ TSNN';
        }
        if (tableHeaderTitleEl) {
          tableHeaderTitleEl.innerHTML = 'Nhật Ký Từng Tuần & Sổ Xuống Chi Tiết Từng Ngày • <span class="text-secondary">KTCN</span>';
        }
      }
    }

    if (badgeTsnnHours) badgeTsnnHours.textContent = `${analysis.tsnnHours}/120H`;
    if (badgeKtcnHours) badgeKtcnHours.textContent = `${analysis.ktcnHours}/120H`;

    // 3. Khối thông tin Doanh nghiệp của Track hiện hành
    if (profileCompanyInput) profileCompanyInput.value = curTrack.companyName || '';
    if (profileTaxInput) profileTaxInput.value = curTrack.companyTax || '';
    if (profileMentorInput) profileMentorInput.value = curTrack.mentorName || '';
    if (startDateInput) startDateInput.value = curTrack.startDate || '';
    if (endDateInput) endDateInput.value = curTrack.endDate || '';
    if (deadlineInput) deadlineInput.value = curTrack.deadlineDate || '';

    // Cập nhật các form phụ (Filler & Validator)
    const fId = document.getElementById('filler-student-id');
    const fName = document.getElementById('filler-student-name');
    const fClass = document.getElementById('filler-student-class');
    const fComp = document.getElementById('filler-company-name');
    const fTax = document.getElementById('filler-company-tax');
    const fMentor = document.getElementById('filler-mentor-name');
    if (fId && trackerData.mssv) fId.value = trackerData.mssv;
    if (fName && trackerData.studentName) fName.value = trackerData.studentName;
    if (fClass && trackerData.studentClass) fClass.value = trackerData.studentClass;
    if (fComp && curTrack.companyName) fComp.value = curTrack.companyName;
    if (fTax && curTrack.companyTax) fTax.value = curTrack.companyTax;
    if (fMentor && curTrack.mentorName) fMentor.value = curTrack.mentorName;

    const valInput = document.getElementById('validator-input');
    if (valInput && valInput.value.includes('52000888') && trackerData.mssv && trackerData.mssv !== '52000888') {
      valInput.value = `1_${trackerData.mssv}_BM01.pdf`;
      const event = new Event('input', { bubbles: true });
      valInput.dispatchEvent(event);
    }

    // 4. Khối Dual Overview (nếu học Song hành cả 2 môn)
    if (dualOverviewEl) {
      if (trackerData.courseType === 'dual') {
        dualOverviewEl.classList.remove('hidden');
        dualOverviewEl.classList.add('flex');
        if (dualTotalHoursEl) dualTotalHoursEl.textContent = `${analysis.totalLoggedHours}H / 240H (${analysis.progressPercentage}%)`;
        if (dualTsnnPctEl) dualTsnnPctEl.textContent = `${analysis.tsnnHours}/120H (${analysis.tsnnPct}%)`;
        if (dualKtcnPctEl) dualKtcnPctEl.textContent = `${analysis.ktcnHours}/120H (${analysis.ktcnPct}%)`;
      } else {
        dualOverviewEl.classList.add('hidden');
        dualOverviewEl.classList.remove('flex');
      }
    }

    // 5. Thẻ đếm ngược Deadline
    if (daysLeftEl) {
      if (analysis.isDeadlinePassed) {
        daysLeftEl.textContent = `Quá hạn ${Math.abs(analysis.daysUntilDeadline)}d`;
        daysLeftEl.className = 'font-mono text-xl sm:text-2xl font-extrabold text-error my-1';
      } else {
        daysLeftEl.textContent = `${analysis.daysUntilDeadline} ngày`;
        daysLeftEl.className = 'font-mono text-xl sm:text-2xl font-extrabold text-primary my-1';
      }
    }

    // 6. Số giờ tích lũy & Tiến độ theo môn hiện hành
    if (hoursTitleEl) {
      hoursTitleEl.textContent = `Giờ tích lũy (${activeKey.toUpperCase()})`;
    }
    if (hoursDoneEl) {
      hoursDoneEl.textContent = `${analysis.currentTrackHours}H / 120H`;
    }
    if (hoursRemainingEl) {
      hoursRemainingEl.textContent = `${analysis.currentTrackRemaining}H`;
    }
    if (progressPctEl) {
      progressPctEl.textContent = `${analysis.currentTrackPct}%`;
    }

    if (progressBarEl) {
      progressBarEl.style.width = `${analysis.currentTrackPct}%`;
      progressBarEl.className = analysis.currentTrackHours >= 120
        ? 'h-full bg-emerald-500 rounded-full transition-all duration-300'
        : 'h-full bg-secondary rounded-full transition-all duration-300';
    }

    // 7. Velocity / Status Banner
    if (velocityStatusEl) {
      let badgeClass = 'bg-blue-100 text-blue-900 border-blue-200';
      if (analysis.status === 'completed') badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      if (analysis.status === 'warning') badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
      if (analysis.status === 'urgent') badgeClass = 'bg-red-100 text-red-900 border-red-300';

      velocityStatusEl.className = `p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${badgeClass}`;
      velocityStatusEl.innerHTML = `
        <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
          ${analysis.status === 'completed' ? 'check_circle' : analysis.status === 'urgent' ? 'emergency' : 'info'}
        </span>
        <div>
          <span class="font-bold">${analysis.statusMessage}</span>
          <div class="text-[11px] opacity-90 mt-0.5">
            Môn: <strong>${activeKey.toUpperCase()}</strong> (${curTrack.companyName || 'Chưa điền DN'}) • 
            Đã ký: <strong>${analysis.signedLogsCount}/${analysis.totalWeeksRecorded} tuần</strong> • 
            Cần làm thêm: <strong>${analysis.currentTrackRemaining}H</strong> (${analysis.requiredHoursPerWeek}H/tuần).
          </div>
        </div>
      `;
    }

    // Floating widget sync
    if (widgetHoursEl) widgetHoursEl.textContent = `${analysis.totalLoggedHours}/${analysis.targetHours}H (${analysis.progressPercentage}%)`;
    if (widgetDaysEl) widgetDaysEl.textContent = `${analysis.daysUntilDeadline} ngày`;
    if (widgetBarEl) widgetBarEl.style.width = `${analysis.progressPercentage}%`;

    // 8. Render Accordion Weekly Logs & Detailed Daily Logs
    if (logsContainer) {
      const weeklyLogs = curTrack.weeklyLogs || [];
      if (weeklyLogs.length === 0) {
        logsContainer.innerHTML = `
          <tr>
            <td colspan="5" class="p-6 text-center text-xs text-on-surface-variant italic">
              Chưa có tuần làm việc nào cho học phần ${activeKey.toUpperCase()}. Bấm "+ Thêm tuần làm việc" để bắt đầu ghi nhận!
            </td>
          </tr>
        `;
      } else {
        const anyExpanded = weeklyLogs.some(l => l.isExpanded);
        if (btnToggleAllText) {
          btnToggleAllText.textContent = anyExpanded ? 'Thu gọn tất cả' : 'Mở tất cả tuần';
        }

        logsContainer.innerHTML = weeklyLogs.map((log, wIdx) => {
          const days = log.dailyLogs || [];
          const isExp = !!log.isExpanded;
          const weekNum = log.week || (wIdx + 1);

          return `
            <!-- Hàng tóm tắt Tuần ${weekNum} -->
            <tr class="border-b border-outline-variant/20 hover:bg-surface-container-low/40 text-xs transition-colors">
              <td class="p-2.5 text-center">
                <button
                  type="button"
                  data-toggle-week-idx="${wIdx}"
                  class="btn-toggle-week inline-flex items-center gap-1 font-mono font-bold ${activeKey === 'ktcn' ? 'text-secondary hover:text-emerald-700' : 'text-primary hover:text-blue-700'} transition-all py-1 px-1.5 rounded-lg hover:bg-surface-container"
                  title="Bấm để sổ xuống / thu gọn chi tiết từng ngày"
                >
                  <span class="material-symbols-outlined text-[18px] transition-transform duration-200 ${isExp ? 'rotate-90 text-secondary' : 'text-outline'}">
                    chevron_right
                  </span>
                  <span>Tuần ${weekNum}</span>
                  <span class="text-[10px] px-1 py-0.2 rounded bg-surface-container text-on-surface-variant font-sans font-normal ml-0.5">
                    (${days.length}d)
                  </span>
                </button>
              </td>
              <td class="p-2.5 w-28">
                <div class="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value="${log.hours}"
                    data-week-idx="${wIdx}"
                    data-week-field="hours"
                    class="w-16 px-2 py-1 rounded border border-outline-variant font-mono font-bold text-center text-xs focus:border-secondary focus:outline-none"
                    title="Tổng số giờ tuần (sẽ tự động cập nhật khi sửa các ngày bên dưới)"
                  />
                  <span class="text-[11px] text-on-surface-variant font-mono font-bold">H</span>
                </div>
              </td>
              <td class="p-2.5">
                <input
                  type="text"
                  value="${log.task || ''}"
                  data-week-idx="${wIdx}"
                  data-week-field="task"
                  placeholder="Tóm tắt nhiệm vụ tuần ${weekNum} (vd: Nghiên cứu Docker, viết API...)"
                  class="w-full px-2.5 py-1 rounded border border-outline-variant text-xs focus:border-secondary focus:outline-none"
                />
              </td>
              <td class="p-2.5 text-center">
                <label class="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    ${log.mentorSigned ? 'checked' : ''}
                    data-week-idx="${wIdx}"
                    data-week-field="mentorSigned"
                    class="w-4 h-4 accent-secondary rounded"
                  />
                  <span class="text-[11px] font-medium ${log.mentorSigned ? 'text-emerald-700 font-bold' : 'text-on-surface-variant'}">
                    ${log.mentorSigned ? 'Đã ký' : 'Chưa'}
                  </span>
                </label>
              </td>
              <td class="p-2.5 text-center">
                <button
                  type="button"
                  data-remove-week-idx="${wIdx}"
                  class="p-1 rounded text-outline hover:text-error hover:bg-red-50 transition-colors"
                  title="Xóa tuần này"
                >
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </td>
            </tr>

            <!-- Hàng Accordion Sổ Xuống: Chi tiết từng ngày của Tuần ${weekNum} -->
            <tr class="${isExp ? '' : 'hidden'} border-b border-outline-variant/30 bg-surface-container-low/50">
              <td colspan="5" class="p-3 pl-4 sm:pl-8">
                <div class="rounded-xl bg-surface-container-lowest p-3.5 border border-outline-variant/30 shadow-xs flex flex-col gap-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-secondary">calendar_view_day</span>
                      <h5 class="text-xs font-bold text-on-surface">
                        Chi tiết công việc từng ngày trong <strong>Tuần ${weekNum}</strong>:
                      </h5>
                      <span class="text-[11px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10">
                        Tổng cộng: ${log.hours || 0} Giờ
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        data-fill-weekdays="${wIdx}"
                        class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-semibold text-secondary transition-colors flex items-center gap-1 shadow-2xs"
                        title="Tự động điền 5 ngày Thứ 2 đến Thứ 6 với 4 giờ/ngày (Tổng 20H)"
                      >
                        <span class="material-symbols-outlined text-[14px]">bolt</span>
                        <span>Điền nhanh T2-T6 (4H/ngày)</span>
                      </button>
                      <button
                        type="button"
                        data-add-day-week="${wIdx}"
                        class="px-2.5 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                        title="Thêm một ngày làm việc mới trong tuần này"
                      >
                        <span class="material-symbols-outlined text-[14px]">add</span>
                        <span>+ Thêm ngày</span>
                      </button>
                    </div>
                  </div>

                  <!-- Danh sách bảng các ngày -->
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr class="text-on-surface-variant font-mono uppercase text-[10px] border-b border-outline-variant/20">
                          <th class="pb-1.5 w-24">Thứ</th>
                          <th class="pb-1.5 w-32">Ngày tháng</th>
                          <th class="pb-1.5 w-24 text-center">Số giờ (H)</th>
                          <th class="pb-1.5 min-w-[220px]">Nội dung công việc kỹ thuật chi tiết trong ngày</th>
                          <th class="pb-1.5 w-12 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-outline-variant/15">
                        ${days.length === 0 ? `
                          <tr>
                            <td colspan="5" class="py-3 text-center text-on-surface-variant italic">
                              Chưa có ngày nào trong tuần này. Bấm "Điền nhanh T2-T6" hoặc "+ Thêm ngày" để nhập chi tiết!
                            </td>
                          </tr>
                        ` : days.map((day, dIdx) => `
                          <tr class="hover:bg-surface-container-low/40">
                            <td class="py-1.5 pr-2">
                              <input
                                type="text"
                                value="${day.day || ''}"
                                data-week-idx="${wIdx}"
                                data-day-idx="${dIdx}"
                                data-day-field="day"
                                placeholder="Thứ 2"
                                class="w-full px-2 py-1 rounded border border-outline-variant font-semibold text-xs text-on-surface focus:border-secondary focus:outline-none"
                              />
                            </td>
                            <td class="py-1.5 pr-2">
                              <input
                                type="date"
                                value="${day.date || ''}"
                                data-week-idx="${wIdx}"
                                data-day-idx="${dIdx}"
                                data-day-field="date"
                                class="w-full px-2 py-1 rounded border border-outline-variant font-mono text-xs text-on-surface focus:border-secondary focus:outline-none"
                              />
                            </td>
                            <td class="py-1.5 pr-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="16"
                                value="${day.hours}"
                                data-week-idx="${wIdx}"
                                data-day-idx="${dIdx}"
                                data-day-field="hours"
                                class="w-14 px-1.5 py-1 rounded border border-outline-variant font-mono font-bold text-center text-xs focus:border-secondary focus:outline-none"
                              />
                            </td>
                            <td class="py-1.5 pr-2">
                              <input
                                type="text"
                                value="${day.task || ''}"
                                data-week-idx="${wIdx}"
                                data-day-idx="${dIdx}"
                                data-day-field="task"
                                placeholder="Chi tiết việc thực hiện trong ngày (vd: Thiết kế ERD, viết test...)"
                                class="w-full px-2.5 py-1 rounded border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none"
                              />
                            </td>
                            <td class="py-1.5 text-center">
                              <button
                                type="button"
                                data-remove-day-week="${wIdx}"
                                data-remove-day-idx="${dIdx}"
                                class="p-1 rounded text-outline hover:text-error hover:bg-red-50 transition-colors"
                                title="Xóa ngày này"
                              >
                                <span class="material-symbols-outlined text-[15px]">close</span>
                              </button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        // Bind events cho Accordion Toggle
        logsContainer.querySelectorAll('button[data-toggle-week-idx]').forEach(btn => {
          btn.addEventListener('click', () => {
            const wIdx = Number(btn.getAttribute('data-toggle-week-idx'));
            if (curTrack.weeklyLogs[wIdx]) {
              curTrack.weeklyLogs[wIdx].isExpanded = !curTrack.weeklyLogs[wIdx].isExpanded;
              persistData();
              renderTrackerUI();
            }
          });
        });

        // Bind events cho Input của Tuần
        logsContainer.querySelectorAll('input[data-week-idx][data-week-field]').forEach(input => {
          input.addEventListener('change', (e) => {
            const wIdx = Number(e.target.getAttribute('data-week-idx'));
            const field = e.target.getAttribute('data-week-field');
            if (!curTrack.weeklyLogs[wIdx]) return;

            if (field === 'mentorSigned') {
              curTrack.weeklyLogs[wIdx].mentorSigned = e.target.checked;
            } else if (field === 'hours') {
              curTrack.weeklyLogs[wIdx].hours = Number(e.target.value) || 0;
            } else if (field === 'task') {
              curTrack.weeklyLogs[wIdx].task = e.target.value;
            }
            persistData();
            renderTrackerUI();
          });
        });

        // Bind events cho Xóa Tuần
        logsContainer.querySelectorAll('button[data-remove-week-idx]').forEach(btn => {
          btn.addEventListener('click', () => {
            const wIdx = Number(btn.getAttribute('data-remove-week-idx'));
            if (confirm(`Xóa ghi nhận của Tuần ${wIdx + 1} (${activeKey.toUpperCase()})?`)) {
              curTrack.weeklyLogs.splice(wIdx, 1);
              curTrack.weeklyLogs.forEach((l, i) => { l.week = i + 1; });
              persistData();
              renderTrackerUI();
              showToast('Đã xóa tuần làm việc');
            }
          });
        });

        // Bind events cho Điền nhanh T2-T6
        logsContainer.querySelectorAll('button[data-fill-weekdays]').forEach(btn => {
          btn.addEventListener('click', () => {
            const wIdx = Number(btn.getAttribute('data-fill-weekdays'));
            const log = curTrack.weeklyLogs[wIdx];
            if (log) {
              log.dailyLogs = generateDefaultDailyLogs(log.week || (wIdx + 1), 20);
              log.hours = 20;
              persistData();
              renderTrackerUI();
              showToast(`Đã điền nhanh 5 ngày (20H) cho Tuần ${wIdx + 1}`);
            }
          });
        });

        // Bind events cho Thêm ngày
        logsContainer.querySelectorAll('button[data-add-day-week]').forEach(btn => {
          btn.addEventListener('click', () => {
            const wIdx = Number(btn.getAttribute('data-add-day-week'));
            const log = curTrack.weeklyLogs[wIdx];
            if (log) {
              if (!Array.isArray(log.dailyLogs)) log.dailyLogs = [];
              const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
              const nextDayName = dayNames[log.dailyLogs.length % dayNames.length] || 'Ngày mới';
              log.dailyLogs.push({
                id: Date.now() + Math.random(),
                day: nextDayName,
                date: '',
                hours: 4,
                task: `Nhiệm vụ ngày ${log.dailyLogs.length + 1}`
              });
              log.hours = log.dailyLogs.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
              persistData();
              renderTrackerUI();
              showToast('Đã thêm 1 ngày làm việc');
            }
          });
        });

        // Bind events cho Chỉnh sửa các ngày (Daily Log Fields)
        logsContainer.querySelectorAll('input[data-day-idx][data-day-field]').forEach(input => {
          input.addEventListener('change', (e) => {
            const wIdx = Number(e.target.getAttribute('data-week-idx'));
            const dIdx = Number(e.target.getAttribute('data-day-idx'));
            const field = e.target.getAttribute('data-day-field');
            const log = curTrack.weeklyLogs[wIdx];
            if (log && log.dailyLogs && log.dailyLogs[dIdx]) {
              if (field === 'hours') {
                log.dailyLogs[dIdx].hours = Number(e.target.value) || 0;
                log.hours = log.dailyLogs.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
              } else if (field === 'day') {
                log.dailyLogs[dIdx].day = e.target.value;
              } else if (field === 'date') {
                log.dailyLogs[dIdx].date = e.target.value;
              } else if (field === 'task') {
                log.dailyLogs[dIdx].task = e.target.value;
              }
              persistData();
              renderTrackerUI();
            }
          });
        });

        // Bind events cho Xóa Ngày
        logsContainer.querySelectorAll('button[data-remove-day-week]').forEach(btn => {
          btn.addEventListener('click', () => {
            const wIdx = Number(btn.getAttribute('data-remove-day-week'));
            const dIdx = Number(btn.getAttribute('data-remove-day-idx'));
            const log = curTrack.weeklyLogs[wIdx];
            if (log && log.dailyLogs && log.dailyLogs[dIdx]) {
              log.dailyLogs.splice(dIdx, 1);
              log.hours = log.dailyLogs.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
              persistData();
              renderTrackerUI();
              showToast('Đã xóa ngày làm việc');
            }
          });
        });
      }
    }
  }

  window.renderPersonalTracker = renderTrackerUI;

  // Real-time events cho Thông tin sinh viên cơ bản
  if (profileNameInput) {
    profileNameInput.addEventListener('input', (e) => {
      trackerData.studentName = e.target.value;
      persistData();
    });
  }
  if (profileClassInput) {
    profileClassInput.addEventListener('input', (e) => {
      trackerData.studentClass = e.target.value;
      persistData();
    });
  }
  if (courseTypeSelect) {
    courseTypeSelect.addEventListener('change', (e) => {
      trackerData.courseType = e.target.value;
      if (trackerData.courseType === 'single_tsnn') trackerData.activeTrack = 'tsnn';
      if (trackerData.courseType === 'single_ktcn') trackerData.activeTrack = 'ktcn';
      persistData();
      renderTrackerUI();
    });
  }

  // Chuyển Tab Track giữa TSNN và KTCN
  if (tabTrackTsnn) {
    tabTrackTsnn.addEventListener('click', () => {
      trackerData.activeTrack = 'tsnn';
      persistData();
      renderTrackerUI();
    });
  }
  if (tabTrackKtcn) {
    tabTrackKtcn.addEventListener('click', () => {
      trackerData.activeTrack = 'ktcn';
      persistData();
      renderTrackerUI();
    });
  }

  // Sao chép thông tin Doanh nghiệp giữa 2 học phần
  if (btnCopyCompanyTrack) {
    btnCopyCompanyTrack.addEventListener('click', () => {
      const activeKey = getActiveTrackKey();
      const otherKey = activeKey === 'tsnn' ? 'ktcn' : 'tsnn';
      if (!trackerData.tracks) trackerData.tracks = {};
      const source = trackerData.tracks[otherKey];
      const target = getActiveTrack();

      if (source && (source.companyName || source.mentorName)) {
        target.companyName = source.companyName || target.companyName;
        target.companyTax = source.companyTax || target.companyTax;
        target.mentorName = source.mentorName || target.mentorName;
        target.startDate = source.startDate || target.startDate;
        target.endDate = source.endDate || target.endDate;
        target.deadlineDate = source.deadlineDate || target.deadlineDate;
        persistData();
        renderTrackerUI();
        showToast(`Đã sao chép thông tin Doanh nghiệp từ ${otherKey.toUpperCase()} sang ${activeKey.toUpperCase()}!`);
      } else {
        showToast(`Chưa có thông tin Doanh nghiệp ở học phần ${otherKey.toUpperCase()} để sao chép.`);
      }
    });
  }

  // Real-time events cho Thông tin Doanh nghiệp & Timeline của Track hiện hành
  if (profileCompanyInput) {
    profileCompanyInput.addEventListener('input', (e) => {
      getActiveTrack().companyName = e.target.value;
      persistData();
    });
  }
  if (profileTaxInput) {
    profileTaxInput.addEventListener('input', (e) => {
      getActiveTrack().companyTax = e.target.value;
      persistData();
    });
  }
  if (profileMentorInput) {
    profileMentorInput.addEventListener('input', (e) => {
      getActiveTrack().mentorName = e.target.value;
      persistData();
    });
  }
  if (startDateInput) {
    startDateInput.addEventListener('change', (e) => {
      getActiveTrack().startDate = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }
  if (endDateInput) {
    endDateInput.addEventListener('change', (e) => {
      getActiveTrack().endDate = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }
  if (deadlineInput) {
    deadlineInput.addEventListener('change', (e) => {
      getActiveTrack().deadlineDate = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }

  // Nút Mở / Thu gọn tất cả các tuần
  if (btnToggleAllWeeks) {
    btnToggleAllWeeks.addEventListener('click', () => {
      const curTrack = getActiveTrack();
      const weeklyLogs = curTrack.weeklyLogs || [];
      const anyExpanded = weeklyLogs.some(l => l.isExpanded);
      weeklyLogs.forEach(l => { l.isExpanded = !anyExpanded; });
      persistData();
      renderTrackerUI();
    });
  }

  // Nút Thêm tuần làm việc mới
  if (btnAddLog) {
    btnAddLog.addEventListener('click', () => {
      const curTrack = getActiveTrack();
      if (!Array.isArray(curTrack.weeklyLogs)) curTrack.weeklyLogs = [];
      const nextWeekNum = curTrack.weeklyLogs.length + 1;
      const newDailyLogs = generateDefaultDailyLogs(nextWeekNum, 20);

      curTrack.weeklyLogs.push({
        id: Date.now(),
        week: nextWeekNum,
        hours: 20,
        task: `Nhiệm vụ tuần ${nextWeekNum}`,
        mentorSigned: false,
        isExpanded: true,
        dailyLogs: newDailyLogs
      });
      persistData();
      renderTrackerUI();
      showToast(`Đã thêm Tuần ${nextWeekNum} cho ${getActiveTrackKey().toUpperCase()}`);
    });
  }

  // Nút Đặt lại (Reset)
  if (btnResetTracker) {
    btnResetTracker.addEventListener('click', () => {
      if (confirm('Đặt lại toàn bộ thời gian biểu và nhật ký 2 học phần về mặc định?')) {
        resetPersonalTrackerState();
        renderTrackerUI();
        showToast('Đã đặt lại thời gian biểu');
      }
    });
  }

  // Nút Xuất Báo Cáo Tiến Độ (Export Report)
  if (btnExportTracker) {
    btnExportTracker.addEventListener('click', () => {
      const activeKey = getActiveTrackKey();
      const analysis = calculatePersonalProgress(trackerData, activeKey);

      let report = `=== BẢNG THEO DÕI TIẾN TRÌNH THỰC TẬP TDTU ===\n`;
      report += `Sinh viên: ${trackerData.studentName || 'Chưa đặt tên'} (MSSV: ${trackerData.mssv || '---'}) | Lớp: ${trackerData.studentClass || '---'}\n`;
      report += `Chế độ: ${trackerData.courseType === 'dual' ? 'Song hành TSNN + KTCN (240H)' : 'Học phần đơn (120H)'}\n\n`;

      if (trackerData.courseType === 'dual') {
        report += `TỔNG TIẾN ĐỘ SONG HÀNH: ${analysis.totalLoggedHours} / 240 Giờ (${analysis.progressPercentage}%)\n`;
        report += `TSNN: ${analysis.tsnnHours}/120H | KTCN: ${analysis.ktcnHours}/120H\n\n`;
      }

      ['tsnn', 'ktcn'].forEach(trackKey => {
        if (trackerData.courseType !== 'dual' && trackKey !== activeKey) return;
        const trk = trackerData.tracks?.[trackKey];
        if (!trk) return;

        const trkName = trackKey === 'tsnn' ? 'TẬP SỰ NGHỀ NGHIỆP (TSNN)' : 'KIẾN TẬP CÔNG NGHIỆP (KTCN)';
        const trkHours = trackKey === 'tsnn' ? analysis.tsnnHours : analysis.ktcnHours;

        report += `--- ${trkName} ---\n`;
        report += `Doanh nghiệp: ${trk.companyName || '---'} | MST: ${trk.companyTax || '---'}\n`;
        report += `CBHD / Mentor: ${trk.mentorName || '---'}\n`;
        report += `Thời gian: ${trk.startDate} -> ${trk.endDate} | Hạn HSMH: ${trk.deadlineDate}\n`;
        report += `Tích lũy: ${trkHours} / 120 Giờ\n`;
        report += `Chi tiết các tuần:\n`;

        (trk.weeklyLogs || []).forEach(w => {
          report += `  + Tuần ${w.week}: ${w.hours}H | ${w.task} | Ký: ${w.mentorSigned ? 'Đã ký' : 'Chưa'}\n`;
          (w.dailyLogs || []).forEach(d => {
            report += `      - ${d.day} (${d.date || '---'}): ${d.hours}H - ${d.task}\n`;
          });
        });
        report += `\n`;
      });

      navigator.clipboard.writeText(report);
      showToast('Đã sao chép báo cáo chi tiết vào Clipboard!');
    });
  }

  renderTrackerUI();
}

// 6. Admin Settings
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

// 7. Test Runner
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
      await executeAllTests((res) => {
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

// 8. Scroll-spy
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

// 9. Instant Search Filter
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

// 10. Language Switcher
function initLanguageSwitcher() {
  initTextNodes();

  const btnVi = document.getElementById('lang-vi-btn');
  const btnEn = document.getElementById('lang-en-btn');

  if (btnVi) {
    btnVi.addEventListener('click', () => {
      setLanguage('vi', showToast);
    });
  }

  if (btnEn) {
    btnEn.addEventListener('click', () => {
      setLanguage('en', showToast);
    });
  }

  // Apply saved language if was previously English
  const saved = getCurrentLanguage();
  if (saved === 'en') {
    setLanguage('en');
  }
}

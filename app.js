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
  saveCurrentProfile
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

// 5. PERSONAL INTERNSHIP TRACKER & TIMELINE CONTROLLER (Cá Nhân Hóa Tự Động)
function initPersonalTracker() {
  let trackerData = getPersonalTrackerState();

  const mssvBadgeEl = document.getElementById('tracker-mssv-badge');
  const syncDotEl = document.getElementById('tracker-sync-dot');
  const syncTextEl = document.getElementById('tracker-sync-text');

  const profileNameInput = document.getElementById('profile-name');
  const profileClassInput = document.getElementById('profile-class');
  const profileCompanyInput = document.getElementById('profile-company');
  const profileMentorInput = document.getElementById('profile-mentor');

  const courseTypeSelect = document.getElementById('tracker-course-type');
  const startDateInput = document.getElementById('tracker-start-date');
  const endDateInput = document.getElementById('tracker-end-date');
  const deadlineInput = document.getElementById('tracker-deadline-date');

  const daysLeftEl = document.getElementById('tracker-days-left');
  const hoursDoneEl = document.getElementById('tracker-hours-done');
  const hoursRemainingEl = document.getElementById('tracker-hours-remaining');
  const velocityStatusEl = document.getElementById('tracker-velocity-status');
  const progressBarEl = document.getElementById('tracker-progress-bar');
  const progressPctEl = document.getElementById('tracker-progress-pct');

  const widgetHoursEl = document.getElementById('widget-tracker-hours');
  const widgetDaysEl = document.getElementById('widget-tracker-days');
  const widgetBarEl = document.getElementById('widget-tracker-bar');

  const logsContainer = document.getElementById('tracker-logs-tbody');
  const btnAddLog = document.getElementById('btn-add-week-log');
  const btnResetTracker = document.getElementById('btn-reset-tracker');
  const btnExportTracker = document.getElementById('btn-export-tracker');

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
    savePersonalTrackerState(trackerData, updateSyncStatus);
  }

  function renderTrackerUI() {
    trackerData = getPersonalTrackerState();
    const analysis = calculatePersonalProgress(trackerData);

    if (mssvBadgeEl) mssvBadgeEl.textContent = trackerData.mssv ? `MSSV: ${trackerData.mssv}` : 'Khách';
    if (profileNameInput) profileNameInput.value = trackerData.studentName || '';
    if (profileClassInput) profileClassInput.value = trackerData.studentClass || '';
    if (profileCompanyInput) profileCompanyInput.value = trackerData.companyName || '';
    if (profileMentorInput) profileMentorInput.value = trackerData.mentorName || '';

    const fId = document.getElementById('filler-student-id');
    const fName = document.getElementById('filler-student-name');
    const fClass = document.getElementById('filler-student-class');
    const fComp = document.getElementById('filler-company-name');
    const fTax = document.getElementById('filler-company-tax');
    const fMentor = document.getElementById('filler-mentor-name');
    if (fId && trackerData.mssv) fId.value = trackerData.mssv;
    if (fName && trackerData.studentName) fName.value = trackerData.studentName;
    if (fClass && trackerData.studentClass) fClass.value = trackerData.studentClass;
    if (fComp && trackerData.companyName) fComp.value = trackerData.companyName;
    if (fTax && trackerData.companyTax) fTax.value = trackerData.companyTax;
    if (fMentor && trackerData.mentorName) fMentor.value = trackerData.mentorName;

    const valInput = document.getElementById('validator-input');
    if (valInput && valInput.value.includes('52000888') && trackerData.mssv && trackerData.mssv !== '52000888') {
      valInput.value = `1_${trackerData.mssv}_BM01.pdf`;
      const event = new Event('input', { bubbles: true });
      valInput.dispatchEvent(event);
    }

    if (courseTypeSelect) courseTypeSelect.value = trackerData.courseType;
    if (startDateInput) startDateInput.value = trackerData.startDate;
    if (endDateInput) endDateInput.value = trackerData.endDate;
    if (deadlineInput) deadlineInput.value = trackerData.deadlineDate;

    if (daysLeftEl) {
      if (analysis.isDeadlinePassed) {
        daysLeftEl.textContent = `Quá hạn ${Math.abs(analysis.daysUntilDeadline)}d`;
        daysLeftEl.className = 'font-mono text-lg font-bold text-error';
      } else {
        daysLeftEl.textContent = `${analysis.daysUntilDeadline} ngày`;
        daysLeftEl.className = 'font-mono text-lg font-bold text-primary';
      }
    }

    if (hoursDoneEl) hoursDoneEl.textContent = `${analysis.totalLoggedHours}H / ${analysis.targetHours}H`;
    if (hoursRemainingEl) hoursRemainingEl.textContent = `${analysis.remainingHours}H`;
    if (progressPctEl) progressPctEl.textContent = `${analysis.progressPercentage}%`;

    if (progressBarEl) {
      progressBarEl.style.width = `${analysis.progressPercentage}%`;
      progressBarEl.className = analysis.isCompleted
        ? 'h-full bg-emerald-500 rounded-full transition-all duration-300'
        : 'h-full bg-secondary rounded-full transition-all duration-300';
    }

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
            Sinh viên: <strong>${trackerData.studentName || 'Chưa đặt tên'} (${trackerData.mssv || '---'})</strong> • 
            Đã ký: <strong>${analysis.signedLogsCount}/${analysis.totalWeeksRecorded} tuần</strong> • 
            Cần duy trì: <strong>${analysis.requiredHoursPerWeek}H/tuần</strong>.
          </div>
        </div>
      `;
    }

    if (widgetHoursEl) widgetHoursEl.textContent = `${analysis.totalLoggedHours}/${analysis.targetHours}H (${analysis.progressPercentage}%)`;
    if (widgetDaysEl) widgetDaysEl.textContent = `${analysis.daysUntilDeadline} ngày`;
    if (widgetBarEl) widgetBarEl.style.width = `${analysis.progressPercentage}%`;

    if (logsContainer) {
      if (!trackerData.weeklyLogs || trackerData.weeklyLogs.length === 0) {
        logsContainer.innerHTML = `
          <tr>
            <td colspan="5" class="p-4 text-center text-xs text-on-surface-variant italic">
              Chưa có tuần làm việc nào. Bấm "+ Thêm tuần làm việc" để bắt đầu ghi nhận!
            </td>
          </tr>
        `;
      } else {
        logsContainer.innerHTML = trackerData.weeklyLogs.map((log, index) => `
          <tr class="border-b border-outline-variant/20 hover:bg-surface-container-low/40 text-xs">
            <td class="p-2.5 font-mono font-bold text-primary text-center">Tuần ${log.week || (index + 1)}</td>
            <td class="p-2.5 w-24">
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value="${log.hours}"
                  data-log-idx="${index}"
                  data-log-field="hours"
                  class="w-16 px-2 py-1 rounded border border-outline-variant font-mono font-bold text-center text-xs focus:border-secondary focus:outline-none"
                />
                <span class="text-[11px] text-on-surface-variant">H</span>
              </div>
            </td>
            <td class="p-2.5">
              <input
                type="text"
                value="${log.task || ''}"
                data-log-idx="${index}"
                data-log-field="task"
                placeholder="Nhiệm vụ kỹ thuật (vd: thiết kế DB, API...)"
                class="w-full px-2.5 py-1 rounded border border-outline-variant text-xs focus:border-secondary focus:outline-none"
              />
            </td>
            <td class="p-2.5 text-center">
              <label class="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  ${log.mentorSigned ? 'checked' : ''}
                  data-log-idx="${index}"
                  data-log-field="mentorSigned"
                  class="w-4 h-4 accent-secondary"
                />
                <span class="text-[11px] ${log.mentorSigned ? 'text-emerald-700 font-bold' : 'text-on-surface-variant'}">
                  ${log.mentorSigned ? 'Đã ký' : 'Chưa'}
                </span>
              </label>
            </td>
            <td class="p-2.5 text-center">
              <button
                type="button"
                data-remove-log-idx="${index}"
                class="p-1 rounded text-outline hover:text-error hover:bg-red-50 transition-colors"
                title="Xóa tuần này"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </td>
          </tr>
        `).join('');

        logsContainer.querySelectorAll('input[data-log-idx]').forEach((input) => {
          input.addEventListener('change', (e) => {
            const idx = Number(e.target.getAttribute('data-log-idx'));
            const field = e.target.getAttribute('data-log-field');
            if (field === 'mentorSigned') {
              trackerData.weeklyLogs[idx].mentorSigned = e.target.checked;
            } else if (field === 'hours') {
              trackerData.weeklyLogs[idx].hours = Number(e.target.value) || 0;
            } else if (field === 'task') {
              trackerData.weeklyLogs[idx].task = e.target.value;
            }
            persistData();
            renderTrackerUI();
          });
        });

        logsContainer.querySelectorAll('button[data-remove-log-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-remove-log-idx'));
            if (confirm(`Xóa ghi nhận của Tuần ${idx + 1}?`)) {
              trackerData.weeklyLogs.splice(idx, 1);
              trackerData.weeklyLogs.forEach((l, i) => { l.week = i + 1; });
              persistData();
              renderTrackerUI();
              showToast('Đã xóa tuần làm việc');
            }
          });
        });
      }
    }
  }

  window.renderPersonalTracker = renderTrackerUI;

  // Real-time debounced auto-save
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
  if (profileCompanyInput) {
    profileCompanyInput.addEventListener('input', (e) => {
      trackerData.companyName = e.target.value;
      persistData();
    });
  }
  if (profileMentorInput) {
    profileMentorInput.addEventListener('input', (e) => {
      trackerData.mentorName = e.target.value;
      persistData();
    });
  }

  if (courseTypeSelect) {
    courseTypeSelect.addEventListener('change', (e) => {
      trackerData.courseType = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }
  if (startDateInput) {
    startDateInput.addEventListener('change', (e) => {
      trackerData.startDate = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }
  if (endDateInput) {
    endDateInput.addEventListener('change', (e) => {
      trackerData.endDate = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }
  if (deadlineInput) {
    deadlineInput.addEventListener('change', (e) => {
      trackerData.deadlineDate = e.target.value;
      persistData();
      renderTrackerUI();
    });
  }

  if (btnAddLog) {
    btnAddLog.addEventListener('click', () => {
      const nextWeekNum = (trackerData.weeklyLogs ? trackerData.weeklyLogs.length : 0) + 1;
      if (!trackerData.weeklyLogs) trackerData.weeklyLogs = [];
      trackerData.weeklyLogs.push({
        id: Date.now(),
        week: nextWeekNum,
        hours: 20,
        task: `Nhiệm vụ tuần ${nextWeekNum}`,
        mentorSigned: false
      });
      persistData();
      renderTrackerUI();
      showToast(`Đã thêm Tuần ${nextWeekNum}`);
    });
  }

  if (btnResetTracker) {
    btnResetTracker.addEventListener('click', () => {
      if (confirm('Đặt lại thời gian biểu và nhật ký tuần về mặc định?')) {
        resetPersonalTrackerState();
        renderTrackerUI();
        showToast('Đã đặt lại thời gian biểu');
      }
    });
  }

  if (btnExportTracker) {
    btnExportTracker.addEventListener('click', () => {
      const analysis = calculatePersonalProgress(trackerData);
      const text = `=== BẢNG THEO DÕI TIẾN TRÌNH THỰC TẬP TDTU ===
Sinh viên: ${trackerData.studentName || 'Chưa đặt tên'} (MSSV: ${trackerData.mssv || '---'}) | Lớp: ${trackerData.studentClass || '---'}
Doanh nghiệp: ${trackerData.companyName || '---'} | CBHD: ${trackerData.mentorName || '---'}
Học phần: ${trackerData.courseType === 'dual' ? 'Song hành TSNN + KTCN (240H)' : 'Học phần đơn (120H)'}
Ngày bắt đầu: ${trackerData.startDate}
Hạn nộp HSMH (Deadline): ${trackerData.deadlineDate} (${analysis.daysUntilDeadline} ngày còn lại)
Tổng số giờ tích lũy: ${analysis.totalLoggedHours} / ${analysis.targetHours} giờ (${analysis.progressPercentage}%)
Tình trạng: ${analysis.statusMessage}

--- CHI TIẾT CÁC TUẦN ---
${(trackerData.weeklyLogs || []).map((l) => `Tuần ${l.week}: ${l.hours}H | ${l.task} | Ký xác nhận: ${l.mentorSigned ? 'Đã ký' : 'Chưa ký'}`).join('\n')}
`;
      navigator.clipboard.writeText(text);
      showToast('Đã sao chép báo cáo tiến độ vào Clipboard!');
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

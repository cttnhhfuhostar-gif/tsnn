// modules/profileManager.js - Quản lý Hồ Sơ Sinh Viên Cá Nhân & Đồng Bộ CSDL Server
export const DEFAULT_PROFILE = {
  mssv: '52000888',
  studentName: 'Nguyễn Văn An',
  studentClass: '20050201',
  companyName: 'Công ty Cổ phần Công nghệ FPT Software',
  companyTax: '0101248141',
  mentorName: 'Trần Văn Bình (Tech Lead)',
  courseType: 'single_tsnn',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  deadlineDate: '2026-05-30',
  weeklyLogs: [
    { id: 1, week: 1, hours: 20, task: 'Làm quen môi trường công ty, setup IDE và đọc tài liệu dự án', mentorSigned: true },
    { id: 2, week: 2, hours: 20, task: 'Nghiên cứu cấu trúc cơ sở dữ liệu, viết API authentication', mentorSigned: true },
    { id: 3, week: 3, hours: 25, task: 'Xây dựng giao diện Dashboard, tích hợp REST API', mentorSigned: false }
  ]
};

const ACTIVE_MSSV_KEY = 'tdtu_active_mssv';
const PROFILE_KEY_PREFIX = 'tdtu_profile_';

export function getActiveMSSV() {
  return localStorage.getItem(ACTIVE_MSSV_KEY) || '52000888';
}

export function setActiveMSSV(mssv) {
  const clean = String(mssv || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (clean) {
    localStorage.setItem(ACTIVE_MSSV_KEY, clean);
  }
  return clean;
}

export function loadCurrentProfile() {
  const mssv = getActiveMSSV();
  try {
    const raw = localStorage.getItem(PROFILE_KEY_PREFIX + mssv);
    if (!raw) {
      return { ...DEFAULT_PROFILE, mssv };
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed, mssv };
  } catch {
    return { ...DEFAULT_PROFILE, mssv };
  }
}

export function saveCurrentProfile(profile) {
  if (!profile || !profile.mssv) return;
  const mssv = String(profile.mssv).trim();
  localStorage.setItem(PROFILE_KEY_PREFIX + mssv, JSON.stringify(profile));
  localStorage.setItem(ACTIVE_MSSV_KEY, mssv);
}

// Server API Sync
export async function syncProfileToServer(profile) {
  const res = await fetch('/api/profile/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Lỗi máy chủ (${res.status})`);
  }
  return await res.json();
}

export async function fetchProfileFromServer(mssv) {
  const clean = String(mssv || '').trim();
  const res = await fetch(`/api/profile?mssv=${encodeURIComponent(clean)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Không tìm thấy hồ sơ MSSV ${clean}`);
  }
  const data = await res.json();
  return data.profile;
}

export async function listProfilesFromServer() {
  try {
    const res = await fetch('/api/profiles/list');
    if (!res.ok) return [];
    const data = await res.json();
    return data.profiles || [];
  } catch {
    return [];
  }
}

// Export JSON file download
export function exportProfileToFile(profile) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `TDTU_HoSo_${profile.mssv || 'sinhvien'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Import JSON file reader
export function importProfileFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.mssv) {
          throw new Error('File JSON không chứa thông tin MSSV');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file JSON'));
    reader.readAsText(file);
  });
}

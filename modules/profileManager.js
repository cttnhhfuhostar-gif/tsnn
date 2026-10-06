// modules/profileManager.js - Quản lý Tài Khoản Sinh Viên & Bảo Mật Cá Nhân Hóa
export const DEFAULT_GUEST_PROFILE = {
  mssv: '52000888',
  studentName: 'Nguyễn Văn An',
  studentClass: '20050201',
  companyName: 'Công ty Cổ phần Công nghệ FPT Software',
  companyTax: '0101248141',
  mentorName: 'Trần Văn Bình (Tech Lead)',
  courseType: 'single_tsnn',
  startDate: '2026-02-15',
  endDate: '2026-05-15',
  deadlineDate: '2026-05-30',
  weeklyLogs: [
    { id: 1, week: 1, hours: 20, task: 'Làm quen môi trường công ty, setup IDE và đọc tài liệu dự án', mentorSigned: true },
    { id: 2, week: 2, hours: 20, task: 'Nghiên cứu cấu trúc cơ sở dữ liệu, viết API authentication', mentorSigned: true },
    { id: 3, week: 3, hours: 25, task: 'Xây dựng giao diện Dashboard, tích hợp REST API', mentorSigned: false }
  ]
};

const TOKEN_KEY = 'tdtu_auth_token';
const USER_KEY = 'tdtu_auth_user';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAuthToken();
}

export async function login(mssv, pin) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mssv, pin })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Đăng nhập không thành công');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function register(mssv, pin, studentName, studentClass) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mssv, pin, studentName, studentClass })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Đăng ký không thành công');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Lấy thông tin hồ sơ của sinh viên đang đăng nhập
export function loadCurrentProfile() {
  const user = getAuthUser();
  if (user && user.mssv) {
    return { ...DEFAULT_GUEST_PROFILE, ...user };
  }
  // Nếu chưa đăng nhập, dùng hồ sơ cục bộ của trình duyệt
  try {
    const local = localStorage.getItem('tdtu_local_profile_guest');
    return local ? { ...DEFAULT_GUEST_PROFILE, ...JSON.parse(local) } : DEFAULT_GUEST_PROFILE;
  } catch {
    return DEFAULT_GUEST_PROFILE;
  }
}

let syncTimeout = null;

// Tự động lưu hồ sơ (Local cache + Server Sync bảo mật ngầm)
export function saveCurrentProfile(profileData, onSyncStatus) {
  const token = getAuthToken();

  if (token) {
    // 1. Cập nhật ngay local cache
    const currentUser = getAuthUser() || {};
    const merged = { ...currentUser, ...profileData };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));

    // 2. Tự động đồng bộ ngầm lên Server sau 600ms (Debounce)
    if (onSyncStatus) onSyncStatus('saving');
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });
        const data = await res.json();
        if (data.success && onSyncStatus) {
          onSyncStatus('saved', data.updatedAt);
        } else if (!data.success && onSyncStatus) {
          onSyncStatus('error', data.error);
        }
      } catch (err) {
        if (onSyncStatus) onSyncStatus('error', err.message);
      }
    }, 600);
  } else {
    // Lưu cục bộ nếu chưa đăng nhập
    localStorage.setItem('tdtu_local_profile_guest', JSON.stringify(profileData));
    if (onSyncStatus) onSyncStatus('local');
  }
}

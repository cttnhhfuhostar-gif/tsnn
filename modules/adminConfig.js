// modules/adminConfig.js - Quản lý cấu hình học vụ và hạn nộp

const CONFIG_KEY = 'tdtu_intern_admin_config_v2';

const DEFAULT_CONFIG = {
  termName: 'Học kỳ 2 (Năm học 2025 - 2026)',
  stage1Deadline: '2026-02-28',
  stage2Deadline: '2026-05-15',
  stage3Deadline: '2026-05-30',
  driveLink: 'https://tinyurl.com/BieuMauHocPhan',
  handbookLink: 'https://tinyurl.com/CamNangHocPhanNgheNghiep',
  noticeText: 'Nhắc nhở: Hạn chót nộp bản scan màu BM01 và đăng ký đơn vị thực tập qua link Khoa là 17h00 ngày 28/02/2026.'
};

export function getAdminConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAdminConfig(cfg) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error(e);
  }
}

export function resetAdminConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

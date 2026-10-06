// modules/personalTracker.js - Quản lý tiến trình và thời gian biểu thực tập cá nhân hóa
import { loadCurrentProfile, saveCurrentProfile, DEFAULT_GUEST_PROFILE, normalizeProfile } from './profileManager.js';

export const DEFAULT_TRACKER_DATA = DEFAULT_GUEST_PROFILE;

export function getPersonalTrackerState() {
  return loadCurrentProfile();
}

export function savePersonalTrackerState(data, onSyncStatus) {
  saveCurrentProfile(data, onSyncStatus);
}

export function resetPersonalTrackerState() {
  localStorage.removeItem('tdtu_local_profile_guest');
}

/**
 * Tính tổng giờ từ danh sách weeklyLogs (kết hợp dailyLogs nếu có)
 */
export function calculateLogsHours(weeklyLogs) {
  if (!Array.isArray(weeklyLogs)) return 0;
  return weeklyLogs.reduce((acc, log) => {
    if (Array.isArray(log.dailyLogs) && log.dailyLogs.length > 0) {
      const dailySum = log.dailyLogs.reduce((dAcc, day) => dAcc + (Number(day.hours) || 0), 0);
      return acc + (dailySum > 0 ? dailySum : (Number(log.hours) || 0));
    }
    return acc + (Number(log.hours) || 0);
  }, 0);
}

/**
 * Tính toán phân tích tiến trình cá nhân hóa (hỗ trợ Track TSNN & KTCN riêng biệt)
 */
export function calculatePersonalProgress(trackerData, selectedTrackKey) {
  const data = trackerData || DEFAULT_TRACKER_DATA;
  const isDual = data.courseType === 'dual';
  const targetHours = isDual ? 240 : 120;

  // Xác định track hiện hành
  const activeTrackKey = selectedTrackKey || data.activeTrack || (data.courseType === 'single_ktcn' ? 'ktcn' : 'tsnn');

  // Tính giờ từng môn nếu có data.tracks
  let tsnnHours = 0;
  let ktcnHours = 0;
  let totalLoggedHours = 0;

  if (data.tracks && (data.tracks.tsnn || data.tracks.ktcn)) {
    tsnnHours = calculateLogsHours(data.tracks.tsnn?.weeklyLogs || []);
    ktcnHours = calculateLogsHours(data.tracks.ktcn?.weeklyLogs || []);
    if (isDual) {
      totalLoggedHours = tsnnHours + ktcnHours;
    } else if (data.courseType === 'single_ktcn') {
      totalLoggedHours = ktcnHours > 0 ? ktcnHours : calculateLogsHours(data.weeklyLogs || []);
    } else {
      totalLoggedHours = tsnnHours > 0 ? tsnnHours : calculateLogsHours(data.weeklyLogs || []);
    }
  } else {
    // Dữ liệu cũ hoặc test data đơn giản
    totalLoggedHours = calculateLogsHours(data.weeklyLogs || []);
    tsnnHours = totalLoggedHours;
    ktcnHours = 0;
  }

  const remainingHours = Math.max(0, targetHours - totalLoggedHours);
  const progressPercentage = Math.min(100, Math.round((totalLoggedHours / targetHours) * 100));
  const isCompleted = totalLoggedHours >= targetHours;

  // Track cụ thể đang xem
  const activeTrackData = (data.tracks && data.tracks[activeTrackKey]) ? data.tracks[activeTrackKey] : data;
  const currentTrackHours = activeTrackKey === 'ktcn' ? ktcnHours : tsnnHours;
  const currentTrackTarget = 120;
  const currentTrackRemaining = Math.max(0, currentTrackTarget - currentTrackHours);
  const currentTrackPct = Math.min(100, Math.round((currentTrackHours / currentTrackTarget) * 100));

  // 2. Phân tích thời gian (Ưu tiên lấy theo track đang xem)
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDateStr = activeTrackData.startDate || data.startDate || '2026-02-15';
  const endDateStr = activeTrackData.endDate || data.endDate || '2026-05-15';
  const deadlineDateStr = activeTrackData.deadlineDate || data.deadlineDate || '2026-05-30';

  const deadline = new Date(deadlineDateStr);
  const diffTimeToDeadline = deadline.getTime() - now.getTime();
  const daysUntilDeadline = Math.ceil(diffTimeToDeadline / (1000 * 60 * 60 * 24));
  const isDeadlinePassed = daysUntilDeadline < 0;
  const weeksUntilDeadline = Math.max(0, Math.ceil(daysUntilDeadline / 7));

  // 3. Tốc độ làm việc & Dự báo
  const hoursToCalc = isDual ? remainingHours : currentTrackRemaining;
  const requiredHoursPerWeek = weeksUntilDeadline > 0 ? Math.ceil(hoursToCalc / weeksUntilDeadline) : hoursToCalc;

  // Đánh giá tình trạng tiến độ (Velocity Status)
  let status = 'on_track';
  let statusMessage = '';

  if (isCompleted) {
    status = 'completed';
    statusMessage = `Xuất sắc! Bạn đã hoàn thành ${totalLoggedHours}H (≥ ${targetHours}H). Đã đủ điều kiện đóng cuốn HSMH.`;
  } else if (isDeadlinePassed) {
    status = 'urgent';
    statusMessage = `ĐÃ QUÁ HẠN NỘP HỒ SƠ (${Math.abs(daysUntilDeadline)} ngày trước)! Vui lòng liên hệ gấp Giảng viên hướng dẫn.`;
  } else if (daysUntilDeadline <= 14 && remainingHours > 30) {
    status = 'urgent';
    statusMessage = `Cảnh báo khẩn cấp: Chỉ còn ${daysUntilDeadline} ngày đến deadline nhưng còn thiếu ${remainingHours}H! Bạn cần làm ${requiredHoursPerWeek}H/tuần.`;
  } else if (requiredHoursPerWeek > 30) {
    status = 'warning';
    statusMessage = `Cần tăng tốc: Bạn cần làm trung bình ${requiredHoursPerWeek}H/tuần trong ${weeksUntilDeadline} tuần tới để kịp nộp HSMH.`;
  } else {
    status = 'on_track';
    statusMessage = `Tiến độ ổn định: Còn ${daysUntilDeadline} ngày. Duy trì ~${requiredHoursPerWeek || 15}H/tuần để về đích đúng hạn.`;
  }

  // Thống kê chữ ký mentor của track đang xem và toàn bộ
  const currentWeeklyLogs = activeTrackData.weeklyLogs || data.weeklyLogs || [];
  const signedLogsCount = currentWeeklyLogs.filter(l => l.mentorSigned).length;
  const unsignedLogsCount = currentWeeklyLogs.length - signedLogsCount;

  return {
    targetHours,
    totalLoggedHours,
    remainingHours,
    progressPercentage,
    isCompleted,
    daysUntilDeadline,
    weeksUntilDeadline,
    isDeadlinePassed,
    requiredHoursPerWeek,
    status,
    statusMessage,
    signedLogsCount,
    unsignedLogsCount,
    totalWeeksRecorded: currentWeeklyLogs.length,
    // Thông tin phân tích theo từng môn
    activeTrackKey,
    currentTrackHours,
    currentTrackTarget,
    currentTrackRemaining,
    currentTrackPct,
    tsnnHours,
    tsnnTarget: 120,
    tsnnRemaining: Math.max(0, 120 - tsnnHours),
    tsnnPct: Math.min(100, Math.round((tsnnHours / 120) * 100)),
    ktcnHours,
    ktcnTarget: 120,
    ktcnRemaining: Math.max(0, 120 - ktcnHours),
    ktcnPct: Math.min(100, Math.round((ktcnHours / 120) * 100))
  };
}

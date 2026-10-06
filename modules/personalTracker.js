// modules/personalTracker.js - Quản lý tiến trình và thời gian biểu thực tập cá nhân hóa
import { loadCurrentProfile, saveCurrentProfile, DEFAULT_PROFILE, getActiveMSSV } from './profileManager.js';

export const DEFAULT_TRACKER_DATA = DEFAULT_PROFILE;

export function getPersonalTrackerState() {
  return loadCurrentProfile();
}

export function savePersonalTrackerState(data) {
  saveCurrentProfile(data);
}

export function resetPersonalTrackerState() {
  const mssv = getActiveMSSV();
  localStorage.removeItem('tdtu_profile_' + mssv);
}

/**
 * Tính toán phân tích tiến trình cá nhân hóa
 */
export function calculatePersonalProgress(trackerData) {
  const data = trackerData || DEFAULT_TRACKER_DATA;
  const isDual = data.courseType === 'dual';
  const targetHours = isDual ? 240 : 120;

  // 1. Tổng số giờ đã tích lũy từ các tuần
  const totalLoggedHours = data.weeklyLogs.reduce((acc, log) => acc + (Number(log.hours) || 0), 0);
  const remainingHours = Math.max(0, targetHours - totalLoggedHours);
  const progressPercentage = Math.min(100, Math.round((totalLoggedHours / targetHours) * 100));
  const isCompleted = totalLoggedHours >= targetHours;

  // 2. Phân tích thời gian (Ngày bắt đầu, kết thúc, deadline)
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const deadline = new Date(data.deadlineDate);

  // Số ngày còn lại đến hạn nộp bài
  const diffTimeToDeadline = deadline.getTime() - now.getTime();
  const daysUntilDeadline = Math.ceil(diffTimeToDeadline / (1000 * 60 * 60 * 24));
  const isDeadlinePassed = daysUntilDeadline < 0;

  // Số tuần còn lại đến deadline
  const weeksUntilDeadline = Math.max(0, Math.ceil(daysUntilDeadline / 7));

  // 3. Tốc độ làm việc & Dự báo
  // Số giờ cần làm mỗi tuần để kịp deadline
  const requiredHoursPerWeek = weeksUntilDeadline > 0 ? Math.ceil(remainingHours / weeksUntilDeadline) : remainingHours;

  // Đánh giá tình trạng tiến độ (Velocity Status)
  let status = 'on_track'; // 'completed' | 'on_track' | 'warning' | 'urgent'
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

  // Thống kê chữ ký mentor
  const signedLogsCount = data.weeklyLogs.filter(l => l.mentorSigned).length;
  const unsignedLogsCount = data.weeklyLogs.length - signedLogsCount;

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
    totalWeeksRecorded: data.weeklyLogs.length
  };
}

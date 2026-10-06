// modules/hoursTracker.js - Tính toán giờ thực tập học phần TSNN & KTCN

export function calculateInternshipHours(weeks, hoursPerWeek, isDualEnrolled) {
  const w = Math.max(0, Number(weeks) || 0);
  const h = Math.max(0, Number(hoursPerWeek) || 0);
  const total = w * h;
  const required = isDualEnrolled ? 240 : 120;
  const remaining = Math.max(0, required - total);
  const percentage = Math.min(100, Math.round((total / required) * 100));

  return {
    total,
    required,
    remaining,
    percentage,
    isCompleted: total >= required,
    weeksRemaining: h > 0 ? Math.ceil(remaining / h) : 0
  };
}

import React, { useState } from 'react';
import { calculateInternshipHours } from '../../utils/validator';
import { Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export const MilestoneTracker: React.FC = () => {
  const [isDual, setIsDual] = useState<boolean>(false);
  const [weeksDone, setWeeksDone] = useState<number>(6);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(20);

  const stats = calculateInternshipHours(weeksDone, hoursPerWeek, isDual);

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Card */}
      <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-on-surface">Chế độ Học phần Thực tập:</h4>
          <p className="text-xs text-on-surface-variant">Chọn đúng số môn bạn đang học trong kỳ này</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDual(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isDual
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Học 1 môn (120H)
          </button>
          <button
            type="button"
            onClick={() => setIsDual(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isDual
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Song hành TSNN + KTCN (240H)
          </button>
        </div>
      </div>

      {/* Progress & Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-2">
              <span>Số tuần đã thực tập:</span>
              <span className="font-mono text-primary text-sm font-bold">{weeksDone} tuần</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={weeksDone}
              onChange={(e) => setWeeksDone(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-2">
              <span>Số giờ trung bình mỗi tuần:</span>
              <span className="font-mono text-primary text-sm font-bold">{hoursPerWeek} giờ/tuần</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="p-3 rounded-lg bg-surface-container text-[11px] text-on-surface-variant leading-relaxed">
            💡 Theo quy định, sinh viên có thể làm việc bán thời gian (Part-time ~20h/tuần) hoặc toàn thời gian (Full-time ~40h/tuần).
          </div>
        </div>

        {/* Hour summary result */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary font-mono">
              Tổng kết khối lượng giờ
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary font-display">
                {stats.total}H
              </span>
              <span className="text-xs text-on-surface-variant">
                / {stats.required}H yêu cầu
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-container rounded-full h-3 mt-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  stats.isCompleted ? 'bg-emerald-500' : 'bg-secondary'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant mt-1.5 font-mono">
              <span>Đạt {stats.percentage}%</span>
              <span>{stats.isCompleted ? 'Đã đủ điều kiện' : `Còn thiếu ${stats.remaining}H`}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/30">
            {stats.isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Chúc mừng! Bạn đã tích lũy đủ số giờ quy định để đóng cuốn hồ sơ.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Cần tiếp tục thực tập thêm {Math.ceil(stats.remaining / (hoursPerWeek || 20))} tuần để đạt mốc quy định.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

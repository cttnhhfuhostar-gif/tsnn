import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, RotateCcw, CheckCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  stage: string;
  text: string;
  isImportant?: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'c1', stage: 'GĐ1', text: 'Tìm được công ty phù hợp chuyên ngành CNTT (có MST & tư cách pháp nhân)', isImportant: true },
  { id: 'c2', stage: 'GĐ1', text: 'Hoàn thành BM01 có chữ ký mentor và mộc tròn đỏ của công ty', isImportant: true },
  { id: 'c3', stage: 'GĐ1', text: 'Ký cam kết sinh viên BM02 và nộp link đăng ký của Khoa trước hạn chót' },
  { id: 'c4', stage: 'GĐ2', text: 'Ghi nhật ký BM03 đều đặn từng tuần (mô tả công việc kỹ thuật cụ thể)' },
  { id: 'c5', stage: 'GĐ2', text: 'Xin chữ ký xác nhận của cán bộ hướng dẫn vào nhật ký BM03 hàng tuần' },
  { id: 'c6', stage: 'GĐ2', text: 'Tích lũy đủ tối thiểu 120H (hoặc 240H nếu song hành) trước khi kết thúc kỳ', isImportant: true },
  { id: 'c7', stage: 'GĐ3', text: 'Xin phiếu đánh giá BM04 có điểm số rõ ràng và mộc tròn công ty (không tẩy xóa)', isImportant: true },
  { id: 'c8', stage: 'GĐ3', text: 'Đóng dấu mộc tròn ở trang kết thúc của nhật ký BM03' },
  { id: 'c9', stage: 'GĐ3', text: 'Viết báo cáo chuyên môn BM05 đúng format quy định (25-45 trang)' },
  { id: 'c10', stage: 'GĐ3', text: 'Điền phiếu khảo sát sinh viên BM06' },
  { id: 'c11', stage: 'GĐ3', text: 'Đóng cuốn HSMH theo đúng thứ tự quy định và chuẩn bị file PDF scan nộp portal', isImportant: true },
];

export const InteractiveChecklist: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('tdtu_intern_checklist_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tdtu_intern_checklist_v1', JSON.stringify(checkedIds));
    } catch (e) {
      console.error(e);
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = DEFAULT_ITEMS.filter(item => checkedIds[item.id]).length;
  const percentage = Math.round((completedCount / DEFAULT_ITEMS.length) * 100);

  const resetAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ checklist không?')) {
      setCheckedIds({});
    }
  };

  const checkAll = () => {
    const all: Record<string, boolean> = {};
    DEFAULT_ITEMS.forEach(item => { all[item.id] = true; });
    setCheckedIds(all);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header & Controls */}
      <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">Tiến độ hoàn thiện hồ sơ:</span>
            <span className="font-mono text-primary font-extrabold text-sm">{completedCount}/{DEFAULT_ITEMS.length} mục ({percentage}%)</span>
          </div>
          {/* Progress bar */}
          <div className="w-48 sm:w-64 bg-surface-container rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                percentage === 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={checkAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold"
          >
            <CheckCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Chọn tất cả</span>
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-error" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {DEFAULT_ITEMS.map((item) => {
          const isChecked = !!checkedIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isChecked
                  ? 'bg-emerald-50/50 border-emerald-300 text-on-surface'
                  : 'bg-surface-container-lowest border-outline-variant/30 hover:border-secondary/40'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-secondary shrink-0 focus:outline-none"
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-outline" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-container text-primary">
                    {item.stage}
                  </span>
                  {item.isImportant && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                      Bắt buộc
                    </span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm mt-1 leading-snug ${isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

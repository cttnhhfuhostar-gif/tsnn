import React, { useState } from 'react';
import { X, Settings, Save, RotateCcw, Check, Calendar } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [termConfig, setTermConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('tdtu_intern_admin_config_v1');
      return saved ? JSON.parse(saved) : {
        termCode: 'HK2_2025_2026',
        termName: 'Học kỳ 2 (Năm học 2025 - 2026)',
        stage1Deadline: '2026-02-28',
        stage2Deadline: '2026-05-15',
        stage3Deadline: '2026-05-30',
        driveLink: 'https://tinyurl.com/BieuMauHocPhan',
        handbookLink: 'https://tinyurl.com/CamNangHocPhanNgheNghiep',
        noticeText: 'Nhắc nhở: Hạn chót nộp bản scan màu BM01 và đăng ký đơn vị thực tập qua link Khoa là 17h00 ngày 28/02/2026.'
      };
    } catch {
      return {
        termCode: 'HK2_2025_2026',
        termName: 'Học kỳ 2 (Năm học 2025 - 2026)',
        stage1Deadline: '2026-02-28',
        stage2Deadline: '2026-05-15',
        stage3Deadline: '2026-05-30',
        driveLink: 'https://tinyurl.com/BieuMauHocPhan',
        handbookLink: 'https://tinyurl.com/CamNangHocPhanNgheNghiep',
        noticeText: 'Nhắc nhở: Hạn chót nộp bản scan màu BM01 và đăng ký đơn vị thực tập qua link Khoa là 17h00 ngày 28/02/2026.'
      };
    }
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('tdtu_intern_admin_config_v1', JSON.stringify(termConfig));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Đặt lại cấu hình mặc định ban đầu của Khoa?')) {
      localStorage.removeItem('tdtu_intern_admin_config_v1');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-primary font-display">
                Cấu Hình Học Kỳ & Thời Gian Học Vụ (Admin)
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Quản trị thời hạn nộp hồ sơ và đường dẫn tài nguyên
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface block mb-1">Tên Học kỳ áp dụng:</label>
            <input
              type="text"
              value={termConfig.termName}
              onChange={(e) => setTermConfig({ ...termConfig, termName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">Hạn chót GĐ1 (BM01):</label>
              <input
                type="date"
                value={termConfig.stage1Deadline}
                onChange={(e) => setTermConfig({ ...termConfig, stage1Deadline: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">Hạn giữa kỳ GĐ2:</label>
              <input
                type="date"
                value={termConfig.stage2Deadline}
                onChange={(e) => setTermConfig({ ...termConfig, stage2Deadline: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">Hạn nộp HSMH GĐ3:</label>
              <input
                type="date"
                value={termConfig.stage3Deadline}
                onChange={(e) => setTermConfig({ ...termConfig, stage3Deadline: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-on-surface block mb-1">Link Kho Biểu mẫu (Google Drive / TinyURL):</label>
            <input
              type="text"
              value={termConfig.driveLink}
              onChange={(e) => setTermConfig({ ...termConfig, driveLink: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant font-mono text-xs text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface block mb-1">Thông báo khẩn cấp từ Khoa:</label>
            <textarea
              rows={3}
              value={termConfig.noticeText}
              onChange={(e) => setTermConfig({ ...termConfig, noticeText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-outline-variant/30 bg-surface-container-low/30 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-error font-medium hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Cấu Hình</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

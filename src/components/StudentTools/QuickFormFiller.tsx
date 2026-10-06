import React, { useState } from 'react';
import { Copy, Check, FileDown, Sparkles } from 'lucide-react';

export const QuickFormFiller: React.FC = () => {
  const [formData, setFormData] = useState({
    studentName: 'Nguyễn Văn A',
    studentId: '521H0123',
    className: '21050201',
    phone: '0901234567',
    email: '521h0123@student.tdtu.edu.vn',
    companyName: 'Công ty Cổ phần Công nghệ FPT Software',
    taxId: '0101778162',
    address: 'Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh',
    mentorName: 'Trần Minh Quân',
    mentorRole: 'Senior Software Engineer / Team Leader',
    mentorPhone: '0987654321',
    mentorEmail: 'quan.tran@fsoft.com.vn'
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyValue = (fieldKey: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const copyFullProfile = () => {
    const text = `=== THÔNG TIN THỰC TẬP SINH VIÊN TDTU ===
Họ và tên: ${formData.studentName}
MSSV: ${formData.studentId}
Lớp: ${formData.className}
Số điện thoại: ${formData.phone}
Email TDTU: ${formData.email}

=== THÔNG TIN DOANH NGHIỆP TIẾP NHẬN ===
Tên doanh nghiệp: ${formData.companyName}
Mã số thuế: ${formData.taxId}
Địa chỉ thực tập: ${formData.address}
Cán bộ hướng dẫn: ${formData.mentorName}
Chức vụ: ${formData.mentorRole}
SĐT Cán bộ: ${formData.mentorPhone}
Email Cán bộ: ${formData.mentorEmail}
`;
    navigator.clipboard.writeText(text);
    alert('Đã sao chép toàn bộ bộ hồ sơ thông tin vào clipboard!');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-on-surface leading-relaxed flex items-center justify-between gap-4">
        <span>
          💡 Điền thông tin một lần ở đây để sao chép nhanh vào các mẫu BM01 (Tiếp nhận), BM02 (Cam kết) và Form khai báo của Khoa mà không bị nhầm lẫn.
        </span>
        <button
          type="button"
          onClick={copyFullProfile}
          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shrink-0 hover:bg-primary-container transition-colors"
        >
          Copy Trọn Bộ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Student Information */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-secondary font-mono">
            1. Thông tin Sinh viên
          </h4>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
              Họ và tên sinh viên:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium focus:border-secondary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyValue('studentName', formData.studentName)}
                className="p-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container"
              >
                {copiedField === 'studentName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">MSSV:</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-mono font-medium focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Lớp:</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Email TDTU:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-mono text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>
        </div>

        {/* Company Information */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-secondary font-mono">
            2. Thông tin Doanh nghiệp
          </h4>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
              Tên công ty (Pháp nhân):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium focus:border-secondary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyValue('companyName', formData.companyName)}
                className="p-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container"
              >
                {copiedField === 'companyName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Mã số thuế (MST):</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-mono font-medium focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Cán bộ hướng dẫn:</label>
              <input
                type="text"
                value={formData.mentorName}
                onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Địa chỉ làm việc:</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

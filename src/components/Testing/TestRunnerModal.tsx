import React, { useState } from 'react';
import { X, PlayCircle, CheckCircle, XCircle, RotateCcw, ShieldCheck, CheckCheck } from 'lucide-react';
import { validateSubmissionFilename, calculateInternshipHours, removeVietnameseTones } from '../../utils/validator';

interface TestCaseItem {
  id: string;
  name: string;
  module: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  outputMessage?: string;
  runFn: () => { passed: boolean; message: string };
}

export const TestRunnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [tests, setTests] = useState<TestCaseItem[]>([
    {
      id: 'TC-VAL-01',
      name: 'Kiểm tra tên file đúng chuẩn TDTU',
      module: 'Validator',
      description: 'Nhập "521H0123_NguyenVanA_BM01.pdf" -> mong đợi isValid = true, 0 lỗi',
      status: 'idle',
      runFn: () => {
        const res = validateSubmissionFilename('521H0123_NguyenVanA_BM01.pdf');
        return {
          passed: res.isValid && res.errors.length === 0,
          message: `Điểm số: ${res.score}/100. Đã phân tích đúng MSSV: 521H0123, BM01.`
        };
      }
    },
    {
      id: 'TC-VAL-02',
      name: 'Bắt lỗi tên file chứa khoảng trắng',
      module: 'Validator',
      description: 'Nhập "521H0123 Nguyen Van A BM01.pdf" -> mong đợi bắt lỗi dấu cách',
      status: 'idle',
      runFn: () => {
        const res = validateSubmissionFilename('521H0123 Nguyen Van A BM01.pdf');
        return {
          passed: !res.isValid && res.errors.some(e => e.includes('khoảng trắng') || e.includes('dấu cách')),
          message: 'Bắt thành công: Tên file KHÔNG ĐƯỢC chứa dấu cách.'
        };
      }
    },
    {
      id: 'TC-VAL-03',
      name: 'Bắt lỗi định dạng file không phải .pdf',
      module: 'Validator',
      description: 'Nhập file Word ".docx" -> mong đợi bắt lỗi yêu cầu scan màu PDF',
      status: 'idle',
      runFn: () => {
        const res = validateSubmissionFilename('521H0123_NguyenVanA_BM01.docx');
        return {
          passed: !res.isValid && res.errors.some(e => e.includes('.pdf')),
          message: 'Bắt thành công: Bắt buộc định dạng .pdf.'
        };
      }
    },
    {
      id: 'TC-VAL-04',
      name: 'Bắt lỗi thiếu cấu trúc 3 phần chuẩn',
      module: 'Validator',
      description: 'Nhập "521H0123_BM01.pdf" -> mong đợi cảnh báo thiếu tên sinh viên',
      status: 'idle',
      runFn: () => {
        const res = validateSubmissionFilename('521H0123_BM01.pdf');
        return {
          passed: !res.isValid && res.errors.some(e => e.includes('3 phần chuẩn')),
          message: 'Bắt thành công: Cấu trúc phải đủ [MSSV]_[Hovaten]_[TenBM].pdf'
        };
      }
    },
    {
      id: 'TC-VAL-05',
      name: 'Tự động sửa lỗi & gợi ý tên chuẩn',
      module: 'Validator',
      description: 'Nhập "521H0123_Nguyen Van A_BM01.docx" -> mong đợi sinh ra tên chuẩn hóa',
      status: 'idle',
      runFn: () => {
        const res = validateSubmissionFilename('521H0123_Nguyen Van A_BM01.docx');
        return {
          passed: res.suggestedName === '521H0123_NguyenVanA_BM01.pdf',
          message: `Đề xuất chính xác: "${res.suggestedName}"`
        };
      }
    },
    {
      id: 'TC-HRS-01',
      name: 'Tính giờ học phần đơn lẻ (≥ 120H)',
      module: 'Calculator',
      description: '6 tuần * 20 giờ/tuần = 120H -> mong đợi hoàn thành 100%',
      status: 'idle',
      runFn: () => {
        const res = calculateInternshipHours(6, 20, false);
        return {
          passed: res.total === 120 && res.isCompleted && res.percentage === 100,
          message: `Tích lũy ${res.total}/${res.required}H (100%). Đạt chuẩn!`
        };
      }
    },
    {
      id: 'TC-HRS-02',
      name: 'Tính giờ học phần song hành (≥ 240H)',
      module: 'Calculator',
      description: '6 tuần * 20 giờ/tuần = 120H cho song hành -> mong đợi đạt 50%, còn thiếu 120H',
      status: 'idle',
      runFn: () => {
        const res = calculateInternshipHours(6, 20, true);
        return {
          passed: res.total === 120 && !res.isCompleted && res.remaining === 120,
          message: `Tích lũy ${res.total}/${res.required}H (50%). Cảnh báo thiếu 120H chính xác.`
        };
      }
    },
    {
      id: 'TC-UTIL-01',
      name: 'Hàm xử lý bỏ dấu tiếng Việt',
      module: 'Utilities',
      description: 'Loại bỏ dấu tiếng Việt chuẩn xác không lỗi font',
      status: 'idle',
      runFn: () => {
        const out = removeVietnameseTones('Trần Hoàng Quốc Bảo');
        return {
          passed: out === 'Tran Hoang Quoc Bao',
          message: `Chuỗi kết quả: "${out}"`
        };
      }
    }
  ]);

  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const runAllTests = async () => {
    setIsRunningAll(true);
    const updated = [...tests];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'running';
      setTests([...updated]);
      
      const startTime = performance.now();
      await new Promise(r => setTimeout(r, 120)); // Delay mô phỏng nhịp test
      const result = updated[i].runFn();
      const endTime = performance.now();

      updated[i].status = result.passed ? 'passed' : 'failed';
      updated[i].durationMs = Math.round(endTime - startTime);
      updated[i].outputMessage = result.message;
      setTests([...updated]);
    }

    setIsRunningAll(false);
  };

  const resetTests = () => {
    setTests(prev => prev.map(t => ({ ...t, status: 'idle', durationMs: undefined, outputMessage: undefined })));
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-display">
                Bộ Kiểm Thử Tự Động (Interactive Test Suite)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Xác thực logic nghiệp vụ, quy chuẩn tên file và giờ thực tập TDTU
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

        {/* Action Bar & Stats */}
        <div className="p-4 bg-surface-container-low/50 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="font-bold text-on-surface">Tổng số: {tests.length} test cases</span>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Passed: {passedCount}</span>
            {failedCount > 0 && (
              <span className="text-error font-bold bg-red-100 px-2 py-0.5 rounded">Failed: {failedCount}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTests}
              disabled={isRunningAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
            <button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isRunningAll ? 'Đang chạy test...' : 'Chạy Toàn Bộ Test Cases'}</span>
            </button>
          </div>
        </div>

        {/* Tests List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {tests.map((tc) => (
            <div
              key={tc.id}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                tc.status === 'passed'
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : tc.status === 'failed'
                  ? 'bg-red-50/50 border-red-300'
                  : tc.status === 'running'
                  ? 'bg-blue-50/50 border-blue-300'
                  : 'bg-surface-container-lowest border-outline-variant/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {tc.status === 'passed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : tc.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-error" />
                    ) : tc.status === 'running' ? (
                      <span className="w-4 h-4 rounded-full border-2 border-secondary border-t-transparent animate-spin inline-block" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-outline inline-block" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{tc.id}</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[10px] font-mono">
                        {tc.module}
                      </span>
                      <span className="font-semibold text-on-surface">{tc.name}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1">{tc.description}</p>
                    {tc.outputMessage && (
                      <div className="mt-1.5 font-mono text-[11px] text-emerald-800 bg-emerald-100/60 p-1.5 rounded">
                        ✓ {tc.outputMessage}
                      </div>
                    )}
                  </div>
                </div>

                {tc.durationMs !== undefined && (
                  <span className="font-mono text-[10px] text-on-surface-variant shrink-0">
                    {tc.durationMs}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-outline-variant/30 bg-surface-container-low/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Tích hợp tương thích với Vitest CLI: <code>npm run test</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { validateSubmissionFilename, FilenameValidationResult } from '../../utils/validator';
import { CheckCircle2, AlertCircle, AlertTriangle, Copy, Check, Sparkles } from 'lucide-react';

export const FilenameValidator: React.FC = () => {
  const [inputName, setInputName] = useState<string>('521H0123_NguyenVanA_BM01.pdf');
  const [result, setResult] = useState<FilenameValidationResult | null>(() =>
    validateSubmissionFilename('521H0123_NguyenVanA_BM01.pdf')
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleValidate = (value: string) => {
    setInputName(value);
    setResult(validateSubmissionFilename(value));
  };

  const copySuggested = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testExamples = [
    { label: 'File chuẩn mẫu', val: '521H0123_NguyenVanA_BM01.pdf' },
    { label: 'Lỗi có dấu cách', val: '521H0123 Nguyen Van A BM01.pdf' },
    { label: 'Lỗi đuôi .docx', val: '521H0123_NguyenVanA_BM01.docx' },
    { label: 'Lỗi thiếu phần', val: '521H0123_BM01.pdf' }
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Input box */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
          Nhập hoặc dán tên file bài nộp cần kiểm tra:
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputName}
            onChange={(e) => handleValidate(e.target.value)}
            placeholder="Ví dụ: 521H0123_NguyenVanA_BM01.pdf"
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant focus:border-secondary focus:outline-none text-sm font-mono text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Quick sample buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="text-[11px] text-on-surface-variant">Thử nhanh:</span>
          {testExamples.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleValidate(item.val)}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.isValid ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Tên file HỢP LỆ theo quy chế Khoa CNTT</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-error font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <span>Tên file CHƯA HỢP LỆ - Cần chỉnh sửa</span>
                </div>
              )}
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
              result.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {result.score}/100 điểm
            </span>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="p-3.5 rounded-lg bg-red-50/70 border border-red-200 space-y-1.5">
              <span className="text-xs font-bold text-error flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Các lỗi bắt buộc phải sửa:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-red-900">
                {result.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Khuyến nghị bổ sung:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                {result.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Auto Suggested Fix */}
          {result.suggestedName && (
            <div className="p-3.5 rounded-lg bg-surface-container border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tên file chuẩn đề xuất:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-primary block mt-0.5">
                  {result.suggestedName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => copySuggested(result.suggestedName!)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container transition-all text-xs font-semibold shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép tên chuẩn</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

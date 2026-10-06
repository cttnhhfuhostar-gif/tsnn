import React from 'react';
import { DOCUMENTS_DATA } from '../data/documentsData';
import { Download, Copy, Check, FileText, Stamp, ExternalLink } from 'lucide-react';

interface ResourcesSectionProps {
  lang: 'vi' | 'en';
  onCopyFileName: (fileName: string) => void;
  copiedName: string | null;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  lang,
  onCopyFileName,
  copiedName
}) => {
  return (
    <section id="tai-nguyen" className="flex flex-col gap-5 scroll-mt-28">
      {/* Title */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary font-display">
              {lang === 'vi'
                ? '6. Kho Biểu Mẫu Chuẩn BM01 - BM06 & Tài Nguyên'
                : '6. Official Forms Repository & Resources'}
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant">
            {lang === 'vi'
              ? 'Tải biểu mẫu chính thức, sao chép cú pháp đặt tên file chuẩn và xem hướng dẫn điền thông tin chi tiết.'
              : 'Download accredited academic templates, copy standard file nomenclature, and review submission guidelines.'}
          </p>
        </div>

        <a
          href="https://tinyurl.com/BieuMauHocPhan"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all shrink-0 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Tải Trọn Bộ (Google Drive)' : 'Full Drive Package'}</span>
        </a>
      </div>

      {/* Forms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENTS_DATA.map((doc) => (
          <div
            key={doc.id}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4 hover:border-secondary/50 transition-colors"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2.5 py-1 rounded-md bg-primary text-on-primary font-mono text-xs font-bold">
                  {doc.code}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container text-on-surface-variant font-medium">
                    {doc.stage}
                  </span>
                  {doc.hasRedSeal && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <Stamp className="w-3 h-3 text-amber-700" />
                      <span>{lang === 'vi' ? 'Mộc tròn đỏ' : 'Red Seal'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-on-surface leading-snug">
                {lang === 'vi' ? doc.nameVi : doc.nameEn}
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                {lang === 'vi' ? doc.descriptionVi : doc.descriptionEn}
              </p>

              {/* Tips */}
              <div className="mt-3 pt-3 border-t border-outline-variant/20">
                <span className="text-[11px] font-semibold text-primary block mb-1">
                  💡 {lang === 'vi' ? 'Lưu ý khi nộp:' : 'Important notes:'}
                </span>
                <ul className="space-y-1">
                  {(lang === 'vi' ? doc.tipsVi : doc.tipsEn).slice(0, 2).map((tip, idx) => (
                    <li key={idx} className="text-[11px] text-on-surface-variant flex items-start gap-1.5">
                      <span className="text-secondary font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-2">
              <a
                href={doc.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Tải mẫu' : 'Download'}</span>
              </a>

              <button
                onClick={() => onCopyFileName(doc.standardFileName)}
                className="inline-flex items-center gap-1 text-xs font-mono text-on-surface-variant hover:text-primary transition-colors bg-surface-container px-2 py-1 rounded"
                title="Sao chép tên file chuẩn nộp bài"
              >
                {copiedName === doc.standardFileName ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold text-[11px]">Đã copy</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[11px]">Copy tên file</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

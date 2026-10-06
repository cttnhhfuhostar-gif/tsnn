import React from 'react';
import { STAGES_DATA, StageInfo } from '../data/stagesData';
import { DOCUMENTS_DATA } from '../data/documentsData';
import { CheckCircle2, AlertCircle, FileText, Download, Copy, Check } from 'lucide-react';

interface StageSectionProps {
  lang: 'vi' | 'en';
  onCopyFileName: (fileName: string) => void;
  copiedName: string | null;
}

export const StageSection: React.FC<StageSectionProps> = ({
  lang,
  onCopyFileName,
  copiedName
}) => {
  return (
    <div className="flex flex-col gap-10">
      {STAGES_DATA.map((stage) => {
        const relatedDocs = DOCUMENTS_DATA.filter((d) =>
          stage.requiredForms.includes(d.code)
        );

        return (
          <section
            key={stage.id}
            id={stage.id}
            className="flex flex-col gap-5 scroll-mt-28"
          >
            {/* Header Card */}
            <div
              className={`bg-surface-container-lowest p-6 rounded-2xl shadow-xs border-l-4 ${stage.color} border border-outline-variant/30`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-primary">
                    {stage.stepNumber}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary font-display">
                    {lang === 'vi' ? stage.titleVi : stage.titleEn}
                  </h2>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-secondary font-mono">
                  {lang === 'vi' ? stage.timeframeVi : stage.timeframeEn}
                </div>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed">
                {lang === 'vi' ? stage.shortDescVi : stage.shortDescEn}
              </p>
            </div>

            {/* Content Grid: Checklist & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Checklist Tasks (2 cols) */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span>
                    {lang === 'vi'
                      ? 'Nhiệm vụ bắt buộc cần hoàn tất:'
                      : 'Mandatory Milestones & Deliverables:'}
                  </span>
                </h3>

                <ul className="space-y-3">
                  {(lang === 'vi'
                    ? stage.checklistItemsVi
                    : stage.checklistItemsEn
                  ).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-on-surface-variant"
                    >
                      <span className="w-5 h-5 rounded-md bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Related Forms in this stage */}
                {relatedDocs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono block mb-3">
                      {lang === 'vi' ? 'Biểu mẫu áp dụng:' : 'Applicable Forms:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl bg-surface-container/50 border border-outline-variant/40 flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded bg-primary text-on-primary font-mono text-[10px] font-bold">
                                {doc.code}
                              </span>
                              {doc.hasRedSeal && (
                                <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  {lang === 'vi' ? 'Mộc tròn đỏ' : 'Red Seal'}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-on-surface mt-1 line-clamp-1">
                                {lang === 'vi' ? doc.nameVi : doc.nameEn}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={doc.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] font-medium text-secondary hover:underline"
                            >
                              <Download className="w-3 h-3" />
                              <span>{lang === 'vi' ? 'Tải mẫu' : 'Download'}</span>
                            </a>
                            <span className="text-outline-variant text-[10px]">•</span>
                            <button
                              onClick={() => onCopyFileName(doc.standardFileName)}
                              className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant hover:text-primary"
                              title="Sao chép tên file chuẩn"
                            >
                              {copiedName === doc.standardFileName ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Đã copy</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy tên file</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Notes / Lưu ý mộc đỏ & quy định (1 col) */}
              <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 flex flex-col gap-4">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>{lang === 'vi' ? 'Lưu ý & Cảnh báo:' : 'Critical Notices:'}</span>
                </h3>

                <div className="space-y-3">
                  {(lang === 'vi' ? stage.keyNotesVi : stage.keyNotesEn).map(
                    (note, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-surface-container-lowest border border-amber-200 text-xs text-on-surface leading-relaxed"
                      >
                        {note}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-auto p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="text-[11px] font-semibold text-primary">
                    💡 {lang === 'vi' ? 'Quy định TDTU:' : 'TDTU Regulation:'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {lang === 'vi'
                      ? 'Mọi thay đổi thông tin thực tập phải được thông báo trước 14 ngày làm việc.'
                      : 'Any company amendment must be notified within 14 working days.'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

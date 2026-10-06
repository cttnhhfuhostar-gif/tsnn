import React, { useState } from 'react';
import { FAQ_DATA, FaqItem } from '../data/faqData';
import { HelpCircle, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface TroubleshootingSectionProps {
  lang: 'vi' | 'en';
}

export const TroubleshootingSection: React.FC<TroubleshootingSectionProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0].id);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="su-co" className="flex flex-col gap-5 scroll-mt-28">
      {/* Title */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xs border border-outline-variant/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary font-display">
            {lang === 'vi'
              ? '5. Xử Lý Sự Cố & Câu Hỏi Thường Gặp (FAQ)'
              : '5. Troubleshooting & Frequently Asked Questions'}
          </h2>
        </div>
        <p className="text-sm text-on-surface-variant">
          {lang === 'vi'
            ? 'Tổng hợp giải pháp cho các tình huống phát sinh thường gặp: Trục trặc con dấu, thay đổi nơi thực tập, làm remote và quy chuẩn chấm điểm.'
            : 'Operational solutions for common incidents: Seal discrepancies, host company relocation, remote internship and scoring compliance.'}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQ_DATA.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(item.id)}
                className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-surface-container/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {item.severity === 'danger' ? (
                    <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  ) : item.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm sm:text-base font-semibold text-on-surface leading-snug">
                    {lang === 'vi' ? item.questionVi : item.questionEn}
                  </span>
                </div>
                <div className="text-on-surface-variant shrink-0 mt-1">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="p-4 sm:p-5 pt-0 border-t border-outline-variant/20 bg-surface/50 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface">
                    {lang === 'vi' ? item.answerVi : item.answerEn}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

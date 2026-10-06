import React from 'react';
import { I18N_DATA } from '../data/i18nData';
import { Clock, Calendar, Stamp, FileCheck, BookOpen, Wrench, ShieldAlert } from 'lucide-react';

interface HeroSectionProps {
  lang: 'vi' | 'en';
  onOpenTools: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang, onOpenTools }) => {
  const t = I18N_DATA[lang].hero;

  return (
    <section id="tong-quan" className="flex flex-col gap-6 scroll-mt-28">
      {/* Hero Banner */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              {t.badge}
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight font-display">
              {t.title}
            </h1>
            
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenTools}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow hover:bg-primary-container transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>{t.toolsBtn}</span>
            </button>

            <a
              href="https://tinyurl.com/CamNangHocPhanNgheNghiep"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-all"
            >
              <BookOpen className="w-4 h-4 text-secondary" />
              <span>{t.readHandbookBtn}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border-l-4 border-l-secondary border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              {t.hourReqTitle}
            </span>
            <Clock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-primary font-display">≥ 120H</span>
              <span className="text-xs text-on-surface-variant">/ học phần</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {t.hourReqDesc}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border-l-4 border-l-secondary border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              {t.scheduleTitle}
            </span>
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-primary font-display">15 Tuần</div>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {t.scheduleDesc}
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border-l-4 border-l-amber-500 border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-amber-700">
              {t.sealTitle}
            </span>
            <Stamp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-800 font-display">Mộc Tròn Đỏ</div>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {t.sealDesc}
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border-l-4 border-l-emerald-500 border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-700">
              {t.formatTitle}
            </span>
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-800 font-display">Đóng Cuốn & PDF</div>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {t.formatDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

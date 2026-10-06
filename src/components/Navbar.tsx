import React from 'react';
import { I18N_DATA } from '../data/i18nData';
import { Bot, Wrench, Settings, PlayCircle, Download } from 'lucide-react';

interface NavbarProps {
  lang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;
  onOpenTools: () => void;
  onOpenAI: () => void;
  onOpenAdmin: () => void;
  onOpenTests: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  onOpenTools,
  onOpenAI,
  onOpenAdmin,
  onOpenTests
}) => {
  const t = I18N_DATA[lang].nav;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-sm tracking-tight shadow-sm">
            IT
          </div>
          <div>
            <div className="font-bold text-primary text-sm sm:text-base tracking-tight flex items-center gap-1.5">
              <span>TDTU</span>
              <span className="text-outline-variant">•</span>
              <span>KHOA CNTT</span>
            </div>
            <p className="text-[10px] text-on-surface-variant hidden sm:block">
              Cổng Hướng Dẫn & Quản Lý Học Phần TSNN & KTCN
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Advisor Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all font-medium text-xs sm:text-sm"
            title="Mở Trợ lý AI Quy chế"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden md:inline">{t.aiAdvisor}</span>
          </button>

          {/* Student Tools Button */}
          <button
            onClick={onOpenTools}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-medium text-xs sm:text-sm shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tools}</span>
          </button>

          {/* Run Tests Button */}
          <button
            onClick={onOpenTests}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-medium text-xs border border-emerald-200"
            title="Chạy Test Suite Kiểm thử tự động"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.tests}</span>
          </button>

          {/* Admin Button */}
          <button
            onClick={onOpenAdmin}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Cấu hình Học kỳ (Admin)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-surface-container p-0.5 ml-1">
            <button
              type="button"
              onClick={() => setLang('vi')}
              className={`rounded px-2 py-1 text-xs font-bold transition-all ${
                lang === 'vi'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded px-2 py-1 text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              EN
            </button>
          </div>

          {/* Direct Download Forms Link */}
          <a
            href="https://tinyurl.com/BieuMauHocPhan"
            target="_blank"
            rel="noreferrer"
            className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span>Kho BM</span>
          </a>
        </div>
      </div>
    </header>
  );
};

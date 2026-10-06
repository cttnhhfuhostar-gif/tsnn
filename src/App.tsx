import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SubNav } from './components/SubNav';
import { HeroSection } from './components/HeroSection';
import { StageSection } from './components/StageSection';
import { TroubleshootingSection } from './components/TroubleshootingSection';
import { ResourcesSection } from './components/ResourcesSection';
import { StudentToolsModal } from './components/StudentTools/StudentToolsModal';
import { AIChatModal } from './components/AIAdvisor/AIChatModal';
import { AdminModal } from './components/Admin/AdminModal';
import { TestRunnerModal } from './components/Testing/TestRunnerModal';
import { Search, Bot, Wrench, PlayCircle, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isTestsOpen, setIsTestsOpen] = useState<boolean>(false);

  // Quick Filter Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopyFileName = (fileName: string) => {
    navigator.clipboard.writeText(fileName);
    setCopiedName(fileName);
    setToastMessage(lang === 'vi' ? `Đã sao chép: ${fileName}` : `Copied: ${fileName}`);

    setTimeout(() => {
      setCopiedName(null);
      setToastMessage(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans">
      {/* 1. Header */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
      />

      {/* 2. SubNav (Sticky) */}
      <SubNav lang={lang} />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
        {/* Quick Search & Banner Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'vi' ? 'Tìm nhanh biểu mẫu, quy chế, từ khóa...' : 'Quick search forms, rules, keywords...'}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs sm:text-sm focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsAIOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary-container transition-all shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Hỏi AI Quy Chế' : 'Ask AI'}</span>
            </button>
            <button
              onClick={() => setIsToolsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all shadow-xs"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Mở Bộ Công Cụ' : 'Open Tools'}</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <HeroSection lang={lang} onOpenTools={() => setIsToolsOpen(true)} />

        {/* Stages 1, 2, 3 */}
        <StageSection
          lang={lang}
          onCopyFileName={handleCopyFileName}
          copiedName={copiedName}
        />

        {/* Troubleshooting & FAQ */}
        <TroubleshootingSection lang={lang} />

        {/* Forms Repository */}
        <ResourcesSection
          lang={lang}
          onCopyFileName={handleCopyFileName}
          copiedName={copiedName}
        />
      </main>

      {/* Floating Action Button (AI Assistant) */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-secondary text-on-secondary shadow-lg hover:bg-secondary-container hover:scale-105 transition-all text-xs sm:text-sm font-bold"
        title="Trợ lý AI Cố vấn Quy chế TSNN & KTCN"
      >
        <Bot className="w-5 h-5 animate-bounce" />
        <span className="hidden sm:inline">Trợ lý AI Cố Vấn</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-on-surface text-surface text-xs font-semibold shadow-xl border border-outline-variant animate-slide-up flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <StudentToolsModal
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        lang={lang}
      />

      <AIChatModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        lang={lang}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <TestRunnerModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-outline-variant/30 bg-surface-container-low/40 py-8 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-primary">TDTU • KHOA CNTT</span>
            <span>- Cổng Thông Tin & Quản Lý Học Phần Thực Tập TSNN & KTCN v2.0</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTestsOpen(true)}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Kiểm Thử Tự Động (8 Tests)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-primary transition-colors"
            >
              Cấu hình Học vụ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

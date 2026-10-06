import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface SubNavProps {
  lang: 'vi' | 'en';
}

export const SubNav: React.FC<SubNavProps> = ({ lang }) => {
  const [activeId, setActiveId] = useState<string>('tong-quan');

  const navLinks = [
    { id: 'tong-quan', labelVi: '1. Tổng quan', labelEn: '1. Overview' },
    { id: 'giai-doan-1', labelVi: '2. GĐ1: Chuẩn bị & Đăng ký', labelEn: '2. Stage 1: Preparation' },
    { id: 'giai-doan-2', labelVi: '3. GĐ2: Trong 120H', labelEn: '3. Stage 2: Active 120H' },
    { id: 'giai-doan-3', labelVi: '4. GĐ3: Nộp Hồ Sơ (HSMH)', labelEn: '4. Stage 3: Dossier' },
    { id: 'su-co', labelVi: '5. Xử lý sự cố', labelEn: '5. Troubleshooting' },
    { id: 'tai-nguyen', labelVi: '6. Biểu mẫu & Kho file', labelEn: '6. Forms & Downloads' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = navLinks.length - 1; i >= 0; i--) {
        const element = document.getElementById(navLinks[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveId(id);
    }
  };

  return (
    <nav className="sticky top-14 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 py-2.5 px-4 sm:px-6 shadow-xs">
      <div className="max-w-[1440px] mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-wider shrink-0">
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === 'vi' ? 'Mục lục:' : 'Index:'}</span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navLinks.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {lang === 'vi' ? item.labelVi : item.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

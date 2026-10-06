import React, { useState } from 'react';
import { MilestoneTracker } from './MilestoneTracker';
import { InteractiveChecklist } from './InteractiveChecklist';
import { FilenameValidator } from './FilenameValidator';
import { QuickFormFiller } from './QuickFormFiller';
import { X, Wrench, Clock, CheckSquare, FileSearch, FileEdit } from 'lucide-react';

interface StudentToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const StudentToolsModal: React.FC<StudentToolsModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'validator' | 'hours' | 'checklist' | 'filler'>('validator');

  if (!isOpen) return null;

  const tabs = [
    { id: 'validator', label: '1. Kiểm tra Tên File (Validator)', icon: FileSearch },
    { id: 'hours', label: '2. Tính Giờ & Tiến Độ (120H/240H)', icon: Clock },
    { id: 'checklist', label: '3. Checklist Hồ Sơ Cá Nhân', icon: CheckSquare },
    { id: 'filler', label: '4. Điền Nhanh Biểu Mẫu', icon: FileEdit },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-xl border border-outline-variant/40 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-display">
                Bộ Công Cụ Hỗ Trợ Sinh Viên Thực Tập
              </h3>
              <p className="text-xs text-on-surface-variant">
                Khoa Công Nghệ Thông Tin • Đại học Tôn Đức Thắng
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

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 px-5 bg-surface-container-low/50 overflow-x-auto no-scrollbar gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-primary text-primary bg-surface-container-lowest rounded-t-lg'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'validator' && <FilenameValidator />}
          {activeTab === 'hours' && <MilestoneTracker />}
          {activeTab === 'checklist' && <InteractiveChecklist />}
          {activeTab === 'filler' && <QuickFormFiller />}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-outline-variant/30 bg-surface-container-low/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Hỗ trợ định dạng chuẩn cho cả học phần TSNN và KTCN</span>
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

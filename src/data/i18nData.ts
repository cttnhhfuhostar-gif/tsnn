export interface TranslationType {
  nav: {
    faculty: string;
    overview: string;
    stage1: string;
    stage2: string;
    stage3: string;
    troubleshoot: string;
    resources: string;
    tools: string;
    aiAdvisor: string;
    admin: string;
    tests: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    readHandbookBtn: string;
    toolsBtn: string;
    hourReqTitle: string;
    hourReqDesc: string;
    scheduleTitle: string;
    scheduleDesc: string;
    sealTitle: string;
    sealDesc: string;
    formatTitle: string;
    formatDesc: string;
  };
}

export const I18N_DATA: Record<'vi' | 'en', TranslationType> = {
  vi: {
    nav: {
      faculty: 'TDTU • KHOA CNTT',
      overview: '1. Tổng quan',
      stage1: '2. GĐ1: Chuẩn bị',
      stage2: '3. GĐ2: Trong 120H',
      stage3: '4. GĐ3: Nộp HSMH',
      troubleshoot: '5. Xử lý sự cố',
      resources: '6. Biểu mẫu & Kho file',
      tools: 'Công cụ Sinh viên',
      aiAdvisor: 'Trợ lý AI Quy chế',
      admin: 'Quản trị',
      tests: 'Chạy Test Suite'
    },
    hero: {
      badge: 'Khoa Công Nghệ Thông Tin • Đại học Tôn Đức Thắng',
      title: 'CỔNG QUẢN LÝ & HƯỚNG DẪN HỌC PHẦN TSNN & KTCN',
      subtitle: 'Hệ thống tương tác thông minh hỗ trợ sinh viên hoàn thành thủ tục học vụ, theo dõi tiến độ thực tập 120H/240H, kiểm tra biểu mẫu BM01-BM06 và chuẩn hóa hồ sơ môn học (HSMH).',
      readHandbookBtn: 'Cẩm Nang Hướng Dẫn',
      toolsBtn: 'Bộ Công Cụ Sinh Viên',
      hourReqTitle: 'Khối Lượng Giờ',
      hourReqDesc: '≥ 120H/học phần. Nếu học song hành cả TSNN và KTCN thì bắt buộc ≥ 240H.',
      scheduleTitle: 'Khung Thời Gian',
      scheduleDesc: 'Tuân thủ khung 15 tuần học kỳ chính thức của TDTU.',
      sealTitle: 'Điều Kiện Mộc Đỏ',
      sealDesc: 'BM01, BM03, BM04 bắt buộc có mộc tròn đỏ pháp nhân của doanh nghiệp.',
      formatTitle: 'Quy Chuẩn Hồ Sơ',
      formatDesc: 'Đóng cuốn bìa kính theo thứ tự quy định và nộp file PDF chuẩn cú pháp.'
    }
  },
  en: {
    nav: {
      faculty: 'TDTU • FACULTY OF IT',
      overview: '1. Overview',
      stage1: '2. Stage 1: Preparation',
      stage2: '3. Stage 2: Active 120H',
      stage3: '4. Stage 3: Dossier Submission',
      troubleshoot: '5. Troubleshooting',
      resources: '6. Forms & Downloads',
      tools: 'Student Tools',
      aiAdvisor: 'AI Policy Assistant',
      admin: 'Admin Portal',
      tests: 'Run Test Suite'
    },
    hero: {
      badge: 'Faculty of Information Technology • Ton Duc Thang University',
      title: 'INTERNSHIP MANAGEMENT & ACADEMIC DOSSIER PORTAL',
      subtitle: 'Smart interactive portal supporting students in navigating internship requirements, tracking 120H/240H milestones, verifying forms BM01-BM06, and validating dossier submissions.',
      readHandbookBtn: 'Official Handbook',
      toolsBtn: 'Student Toolkit',
      hourReqTitle: 'Hour Requirements',
      hourReqDesc: '≥ 120H per course. Dual enrollment in TSNN & KTCN mandates ≥ 240H.',
      scheduleTitle: 'Academic Calendar',
      scheduleDesc: 'Aligned with official 15-week semester calendar of TDTU.',
      sealTitle: 'Company Stamp Policy',
      sealDesc: 'BM01, BM03, BM04 require official registered legal corporate red seal.',
      formatTitle: 'Dossier Standards',
      formatDesc: 'Binding sequence compliance and standardized PDF naming nomenclature.'
    }
  }
};

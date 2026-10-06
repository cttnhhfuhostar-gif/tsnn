export interface FaqItem {
  id: string;
  category: 'SEAL' | 'CHANGE_COMPANY' | 'HOURS' | 'SUBMISSION' | 'SPECIAL';
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
  severity: 'warning' | 'info' | 'danger';
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-seal',
    category: 'SEAL',
    questionVi: 'Công ty khởi nghiệp/Start-up chỉ có mộc vuông hoặc không dùng con dấu thì xử lý thế nào?',
    questionEn: 'What if the startup only has a square seal or does not use physical stamps?',
    answerVi: 'Theo Luật Doanh nghiệp 2020, doanh nghiệp có quyền tự quyết hình thức dấu. Tuy nhiên để hồ sơ học vụ tại Khoa CNTT TDTU được công nhận, sinh viên cần nộp kèm: (1) Bản sao Giấy phép đăng ký kinh doanh (ĐKKD) có mã số thuế của công ty; (2) Bản xác nhận phương thức sử dụng con dấu hoặc chữ ký số hợp lệ của người đại diện theo pháp luật.',
    answerEn: 'Under VN Enterprise Law 2020, firms may choose seal forms. For TDTU academic accreditation, students must attach: (1) Copy of Enterprise Registration Certificate with active Tax ID; (2) Formal confirmation letter from legal representative validating sign-off procedure.',
    severity: 'danger'
  },
  {
    id: 'faq-hours-dual',
    category: 'HOURS',
    questionVi: 'Nếu em học song hành cả TSNN và KTCN trong cùng một học kỳ thì tính giờ như thế nào?',
    questionEn: 'How are internship hours calculated when co-enrolling in both TSNN & KTCN in the same semester?',
    answerVi: 'Nếu đăng ký đồng thời 2 môn trong cùng một học kỳ, tổng số giờ làm việc bắt buộc phải tích lũy là ≥ 240 giờ (120 giờ cho TSNN + 120 giờ cho KTCN). Bạn phải lập 2 bộ hồ sơ riêng biệt và nội dung công việc trong nhật ký BM03 giữa 2 học phần phải có sự phân định rõ ràng về phạm vi nhiệm vụ.',
    answerEn: 'If taking both courses simultaneously, minimum required hours must be ≥ 240 hours (120H for TSNN + 120H for KTCN). You must maintain two distinct dossier packages with separate logbook tasks reflecting specific responsibilities.',
    severity: 'warning'
  },
  {
    id: 'faq-change-company',
    category: 'CHANGE_COMPANY',
    questionVi: 'Trong quá trình thực tập bị sự cố muốn chuyển sang công ty khác có được không?',
    questionEn: 'Can I switch to another internship company mid-way if unforeseen issues arise?',
    answerVi: 'Được phép, nhưng chỉ trong vòng 2 - 3 tuần đầu tiên của học kỳ. Sinh viên phải: (1) Làm đơn xin đổi đơn vị thực tập có lý do chính đáng; (2) Có xác nhận ngừng thực tập từ công ty cũ; (3) Nộp lại BM01 mới từ công ty tiếp nhận mới và được Giảng viên phụ trách/Khoa phê duyệt.',
    answerEn: 'Permitted only within the first 2-3 weeks of semester. You must: (1) Submit company change petition with justified reasons; (2) Obtain release acknowledgment from old company; (3) Submit fresh BM01 from new company for Faculty approval.',
    severity: 'warning'
  },
  {
    id: 'faq-score-erasure',
    category: 'SUBMISSION',
    questionVi: 'Phiếu BM04 của công ty ghi nhầm điểm rồi gạch xóa sửa lại có được chấp nhận không?',
    questionEn: 'Is BM04 accepted if the mentor accidentally made a mistake and crossed out the score?',
    answerVi: 'TUYỆT ĐỐI KHÔNG. Phiếu đánh giá BM04 có dấu hiệu tẩy xóa điểm số (kể cả dùng bút xóa hoặc gạch viết lại) sẽ bị Khoa hủy bỏ và tính 0 điểm môn học. Nếu ghi nhầm, bắt buộc phải in phiếu mới nhờ công ty chấm và đóng dấu lại, hoặc tại chỗ sửa phải có con dấu đóng đè xác nhận của lãnh đạo.',
    answerEn: 'STRICTLY FORBIDDEN. Any erasure, correction fluid, or strike-through marks on BM04 score fields will invalidate the result. A brand new sheet must be re-evaluated and stamped, or explicit corporate counter-seal applied right next to alteration.',
    severity: 'danger'
  },
  {
    id: 'faq-remote',
    category: 'SPECIAL',
    questionVi: 'Công ty cho làm việc Remote / Online 100% thì minh chứng thế nào?',
    questionEn: 'What evidence is required if interning 100% remotely?',
    answerVi: 'Chấp nhận làm remote nếu có thỏa thuận tiếp nhận ghi rõ hình thức làm việc từ xa. Để chứng minh đủ 120H, sinh viên phải lưu trữ lịch sử commit Git, task Jira/Trello, ảnh chụp tham gia họp Sprint qua Zoom/Meet và có chữ ký xác nhận hàng tuần của mentor qua file scan có dấu.',
    answerEn: 'Remote internships are accepted if stated in the acceptance agreement. To substantiate 120H, maintain Git commits log, Jira sprint boards, remote meeting attendance, and signed mentor verification scans.',
    severity: 'info'
  }
];

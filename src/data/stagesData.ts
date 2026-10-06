export interface StageInfo {
  id: string;
  stepNumber: number;
  titleVi: string;
  titleEn: string;
  timeframeVi: string;
  timeframeEn: string;
  shortDescVi: string;
  shortDescEn: string;
  checklistItemsVi: string[];
  checklistItemsEn: string[];
  keyNotesVi: string[];
  keyNotesEn: string[];
  requiredForms: string[]; // ['BM01', 'BM02']
  color: string;
}

export const STAGES_DATA: StageInfo[] = [
  {
    id: 'giai-doan-1',
    stepNumber: 1,
    titleVi: 'GĐ1: Chuẩn bị & Đăng ký Doanh nghiệp',
    titleEn: 'Stage 1: Preparation & Company Registration',
    timeframeVi: 'Tuần 1 - Tuần 2 của Học kỳ',
    timeframeEn: 'Week 1 - Week 2 of Academic Term',
    shortDescVi: 'Tìm kiếm công ty phù hợp với chuyên ngành CNTT, hoàn thiện thủ tục tiếp nhận và đăng ký thông tin với Khoa.',
    shortDescEn: 'Secure an IT-relevant internship company, obtain formal acceptance, and submit enrollment forms to the Faculty.',
    checklistItemsVi: [
      'Xác nhận công ty hoạt động hợp pháp (Mã số thuế, website, mộc tròn đỏ pháp nhân).',
      'Công việc phù hợp chuyên ngành: Phần mềm, Mạng, An toàn thông tin, Data, AI/ML, Tester, DevOps...',
      'Điền BM01 (Phiếu tiếp nhận) có đầy đủ chữ ký mentor và mộc tròn của công ty.',
      'Ký BM02 (Bản cam kết sinh viên).',
      'Đăng ký thông tin công ty và cán bộ hướng dẫn lên link Google Form của Khoa trước hạn chót.'
    ],
    checklistItemsEn: [
      'Verify enterprise legal standing (tax ID, active website, official company stamp).',
      'Job role matches IT discipline: Software, Networking, CyberSec, Data/AI, QA/QC, DevOps...',
      'Complete Form BM01 with mentor signature and company official seal.',
      'Sign Form BM02 (Internship commitment).',
      'Submit company details and mentor contact to the Faculty portal before deadline.'
    ],
    keyNotesVi: [
      'Khoa KHÔNG chấp nhận các công ty không có mộc tròn hoặc chỉ có mộc vuông/mộc chức danh (trừ khi có Giấy ĐKKD giải trình).',
      'Nếu đổi nơi thực tập, phải làm đơn trình báo Khoa trong 14 ngày đầu kỳ học.'
    ],
    keyNotesEn: [
      'The Faculty does not accept unauthorized square stamps or name-only stamps without legal registration.',
      'Company change request must be submitted within the first 14 days of the semester.'
    ],
    requiredForms: ['BM01', 'BM02'],
    color: 'border-l-blue-500'
  },
  {
    id: 'giai-doan-2',
    stepNumber: 2,
    titleVi: 'GĐ2: Trong quá trình Thực tập (Tối thiểu 120H)',
    titleEn: 'Stage 2: Active Internship Period (Min 120H)',
    timeframeVi: 'Tuần 3 - Tuần 13 của Học kỳ',
    timeframeEn: 'Week 3 - Week 13 of Academic Term',
    shortDescVi: 'Tham gia làm việc thực tế tại doanh nghiệp, tích lũy số giờ yêu cầu, duy trì ghi chép nhật ký công việc hàng tuần.',
    shortDescEn: 'Engage in actual company workplace projects, accumulate required hours, and record weekly progress logbook.',
    checklistItemsVi: [
      'Tích lũy tối thiểu ≥ 120 giờ thực tập cho 1 học phần (hoặc ≥ 240 giờ nếu đăng ký song hành cả TSNN và KTCN).',
      'Ghi chép Nhật ký thực tập BM03 chi tiết theo từng tuần (nêu rõ task công việc, công nghệ áp dụng, kết quả).',
      'Hàng tuần hoặc mỗi 2 tuần xin chữ ký xác nhận của Cán bộ hướng dẫn doanh nghiệp vào BM03.',
      'Chủ động liên hệ Giảng viên hướng dẫn TDTU phụ trách nhóm để báo cáo tiến độ giữa kỳ.',
      'Lưu trữ hình ảnh nơi làm việc, các demo dự án để làm minh chứng trong báo cáo BM05.'
    ],
    checklistItemsEn: [
      'Accumulate ≥ 120 working hours per course (or ≥ 240 hours for dual enrollment of TSNN & KTCN).',
      'Maintain BM03 weekly logbook detailing specific programming, QA, or architecture tasks.',
      'Obtain mentor weekly sign-offs regularly.',
      'Check in with assigned TDTU academic advisor for mid-term review.',
      'Collect workspace photos, sprint evidence, and product screenshots for final report BM05.'
    ],
    keyNotesVi: [
      'Không được dồn nhật ký để ký vào tuần cuối cùng — GV chấm sẽ kiểm tra kỹ tính chân thực.',
      'Làm việc hình thức Remote/WFM cần có minh chứng cam kết từ công ty và nhật ký log task chi tiết (Jira/Git commits).'
    ],
    keyNotesEn: [
      'Do not defer mentor signatures to the final week — reviewers audit temporal consistency.',
      'Remote work requires verified company agreement and traceable task logs (Jira/Git commits).'
    ],
    requiredForms: ['BM03'],
    color: 'border-l-amber-500'
  },
  {
    id: 'giai-doan-3',
    stepNumber: 3,
    titleVi: 'GĐ3: Hoàn tất & Nộp Hồ sơ Môn học (HSMH)',
    titleEn: 'Stage 3: Completion & Course Dossier Submission',
    timeframeVi: 'Tuần 14 - Tuần 15 của Học kỳ',
    timeframeEn: 'Week 14 - Week 15 of Academic Term',
    shortDescVi: 'Xin đánh giá điểm số từ công ty (BM04), viết báo cáo tổng kết (BM05), hoàn tất khảo sát (BM06) và nộp bộ hồ sơ hoàn chỉnh.',
    shortDescEn: 'Secure company evaluation (BM04), author technical report (BM05), complete survey (BM06), and submit dossier.',
    checklistItemsVi: [
      'Xin phiếu đánh giá BM04 có điểm số, nhận xét, chữ ký và mộc tròn công ty (hoặc niêm phong phong bì).',
      'Đóng mộc tròn xác nhận ở trang kết thúc của nhật ký BM03.',
      'Hoàn thành Báo cáo chuyên môn BM05 theo đúng chuẩn định dạng Khoa CNTT.',
      'Điền phiếu khảo sát BM06.',
      'Đóng cuốn HSMH theo đúng thứ tự quy chuẩn: Bìa ngoài -> BM01 -> BM02 -> BM03 -> BM04 -> BM05 -> BM06.',
      'Nộp bản mềm PDF (đặt tên đúng quy định) lên link LMS/Form của Khoa và nộp bản cứng tại văn phòng Khoa theo thông báo.'
    ],
    checklistItemsEn: [
      'Obtain signed and stamped BM04 evaluation from company with explicit numeric score.',
      'Official company seal stamped on final page of BM03 logbook.',
      'Finish technical report BM05 adhering strictly to faculty format guide.',
      'Complete student feedback survey BM06.',
      'Assemble dossier in exact hierarchy: Cover -> BM01 -> BM02 -> BM03 -> BM04 -> BM05 -> BM06.',
      'Submit PDF scan with standardized filename on LMS/Portal and physical booklet at Faculty office.'
    ],
    keyNotesVi: [
      'Quy chuẩn đặt tên file: [MSSV]_[HovaTen]_[TenBM].pdf (Không dấu cách, không ký tự đặc biệt).',
      'Tuyệt đối không để xảy ra sai sót tẩy xóa điểm trên BM04 vì phiếu điểm sẽ bị hủy kết quả.'
    ],
    keyNotesEn: [
      'Standardized filename: [StudentID]_[FullName]_[FormCode].pdf (no spaces or special chars).',
      'No corrections or erasures permitted on BM04 score field or it will be invalidated.'
    ],
    requiredForms: ['BM04', 'BM05', 'BM06'],
    color: 'border-l-emerald-500'
  }
];

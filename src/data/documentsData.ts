export interface DocumentItem {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  stage: 'GD1' | 'GD2' | 'GD3';
  requiredHours?: number;
  hasRedSeal: boolean; // Bắt buộc mộc đỏ
  descriptionVi: string;
  descriptionEn: string;
  downloadUrl: string;
  standardFileName: string;
  submissionFormat: 'PDF' | 'DOCX' | 'HARD_COPY';
  tipsVi: string[];
  tipsEn: string[];
}

export const DOCUMENTS_DATA: DocumentItem[] = [
  {
    id: 'bm01',
    code: 'BM01',
    nameVi: 'Phiếu tiếp nhận thực tập (Tiếp nhận SV)',
    nameEn: 'Internship Acceptance Form',
    stage: 'GD1',
    hasRedSeal: true,
    descriptionVi: 'Xác nhận của Doanh nghiệp đồng ý tiếp nhận sinh viên vào thực tập, có đầy đủ chữ ký người đại diện và mộc tròn pháp nhân.',
    descriptionEn: 'Company formal acceptance acknowledging student internship with legal seal and representative signature.',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    standardFileName: 'BM01_PhieuTiepNhanThucTap',
    submissionFormat: 'PDF',
    tipsVi: [
      'Phải có con dấu tròn đỏ pháp nhân của doanh nghiệp hoặc chi nhánh có tư cách pháp lý.',
      'Ghi rõ họ tên, chức vụ của cán bộ hướng dẫn tại doanh nghiệp.',
      'Nộp bản scan màu trong vòng 2 tuần đầu tiên của học kỳ.'
    ],
    tipsEn: [
      'Must have official legal red stamp of company or authorized branch.',
      'Clearly specify mentor name and job title.',
      'Submit colored PDF scan within the first 2 weeks.'
    ]
  },
  {
    id: 'bm02',
    code: 'BM02',
    nameVi: 'Bản cam kết thực tập của sinh viên',
    nameEn: 'Student Internship Commitment',
    stage: 'GD1',
    hasRedSeal: false,
    descriptionVi: 'Bản cam kết sinh viên tuân thủ nội quy công ty, bảo mật thông tin và chấp hành thời gian biểu thực tập.',
    descriptionEn: 'Student commitment to company regulations, confidentiality, and internship schedule.',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    standardFileName: 'BM02_BanCamKetThucTap',
    submissionFormat: 'PDF',
    tipsVi: [
      'Ký ghi rõ họ tên sinh viên.',
      'Có chữ ký xác nhận của phụ huynh nếu đi thực tập ngoài địa bàn TP.HCM.'
    ],
    tipsEn: [
      'Signed with full student name.',
      'Parental signature needed if interning outside HCMC.'
    ]
  },
  {
    id: 'bm03',
    code: 'BM03',
    nameVi: 'Nhật ký thực tập (Theo dõi tiến độ hàng tuần)',
    nameEn: 'Weekly Internship Logbook',
    stage: 'GD2',
    requiredHours: 120,
    hasRedSeal: true,
    descriptionVi: 'Ghi chép chi tiết nội dung công việc từng tuần, số giờ làm việc thực tế (tích lũy tối thiểu 120H/môn hoặc 240H nếu song hành TSNN & KTCN).',
    descriptionEn: 'Weekly work log recording daily tasks and verified hours (min 120H single or 240H dual enrolment).',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    standardFileName: 'BM03_NhatKyThucTap',
    submissionFormat: 'PDF',
    tipsVi: [
      'Cán bộ hướng dẫn tại DN ký nhận xét từng tuần.',
      'Có chữ ký tổng duyệt và đóng mộc tròn đỏ ở trang kết thúc nhật ký.',
      'Mô tả công việc kỹ thuật cụ thể, tránh ghi chung chung như "làm việc văn phòng".'
    ],
    tipsEn: [
      'Company mentor signs off weekly logs.',
      'Final approval signature and company red seal on the last page.',
      'Detail technical tasks rather than generic administrative tasks.'
    ]
  },
  {
    id: 'bm04',
    code: 'BM04',
    nameVi: 'Phiếu đánh giá kết quả thực tập từ Doanh nghiệp',
    nameEn: 'Company Evaluation Sheet',
    stage: 'GD3',
    hasRedSeal: true,
    descriptionVi: 'Bảng điểm và nhận xét chi tiết về thái độ, kỹ năng chuyên môn của SV do Cán bộ hướng dẫn và Lãnh đạo DN ký tên đóng dấu tròn.',
    descriptionEn: 'Evaluation scoresheet and comments on attitude and performance signed by company mentor & sealed.',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    standardFileName: 'BM04_PhieuDanhGiaKetQua',
    submissionFormat: 'PDF',
    tipsVi: [
      'Điểm số phải được ghi rõ ràng cả bằng số và bằng chữ, không tẩy xóa.',
      'Bắt buộc có mộc tròn công ty đè lên chữ ký hoặc giáp lai nếu nhiều trang.',
      'Để trong phong bì dán kín niêm phong nếu công ty yêu cầu bảo mật đánh giá.'
    ],
    tipsEn: [
      'Scores must be written in both numbers and words without corrections.',
      'Official red stamp over signature or cross-page stamp if multiple pages.',
      'Enclose in sealed envelope if enterprise requires confidentiality.'
    ]
  },
  {
    id: 'bm05',
    code: 'BM05',
    nameVi: 'Báo cáo tổng kết thực tập (Báo cáo chuyên môn)',
    nameEn: 'Final Technical Internship Report',
    stage: 'GD3',
    hasRedSeal: false,
    descriptionVi: 'Báo cáo toàn diện về dự án, công nghệ sử dụng, kiến thức học hỏi và kết quả đạt được trong kỳ thực tập.',
    descriptionEn: 'Comprehensive project report covering architecture, technologies applied, outcomes and lessons learned.',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    standardFileName: 'BM05_BaoCaoTongKet',
    submissionFormat: 'PDF',
    tipsVi: [
      'Định dạng theo mẫu chuẩn Khoa CNTT TDTU (Canh lề 2-2-3-2 cm, Font Times New Roman hoặc Be Vietnam Pro, size 13).',
      'Độ dài khuyến nghị: 25 - 45 trang nội dung chính.',
      'Kèm theo minh chứng sản phẩm, ảnh chụp giao diện, sơ đồ hệ thống.'
    ],
    tipsEn: [
      'Formatted to Faculty guidelines (margins, font size 13, 1.5 line spacing).',
      'Recommended length: 25-45 pages.',
      'Attach product evidence, UI screenshots, and architecture diagrams.'
    ]
  },
  {
    id: 'bm06',
    code: 'BM06',
    nameVi: 'Phiếu khảo sát sinh viên về học phần thực tập',
    nameEn: 'Student Internship Survey',
    stage: 'GD3',
    hasRedSeal: false,
    descriptionVi: 'Phiếu khảo sát mức độ hài lòng về môi trường doanh nghiệp, sự hỗ trợ từ khoa và đề xuất cải tiến.',
    descriptionEn: 'Feedback survey evaluating host company environment and university support.',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    standardFileName: 'BM06_PhieuKhaoSat',
    submissionFormat: 'PDF',
    tipsVi: [
      'Điền đầy đủ các câu hỏi khảo sát trung thực.',
      'Đính kèm ở trang cuối cùng của bộ Hồ sơ môn học (HSMH).'
    ],
    tipsEn: [
      'Answer all survey questions objectively.',
      'Placed at the end of the final course dossier.'
    ]
  }
];

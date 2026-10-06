// modules/formsData.js - Dữ liệu biểu mẫu chuẩn BM01-BM06 và quy chuẩn học vụ TDTU
export const FORMS_DATA = [
  {
    code: 'BM01',
    nameVi: 'Phiếu tiếp nhận thực tập (Tiếp nhận SV)',
    nameEn: 'Internship Acceptance Form',
    stage: 'GĐ1',
    hasRedSeal: true,
    standardFileName: 'BM01_PhieuTiepNhanThucTap',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    descVi: 'Xác nhận của Doanh nghiệp đồng ý tiếp nhận sinh viên, có đầy đủ chữ ký người đại diện và mộc tròn pháp nhân.',
    descEn: 'Company formal acceptance acknowledging student internship with legal seal and signature.',
    tipsVi: [
      'Phải có con dấu tròn đỏ pháp nhân của doanh nghiệp hoặc chi nhánh có tư cách pháp lý.',
      'Ghi rõ họ tên, chức danh của cán bộ hướng dẫn tại doanh nghiệp.',
      'Nộp bản scan màu trong vòng 2 tuần đầu tiên của học kỳ.'
    ]
  },
  {
    code: 'BM02',
    nameVi: 'Bản cam kết thực tập của sinh viên',
    nameEn: 'Student Internship Commitment',
    stage: 'GĐ1',
    hasRedSeal: false,
    standardFileName: 'BM02_BanCamKetThucTap',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    descVi: 'Cam kết chấp hành nghiêm chỉnh nội quy công ty, bảo mật thông tin và lịch trình thực tập.',
    descEn: 'Student commitment regarding work discipline and confidentiality.',
    tipsVi: [
      'Ký và ghi rõ họ tên sinh viên.',
      'Có chữ ký xác nhận của phụ huynh nếu đi thực tập xa ngoài TP.HCM.'
    ]
  },
  {
    code: 'BM03',
    nameVi: 'Nhật ký thực tập (Theo dõi tiến độ hàng tuần)',
    nameEn: 'Weekly Internship Logbook',
    stage: 'GĐ2',
    hasRedSeal: true,
    standardFileName: 'BM03_NhatKyThucTap',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    descVi: 'Ghi chép chi tiết công việc từng tuần (tối thiểu 120H/môn, nếu song hành cả TSNN và KTCN thì ≥ 240H).',
    descEn: 'Weekly work log recording daily tasks and verified hours (min 120H single or 240H dual).',
    tipsVi: [
      'Cán bộ hướng dẫn tại công ty ký nhận xét từng tuần.',
      'Bắt buộc có mộc tròn đỏ ở trang kết thúc nhật ký.',
      'Nêu rõ task kỹ thuật cụ thể (Frontend, Backend, Database, QA/QC, Network...).'
    ]
  },
  {
    code: 'BM04',
    nameVi: 'Phiếu đánh giá kết quả thực tập từ Doanh nghiệp',
    nameEn: 'Company Evaluation Sheet',
    stage: 'GĐ3',
    hasRedSeal: true,
    standardFileName: 'BM04_PhieuDanhGiaKetQua',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    descVi: 'Bảng điểm và nhận xét chi tiết về thái độ, kỹ năng chuyên môn do Mentor và Lãnh đạo DN ký tên đóng dấu tròn.',
    descEn: 'Official scoresheet and feedback signed and stamped by company supervisor.',
    tipsVi: [
      'Điểm số phải ghi rõ ràng cả bằng số và bằng chữ, TUYỆT ĐỐI KHÔNG tẩy xóa.',
      'Bắt buộc có mộc tròn công ty đè lên chữ ký hoặc giáp lai nếu nhiều trang.',
      'Hồ sơ có dấu hiệu cạo sửa điểm sẽ bị hủy kết quả học phần.'
    ]
  },
  {
    code: 'BM05',
    nameVi: 'Báo cáo tổng kết thực tập (Báo cáo chuyên môn)',
    nameEn: 'Technical Internship Report',
    stage: 'GĐ3',
    hasRedSeal: false,
    standardFileName: 'BM05_BaoCaoTongKet',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    descVi: 'Báo cáo toàn diện về kiến trúc dự án, công nghệ ứng dụng, đóng góp thực tế và kết quả đạt được.',
    descEn: 'Comprehensive project report covering architecture, technologies applied, and outcomes.',
    tipsVi: [
      'Định dạng chuẩn Khoa CNTT TDTU (Canh lề 2-2-3-2 cm, Font Times New Roman hoặc Be Vietnam Pro, size 13).',
      'Độ dài khuyến nghị: 25 - 45 trang nội dung.',
      'Đính kèm hình ảnh minh chứng sản phẩm, ảnh nơi làm việc.'
    ]
  },
  {
    code: 'BM06',
    nameVi: 'Phiếu khảo sát sinh viên về học phần thực tập',
    nameEn: 'Student Internship Survey',
    stage: 'GĐ3',
    hasRedSeal: false,
    standardFileName: 'BM06_PhieuKhaoSat',
    downloadUrl: 'https://tinyurl.com/BieuMauHocPhan',
    descVi: 'Khảo sát ý kiến đóng góp của sinh viên về doanh nghiệp tiếp nhận và công tác hỗ trợ của Khoa.',
    descEn: 'Student feedback survey evaluating company environment and university support.',
    tipsVi: [
      'Điền đầy đủ và trung thực.',
      'Đính kèm ở trang cuối cùng của bộ hồ sơ môn học (HSMH).'
    ]
  }
];

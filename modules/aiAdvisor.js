// modules/aiAdvisor.js - Trợ lý AI Cố vấn Quy chế TSNN & KTCN TDTU

export function askInternshipAI(query) {
  const q = (query || '').toLowerCase();

  if (q.includes('mộc') || q.includes('dấu') || q.includes('seal') || q.includes('stamp')) {
    return `📌 **Quy chế về Con dấu Doanh nghiệp tại Khoa CNTT TDTU:**
1. **Biểu mẫu bắt buộc có mộc:** BM01 (Tiếp nhận SV), BM03 (Trang kết thúc nhật ký thực tập), BM04 (Phiếu đánh giá điểm số).
2. **Loại mộc được chấp nhận:** Bắt buộc là **mộc tròn đỏ pháp nhân** của Doanh nghiệp hoặc Chi nhánh/VPĐD có thẩm quyền pháp lý.
3. **Trường hợp Start-up chỉ có mộc vuông hoặc không dùng mộc:** Sinh viên bắt buộc phải nộp kèm bản photo **Giấy chứng nhận Đăng ký kinh doanh (ĐKKD)** có Mã số thuế đang hoạt động để Khoa xác minh tính hợp pháp.`;
  }

  if (q.includes('song hành') || q.includes('2 môn') || q.includes('hai môn') || q.includes('dual')) {
    return `📌 **Quy định khi Học Song Hành cả TSNN và KTCN:**
1. **Khối lượng giờ:** Bắt buộc tích lũy **≥ 240 giờ làm việc** (120 giờ cho TSNN + 120 giờ cho KTCN).
2. **Bộ hồ sơ:** Phải nộp thành **2 bộ hồ sơ riêng biệt** hoàn chỉnh.
3. **Nhật ký BM03:** Nội dung công việc và nhiệm vụ giữa 2 môn trong nhật ký phải có sự phân định rành mạch, không được sao chép nguyên văn giống hệt nhau.`;
  }

  if (q.includes('120') || q.includes('giờ') || q.includes('thời lượng') || q.includes('hour')) {
    return `📌 **Quy định về Thời lượng Giờ Thực tập:**
- Mỗi học phần yêu cầu tối thiểu **≥ 120 giờ làm việc thực tế** tại doanh nghiệp (khoảng 3-4 tuần Full-time hoặc 6-8 tuần Part-time).
- Số giờ phải được phân bổ đều đặn và có chữ ký xác nhận của Cán bộ hướng dẫn hàng tuần trong Nhật ký BM03.`;
  }

  if (q.includes('đổi') || q.includes('chuyển') || q.includes('nghỉ') || q.includes('change')) {
    return `📌 **Quy trình Thay đổi Doanh nghiệp thực tập:**
- Chỉ được giải quyết trong vòng **2 - 3 tuần đầu tiên** của học kỳ.
- Sinh viên cần: (1) Làm đơn xin đổi đơn vị thực tập có lý do chính đáng; (2) Xin xác nhận ngừng thực tập từ công ty cũ; (3) Nộp lại BM01 mới từ công ty tiếp nhận mới về cho Giảng viên phụ trách/Khoa phê duyệt.`;
  }

  if (q.includes('tên file') || q.includes('nộp') || q.includes('filename') || q.includes('hsmh') || q.includes('pdf')) {
    return `📌 **Quy chuẩn Đặt tên file nộp bài của Khoa CNTT:**
- Cú pháp: \`[MSSV]_[Hovaten]_[TenBM].pdf\`
- Ví dụ: \`521H0123_NguyenVanA_BM01.pdf\` hoặc \`521H0123_NguyenVanA_HSMH.pdf\`.
- **Cấm:** Không chứa dấu cách (khoảng trắng), họ tên viết không dấu, chỉ nộp định dạng scan màu \`.pdf\`. Hãy sử dụng công cụ **Filename Validator** của cổng để kiểm tra ngay!`;
  }

  if (q.includes('tẩy xóa') || q.includes('sửa điểm') || q.includes('sai điểm')) {
    return `📌 **Cảnh báo về Điểm số BM04:**
- **TUYỆT ĐỐI KHÔNG tẩy xóa, sửa điểm:** Bất kỳ sửa chữa, dùng bút xóa trên phiếu BM04 đều làm phiếu bị vô hiệu lực và tính 0 điểm môn học.
- Nếu lỡ ghi sai, công ty phải in phiếu mới hoặc đóng con dấu tròn đè lên vị trí chữ số đã sửa kèm chữ ký xác nhận của Lãnh đạo.`;
  }

  if (q.includes('bm01') || q.includes('bm02') || q.includes('bm03') || q.includes('bm04') || q.includes('bm05') || q.includes('bm06')) {
    return `📌 **Tổng hợp Hệ thống Biểu mẫu TDTU:**
- **BM01:** Phiếu tiếp nhận SV (Có mộc đỏ) - Nộp GĐ1.
- **BM02:** Bản cam kết sinh viên - Nộp GĐ1.
- **BM03:** Nhật ký thực tập hàng tuần (≥120H, chữ ký mentor & mộc đỏ trang cuối) - Nộp GĐ2 & GĐ3.
- **BM04:** Phiếu đánh giá điểm số của Doanh nghiệp (Có mộc đỏ, không tẩy xóa) - Nộp GĐ3.
- **BM05:** Báo cáo chuyên môn kỹ thuật (25-45 trang) - Nộp GĐ3.
- **BM06:** Phiếu khảo sát ý kiến sinh viên - Nộp GĐ3.`;
  }

  return `Cảm ơn bạn đã hỏi. Về vấn đề này:
Theo Cẩm nang thực tập Khoa CNTT - Đại học Tôn Đức Thắng:
- Mọi hoạt động thực tập cần đảm bảo tiến độ học kỳ (15 tuần) và tuân thủ nội quy của Doanh nghiệp tiếp nhận.
- Đảm bảo lưu trữ đầy đủ tài liệu minh chứng (ảnh làm việc, commits code, phiếu đánh giá).
- Nếu cần giải đáp thêm, bạn có thể tham khảo mục **5. Xử lý sự cố** hoặc mở **Bộ công cụ Sinh viên** ở góc trên nhé!`;
}

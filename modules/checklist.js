// modules/checklist.js - Quản lý checklist cá nhân hóa lưu LocalStorage

const STORAGE_KEY = 'tdtu_intern_checklist_v2';

export const CHECKLIST_ITEMS = [
  { id: 'c1', stage: 'GĐ1', text: 'Tìm công ty thực tập CNTT hợp pháp (Có MST, website, mộc tròn pháp nhân)', isMandatory: true },
  { id: 'c2', stage: 'GĐ1', text: 'Hoàn thành BM01 có đầy đủ chữ ký mentor và mộc tròn đỏ công ty', isMandatory: true },
  { id: 'c3', stage: 'GĐ1', text: 'Ký Bản cam kết sinh viên BM02 và nộp link đăng ký của Khoa trước hạn chót' },
  { id: 'c4', stage: 'GĐ2', text: 'Duy trì viết Nhật ký BM03 hàng tuần (mô tả công việc kỹ thuật cụ thể)' },
  { id: 'c5', stage: 'GĐ2', text: 'Xin chữ ký xác nhận của cán bộ hướng dẫn vào nhật ký BM03 hàng tuần' },
  { id: 'c6', stage: 'GĐ2', text: 'Tích lũy tối thiểu ≥ 120 giờ (hoặc ≥ 240 giờ nếu song hành cả TSNN và KTCN)', isMandatory: true },
  { id: 'c7', stage: 'GĐ3', text: 'Xin phiếu đánh giá BM04 có điểm số rõ ràng và mộc tròn công ty (tuyệt đối không tẩy xóa)', isMandatory: true },
  { id: 'c8', stage: 'GĐ3', text: 'Đóng dấu mộc tròn ở trang kết thúc của nhật ký BM03' },
  { id: 'c9', stage: 'GĐ3', text: 'Hoàn thành Báo cáo chuyên môn BM05 đúng chuẩn format Khoa CNTT (25-45 trang)' },
  { id: 'c10', stage: 'GĐ3', text: 'Điền phiếu khảo sát ý kiến sinh viên BM06' },
  { id: 'c11', stage: 'GĐ3', text: 'Đóng cuốn HSMH theo đúng thứ tự quy chuẩn và quét PDF màu chuẩn tên file để nộp', isMandatory: true },
];

export function getChecklistState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveChecklistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error(e);
  }
}

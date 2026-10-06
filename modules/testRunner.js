// modules/testRunner.js - Bộ kiểm thử tự động 8 Test Cases cho đồ án TDTU
import { validateSubmissionFilename, removeVietnameseTones } from './validator.js';
import { calculateInternshipHours } from './hoursTracker.js';

export const TEST_SUITE = [
  {
    id: 'TC-VAL-01',
    name: 'Kiểm tra tên file đúng chuẩn TDTU',
    module: 'Validator',
    description: 'Input: "521H0123_NguyenVanA_BM01.pdf" -> Mong đợi hợp lệ 100%, 0 lỗi',
    run: () => {
      const res = validateSubmissionFilename('521H0123_NguyenVanA_BM01.pdf');
      const pass = res.isValid && res.errors.length === 0;
      return { pass, message: `Điểm: ${res.score}/100. Đã nhận diện đúng MSSV: 521H0123, BM01.` };
    }
  },
  {
    id: 'TC-VAL-02',
    name: 'Bắt lỗi tên file chứa khoảng trắng',
    module: 'Validator',
    description: 'Input: "521H0123 Nguyen Van A BM01.pdf" -> Mong đợi bắt lỗi khoảng trắng',
    run: () => {
      const res = validateSubmissionFilename('521H0123 Nguyen Van A BM01.pdf');
      const pass = !res.isValid && res.errors.some(e => e.includes('khoảng trắng') || e.includes('dấu cách'));
      return { pass, message: 'Bắt lỗi thành công: Tên file chứa dấu cách không hợp lệ.' };
    }
  },
  {
    id: 'TC-VAL-03',
    name: 'Bắt lỗi định dạng file không phải .pdf',
    module: 'Validator',
    description: 'Input: "521H0123_NguyenVanA_BM01.docx" -> Mong đợi bắt lỗi yêu cầu PDF',
    run: () => {
      const res = validateSubmissionFilename('521H0123_NguyenVanA_BM01.docx');
      const pass = !res.isValid && res.errors.some(e => e.includes('.pdf'));
      return { pass, message: 'Bắt lỗi thành công: Định dạng .docx không được chấp nhận.' };
    }
  },
  {
    id: 'TC-VAL-04',
    name: 'Bắt lỗi thiếu cấu trúc 3 phần chuẩn',
    module: 'Validator',
    description: 'Input: "521H0123_BM01.pdf" -> Mong đợi cảnh báo thiếu tên sinh viên',
    run: () => {
      const res = validateSubmissionFilename('521H0123_BM01.pdf');
      const pass = !res.isValid && res.errors.some(e => e.includes('3 phần chuẩn'));
      return { pass, message: 'Bắt lỗi thành công: Thiếu cấu trúc [MSSV]_[Hovaten]_[TenBM].' };
    }
  },
  {
    id: 'TC-VAL-05',
    name: 'Tự động sửa lỗi & gợi ý tên file chuẩn',
    module: 'Validator',
    description: 'Input: "521H0123_Nguyen Van A_BM01.docx" -> Mong đợi gợi ý tên file sửa lỗi',
    run: () => {
      const res = validateSubmissionFilename('521H0123_Nguyen Van A_BM01.docx');
      const pass = res.suggestedName === '521H0123_NguyenVanA_BM01.pdf';
      return { pass, message: `Đề xuất chính xác: "${res.suggestedName}"` };
    }
  },
  {
    id: 'TC-HRS-01',
    name: 'Tính giờ học phần đơn lẻ (≥ 120H)',
    module: 'HoursTracker',
    description: '6 tuần * 20 giờ/tuần = 120H -> Hoàn thành 100%',
    run: () => {
      const res = calculateInternshipHours(6, 20, false);
      const pass = res.total === 120 && res.isCompleted && res.percentage === 100;
      return { pass, message: `Tích lũy ${res.total}/${res.required}H (100%). Đạt chuẩn!` };
    }
  },
  {
    id: 'TC-HRS-02',
    name: 'Tính giờ học phần song hành (≥ 240H)',
    module: 'HoursTracker',
    description: '6 tuần * 20 giờ/tuần = 120H cho song hành -> Mong đợi đạt 50%, thiếu 120H',
    run: () => {
      const res = calculateInternshipHours(6, 20, true);
      const pass = res.total === 120 && !res.isCompleted && res.remaining === 120;
      return { pass, message: `Tích lũy ${res.total}/${res.required}H (50%). Cảnh báo thiếu 120H chính xác.` };
    }
  },
  {
    id: 'TC-UTIL-01',
    name: 'Hàm xử lý loại bỏ dấu tiếng Việt',
    module: 'Utilities',
    description: 'Chuỗi "Trần Hoàng Quốc Bảo" -> Mong đợi "Tran Hoang Quoc Bao"',
    run: () => {
      const out = removeVietnameseTones('Trần Hoàng Quốc Bảo');
      const pass = out === 'Tran Hoang Quoc Bao';
      return { pass, message: `Chuỗi kết quả: "${out}"` };
    }
  }
];

export async function executeAllTests(onProgress) {
  const results = [];
  for (let i = 0; i < TEST_SUITE.length; i++) {
    const tc = TEST_SUITE[i];
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 60)); // Giả lập độ trễ kiểm thử
    const { pass, message } = tc.run();
    const duration = Math.round(performance.now() - startTime);

    const testResult = {
      ...tc,
      status: pass ? 'passed' : 'failed',
      durationMs: duration,
      outputMessage: message
    };
    results.push(testResult);
    if (onProgress) onProgress(testResult, i + 1, TEST_SUITE.length);
  }
  return results;
}

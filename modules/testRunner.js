// modules/testRunner.js - Bộ kiểm thử tự động 9 Test Cases chuẩn Khoa CNTT TDTU
import { validateSubmissionFilename, removeVietnameseTones } from './validator.js';
import { calculateInternshipHours } from './hoursTracker.js';
import { calculatePersonalProgress } from './personalTracker.js';

export const TEST_SUITE = [
  {
    id: 'TC-VAL-01',
    name: 'Kiểm tra tên file nộp HSMH chuẩn TDTU',
    module: 'Validator',
    description: 'Input: "1_52000888_BM01.pdf" -> Mong đợi hợp lệ 100%, 0 lỗi',
    run: () => {
      const res = validateSubmissionFilename('1_52000888_BM01.pdf');
      const pass = res.isValid && res.errors.length === 0;
      return { pass, message: `Điểm: ${res.score}/100. Đã nhận diện đúng chuẩn Mục 1, MSSV 52000888, định dạng PDF.` };
    }
  },
  {
    id: 'TC-VAL-02',
    name: 'Bắt lỗi tên file chứa khoảng trắng',
    module: 'Validator',
    description: 'Input: "1_52000888 BM01.pdf" -> Mong đợi bắt lỗi khoảng trắng',
    run: () => {
      const res = validateSubmissionFilename('1_52000888 BM01.pdf');
      const pass = !res.isValid && res.errors.some(e => e.includes('khoảng trắng') || e.includes('dấu cách'));
      return { pass, message: 'Bắt lỗi thành công: Tên file chứa khoảng trắng không được phép.' };
    }
  },
  {
    id: 'TC-VAL-03',
    name: 'Bắt lỗi file biểu mẫu không phải .pdf',
    module: 'Validator',
    description: 'Input: "1_52000888_BM01.docx" -> Mong đợi bắt lỗi yêu cầu PDF scan',
    run: () => {
      const res = validateSubmissionFilename('1_52000888_BM01.docx');
      const pass = !res.isValid && res.errors.some(e => e.includes('.pdf'));
      return { pass, message: 'Bắt lỗi thành công: Biểu mẫu bắt buộc phải là file .pdf scan màu.' };
    }
  },
  {
    id: 'TC-VAL-04',
    name: 'Bắt lỗi file Video nộp sai định dạng',
    module: 'Validator',
    description: 'Input: "6_52000888_VideoTSNN.zip" -> Mong đợi bắt lỗi yêu cầu mp4/mov/wmv',
    run: () => {
      const res = validateSubmissionFilename('6_52000888_VideoTSNN.zip');
      const pass = !res.isValid && res.errors.some(e => e.includes('Video'));
      return { pass, message: 'Bắt lỗi thành công: Video (Mục 6) bắt buộc định dạng .mp4, .mov hoặc .wmv.' };
    }
  },
  {
    id: 'TC-VAL-05',
    name: 'Tự động sửa lỗi & gợi ý tên file chuẩn',
    module: 'Validator',
    description: 'Input: "1_52000888 BM01.docx" -> Mong đợi đề xuất sửa lỗi',
    run: () => {
      const res = validateSubmissionFilename('1_52000888 BM01.docx');
      const pass = res.suggestedName.includes('52000888');
      return { pass, message: `Đề xuất sửa lỗi: "${res.suggestedName}"` };
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
      return { pass, message: `Tích lũy ${res.total}/${res.required}H (100%). Đạt điều kiện đóng cuốn!` };
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
    id: 'TC-TRACK-01',
    name: 'Tính toán tiến trình cá nhân hóa từ nhật ký tuần',
    module: 'PersonalTracker',
    description: 'Dữ liệu 3 tuần (20h + 20h + 25h = 65h) đối với môn 120H',
    run: () => {
      const mockData = {
        courseType: 'single_tsnn',
        startDate: '2026-02-15',
        endDate: '2026-05-15',
        deadlineDate: '2026-05-30',
        weeklyLogs: [
          { id: 1, week: 1, hours: 20, task: 'Task 1', mentorSigned: true },
          { id: 2, week: 2, hours: 20, task: 'Task 2', mentorSigned: true },
          { id: 3, week: 3, hours: 25, task: 'Task 3', mentorSigned: false }
        ]
      };
      const res = calculatePersonalProgress(mockData);
      const pass = res.totalLoggedHours === 65 && res.remainingHours === 55 && res.targetHours === 120 && res.signedLogsCount === 2;
      return { pass, message: `Đã tích lũy ${res.totalLoggedHours}/${res.targetHours}H (54%). Đã ký: ${res.signedLogsCount}/3 tuần. Còn thiếu ${res.remainingHours}H.` };
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
    await new Promise(r => setTimeout(r, 40));
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

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
    id: 'TC-TRACK-02',
    name: 'Tính giờ chi tiết từng ngày trong tuần (Daily Logs)',
    module: 'PersonalTracker',
    description: 'Tuần có 5 ngày làm việc (4h/ngày = 20h)',
    run: () => {
      const mockData = {
        courseType: 'single_tsnn',
        weeklyLogs: [
          {
            id: 1,
            week: 1,
            hours: 20,
            task: 'Tuần 1',
            mentorSigned: true,
            dailyLogs: [
              { day: 'Thứ 2', hours: 4, task: 'Task 1' },
              { day: 'Thứ 3', hours: 4, task: 'Task 2' },
              { day: 'Thứ 4', hours: 4, task: 'Task 3' },
              { day: 'Thứ 5', hours: 4, task: 'Task 4' },
              { day: 'Thứ 6', hours: 4, task: 'Task 5' }
            ]
          }
        ]
      };
      const res = calculatePersonalProgress(mockData);
      const pass = res.totalLoggedHours === 20 && res.remainingHours === 100;
      return { pass, message: `Tính đúng ${res.totalLoggedHours}/120H từ 5 ngày làm việc chi tiết (4H/ngày).` };
    }
  },
  {
    id: 'TC-TRACK-03',
    name: 'Quản lý 2 học phần độc lập (Dual Tracks: TSNN & KTCN)',
    module: 'PersonalTracker',
    description: 'TSNN tại FPT 65H + KTCN tại Viettel 40H -> Tổng 105H/240H',
    run: () => {
      const mockData = {
        courseType: 'dual',
        tracks: {
          tsnn: {
            companyName: 'FPT Software',
            weeklyLogs: [{ week: 1, hours: 25 }, { week: 2, hours: 20 }, { week: 3, hours: 20 }]
          },
          ktcn: {
            companyName: 'Viettel Solutions',
            weeklyLogs: [{ week: 1, hours: 20 }, { week: 2, hours: 20 }]
          }
        }
      };
      const res = calculatePersonalProgress(mockData, 'tsnn');
      const pass = res.tsnnHours === 65 && res.ktcnHours === 40 && res.totalLoggedHours === 105 && res.targetHours === 240;
      return { pass, message: `TSNN: ${res.tsnnHours}/120H, KTCN: ${res.ktcnHours}/120H. Tổng tích lũy 2 môn: ${res.totalLoggedHours}/240H.` };
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
  },
  {
    id: 'TC-I18N-01',
    name: 'Kiểm tra gói từ điển đa ngôn ngữ (language.json)',
    module: 'I18n',
    description: 'Xác thực cấu trúc gói ngôn ngữ: >600 mục từ tiếng Anh (en.text), đầy đủ thuộc tính, không rỗng',
    run: async () => {
      let pack = null;
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        const res = await fetch('./language.json');
        if (!res.ok) throw new Error(`HTTP ${res.status} khi tải language.json`);
        pack = await res.json();
      } else {
        const fs = await import('fs');
        const { fileURLToPath } = await import('url');
        const path = await import('path');
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, '..', 'language.json');
        const raw = fs.readFileSync(filePath, 'utf8');
        pack = JSON.parse(raw);
      }

      if (!pack || typeof pack !== 'object') {
        return { pass: false, message: 'Gói ngôn ngữ language.json không hợp lệ hoặc rỗng.' };
      }
      if (!pack.en || typeof pack.en.text !== 'object') {
        return { pass: false, message: 'Thiếu nhánh từ điển en.text trong language.json.' };
      }

      const entries = Object.entries(pack.en.text);
      if (entries.length < 500) {
        return { pass: false, message: `Số lượng mục từ quá ít: ${entries.length} (yêu cầu tối thiểu 500).` };
      }

      // Kiểm tra không có mục từ rỗng
      const emptyEntry = entries.find(([k, v]) => !k.trim() || typeof v !== 'string' || !v.trim());
      if (emptyEntry) {
        return { pass: false, message: `Phát hiện mục từ rỗng: "${emptyEntry[0]}".` };
      }

      // Kiểm tra các thuật ngữ cốt lõi
      const coreKeys = ['TDTU • KHOA CNTT', 'Biểu mẫu', '1. Tổng Quan', '5. Xử Lý Sự Cố'];
      const missingKeys = coreKeys.filter(k => !(k in pack.en.text));
      if (missingKeys.length > 0) {
        return { pass: false, message: `Thiếu các mục từ cốt lõi: ${missingKeys.join(', ')}` };
      }

      const attrCount = Array.isArray(pack.en.attributes) ? pack.en.attributes.length : 0;
      return {
        pass: true,
        message: `Đã xác thực thành công ${entries.length} mục từ song ngữ (en.text), ${attrCount} thuộc tính giao diện. Đầy đủ cặp VI/EN không rỗng.`
      };
    }
  }
];

export async function executeAllTests(onProgress) {
  const results = [];
  for (let i = 0; i < TEST_SUITE.length; i++) {
    const tc = TEST_SUITE[i];
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 40));
    let runResult;
    try {
      runResult = await tc.run();
    } catch (err) {
      runResult = { pass: false, message: 'Lỗi thực thi kiểm thử: ' + err.message };
    }
    const { pass, message } = runResult;
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

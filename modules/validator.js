// modules/validator.js - Logic kiểm tra tên file nộp bài chuẩn Khoa CNTT TDTU

export function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

/**
 * Kiểm tra tên file theo 2 quy chuẩn của Khoa CNTT TDTU:
 * 1. Cú pháp số thứ tự nộp HSMH: [STT]_[MSSV]_[TenFile].[ext]
 *    Ví dụ: 1_521H0123_BM01.pdf, 2_521H0123_NhatKyTSNN.pdf, 4_521H0123_BM04.pdf, 5_521H0123_BaoCao.pdf, 6_521H0123_VideoTSNN.mp4
 * 2. Cú pháp chuẩn hóa tổng quát: [MSSV]_[HoVaTen]_[TenBM].[ext]
 */
export function validateSubmissionFilename(input) {
  const trimmed = (input || '').trim();
  const errors = [];
  const warnings = [];

  if (!trimmed) {
    return {
      isValid: false,
      score: 0,
      errors: ['Vui lòng nhập tên file để kiểm tra.'],
      warnings: [],
      suggestedName: ''
    };
  }

  // 1. Kiểm tra khoảng trắng
  if (/\s/.test(trimmed)) {
    errors.push('Tên file KHÔNG ĐƯỢC chứa khoảng trắng (dấu cách). Hãy sử dụng dấu gạch dưới "_" để phân tách.');
  }

  // 2. Kiểm tra phần mở rộng file
  const extMatch = trimmed.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  if (!ext) {
    errors.push('Thiếu phần mở rộng file (đuôi file như .pdf, .docx, .mp4, .zip).');
  }

  const nameWithoutExt = trimmed.replace(/\.[a-zA-Z0-9]+$/, '');
  const parts = nameWithoutExt.split('_');

  // Kiểm tra cú pháp dạng 1: [STT]_[MSSV]_[TenFile].[ext] (Quy chuẩn nộp HSMH Khoa CNTT TDTU)
  const isNumberedFormat = parts.length >= 3 && /^[1-6]$/.test(parts[0]);

  let suggestedName = '';

  if (isNumberedFormat) {
    const stt = parts[0];
    const mssv = parts[1];
    const fileLabel = parts.slice(2).join('_');

    // Kiểm tra định dạng MSSV
    const tdtuMssvRegex = /^[0-9A-Z]{7,9}$/i;
    if (!tdtuMssvRegex.test(mssv)) {
      warnings.push(`MSSV "${mssv}" có thể chưa đúng chuẩn TDTU (thường 8 ký tự như 521H0123, 52000888).`);
    }

    // Kiểm tra đuôi file theo số thứ tự
    if (['1', '2', '3', '4'].includes(stt) && ext !== 'pdf') {
      errors.push(`Mục số ${stt} (${fileLabel}) bắt buộc phải là định dạng ".pdf" scan màu.`);
    }
    if (stt === '5' && !['pdf', 'docx', 'zip'].includes(ext)) {
      errors.push('Báo cáo (Mục 5) phải là định dạng .pdf, .docx hoặc .zip (nếu dùng LaTeX).');
    }
    if (stt === '6' && !['mp4', 'mov', 'wmv'].includes(ext)) {
      errors.push('Video tổng kết (Mục 6) bắt buộc định dạng .mp4, .mov hoặc .wmv (dung lượng ≤ 100MB).');
    }

    suggestedName = `${stt}_${mssv.replace(/\s+/g, '')}_${fileLabel.replace(/\s+/g, '')}.${ext || 'pdf'}`;
  } else {
    // Kiểm tra cú pháp dạng 2: [MSSV]_[HoVaTen]_[TenBM].[ext]
    if (parts.length < 3) {
      errors.push('Cấu trúc chưa đúng chuẩn Khoa CNTT: Bắt buộc dùng cú pháp [STT]_[MSSV]_[TenFile].[ext] (vd: 1_521H0123_BM01.pdf) hoặc [MSSV]_[HoVaTen]_[TenBM].pdf.');
    } else {
      const studentId = parts[0];
      const fullName = parts[1];
      const formCode = parts.slice(2).join('_');

      const tdtuMssvRegex = /^[0-9A-Z]{7,9}$/i;
      if (!tdtuMssvRegex.test(studentId)) {
        warnings.push(`MSSV "${studentId}" có thể chưa đúng chuẩn TDTU.`);
      }

      const vietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
      if (vietnameseDiacritics.test(fullName)) {
        warnings.push('Họ tên nên viết không dấu (ví dụ: NguyenVanA) để tránh lỗi font khi tải về máy chấm điểm.');
      }

      if (ext !== 'pdf' && ext !== 'mp4') {
        errors.push(`Định dạng hiện tại là ".${ext}". Hồ sơ biểu mẫu bắt buộc phải là ".pdf".`);
      }
    }

    if (parts.length >= 2) {
      const cleanId = (parts[0] || '521H0123').replace(/\s+/g, '');
      const cleanName = removeVietnameseTones(parts[1] || 'NguyenVanA').replace(/\s+/g, '');
      const cleanCode = (parts[2] || 'BM01').toUpperCase().replace(/\s+/g, '');
      suggestedName = `${cleanId}_${cleanName}_${cleanCode}.${ext || 'pdf'}`;
    }
  }

  const isValid = errors.length === 0;
  const score = Math.max(0, 100 - (errors.length * 35) - (warnings.length * 15));

  return {
    isValid,
    score,
    errors,
    warnings,
    suggestedName: suggestedName || '1_521H0123_BM01.pdf',
    parsedData: { isNumberedFormat, parts, ext }
  };
}

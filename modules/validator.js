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
    errors.push('Tên file KHÔNG ĐƯỢC chứa dấu cách (khoảng trắng). Hãy sử dụng dấu gạch dưới "_" để phân tách.');
  }

  // 2. Kiểm tra phần mở rộng file .pdf
  const extMatch = trimmed.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  if (!ext) {
    errors.push('Thiếu phần mở rộng file. Bắt buộc phải là định dạng .pdf.');
  } else if (ext !== 'pdf') {
    errors.push(`Định dạng hiện tại là ".${ext}". Quy chế Khoa bắt buộc phải nộp file PDF scan màu (".pdf").`);
  }

  // Phân tích các thành phần
  const nameWithoutExt = trimmed.replace(/\.[a-zA-Z0-9]+$/, '');
  const parts = nameWithoutExt.split('_');

  let studentId = '';
  let fullName = '';
  let formCode = '';

  if (parts.length < 3) {
    errors.push('Cấu trúc tên file không đủ 3 phần chuẩn: [MSSV]_[Hovaten]_[TenBieuMau].pdf (phân tách bằng dấu gạch dưới "_").');
  } else {
    studentId = parts[0];
    fullName = parts[1];
    formCode = parts.slice(2).join('_');

    // Kiểm tra định dạng MSSV TDTU
    const tdtuStudentIdRegex = /^[0-9A-Z]{7,9}$/i;
    if (!tdtuStudentIdRegex.test(studentId)) {
      warnings.push(`MSSV "${studentId}" có thể chưa đúng định dạng chuẩn của TDTU (thường gồm 8 ký tự như 521H0123, 52000123).`);
    }

    // Cảnh báo nếu họ tên có dấu tiếng Việt
    const vietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (vietnameseDiacritics.test(fullName)) {
      warnings.push('Họ tên nên viết không dấu (ví dụ: NguyenVanA) để tránh lỗi font khi tải về máy chấm điểm.');
    }

    // Kiểm tra mã biểu mẫu hợp lệ
    const validCodes = ['BM01', 'BM02', 'BM03', 'BM04', 'BM05', 'BM06', 'HSMH', 'BAOCAO', 'NHATKY'];
    const matched = validCodes.find(c => formCode.toUpperCase().includes(c));
    if (!matched) {
      warnings.push(`Mã biểu mẫu "${formCode}" chưa thuộc danh mục chuẩn (BM01, BM02, BM03, BM04, BM05, BM06, HSMH).`);
    }
  }

  // Tự động sinh tên đề xuất chuẩn hóa
  let suggestedName = '';
  if (parts.length >= 2) {
    const cleanId = (parts[0] || 'MSSV').replace(/\s+/g, '');
    const cleanName = removeVietnameseTones(parts[1] || 'HoVaTen').replace(/\s+/g, '');
    const cleanCode = (parts[2] || 'BM01').toUpperCase().replace(/\s+/g, '');
    suggestedName = `${cleanId}_${cleanName}_${cleanCode}.pdf`;
  }

  const isValid = errors.length === 0;
  const score = Math.max(0, 100 - (errors.length * 35) - (warnings.length * 15));

  return {
    isValid,
    score,
    errors,
    warnings,
    suggestedName: suggestedName || '521H0123_NguyenVanA_BM01.pdf',
    parsedData: { studentId, fullName, formCode, ext }
  };
}

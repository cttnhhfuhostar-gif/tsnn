export interface FilenameValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  errors: string[];
  warnings: string[];
  suggestedName?: string;
  parsedData?: {
    studentId?: string;
    fullName?: string;
    formCode?: string;
    extension?: string;
  };
}

export function validateSubmissionFilename(input: string): FilenameValidationResult {
  const trimmed = input.trim();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!trimmed) {
    return {
      isValid: false,
      score: 0,
      errors: ['Vui lòng nhập hoặc chọn tên file để kiểm tra.'],
      warnings: []
    };
  }

  // 1. Kiểm tra dấu cách
  if (/\s/.test(trimmed)) {
    errors.push('Tên file KHÔNG ĐƯỢC chứa dấu cách (khoảng trắng). Hãy sử dụng dấu gạch dưới "_" để phân tách.');
  }

  // 2. Kiểm tra phần mở rộng file
  const extMatch = trimmed.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  
  if (!ext) {
    errors.push('Thiếu phần mở rộng file (đuôi file). Bắt buộc phải là định dạng .pdf.');
  } else if (ext !== 'pdf') {
    errors.push(`Định dạng hiện tại là ".${ext}". Quy chế Khoa bắt buộc phải nộp file PDF scan màu (".pdf").`);
  }

  // Loại bỏ đuôi file để phân tích thân tên
  const nameWithoutExt = trimmed.replace(/\.[a-zA-Z0-9]+$/, '');
  const parts = nameWithoutExt.split('_');

  let studentId = '';
  let fullName = '';
  let formCode = '';

  if (parts.length < 3) {
    errors.push('Cấu trúc tên file không đủ 3 phần chuẩn: [MSSV]_[Hovaten]_[TenBieuMau].pdf (phân tách bởi dấu gạch dưới "_").');
  } else {
    studentId = parts[0];
    fullName = parts[1];
    formCode = parts.slice(2).join('_'); // phòng trường hợp tên BM có gạch dưới

    // Kiểm tra MSSV TDTU (thường 8 ký tự: ví dụ 521H0123, 52000891, B1901234)
    const tdtuStudentIdRegex = /^[0-9A-Z]{7,9}$/i;
    if (!tdtuStudentIdRegex.test(studentId)) {
      warnings.push(`MSSV "${studentId}" có thể chưa đúng định dạng chuẩn của TDTU (thường gồm 8 ký tự như 521H0123, 52000123).`);
    }

    // Kiểm tra ký tự tiếng Việt có dấu
    const vietnameseDiacriticsRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (vietnameseDiacriticsRegex.test(fullName)) {
      warnings.push('Họ tên nên viết không dấu (ví dụ: NguyenVanA) để tránh lỗi font khi tải về máy chấm điểm.');
    }

    // Kiểm tra mã biểu mẫu
    const validFormCodes = ['BM01', 'BM02', 'BM03', 'BM04', 'BM05', 'BM06', 'HSMH', 'BAOCAO', 'NHATKY'];
    const matchedCode = validFormCodes.find(code => formCode.toUpperCase().includes(code));
    if (!matchedCode) {
      warnings.push(`Mã biểu mẫu "${formCode}" chưa thuộc danh mục chuẩn (BM01, BM02, BM03, BM04, BM05, BM06, HSMH).`);
    }
  }

  // Đề xuất tên file chuẩn nếu có lỗi
  let suggestedName: string | undefined = undefined;
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
    suggestedName,
    parsedData: {
      studentId,
      fullName,
      formCode,
      extension: ext
    }
  };
}

export function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

export function calculateInternshipHours(weeks: number, hoursPerWeek: number, isDualEnrolled: boolean) {
  const total = weeks * hoursPerWeek;
  const required = isDualEnrolled ? 240 : 120;
  const remaining = Math.max(0, required - total);
  const percentage = Math.min(100, Math.round((total / required) * 100));
  return {
    total,
    required,
    remaining,
    percentage,
    isCompleted: total >= required
  };
}

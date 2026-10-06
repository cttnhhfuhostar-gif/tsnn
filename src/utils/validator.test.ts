import { describe, it, expect } from 'vitest';
import { validateSubmissionFilename, calculateInternshipHours, removeVietnameseTones } from './validator';

describe('TDTU Internship Filename Validator', () => {
  it('TC-VAL-01: chấp nhận tên file chuẩn quy định', () => {
    const res = validateSubmissionFilename('521H0123_NguyenVanA_BM01.pdf');
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.score).toBeGreaterThanOrEqual(90);
  });

  it('TC-VAL-02: bắt lỗi tên file có khoảng trắng', () => {
    const res = validateSubmissionFilename('521H0123 Nguyen Van A BM01.pdf');
    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('khoảng trắng') || e.includes('dấu cách'))).toBe(true);
  });

  it('TC-VAL-03: bắt lỗi định dạng không phải là PDF', () => {
    const res = validateSubmissionFilename('521H0123_NguyenVanA_BM01.docx');
    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('.pdf'))).toBe(true);
  });

  it('TC-VAL-04: bắt lỗi thiếu cấu trúc 3 phần chuẩn', () => {
    const res = validateSubmissionFilename('521H0123_BM01.pdf');
    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('3 phần chuẩn'))).toBe(true);
  });

  it('TC-VAL-05: tự động gợi ý tên file đã sửa', () => {
    const res = validateSubmissionFilename('521H0123_Nguyen Van A_BM01.docx');
    expect(res.suggestedName).toBe('521H0123_NguyenVanA_BM01.pdf');
  });
});

describe('TDTU Internship Hours Calculator', () => {
  it('TC-HRS-01: tính đúng số giờ học phần đơn lẻ (120H)', () => {
    const res = calculateInternshipHours(6, 20, false);
    expect(res.total).toBe(120);
    expect(res.required).toBe(120);
    expect(res.isCompleted).toBe(true);
    expect(res.percentage).toBe(100);
  });

  it('TC-HRS-02: tính đúng số giờ học phần song hành (240H)', () => {
    const res = calculateInternshipHours(6, 20, true);
    expect(res.total).toBe(120);
    expect(res.required).toBe(240);
    expect(res.isCompleted).toBe(false);
    expect(res.remaining).toBe(120);
    expect(res.percentage).toBe(50);
  });

  it('TC-HRS-03: loại bỏ dấu tiếng Việt chuẩn xác', () => {
    expect(removeVietnameseTones('Nguyễn Văn Ân')).toBe('Nguyen Van An');
    expect(removeVietnameseTones('Trần Thị Diệu')).toBe('Tran Thi Dieu');
  });
});

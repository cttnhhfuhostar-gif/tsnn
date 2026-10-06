// test_runner_cli.js - CLI Test Runner cho bộ kiểm thử TDTU Portal
import { executeAllTests } from './modules/testRunner.js';

console.log('====================================================');
console.log('🧪 BẮT ĐẦU CHẠY BỘ KIỂM THỬ ĐƠN VỊ TSNN/KTCN (12 TC)');
console.log('====================================================\n');

const startTime = Date.now();

executeAllTests((tc, current, total) => {
  const icon = tc.status === 'passed' ? '✅' : '❌';
  console.log(`[${String(current).padStart(2, '0')}/${String(total).padStart(2, '0')}] ${icon} [${tc.module}] ${tc.id}: ${tc.name} (${tc.durationMs}ms)`);
  if (tc.status !== 'passed') {
    console.log(`    ⚠️  Lỗi: ${tc.outputMessage}`);
  }
}).then(results => {
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status !== 'passed').length;
  const totalMs = Date.now() - startTime;

  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ: ${passed}/${results.length} PASSED | THỜI GIAN: ${totalMs}ms`);
  console.log('====================================================');

  if (failed > 0) {
    console.error(`❌ CÓ ${failed} TEST CASE THẤT BẠI!`);
    process.exit(1);
  } else {
    console.log('🎉 TẤT CẢ 12 TEST CASES ĐỀU ĐẠT CHUẨN KHOA CNTT TDTU!\n');
    process.exit(0);
  }
}).catch(err => {
  console.error('❌ Ngoại lệ khi thực thi test suite:', err);
  process.exit(1);
});

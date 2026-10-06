// test_api.js - Bộ kiểm thử Tích hợp & An toàn Bảo mật Backend (TDTU Internship Portal)
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path || '/', BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData && typeof postData === 'object' && !(postData instanceof Buffer)) {
      postData = JSON.stringify(postData);
      reqOptions.headers['Content-Type'] = reqOptions.headers['Content-Type'] || 'application/json';
    }

    if (postData) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json
        });
      });
    });

    req.on('error', reject);

    if (postData) req.write(postData);
    req.end();
  });
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// 1. Health Check
test('TC-API-01: Health check endpoint trả về 200 OK và trạng thái hoạt động', async () => {
  const res = await request({ path: '/api/health', method: 'GET' });
  if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode} !== 200`);
  if (!res.json || res.json.status !== 'ok') throw new Error('Body không chứa status ok');
});

// 2. Chống Path Traversal & Bảo vệ tệp nội bộ
test('TC-API-02: Chặn tấn công Path Traversal & cấm truy cập file nội bộ (HTTP 403/404)', async () => {
  const payloads = [
    '/../package.json',
    '/..%2fpackage.json',
    '/%2e%2e/server.js',
    '/server.js',
    '/data/accounts/52000888.json',
    '/..\\..\\windows\\win.ini'
  ];
  for (const p of payloads) {
    const res = await request({ path: p, method: 'GET' });
    if (res.statusCode === 200 && (res.body.includes('dependencies') || res.body.includes('scryptSync') || res.body.includes('pinHash'))) {
      throw new Error(`Lỗ hổng bảo mật: Tệp nhạy cảm bị lộ với đường dẫn: ${p}`);
    }
    if (res.statusCode !== 403 && res.statusCode !== 404) {
      throw new Error(`Kỳ vọng 403 hoặc 404 nhưng nhận được ${res.statusCode} cho ${p}`);
    }
  }
});

// 3. Đăng ký & Băm PIN Scrypt
const testMssv = `test_${Date.now().toString().slice(-6)}`;
const testPin = 'Pass@9876';
let testToken = null;

test('TC-API-03: Đăng ký tài khoản mới mã hóa Scrypt, không lộ PIN trong response & file', async () => {
  const res = await request(
    { path: '/api/auth/register', method: 'POST' },
    { mssv: testMssv, pin: testPin, studentName: 'Kiểm Thử Viên API', studentClass: '20050201' }
  );

  if (res.statusCode !== 201) throw new Error(`Đăng ký thất bại với status ${res.statusCode}: ${res.body}`);
  if (!res.json?.token) throw new Error('Không nhận được session token sau đăng ký');
  if (res.json?.user?.pin || res.json?.user?.pinHash) throw new Error('Response API làm lộ PIN hoặc pinHash');

  testToken = res.json.token;

  // Kiểm tra file trên ổ đĩa xem có lưu plaintext PIN không
  const accountFilePath = path.join(process.cwd(), 'data', 'accounts', `${testMssv}.json`);
  if (!fs.existsSync(accountFilePath)) throw new Error('Tài khoản chưa được ghi vào data/accounts/');
  const fileRaw = fs.readFileSync(accountFilePath, 'utf8');
  const fileData = JSON.parse(fileRaw);

  if (fileData.pin) throw new Error('Phát hiện PIN lưu dạng plaintext trong tệp JSON!');
  if (!fileData.pinHash || !fileData.pinHash.includes(':')) throw new Error('pinHash không đúng định dạng salt:key của Scrypt!');
});

// 4. Chặn đăng ký trùng MSSV
test('TC-API-04: Từ chối đăng ký trùng MSSV với HTTP 409 Conflict', async () => {
  const res = await request(
    { path: '/api/auth/register', method: 'POST' },
    { mssv: testMssv, pin: '999999', studentName: 'Trùng MSSV' }
  );
  if (res.statusCode !== 409) throw new Error(`Kỳ vọng 409 nhưng nhận được ${res.statusCode}`);
});

// 5. Đăng nhập đúng PIN & Sai PIN
test('TC-API-05: Đăng nhập đúng PIN trả về 200 & Token; sai PIN trả về 401', async () => {
  // Đúng PIN
  const goodRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { mssv: testMssv, pin: testPin }
  );
  if (goodRes.statusCode !== 200 || !goodRes.json?.token) {
    throw new Error(`Đăng nhập đúng PIN thất bại: status ${goodRes.statusCode}`);
  }
  testToken = goodRes.json.token;

  // Sai PIN
  const badRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { mssv: testMssv, pin: 'WrongPIN123' }
  );
  if (badRes.statusCode !== 401) {
    throw new Error(`Đăng nhập sai PIN kỳ vọng 401 nhưng nhận được ${badRes.statusCode}`);
  }
});

// 6. Rate Limiting chống Brute-Force (Tối đa 5 lần sai)
test('TC-API-06: Chặn Brute-Force Rate Limiting (HTTP 429 sau 5 lần sai liên tiếp)', async () => {
  const bruteMssv = `brute_${Date.now().toString().slice(-5)}`;
  // Tạo tài khoản cho test brute-force
  await request(
    { path: '/api/auth/register', method: 'POST' },
    { mssv: bruteMssv, pin: '112233', studentName: 'Brute Target' }
  );

  let got429 = false;
  let retryAfterHeader = null;

  for (let i = 1; i <= 6; i++) {
    const res = await request(
      { path: '/api/auth/login', method: 'POST' },
      { mssv: bruteMssv, pin: 'WrongPinAgain' }
    );
    if (res.statusCode === 429) {
      got429 = true;
      retryAfterHeader = res.headers['retry-after'];
      break;
    }
  }

  // Dọn dẹp tài khoản brute
  const bruteFile = path.join(process.cwd(), 'data', 'accounts', `${bruteMssv}.json`);
  if (fs.existsSync(bruteFile)) fs.unlinkSync(bruteFile);

  if (!got429) throw new Error('Không kích hoạt HTTP 429 Rate Limit sau 5 lần đăng nhập thất bại');
  if (!retryAfterHeader) throw new Error('Thiếu header Retry-After trong phản hồi 429');
});

// 7. Xác thực Session Token & Cách ly hồ sơ (/api/profile/me)
test('TC-API-07: Xác thực Session Token hợp lệ, chặn Token giả/rỗng với HTTP 401', async () => {
  // Không có Token
  const noToken = await request({ path: '/api/profile/me', method: 'GET' });
  if (noToken.statusCode !== 401) throw new Error(`Không token kỳ vọng 401, nhận ${noToken.statusCode}`);

  // Token giả mạo
  const fakeToken = await request({
    path: '/api/profile/me',
    method: 'GET',
    headers: { 'Authorization': 'Bearer 00000000000000000000000000000000fake' }
  });
  if (fakeToken.statusCode !== 401) throw new Error(`Token giả mạo kỳ vọng 401, nhận ${fakeToken.statusCode}`);

  // Token thật
  const realRes = await request({
    path: '/api/profile/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${testToken}` }
  });
  if (realRes.statusCode !== 200 || realRes.json?.user?.mssv !== testMssv) {
    throw new Error(`Token thật kỳ vọng 200 với MSSV ${testMssv}`);
  }
});

// 8. Thu hồi Session Token khi Đăng Xuất (Logout)
test('TC-API-08: Thu hồi Session Token khi gọi /api/auth/logout, từ chối request sau đó', async () => {
  const logoutRes = await request({
    path: '/api/auth/logout',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testToken}` }
  });
  if (logoutRes.statusCode !== 200) throw new Error(`Logout kỳ vọng 200, nhận ${logoutRes.statusCode}`);

  // Dùng lại token vừa logout
  const reuseRes = await request({
    path: '/api/profile/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${testToken}` }
  });
  if (reuseRes.statusCode !== 401) {
    throw new Error(`Token đã logout phải bị từ chối 401, nhưng nhận ${reuseRes.statusCode}`);
  }
});

// 9. Giới hạn dung lượng Payload chống DoS (Giới hạn 1MB)
test('TC-API-09: Từ chối payload vượt quá giới hạn 1MB', async () => {
  // Tạo payload 1.2MB
  const bigBuffer = Buffer.alloc(1.2 * 1024 * 1024, 'A');
  try {
    const res = await request(
      { path: '/api/profile/update', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      bigBuffer
    );
    if (res.statusCode !== 400 && res.statusCode !== 413) {
      throw new Error(`Payload > 1MB kỳ vọng bị chặn (400/413), nhưng nhận ${res.statusCode}`);
    }
  } catch (err) {
    // Kết nối bị server chủ động ngắt (req.destroy()) là hành vi đúng chuẩn
    if (!err.message.includes('socket hang up') && !err.message.includes('ECONNRESET')) {
      throw err;
    }
  }
});

// Chạy bộ test
async function runApiTests() {
  console.log('====================================================');
  console.log('🛡️  BẮT ĐẦU CHẠY BỘ KIỂM THỬ BẢO MẬT API BACKEND');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const num = String(i + 1).padStart(2, '0');
    try {
      await t.fn();
      console.log(`[${num}/${tests.length}] ✅ ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`[${num}/${tests.length}] ❌ ${t.name}`);
      console.error(`    ⚠️  Lỗi: ${err.message}`);
      failed++;
    }
  }

  // Cleanup file test
  try {
    const accountFilePath = path.join(process.cwd(), 'data', 'accounts', `${testMssv}.json`);
    if (fs.existsSync(accountFilePath)) fs.unlinkSync(accountFilePath);
  } catch {}

  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ API TESTS: ${passed}/${tests.length} PASSED`);
  console.log('====================================================');

  if (failed > 0) {
    console.error(`❌ CÓ ${failed} TEST CASE BẢO MẬT THẤT BẠI!`);
    process.exit(1);
  } else {
    console.log('🎉 TẤT CẢ TIÊU CHÍ BẢO MẬT P0 BACKEND ĐỀU ĐẠT CHUẨN!\n');
    process.exit(0);
  }
}

runApiTests();

// server.js - Máy chủ HTTP & REST API Xác Thực Cá Nhân An Toàn (P0 Security Hardened, Zero-dependency)
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ACCOUNTS_DIR = path.join(__dirname, 'data', 'accounts');

// Khởi tạo thư mục data/accounts nếu chưa tồn tại
if (!fs.existsSync(ACCOUNTS_DIR)) {
  fs.mkdirSync(ACCOUNTS_DIR, { recursive: true });
}

// --- 1. MÃ HÓA MÃ PIN BẢO MẬT (CRYPTO-SAFE HASHING WITH SALT) ---
function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPin(pin, storedHash) {
  if (!storedHash) return false;
  // Hỗ trợ migration tự động nếu tài khoản cũ trước đây lưu plaintext
  if (!storedHash.includes(':')) {
    return pin === storedHash;
  }
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  try {
    const derived = crypto.scryptSync(pin, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

// Tạo tài khoản mẫu ban đầu (MSSV: 52000888, PIN: 123456) được băm an toàn nếu chưa có
const sampleAccountFile = path.join(ACCOUNTS_DIR, '52000888.json');
if (!fs.existsSync(sampleAccountFile)) {
  const sampleAccount = {
    mssv: '52000888',
    pinHash: hashPin('123456'),
    studentName: 'Trần Hoàng Quốc Bảo',
    studentClass: '20050201',
    companyName: 'Công ty Cổ phần Công nghệ FPT Software',
    companyTax: '0101248141',
    mentorName: 'Trần Văn Bình (Tech Lead)',
    courseType: 'dual',
    activeTrack: 'tsnn',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deadlineDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weeklyLogs: [
      { id: 1, week: 1, hours: 20, task: 'Làm quen môi trường công ty, setup IDE và đọc tài liệu dự án', mentorSigned: true },
      { id: 2, week: 2, hours: 20, task: 'Nghiên cứu cấu trúc cơ sở dữ liệu, viết API authentication', mentorSigned: true },
      { id: 3, week: 3, hours: 25, task: 'Xây dựng giao diện Dashboard, tích hợp REST API', mentorSigned: false }
    ],
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(sampleAccountFile, JSON.stringify(sampleAccount, null, 2), 'utf-8');
}

// --- 2. QUẢN LÝ SESSION TOKENS BẢO MẬT & CÓ THỜI HẠN (24H TTL) ---
const sessions = new Map(); // token -> { mssv, expiresAt }
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ

function createSession(mssv) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    mssv,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function verifySession(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const sess = sessions.get(token);
  if (!sess) {
    // Backward-compatibility: Hỗ trợ token Base64 legacy chuyển tiếp
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [m, p] = decoded.split(':');
      if (m && p) {
        const acc = getAccount(m);
        if (acc && verifyPin(p, acc.pinHash || acc.pin)) {
          return { mssv: cleanMssv(m) };
        }
      }
    } catch {}
    return null;
  }
  if (Date.now() > sess.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return sess;
}

function revokeSession(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return;
  const token = authHeader.slice(7).trim();
  sessions.delete(token);
}

// --- 3. RATE LIMITING CHỐNG BRUTE-FORCE ĐĂNG NHẬP ---
const loginAttempts = new Map(); // key -> { count, resetTime }
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 phút

function checkRateLimit(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now > record.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  record.count += 1;
  return { allowed: true };
}

function resetRateLimit(key) {
  loginAttempts.delete(key);
}

// --- 4. TIỆN ÍCH DỮ LIỆU & FILE ---
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

function sendJSON(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function cleanMssv(mssv) {
  return String(mssv || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function getAccount(mssv) {
  const filePath = path.join(ACCOUNTS_DIR, `${cleanMssv(mssv)}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function saveAccount(account) {
  const filePath = path.join(ACCOUNTS_DIR, `${cleanMssv(account.mssv)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(account, null, 2), 'utf-8');
}

function sanitizeUser(account) {
  const { pin: _, pinHash: __, ...safeUser } = account;
  return safeUser;
}

function readBody(req, maxBytes = 1e6) {
  return new Promise((resolve, reject) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      const err = new Error('Dung lượng tải lên vượt quá giới hạn (tối đa 1MB)');
      err.statusCode = 413;
      reject(err);
      return;
    }

    let bodyRaw = '';
    let bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        const err = new Error('Dung lượng tải lên vượt quá giới hạn (tối đa 1MB)');
        err.statusCode = 413;
        reject(err);
        return;
      }
      bodyRaw += chunk;
    });
    req.on('end', () => resolve(bodyRaw));
    req.on('error', err => reject(err));
  });
}

// --- 5. HTTP SERVER ENGINE ---
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = reqUrl.pathname;
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // --- HEALTH CHECK ENDPOINT ---
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJSON(res, 200, {
      status: 'ok',
      service: 'TDTU TSNN/KTCN Portal Server',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

  // --- API 1: ĐĂNG KÝ TÀI KHOẢN CÁ NHÂN ---
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    try {
      const bodyRaw = await readBody(req);
      const body = JSON.parse(bodyRaw);
      const mssv = cleanMssv(body.mssv);
      const pin = String(body.pin || '').trim();
      const studentName = String(body.studentName || '').trim();
      const studentClass = String(body.studentClass || '').trim();

      if (!mssv || mssv.length < 5) {
        return sendJSON(res, 400, { success: false, error: 'MSSV không hợp lệ (tối thiểu 5 ký tự).' });
      }
      if (!pin || pin.length < 4) {
        return sendJSON(res, 400, { success: false, error: 'Mã PIN bảo mật phải từ 4 ký tự trở lên.' });
      }

      if (getAccount(mssv)) {
        return sendJSON(res, 409, { success: false, error: `MSSV ${mssv} đã tồn tại tài khoản. Vui lòng chọn Đăng nhập.` });
      }

      // Khởi tạo ngày tháng động hợp lý (tránh bị quá hạn 129 ngày đối với tài khoản mới)
      const now = new Date();
      const startDate = now.toISOString().split('T')[0];
      const endDate = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const deadlineDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newAccount = {
        mssv,
        pinHash: hashPin(pin), // Băm PIN bằng Scrypt + Salt
        studentName: studentName || 'Sinh viên TDTU',
        studentClass: studentClass || '',
        companyName: body.companyName || '',
        companyTax: body.companyTax || '',
        mentorName: body.mentorName || '',
        courseType: body.courseType || 'dual',
        activeTrack: 'tsnn',
        startDate,
        endDate,
        deadlineDate,
        weeklyLogs: [
          {
            id: 1,
            week: 1,
            hours: 20,
            task: 'Làm quen môi trường công ty, setup IDE',
            mentorSigned: false,
            dailyLogs: [
              { day: 'Thứ 2', hours: 4, task: 'Nhận máy trạm và cài đặt phần mềm' },
              { day: 'Thứ 3', hours: 4, task: 'Làm quen quy trình làm việc' },
              { day: 'Thứ 4', hours: 4, task: 'Nghiên cứu tài liệu dự án' },
              { day: 'Thứ 5', hours: 4, task: 'Thiết lập môi trường phát triển' },
              { day: 'Thứ 6', hours: 4, task: 'Họp tuần với Mentor' }
            ]
          }
        ],
        updatedAt: new Date().toISOString()
      };

      saveAccount(newAccount);
      const token = createSession(mssv);

      return sendJSON(res, 201, {
        success: true,
        message: `Đăng ký thành công tài khoản sinh viên ${mssv}!`,
        token,
        user: sanitizeUser(newAccount)
      });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Dữ liệu không hợp lệ: ' + err.message });
    }
  }

  // --- API 2: ĐĂNG NHẬP TÀI KHOẢN CÁ NHÂN (CÓ RATE LIMIT) ---
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const bodyRaw = await readBody(req);
      const body = JSON.parse(bodyRaw);
      const mssv = cleanMssv(body.mssv);
      const pin = String(body.pin || '').trim();

      if (!mssv || !pin) {
        return sendJSON(res, 400, { success: false, error: 'Vui lòng nhập đầy đủ MSSV và Mã PIN.' });
      }

      // Kiểm tra Rate Limit chống dò mật khẩu
      const rateLimitKey = `${clientIP}_${mssv}`;
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        return sendJSON(res, 429, {
          success: false,
          error: `Bạn đã thử sai quá 5 lần. Vui lòng chờ ${rateCheck.retryAfterSeconds} giây trước khi thử lại!`
        }, { 'Retry-After': String(rateCheck.retryAfterSeconds) });
      }

      const account = getAccount(mssv);
      if (!account) {
        return sendJSON(res, 404, { success: false, error: `Không tìm thấy tài khoản MSSV ${mssv}. Bạn hãy nhấn Đăng ký.` });
      }

      // Xác thực PIN băm an toàn
      const isValidPin = verifyPin(pin, account.pinHash || account.pin);
      if (!isValidPin) {
        return sendJSON(res, 401, { success: false, error: 'Mã PIN bảo mật không chính xác!' });
      }

      // Đăng nhập thành công -> Reset rate limit
      resetRateLimit(rateLimitKey);

      // Tự động nâng cấp tài khoản cũ sang pinHash nếu đang lưu plaintext
      if (!account.pinHash && account.pin) {
        account.pinHash = hashPin(account.pin);
        delete account.pin;
        saveAccount(account);
      }

      const token = createSession(mssv);

      return sendJSON(res, 200, {
        success: true,
        message: `Đăng nhập thành công! Xin chào ${account.studentName}.`,
        token,
        user: sanitizeUser(account)
      });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Dữ liệu không hợp lệ: ' + err.message });
    }
  }

  // --- API 3: LẤY THÔNG TIN HỒ SƠ CỦA CHÍNH MÌNH (GET /api/profile/me) ---
  if (req.method === 'GET' && pathname === '/api/profile/me') {
    const sess = verifySession(req.headers['authorization']);
    if (!sess) {
      return sendJSON(res, 401, { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn.' });
    }

    const account = getAccount(sess.mssv);
    if (!account) {
      return sendJSON(res, 404, { success: false, error: 'Không tìm thấy hồ sơ người dùng.' });
    }

    return sendJSON(res, 200, { success: true, user: sanitizeUser(account) });
  }

  // --- API 4: CẬP NHẬT HỒ SƠ RIÊNG (POST /api/profile/update) ---
  if (req.method === 'POST' && pathname === '/api/profile/update') {
    try {
      const bodyRaw = await readBody(req);
      const sess = verifySession(req.headers['authorization']);
      if (!sess) {
        return sendJSON(res, 401, { success: false, error: 'Bạn không có quyền chỉnh sửa. Vui lòng đăng nhập.' });
      }

      const body = JSON.parse(bodyRaw);
      const account = getAccount(sess.mssv);

      if (!account) {
        return sendJSON(res, 404, { success: false, error: 'Không tìm thấy tài khoản người dùng.' });
      }

      // Cập nhật thông tin (Bảo lưu hash PIN cũ, ngăn chặn IDOR đổi MSSV)
      const updatedAccount = {
        ...account,
        ...body,
        mssv: sess.mssv, // Tuyệt đối không cho phép ghi đè MSSV của người khác
        pinHash: account.pinHash || (account.pin ? hashPin(account.pin) : undefined),
        updatedAt: new Date().toISOString()
      };
      delete updatedAccount.pin; // Tuyệt đối loại bỏ plain PIN nếu có

      saveAccount(updatedAccount);

      return sendJSON(res, 200, {
        success: true,
        message: 'Đã tự động lưu hồ sơ thành công vào tài khoản cá nhân.',
        user: sanitizeUser(updatedAccount),
        updatedAt: updatedAccount.updatedAt
      });
    } catch (err) {
      const status = err.statusCode || 400;
      return sendJSON(res, status, { success: false, error: 'Lỗi cập nhật: ' + err.message });
    }
  }

  // --- API 5: ĐĂNG XUẤT THU HỒI TOKEN (POST /api/auth/logout) ---
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    revokeSession(req.headers['authorization']);
    return sendJSON(res, 200, { success: true, message: 'Đã đăng xuất và thu hồi phiên an toàn.' });
  }

  // --- 6. PHỤC VỤ STATIC FILES CHỐNG PATH TRAVERSAL & BẢO VỆ DỮ LIỆU ---
  // Chặn ngay nếu URL chứa ký tự path traversal thô hoặc mã hóa URL
  if (req.url.includes('..') || req.url.toLowerCase().includes('%2e')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden: Truy cập đường dẫn bị từ chối.');
    return;
  }

  let requestedPath = pathname === '/' ? '/index.html' : pathname;
  // Chuẩn hóa và triệt tiêu mọi "../"
  let safePath = path.normalize(path.join(__dirname, requestedPath));

  // Kiểm tra nghiêm ngặt đường dẫn không được thoát khỏi thư mục gốc
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden: Truy cập đường dẫn bị từ chối.');
    return;
  }

  // Bảo vệ tuyệt đối: Cấm truy cập trực tiếp thư mục dữ liệu nội bộ (data/), mã nguồn backend (server.js, test scripts) và dotfiles
  const blockedBasenames = ['server.js', 'package.json', 'package-lock.json', '.gitignore', '.env', 'test_api.js', 'test_runner_cli.js', 'PLAN_CAI_TIEN_TSNN.md'];
  const baseName = path.basename(safePath);
  const dataDir = path.join(__dirname, 'data');

  if (safePath.startsWith(dataDir) || baseName.startsWith('.') || blockedBasenames.includes(baseName)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden: Tệp tin nội bộ không được phép truy cập công khai.');
    return;
  }

  const ext = path.extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(safePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CỔNG THÔNG TIN HỌC PHẦN TSNN & KTCN TDTU v2.0 ĐANG CHẠY!`);
  console.log(`🔒 HỆ THỐNG BẢO MẬT P0: SCRYPT HASH + SESSION STORE + RATE LIMIT!`);
  console.log(`👉 Truy cập trình duyệt: http://localhost:${PORT}`);
  console.log(`📂 Dữ liệu tài khoản an toàn tại: ${ACCOUNTS_DIR}`);
  console.log(`======================================================\n`);
});

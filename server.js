// server.js - Máy chủ HTTP & REST API Xác Thực Cá Nhân Siêu Nhẹ (Zero-dependency)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const ACCOUNTS_DIR = path.join(__dirname, 'data', 'accounts');

// Khởi tạo thư mục data/accounts nếu chưa tồn tại
if (!fs.existsSync(ACCOUNTS_DIR)) {
  fs.mkdirSync(ACCOUNTS_DIR, { recursive: true });
}

// Tạo tài khoản mẫu ban đầu (MSSV: 52000888, PIN: 123456) nếu chưa có
const sampleAccountFile = path.join(ACCOUNTS_DIR, '52000888.json');
if (!fs.existsSync(sampleAccountFile)) {
  const sampleAccount = {
    mssv: '52000888',
    pin: '123456',
    studentName: 'Nguyễn Văn An',
    studentClass: '20050201',
    companyName: 'Công ty Cổ phần Công nghệ FPT Software',
    companyTax: '0101248141',
    mentorName: 'Trần Văn Bình (Tech Lead)',
    courseType: 'single_tsnn',
    startDate: '2026-02-15',
    endDate: '2026-05-15',
    deadlineDate: '2026-05-30',
    weeklyLogs: [
      { id: 1, week: 1, hours: 20, task: 'Làm quen môi trường công ty, setup IDE và đọc tài liệu dự án', mentorSigned: true },
      { id: 2, week: 2, hours: 20, task: 'Nghiên cứu cấu trúc cơ sở dữ liệu, viết API authentication', mentorSigned: true },
      { id: 3, week: 3, hours: 25, task: 'Xây dựng giao diện Dashboard, tích hợp REST API', mentorSigned: false }
    ],
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(sampleAccountFile, JSON.stringify(sampleAccount, null, 2), 'utf-8');
}

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

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function cleanMssv(mssv) {
  return String(mssv || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function parseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [mssv, pin] = decoded.split(':');
    return { mssv: cleanMssv(mssv), pin: String(pin || '').trim() };
  } catch {
    return null;
  }
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

const server = http.createServer((req, res) => {
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

  // --- API 1: ĐĂNG KÝ TÀI KHOẢN CÁ NHÂN ---
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    let bodyRaw = '';
    req.on('data', chunk => { bodyRaw += chunk; });
    req.on('end', () => {
      try {
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

        const newAccount = {
          mssv,
          pin,
          studentName: studentName || 'Sinh viên TDTU',
          studentClass: studentClass || '',
          companyName: body.companyName || '',
          companyTax: body.companyTax || '',
          mentorName: body.mentorName || '',
          courseType: body.courseType || 'single_tsnn',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deadlineDate: '2026-05-30',
          weeklyLogs: [
            { id: 1, week: 1, hours: 20, task: 'Làm quen môi trường công ty, setup IDE', mentorSigned: false }
          ],
          updatedAt: new Date().toISOString()
        };

        saveAccount(newAccount);

        const token = Buffer.from(`${mssv}:${pin}`).toString('base64');
        const { pin: _, ...safeUser } = newAccount;

        return sendJSON(res, 201, {
          success: true,
          message: `Đăng ký thành công tài khoản sinh viên ${mssv}!`,
          token,
          user: safeUser
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: 'Dữ liệu không hợp lệ: ' + err.message });
      }
    });
    return;
  }

  // --- API 2: ĐĂNG NHẬP TÀI KHOẢN CÁ NHÂN ---
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    let bodyRaw = '';
    req.on('data', chunk => { bodyRaw += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyRaw);
        const mssv = cleanMssv(body.mssv);
        const pin = String(body.pin || '').trim();

        if (!mssv || !pin) {
          return sendJSON(res, 400, { success: false, error: 'Vui lòng nhập đầy đủ MSSV và Mã PIN.' });
        }

        const account = getAccount(mssv);
        if (!account) {
          return sendJSON(res, 404, { success: false, error: `Không tìm thấy tài khoản MSSV ${mssv}. Bạn hãy nhấn Đăng ký.` });
        }

        if (account.pin !== pin) {
          return sendJSON(res, 401, { success: false, error: 'Mã PIN bảo mật không chính xác!' });
        }

        const token = Buffer.from(`${mssv}:${pin}`).toString('base64');
        const { pin: _, ...safeUser } = account;

        return sendJSON(res, 200, {
          success: true,
          message: `Đăng nhập thành công! Xin chào ${account.studentName}.`,
          token,
          user: safeUser
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: 'Dữ liệu không hợp lệ: ' + err.message });
      }
    });
    return;
  }

  // --- API 3: LẤY THÔNG TIN HỒ SƠ CỦA CHÍNH MÌNH (GET /api/profile/me) ---
  if (req.method === 'GET' && pathname === '/api/profile/me') {
    const creds = parseToken(req.headers['authorization']);
    if (!creds) {
      return sendJSON(res, 401, { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn.' });
    }

    const account = getAccount(creds.mssv);
    if (!account || account.pin !== creds.pin) {
      return sendJSON(res, 401, { success: false, error: 'Thông tin xác thực không hợp lệ.' });
    }

    const { pin: _, ...safeUser } = account;
    return sendJSON(res, 200, { success: true, user: safeUser });
  }

  // --- API 4: CẬP NHẬT HỒ SƠ RIÊNG (POST /api/profile/update) ---
  if (req.method === 'POST' && pathname === '/api/profile/update') {
    const creds = parseToken(req.headers['authorization']);
    if (!creds) {
      return sendJSON(res, 401, { success: false, error: 'Bạn không có quyền chỉnh sửa. Vui lòng đăng nhập.' });
    }

    let bodyRaw = '';
    req.on('data', chunk => { bodyRaw += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyRaw);
        const account = getAccount(creds.mssv);

        if (!account || account.pin !== creds.pin) {
          return sendJSON(res, 403, { success: false, error: 'Từ chối truy cập: Bạn chỉ có thể sửa thông tin của chính mình.' });
        }

        // Cập nhật thông tin (bảo lưu mã PIN cũ)
        const updatedAccount = {
          ...account,
          ...body,
          mssv: creds.mssv, // Tuyệt đối không cho phép đổi MSSV sang người khác
          pin: account.pin,  // Giữ nguyên PIN
          updatedAt: new Date().toISOString()
        };

        saveAccount(updatedAccount);

        const { pin: _, ...safeUser } = updatedAccount;
        return sendJSON(res, 200, {
          success: true,
          message: 'Đã tự động lưu hồ sơ thành công vào tài khoản cá nhân.',
          user: safeUser,
          updatedAt: updatedAccount.updatedAt
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: 'Lỗi cập nhật: ' + err.message });
      }
    });
    return;
  }

  // --- STATIC FILES SERVING ---
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CỔNG THÔNG TIN HỌC PHẦN TSNN & KTCN TDTU v2.0 ĐANG CHẠY!`);
  console.log(`🔒 HỆ THỐNG XÁC THỰC TÀI KHOẢN CÁ NHÂN ĐÃ SẴN SÀNG!`);
  console.log(`👉 Truy cập trình duyệt: http://localhost:${PORT}`);
  console.log(`📂 Dữ liệu tài khoản lưu tại: ${ACCOUNTS_DIR}`);
  console.log(`======================================================\n`);
});

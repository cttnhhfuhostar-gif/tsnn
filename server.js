// server.js - Máy chủ HTTP tĩnh & REST API siêu nhẹ dùng thư viện chuẩn Node.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data', 'profiles');

// Khởi tạo thư mục data/profiles nếu chưa tồn tại (Cơ sở dữ liệu NoSQL Flat-File)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Bổ sung dữ liệu mẫu ban đầu nếu thư mục đang trống
const sampleFile = path.join(DATA_DIR, '52000888.json');
if (!fs.existsSync(sampleFile)) {
  const sampleData = {
    mssv: '52000888',
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
  fs.writeFileSync(sampleFile, JSON.stringify(sampleData, null, 2), 'utf-8');
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
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function cleanMssv(mssv) {
  return String(mssv || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = reqUrl.pathname;

  // --- REST API ENDPOINTS ---

  // 1. GET /api/profiles/list - Lấy danh sách hồ sơ sinh viên đã lưu
  if (req.method === 'GET' && pathname === '/api/profiles/list') {
    try {
      const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
      const profiles = files.map(file => {
        try {
          const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
          const data = JSON.parse(raw);
          return {
            mssv: data.mssv || path.basename(file, '.json'),
            studentName: data.studentName || 'Chưa đặt tên',
            studentClass: data.studentClass || '',
            companyName: data.companyName || '',
            courseType: data.courseType || 'single_tsnn',
            updatedAt: data.updatedAt || null,
            totalHours: Array.isArray(data.weeklyLogs) 
              ? data.weeklyLogs.reduce((acc, l) => acc + (Number(l.hours) || 0), 0)
              : 0
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      return sendJSON(res, 200, { success: true, count: profiles.length, profiles });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // 2. GET /api/profile?mssv=... - Tải dữ liệu hồ sơ cá nhân theo MSSV
  if (req.method === 'GET' && pathname === '/api/profile') {
    const mssv = cleanMssv(reqUrl.searchParams.get('mssv'));
    if (!mssv) {
      return sendJSON(res, 400, { success: false, error: 'Thiếu tham số mssv' });
    }

    const filePath = path.join(DATA_DIR, `${mssv}.json`);
    if (!fs.existsSync(filePath)) {
      return sendJSON(res, 404, { success: false, error: `Chưa tìm thấy hồ sơ cho MSSV ${mssv} trên máy chủ` });
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      return sendJSON(res, 200, { success: true, profile: data });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: 'Lỗi đọc file hồ sơ: ' + err.message });
    }
  }

  // 3. POST /api/profile/save - Lưu hoặc cập nhật hồ sơ vào Server Flat-File JSON DB
  if (req.method === 'POST' && pathname === '/api/profile/save') {
    let bodyRaw = '';
    req.on('data', chunk => {
      bodyRaw += chunk;
      if (bodyRaw.length > 5 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const body = JSON.parse(bodyRaw);
        const mssv = cleanMssv(body.mssv);
        if (!mssv) {
          return sendJSON(res, 400, { success: false, error: 'MSSV không hợp lệ hoặc để trống' });
        }

        const dataToSave = {
          ...body,
          mssv,
          updatedAt: new Date().toISOString()
        };

        const targetFile = path.join(DATA_DIR, `${mssv}.json`);
        fs.writeFileSync(targetFile, JSON.stringify(dataToSave, null, 2), 'utf-8');

        return sendJSON(res, 200, {
          success: true,
          message: `Đã lưu thành công hồ sơ của sinh viên MSSV ${mssv} vào cơ sở dữ liệu hệ thống`,
          mssv,
          updatedAt: dataToSave.updatedAt
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: 'Dữ liệu JSON không hợp lệ: ' + err.message });
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
  console.log(`👉 Server API: http://localhost:${PORT}/api/profiles/list`);
  console.log(`👉 Truy cập trình duyệt: http://localhost:${PORT}`);
  console.log(`📂 Database lưu tại: ${DATA_DIR}`);
  console.log(`======================================================\n`);
});

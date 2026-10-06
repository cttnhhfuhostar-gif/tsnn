# Kế hoạch xây dựng và cải thiện repo TSNN

**Repo:** `cttnhhfuhostar-gif/tsnn`  
**Ngày rà soát:** 06/10/2026  
**Mục tiêu:** ổn định cổng hướng dẫn TSNN/KTCN, bảo vệ dữ liệu sinh viên, thống nhất cách phát triển và nâng chất lượng trải nghiệm trước khi dùng thật.

## 1. Tình trạng đã xác minh

- Giao diện hiện chạy bằng `node server.js`; trang chính là `index.html` và JavaScript điều khiển là `app.js` cùng các module trong `modules/`.
- Trang gốc và `app.js` đều trả HTTP 200 ở môi trường xem thử. Modal **Bộ Công Cụ Hỗ Trợ** mở thành công; API hồ sơ khi chưa xác thực trả HTTP 401.
- Bộ kiểm thử trong `modules/testRunner.js` chạy đủ **12/12 đạt** khi chờ Promise `executeAllTests()` hoàn tất.
- Repo đang đồng thời có hai hướng giao diện: HTML/JavaScript thuần đang được `server.js` phục vụ; bộ React/Vite trong `src/` có `src/main.tsx` đòi phần tử `#root`, nhưng `index.html` hiện không khai báo root hay nạp entrypoint React. Chưa có `node_modules` hoặc lockfile. Vì vậy cần chọn một kiến trúc chính trước khi mở rộng.
- Có ba tệp hồ sơ JSON đang được Git theo dõi trong `data/accounts/`. Backend hiện ghi PIN dạng văn bản thường, tạo token bằng Base64 của thông tin đăng nhập, cho phép CORS `*`, chưa thấy giới hạn dung lượng body/rate limit trong các đoạn đã rà soát. Điều này không phù hợp với dữ liệu sinh viên thực.
- Trang xem thử hiển thị tiến độ 105/240H và hạn nộp đã qua 129 ngày; cần xác định đó là dữ liệu mẫu hay trạng thái mặc định và tránh gây hiểu nhầm cho người dùng mới.
- Có chỗ tài liệu cần đồng bộ: README giới thiệu stack/test và mức độ bảo mật không hoàn toàn khớp với cấu trúc, hành vi backend và test hiện tại. `TC-I18N-01` hiện trả `pass: true` cố định, chưa kiểm tra thực chất từ điển.

## 2. Định hướng khuyến nghị

**Ngắn hạn:** giữ HTML/JavaScript thuần làm giao diện chính vì đây là nhánh đang chạy đầy đủ; chuẩn hóa `server.js` làm lệnh chạy duy nhất trong khi xử lý bảo mật và test.

**Không nên** tiếp tục phát triển song song hai UI. Trong giai đoạn rà soát, chọn một trong hai việc: (a) chuyển dần các phần React vào ứng dụng chính, hoặc (b) đánh dấu/loại bỏ phần React chưa được dùng. Chỉ chọn phương án (a) nếu có nhu cầu rõ ràng về component hóa, mở rộng tính năng và ngân sách chuyển đổi; không nên chuyển framework chỉ để đồng nhất công nghệ.

**Điều kiện trước khi dùng dữ liệu thật:** loại bỏ dữ liệu/credential mẫu khỏi bản triển khai, xử lý các hồ sơ đã bị commit, thay cơ chế xác thực/lưu trữ PIN và giới hạn truy cập API.

## 3. Roadmap theo giai đoạn

| Giai đoạn | Ưu tiên | Công việc chính | Kết quả / tiêu chí hoàn tất |
|---|---|---|---|
| **0. Chốt phạm vi và kiến trúc** | P0 | Kiểm kê trang, API, module, `src/`, `legacy_index.html`, dữ liệu và tài liệu. Chỉ định entrypoint chuẩn; quyết định giữ vanilla hay lập kế hoạch chuyển React. Phân loại dữ liệu mẫu với dữ liệu cần bảo vệ. | Một sơ đồ luồng UI/API/data; một lệnh chạy chuẩn; danh sách dữ liệu cần loại bỏ/ẩn; không còn nhập nhằng file nào là giao diện đang chạy. |
| **1. Bảo mật và riêng tư** | **P0 — làm trước khi đưa lên môi trường thật** | Xóa tài khoản/PII mẫu khỏi runtime; không tự tạo tài khoản với PIN mặc định. Đánh giá lịch sử Git vì xóa file ở commit mới không xóa dữ liệu khỏi các commit cũ; nếu cần làm sạch lịch sử, lập kế hoạch phối hợp vì thao tác này ảnh hưởng clone/nhánh của cộng tác viên. Băm PIN bằng Argon2id hoặc bcrypt với salt; thay token Base64 bằng session ngẫu nhiên, có hạn dùng/thu hồi (ưu tiên cookie `HttpOnly`, `Secure`, `SameSite` nếu kiến trúc phù hợp). Thêm rate limit đăng nhập, giới hạn kích thước body, schema validation, CORS theo allowlist, security headers và kiểm tra đường dẫn file tĩnh theo thư mục gốc cho phép. Chuyển cấu hình nhạy cảm ra biến môi trường; không ghi secret vào log. | Không còn PIN hoặc hồ sơ thật trong repo/fixture công khai; thử đăng nhập sai nhiều lần bị giới hạn; token giả/hết hạn bị từ chối; API chỉ đọc/sửa đúng hồ sơ của chủ tài khoản; request vượt giới hạn và path traversal bị chặn; chính sách CORS được kiểm thử. |
| **2. Chuẩn hóa kiến trúc và môi trường phát triển** | P1 | Chốt một frontend chính. Nếu giữ vanilla: dùng `node server.js` làm đường chạy cốt lõi và chuyển CSS Tailwind từ CDN sang build artifact trước production. Nếu chọn React: kết nối Vite entrypoint thật, đảm bảo `#root`, thay thế giao diện theo lộ trình và xác nhận API tương thích. Tạo lockfile, tài liệu setup mới, cấu hình `PORT`/host qua môi trường, health endpoint và quy ước cấu trúc module. | Clone sạch cài/chạy được theo README; lệnh dev/build/test nhất quán; build production có thể lặp lại; không còn hai entrypoint mơ hồ; health check xác nhận server sẵn sàng. |
| **3. Kiểm thử tự động và chất lượng dữ liệu** | P1 | Đưa 12 test hiện có vào lệnh chuẩn CI. Viết test thật cho i18n (đọc dictionary, kiểm tra cặp VI/EN, test chuyển qua lại), validator, giờ/nhật ký, trường hợp biên và lịch. Thêm API integration tests cho đăng ký/đăng nhập, cách ly tài khoản, xác thực sai, body lỗi và ghi dữ liệu. Thêm browser smoke test cho tải trang, mở/đóng modal, tìm kiếm, đổi ngôn ngữ, công cụ và trạng thái tracker. | CI chạy tự động khi tạo PR; test không phụ thuộc thứ tự hoặc dữ liệu tài khoản đã lưu; test i18n thất bại khi dictionary thiếu; các luồng trọng yếu có kiểm thử giao diện/API. |
| **4. Trải nghiệm, khả năng tiếp cận và nội dung** | P2 | Kiểm tra trên mobile/tablet/desktop; xử lý thanh điều hướng dài, modal, bảng và biểu mẫu ở màn nhỏ. Thêm điều khiển modal bằng bàn phím, focus trap/restore, ESC, nhãn form và trạng thái lỗi dễ đọc; rà soát tương phản và `aria-*`. Kiểm tra font/icon bên ngoài: dùng SVG/fallback ổn định để tránh hiện tên ligature như `timer`/`calendar_month` khi icon font không tải. Cải thiện tìm kiếm (lọc nội dung và thông báo không có kết quả), trạng thái tracker khi chưa đăng nhập/chưa có dữ liệu, và cách thể hiện deadline đã quá hạn. Chuẩn hóa nội dung VI/EN, đánh dấu rõ nội dung “dự thảo”, thêm ngày cập nhật/nguồn cho quy định học vụ. | Không có tràn ngang ở các breakpoint mục tiêu; modal thao tác được bằng bàn phím; icon có fallback; tìm kiếm và đổi ngôn ngữ được kiểm tra; dữ liệu demo không bị trình bày như dữ liệu thật; nội dung học vụ có nguồn/ngày rà soát. |
| **5. Dữ liệu, vận hành và phát hành** | P2 | Với nhiều người dùng/triển khai thật, thay flat-file JSON bằng SQLite hoặc DB phù hợp để có transaction và chống ghi đè đồng thời; thiết kế backup/restore và retention. Thêm log có cấu trúc không chứa PIN/PII, thông báo lỗi an toàn, health/readiness checks, cấu hình HTTPS/proxy và quy trình cập nhật dữ liệu học kỳ. Tách môi trường demo/test khỏi production. | Kiểm thử phục hồi backup; nhiều cập nhật đồng thời không mất dữ liệu; môi trường demo không chứa hồ sơ thật; quy trình phát hành có smoke test và hướng dẫn rollback. |

## 4. Thứ tự triển khai đề xuất

1. **Chặn rủi ro dữ liệu:** xác nhận hồ sơ trong `data/accounts/` là fixture hay dữ liệu cá nhân; ngừng dùng các tài khoản đó trên preview công khai; rà soát Git history và quyết định phương án làm sạch.
2. **Thiết kế lại xác thực/API:** chốt mô hình session, mã hóa PIN, rate limit, CORS, giới hạn payload và kiểm tra truy cập hồ sơ. Viết test bảo mật trước khi thay đổi backend.
3. **Chốt kiến trúc UI:** giữ vanilla cho bản ổn định đầu tiên hoặc phê duyệt lộ trình chuyển React. Đồng bộ package scripts, README và file entrypoint.
4. **Thiết lập CI/test:** đảm bảo đủ test logic, API và browser; sửa `TC-I18N-01` để kiểm thử thật.
5. **Hoàn thiện giao diện:** mobile, accessibility, biểu tượng/fallback, tìm kiếm, trạng thái rỗng/lỗi và dữ liệu deadline.
6. **Đưa lên môi trường staging:** dùng dữ liệu giả riêng, cấu hình HTTPS, backup/monitoring, chạy smoke test; chỉ mở cho dữ liệu thật sau khi qua cổng P0.

## 5. Definition of Done cho bản đầu tiên đáng tin cậy

- Một lệnh duy nhất để chạy ứng dụng và một lệnh kiểm thử được README mô tả đúng.
- CI đạt 100%; test bao gồm logic, API, phân quyền và smoke test giao diện.
- Không lưu PIN dạng rõ; token có hạn dùng/thu hồi; endpoint có giới hạn truy cập và payload.
- Không có dữ liệu sinh viên thật trong repository, fixture công khai hoặc log; lịch sử Git đã được đánh giá và có quyết định xử lý.
- Giao diện dùng được trên mobile và bằng bàn phím; trạng thái tracker/deadline có thông báo rõ ràng.
- Staging chạy với dữ liệu thử nghiệm, có backup/restore và hướng dẫn rollback.

## 6. Ước lượng sơ bộ

Ước lượng để lập kế hoạch, chưa tính thời gian xin xác nhận quy định học vụ hoặc phối hợp vận hành: **khoảng 8–15 ngày công** cho bản đầu tiên có bảo mật, test, chuẩn hóa kiến trúc và cải thiện UX; phần chuyển React toàn diện hoặc tích hợp DB/triển khai production có thể làm roadmap riêng sau khi chốt yêu cầu. Nên phát hành theo các cổng: **P0 bảo mật → P1 kiến trúc/test → P2 UX/vận hành**, không gộp tất cả vào một lần phát hành.

# FLAGPOP 1.0 — Phạm vi bản web tĩnh

Ngày cập nhật: 11/11/2026.

## Tính năng hoàn chỉnh trong mã nguồn

- Quiz một lá cờ, bốn tên quốc gia; đúng +100, không trừ điểm, không ép thời gian.
- 195 quốc kỳ SVG local; toàn thế giới, 6 châu lục, Đông Nam Á.
- Bộ khởi động, 10/20/30 câu, tự giảm số câu khi bộ nhỏ, không lặp cờ.
- Daily 10 câu theo UTC, cùng thứ tự cờ và đáp án, hiển thị đếm ngược.
- Khóa đáp án sau lựa chọn, phản hồi đúng/sai và xem lại toàn bộ lượt.
- Ôn riêng cờ từng sai; trả lời đúng lần sau đưa cờ ra khỏi danh sách cần ôn.
- Hộ chiếu, tìm kiếm tiếng Việt không dấu/tiếng Anh, chi tiết quốc gia, lịch sử 20 lượt (hiển thị 5 gần nhất).
- Lưu lựa chọn, âm thanh, tiến độ và khôi phục lượt đang chơi sau refresh.
- Link thách bạn chứa seed/luật phiên bản 1, cùng đề, so với điểm người gửi tự chia sẻ.
- Sao chép kết quả có fallback textarea; tạo ảnh PNG 1080 × 1350 không lộ cờ/đáp án.
- Phím 1–4, focus đáp án/câu tiếp, skip link, dialog, reduced motion và responsive.
- Font local, manifest và service worker tạo từ build để cache toàn bộ tài nguyên.
- Error boundary và phục hồi khi dữ liệu trình duyệt hỏng.

## Giới hạn được công khai

- Không có tài khoản, đồng bộ cloud, bảng điểm online hoặc chống gian lận máy chủ.
- Link challenge dùng dữ liệu phiên bản hiện tại và điểm tự chia sẻ, không dùng cho giải thưởng/thi đấu chính thức. Không có ngày hết hạn phía server.
- Link localhost chỉ dùng trên máy đang chạy. Muốn gửi bạn bè cần cùng một URL hosting HTTPS.
- Tiến độ và lịch sử riêng từng trình duyệt. Xóa dữ liệu trình duyệt sẽ mất tiến độ.
- “Đã nhận ra” là từng chọn đúng; không phải chứng nhận thành thạo. Ôn lỗi sai chưa phải spaced repetition.
- Thời gian kết quả tính từ lúc bắt đầu, kể cả khoảng đóng tab; không dùng xếp hạng.
- Service worker chỉ đăng ký ở production, cache thành công sau lần truy cập online. Cập nhật phiên bản áp dụng khi đóng các tab cũ rồi mở lại.
- Chưa kiểm tra trực quan desktop/mobile hoặc API tải PNG trên trình duyệt thật vì browser access host không hoạt động, cửa sổ Chrome bị minimized và công cụ không kết nối được. Kiểm thử DOM không thay thế kiểm tra layout.

## Kiểm chứng

Chạy `npm run build` trước `npm test` để bài kiểm tra offline kiểm tra đúng artifact cuối cùng.

- TypeScript và Vite production build.
- Kiểm thử engine, 195 asset, seed, bộ lọc, không lặp, đúng 4 lựa chọn.
- Kiểm thử lưu/khôi phục, dữ liệu hỏng, completion idempotent, ôn lỗi sai, streak và đổi ngày.
- Kiểm thử DOM: hết lượt, refresh giữa câu, challenge hợp lệ/lỗi, tìm kiếm/chi tiết, modal thoát, keyboard, bộ 2 câu, fallback chia sẻ.
- Kiểm thử service worker bằng VM: cache chứa 195 cờ và đường dẫn thật, không xóa cache ứng dụng khác, trả app shell khi offline.

## Đưa lên hosting

1. Dùng Node 24 và cài dependency theo lockfile: `corepack pnpm install --frozen-lockfile`.
2. Chạy `npm run build` rồi `npm test`.
3. Đưa **nội dung thư mục `dist/`** lên static hosting, phục vụ ở root `/` qua HTTPS.
4. `index.html` và `sw.js` cần revalidate; tài nguyên hash trong `assets/` có thể cache lâu.
5. File `_headers` là mẫu cho host hỗ trợ cú pháp này. Nếu host không hỗ trợ, cấu hình header tương đương tại host; không giả định file được tự áp dụng.
6. Thử URL thật: mở challenge trên trình duyệt khác, reload khi chơi, tải ảnh, lần đầu online rồi reload offline.
7. Rollback bằng artifact trước đó; không trộn asset từ hai bản build.

Không cần database hoặc secret cho phạm vi bản web này. Thay đổi bộ dữ liệu/thuật toán sinh đề cần tăng phiên bản challenge và hỗ trợ hoặc từ chối link cũ rõ ràng.

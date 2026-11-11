# FLAGPOP

Web game đoán 195 quốc kỳ. **Một lá cờ, bốn lựa chọn.** Chọn châu lục, chơi thử thách ngày, gửi cùng đề cho bạn bè và ôn cờ từng nhầm.

## Chạy dự án

Yêu cầu Node.js 24 và Corepack.

```sh
corepack pnpm install --frozen-lockfile
npm run dev
```

Mở URL Vite hiển thị, mặc định http://127.0.0.1:5173.

## Kiểm tra và build

```sh
npm run build
npm test
npm run preview
```

Build tạo `dist/`, bao gồm quốc kỳ, font, giấy phép, manifest và service worker. Preview mặc định tại http://127.0.0.1:4173. Offline chỉ đăng ký ở production/preview, sau khi tải đầy đủ lần đầu qua HTTPS hoặc localhost.

## Chức năng

- Thế giới, 6 châu lục, Đông Nam Á; mức khởi động hoặc tất cả cờ.
- 10/20/30 câu không lặp; đúng +100 điểm, không ép thời gian.
- Daily chung theo ngày UTC; đổi đề 07:00 Việt Nam, có đếm ngược.
- Khôi phục lượt sau refresh; lưu thiết lập và tiến độ local.
- Kết quả, sao chép có fallback, tải ảnh PNG 1080 × 1350.
- Link thách bạn tái tạo cùng bộ câu hỏi; so điểm tự chia sẻ.
- Hộ chiếu, tìm kiếm không dấu, thẻ quốc gia, lịch sử và ôn lỗi sai.
- Âm thanh, keyboard 1–4, responsive, reduced motion.
- Cache cờ/font/ứng dụng để chơi ngoại tuyến sau lần tải đầu thành công.

## Ranh giới bản này

Web tĩnh, chưa có tài khoản/cloud hoặc bảng điểm xác thực. Tiến độ riêng trên trình duyệt; điểm trong link do người gửi cung cấp. Link localhost không mở được từ máy bạn bè — cần hosting HTTPS. Bộ dữ liệu và thuật toán gắn phiên bản challenge v1; thay đổi cần tăng phiên bản.

21 kiểm thử tự động đạt: engine, dữ liệu, persistence, DOM, service worker. **Chưa xác nhận layout desktop/mobile, xuất PNG và offline bằng trình duyệt thật**: browser host không hoạt động, cửa sổ Chrome không thể kết nối. DOM test không thay thế kiểm tra trực quan.

## Tài liệu

- [Phạm vi phát hành và hướng dẫn hosting](docs/RELEASE.md).
- [Nguồn và giấy phép](docs/SOURCES.md).
- [Kế hoạch và cập nhật](FLAGPOP_DOCUMENTATION.md).

## Mã nguồn

```text
src/App.tsx          Giao diện và điều phối lượt
src/engine.ts        Bộ lọc, seed, sinh câu, streak
src/storage.ts       Validation, khôi phục, kết quả, challenge
src/share.ts         Tạo ảnh kết quả
src/main.tsx         Khởi tạo, error boundary, font, service worker
src/data/            Snapshot 195 quốc gia
public/flags/        SVG quốc kỳ local
public/licenses/     Giấy phép đi kèm artifact
scripts/             Đồng bộ dữ liệu, tạo cache production
tests/               Engine, persistence, DOM, offline
```

`npm run data:sync` tải lại cờ và tạo snapshot; cần mạng. Kiểm tra dữ liệu và phiên bản challenge trước khi phát hành lại.

# Nguồn dữ liệu và tham khảo

Kiểm tra ngày 10/11/2026.

## Dữ liệu được sử dụng

- **Countries List / annexare:** https://github.com/annexare/Countries — tên tiếng Anh, thủ đô, châu lục; MIT. Giữ giấy phép tại `third-party/countries-list-LICENSE.txt`; phiên bản chính xác nằm trong pnpm-lock.yaml.
- **Tên tiếng Việt:** tạo bằng `Intl.DisplayNames` của Node/ICU tại thời điểm đồng bộ, lưu snapshot trong `src/data/countries.json`.
- **Flagpedia / FlagCDN:** https://flagpedia.net/download và https://flagpedia.net/download/api — SVG tỷ lệ nguyên bản. Trang nguồn công bố public domain, dùng được thương mại và phi thương mại. SHA-256 và thời điểm tải lưu tại `third-party/flag-manifest.json`.
- Bộ cơ bản chọn 193 thành viên LHQ và hai quan sát viên Holy See/Palestine; không bao gồm bộ lãnh thổ mở rộng. Đây là quy ước nội dung của game.
- Phân nhóm châu lục theo Countries List; nước xuyên lục địa được xếp vào một nhóm chính. Đông Nam Á là bộ lọc biên tập gồm 11 quốc gia. Độ khó là lựa chọn biên tập, không phải thống kê từ người dùng.

## Font và thư viện đi kèm

- Be Vietnam Pro qua `@fontsource/be-vietnam-pro`: SIL Open Font License 1.1. Font đóng gói local, giấy phép tại `public/licenses/be-vietnam-pro-OFL.txt`.
- React/React DOM: MIT; Lucide: giấy phép trong `public/licenses/lucide-ISC.txt`. Bản build giữ giấy phép tại `/licenses/`.

## Tham khảo trải nghiệm

- Seterra: https://www.geoguessr.com/quiz/seterra — học qua quiz, phân bộ địa lý.
- Flagpedia quiz: https://flagpedia.net/quiz — xem cờ và chọn tên nước.
- Worldle: https://worldle.teuteuf.fr/ — thử thách ngày, chia sẻ kết quả.

Thiết kế và code FLAGPOP được tạo riêng. Không sao chép UI hoặc mã của các sản phẩm tham khảo. Ở bản local, kết quả và chuỗi ngày lưu trên thiết bị, không phải bảng xếp hạng đã xác thực.

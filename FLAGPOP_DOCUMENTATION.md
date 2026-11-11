# FLAGPOP — Tài liệu sản phẩm và kế hoạch triển khai

## Trạng thái triển khai mới nhất — 11/11/2026

**Ưu tiên phần này và `docs/RELEASE.md` khi có nội dung khác kế hoạch cũ.** Bản web tĩnh 1.0 đã bổ sung khôi phục lượt sau refresh, kiểm tra dữ liệu lưu, lịch sử, link thách bạn cùng seed, so điểm tự chia sẻ, xuất ảnh PNG, tìm kiếm không dấu, chi tiết quốc gia, font local và cache offline. Không có tài khoản/backend/bảng xếp hạng xác thực. Điểm trong link không phải kết quả thi đấu có bảo chứng.

21 kiểm thử tự động đạt, gồm engine, dữ liệu, persistence, DOM và service worker. Build production tại `dist/`. Kiểm tra trực quan trình duyệt thật còn bị giới hạn bởi công cụ Chrome; xem chi tiết và hướng dẫn phát hành trong `docs/RELEASE.md`.

---

## Cập nhật phạm vi theo yêu cầu mới nhất — 10/11/2026

**Phần này thay thế các đề xuất luật phức tạp bên dưới khi có mâu thuẫn.** Người dùng đã chọn luật đơn giản: hiển thị quốc kỳ và chọn tên nước. Không nhập tên, không hé lộ, không bắt buộc tính giờ.

- Bản local đã được code bằng React + TypeScript + Vite.
- 195 quốc kỳ SVG local từ Flagpedia/FlagCDN; dữ liệu vùng, tên Anh và thủ đô từ Countries List (MIT); tên Việt bằng Intl.DisplayNames. Xem `docs/SOURCES.md`.
- Chọn toàn thế giới, 6 châu lục hoặc Đông Nam Á; bộ khởi động cờ quen thuộc; 10/20/30 câu không lặp.
- Đúng +100 điểm, sai 0; phản hồi ngay, rồi chủ động chuyển câu tiếp theo.
- Daily 10 câu cùng seed theo ngày UTC; đổi đề 07:00 giờ Việt Nam. Bản local được chơi lại, không có bảng xếp hạng.
- Đã có kết quả, sao chép thành tích, hộ chiếu, lưu tiến độ trên trình duyệt và ôn cờ từng nhầm.
- Chưa có Sprint tính giờ, tài khoản, backend, thách đấu bằng link, multiplayer hoặc thuật toán ôn tập theo lịch. Những mục này trong kế hoạch dưới đây là hướng mở rộng, không phải tính năng đã hoàn thành.
- Build và kiểm thử engine/dữ liệu có lệnh trong README. Kiểm tra trực quan Chrome chưa hoàn tất vì công cụ trình duyệt không kết nối được.

---

> **Tagline:** Nhìn cờ. Đoán nước. Thách bạn.
>
> **Ngày cập nhật:** 10/11/2026  
> **Trạng thái:** Đề xuất sản phẩm, chưa triển khai. Các thông số trò chơi và lịch trình dưới đây là giả thuyết cần kiểm chứng bằng prototype và beta.  
> **Đối tượng:** Người chơi trẻ, người yêu địa lý, nhóm bạn và người muốn học quốc kỳ qua trò chơi.  
> **Nền tảng:** Web, ưu tiên điện thoại; hỗ trợ máy tính.

## Mục lục

1. [Tầm nhìn và nguyên tắc](#1-tầm-nhìn-và-nguyên-tắc)
2. [Tham khảo sản phẩm](#2-tham-khảo-sản-phẩm)
3. [Người dùng và hành trình](#3-người-dùng-và-hành-trình)
4. [Phạm vi phát hành](#4-phạm-vi-phát-hành)
5. [Thiết kế luật chơi](#5-thiết-kế-luật-chơi)
6. [Học tập và tiến độ](#6-học-tập-và-tiến-độ)
7. [Dữ liệu quốc kỳ](#7-dữ-liệu-quốc-kỳ)
8. [Giao diện và trải nghiệm](#8-giao-diện-và-trải-nghiệm)
9. [Chia sẻ và tăng trưởng](#9-chia-sẻ-và-tăng-trưởng)
10. [Kiến trúc kỹ thuật](#10-kiến-trúc-kỹ-thuật)
11. [Mô hình dữ liệu](#11-mô-hình-dữ-liệu)
12. [Hợp đồng API dự kiến](#12-hợp-đồng-api-dự-kiến)
13. [Đo lường sản phẩm](#13-đo-lường-sản-phẩm)
14. [Chất lượng và nghiệm thu](#14-chất-lượng-và-nghiệm-thu)
15. [Lộ trình thực hiện](#15-lộ-trình-thực-hiện)
16. [Backlog ưu tiên](#16-backlog-ưu-tiên)
17. [Rủi ro và quyết định còn mở](#17-rủi-ro-và-quyết-định-còn-mở)
18. [Checklist ra mắt](#18-checklist-ra-mắt)

## 1. Tầm nhìn và nguyên tắc

FLAGPOP là web game đoán quốc kỳ với lượt chơi ngắn khoảng 1–3 phút, kết hợp nhận diện nhanh, phân biệt cờ dễ nhầm, học từ lỗi sai và thách đấu bạn bè.

**Vòng giá trị:** đến vì muốn thử kiến thức → ở lại vì trò chơi thú vị → quay lại vì thấy tiến bộ → chia sẻ để bạn bè vượt thành tích.

### Mục tiêu

- Hiểu cách chơi ngay trong câu đầu, không cần đọc hướng dẫn dài.
- Có trải nghiệm đầu tiên tốt mà không phải đăng ký.
- Tạo cảm giác thử thách nhưng không khiến người mới liên tục thất bại.
- Giúp người chơi nhớ quốc kỳ tốt hơn qua phản hồi và ôn tập.
- Có kết quả dễ chia sẻ và đường dẫn mời bạn chơi cùng đề.
- Xây dựng giao diện hiện đại, có cá tính và hoạt động tốt trên điện thoại.

### Nguyên tắc

- Độ chính xác quan trọng hơn tốc độ.
- Thi đấu dùng đề và luật cố định; luyện tập có thể cá nhân hóa.
- Giao diện phục vụ màn chơi; quốc kỳ là tâm điểm.
- Không chặn lượt đầu bằng đăng nhập, quảng cáo hay onboarding dài.
- Không dùng số liệu thành tích, phân vị hoặc thông điệp khan hiếm giả.
- Không bảo đảm viral: phải đo tỷ lệ chia sẻ, người nhận link chơi và tỷ lệ quay lại.
- Chưa ưu tiên multiplayer trực tiếp, chat hoặc cửa hàng vật phẩm trong bản đầu.

## 2. Tham khảo sản phẩm

Các nguồn dưới đây đã được tham khảo ở bước lập kế hoạch. Bảng phân biệt cơ chế của sản phẩm và ý tưởng áp dụng cho FLAGPOP; không phải bảng xếp hạng mức độ viral hiện tại.

| Sản phẩm / nguồn | Điểm tham khảo | Ý tưởng áp dụng |
| --- | --- | --- |
| [Worldle](https://worldle.teuteuf.fr/) | Câu đố địa lý hằng ngày, phản hồi sau lần đoán, chia sẻ không lộ đáp án | Thử thách chung mỗi ngày, kết quả cô đọng |
| [Connections — Help Center](https://thenewyorktimeshelpcenter.helpjuice.com/360011158491-New-York-Times-Games/28525912587924-Connections) | Tìm liên hệ, sao chép kết quả để chia sẻ | Vòng chơi dễ nhầm, tạo chủ đề bàn luận |
| [GeoGuessr — World Cup announcement](https://geoguessr-press.s3.eu-west-1.amazonaws.com/pm/GEOGUESSR_World_Cup_Announcement.pdf) | Địa lý có thể trở thành nội dung thi đấu và xem thi đấu | Định hướng dài hạn cho giải nhóm và creator |
| [Flagle](https://www.flagle.io/) | Định vị game đoán quốc kỳ hằng ngày | Cần bản sắc vượt khỏi quiz quốc kỳ thông thường |

**Định hướng khác biệt:** Daily Mix đa dạng vừa đủ, học từ lỗi sai, hộ chiếu tiến độ và thách đấu không đồng thời. Không sao chép tên, tài nguyên hoặc giao diện của sản phẩm tham khảo.

## 3. Người dùng và hành trình

| Nhóm | Nhu cầu | Trải nghiệm phù hợp |
| --- | --- | --- |
| Người chơi giải trí | Vui nhanh, dễ hiểu, khoe thành tích | Daily Mix, Sprint |
| Người muốn học | Ghi nhớ và biết mình yếu phần nào | Luyện tập, ôn lỗi sai, hộ chiếu |
| Nhóm bạn | So tài công bằng, vào chơi nhanh | Link thách bạn cùng đề |
| Giáo viên / câu lạc bộ | Bộ câu hỏi có chủ đề | Luyện tập theo châu lục; phòng nhóm về sau |

### Hành trình lần đầu

1. Vào trang chủ hoặc link được chia sẻ.
2. Bấm chơi, nhận một hướng dẫn ngắn ngay trên màn hình.
3. Trả lời câu đầu tương đối dễ để hiểu thao tác.
4. Nhận phản hồi đúng/sai và thông tin nhận diện ngắn.
5. Hoàn thành lượt, xem điểm và những cờ cần ôn.
6. Chọn thách bạn, ôn lỗi sai hoặc chơi tiếp.
7. Chỉ gợi ý tạo tài khoản khi cần đồng bộ tiến độ.

### Hành trình quay lại

1. Thấy Daily mới và tiến độ cá nhân.
2. Chơi lượt ngày hoặc ôn một nhóm cờ đã nhầm.
3. Cải thiện kỷ lục, thu thập dấu hộ chiếu.
4. Chia sẻ thành tích hoặc mở thử thách bạn gửi.

## 4. Phạm vi phát hành

### Bản đầu

- Daily Mix, Sprint 60 giây, luyện tập, thách bạn bằng link.
- Chơi khách; tài khoản tùy chọn để đồng bộ.
- Dữ liệu quốc kỳ có nguồn và phiên bản.
- Tên quốc gia Việt/Anh, tìm kiếm không dấu, tên gọi thay thế được kiểm duyệt.
- Điểm, lịch sử, kỷ lục, chuỗi ngày, tiến độ học.
- Thẻ kết quả, sao chép link/văn bản, lưu ảnh kết quả.
- Bảng xếp hạng ngày cho kết quả được xác thực.
- Trang hộ chiếu, bộ sưu tập quốc kỳ, ôn lỗi sai.
- Trạng thái tải, lỗi, mất mạng, tải lại và link không hợp lệ.
- Công cụ quản trị tối thiểu để quản lý dữ liệu, đề ngày và báo lỗi.

### Sau khi kiểm chứng bản đầu

- Survival ba mạng.
- Party Room chơi đồng thời.
- Giải nhóm bạn / lớp học, bảng xếp hạng theo nhóm.
- Sự kiện chủ đề, bộ sưu tập huy hiệu, tùy biến hồ sơ.
- PWA và luyện tập offline nếu nhu cầu thực tế đủ lớn.

### Chưa thuộc phạm vi

- Chat công khai, giao dịch vật phẩm, giải thưởng tiền mặt.
- Ứng dụng native riêng cho từng hệ điều hành.
- Tự động tạo dữ kiện địa lý bằng AI trong lúc chơi.
- Quảng cáo chen giữa câu hỏi hoặc cơ chế trả tiền để tăng điểm.

## 5. Thiết kế luật chơi

### 5.1 Daily Mix

Một đề gồm 10 câu, mọi người chơi cùng nội dung và phiên bản luật:

| Câu | Kiểu | Mục đích |
| --- | --- | --- |
| 1–4 | Nhìn toàn bộ cờ, chọn 1 trong 4 đáp án | Làm quen, tạo đà |
| 5–7 | Cờ dễ nhầm, đáp án nhiễu có chủ đích | Tăng thử thách nhận diện |
| 8–9 | Hé lộ cờ theo từng mức | Tạo hồi hộp, thưởng khả năng nhận diện sớm |
| 10 | Nhập tên quốc gia | Thử trí nhớ chủ động |

Cấu trúc này cần được kiểm chứng: nếu chuyển kiểu câu khiến người mới khó hiểu, prototype có thể chỉ dùng trắc nghiệm trước khi mở rộng.

**Quy tắc dự kiến:**

- Một lần gửi đáp án cho mỗi câu; không trừ điểm âm khi sai.
- Câu trắc nghiệm có giới hạn dự kiến 15 giây; câu nhập tên 20 giây.
- Hết giờ được tính là chưa trả lời, sau đó hiển thị đáp án.
- Câu hé lộ dùng các mức mở cố định; không cắt méo quốc kỳ.
- Phản hồi học tập xuất hiện ngoài đồng hồ trả lời và có nút tiếp tục.
- Lượt hợp lệ đầu tiên tính vào bảng xếp hạng ngày; lượt chơi lại là luyện tập.
- Daily dùng ngày UTC để người dùng toàn cầu cùng đề; giao diện Việt Nam hiển thị thời điểm đổi đề là 07:00, kèm đếm ngược. Đây là lựa chọn đề xuất cần chốt trước triển khai.
- Người đã bắt đầu trước thời điểm đổi đề được hoàn thành lượt cũ trong thời hạn phiên đã quy định.

### 5.2 Điểm dự kiến

Các con số dưới đây là thông số prototype, không phải cân bằng đã được kiểm chứng.

| Loại câu | Điểm khi đúng | Điểm khi sai / hết giờ |
| --- | --- | --- |
| Trắc nghiệm và nhập tên | 100 điểm cơ bản + tối đa 20 điểm tốc độ | 0 |
| Hé lộ | 120 / 110 / 100 theo mức hé lộ | 0 |

Điểm tốc độ: `floor(20 × max(0, 1 − thời_gian_trả_lời / giới_hạn_câu))`.

- Daily tối đa 1.200 điểm theo cấu trúc hiện tại.
- Không cộng combo vào Daily để giảm chênh lệch quá mức.
- Xếp hạng: tổng điểm giảm dần, số câu đúng giảm dần; nếu vẫn bằng nhau thì đồng hạng.
- Thời gian dùng để xác minh phải do máy chủ quản lý; không tin đồng hồ hoặc điểm từ client.
- Phiên bản luật được lưu cùng đề và kết quả để tránh so sánh sai sau khi chỉnh điểm.

### 5.3 Sprint 60 giây

- Trắc nghiệm liên tục trong 60 giây.
- Mỗi câu đúng nhận điểm cơ bản; sai không nhận điểm.
- Có chỉ báo chuỗi đúng để tạo hứng thú; chưa cần nhân điểm combo ở bản đầu.
- Độ khó tăng theo các nhóm câu đã định trước.
- Không lặp quốc gia trong một lượt trừ khi bộ lọc không đủ dữ liệu; khi đó kết thúc bộ câu hoặc thông báo rõ.
- So với kỷ lục cá nhân. Thách đấu Sprint phải dùng cùng seed, bộ dữ liệu và luật.
- Không lập bảng xếp hạng toàn cầu cho các lượt có bộ câu không tương đương.

### 5.4 Luyện tập

- Chọn toàn thế giới, châu lục, mức khó hoặc nhóm từng trả lời sai.
- Mặc định không có đồng hồ.
- Có thể bật gợi ý, bỏ qua và mở thẻ kiến thức.
- Cho phép ôn một phiên ngắn 5–10 câu.
- Kết quả cập nhật tiến độ học nhưng không ảnh hưởng bảng xếp hạng thi đấu.

### 5.5 Thách bạn

- Tạo đường dẫn sau một lượt chơi đủ điều kiện.
- Link cố định bộ câu, thứ tự, lựa chọn, phiên bản dữ liệu và luật.
- Người nhận không cần tài khoản để bắt đầu.
- Chỉ lượt đầu hợp lệ của mỗi danh tính khách/tài khoản được ghi nhận để so tài; không thể bảo đảm một người không tạo nhiều danh tính khách.
- Chỉ hiển thị đáp án sau khi câu kết thúc; trang xem trước không chứa đáp án.
- Link có thời hạn; đề xuất 30 ngày. Khi hết hạn, thông báo rõ và cho phép bắt đầu lượt mới.
- Không công khai lịch sử hoặc thông tin tài khoản ngoài tên hiển thị và kết quả được chia sẻ.

### 5.6 Máy trạng thái lượt chơi

`idle → loading → ready → answering → feedback → next question → completed`

Các nhánh cần xử lý: `load_error`, `connection_lost`, `expired`, `abandoned`.

- Khóa thao tác ngay khi gửi để tránh trả lời hai lần.
- Gửi lại request sau lỗi mạng không tạo hai đáp án hoặc hai kết quả.
- Luyện tập có thể tạm dừng; lượt có thời gian vẫn chạy theo máy chủ khi chuyển tab.
- Tải lại trang khôi phục phiên còn hiệu lực; không khởi động lại đồng hồ câu.
- Mất mạng trong thi đấu: báo trạng thái, thử kết nối lại; không tự ghi nhận kết quả chưa xác minh lên bảng xếp hạng.

## 6. Học tập và tiến độ

### Thẻ phản hồi

- Cờ đúng và tên quốc gia.
- Một đặc điểm nhận diện đã kiểm duyệt.
- Khi phù hợp, so sánh với cờ người chơi vừa nhầm.
- Thông tin sâu hơn qua nút mở rộng: châu lục, vị trí, dữ kiện ngắn và nguồn.
- Không đưa đoạn kiến thức dài làm ngắt nhịp chơi.

### Hộ chiếu khám phá

| Trạng thái | Điều kiện dự kiến |
| --- | --- |
| Chưa gặp | Chưa có lần trả lời |
| Đang học | Đã gặp nhưng chưa đủ bằng chứng nhớ lâu |
| Đã nhớ khá tốt | Trả lời đúng trong ít nhất 3 phiên ở các ngày khác nhau |
| Cần ôn | Trả lời sai sau khi đã học hoặc đến lịch ôn |

Lịch ôn ban đầu có thể theo mốc 1, 3, 7, 14 ngày; trả lời sai đưa nội dung về mốc ngắn hơn. Đây là heuristic khởi đầu, không tuyên bố hiệu quả học thuật đã được chứng minh cho sản phẩm.

- Tổng hợp tỷ lệ đúng theo châu lục.
- Liệt kê những cặp cờ thường nhầm.
- Đóng dấu hộ chiếu cho tiến bộ thực tế.
- Chuỗi ngày học tính theo ngày địa phương đã lưu cho hồ sơ; tách khỏi mã ngày UTC của Daily.
- Không gây áp lực hoặc phạt người dùng vì bỏ lỡ một ngày.

## 7. Dữ liệu quốc kỳ

### Phạm vi và chuẩn hóa

- Chốt danh sách quốc gia cho bộ cơ bản trước khi nhập dữ liệu; không ngầm coi mọi mã vùng là quốc gia độc lập.
- Lãnh thổ / khu vực là bộ mở rộng có nhãn riêng và quy tắc tham gia rõ ràng.
- Lưu tên chuẩn, tên Việt/Anh và alias được kiểm duyệt.
- Chuẩn hóa Unicode, khoảng trắng, chữ hoa/thường và dấu để tìm kiếm.
- Alias mơ hồ phải yêu cầu chọn quốc gia cụ thể; không tự chấm đúng nhiều thực thể khác nhau.
- Câu nhập tên không hiển thị cờ bên cạnh gợi ý vì sẽ làm lộ đáp án.
- Không trộn phiên bản dữ liệu trong một lượt.

### Trường dữ liệu nội dung

| Trường | Ý nghĩa |
| --- | --- |
| `id`, `code` | Định danh ổn định, mã tham chiếu nếu có |
| `nameVi`, `nameEn`, `aliases` | Tên và cách gọi được chấp nhận |
| `entityType`, `continent` | Phân loại thực thể và vùng học |
| `flagAsset`, `aspectRatio` | Tài nguyên cờ và tỷ lệ chuẩn |
| `difficulty`, `confusableWith` | Độ khó biên tập, nhóm dễ nhầm |
| `recognitionTipVi`, `recognitionTipEn` | Mẹo nhận diện |
| `facts`, `sources` | Thông tin học và nguồn |
| `assetLicense`, `attribution` | Giấy phép và ghi công tài nguyên |
| `reviewedAt`, `datasetVersion` | Ngày kiểm duyệt và phiên bản |

### Kiểm soát chất lượng

- Ưu tiên SVG hoặc ảnh nét có nguồn và quyền sử dụng rõ ràng.
- Giữ tỷ lệ thật, màu thật; có khoảng đệm phù hợp cho cờ hình dạng đặc biệt.
- Không dùng emoji quốc kỳ làm tài nguyên câu hỏi chính vì hiển thị phụ thuộc nền tảng.
- Không dùng câu hỏi phân định điểm nếu cờ gần như không thể phân biệt ở kích thước hiển thị.
- Dữ kiện dễ thay đổi phải có ngày kiểm tra; không cần đưa dân số hoặc số liệu kinh tế vào bản đầu.
- Có quy trình báo lỗi, sửa nội dung và phát hành phiên bản dữ liệu mới.
- Đề Daily cũ giữ snapshot hoặc tham chiếu phiên bản bất biến để kết quả còn tái hiện được.

## 8. Giao diện và trải nghiệm

### 8.1 Hướng mỹ thuật

**Hộ chiếu du lịch kết hợp arcade hiện đại:** vui, sáng rõ, sắc nét, không quá trẻ con.

| Thành phần | Đề xuất |
| --- | --- |
| Nền | Trắng ngà `#F7F5EF` |
| Chữ chính | Xanh mực `#17243B` |
| Thương hiệu | Cobalt `#315BFF` |
| Điểm nhấn | Vàng chanh `#DDF568`, cam san hô `#FF8066` |
| Typography | Font sans hỗ trợ tiếng Việt; xác minh giấy phép trước khi dùng |
| Card | Bo góc vừa phải, viền rõ, bóng nhẹ, nhiều khoảng trống |
| Đồ họa | Tem hộ chiếu, vé du lịch, huy hiệu châu lục |
| Chuyển động | Ngắn, có mục đích; hỗ trợ giảm chuyển động |
| Âm thanh | Phản hồi nhẹ, nút tắt dễ tìm, lưu tùy chọn |

Các màu là token đề xuất; phải kiểm tra tương phản ở tổ hợp sử dụng thực tế. Không thay màu quốc kỳ theo theme.

### 8.2 Bản đồ màn hình

| Màn hình | Nội dung và hành động chính |
| --- | --- |
| Trang chủ | Daily nổi bật, chơi ngay, Sprint, luyện tập, tiến độ |
| Màn chơi | Tiến độ, cờ lớn, đáp án dễ chạm, phản hồi |
| Kết quả | Điểm, kỷ lục, câu cần ôn, thách bạn, chơi tiếp |
| Nhận thử thách | Thành tích người gửi, luật ngắn, nút bắt đầu |
| Luyện tập | Bộ lọc châu lục/độ khó, ôn lỗi sai |
| Hộ chiếu | Quốc gia đã học, mức nhớ, thống kê |
| Chi tiết quốc gia | Cờ, mẹo, dữ kiện và nguồn |
| Bảng xếp hạng | Ngày, điểm hợp lệ, đồng hạng, trạng thái rỗng |
| Hồ sơ / cài đặt | Đồng bộ, ngôn ngữ, âm thanh, chuyển động, dữ liệu cá nhân |
| Quản trị | Nội dung, đề ngày, báo lỗi; yêu cầu phân quyền |

### 8.3 Màn chơi điện thoại

1. Thanh trên: đóng/thoát, câu hiện tại, thời gian nếu có.
2. Vùng giữa: quốc kỳ lớn trên nền trung tính.
3. Vùng dưới: 4 nút đáp án hoặc ô nhập tên.
4. Phản hồi cố định không làm các nút nhảy vị trí.
5. Không có quảng cáo, menu dài hoặc bảng xếp hạng chen giữa câu.

### 8.4 Nội dung giao diện mẫu

- Trang chủ: “10 lá cờ, bạn nhận ra bao nhiêu?”
- CTA chính: “Chơi ngay”.
- Kết quả: “Bạn đúng 8/10. Thử thách bạn bè nhé?”
- Ôn tập: “Ôn lại 3 lá cờ vừa nhầm”.
- Nhận link: “Một người bạn đạt 8/10. Bạn vượt được không?”
- Lỗi mạng: “Kết nối bị gián đoạn. Đang thử kết nối lại…”
- Link hết hạn: “Thử thách này đã kết thúc. Bắt đầu một lượt mới nhé.”

### 8.5 Trợ năng và responsive

- Dùng được bằng bàn phím; focus nhìn rõ, thứ tự hợp lý.
- Vùng chạm mục tiêu tối thiểu 44 × 44 CSS px.
- Trạng thái đúng/sai có chữ hoặc biểu tượng, không chỉ màu sắc.
- Tôn trọng `prefers-reduced-motion`; tránh chớp sáng và rung kéo dài.
- Không để alt text hoặc tên asset trong UI tiết lộ đáp án câu hỏi.
- Nhận diện cờ là hoạt động thị giác; nếu cung cấp chế độ mô tả văn bản thay thế, phải có luật và bảng điểm riêng vì độ khó khác nhau.
- Hỗ trợ màn hẹp từ 360 px, bàn phím ảo, zoom và tên quốc gia dài.

## 9. Chia sẻ và tăng trưởng

### Vòng lan truyền

Chơi → có kết quả → gửi thử thách → người nhận mở link → chơi cùng đề → so kết quả → gửi tiếp.

### Tài sản chia sẻ

- Văn bản gồm tên game, mã đề, điểm, số đúng, chuỗi biểu tượng và link.
- Ảnh vuông cho bài đăng và ảnh dọc cho story.
- Không lộ đáp án của Daily đang diễn ra.
- Preview link có ngữ cảnh thử thách, không chỉ logo chung.
- Dùng chức năng chia sẻ hệ thống khi được hỗ trợ; fallback sao chép và tải ảnh.
- Không tự gửi tin nhắn hoặc đăng bài thay người dùng.

### Nội dung ra mắt

- “Những lá cờ dễ nhầm nhất trong lượt hôm nay”.
- “Bạn đoán được khi cờ mới hé lộ một góc không?”
- Thử thách theo châu lục, nhóm bạn và câu lạc bộ.
- Video ngắn đưa câu hỏi trước, giải thích sau; tránh lộ Daily đang mở.

### Kiếm tiền sau khi có tín hiệu giữ chân

- Có thể thử gói bỏ quảng cáo, giao diện trang trí hoặc bộ nội dung mở rộng.
- Không bán lợi thế điểm số hoặc chặn ôn kiến thức cơ bản bằng trả tiền.
- Chưa đưa mô hình doanh thu vào đường đi chính của bản beta.

## 10. Kiến trúc kỹ thuật

Đây là kiến trúc đề xuất, chưa chốt nhà cung cấp hoặc phiên bản thư viện.

| Lớp | Trách nhiệm |
| --- | --- |
| Frontend React + TypeScript | Responsive UI, state màn chơi, nhập đáp án, phản hồi |
| Game engine | Luật chơi, sinh đề có seed, kiểm tra đáp án, tính điểm thuần |
| Backend | Phiên chơi, thời gian, Daily, link thách đấu, xác thực kết quả |
| Database | Người chơi, lượt chơi, đề, tiến độ, kết quả |
| Asset storage / CDN | Quốc kỳ và ảnh kết quả |
| Local persistence | Tiến độ khách, tùy chọn, trạng thái chưa đồng bộ |
| Analytics | Sự kiện tối thiểu để đo funnel, giữ chân và học tập |

### Nguyên tắc triển khai

- Tách game engine khỏi component để có thể kiểm thử luật độc lập.
- Nội dung có version; seed luôn đi cùng version và mode để tái hiện đề.
- Không cần gọi API quốc kỳ bên ngoài cho từng câu.
- Thi đấu: máy chủ giữ đáp án và kiểm tra kết quả; payload câu đang chơi không gửi đáp án đúng.
- Luyện tập có thể dùng bộ dữ liệu local để tải nhanh.
- Dữ liệu luyện tập không được nâng thành điểm thi đấu khi đồng bộ.
- Request ghi đáp án/kết quả có idempotency key và ràng buộc duy nhất.
- Thời gian máy chủ là cơ sở chấm điểm; cần cân nhắc ảnh hưởng độ trễ mạng khi cân bằng điểm tốc độ.
- Rate limit endpoint tạo phiên, gửi đáp án và tạo link.
- Chuẩn hóa/escape tên người chơi, không render HTML do người dùng nhập.
- Quản trị tách quyền; secrets chỉ ở máy chủ.
- Theo dõi lỗi và có khả năng gỡ một đề sai mà không sửa ngầm lịch sử.

### Giới hạn chống gian lận

Xác thực máy chủ giúp ngăn sửa điểm trực tiếp, nhưng không loại bỏ được việc tra cứu, chụp màn hình hoặc tạo nhiều danh tính. Bản đầu ưu tiên trải nghiệm bạn bè và bảng điểm hợp lệ về mặt kỹ thuật; chưa dùng cho giải thưởng có giá trị.

### Cấu trúc mã nguồn dự kiến

```text
src/
  app/                 # Routes và layout
  components/          # Thành phần UI dùng chung
  features/
    game/
    daily/
    sprint/
    practice/
    challenges/
    passport/
    leaderboard/
  game-engine/         # Luật, seed, scoring, validation
  server/              # API, session, auth, persistence
  content/             # Schema và dữ liệu đã kiểm duyệt
  i18n/                # Nội dung Việt/Anh
  styles/              # Design tokens
public/
  flags/
tests/
docs/
```

## 11. Mô hình dữ liệu

| Thực thể | Trường cốt lõi | Ràng buộc |
| --- | --- | --- |
| `Player` | id, accountId?, displayName, locale, timezone | Hỗ trợ khách; không công khai email |
| `Country` | id, names, aliases, type, continent, asset | Version nội dung, nguồn và giấy phép |
| `QuestionSet` | id, seed, mode, datasetVersion, rulesVersion | Bất biến sau khi phát hành |
| `DailyPuzzle` | dateUtc, questionSetId, status | Một đề chính thức cho mỗi ngày |
| `GameSession` | id, playerId, setId, state, startedAt, expiresAt | State transition được kiểm tra |
| `Answer` | sessionId, questionIndex, answerId, receivedAt, score | Unique theo session + questionIndex |
| `Result` | sessionId, score, correctCount, verified, completedAt | Một kết quả cuối cho mỗi phiên |
| `Challenge` | id, creatorResultId, setId, expiresAt | Link không sửa được luật hoặc điểm |
| `LearningProgress` | playerId, countryId, attempts, correct, dueAt, level | Không chỉ dựa vào một lần đúng |
| `ContentReport` | id, countryId?, puzzleId?, category, details, status | Kiểm duyệt trước khi sửa nội dung |

Khi khách đăng nhập, hợp nhất tiến độ bằng ID sự kiện hoặc phiên để tránh cộng trùng. Kỷ lục chỉ so trong cùng mode và phiên bản luật tương thích.

## 12. Hợp đồng API dự kiến

Tên endpoint là định hướng, có thể thay đổi theo framework.

| Endpoint | Mục đích |
| --- | --- |
| `GET /api/daily` | Metadata đề hiện tại và giờ đổi đề, không lộ đáp án |
| `POST /api/sessions` | Tạo/khôi phục phiên theo mode hoặc challenge |
| `GET /api/sessions/:id` | Trạng thái phiên và câu đang được phép xem |
| `POST /api/sessions/:id/answers` | Gửi một đáp án, trả phản hồi và điểm được xác minh |
| `POST /api/sessions/:id/advance` | Chuyển từ phản hồi sang câu tiếp, bắt đầu đồng hồ mới |
| `GET /api/sessions/:id/result` | Kết quả đã hoàn thành |
| `POST /api/challenges` | Tạo link từ kết quả đủ điều kiện |
| `GET /api/challenges/:id` | Metadata và trạng thái link |
| `GET /api/leaderboard?date=...` | Bảng điểm hợp lệ của ngày |
| `GET /api/me/progress` | Tiến độ người chơi hiện tại |
| `POST /api/content-reports` | Báo lỗi dữ liệu |

### Yêu cầu chung

- Validate schema và quyền truy cập ở máy chủ.
- Không nhận điểm do client tự tính làm dữ liệu chính thức.
- Đáp án sai kiểu, câu chưa mở hoặc phiên hết hạn có mã lỗi rõ ràng.
- Request gửi lại trả cùng kết quả nếu payload trùng; payload xung đột bị từ chối.
- API không cho xem phiên riêng của người khác qua việc đoán ID.
- Nội dung chia sẻ dùng mã công khai riêng, không để lộ session token.

## 13. Đo lường sản phẩm

### Sự kiện

`landing_view`, `game_start`, `question_answered`, `game_complete`, `game_abandon`, `review_start`, `review_complete`, `share_click`, `challenge_link_open`, `challenge_start`, `challenge_complete`, `signup_complete`.

- Chỉ lưu các thuộc tính cần thiết: mode, phiên bản luật, nguồn vào, loại thiết bị, số câu và thời lượng.
- Không coi `share_click` là bằng chứng đã gửi thành công; trình duyệt không luôn xác nhận được việc đó.
- Không gửi tên, email hoặc nội dung nhập tự do vào analytics mặc định.

### Chỉ số và cách hiểu

| Chỉ số | Định nghĩa |
| --- | --- |
| Tỷ lệ bắt đầu | Số khách bắt đầu / số khách vào trang đủ điều kiện |
| Hoàn thành lượt đầu | Người hoàn thành lượt đầu / người bắt đầu lượt đầu |
| Chơi thêm | Người bắt đầu lượt thứ hai / người hoàn thành lượt đầu |
| D1 / D7 retention | Người trong cohort quay lại chơi ngày 1 / ngày 7 |
| Ý định chia sẻ | Người bấm chia sẻ / người hoàn thành |
| Chuyển đổi link | Người bắt đầu challenge / người mở link challenge |
| Cải thiện học tập | Tỷ lệ đúng khi gặp lại nhóm cờ từng sai, theo khoảng thời gian |
| Tỷ lệ lỗi | Phiên gặp lỗi chặn chơi / tổng phiên bắt đầu |

Không đặt mục tiêu viral dựa trên số liệu tưởng tượng. Beta thiết lập baseline trước; mỗi lần thử nghiệm chỉ thay đổi ít biến và ghi rõ giả thuyết.

## 14. Chất lượng và nghiệm thu

### Chức năng

- Hoàn thành được cả bốn chế độ bản đầu với tư cách khách.
- Daily cùng ngày có cùng đề và luật trên các thiết bị.
- Đúng/sai, hết giờ, bỏ qua và điểm khớp đặc tả.
- Link thách bạn giữ nguyên nội dung; link hết hạn có trạng thái rõ.
- Refresh, double click và retry không nhân đôi điểm hoặc đáp án.
- Lượt luyện tập không xuất hiện trong bảng điểm thi đấu.
- Tên Việt, Anh, không dấu và alias được chấp nhận đúng; alias mơ hồ không bị chấm tùy tiện.
- Đồng bộ tài khoản không làm mất hoặc cộng trùng tiến độ khách.

### Giao diện

- Không tràn ngang trên màn hình điện thoại phổ biến.
- Cờ giữ tỷ lệ và không bị cắt mất chi tiết cần phân biệt.
- Tên quốc gia dài và bàn phím ảo không che nút cần dùng.
- Có loading, empty, error, expired và completed state.
- Chia sẻ có fallback khi API hệ thống không khả dụng.
- Kiểm tra bàn phím, focus, tương phản và giảm chuyển động.

### Kiểm thử cần thiết

- Unit test cho scoring, hết giờ, seed, chuẩn hóa tên và state transition.
- Integration test cho phiên, gửi trùng, quyền truy cập, giới hạn lượt và challenge.
- End-to-end cho luồng khách chơi → kết quả → tạo link → người nhận chơi.
- Kiểm tra dữ liệu tự động: thiếu asset, trùng ID, alias xung đột, thiếu nguồn.
- Kiểm tra trực quan thủ công với cờ đặc biệt và cặp dễ nhầm.
- Kiểm tra trình duyệt điện thoại và máy tính mục tiêu; ghi rõ phiên bản khi nghiệm thu.

### Mục tiêu hiệu năng dự kiến

- Màn đầu có thể tương tác nhanh trên điện thoại tầm trung và mạng di động.
- Mục tiêu LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 ở percentile 75 khi đủ dữ liệu thực tế; đây là ngân sách chất lượng đề xuất, chưa được đo.
- Preload có kiểm soát các asset sắp dùng; tránh tải toàn bộ đồ họa không cần thiết.
- Không đặt mô hình 3D nặng vào đường bắt đầu chơi.

## 15. Lộ trình thực hiện

Ước lượng 4–6 tuần cho một lập trình viên có kinh nghiệm, với dữ liệu nguồn sẵn có để biên tập. Thời gian thay đổi theo độ hoàn thiện UI, dịch thuật, tài khoản và hạ tầng.

| Giai đoạn | Công việc | Điều kiện chuyển bước |
| --- | --- | --- |
| 1. Prototype, 3–4 ngày | 30–50 cờ, màn chơi, phản hồi, kết quả | Người mới hiểu luật và tự hoàn thành |
| 2. Core, 1–2 tuần | Engine, dữ liệu đầy đủ, Daily, Sprint, luyện tập | Chơi ổn định và chấm điểm đúng |
| 3. Social và learning, khoảng 1 tuần | Challenge, thẻ chia sẻ, hộ chiếu, ôn tập | Link chơi ngay; tiến độ đúng |
| 4. Beta, khoảng 1 tuần | Nhóm thử nhỏ, sửa độ khó, dữ liệu, hiệu năng | Không còn lỗi chặn chơi; có baseline |
| 5. Ra mắt và tối ưu | Nội dung ngắn, cộng đồng, thử thông điệp | Có dữ liệu chọn hướng phát triển |

### Đầu ra theo giai đoạn

- Prototype: giao diện tương tác và ghi nhận quan sát người chơi.
- Core: bản local/staging hoàn chỉnh, dữ liệu có nguồn, kiểm thử luật.
- Social: luồng link end-to-end, kết quả chia sẻ và tiến độ học.
- Beta: danh sách lỗi, báo cáo funnel, quyết định giữ/đổi cấu trúc Daily.
- Release: bản production, giám sát lỗi, lịch nội dung và quy trình xử lý báo lỗi.

## 16. Backlog ưu tiên

| Ưu tiên | Hạng mục | Phụ thuộc |
| --- | --- | --- |
| P0 | Chốt phạm vi bộ quốc gia, giấy phép asset | Không |
| P0 | Design tokens, trang chủ và màn chơi | Định hướng thiết kế |
| P0 | Schema nội dung, game engine, scoring | Luật prototype |
| P0 | Daily và Sprint | Engine, dữ liệu |
| P0 | Luyện tập và ôn lỗi sai | Engine, tiến độ |
| P0 | Phiên server và xác thực kết quả | Backend, database |
| P0 | Challenge và thẻ chia sẻ | Kết quả hợp lệ |
| P0 | Trạng thái lỗi, responsive, trợ năng | Các màn cốt lõi |
| P0 | Kiểm thử, analytics tối thiểu, rà dữ liệu | Luồng hoàn chỉnh |
| P1 | Tài khoản và đồng bộ | Tiến độ khách ổn định |
| P1 | Bảng xếp hạng ngày | Xác thực kết quả |
| P1 | Hộ chiếu hoàn chỉnh, huy hiệu | Dữ liệu tiến độ |
| P1 | Quản trị nội dung tối thiểu | Schema và phân quyền |
| P2 | Survival, sự kiện chủ đề | Tín hiệu giữ chân |
| P2 | Party Room, giải nhóm | Nhu cầu thực tế, hạ tầng realtime |

P0 là điều kiện có bản beta dùng được. P1 vẫn thuộc phạm vi bản phát hành đầu đã đề xuất, hoàn thiện sau khi vòng chơi cốt lõi ổn định. P2 không chặn phát hành.

## 17. Rủi ro và quyết định còn mở

| Rủi ro | Cách xử lý |
| --- | --- |
| Quiz quá quen, thiếu bản sắc | Kiểm chứng Daily Mix, cờ dễ nhầm và vòng thách bạn |
| Nhiều kiểu câu gây khó hiểu | Hướng dẫn tại chỗ; giảm kiểu câu nếu beta cho thấy bỏ cuộc |
| Cờ khó phân biệt trên màn nhỏ | Rà trực quan, loại câu không công bằng |
| Nội dung sai hoặc lỗi thời | Nguồn, version, ngày review, báo lỗi |
| Tốc độ mạng ảnh hưởng điểm | Giới hạn thưởng tốc độ, đo độ trễ trong beta |
| Gian lận bảng điểm | Xác thực server, giới hạn lượt, rate limit; công bố giới hạn |
| Có chia sẻ nhưng không có người chơi mới | Đo cả mở link và bắt đầu, tối ưu trang nhận challenge |
| Phạm vi lớn làm chậm ra mắt | Giữ P0/P1, trì hoãn multiplayer và vật phẩm |
| Mất tiến độ khách khi xóa dữ liệu trình duyệt | Thông báo rõ và gợi ý đồng bộ sau khi có giá trị |

### Cần chốt khi bắt đầu triển khai

- Tên thương hiệu và tên miền sau khi kiểm tra tính khả dụng.
- Danh sách quốc gia/lãnh thổ và nguồn tài nguyên có giấy phép phù hợp.
- Mức hoàn thiện Việt/Anh trong bản đầu.
- Nhà cung cấp hosting, database, authentication và analytics.
- Các thông số prototype: thời gian từng câu, điểm, lịch ôn, thời hạn link.
- Cơ chế khách tham gia bảng xếp hạng và tên hiển thị mặc định.
- Chính sách lưu/xóa dữ liệu và cơ chế đồng ý analytics phù hợp thị trường phát hành.

Những mục này là quyết định triển khai cần giải quyết đúng lúc, không yêu cầu mở rộng phạm vi sản phẩm.

## 18. Checklist ra mắt

- [ ] Bộ dữ liệu và tài nguyên đã rà soát, có nguồn và giấy phép.
- [ ] Daily, Sprint, luyện tập, thách bạn hoạt động trọn luồng.
- [ ] Tính điểm và thời gian có kiểm thử.
- [ ] Link chia sẻ không lộ đáp án hoặc thông tin riêng tư.
- [ ] Mobile, desktop, bàn phím và giảm chuyển động được kiểm tra.
- [ ] Refresh, retry, mất mạng và link hết hạn có hành vi rõ ràng.
- [ ] Kết quả bảng xếp hạng được máy chủ xác thực.
- [ ] Đồng bộ không mất hoặc cộng trùng tiến độ.
- [ ] Analytics phân biệt ý định chia sẻ và chuyển đổi người nhận.
- [ ] Có trang thông tin, nguồn dữ liệu, quyền riêng tư và báo lỗi.
- [ ] Có giám sát lỗi và phương án rollback bản phát hành.
- [ ] Nội dung ra mắt không dùng tỷ lệ thành tích hoặc lời hứa viral không có dữ liệu.

---

**Hướng sản phẩm được đề xuất:** tập trung vào Daily Mix, Sprint, ôn cờ từng nhầm và thách bạn bằng link. Hoàn thiện vòng chơi này trước khi đầu tư vào multiplayer trực tiếp.

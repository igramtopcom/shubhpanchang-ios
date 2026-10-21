# Tiến gần tiêu chí Apple Editors' Choice

Apple không công bố checklist Editors' Choice. Họ chỉ nêu 7 điều biên tập viên nhìn vào, trên trang "Getting featured" (https://developer.apple.com/app-store/getting-featured/):

- trải nghiệm người dùng (user experience);
- thiết kế giao diện (UI design);
- đổi mới (innovation): công nghệ mới giải một vấn đề riêng;
- độc đáo (uniqueness): cách mới trong một thể loại quen thuộc;
- trợ năng (accessibility);
- bản địa hoá (localization);
- trang sản phẩm (product page).

Tiêu chí Apple Design Awards 2026 nói rõ hơn những gì Apple thưởng: Delight and Fun, Inclusivity, Innovation, Interaction, Social Impact, Visuals and Graphics.

Ví dụ gần mình nhất là **Moonlitt (app theo dõi trăng)**. App này thắng hạng Interaction năm 2026 nhờ ba điều:
- dùng Liquid Glass tốt nhất;
- onboarding dễ;
- có mặt ngoài app: widget, Apple Watch, Live Activity giờ trăng mọc và lặn.

Nguồn chi tiết và danh sách 31 mục: bản nghiên cứu ngày 2026-10-21 (tóm tắt ở dưới).

Ký hiệu cột "Cần": **RN** làm bằng JS; **CFG** chỉ cấu hình hoặc App Store Connect; **NATIVE** cần extension hay Swift.

## Kế hoạch, theo thứ tự làm

### Đợt 1: Trợ năng và cảm giác "native" (RN)
Đây là phần rẻ nhất và đúng tiêu chí Inclusivity.

| # | Việc | Cần | Trạng thái |
|---|---|---|---|
| 1.1 | Độ tương phản ≥ 4.5:1 cả sáng lẫn tối (textMuted sáng 4.39 → 6.2) | RN | xong |
| 1.2 | Vùng chạm ≥ 44 pt (chip, nút) | RN | xong |
| 1.3 | VoiceOver: ô lịch đọc ngày + tithi + vrat; nút tháng có tên; dòng giá trị đọc liền; choghadiya đọc "tốt / trung bình / tránh" | RN | xong |
| 1.4 | Không chỉ dựa vào màu: choghadiya có hình (tròn đặc / vòng / gạch) | RN | xong |
| 1.5 | Dynamic Type tới AX5: chữ Gujarati không bị cắt, lưới lịch giữ hình | RN | đang làm |
| 1.6 | Haptics: tick khi chọn chip hay bật công tắc, success khi lưu | RN | xong |
| 1.7 | Kéo để làm mới (Hôm nay, Vrat, Gia đình) | RN | đang làm |
| 1.8 | Xoá tithi gia đình phải hỏi lại (Alert kiểu destructive) | RN | đang làm |
| 1.9 | Bộ chọn ngày và giờ của iOS thay ô gõ YYYY-MM-DD | RN | xong (build 4) |
| 1.10 | Tab bar để hệ thống vẽ Liquid Glass (bỏ màu nền tự đặt) | RN | đang làm |
| 1.11 | Thanh tiêu đề native (large title, glass khi cuộn) thay chữ tiêu đề tự vẽ | RN | kế tiếp |
| 1.12 | Cài đặt: bỏ mã kỹ thuật "Asia/Kolkata" và "IN" khỏi giao diện Gujarati | RN | đang làm |

### Đợt 2: Icon và bản địa hoá hệ thống (CFG)

| # | Việc | Cần | Trạng thái |
|---|---|---|---|
| 2.1 | Icon 1024 px; bản tối và bản tinted (iOS 18/26 tự tạo bản clear) | CFG | |
| 2.2 | Tên app và câu xin quyền (vị trí, lịch, thông báo) bằng tiếng Gujarati khi máy để Gujarati | CFG | |
| 2.3 | Privacy manifest đầy đủ, không tracking | CFG | |

### Đợt 3: Có mặt ngoài app (NATIVE qua expo-widgets)
Đây là phần "Innovation", ăn điểm nhiều nhất.

| # | Việc | Cần | Trạng thái |
|---|---|---|---|
| 3.1 | Widget màn hình chính: nhỏ (tithi + giờ shubh kế tiếp), vừa (tithi, Rahu Kaal, vrat sắp tới) | NATIVE | |
| 3.2 | Widget màn hình khoá: chữ nhật (shubh kế tiếp / parana), inline (tithi), tròn (ngày tới vrat) | NATIVE | |
| 3.3 | Widget không dựa vào màu (chế độ tinted / clear), nền gỡ được cho StandBy | NATIVE | |
| 3.4 | Live Activity "Parana": đếm ngược tới giờ được ăn lại, trên màn hình khoá và Dynamic Island (≤ 8 giờ, bắt đầu sáng ngày parana) | NATIVE | |
| 3.5 | Bấm widget mở đúng ngày hay đúng vrat | NATIVE | |

### Đợt 4: Siri và Spotlight (NATIVE, Swift)

| # | Việc | Cần | Trạng thái |
|---|---|---|---|
| 4.1 | App Shortcuts: "Tithi hôm nay trong ShubhPanchang", "Ekadashi tới trong ShubhPanchang" | NATIVE | |

### Đợt 5: Trang sản phẩm và đề cử (CFG, PM duyệt)

| # | Việc | Cần | Trạng thái |
|---|---|---|---|
| 5.1 | Tên + subtitle (30 ký tự), mô tả, promotional text, từ khoá: EN và GU | CFG | |
| 5.2 | 6–8 ảnh chụp, mỗi ảnh một lợi ích, có ảnh tối, bộ GU riêng (CI chụp; cần CI điều khiển từng bước cho ổn định) | CFG | |
| 5.3 | Accessibility Nutrition Labels: chỉ khai những mục đã đi hết luồng chính | CFG | |
| 5.4 | Privacy label "Data Not Collected" (nếu đúng) + URL chính sách | CFG | |
| 5.5 | Xin đánh giá (SKStoreReviewController) sau khoảnh khắc thành công, tối đa 3 lần/năm | RN | |
| 5.6 | Đề cử Featuring trong App Store Connect ≥ 3 tuần trước dịp lễ (Uttarayan 14/1, Maha Shivaratri), kèm In-App Event | CFG | |

## Những điều tránh
- Xin quyền ngay lúc mở app. Mình đã xin đúng lúc người dùng bật nhắc nhở.
- Cảm giác web-view, picker hay sheet tự chế.
- Quảng cáo, kể cả trong widget hay Live Activity.
- Màu là cách duy nhất để hiểu nghĩa.
- Onboarding dài.

# Rủi ro khi Apple duyệt app: rà soát ngày 23/10/2026

Rà soát gồm cấu hình app (`app.json`, `app.config.js`), code trong `src/`, bản nháp trang App Store (`docs/APP-STORE-LISTING.md`), trang chính sách bảo mật trên website, và bộ thiết kế mới trong `docs/design/`. Các mục xếp theo mức độ, mục nguy hiểm nhất đứng đầu.

## A. Phải xử lý trước khi nộp

### 1. Tên app gần trùng một app đã có trên App Store
- Đã có app **"Shubh Panchang: Hindu Calendar"** của AppStoneLab Technologies LLP (id1253005792), website shubhpanchang.com. App đó có tiếng Gujarati, choghadiya và tithi.
- Tên dự kiến của mình là "ShubhPanchang: Vrat & Tithi", tên dưới icon là "શુભ પંચાંગ". Hai tên gần như giống nhau.
- Apple có thể từ chối theo 4.1 (app nhái) hoặc 5.2.1 (sở hữu trí tuệ). Bên kia cũng có thể khiếu nại tên sau khi mình phát hành, và người dùng sẽ nhầm hai app.
- **Đã quyết (23/10):** đổi thành "Divo: Gujarati Vrat & Panchang". Tên đã lưu trong App Store Connect (EN, GU); tên dưới icon, câu Siri và chữ trong app đã đổi. Còn chờ: PM tra nhãn hiệu "DIVO" trước khi phát hành (`RENAME-DIVO.md`).

### 2. Nhóm app "đã bão hòa" (4.3(b))
- Lịch Hindu và panchang có rất nhiều app, phần lớn kèm tử vi. Apple thường từ chối app mới trong nhóm này nếu không thấy khác biệt.
- Cách giảm rủi ro:
  - Ảnh chụp đầu tiên phải là điểm riêng: Parana theo mặt trời mọc nơi ở, ngày Ekadashi theo sampradaya, tithi của gia đình, Live Activity.
  - Không dùng chữ horoscope, kundali, rashifal, astrology ở bất kỳ đâu (bản nháp hiện đã tránh).
  - Ghi chú gửi người duyệt (mục E) nói rõ app không có tử vi hay lời đoán.

### 3. Widget và Live Activity: phải có trong bản nộp, đúng như trang App Store quảng cáo
- Đã ổn: App Group `group.in.shubhpanchang.app` đăng ký ngày 22/10. Workflow TestFlight build với `SP_WIDGETS: 'on'` từ build 15.
- Chú thích đầu `app.config.js` vẫn nói widget đang tắt; chú thích đó đã cũ, nên sửa để khỏi hiểu nhầm.
- Cần nhớ khi nộp: mô tả và ảnh chụp chỉ được nói tới tính năng có thật trong đúng bản build được chọn (2.3.1 / 2.3.3).

### 4. Tính năng phụ thuộc thời điểm: người duyệt có thể không thấy
- Nút "Count down on the Lock Screen" chỉ hiện khi Parana hoặc giờ trăng mọc Sankashti còn trong vòng 8 tiếng, hoặc Rahu Kaal còn trong vòng 2 tiếng hay đang diễn ra. Phần lớn các ngày, người duyệt sẽ không gặp lúc nút hiện.
- Nhắc nhở chỉ đến vào tối hôm trước một vrat.
- Người duyệt không thấy tính năng sẽ báo "không tìm thấy" (2.1).
- **Cách xử lý:** ghi chú cho người duyệt (mục E) nói rõ khi nào nút hiện. Tốt hơn nữa: cho phép bắt đầu đếm ngược tới Parana kế tiếp bất kỳ lúc nào, từ màn chi tiết Ekadashi.

## B. Nên xử lý (Apple hay hỏi thêm)

### 5. Nhãn quyền riêng tư phải khớp thực tế
- Khai "Data Not Collected" hiện là đúng:
  - tọa độ được làm tròn 2 chữ số thập phân (khoảng 1 km) trên máy (`src/lib/api.ts`);
  - Worker không bật lưu log (`wrangler.toml` không có `observability`), nên không có chỗ nào giữ lại các URL chứa tọa độ.
- **Giữ cho đúng về sau:** nếu sau này bật Workers Logs hoặc Logpush thì nhãn này sai. Lúc đó phải lọc bỏ `lat`/`lon` khỏi log, hoặc đổi nhãn.
- Bộ thiết kế mới có "Sao lưu iCloud". Khi làm, trang `/app-privacy` phải sửa câu "xóa app là mất hết dữ liệu", vì bản sao lưu vẫn còn trong iCloud của người dùng. Thêm một email liên hệ về quyền riêng tư (hello@shubhpanchang.in).

### 6. Lịch iPhone: giữ cách làm hiện tại (đã sửa lại mock)
- App hiện làm đúng cách an toàn:
  - "Thêm vrat và lễ" mở hộp đăng ký webcal của iPhone, không xin quyền;
  - thêm một ngày lẻ dùng form sự kiện của hệ thống, cũng không xin quyền.
- Ý trong mock trước ("tạo lịch riêng bằng EventKit") buộc phải xin quyền **đọc toàn bộ lịch**. Apple soi kỹ loại quyền này (5.1.1). Đã đổi mock về cách cũ.

### 7. Link mở ra website ("Read more")
- Bản TestFlight vẫn mở bài lễ hội bằng trình duyệt trong app (`festival-card.tsx`).
- Không bị cấm, nhưng làm tăng rủi ro 4.2 ("chỉ là website bọc lại"). Nó cũng khiến câu hỏi phân loại tuổi về "truy cập web không giới hạn" bị rắc rối.
- Bộ thiết kế mới đã thay bằng màn chi tiết lễ hội ngay trong app. Phải hoàn thành trước khi nộp.

### 8. Tên tổ chức tôn giáo
- BAPS, Swaminarayan, Pushtimarg, Pramukh Swami Maharaj chỉ được dùng để gọi đúng tên truyền thống. Không dùng logo hay ảnh của họ, không viết câu nào ngụ ý được họ bảo trợ.
- Thêm một dòng ở trang About và cuối mô tả: "Không liên kết với tổ chức nào; ngày theo lịch đã công bố." Rủi ro 5.2.1 thấp, nhưng tránh được khiếu nại.

### 9. Nội dung nhịn ăn
- Màn Ekadashi có hướng dẫn ăn uống khi nhịn. Nên thêm một dòng nhỏ: "Người có thai, đang bệnh hoặc lớn tuổi nên hỏi bác sĩ; làm theo truyền thống của gia đình."
- Apple ít khi bắt lỗi chuyện này (1.4.1), nhưng có dòng đó thì người duyệt yên tâm hơn.

### 10. Thông tin cần điền trong App Store Connect

| Mục | Hiện trạng | Việc cần làm |
|---|---|---|
| Phân loại tuổi (bộ câu hỏi mới) | Chưa | Trả lời bộ câu hỏi mới. Không có nội dung người dùng tạo; sau khi bỏ trình duyệt trong app thì không có truy cập web. Dự kiến 4+ |
| EU Digital Services Act (trader status) | Chưa | PM quyết: khai là trader (địa chỉ, điện thoại, email sẽ hiện công khai ở EU), khai không phải trader, hoặc chưa phát hành ở EU. Anh không thuộc EU nên không ảnh hưởng |
| Privacy Policy URL | Có: `/app-privacy?lang=en` (đang chạy) | Dùng đúng link này |
| Support URL | Có: `/contact` | Dùng đúng link này |
| Mã hóa (export) | `usesNonExemptEncryption: false` | Xong |
| Đăng nhập cho người duyệt | Không cần (app không có tài khoản) | Ghi rõ trong ghi chú cho người duyệt |
| Ảnh chụp 6.9 inch, bản EN và GU | Chưa | Chụp lại sau khi làm giao diện mới; ảnh phải đúng y app thật |

## C. Đã kiểm tra, không có vấn đề
- API trả lời bình thường cho tọa độ Cupertino (37.33, −122.03), nên người duyệt ở Mỹ dùng được dù không ở trong 130 thành phố.
- Câu "130 cities" trong mô tả khớp với API (130).
- Câu xin quyền vị trí và lịch rõ ràng, có cả bản tiếng Gujarati. Vị trí chỉ xin khi người dùng chạm "Use my location".
- Quyền thông báo chỉ xin khi người dùng bật nhắc nhở (màn mở đầu hoặc Cài đặt), không xin ngay lúc mở app.
- Không có SDK quảng cáo hay analytics. Hộp xin đánh giá dùng API của Apple.
- File `apple-app-site-association` (liên kết app với website) đang chạy và đúng Team ID.
- Có privacy manifest khai lý do dùng UserDefaults, FileTimestamp, SystemBootTime.

## D. Thứ tự đề xuất
1. PM quyết về tên app (mục 1) và trader status ở EU (mục 10).
2. Sửa chú thích cũ trong `app.config.js` (mục 3).
3. Làm giao diện mới, trong đó có màn chi tiết lễ trong app (mục 7), dòng không liên kết (8), dòng lưu ý nhịn ăn (9), và đếm ngược Parana bất kỳ lúc nào (4).
4. Chụp ảnh, điền App Store Connect, gửi kèm ghi chú cho người duyệt (mục E).

## E. Bản nháp ghi chú cho người duyệt (App Review Notes)

> Divo, the app of shubhpanchang.in, is a Gujarati Hindu religious calendar. It tells families which day to keep each fast (vrat) and when to break it, based on the sunrise where they live. It has no horoscope, kundli or predictions, no account, no ads and no tracking.
>
> No sign-in is needed. To review:
> 1. On first launch, choose any city or tap "Use my location". Any location works, including Cupertino.
> 2. Today tab: today's tithi, the choghadiya time bands and Rahu Kaal for that place.
> 3. Vrat tab: the next Ekadashi with its Parana (fast-breaking) window. Settings > Tradition changes the date when a tradition (Swaminarayan, Pushtimarg) keeps the fast a day later.
> 4. Family tab: add a birthday or death anniversary by date or by tithi; the app finds this year's day.
> 5. Live Activity: "Count down on the Lock Screen" appears on Today and in the Vrat list within 8 hours of a Parana window or a Sankashti moonrise, and from two hours before Rahu Kaal until it ends (daytime at the chosen place).
> 6. Widgets: add the "Today" or "Next vrat" widget from the Home Screen.
>
> Calculations run on our own server (shubhpanchang.in, the same engine as our website) and on the device. Location is rounded to about 1 km before it leaves the phone and is not stored.

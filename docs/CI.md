# Build ShubhPanchang iOS trên GitHub Actions

Cùng cách với Sondra iOS và Sanftly: không cần Mac, không có chứng chỉ trong repo.

| Workflow | Chạy khi | Việc | Cần gì |
|---|---|---|---|
| `ios-sim.yml` | commit có `[sim]`, hoặc chạy tay | test logic, typecheck, `expo prebuild`, build Release cho Simulator (không ký), mở app, chụp màn hình | không cần secret |
| `ios-screens.yml` | commit có `[screens]`, hoặc chạy tay | build simulator có bật link `shubhpanchang://seed` (chỉ bản này), mở từng màn và chụp: onboarding, 7 màn tiếng Gujarati (Ahmedabad), 2 màn tiếng Anh (New Jersey), 2 màn chế độ tối | không cần secret |
| `ios-testflight.yml` | commit có `[testflight]`, hoặc chạy tay | archive không ký → export ký trên cloud → đẩy lên App Store Connect (TestFlight); số build = số lần chạy | 4 secret bên dưới |

Thành công thật sự khi log có `BUILD SUCCEEDED` (simulator), hoặc `EXPORT SUCCEEDED` và `Uploaded` (TestFlight). Job xanh thôi là chưa đủ: workflow tự kiểm tra các dòng này.

## Quy tắc public/private (chủ dự án)

Repo để **private**. Runner macOS trên repo private bị tính phí gấp 10 lần, và Actions của tài khoản igramtopcom đang lỗi thanh toán. Vì vậy mỗi lần build thì mở **public**, build xong đóng lại ngay. Script `scripts/ci-build.sh` làm việc này: kiểm tra lượt chạy dở, mở, chờ 30 giây, push, theo dõi, chỉ đóng khi không còn lượt nào chạy, rồi in ra trạng thái (phải là `PRIVATE`). Báo chủ dự án trước khi mở và sau khi đóng.

Repo này chỉ chứa app (tách từ thư mục `mobile/` của repo `shubhpanchang`), nên khi mở public không lộ mã website, và lịch sử không có khoá bí mật (đã quét trước lần mở đầu tiên).

```bash
bash scripts/ci-build.sh push
```
```bash
bash scripts/ci-build.sh dispatch ios-sim.yml
```

## Bật đẩy lên TestFlight (chủ dự án làm một lần)

Có thể dùng lại khoá App Store Connect API đang dùng cho Sondra iOS / Sanftly (cùng team `2GX4UMPT5P`, quyền **Admin**). Nếu tạo khoá mới: App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys → **+**, Access: **Admin**, tải tệp `AuthKey_XXXXXXXXXX.p8` (chỉ tải được một lần), ghi lại Key ID và Issuer ID.

Đặt 4 secret (chạy trong thư mục repo; hai lệnh đầu hỏi giá trị, không hiện ra màn hình):

```bash
gh secret set APPSTORE_KEY_ID -R igramtopcom/shubhpanchang-ios
```
```bash
gh secret set APPSTORE_ISSUER_ID -R igramtopcom/shubhpanchang-ios
```
```bash
gh secret set APPSTORE_KEY_P8 -R igramtopcom/shubhpanchang-ios < đường/dẫn/AuthKey_XXXXXXXXXX.p8
```
```bash
gh secret set APPLE_TEAM_ID -R igramtopcom/shubhpanchang-ios --body 2GX4UMPT5P
```

Sau đó commit có `[testflight]` (hoặc `bash scripts/ci-build.sh dispatch ios-testflight.yml`) sẽ đẩy một build lên TestFlight.

## Trên iPhone

Cài **TestFlight** từ App Store; App Store Connect → ShubhPanchang: Vrat & Tithi → TestFlight → Internal Testing → thêm Apple ID của bạn vào nhóm tester.

# Kế hoạch đổi tên app thành "Divo" (PM duyệt 23/10/2026)

**Trạng thái:**
- Bước 1 xong: tên và phụ đề đã lưu trong App Store Connect, bản en-US và gu-IN.
- Bước 2 xong: commit cục bộ, chưa push, chưa build.
- Bước 6 xong một phần: đã sửa tài liệu và tên workflow. Mock thiết kế đã sửa nhưng chưa commit, vì cả bộ mock còn chờ duyệt.
- Còn lại: bước 0 (PM tra nhãn hiệu), bước 3 (build), bước 4 (icon), bước 5 (website).

Tên mới đã chọn: **Divo: Gujarati Vrat & Panchang**. Lý do đổi: một app khác đã dùng tên "Shubh Panchang: Hindu Calendar" (xem `APP-REVIEW-RISKS.md`, mục 1).

## Tên ở từng chỗ

| Chỗ hiển thị | English | ગુજરાતી | Giới hạn |
|---|---|---|---|
| Tên trên App Store | Divo: Gujarati Vrat & Panchang | દીવો: ગુજરાતી વ્રત અને પંચાંગ | 30 / 30 ký tự (bản GU dài 29) |
| Phụ đề trên App Store | Ekadashi, Parana, family tithi | અગિયારસ, પારણાં, પરિવારની તિથિ | 30 / 30 ký tự |
| Tên dưới icon trên iPhone | Divo | દીવો | |
| Câu nói với Siri | "Today's tithi in Divo", "Next vrat in Divo" | tự theo tên app | |
| Website | vẫn là shubhpanchang.in; trang App Store ghi "cùng cách tính với shubhpanchang.in" | | |

**Từ khóa mới** (99/100 ký tự). Bỏ các từ đã có trong tên (gujarati, vrat, panchang), vì App Store đã tính chúng rồi:
`ekadashi,parana,tithi,choghadiya,hindu calendar,shraddh,purnima,rahu kaal,sankashti,navratri,diwali`

**Không dùng chữ "shubhpanchang" làm từ khóa.** Đó cũng là tên của app kia, và Apple cấm dùng tên app khác trong từ khóa (quy tắc 2.3.7). Người vào từ website sẽ đến thẳng trang App Store qua banner, không cần tìm kiếm.

## Giữ nguyên (không đổi, để không làm hỏng gì)

Những thứ này người dùng không nhìn thấy, đổi đi chỉ thêm rủi ro:
- Bundle ID `in.shubhpanchang.app`, App Group, widget extension, Apple ID 6825234507, SKU;
- link mở app `shubhpanchang://` (widget, thông báo và Universal Links đều dùng);
- tên miền shubhpanchang.in, email hello@, API;
- tên project Xcode nội bộ (`expo.name`), để workflow CI không phải sửa;
- tên các repo GitHub.

## Các bước

| # | Việc | Ai làm | Công khai? |
|---|---|---|---|
| 0 | **Tra nhãn hiệu "DIVO" / "દીવો"**: IP India (nhóm 9 phần mềm, nhóm 42 dịch vụ trực tuyến), USPTO, UK IPO. Nếu trống thì nên nộp đơn (nên hỏi đơn vị tư vấn nhãn hiệu về phí và thủ tục) | PM, có thể kèm người tư vấn | Không |
| 1 | **Giữ tên trong App Store Connect.** App Information: sửa Name và Subtitle cho bản en-US và bản gu. Apple kiểm tra trùng tên ngay lúc lưu, nên đây cũng là bước xác nhận tên còn trống | Mình làm trên Chrome của PM, sau khi PM đồng ý | Không (chỉ hiện ra khi phát hành) |
| 2 | **Sửa app** (một commit): tên dưới icon (`locales/*.json`, `app.json` infoPlist), câu xin quyền Lịch, `appName` và hướng dẫn thêm widget trong `src/lib/i18n.ts`, chữ mặc định của widget, câu nhắc của Siri trong `ShubhShortcuts.swift`, màn About ("Divo · cùng cách tính với shubhpanchang.in"), test liên quan | Mình | Không (repo riêng) |
| 3 | **Build TestFlight** qua `scripts/ci-build.sh`, kiểm tra tên dưới icon, Siri, widget. Ghi trong "What to Test": "App đổi tên thành Divo, mọi dữ liệu giữ nguyên" | Mình (repo mở công khai tạm thời trong lúc build, như mọi lần) | Người thử beta thấy tên mới |
| 4 | **Icon cây đèn dầu (diya)**, đủ ba bản sáng / tối / tinted, làm bằng `tools/make_icon.py`. Gửi mẫu cho PM duyệt trước khi thay icon mặt trời mọc hiện tại | Mình vẽ, PM duyệt | Không |
| 5 | **Website:** câu giới thiệu app trong `InstallNudge.astro` (nhánh App Store), trang `/app-privacy` (tiêu đề và mở đầu: "Divo, app iPhone của shubhpanchang.in"). Banner "thêm ShubhPanchang vào màn hình chính" là của website nên giữ nguyên. Deploy bằng `ship.ps1` | Mình | Có, nhưng nhánh App Store của banner vẫn ẩn tới ngày phát hành |
| 6 | **Tài liệu:** `APP-STORE-LISTING.md` (tên, phụ đề, từ khóa, câu cuối mô tả), `BETA.md`, `APP-REVIEW-RISKS.md` (ghi chú cho người duyệt), `README.md`, tên workflow, mock thiết kế (màn mở đầu và About) | Mình | Không |

**Thứ tự:** bước 0 và bước 1 làm song song. Bước 2–6 làm được ngay sau bước 1, vì đều chưa công khai. **Chỉ phát hành lên App Store sau khi bước 0 xác nhận tên không vướng nhãn hiệu của ai.**

## Rủi ro nhỏ cần biết
- **Người thử beta hiện tại** sẽ thấy app đổi tên. Dữ liệu (thành phố, gia đình) không mất vì bundle ID giữ nguyên.
- **Siri:** câu cũ "… in ShubhPanchang" ngừng chạy. App Shortcuts tự đăng ký câu mới, không cần người dùng làm gì.
- **"Divo" là thương hiệu mới**, chưa ai biết. Phần "Gujarati Vrat & Panchang" trong tên và banner trên website (nơi có lượng truy cập sẵn) sẽ bù cho việc đó.
- **Nếu bước 0 phát hiện "DIVO" đã bị đăng ký trong nhóm 9 hoặc 42,** dừng lại và chọn phương án khác. Lúc đó chỉ phải đổi lại chữ ở bước 2 và 6, không có gì khó gỡ.

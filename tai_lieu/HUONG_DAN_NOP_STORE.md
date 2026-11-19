# Nộp lên Microsoft Store — từng bước

Trang này chỉ việc **anh** bấm, theo thứ tự. Gói đã dựng xong:
`tai_lieu\ChaoEmCuaSoTamHon-2.1.3-x64.msix` — 4 654 094 B, 8 mục, đóng bằng `makeappx` của Windows
(sha256 `65B75D94CAF631F945ED170B4206BD93622355BCF843096255328D0B8FFDD894`).

## Cần có trước

- **Tài khoản Partner Center** tại <https://partner.microsoft.com>. Đăng ký tài khoản cá nhân có phí
  một lần; trang đăng ký hiện con số chính xác tại thời điểm anh mở. Đây là việc chỉ anh làm được —
  nó gắn với danh tính và thanh toán của anh.
- **Gói MSIX** ở trên. Đây là gói *chưa ký* — đúng như Store yêu cầu: Store ký khi duyệt.
- **Ảnh chụp màn hình** ít nhất 1366×768, định dạng PNG. Bốn ảnh đã có trong `tai_lieu\anh\`.

## Bước 1 — Giữ tên ứng dụng

1. Đăng nhập Partner Center → **Windows & Xbox** (hoặc **Apps and games**, tuỳ giao diện) → **Create a
   new app** → **Reserve a name**.
2. Đặt tên: `Chào em cửa sổ tâm hồn`. Nếu tên đã có người giữ, thêm hậu tố, ví dụ
   `Chào em cửa sổ tâm hồn - nhắc nghỉ mắt`.

Tên này là tên hiển thị trên Store, và nó quyết định **hai giá trị** ở bước sau.

## Bước 2 — Lấy Product identity và dựng lại gói

Trong trang sản phẩm, mở **Product identity** (có khi nằm dưới **App management**). Nó cho hai dòng:

    Package/Identity/Name         (dạng: 12345Publisher.ChaoEmCuaSoTamHon)
    Package/Identity/Publisher    (dạng: CN=1A2B3C4D-....)

Chạy lại script đóng gói với đúng hai giá trị đó:

```powershell
cd D:\nguyen_ai_dan\van_lang\bao_ve_cua_so_tam_hon
pwsh -NoProfile -File dan_chu\dong-goi-store.ps1 `
  -IdentityName "<Package/Identity/Name>" `
  -Publisher "<Package/Identity/Publisher>" `
  -PublisherDisplayName "<tên nhà phát hành hiện trên Store>"
```

Script in ra đường dẫn, dung lượng, và sha256 của gói mới. **Phải dùng gói vừa dựng lại**, không dùng
gói cũ: gói cũ mang identity giả và sẽ bị từ chối ngay khi tải lên, với thông báo không chỉ rõ chỗ sai.

## Bước 3 — Tải gói lên

1. Trong trang sản phẩm: **Packages** → **Add a package** (hoặc **Upload package**).
2. Chọn `tai_lieu\ChaoEmCuaSoTamHon-<version>-x64.msix`.
3. Chờ Partner Center kiểm tra. Nếu nó báo lỗi, lỗi thường là: identity không khớp (bước 2), thiếu ảnh
   trong `Assets`, hoặc version đã tồn tại — sửa rồi tải lại, không cần làm lại từ đầu.

## Bước 4 — Hồ sơ cửa hàng (Store listing)

| Mục | Điền gì |
| --- | --- |
| Description | Ba đoạn: app làm gì; quy tắc 20-20-20 là gì; app không gửi gì ra ngoài. Có thể lấy từ `README.md` |
| Screenshots | 4 ảnh trong `tai_lieu\anh\`, thứ tự: Hôm nay → Cài đặt → Giới thiệu → màn hình nghỉ |
| Category | **Health & fitness** (hoặc **Personal care**) |
| Supported languages | Tiếng Việt (vi-VN) |
| Age rating | Bảng câu hỏi IARC; app không có nội dung người lớn, không mua bán trong app, không quảng cáo |
| Privacy policy | Không bắt buộc nếu app không thu thập dữ liệu; nếu ô này bắt buộc, ghi một trang ngắn: app không gửi dữ liệu nào ra ngoài máy người dùng |

Ba câu hỏi chắc chắn bị hỏi, và câu trả lời đúng với app này:

- *App có truy cập mạng không?* — **Không**.
- *App có thu thập dữ liệu cá nhân không?* — **Không**.
- *App có cần quyền quản trị không?* — **Không**.

## Bước 5 — Giá và thị trường

- **Giá**: miễn phí.
- **Thị trường**: chọn tất cả, hoặc chỉ Việt Nam nếu anh muốn thử trước.

## Bước 6 — Gửi duyệt

**Submit for certification**. Thời gian duyệt thường 1–3 ngày làm việc. Kết quả về qua email và trong
trang sản phẩm; nếu bị từ chối, lý do được ghi rõ và anh sửa rồi gửi lại — không mất phí thêm.

## Bốn điều phải biết trước khi nộp

1. **Identity phải khớp tuyệt đối.** `Name` và `Publisher` trong gói phải bằng đúng hai giá trị Partner
   Center cấp. Đây là lỗi số một của lần nộp đầu.
2. **MSIX chạy trong hộp cát hồ sơ người dùng.** Bản cài bằng NSIS ghi vào
   `%APPDATA%\vn.xinchaotamhon.chaoem`; bản MSIX ghi vào thư mục riêng của gói. Nghĩa là người đã dùng
   bản cũ sẽ **bắt đầu lại từ cài đặt mặc định** khi chuyển sang bản Store. Đây là hành vi của MSIX,
   không phải lỗi — và là lý do nên nói rõ trong phần mô tả nếu sau này phát hành cả hai kênh.
3. **WebView2 là thứ app cần để vẽ giao diện.** Máy Windows 10/11 có Microsoft Edge là có sẵn; máy nào
   bị gỡ Edge/WebView2 thì app không mở được. Store không cài hộ thành phần này.
4. **Gói chưa ký không cài được bằng tay.** Bấm đúp vào `.msix` trên máy sẽ ra `0x800B0109` — đúng như
   thiết kế, vì chỉ Store ký. Muốn thử cài trên máy mình trước khi nộp thì cần một chứng chỉ tự ký và
   tin nó trên máy đó; nói tôi biết nếu anh muốn đi đường đó.

## Sau khi được duyệt

Mỗi bản mới: tăng `version` trong `package.json` và `src-tauri\tauri.conf.json` → `npm run tauri build`
→ chạy lại `dan_chu\dong-goi-store.ps1` với **cùng** identity → tải gói mới lên. Version trong MSIX phải
lớn hơn bản đã duyệt, nếu không Partner Center từ chối.

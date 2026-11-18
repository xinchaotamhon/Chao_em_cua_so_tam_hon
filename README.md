# Chào em cửa sổ tâm hồn

Một chương trình nhắc nghỉ mắt cho Windows, viết cho người ngồi trước màn hình cả ngày.

Cứ hết một chặng làm việc, nó phủ kín màn hình trong vài chục giây, đếm ngược, và đưa ra một động tác
để mắt và vai được nghỉ. Hết giờ thì tự đóng, không cần bấm gì.

Đó là quy tắc 20-20-20: mỗi 20 phút, nhìn một vật cách xa khoảng 6 mét trong 20 giây.

## Có gì

- **Nhắc đúng giờ.** Đồng hồ đếm chạy trong Rust, không phải trong trình duyệt, nên cửa sổ bị ẩn hay
  thu nhỏ vẫn không làm nó trễ.
- **Màn hình nghỉ toàn màn hình** với vòng tròn đếm ngược và một hình vẽ chuyển động cho mỗi động tác:
  nhìn ra xa, chớp mắt chậm, nhìn gần rồi nhìn xa, thả lỏng vai, đứng lên.
- **Nhiều phiên trong ngày.** Tối đa 3 phiên, mỗi phiên có thời gian làm việc và thời gian nghỉ riêng.
  Thời gian nghỉ nhập bằng phút và giây.
- **Ảnh nền và âm thanh riêng** cho màn hình nghỉ, hoặc dùng chuông có sẵn.
- **Chế độ nghiêm khắc**: không có nút bỏ qua, không đóng được màn hình nghỉ.
- **Nằm dưới khay hệ thống** cạnh đồng hồ, tự chạy khi đăng nhập Windows nếu bạn muốn.
- **Không mạng, không tài khoản, không quảng cáo.** App không gửi gì ra ngoài máy bạn.

## Cài

1. Tải file zip ở mục **Releases** của kho này.
2. Giải nén ra Desktop hoặc Downloads — đừng chạy ngay trong file nén.
3. Bấm đúp vào file `..._x64-setup.exe`.

Windows sẽ hiện bảng xanh *"Windows protected your PC"* vì bản này chưa mua chứng chỉ ký số. Bấm
*More info* → *Run anyway* là xong. Trang `HUONG_DAN_CAI_DAT.html` trong zip nói rõ từng bước, bằng
tiếng Việt.

## Tự dựng từ mã nguồn

Cần Node 22 và Rust (stable). Trên Windows, đặt các biến môi trường để bản dựng không ghi vào ổ C:

```powershell
$env:CARGO_HOME = "<ổ>\<đường dẫn>\cargo"
$env:RUSTUP_HOME = "<ổ>\<đường dẫn>\rustup"
$env:TMP = $env:TEMP = "<ổ>\<đường dẫn>\tmp"
npm install
npm run tauri build
```

Kết quả:

- `src-tauri\target\release\chao-em-cua-so-tam-hon.exe`
- `src-tauri\target\release\bundle\nsis\Chào em cửa sổ tâm hồn_<version>_x64-setup.exe`

Cấu trúc: `src\` là giao diện (React + Tailwind), `src-tauri\` là phần lõi (Rust, đồng hồ đếm, khay hệ
thống, cửa sổ nghỉ). `dan_chu\` ghi lại vì sao mọi thứ ở đây như nó đang là.

## Giấy phép và nguồn gốc

Giấy phép MIT — xem [LICENSE.txt](LICENSE.txt).

Đây là bản dựng lại từ [blink-eye](https://github.com/nomandhoni-cs/blink-eye) của nomandhoni-cs, lấy ở
commit `0e440e7c9e` — commit cuối cùng còn giấy phép MIT.

- Chữ **Be Vietnam Pro**, giấy phép SIL Open Font License 1.1.
- Phương pháp thiết kế **unslop** của Damir Sokolovsky, CC BY 4.0.

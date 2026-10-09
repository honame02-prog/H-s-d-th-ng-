# Hồ Sơ Dị Thường — Phaser Assets v3

Bộ assets nền cho game kinh dị đô thị 2D có di chuyển, điều tra và ngự quỷ. Phong cách dựa trên bảng mẫu đã được duyệt: hiện thực đô thị cũ, ánh sáng lạnh, góc nhìn cao hơi nghiêng. Không phải bản game hoàn thiện.

## Hai gói tải về

Giải nén CẢ HAI file `DiThuong-Phaser-Assets-v3-Core.zip` và `DiThuong-Phaser-Assets-v3-Audio-Reference.zip` vào cùng một thư mục. Hai ZIP cùng có thư mục gốc `DiThuong-Phaser-Assets-v3` và chứa các file bổ sung cho nhau, không cần ghép nhị phân. Gói Core chứa ảnh/atlas, dữ liệu, tài liệu và preview. Gói Audio-Reference bổ sung WAV và bảng phong cách đã duyệt. Cả hai được giữ dưới20MB để thuận tiện đưa sang Claude.

## Có trong bộ

- Hai nhân vật điều tra nam/nữ: 4 hướng × 6 frame đi bộ; ảnh idle từng hướng; 16 tư thế tương tác/dùng năng lực trên atlas chung.
- Bốn quỷ nguyên bản: Bà lão, Kẻ Canh Cửa, Khách Mưa, Cô Dâu Giấy. Mỗi quỷ có 4 hướng × 4 trạng thái riêng, có alpha. Các trạng thái là ảnh tĩnh, KHÔNG phải vòng đi bộ của quỷ.
- 16 nền vật liệu sàn; 16 module kiến trúc ban đầu và một tường dọc bổ sung; 16 đồ vật và cặp đóng/mở cửa, hộp vàng.
- 16 vật liệu UI, 9 panel trống chữ có thông số nine-slice, 24 icon SVG.
- 4 ảnh chứng cứ, dùng trong hồ sơ; không dùng làm bản đồ di chuyển.
- 8 VFX × 16 frame; 14 WAV tổng hợp gốc, gồm 3 ambience.
- 3 bố cục map mẫu: chung cư tầng 3, trạm hồ sơ, sân chung cư. Có vị trí vật thể, va chạm, cửa, spawn, ánh sáng và dấu vết. Đây là schema JSON riêng, KHÔNG phải định dạng Tiled.
- Manifest, danh mục CSV, metadata atlas, animation registry, helper Phaser và trang kiểm tra assets.

## Xem trước

Giải nén. Tại thư mục gốc của bộ assets, chạy:

```sh
python -m http.server 8000
```

Mở `http://localhost:8000/preview/`. Trang có danh mục ảnh, vòng đi bộ, trạng thái quỷ, kiểm tra di chuyển/va chạm/cửa và âm thanh. Điện thoại có nút hướng trên trang; nếu mở từ thiết bị khác thì dùng địa chỉ của máy phục vụ và cấu hình mạng phù hợp. Không mở HTML qua `file://`, vì trình duyệt chặn fetch JSON.

## Đưa vào repo Claude Code

Đặt các thư mục `assets`, `data` và file `manifest.json` trong `public/di-thuong/` của repo web. Đặt helper trong `integration/phaser-assets.js` vào phần source theo cấu trúc repo. Base URL mặc định `/di-thuong/`. Không cần đưa `preview`, `source-art` hoặc tài liệu lên game nếu không dùng.

1. Đọc `docs/CLAUDE_ASSET_BRIEF.md` trước khi tích hợp.
2. Dùng atlas PNG + JSON có tên frame; không chia PNG nguồn theo lưới giả định.
3. Dùng `data/animations.json` để đăng ký animation. Dùng `data/maps/*.json` qua adapter hoặc chuyển đổi sang Tiled một cách tường minh.
4. Xây gameplay bằng Phaser; UI hồ sơ có thể dùng React. Không dùng portrait làm nhân vật đi trên bản đồ.
5. Kiểm tra trên điện thoại thực trước khi chốt kích thước và performance.

## Quy cách quan trọng

- Player: frame128×192, origin(.5,.94), scale mẫu .5, collider chân khoảng20×12 pixel thế giới.
- Quỷ: frame192×256, origin(.5,.94), scale mẫu khoảng .4. Không suy ra collider từ kích thước cả người.
- Hướng: `south`, `west`, `east`, `north`. Trạng thái: `dormant`, `manifested`, `pursuing`, `restrained`.
- Sàn: ảnh256×256 được hiển thị64×48 trong map mẫu. Góc nhìn là oblique với lưới hình chữ nhật; không phải isometric hình thoi.
- Module/đồ vật: PNG256×256 với khoảng alpha; kích thước hiển thị tham khảo trong map JSON. Tường dọc riêng128×512.
- PNG của quỷ và nhân vật có alpha thật. Ánh sáng, bóng, vignette và thứ tự vẽ cần xử lý ở engine.
- Panel không có chữ cố định. Render văn bản tiếng Việt ở runtime bằng font của dự án.
- VFX dùng NORMAL blend mặc định; thử screen/add có kiểm soát với riêng các hiệu ứng sáng.
- Audio là hiệu ứng tổng hợp, không phải thu âm hiện trường. Bật audio sau thao tác người chơi; âm lượng khởi đầu thấp, ambience có fade ở hai đầu để lặp ít tiếng click.

## Phạm vi và giới hạn

Đây là bộ nền cho ba bối cảnh và bốn thực thể đã liệt kê, không phải toàn bộ assets cho mọi chương, thành phố hay cơ chế sẽ được phát triển trong tương lai. Nhân vật có vòng đi bộ; các hành động dùng năng lực/tương tác là tư thế tĩnh để phối hợp VFX, chưa có clip hành động nhiều frame. Quỷ có hình cho từng trạng thái và hướng, chưa có vòng chạy/đi riêng.

Art được tạo bằng imagegen tích hợp, sau đó xuất kỹ thuật: tách alpha, crop, đồng nhất điểm đặt chân, resize và đóng atlas. Không có nội suy animation bằng AI. Gait ngắn còn có thể có thay đổi nhỏ ở vải/chi tiết; bản xem trước giúp kiểm tra trước khi mở rộng. Vật liệu sàn không được cam kết seamless hoàn hảo. Maps là bố cục kiểm tra module và va chạm, cần tiếp tục dựng level, ánh sáng và tương tác để đạt cảnh hoàn thiện như bảng phong cách.

Quỷ trong bộ là thiết kế nguyên bản cho game lấy cảm hứng cơ chế truyện; không phải hình nhân vật chính thức của *Thần Bí Phục Tô*. Không kèm font, sample âm thanh, engine hay assets thương mại bên thứ ba.

Kiểm tra đã thực hiện được ghi trong `docs/QA_REPORT.json`. Manifest chứa checksum và kích thước mỗi asset.

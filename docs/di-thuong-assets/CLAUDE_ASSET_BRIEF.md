# Brief cho Claude Code

Tích hợp bộ này vào game Phaser + TypeScript; React dành cho UI quản lý. Giữ phong cách đô thị cũ, vật liệu hiện thực, màu lạnh, tránh hiệu ứng fantasy rực rỡ. Đọc manifest, README, animation registry và map schema trước khi dùng.

## Quy tắc tích hợp

1. PNG atlas được đóng lại với frame names trong JSON. Không sử dụng grid của ảnh nguồn vì layout AI không hoàn toàn đều.
2. Player có 4 hướng, 6 frame đi bộ/hướng, chơi7fps. Idle là frame đầu và không lặp animation. Foot origin(.5,.94) và độ sâu theo Y chân.
3. `player_actions` chứa tư thế tĩnh `south_male_interact`, `south_male_ability`, tương tự cho female và ba hướng còn lại. Đổi sang texture đi bộ khi di chuyển lại.
4. Ghost atlas có 16 ảnh = 4 hướng × 4 trạng thái. KHÔNG lặp qua các trạng thái như một animation; `pursuing` là tư thế tĩnh để engine di chuyển. Có thể thêm chuyển động nhẹ ở runtime, nhưng không gọi đó là animation đi bộ đã có.
5. Chỉ VFX và walk registry trong animations.json là animation nhiều frame. Bật/tắt hiệu ứng theo sự kiện. Không dùng VFX làm cảnh báo lộ toàn bộ quy luật.
6. Map JSON là schema `di-thuong-map/1`, pixel coordinates, không phải Tiled. Collision do tác giả bố cục chỉ định, không dùng alpha silhouette làm collider. Cửa có collider bật/tắt độc lập với visual.
7. Preview PNG của map chỉ để xem. Gameplay phải dựng các layers và objects từ JSON để cửa/đồ vật có thể thay đổi.
8. Ánh sáng trong data là vị trí gợi ý; cần triển khai ánh sáng ở engine. `flickerAllowed:false` là mặc định. Cung cấp tùy chọn giảm hiệu ứng, không nhấp nháy nhanh.
9. UI panel trống chữ, icon SVG. Giữ chữ tiếng Việt rõ trên điện thoại, hit area khoảng44CSSpx trở lên. Chọn font của dự án, không thêm font bản quyền không rõ nguồn.
10. Audio cần unlock sau tương tác của người chơi, ambience loop và các SFX phát có kiểm soát. Không tự phát tất cả âm thanh cùng lúc.

## Gameplay cần xây riêng

Điều tra → kiểm chứng quy luật → dùng năng lực chịu giá phục tô → áp chế/giam giữ hoặc rút lui. Quỷ không dùng thanhHP để quyết định bị giết. Người chơi trực tiếp di chuyển, đọc vật chứng, đổi vị trí và sử dụng năng lực. Idle dành cho chuẩn bị và hậu cần. Bộ assets không cung cấp AI, save system, điều kiện sát nhân hoặc hệ thống ngự quỷ đã chạy sẵn.

## Lộ trình đầu

Chỉ tích hợp map chung cư, nhân vật nam và quỷ bà lão trước; kiểm tra đi4hướng, collision chân, đổi cửa, occlusion và âm thanh. Sau đó bổ sung nhân vật nữ, ba quỷ còn lại, UI hồ sơ, VFX. Chạy build và kiểm tra trên điện thoại. Báo cáo thiếu sót cụ thể; không báo hoàn thiện chỉ vì load được hình.

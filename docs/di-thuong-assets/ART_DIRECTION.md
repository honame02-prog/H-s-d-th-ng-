# Quy chuẩn hình ảnh v3

Chuẩn đã duyệt: bảng mẫu trong `source-art/style-approved.png`.

Đô thị hiện đại cũ, hiện thực sơn vẽ2D, chất liệu sần nhưng silhouette rõ. Ánh sáng huỳnh quang lạnh, bụi, ẩm và sinh hoạt đời thường. Màu concrete/sage/dampBrown/dirtyIvory, danger red dùng ít; vàng dành cho công cụ giam giữ. Camera cao oblique, không chuyển sang portrait làm sprite gameplay.

Horror progression: cảnh bình thường có chi tiết sai → dấu vết tiến gần → hiện hình/truy đuổi → bị áp chế nhưng chưa an toàn. Mỗi thực thể giữ bất thường nhận diện riêng. Không dùng khuôn mặt biến dạng giống nhau cho tất cả quỷ. Không thêm giáp, phép thuật fantasy, neon hay chibi.

## Prompt specification dùng cho tạo ảnh tích hợp

Shared: cold aged realist painted2D urban horror; faded sage plaster, concrete gray, damp brown, dirty ivory, restrained crimson; sharp readable game silhouettes; elevated orthographic55degree topdown oblique; style reference only; no anime/cartoon/glamour/fantasy armor/neon/watermark.

- Floor tiles: 4×4 square material atlas; straight-down view, edge-to-edge. Rows worn gray small-square tiles, dusty beige tiles, damp bathroom tiles, cracked concrete. No walls, no objects, even illumination.
- Structure atlas: 4×4 isolated alpha modules: horizontal/vertical wall, corner,column; closed/open door, closed/open grille; fluorescent,window,meter,bulb; stairs,horizontal/vertical rail,elevator. Full objects, consistent camera, transparent padding.
- Vertical wall correction: one isolated long north-south wall, parallel long edges, visible top ridge and narrow side face, peeling green/ivory plaster, no pipes/meters/pedestals/floor, flat ends suitable for repeating.
- Prop atlas:4×4 alpha objects: bed,shoe rack,sofa,table; fridge,sink,CRT,wardrobe; recorder,evidence envelope,gold box closed/open; flashlight,telephone,raincoat stand,dead plant. Gold industrial heavy metal, no magical runes.
- Male walk: 6 columns×4 direction rows south/west/east/north; consecutive natural gait, ordinary investigator graybrown jacket/offwhite shirt/dark trousers/black shoes/bag; fixed size/identity/baseline; alpha background, no shadows.
- Female walk: same layout/camera; practical ponytail,gray utilityjacket,ivory shirt,dark trousers,black shoes,evidence bag; six successive walking poses per row.
- Actions:4×4 alpha poses; rows south/west/east/north; columns male interact,male ability,female interact,female ability. Reach to inspect at waist level or raise open hand guardedly. Match exact identities/outfits from walks; no VFX or props baked in.
- Ghost atlases:4×4 alpha; rows south/west/east/north; columns dormant/manifested/pursuing/restrained. Same identity across states. Elder floral dress/barefeet/sideways elongated neck; Door Watcher ragged worker coat/mouth containing screaming face/long fingers; Rain Guest hollow wet coat/vertical face void; Paper Bride old ivory foldedpaper robe/torn mask/black hollows. No gore, glamour or armor.
- UI materials:4×4 flat edge-to-edge textures; aged ivory paper,kraft paper,charcoal metal,faded sage material; lowcontrast, no baked text or objects.
- Evidence:2×2 scene images from apartment: wet footprints ending at door; empty bedroom with mirror-only figure; rain entrance with faceless coat silhouette; empty bathroom with sideways elderly head in mirror. No text/borders/gore; not gameplay maps.

Nguồn generation: imagegen tích hợp. Code chỉ thực hiện xuất kỹ thuật ảnh nguồn; icons, temporal VFX và audio được tạo gốc bằng code. Tài liệu này giữ đặc tả để mở rộng, không bảo đảm hai lần generation cho kết quả pixel giống hệt nhau.

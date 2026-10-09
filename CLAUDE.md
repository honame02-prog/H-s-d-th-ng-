# Hồ Sơ Dị Thường — hướng dẫn cho Claude Code

Game kinh dị đô thị 2D (điều tra → kiểm chứng quy luật → ngự quỷ). Gameplay bằng **Phaser 3**, UI quản lý/hồ sơ bằng **React**, viết bằng **TypeScript**, build bằng **Vite**, deploy lên **Cloudflare Workers** (static assets).

## Lệnh

```sh
npm install
npm run dev        # http://localhost:5173  (?debug để vẽ collider + phím G đổi trạng thái quỷ)
npm run build      # tsc -b && vite build → dist/
npm run typecheck
npm run preview    # phục vụ dist/ để kiểm tra bản build
```

Chưa có test tự động; trước khi push tối thiểu phải `npm run build` sạch.

## Cấu trúc

```
public/di-thuong/          Bộ assets v3 (KHÔNG sửa tay; thay bằng bản mới từ ZIP)
  manifest.json            Danh mục asset, kích thước, checksum
  assets/                  PNG/atlas JSON/SVG/WAV
  data/                    animations.json, ghosts.json, palette.json, maps/*.json
docs/di-thuong-assets/     README, CLAUDE_ASSET_BRIEF, ART_DIRECTION, helper JS tham chiếu
src/game/                  Phaser
  assets.ts                Tải manifest → chỉ xếp hàng asset lát cắt hiện tại cần; đăng ký animation
  mapBuilder.ts            Dựng map từ JSON `di-thuong-map/1` (sàn RenderTexture, object, collider, cửa)
  entities/Player.ts       Nhân vật: 4 hướng, đi bộ 7fps, idle = frame 0, tư thế tương tác tĩnh
  entities/ElderGhost.ts   Quỷ bà lão: 16 ảnh tĩnh (hướng × trạng thái)
  scenes/                  Boot (JSON) → Preload (asset) → Apartment (gameplay)
  audio.ts                 Âm thanh chỉ bật sau "Bắt đầu"
  bus.ts                   Event bus có kiểu giữa Phaser và React
  virtualInput.ts          Vector joystick cảm ứng (React ghi, Phaser đọc)
  evidence.ts              Nội dung hồ sơ vật chứng
src/ui/                    React: App (HUD, màn hình bắt đầu), Joystick, DossierModal
```

## Quy tắc bắt buộc với assets (tóm tắt từ docs/di-thuong-assets/CLAUDE_ASSET_BRIEF.md)

- Dùng atlas PNG + JSON theo **tên frame**; không cắt PNG theo lưới.
- Map là schema riêng `di-thuong-map/1` (pixel), **không phải Tiled**. Dựng từ JSON; **không** dùng `preview/*.png` làm nền.
- Va chạm lấy từ `colliders`/`doors[].rect` trong map; không suy từ alpha. Cửa: collider bật/tắt độc lập với visual.
- Player: frame 128×192, origin (.5,.94), scale .5, collider chân 20×12 thế giới (`setSize(40,24).setOffset(44,156)` ở pixel nguồn). Depth = Y chân.
- Quỷ: frame 192×256, origin (.5,.94), scale ≈.4, collider chân nhỏ. Trạng thái `dormant|manifested|pursuing|restrained` là **ảnh tĩnh**, không lặp như animation; chưa có vòng đi bộ của quỷ.
- Chỉ walk và VFX trong `animations.json` là animation nhiều frame.
- Ánh sáng trong data là gợi ý; `flickerAllowed:false` → không nhấp nháy.
- Panel UI không có chữ; render tiếng Việt runtime bằng font hệ thống (không thêm font bản quyền không rõ). Hit area ≥ 44 CSS px.
- Audio: chỉ phát sau tương tác người chơi, âm lượng thấp, không phát mọi thứ cùng lúc.
- Quỷ là thiết kế nguyên bản, không phải nhân vật chính thức của *Thần Bí Phục Tô*.

## Quy ước code

- Phaser không import React và ngược lại; giao tiếp qua `bus` (thêm event mới vào `BusEvents`).
- Hằng số quy cách (scale, collider, bán kính) đặt trong `src/game/constants.ts`.
- Chữ hiển thị cho người chơi bằng tiếng Việt; comment có thể tiếng Việt.
- Khi thêm asset vào lát cắt, thêm key vào `FIRST_SLICE_KEYS` (hoặc tách danh sách theo scene) thay vì tải toàn bộ manifest — quan trọng cho điện thoại.
- `public/_headers` đặt cache cho Cloudflare; asset không có hash nên chỉ cache 1 ngày.

## Trạng thái hiện tại (lát cắt nền)

Đã có: map chung cư tầng 3 dựng từ JSON; nhân vật nam WASD/mũi tên + joystick; animation 4 hướng; va chạm chân; camera theo nhân vật (zoom theo kích thước màn hình); 6 cửa mở/đóng cập nhật collider (không đóng khi có vật cản trong khung); làm mờ vật che khuất; một vật chứng (`footprints`) mở hồ sơ React; đọc xong → quỷ bà lão `dormant → manifested`, lại gần → `pursuing`, ra xa → `manifested`; âm thanh bật sau nút "Bắt đầu điều tra", nút tắt tiếng.

Chưa có: AI/di chuyển của quỷ, điều kiện sát nhân, năng lực & giá phục tô, giam giữ (`restrained` chỉ qua phím debug G), save, nhân vật nữ, 3 quỷ còn lại, map trạm hồ sơ và sân, clue `mirror`, ánh sáng động thật sự (hiện chỉ là quầng sáng tĩnh + vignette), tuỳ chọn giảm hiệu ứng, kiểm tra trên điện thoại thật.

## Deploy Cloudflare

- Worker `h-s-d-th-ng` (Workers Builds nối Git): build `npm run build`, deploy `npx wrangler deploy`.
- `wrangler.toml` dùng `[assets] directory = "./dist"`, không phải cấu hình Pages (`pages_build_output_dir` sẽ làm `wrangler deploy` lỗi). `name` phải trùng tên Worker.
- Kiểm tra cấu hình trước khi push: `npm run build && npx wrangler deploy --dry-run`.

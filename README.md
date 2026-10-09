# Hồ Sơ Dị Thường

Game kinh dị đô thị 2D chơi trên trình duyệt: điều tra vật chứng, kiểm chứng quy luật của thực thể dị thường và tìm cách áp chế. React + TypeScript + Vite + Phaser 3.

> Trạng thái: **bản dựng nền** — một tầng chung cư, một nhân vật, một vật chứng, một thực thể. Chưa phải gameplay hoàn chỉnh.

## Chạy

Yêu cầu Node 20+ (khuyến nghị 22, xem `.nvmrc`).

```sh
npm install
npm run dev
```

Mở địa chỉ Vite in ra (mặc định `http://localhost:5173`). Để thử trên điện thoại cùng mạng LAN, dùng địa chỉ `Network:` mà Vite in ra.

Build và xem bản production:

```sh
npm run build
npm run preview
```

## Điều khiển

| | Bàn phím | Cảm ứng |
|---|---|---|
| Di chuyển | WASD / phím mũi tên | Joystick góc trái dưới |
| Tương tác (cửa, vật chứng) | E / Space / Enter | Nút bàn tay góc phải dưới |
| Đóng hồ sơ | Esc | Nút "Đóng hồ sơ" |

Thêm `?debug` vào URL để vẽ collider và bật phím **G** đổi vòng trạng thái quỷ.

## Deploy lên Cloudflare Pages

**Qua Git (dashboard):** Workers & Pages → Create → Pages → Connect to Git → chọn repo.

- Framework preset: `None` (hoặc `Vite`)
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION` = `22`

**Thủ công bằng Wrangler:**

```sh
npm run build
npx wrangler pages deploy   # dùng wrangler.toml (pages_build_output_dir = "dist")
```

`public/_headers` cấu hình cache: bundle JS/CSS có hash cache vĩnh viễn; assets trong `/di-thuong/assets/` cache 1 ngày.

## Assets

Bộ *DiThuong Phaser Assets v3* nằm trong `public/di-thuong/` (manifest, `assets/`, `data/`). Tài liệu gốc ở `docs/di-thuong-assets/`. Map được dựng từ JSON; ảnh preview của map không được dùng làm nền. Audio là hiệu ứng tổng hợp gốc. Quỷ là thiết kế nguyên bản.

Xem `CLAUDE.md` cho kiến trúc và quy tắc tích hợp.

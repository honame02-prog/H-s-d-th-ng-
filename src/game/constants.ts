/** URL gốc của bộ assets trong `public/di-thuong/`. Tôn trọng `base` của Vite. */
export const ASSET_BASE = `${import.meta.env.BASE_URL}di-thuong/`;

export const MAP_KEY = 'apartment_3f';

/** Quy cách từ README assets. */
export const PLAYER = {
  texture: 'player_male_walk',
  actionTexture: 'player_actions',
  gender: 'male',
  scale: 0.5,
  origin: { x: 0.5, y: 0.94 },
  /** Pixel nguồn TRƯỚC scale: 40×24 → collider chân 20×12 trong thế giới. */
  body: { width: 40, height: 24, offsetX: 44, offsetY: 156 },
  speed: 120,
} as const;

export const GHOST = {
  id: 'ghost_elder',
  scale: 0.4,
  origin: { x: 0.5, y: 0.94 },
  /** Khung 192×256; chân tại y≈241. Collider chân 20×12 thế giới = 50×30 nguồn. */
  body: { width: 50, height: 30, offsetX: 71, offsetY: 211 },
  /** Khoảng cách (thế giới) để chuyển manifested ↔ pursuing. */
  pursueRadius: 150,
  calmRadius: 230,
} as const;

/** Khoảng cách tối đa từ chân nhân vật đến vật thể để tương tác. */
export const INTERACT_RADIUS = 64;

export const DEPTH = {
  floor: -1000,
  decal: -900,
  lightGlow: -800,
} as const;

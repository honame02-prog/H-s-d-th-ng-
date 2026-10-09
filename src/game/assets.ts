import Phaser from 'phaser';
import { ASSET_BASE, MAP_KEY } from './constants';
import type { AnimationDef, DiThuongMap, Manifest, ManifestAsset } from './types';

export const MANIFEST_CACHE_KEY = 'dt_manifest';
export const ANIMATIONS_CACHE_KEY = 'dt_animations';
export const mapCacheKey = (id: string) => `dt_map_${id}`;

/** Atlas/âm thanh cần cho lát cắt đầu tiên (chung cư + nhân vật nam + quỷ bà lão). */
const FIRST_SLICE_KEYS = new Set([
  'player_male_walk',
  'player_actions',
  'ghost_elder',
  'vfx_manifestation',
  'vfx_evidence_ping',
  'ambience_hall',
  'footstep_tile',
  'door_creak',
  'evidence_pickup',
  'ui_paper',
  'manifestation',
  'ghost_approach',
]);

export const floorKey = (index: number) => `floor_tiles_${String(index).padStart(2, '0')}`;

/** Bước 1: tải manifest, animation registry và map JSON. */
export function queueBootData(load: Phaser.Loader.LoaderPlugin): void {
  load.json(MANIFEST_CACHE_KEY, ASSET_BASE + 'manifest.json');
  load.json(ANIMATIONS_CACHE_KEY, ASSET_BASE + 'data/animations.json');
  load.json(mapCacheKey(MAP_KEY), ASSET_BASE + `data/maps/${MAP_KEY}.json`);
}

/** Các key mà map dùng: sàn, module, đồ vật và texture mở cửa. */
function keysUsedByMap(map: DiThuongMap): Set<string> {
  const keys = new Set<string>();
  for (const row of map.floor) for (const i of row) keys.add(floorKey(i));
  for (const o of map.objects) keys.add(o.key);
  for (const d of map.doors) {
    keys.add(d.closedKey);
    keys.add(d.openKey);
  }
  return keys;
}

/**
 * Bước 2: xếp hàng các file ảnh/atlas/âm thanh thực sự cần. Atlas dùng PNG + JSON
 * có tên frame; không bao giờ cắt PNG theo lưới giả định. Bỏ qua ảnh preview map.
 */
export function queueSliceAssets(load: Phaser.Loader.LoaderPlugin, manifest: Manifest, map: DiThuongMap): string[] {
  const wanted = keysUsedByMap(map);
  FIRST_SLICE_KEYS.forEach((k) => wanted.add(k));
  const queued: string[] = [];
  const byKey = new Map<string, ManifestAsset>(manifest.assets.map((a) => [a.key, a]));
  for (const key of wanted) {
    const asset = byKey.get(key);
    if (!asset) throw new Error(`Manifest thiếu asset: ${key}`);
    if (asset.kind === 'map-preview') continue;
    const url = ASSET_BASE + asset.path;
    if (asset.atlas) load.atlas(asset.key, url, ASSET_BASE + asset.atlas);
    else if (asset.kind === 'audio') load.audio(asset.key, url);
    else if (asset.path.endsWith('.svg')) load.svg(asset.key, url);
    else load.image(asset.key, url);
    queued.push(key);
  }
  return queued;
}

/** Đăng ký animation từ `data/animations.json` cho các texture đã tải. */
export function registerAnimations(scene: Phaser.Scene): void {
  const defs = scene.cache.json.get(ANIMATIONS_CACHE_KEY) as AnimationDef[];
  for (const def of defs) {
    if (!scene.textures.exists(def.texture) || scene.anims.exists(def.key)) continue;
    scene.anims.create({
      key: def.key,
      frames: def.frames.map((frame) => ({ key: def.texture, frame })),
      frameRate: def.frameRate,
      repeat: def.repeat,
    });
  }
}

/** URL công khai cho React (ảnh chứng cứ, panel, icon). */
export function assetUrl(path: string): string {
  return ASSET_BASE + path;
}

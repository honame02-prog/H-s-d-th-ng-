/** Kiểu dữ liệu cho bộ assets DiThuong v3 (schema `di-thuong-map/1`, không phải Tiled). */

export type Direction = 'south' | 'west' | 'east' | 'north';
export const DIRECTIONS: readonly Direction[] = ['south', 'west', 'east', 'north'];

export type GhostState = 'dormant' | 'manifested' | 'pursuing' | 'restrained';
export const GHOST_STATES: readonly GhostState[] = ['dormant', 'manifested', 'pursuing', 'restrained'];

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapObject {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  origin: [number, number];
  depth: number;
  kind: 'wall' | 'prop' | 'door' | 'light' | string;
}

export interface MapDoor {
  id: string;
  /** Chỉ số trong `objects` của visual cửa. */
  objectIndex: number;
  rect: Rect;
  closedKey: string;
  openKey: string;
  initialState: 'closed' | 'open';
}

export interface MapSpawn {
  id: string;
  x: number;
  y: number;
}

export interface MapClue {
  id: string;
  x: number;
  y: number;
  evidenceKey: string;
}

export interface MapLight {
  x: number;
  y: number;
  radius: number;
  color: string;
  flickerAllowed: boolean;
}

export interface DiThuongMap {
  id: string;
  title: string;
  schema: 'di-thuong-map/1';
  tileWidth: number;
  tileHeight: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
  floor: number[][];
  objects: MapObject[];
  colliders: (Rect & { source?: string })[];
  doors: MapDoor[];
  spawns: MapSpawn[];
  clues: MapClue[];
  lights: MapLight[];
}

export interface ManifestAsset {
  key: string;
  path: string;
  kind: string;
  atlas?: string;
  width?: number;
  height?: number;
  loop?: boolean;
  frameNames?: string[];
  nineSlice?: { left: number; right: number; top: number; bottom: number };
}

export interface Manifest {
  version: string;
  assets: ManifestAsset[];
  animations: string;
  mapSchema: string;
}

export interface AnimationDef {
  key: string;
  texture: string;
  frames: string[];
  frameRate: number;
  repeat: number;
  blendMode?: string;
}

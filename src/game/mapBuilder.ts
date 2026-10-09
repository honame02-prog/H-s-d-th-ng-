import Phaser from 'phaser';
import { DEPTH } from './constants';
import { floorKey } from './assets';
import type { DiThuongMap, MapDoor, Rect } from './types';

export interface DoorRuntime extends MapDoor {
  closed: boolean;
  blocker: Phaser.GameObjects.Zone;
  sprite: Phaser.GameObjects.Image;
}

export interface BuiltMap {
  map: DiThuongMap;
  floor: Phaser.GameObjects.RenderTexture;
  objects: Phaser.GameObjects.Image[];
  blockers: Phaser.Physics.Arcade.StaticGroup;
  doors: DoorRuntime[];
  setDoor(id: string, closed: boolean): void;
}

/**
 * Dựng map từ JSON `di-thuong-map/1`. Sàn được "nướng" vào một RenderTexture (một draw call),
 * module/đồ vật là Image riêng với depth theo Y chân. Va chạm lấy từ `colliders` do tác giả bố cục,
 * không suy ra từ alpha. Cửa có collider bật/tắt độc lập với visual.
 */
export function buildMap(scene: Phaser.Scene, map: DiThuongMap): BuiltMap {
  if (map.schema !== 'di-thuong-map/1') throw new Error(`Schema map không hỗ trợ: ${map.schema}`);

  const { tileWidth: tw, tileHeight: th } = map;
  const floor = scene.add.renderTexture(0, 0, map.width, map.height).setOrigin(0).setDepth(DEPTH.floor);
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      const key = floorKey(map.floor[r][c]);
      const src = scene.textures.get(key).getSourceImage();
      floor.stamp(key, undefined, c * tw, r * th, {
        originX: 0,
        originY: 0,
        scaleX: tw / src.width,
        scaleY: th / src.height,
      });
    }
  }

  const objects = map.objects.map((o) =>
    scene.add
      .image(o.x, o.y, o.key)
      .setOrigin(o.origin[0], o.origin[1])
      .setDisplaySize(o.width, o.height)
      .setDepth(o.depth),
  );

  const blockers = scene.physics.add.staticGroup();
  const addBlocker = (rect: Rect) => {
    const zone = scene.add.zone(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height);
    scene.physics.add.existing(zone, true);
    blockers.add(zone);
    return zone;
  };
  map.colliders.forEach(addBlocker);

  const doors: DoorRuntime[] = map.doors.map((d) => {
    const sprite = objects[d.objectIndex];
    if (!sprite) throw new Error(`Cửa ${d.id} trỏ tới objectIndex không tồn tại`);
    return { ...d, closed: d.initialState === 'closed', blocker: addBlocker(d.rect), sprite };
  });

  const applyDoor = (door: DoorRuntime) => {
    (door.blocker.body as Phaser.Physics.Arcade.StaticBody).enable = door.closed;
    // Giữ nguyên displaySize khi đổi texture.
    const { displayWidth, displayHeight } = door.sprite;
    door.sprite.setTexture(door.closed ? door.closedKey : door.openKey).setDisplaySize(displayWidth, displayHeight);
  };
  doors.forEach(applyDoor);

  return {
    map,
    floor,
    objects,
    blockers,
    doors,
    setDoor(id, closed) {
      const door = doors.find((d) => d.id === id);
      if (!door) throw new Error(`Không có cửa: ${id}`);
      door.closed = closed;
      applyDoor(door);
    },
  };
}

export function rectCenter(rect: Rect): { x: number; y: number } {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

import Phaser from 'phaser';
import { MANIFEST_CACHE_KEY, mapCacheKey, queueSliceAssets, registerAnimations } from '../assets';
import { bus } from '../bus';
import { MAP_KEY } from '../constants';
import type { DiThuongMap, Manifest } from '../types';

export class PreloadScene extends Phaser.Scene {
  private failed: string[] = [];

  constructor() {
    super('preload');
  }

  preload(): void {
    const manifest = this.cache.json.get(MANIFEST_CACHE_KEY) as Manifest;
    const map = this.cache.json.get(mapCacheKey(MAP_KEY)) as DiThuongMap;
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => bus.emit('load:progress', p));
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => this.failed.push(file.key));
    try {
      queueSliceAssets(this.load, manifest, map);
    } catch (err) {
      bus.emit('load:error', (err as Error).message);
    }
  }

  create(): void {
    if (this.failed.length) {
      bus.emit('load:error', `Không tải được: ${this.failed.join(', ')}`);
      return;
    }
    registerAnimations(this);
    this.scene.start('apartment');
  }
}

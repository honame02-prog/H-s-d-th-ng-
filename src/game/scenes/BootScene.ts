import Phaser from 'phaser';
import { queueBootData } from '../assets';
import { bus } from '../bus';

/** Tải manifest, animation registry và map JSON trước khi xếp hàng ảnh/âm thanh. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) =>
      bus.emit('load:error', `Không tải được ${file.key}`),
    );
    queueBootData(this.load);
  }

  create(): void {
    this.scene.start('preload');
  }
}

import Phaser from 'phaser';
import { ApartmentScene } from './scenes/ApartmentScene';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0e1012',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: parent.clientWidth || window.innerWidth,
      height: parent.clientHeight || window.innerHeight,
    },
    render: { antialias: true, powerPreference: 'high-performance' },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: showPhysicsDebug() },
    },
    input: { activePointers: 3 },
    scene: [BootScene, PreloadScene, ApartmentScene],
  });
}

/** `?debug` vẽ collider để kiểm tra va chạm chân và cửa. */
function showPhysicsDebug(): boolean {
  return new URLSearchParams(window.location.search).has('debug');
}

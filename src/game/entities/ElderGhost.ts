import Phaser from 'phaser';
import { GHOST } from '../constants';
import { pickDirection } from './Player';
import { GHOST_STATES, type Direction, type GhostState } from '../types';

const STATE_TINT: Record<GhostState, number> = {
  dormant: 0xffffff,
  manifested: 0xffffff,
  pursuing: 0xffffff,
  restrained: 0xd8d2b0,
};

/**
 * Quỷ bà lão. Atlas có 16 ảnh TĨNH = 4 hướng × 4 trạng thái; không lặp các trạng thái như animation.
 * Chưa có AI di chuyển: lát cắt này chỉ đổi trạng thái và hướng nhìn.
 */
export class ElderGhost extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  ghostState: GhostState = 'dormant';
  facing: Direction = 'south';
  private sway?: Phaser.Tweens.Tween;
  private onChange: (state: GhostState) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, onChange: (state: GhostState) => void) {
    super(scene, x, y, GHOST.id, 'south_dormant');
    this.onChange = onChange;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(GHOST.origin.x, GHOST.origin.y).setScale(GHOST.scale);
    // Collider chân nhỏ, KHÔNG suy ra từ kích thước cả người.
    this.body.setSize(GHOST.body.width, GHOST.body.height).setOffset(GHOST.body.offsetX, GHOST.body.offsetY);
    this.body.setImmovable(true);
    this.body.pushable = false;
    this.setDepth(this.y);
    this.applyFrame();
  }

  setGhostState(state: GhostState): void {
    if (state === this.ghostState) return;
    this.ghostState = state;
    this.applyFrame();
    this.onChange(state);
  }

  /** Vòng qua 4 trạng thái (phím debug). */
  cycleState(): void {
    const next = GHOST_STATES[(GHOST_STATES.indexOf(this.ghostState) + 1) % GHOST_STATES.length];
    this.setGhostState(next);
  }

  faceTowards(x: number, y: number): void {
    const dir = pickDirection(x - this.x, y - this.y, this.facing);
    if (dir !== this.facing) {
      this.facing = dir;
      this.applyFrame();
    }
  }

  private applyFrame(): void {
    this.setFrame(`${this.facing}_${this.ghostState}`);
    this.setTint(STATE_TINT[this.ghostState]);
    // Chuyển động nhẹ ở runtime khi truy đuổi (không phải animation đi bộ).
    this.sway?.stop();
    this.sway = undefined;
    this.setScale(GHOST.scale);
    if (this.ghostState === 'pursuing') {
      this.sway = this.scene.tweens.add({
        targets: this,
        scaleY: GHOST.scale * 1.025,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}

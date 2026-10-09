import Phaser from 'phaser';
import { PLAYER } from '../constants';
import type { Direction } from '../types';

/**
 * Nhân vật điều tra: 4 hướng × 6 frame đi bộ (7fps), idle = frame đầu không lặp,
 * tư thế tương tác là ảnh tĩnh trên atlas `player_actions`.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  facing: Direction = 'south';
  private posing = false;
  private poseTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLAYER.texture, 'south_walk_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(PLAYER.origin.x, PLAYER.origin.y).setScale(PLAYER.scale);
    this.body.setSize(PLAYER.body.width, PLAYER.body.height).setOffset(PLAYER.body.offsetX, PLAYER.body.offsetY);
    this.body.setCollideWorldBounds(true);
    this.setDepth(this.y);
  }

  /** `vx, vy` trong [-1, 1]. Trả về true nếu đang di chuyển. */
  move(vx: number, vy: number): boolean {
    const len = Math.hypot(vx, vy);
    if (len < 0.15) {
      this.body.setVelocity(0, 0);
      this.showIdle();
      return false;
    }
    const scale = Math.min(1, len) / len;
    this.body.setVelocity(vx * scale * PLAYER.speed, vy * scale * PLAYER.speed);
    this.facing = pickDirection(vx, vy, this.facing);
    this.cancelPose();
    this.play(`${PLAYER.texture}_${this.facing}`, true);
    return true;
  }

  halt(): void {
    this.body.setVelocity(0, 0);
    this.showIdle();
  }

  /** Tư thế tĩnh khi tương tác; tự trả về texture đi bộ. */
  showInteractPose(durationMs = 450): void {
    this.cancelPose();
    this.anims.stop();
    this.posing = true;
    this.setTexture(PLAYER.actionTexture, `${this.facing}_${PLAYER.gender}_interact`);
    this.poseTimer = this.scene.time.delayedCall(durationMs, () => this.cancelPose());
  }

  /** Hướng mặt về một điểm (dùng khi tương tác). */
  face(x: number, y: number): void {
    this.facing = pickDirection(x - this.x, y - this.y, this.facing);
  }

  syncDepth(): void {
    this.setDepth(this.y);
  }

  private showIdle(): void {
    if (this.posing) return;
    if (this.anims.isPlaying) this.anims.stop();
    this.setTexture(PLAYER.texture, `${this.facing}_walk_0`);
  }

  private cancelPose(): void {
    this.poseTimer?.remove();
    this.poseTimer = undefined;
    if (this.posing) {
      this.posing = false;
      this.setTexture(PLAYER.texture, `${this.facing}_walk_0`);
    }
  }
}

/** Chọn hướng theo trục trội; giữ hướng cũ khi gần chéo 45° để tránh nhấp nháy sprite. */
export function pickDirection(dx: number, dy: number, current: Direction): Direction {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax === 0 && ay === 0) return current;
  const horizontal: Direction = dx < 0 ? 'west' : 'east';
  const vertical: Direction = dy < 0 ? 'north' : 'south';
  if (Math.abs(ax - ay) < 0.2 * Math.max(ax, ay) && (current === horizontal || current === vertical)) {
    return current;
  }
  return ax > ay ? horizontal : vertical;
}

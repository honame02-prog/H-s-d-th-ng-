import Phaser from 'phaser';

/** Âm lượng khởi đầu thấp theo brief. */
const VOLUME = {
  ambience: 0.22,
  footstep: 0.16,
  door: 0.35,
  pickup: 0.4,
  paper: 0.35,
  manifestation: 0.38,
  approach: 0.3,
} as const;

/**
 * Âm thanh chỉ bật sau khi người chơi bấm "Bắt đầu" (cử chỉ người dùng). Trước đó mọi lệnh phát bị bỏ qua.
 * Ambience lặp với fade vào/ra; SFX phát có kiểm soát, không chồng nhiều lần.
 */
export class AudioController {
  private enabled = false;
  private ambience?: Phaser.Sound.BaseSound;
  private lastStep = 0;

  constructor(private scene: Phaser.Scene) {}

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    const sound = this.scene.sound;
    const start = () => this.startAmbience();
    if (sound.locked) sound.once(Phaser.Sound.Events.UNLOCKED, start);
    else start();
  }

  setMuted(muted: boolean): void {
    this.scene.sound.mute = muted;
  }

  footstep(time: number): void {
    if (time - this.lastStep < 330) return;
    this.lastStep = time;
    this.play('footstep_tile', VOLUME.footstep, { detune: Phaser.Math.Between(-150, 150) });
  }

  door(): void {
    this.play('door_creak', VOLUME.door);
  }

  evidence(): void {
    this.play('evidence_pickup', VOLUME.pickup);
  }

  paper(): void {
    this.play('ui_paper', VOLUME.paper);
  }

  manifestation(): void {
    this.play('manifestation', VOLUME.manifestation);
  }

  approach(): void {
    this.play('ghost_approach', VOLUME.approach);
  }

  private play(key: string, volume: number, extra: Phaser.Types.Sound.SoundConfig = {}): void {
    if (!this.enabled || this.scene.sound.locked || !this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume, ...extra });
  }

  private startAmbience(): void {
    if (this.ambience || !this.scene.cache.audio.exists('ambience_hall')) return;
    this.ambience = this.scene.sound.add('ambience_hall', { loop: true, volume: 0 });
    this.ambience.play();
    this.scene.tweens.add({ targets: this.ambience, volume: VOLUME.ambience, duration: 2500 });
  }

  destroy(): void {
    this.ambience?.destroy();
  }
}

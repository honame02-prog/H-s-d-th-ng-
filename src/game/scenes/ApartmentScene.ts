import Phaser from 'phaser';
import { mapCacheKey } from '../assets';
import { AudioController } from '../audio';
import { bus } from '../bus';
import { DEPTH, GHOST, INTERACT_RADIUS, MAP_KEY } from '../constants';
import { ElderGhost } from '../entities/ElderGhost';
import { Player } from '../entities/Player';
import { EVIDENCE } from '../evidence';
import { buildMap, rectCenter, type BuiltMap, type DoorRuntime } from '../mapBuilder';
import type { DiThuongMap, MapClue } from '../types';
import { virtualInput } from '../virtualInput';

type Target =
  | { type: 'door'; door: DoorRuntime; x: number; y: number }
  | { type: 'clue'; clue: MapClue; x: number; y: number };

interface Occluder {
  image: Phaser.GameObjects.Image;
  bounds: Phaser.Geom.Rectangle;
}

const OCCLUDED_ALPHA = 0.5;

export class ApartmentScene extends Phaser.Scene {
  private field!: BuiltMap;
  private player!: Player;
  private ghost!: ElderGhost;
  private audio!: AudioController;
  private keys!: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>;
  private occluders: Occluder[] = [];
  private cluePings = new Map<string, Phaser.GameObjects.Sprite>();
  private readClues = new Set<string>();
  private started = false;
  private dossierOpen = false;
  /** Phím Enter/Space đóng hồ sơ không được mở lại hồ sơ ngay trong frame sau. */
  private interactBlockedUntil = 0;
  private currentTarget: Target | null = null;
  private lastPromptLabel: string | null = null;
  private unsubscribers: (() => void)[] = [];

  constructor() {
    super('apartment');
  }

  create(): void {
    const map = this.cache.json.get(mapCacheKey(MAP_KEY)) as DiThuongMap;
    this.field = buildMap(this, map);
    this.physics.world.setBounds(0, 0, map.width, map.height);
    this.audio = new AudioController(this);

    this.createLights(map);
    this.createOccluders();
    this.createClues(map);

    const playerSpawn = map.spawns.find((s) => s.id === 'player');
    const ghostSpawn = map.spawns.find((s) => s.id === GHOST.id);
    if (!playerSpawn || !ghostSpawn) throw new Error('Map thiếu spawn player hoặc ghost_elder');

    this.player = new Player(this, playerSpawn.x, playerSpawn.y);
    this.ghost = new ElderGhost(this, ghostSpawn.x, ghostSpawn.y, (state) => bus.emit('ghost:state', state));
    this.physics.add.collider(this.player, this.field.blockers);
    this.physics.add.collider(this.player, this.ghost);

    this.setupCamera(map);
    this.setupInput();
    this.setupBus();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.teardown());

    bus.emit('ghost:state', this.ghost.ghostState);
    bus.emit('load:complete');
  }

  update(time: number): void {
    const canMove = this.started && !this.dossierOpen;
    if (canMove) {
      const { x, y } = this.readMovement();
      if (this.player.move(x, y)) this.audio.footstep(time);
    } else {
      this.player.halt();
    }
    this.player.syncDepth();
    this.ghost.setDepth(this.ghost.y);

    this.updateOcclusion();
    this.updateTarget(canMove);
    this.updateGhost();
  }

  // ---------------------------------------------------------------- setup

  private createLights(map: DiThuongMap): void {
    // Ánh sáng trong data chỉ là vị trí gợi ý; ở đây là quầng sáng tĩnh trên sàn (không nhấp nháy).
    const key = 'dt_light_glow';
    if (!this.textures.exists(key)) {
      const size = 256;
      const tex = this.textures.createCanvas(key, size, size);
      if (tex) {
        const ctx = tex.getContext();
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        tex.refresh();
      }
    }
    for (const light of map.lights) {
      this.add
        .image(light.x, light.y, key)
        .setDisplaySize(light.radius * 2, light.radius * 1.5)
        .setTint(Phaser.Display.Color.HexStringToColor(light.color).color)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.22)
        .setDepth(DEPTH.lightGlow);
    }
  }

  private createOccluders(): void {
    this.occluders = this.field.map.objects
      .map((o, i) => ({ o, image: this.field.objects[i] }))
      .filter(({ o }) => o.kind === 'wall' || o.kind === 'prop' || o.kind === 'door')
      .map(({ o, image }) => ({
        image,
        bounds: new Phaser.Geom.Rectangle(o.x - o.width * o.origin[0], o.y - o.height * o.origin[1], o.width, o.height),
      }));
  }

  private createClues(map: DiThuongMap): void {
    for (const clue of map.clues) {
      if (!EVIDENCE[clue.id]) continue;
      const ping = this.add
        .sprite(clue.x, clue.y, 'vfx_evidence_ping', 'frame_00')
        .setDisplaySize(72, 72)
        .setAlpha(0.55)
        .setDepth(DEPTH.decal);
      this.cluePings.set(clue.id, ping);
      const replay = () => {
        if (!this.readClues.has(clue.id)) ping.play('vfx_evidence_ping');
      };
      replay();
      this.time.addEvent({ delay: 3200, loop: true, callback: replay });
    }
  }

  private setupCamera(map: DiThuongMap): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, map.width, map.height);
    cam.setBackgroundColor('#0e1012');
    cam.setRoundPixels(true);
    cam.startFollow(this.player, true, 0.12, 0.12, 0, 30);
    const applyZoom = () => cam.setZoom(cameraZoom(this.scale.width, this.scale.height));
    applyZoom();
    this.scale.on(Phaser.Scale.Events.RESIZE, applyZoom);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, applyZoom));
    if (this.game.renderer.type === Phaser.WEBGL) cam.postFX.addVignette(0.5, 0.5, 0.92, 0.32);
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys({
      up: K.UP,
      down: K.DOWN,
      left: K.LEFT,
      right: K.RIGHT,
      w: K.W,
      a: K.A,
      s: K.S,
      d: K.D,
    }) as typeof this.keys;
    // Không bật capture: để Space/Enter vẫn kích hoạt được nút trong UI React.
    for (const code of [K.E, K.SPACE, K.ENTER]) kb.addKey(code, false).on('down', () => this.interact());
    if (debugEnabled()) kb.addKey(K.G).on('down', () => this.ghost.cycleState());
  }

  private setupBus(): void {
    this.unsubscribers.push(
      bus.on('game:start', () => {
        this.started = true;
        this.audio.enable();
      }),
      bus.on('audio:mute', (muted) => this.audio.setMuted(muted)),
      bus.on('input:interact', () => this.interact()),
      bus.on('dossier:close', ({ clueId }) => this.onDossierClosed(clueId)),
    );
  }

  private teardown(): void {
    this.unsubscribers.forEach((off) => off());
    this.unsubscribers = [];
    this.audio?.destroy();
  }

  // ---------------------------------------------------------------- per frame

  private readMovement(): { x: number; y: number } {
    let x = virtualInput.x;
    let y = virtualInput.y;
    const k = this.keys;
    if (k) {
      const kx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
      const ky = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
      if (kx || ky) {
        x = kx;
        y = ky;
      }
    }
    return { x, y };
  }

  /** Làm mờ module/đồ vật đứng trước (Y lớn hơn) và che thân trên của nhân vật. */
  private updateOcclusion(): void {
    const px = this.player.x;
    const py = this.player.y - 30;
    for (const { image, bounds } of this.occluders) {
      const hides = image.depth > this.player.depth && bounds.contains(px, py);
      const target = hides ? OCCLUDED_ALPHA : 1;
      if (image.alpha !== target) image.setAlpha(Phaser.Math.Linear(image.alpha, target, 0.25));
      if (Math.abs(image.alpha - target) < 0.02) image.setAlpha(target);
    }
  }

  private updateTarget(active: boolean): void {
    this.currentTarget = active ? this.findTarget() : null;
    const label = this.currentTarget ? targetLabel(this.currentTarget) : null;
    if (label !== this.lastPromptLabel) {
      this.lastPromptLabel = label;
      bus.emit('prompt', label ? { label } : null);
    }
  }

  private findTarget(): Target | null {
    const { x, y } = this.player;
    let best: Target | null = null;
    let bestDist = INTERACT_RADIUS;
    for (const door of this.field.doors) {
      const c = rectCenter(door.rect);
      const d = Phaser.Math.Distance.Between(x, y, c.x, c.y);
      if (d < bestDist) {
        bestDist = d;
        best = { type: 'door', door, x: c.x, y: c.y };
      }
    }
    for (const clue of this.field.map.clues) {
      if (!EVIDENCE[clue.id]) continue;
      const d = Phaser.Math.Distance.Between(x, y, clue.x, clue.y);
      if (d < bestDist) {
        bestDist = d;
        best = { type: 'clue', clue, x: clue.x, y: clue.y };
      }
    }
    return best;
  }

  private updateGhost(): void {
    const ghost = this.ghost;
    if (ghost.ghostState === 'dormant' || ghost.ghostState === 'restrained') return;
    ghost.faceTowards(this.player.x, this.player.y);
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, ghost.x, ghost.y);
    if (ghost.ghostState === 'manifested' && dist < GHOST.pursueRadius) {
      ghost.setGhostState('pursuing');
      this.audio.approach();
    } else if (ghost.ghostState === 'pursuing' && dist > GHOST.calmRadius) {
      ghost.setGhostState('manifested');
    }
  }

  // ---------------------------------------------------------------- actions

  private interact(): void {
    if (!this.started || this.dossierOpen || this.time.now < this.interactBlockedUntil) return;
    const target = this.currentTarget ?? this.findTarget();
    if (!target) return;
    this.player.face(target.x, target.y);
    this.player.showInteractPose();
    if (target.type === 'door') this.toggleDoor(target.door);
    else this.openDossier(target.clue);
  }

  private toggleDoor(door: DoorRuntime): void {
    if (!door.closed) {
      // Không đóng cửa khi có ai đứng trong khung cửa.
      const rect = new Phaser.Geom.Rectangle(door.rect.x, door.rect.y, door.rect.width, door.rect.height);
      const blocked = [this.player.body, this.ghost.body].some((b) =>
        Phaser.Geom.Intersects.RectangleToRectangle(rect, new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height)),
      );
      if (blocked) {
        bus.emit('toast', 'Có vật cản trong khung cửa.');
        return;
      }
    }
    this.field.setDoor(door.id, !door.closed);
    this.audio.door();
    this.lastPromptLabel = null; // nhãn Mở/Đóng đổi theo trạng thái
  }

  private openDossier(clue: MapClue): void {
    this.dossierOpen = true;
    this.audio.evidence();
    this.audio.paper();
    bus.emit('dossier:open', { clueId: clue.id, evidenceKey: clue.evidenceKey });
  }

  private onDossierClosed(clueId: string): void {
    this.dossierOpen = false;
    this.interactBlockedUntil = this.time.now + 350;
    this.audio.paper();
    const firstRead = !this.readClues.has(clueId);
    this.readClues.add(clueId);
    const ping = this.cluePings.get(clueId);
    if (ping) this.tweens.add({ targets: ping, alpha: 0, duration: 600 });

    const entry = EVIDENCE[clueId];
    if (firstRead && entry?.awakens === 'ghost_elder' && this.ghost.ghostState === 'dormant') {
      this.time.delayedCall(700, () => this.manifestGhost());
    }
  }

  private manifestGhost(): void {
    const fx = this.add
      .sprite(this.ghost.x, this.ghost.y - 40, 'vfx_manifestation', 'frame_00')
      .setDisplaySize(160, 160)
      .setDepth(this.ghost.depth + 1);
    fx.play('vfx_manifestation');
    fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
    this.audio.manifestation();
    this.ghost.faceTowards(this.player.x, this.player.y);
    this.ghost.setGhostState('manifested');
    bus.emit('toast', 'Cuối hành lang có thứ gì đó vừa đứng dậy…');
  }
}

function targetLabel(target: Target): string {
  if (target.type === 'clue') return 'Xem vật chứng';
  return target.door.closed ? 'Mở cửa' : 'Đóng cửa';
}

/** Zoom để thấy khoảng 760×520 px thế giới trên màn hình lớn; tối thiểu 1 trên điện thoại. */
export function cameraZoom(width: number, height: number): number {
  return Phaser.Math.Clamp(Math.min(width / 760, height / 520), 1, 2);
}

export function debugEnabled(): boolean {
  return import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug');
}

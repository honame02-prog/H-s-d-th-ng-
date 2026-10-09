import type { GhostState } from './types';

/** Sự kiện trao đổi giữa Phaser (gameplay) và React (UI). */
export interface BusEvents {
  'load:progress': number;
  'load:complete': void;
  'load:error': string;
  /** React → game: người chơi bấm bắt đầu (cử chỉ người dùng, mở khoá âm thanh). */
  'game:start': void;
  'audio:mute': boolean;
  /** React → game: nút tương tác trên màn hình cảm ứng. */
  'input:interact': void;
  /** Game → React: gợi ý tương tác hiện tại (null nếu không có gì gần). */
  prompt: { label: string } | null;
  'dossier:open': { evidenceKey: string; clueId: string };
  /** React → game: người chơi đóng hồ sơ. */
  'dossier:close': { clueId: string };
  'ghost:state': GhostState;
  toast: string;
}

type Handler<T> = (payload: T) => void;

class Bus {
  private handlers = new Map<keyof BusEvents, Set<Handler<never>>>();

  on<K extends keyof BusEvents>(event: K, handler: Handler<BusEvents[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) this.handlers.set(event, (set = new Set()));
    set.add(handler as Handler<never>);
    return () => set.delete(handler as Handler<never>);
  }

  emit<K extends keyof BusEvents>(
    event: K,
    ...payload: BusEvents[K] extends void ? [] : [BusEvents[K]]
  ): void {
    this.handlers.get(event)?.forEach((h) => (h as Handler<unknown>)(payload[0]));
  }
}

export const bus = new Bus();

import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { createGame } from '../game/createGame';

/** Gắn Phaser.Game vào một div; huỷ khi unmount (an toàn với StrictMode). */
export function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const game: Phaser.Game = createGame(ref.current);
    // `?debug`: mở game ra console để kiểm tra (collider, trạng thái).
    if (new URLSearchParams(window.location.search).has('debug')) (window as unknown as { __game: Phaser.Game }).__game = game;
    return () => game.destroy(true);
  }, []);
  return <div ref={ref} className="game-canvas" />;
}

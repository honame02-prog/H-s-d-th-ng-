import { useCallback, useState } from 'react';
import { bus } from '../game/bus';
import { assetUrl } from '../game/assets';
import type { GhostState } from '../game/types';
import { DossierModal } from './DossierModal';
import { GameCanvas } from './GameCanvas';
import { Joystick } from './Joystick';
import { useBus } from './useBus';

const GHOST_LABEL: Record<GhostState, string> = {
  dormant: 'Im lìm',
  manifested: 'Hiện hình',
  pursuing: 'Truy đuổi',
  restrained: 'Bị áp chế',
};

export function App() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [ghostState, setGhostState] = useState<GhostState>('dormant');
  const [toast, setToast] = useState<string | null>(null);
  const [dossier, setDossier] = useState<string | null>(null);

  useBus('load:progress', useCallback((p: number) => setProgress(p), []));
  useBus('load:complete', useCallback(() => setLoaded(true), []));
  useBus('load:error', useCallback((msg: string) => setError(msg), []));
  useBus('prompt', useCallback((p: { label: string } | null) => setPrompt(p?.label ?? null), []));
  useBus('ghost:state', useCallback((s: GhostState) => setGhostState(s), []));
  useBus('dossier:open', useCallback(({ clueId }: { clueId: string }) => setDossier(clueId), []));
  useBus(
    'toast',
    useCallback((msg: string) => {
      setToast(msg);
      window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 3200);
    }, []),
  );

  const start = () => {
    // Cú bấm này là cử chỉ người dùng: chỉ từ đây âm thanh mới được bật.
    setStarted(true);
    bus.emit('game:start');
  };

  const closeDossier = () => {
    if (!dossier) return;
    bus.emit('dossier:close', { clueId: dossier });
    setDossier(null);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    bus.emit('audio:mute', next);
  };

  return (
    <div className="app">
      <GameCanvas />

      {started && (
        <>
          <header className="hud-top">
            <div className="case-tag">
              <span className="case-no">Hồ sơ #001</span>
              <span className="case-place">Chung cư — tầng 3</span>
            </div>
            <div className={`ghost-chip ghost-${ghostState}`} aria-live="polite">
              <img src={assetUrl('assets/ui/icons/ghost.svg')} alt="" />
              Bà lão: {GHOST_LABEL[ghostState]}
            </div>
            <button className="icon-btn" onClick={toggleMute} aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
              <img src={assetUrl('assets/ui/icons/audio.svg')} alt="" className={muted ? 'muted' : ''} />
            </button>
          </header>

          <p className="key-hint">WASD / phím mũi tên để đi · E để tương tác</p>

          <div className="touch-controls">
            <Joystick />
            <button
              className={`interact-btn ${prompt ? 'ready' : ''}`}
              onPointerDown={(e) => {
                e.preventDefault();
                bus.emit('input:interact');
              }}
              aria-label={prompt ?? 'Tương tác'}
            >
              <img src={assetUrl('assets/ui/icons/interact.svg')} alt="" />
            </button>
          </div>

          {prompt && !dossier && (
            <div className="prompt">
              <kbd>E</kbd> {prompt}
            </div>
          )}
          {toast && <div className="toast">{toast}</div>}
        </>
      )}

      {dossier && <DossierModal clueId={dossier} onClose={closeDossier} />}

      {!started && (
        <div className="start-screen">
          <h1>Hồ Sơ Dị Thường</h1>
          <p className="subtitle">Chung cư tầng 3 · Bản dựng nền</p>
          {error ? (
            <p className="error">{error}</p>
          ) : (
            <button className="panel-btn" disabled={!loaded} onClick={start}>
              {loaded ? 'Bắt đầu điều tra' : `Đang tải… ${Math.round(progress * 100)}%`}
            </button>
          )}
          <p className="note">Âm thanh chỉ bật sau khi bạn bấm bắt đầu. Nên dùng tai nghe, âm lượng vừa phải.</p>
        </div>
      )}
    </div>
  );
}

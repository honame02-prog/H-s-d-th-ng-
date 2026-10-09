import { useEffect, useRef } from 'react';
import { assetUrl } from '../game/assets';
import { EVIDENCE } from '../game/evidence';

export function DossierModal({ clueId, onClose }: { clueId: string; onClose: () => void }) {
  const entry = EVIDENCE[clueId];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!entry) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="dossier-title">
      <article className="dossier">
        <header>
          <span className="stamp">Vật chứng</span>
          <h2 id="dossier-title">{entry.title}</h2>
          <p className="location">{entry.location}</p>
        </header>
        <figure>
          <img src={assetUrl(entry.photo)} alt={entry.title} width={640} height={480} />
        </figure>
        <ul>
          {entry.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <button ref={closeRef} className="panel-btn" onClick={onClose}>
          Đóng hồ sơ
        </button>
      </article>
    </div>
  );
}

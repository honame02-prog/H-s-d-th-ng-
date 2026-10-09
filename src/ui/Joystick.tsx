import { useCallback, useEffect, useRef, useState } from 'react';
import { virtualInput } from '../game/virtualInput';

const RADIUS = 52;

/** Joystick cảm ứng: ghi vector [-1, 1] vào `virtualInput`, Phaser đọc mỗi frame. */
export function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const reset = useCallback(() => {
    pointerId.current = null;
    virtualInput.x = 0;
    virtualInput.y = 0;
    setKnob({ x: 0, y: 0 });
  }, []);

  useEffect(() => reset, [reset]);

  const update = (e: React.PointerEvent) => {
    const base = baseRef.current;
    if (!base || e.pointerId !== pointerId.current) return;
    const r = base.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    virtualInput.x = dx / RADIUS;
    virtualInput.y = dy / RADIUS;
    setKnob({ x: dx, y: dy });
  };

  return (
    <div
      ref={baseRef}
      className="joystick"
      aria-label="Cần điều hướng"
      onPointerDown={(e) => {
        if (pointerId.current !== null) return;
        pointerId.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={update}
      onPointerUp={(e) => e.pointerId === pointerId.current && reset()}
      onPointerCancel={(e) => e.pointerId === pointerId.current && reset()}
      onLostPointerCapture={(e) => e.pointerId === pointerId.current && reset()}
    >
      <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}

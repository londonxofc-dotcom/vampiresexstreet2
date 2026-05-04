'use client';

import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

function deterministicGlyph(index: number) {
  return GLYPHS[(index * 7 + 3) % GLYPHS.length];
}

interface TextScrambleProps {
  text: string;
  active: boolean;
  duration?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export default function TextScramble({
  text,
  active,
  duration = 1800,
  className,
  id,
  style,
}: TextScrambleProps) {
  const [display, setDisplay] = useState<{ char: string; resolved: boolean }[]>(() =>
    text.split('').map((c, i) => ({ char: c === ' ' ? ' ' : deterministicGlyph(i), resolved: c === ' ' }))
  );
  const frameRef = useRef<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;

    const len = text.length;
    let startTime: number | null = null;

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const next = text.split('').map((c, i) => {
        if (c === ' ') return { char: ' ', resolved: true };
        const threshold = (i / len) * 0.7 + 0.15;
        if (progress >= threshold) {
          return { char: c, resolved: true };
        }
        return { char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], resolved: false };
      });

      setDisplay(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(frame);
      }
    }

    frameRef.current = requestAnimationFrame(frame);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, text, duration]);

  return (
    <span id={id} className={className} style={style}>
      {display.map((d, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            color: d.resolved ? undefined : '#9E9688',
            transition: 'color 0.1s',
            minWidth: d.char === ' ' ? '0.3em' : undefined,
          }}
        >
          {d.char === ' ' ? '\u00A0' : d.char}
        </span>
      ))}
    </span>
  );
}

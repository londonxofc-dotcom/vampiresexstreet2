'use client';

import { useEffect, useRef, useState } from 'react';

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%'.split('');
const REEL = 8; // chars per reel including the target

// Build a deterministic reel so output is stable across renders
function buildReel(char: string, seed: number): string[] {
  const reel = Array.from({ length: REEL - 1 }, (_, i) => POOL[(seed * 7 + i * 13) % POOL.length]);
  reel.push(char.toUpperCase());
  return reel;
}

interface SlotCharProps {
  char: string;
  charIdx: number;
  delay: number;
  go: boolean;
}

function SlotChar({ char, charIdx, delay, go }: SlotCharProps) {
  if (char === ' ') return <span style={{ display: 'inline-block', minWidth: '0.28em' }}>&nbsp;</span>;

  const reel = buildReel(char, charIdx);
  // steps(REEL-1, end) with from:0 to:-(REEL-1)em lands exactly on the last char
  const endVal = `${-(REEL - 1)}em`;

  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', height: '1em', verticalAlign: 'top' }}>
      <span
        style={{
          display: 'block',
          animationName: 'slot-spin',
          animationDuration: '0.72s',
          animationTimingFunction: `steps(${REEL - 1}, end)`,
          animationFillMode: 'forwards',
          animationDelay: `${delay}s`,
          animationPlayState: go ? 'running' : 'paused',
          ['--slot-end' as string]: endVal,
        } as React.CSSProperties}
      >
        {reel.map((c, i) => (
          <span key={i} style={{ display: 'block', height: '1em', lineHeight: 1 }}>{c}</span>
        ))}
      </span>
    </span>
  );
}

interface Props {
  children: string;
  className?: string;
}

export default function SlotMachineText({ children, className = '' }: Props) {
  const ref  = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setGo(true); observer.disconnect(); } },
      { threshold: 0.25 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  let idx = 0;
  return (
    <span ref={ref} className={className}>
      {children.split('').map((char, i) => {
        const charIdx = char !== ' ' ? idx++ : 0;
        const delay   = char !== ' ' ? charIdx * 0.055 : 0;
        return <SlotChar key={i} char={char} charIdx={charIdx} delay={delay} go={go} />;
      })}
    </span>
  );
}

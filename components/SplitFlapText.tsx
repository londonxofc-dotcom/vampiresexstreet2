'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.·:&+';

function getCharIndex(c: string): number {
  const idx = CHARS.indexOf(c.toUpperCase());
  return idx >= 0 ? idx : 0;
}

interface FlapProps {
  target: string;
  delay: number;
  go: boolean;
  flipOut: boolean;
  flipOutDelay: number;
}

function FlapChar({ target, delay, go, flipOut, flipOutDelay }: FlapProps) {
  const targetIdx = getCharIndex(target);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flippedOut, setFlippedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const flipOutStartedRef = useRef(false);

  // Flip IN
  useEffect(() => {
    if (!go || startedRef.current) return;
    startedRef.current = true;

    const timer = setTimeout(() => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setFlipping(true);
        setTimeout(() => {
          setCurrentIdx(i);
          setFlipping(false);
        }, 40);

        if (i >= targetIdx) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 55 + Math.max(0, i - targetIdx + 3) * 8);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [go, targetIdx, delay]);

  // Flip OUT — scramble back to blank
  useEffect(() => {
    if (!flipOut || flipOutStartedRef.current || !startedRef.current) return;
    flipOutStartedRef.current = true;

    const timer = setTimeout(() => {
      let i = targetIdx;
      const outInterval = setInterval(() => {
        i--;
        setFlipping(true);
        setTimeout(() => {
          setCurrentIdx(Math.max(0, i));
          setFlipping(false);
        }, 35);

        if (i <= 0) {
          clearInterval(outInterval);
          setFlippedOut(true);
        }
      }, 40);
    }, flipOutDelay);

    return () => clearTimeout(timer);
  }, [flipOut, targetIdx, flipOutDelay]);

  const displayChar = CHARS[Math.min(currentIdx, CHARS.length - 1)] || ' ';
  const isSpace = target === ' ';

  if (isSpace) {
    return <span className="inline-block w-[0.35em]" />;
  }

  return (
    <span
      className="inline-block relative"
      style={{
        width: '0.72em',
        height: '1.3em',
        margin: '0 0.5px',
        perspective: '200px',
        verticalAlign: 'top',
        opacity: flippedOut ? 0.3 : 1,
        transition: 'opacity 200ms',
      }}
    >
      {/* Background cell */}
      <span
        className="absolute inset-0 rounded-[2px]"
        style={{
          background: '#1A1612',
          border: '1px solid rgba(74, 124, 63, 0.15)',
        }}
      />
      {/* Center line */}
      <span
        className="absolute left-0 right-0 z-10"
        style={{
          top: '50%',
          height: '1px',
          background: 'rgba(10, 10, 10, 0.6)',
        }}
      />
      {/* Character */}
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[0.85em] tracking-normal"
        style={{
          color: '#F2EDE4',
          transform: flipping ? 'rotateX(-12deg)' : 'rotateX(0)',
          transition: 'transform 35ms ease-out',
          textShadow: '0 0 4px rgba(74, 124, 63, 0.3)',
        }}
      >
        {displayChar}
      </span>
    </span>
  );
}

export interface SplitFlapHandle {
  triggerFlipOut: () => void;
}

interface Props {
  children: string;
  className?: string;
  staggerMs?: number;
  flipOutStaggerMs?: number;
  id?: string;
}

const SplitFlapText = forwardRef<SplitFlapHandle, Props>(
  ({ children, className = '', staggerMs = 80, flipOutStaggerMs = 30, id }, fwdRef) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [go, setGo] = useState(false);
    const [flipOut, setFlipOut] = useState(false);

    useImperativeHandle(fwdRef, () => ({
      triggerFlipOut: () => setFlipOut(true),
    }));

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setGo(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    return (
      <span ref={ref} id={id} className={`inline-flex flex-wrap ${className}`} aria-label={children}>
        {children.split('').map((char, i) => (
          <FlapChar
            key={i}
            target={char}
            delay={i * staggerMs}
            go={go}
            flipOut={flipOut}
            flipOutDelay={i * flipOutStaggerMs}
          />
        ))}
      </span>
    );
  },
);

SplitFlapText.displayName = 'SplitFlapText';
export default SplitFlapText;

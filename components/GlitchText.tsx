'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: string;
  className?: string;
}

export default function GlitchText({ children, className = '' }: Props) {
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

  return (
    <span
      ref={ref}
      className={`${className} relative inline-block`}
      style={{
        animationName: go ? 'glitch-main' : undefined,
        animationDuration: '5s',
        animationTimingFunction: 'step-end',
        animationIterationCount: 'infinite',
      }}
    >
      {/* Red channel offset layer */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          color: '#C13030',
          animationName: go ? 'glitch-r' : undefined,
          animationDuration: '5s',
          animationTimingFunction: 'step-end',
          animationIterationCount: 'infinite',
          opacity: 0,
          userSelect: 'none',
        }}
      >
        {children}
      </span>
      {/* Cyan channel offset layer */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          color: '#30C1C1',
          animationName: go ? 'glitch-c' : undefined,
          animationDuration: '5s',
          animationTimingFunction: 'step-end',
          animationIterationCount: 'infinite',
          opacity: 0,
          userSelect: 'none',
        }}
      >
        {children}
      </span>
      {children}
    </span>
  );
}

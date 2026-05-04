'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: string;
  charDelay?: number; // seconds between each character
  className?: string;
}

export default function TypewriterText({ children, charDelay = 0.038, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        observer.disconnect();

        let i = 0;
        intervalRef.current = setInterval(() => {
          i++;
          setCount(i);
          if (i >= children.length) clearInterval(intervalRef.current);
        }, charDelay * 1000);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [children, charDelay]);

  return (
    <span ref={ref} className={className} aria-label={children}>
      {children.slice(0, count)}
      {count < children.length && (
        <span style={{ opacity: 0 }} aria-hidden="true">
          {children.slice(count)}
        </span>
      )}
    </span>
  );
}

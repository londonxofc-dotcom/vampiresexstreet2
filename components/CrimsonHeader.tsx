'use client';

import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';

// Colors — cream (section default) ↔ deep crimson on proximity
const BASE   = '#F2EDE4';
const CRIMSON = '#C13030';
const RADIUS  = 220; // px falloff distance

const CHARS = 'CRIMSON COLLECTION'.split('');

export default function CrimsonHeader() {
  const h2Ref    = useRef<HTMLHeadingElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Letter fade-in via IntersectionObserver — avoids ScrollTrigger kill conflict
  // with the global initScrollAnimations() that fires 60ms after mount.
  useEffect(() => {
    const spans = spansRef.current.filter((s): s is HTMLSpanElement => !!s);
    if (!spans.length) return;

    gsap.set(spans, { opacity: 0, x: -18 });

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gsap.to(spans, {
        opacity: 1,
        x: 0,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.028,   // ~500ms total spread across all 18 chars
      });
      observer.disconnect();
    }, { threshold: 0.2 });

    if (h2Ref.current) observer.observe(h2Ref.current);
    return () => observer.disconnect();
  }, []);

  // Mouse proximity → crimson hue on nearby letters, fades back on leave
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    spansRef.current.forEach((span) => {
      if (!span) return;
      const { left, top, width, height } = span.getBoundingClientRect();
      const dist = Math.hypot(
        e.clientX - (left + width  / 2),
        e.clientY - (top  + height / 2),
      );
      const t = Math.max(0, 1 - dist / RADIUS);

      // Linear interpolate BASE → CRIMSON per channel
      const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
      const r = lerp(0xF2, 0xC1);
      const g = lerp(0xED, 0x30);
      const b = lerp(0xE4, 0x30);

      gsap.to(span, {
        color: `rgb(${r},${g},${b})`,
        duration: 0.15,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    gsap.to(
      spansRef.current.filter((s): s is HTMLSpanElement => !!s),
      { color: BASE, duration: 0.65, ease: 'power2.out', stagger: 0.012 },
    );
  }, []);

  return (
    <h2
      ref={h2Ref}
      data-crimson-header
      className="mb-8 max-w-5xl font-sans text-[15vw] leading-[0.86] tracking-tighter cursor-default select-none sm:text-7xl md:mb-12 md:text-8xl"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {CHARS.map((char, i) => (
        <span
          key={i}
          ref={el => { spansRef.current[i] = el; }}
          className={char === ' ' ? 'inline' : 'inline-block'}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h2>
  );
}

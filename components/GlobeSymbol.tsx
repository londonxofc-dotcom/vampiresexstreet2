'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function GlobeSymbol() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltRef      = useRef<HTMLDivElement>(null);
  const spinRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const tilt      = tiltRef.current;
    const spin      = spinRef.current;
    if (!container || !tilt || !spin) return;

    // rAF-driven continuous Z-spin — avoids GSAP tween conflict with mouse tilt
    let angle = 0;
    let scrollBoost = 0;
    let rafId: number;

    const tick = () => {
      angle += 0.22 + scrollBoost;
      scrollBoost *= 0.92;               // decay scroll burst smoothly
      gsap.set(spin, { rotateZ: angle });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Mouse move → 3-D tilt toward cursor
    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const dx = (e.clientX - (left + width  / 2)) / (width  / 2);
      const dy = (e.clientY - (top  + height / 2)) / (height / 2);
      gsap.to(tilt, {
        rotateX: -dy * 24,
        rotateY:  dx * 24,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    // Mouse leave → snap back with elastic
    const onMouseLeave = () => {
      gsap.to(tilt, {
        rotateX: 0,
        rotateY: 0,
        duration: 1.4,
        ease: 'elastic.out(1, 0.45)',
        overwrite: 'auto',
      });
    };

    // Scroll → brief spin burst
    const onScroll = () => { scrollBoost = 3.5; };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-8 cursor-none">
      {/* tiltRef handles X/Y rotation from mouse */}
      <div ref={tiltRef} style={{ transformStyle: 'preserve-3d', perspective: '600px' }}>
        {/* spinRef handles continuous Z rotation */}
        <div ref={spinRef} className="relative w-44 h-44" style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 rounded-full border-[1.5px] border-[#1A1612]"></div>
          <div className="absolute inset-0 rounded-[100%] border-[1.5px] border-[#1A1612] scale-y-50"></div>
          <div className="absolute inset-0 rounded-[100%] border-[1.5px] border-[#1A1612] scale-x-50"></div>
          <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#1A1612] -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-[#1A1612] -translate-x-1/2"></div>
        </div>
      </div>
      <span className="text-[9px] tracking-[0.35em] opacity-40 uppercase">Miami, FL · Est. 2019</span>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero-section', label: 'Myth', short: 'Home' },
  { id: 'about-section', label: 'Proof', short: 'Proof' },
  { id: 'products-section', label: 'Drops', short: 'Drops' },
  { id: 'epk-section', label: 'Listen', short: 'Listen' },
  { id: 'bloodline-section', label: 'Access', short: 'Access' },
];

export default function SectionNav({ visible = true }: { visible?: boolean }) {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    if (!visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current?.target.id) setActive(current.target.id);
      },
      {
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0.12, 0.28, 0.5],
      },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visible]);

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!visible) return null;

  return (
    <>
      <nav
        aria-label="Page sections"
        className="fixed right-6 top-1/2 z-[190] hidden -translate-y-1/2 flex-col gap-1 md:flex"
      >
        {SECTIONS.map(({ id, label }, index) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => goToSection(id)}
              className={`group flex min-h-10 items-center justify-end gap-3 text-right font-mono text-[10px] uppercase tracking-[0.28em] transition-colors [text-shadow:0_1px_10px_rgba(232,220,200,0.72),0_0_12px_rgba(10,10,10,0.38)] ${
                isActive ? 'text-[#4A7C3F]' : 'text-[#F2EDE4]/58 hover:text-[#F2EDE4]'
              }`}
            >
              <span className="opacity-65">{String(index + 1).padStart(2, '0')}</span>
              <span>{label}</span>
              <span
                className={`h-px transition-all ${
                  isActive ? 'w-10 bg-[#4A7C3F]' : 'w-4 bg-current opacity-45 group-hover:w-8'
                }`}
              />
            </button>
          );
        })}
      </nav>

      <nav
        aria-label="Mobile page sections"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+8.25rem)] left-1/2 z-[205] flex w-[calc(100vw-2rem)] max-w-[390px] -translate-x-1/2 items-end justify-between px-1 py-1 md:hidden"
      >
        {SECTIONS.map(({ id, short }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => goToSection(id)}
              className={`group flex min-h-8 flex-1 flex-col items-center justify-end gap-1 px-1 font-mono text-[8px] uppercase tracking-[0.18em] transition-colors [text-shadow:0_1px_10px_rgba(232,220,200,0.82),0_0_10px_rgba(10,10,10,0.38)] ${
                isActive ? 'text-[#4A7C3F]' : 'text-[#1A1612]/48 hover:text-[#1A1612]'
              }`}
            >
              <span
                className={`h-px transition-all ${
                  isActive ? 'w-7 bg-[#4A7C3F]' : 'w-2.5 bg-current opacity-28 group-hover:w-5'
                }`}
              />
              {short}
            </button>
          );
        })}
      </nav>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

const SECTIONS = [
  { id: 'hero-section', label: 'Myth', short: 'Home' },
  { id: 'about-section', label: 'Proof', short: 'Proof' },
  { id: 'products-section', label: 'Drops', short: 'Drops' },
  { id: 'epk-section', label: 'Listen', short: 'Listen' },
  { id: 'bloodline-section', label: 'Access', short: 'Access' },
];

const MOBILE_IDLE_REVEAL_MS = 5000;
const MOBILE_HIDE_SCROLL_DELTA = 10;
const MOBILE_HIDE_SCROLL_OFFSET = 64;

export default function SectionNav({ visible = true }: { visible?: boolean }) {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [mobileHidden, setMobileHidden] = useState(false);
  const [mobileHovered, setMobileHovered] = useState(false);
  const idleRevealTimer = useRef<number | null>(null);
  const lastScrollY = useRef(0);

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

  useEffect(() => {
    if (!visible) return;

    lastScrollY.current = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    const clearIdleReveal = () => {
      if (idleRevealTimer.current !== null) {
        window.clearTimeout(idleRevealTimer.current);
        idleRevealTimer.current = null;
      }
    };

    const scheduleIdleReveal = () => {
      clearIdleReveal();
      idleRevealTimer.current = window.setTimeout(() => {
        setMobileHidden(false);
      }, MOBILE_IDLE_REVEAL_MS);
    };

    const registerActivity = () => {
      scheduleIdleReveal();
    };

    const handleScroll = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (
        !mobileHovered &&
        currentY > MOBILE_HIDE_SCROLL_OFFSET &&
        currentY - lastScrollY.current > MOBILE_HIDE_SCROLL_DELTA
      ) {
        setMobileHidden(true);
      }

      lastScrollY.current = currentY;
      scheduleIdleReveal();
    };

    scheduleIdleReveal();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', registerActivity, { passive: true });
    window.addEventListener('touchstart', registerActivity, { passive: true });
    window.addEventListener('touchmove', registerActivity, { passive: true });
    window.addEventListener('pointerdown', registerActivity, { passive: true });
    window.addEventListener('keydown', registerActivity);

    return () => {
      clearIdleReveal();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', registerActivity);
      window.removeEventListener('touchstart', registerActivity);
      window.removeEventListener('touchmove', registerActivity);
      window.removeEventListener('pointerdown', registerActivity);
      window.removeEventListener('keydown', registerActivity);
    };
  }, [mobileHovered, visible]);

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const mobileNavExpanded = !mobileHidden || mobileHovered;

  const hideMobileNav = () => {
    setMobileHovered(false);
    const currentY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (currentY > MOBILE_HIDE_SCROLL_OFFSET) {
      setMobileHidden(true);
    }
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
        onMouseEnter={() => {
          setMobileHovered(true);
          setMobileHidden(false);
        }}
        onMouseLeave={hideMobileNav}
        onFocusCapture={() => setMobileHidden(false)}
        onBlurCapture={(event) => {
          const nextFocused = event.relatedTarget;
          if (!(nextFocused instanceof Node) || !event.currentTarget.contains(nextFocused)) {
            hideMobileNav();
          }
        }}
        onTouchStart={(event) => {
          if (mobileHidden) {
            event.preventDefault();
            setMobileHidden(false);
          }
        }}
        className={`fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-[205] flex w-[calc(100vw-1.5rem)] max-w-[330px] -translate-x-1/2 items-end justify-between rounded-[2px] border border-[#1A1612]/16 bg-[#E8DCC8]/88 px-2 py-2 shadow-[0_10px_24px_rgba(26,22,18,0.12)] backdrop-blur-[6px] transition-[transform,opacity,box-shadow] duration-300 ease-out will-change-transform md:hidden ${
          mobileNavExpanded ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%-0.95rem)] opacity-84'
        }`}
      >
        {SECTIONS.map(({ id, short }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => goToSection(id)}
              className={`group flex min-h-8 flex-1 flex-col items-center justify-end gap-1 px-1 font-mono text-[8px] uppercase tracking-[0.18em] transition-colors ${
                isActive ? 'text-[#4A7C3F]' : 'text-[#1A1612]/52 hover:text-[#1A1612]'
              }`}
            >
              <span
                className={`h-px transition-all ${
                  isActive ? 'w-7 bg-[#4A7C3F]' : 'w-2.5 bg-current opacity-24 group-hover:w-5'
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

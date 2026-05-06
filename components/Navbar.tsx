'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAV_ITEMS = [
  { label: 'SHOP',      href: '#products-section'  },
  { label: 'ABOUT',     href: '#about-section'     },
  { label: 'LISTEN',    href: '#epk-section'       },
  { label: 'BOOK',      href: '#epk-section'       },
  { label: 'BLOODLINE', href: '#bloodline-section' },
];

type NavbarProps = {
  visible?: boolean;
};

export default function Navbar({ visible = true }: NavbarProps) {
  const badgeRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [contactHidden, setContactHidden] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const isMenuOpen = visible && open;
  const chromeVisible = visible && (heroInView || isMenuOpen);
  const contactVisible = chromeVisible && heroInView && !contactHidden;

  useEffect(() => {
    const isHeroActive = () => {
      const hero = document.querySelector<HTMLElement>('#hero-section');
      if (!hero) return true;

      const rect = hero.getBoundingClientRect();
      return rect.bottom > 120 && rect.top < window.innerHeight * 0.75;
    };

    const updateContactVisibility = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const heroActive = isHeroActive();
      setHeroInView(heroActive);
      setContactHidden(scrollTop > 80 || !heroActive);
    };
    const hideOnForwardScroll = (event: WheelEvent) => {
      if (event.deltaY > 0) setContactHidden(true);
      if (event.deltaY < 0 && isHeroActive()) setContactHidden(false);
    };
    let touchStartY = 0;
    const captureTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const hideOnTouchScroll = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchStartY;
      if (touchStartY - y > 8) setContactHidden(true);
      if (y - touchStartY > 8 && isHeroActive()) setContactHidden(false);
    };

    updateContactVisibility();
    window.addEventListener('scroll', updateContactVisibility, { passive: true });
    window.addEventListener('wheel', hideOnForwardScroll, { passive: true });
    window.addEventListener('touchstart', captureTouchStart, { passive: true });
    window.addEventListener('touchmove', hideOnTouchScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateContactVisibility);
      window.removeEventListener('wheel', hideOnForwardScroll);
      window.removeEventListener('touchstart', captureTouchStart);
      window.removeEventListener('touchmove', hideOnTouchScroll);
    };
  }, []);

  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    if (reduceMotion.matches || coarsePointer.matches) return;

    let frame = 0;
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0, rx: 0, ry: 0 };
    const current = { x: 0, y: 0, rx: 0, ry: 0 };

    const updateTarget = () => {
      const scroll = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollX = Math.sin(scroll * 0.012) * 8;
      const scrollY = Math.min(18, scroll * 0.045);

      // Cross-axis pull: pointer Y affects X, pointer X affects Y.
      target.x = scrollX + pointer.y * 12;
      target.y = scrollY + pointer.x * 10;
      target.rx = -pointer.x * 10;
      target.ry = pointer.y * 12;
    };

    const render = () => {
      frame = 0;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.rx += (target.rx - current.rx) * 0.12;
      current.ry += (target.ry - current.ry) * 0.12;

      badge.style.transform = [
        `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`,
        `rotateX(${current.rx.toFixed(2)}deg)`,
        `rotateY(${current.ry.toFixed(2)}deg)`,
      ].join(' ');

      if (
        Math.abs(target.x - current.x) > 0.05 ||
        Math.abs(target.y - current.y) > 0.05 ||
        Math.abs(target.rx - current.rx) > 0.05 ||
        Math.abs(target.ry - current.ry) > 0.05
      ) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointer.y = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      updateTarget();
      requestRender();
    };

    const onScroll = () => {
      updateTarget();
      requestRender();
    };

    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      updateTarget();
      requestRender();
    };

    updateTarget();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
      badge.style.transform = '';
    };
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Animate nav items in/out
  useEffect(() => {
    const items = document.querySelectorAll('.nav-item');
    if (isMenuOpen) {
      gsap.fromTo(items,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.07, delay: 0.1 }
      );
    } else {
      gsap.to(items, { y: 16, opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.03 });
    }
  }, [isMenuOpen]);

  const handleNav = (href: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[200] flex justify-between items-start px-4 py-5 pointer-events-none transition-all duration-700 md:px-12 md:py-6 ${
        chromeVisible ? 'translate-y-0 opacity-100 blur-0' : '-translate-y-4 opacity-0 blur-[2px]'
      }`}>

        {/* VS Button — nav toggle */}
        <button
          ref={badgeRef}
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => {
            if (chromeVisible) setOpen(v => !v);
          }}
          className={`relative flex h-14 w-14 shrink-0 aspect-square items-center justify-center focus:outline-none will-change-transform [transform-style:preserve-3d] [perspective:700px] md:h-16 md:w-16 ${chromeVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* Orbital glow ring */}
          <div className="vs-glow-ring" />

          {/* Badge */}
          <div className="relative aspect-square h-full w-full rounded-full border-[1.5px] border-[#1A1612] bg-[#E8DCC8] flex items-center justify-center transition-colors duration-300 hover:bg-[#1A1612] group animate-[spin_8s_linear_infinite]">
            <span
              className="font-sans text-2xl tracking-tighter leading-none mt-1 text-[#1A1612] group-hover:text-[#E8DCC8] transition-colors duration-300"
              style={{ fontSize: isMenuOpen ? '1rem' : undefined }}
            >
              {isMenuOpen ? '×' : 'VS'}
            </span>
          </div>
        </button>

        {/* Contact Info */}
        <div
          className="ml-auto flex max-w-[calc(100vw-5.5rem)] items-start justify-end gap-3 transition-all duration-500 md:gap-8"
          style={{
            opacity: contactVisible ? 1 : 0,
            transform: contactVisible ? 'translateY(0)' : 'translateY(-0.5rem)',
            filter: contactVisible ? 'blur(0px)' : 'blur(2px)',
            pointerEvents: contactVisible ? 'auto' : 'none',
          }}
        >
          <div className="text-right">
            <p className="text-xs text-[#1A1612]/60 mb-1 mix-blend-exclusion text-white/60">Bookings / Press</p>
            <a
              href="mailto:vampiresexworldwide@gmail.com"
              className="block text-[11px] hover:text-[#4A7C3F] transition-colors underline underline-offset-4 text-[#1A1612] mix-blend-exclusion text-white sm:text-sm"
            >
              vampiresexworldwide@gmail.com
            </a>
            <div className="mt-2 hidden md:flex justify-end gap-4 text-[10px] tracking-[0.25em] uppercase mix-blend-exclusion text-white/65">
              <button type="button" onClick={() => handleNav('#epk-section')} className="hover:text-[#4A7C3F] transition-colors">
                Listen
              </button>
              <button type="button" onClick={() => handleNav('#products-section')} className="hover:text-[#4A7C3F] transition-colors">
                Shop
              </button>
            </div>
          </div>
          <div className="hidden gap-1 text-[#1A1612]/40 mix-blend-exclusion text-white/40 sm:flex">
            {[0,1,2,3].map(i => <span key={i} className="text-xl leading-none">|</span>)}
          </div>
        </div>
      </header>

      {/* Fullscreen nav overlay */}
      <div
        className="fixed inset-0 z-[199] flex flex-col justify-center px-12 md:px-24 transition-all duration-400"
        style={{
          backgroundColor: 'rgba(10,10,10,0.97)',
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
          backdropFilter: 'blur(12px)',
        }}
        onClick={() => setOpen(false)}
      >
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[#4A7C3F]/30" />

        <nav onClick={e => e.stopPropagation()}>
          <ul className="space-y-2">
            {NAV_ITEMS.map(({ label, href }) => (
              <li key={label} className="nav-item opacity-0">
                <button
                  type="button"
                  onClick={() => handleNav(href)}
                  className="font-sans text-[13vw] md:text-[9vw] leading-none tracking-tighter text-[#F2EDE4] hover:text-[#4A7C3F] transition-colors duration-200 text-left"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Footer links inside menu */}
          <div className="mt-16 flex gap-8 text-xs tracking-widest text-[#F2EDE4]/30">
            <a href="https://instagram.com/vampiresexworldwide" target="_blank" rel="noopener noreferrer" className="hover:text-[#4A7C3F] transition-colors">INSTAGRAM</a>
            <a href="https://open.spotify.com/artist/2qP2zz3K0jWe9OP7v7KLVV" target="_blank" rel="noopener noreferrer" className="hover:text-[#4A7C3F] transition-colors">SPOTIFY</a>
            <a href="https://www.traxsource.com/artist/702904/vampire-sex" target="_blank" rel="noopener noreferrer" className="hover:text-[#4A7C3F] transition-colors">TRAXSOURCE</a>
          </div>
        </nav>

        {/* Decorative bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#4A7C3F]/30" />
      </div>
    </>
  );
}

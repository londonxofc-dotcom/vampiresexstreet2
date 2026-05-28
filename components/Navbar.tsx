'use client';

import { useState, useEffect } from 'react';
import gsap from 'gsap';

const NAV_ITEMS = [
  { label: 'HOME',   href: '#hero-section'      },
  { label: 'PROOF',  href: '#about-section'     },
  { label: 'DROPS',  href: '#products-section'  },
  { label: 'LISTEN', href: '#epk-section'       },
  { label: 'ACCESS', href: '#bloodline-section' },
];

type NavbarProps = {
  visible?: boolean;
};

export default function Navbar({ visible = true }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [contactHidden, setContactHidden] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const isMenuOpen = visible && open;
  const chromeVisible = visible;
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
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => {
            if (chromeVisible) setOpen(v => !v);
          }}
          className={`group/vs-menu relative flex h-14 w-14 shrink-0 aspect-square items-center justify-center focus:outline-none md:h-16 md:w-16 ${chromeVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* Badge */}
          <div className="vs-menu-disc relative aspect-square h-full w-full rounded-full border-[1.5px] border-[#1A1612] bg-[#E8DCC8] flex items-center justify-center transition-colors duration-300 group-hover/vs-menu:bg-[#1A1612] group-focus-visible/vs-menu:bg-[#1A1612]">
            <span
              className="font-sans text-2xl tracking-tighter leading-none mt-1 text-[#1A1612] group-hover/vs-menu:text-[#E8DCC8] group-focus-visible/vs-menu:text-[#E8DCC8] transition-colors duration-300"
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
            <p className="text-xs text-[#1A1612]/65 mb-1">Bookings / Press</p>
            <a
              href="mailto:bookings@vampiresexworldwide.com"
              className="block text-[11px] text-[#1A1612] hover:text-[#4A7C3F] transition-colors underline underline-offset-4 sm:text-sm"
            >
              bookings@vampiresexworldwide.com
            </a>
            <div className="mt-2 hidden md:flex justify-end gap-4 text-[10px] tracking-[0.25em] uppercase text-[#1A1612]/65">
              <button type="button" onClick={() => handleNav('#epk-section')} className="hover:text-[#4A7C3F] transition-colors">
                Listen
              </button>
              <button type="button" onClick={() => handleNav('#products-section')} className="hover:text-[#4A7C3F] transition-colors">
                Shop
              </button>
            </div>
          </div>
          <div className="hidden gap-1 text-[#1A1612]/40 sm:flex">
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

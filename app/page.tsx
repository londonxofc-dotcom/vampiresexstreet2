'use client';

import { useScrollAnimations } from '@/hooks/useScrollAnimations';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import CrimsonHeader from '@/components/CrimsonHeader';
import GlobeSymbol from '@/components/GlobeSymbol';
import TypewriterText from '@/components/TypewriterText';
import SlotMachineText from '@/components/SlotMachineText';
import SplitFlapText, { SplitFlapHandle } from '@/components/SplitFlapText';
import GlitchText from '@/components/GlitchText';
import TextScramble from '@/components/TextScramble';
import Navbar from '@/components/Navbar';
import { StatCounter } from '@/components/StatCounter';
import { MediaPlayer } from '@/components/MediaPlayer';
import dynamic from 'next/dynamic';

const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false });

export default function Home() {
  const splitFlapRef = useRef<SplitFlapHandle>(null);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const forceSplash = new URLSearchParams(window.location.search).has('splash');
    if (forceSplash) { setSplashDone(false); return; }
    const stored = window.localStorage.getItem('vampire-sex-splash-ts');
    const FIVE_MIN = 5 * 60 * 1000;
    const hasSeenSplash = stored ? (Date.now() - Number(stored)) < FIVE_MIN : false;
    if (hasSeenSplash) {
      setSplashDone(true);
    }
  }, []);

  // Expose split-flap ref to vanilla JS scroll system
  useEffect(() => {
    (window as any).__splitFlapRef = splitFlapRef;
    return () => { delete (window as any).__splitFlapRef; };
  }, []);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  useScrollAnimations(splashDone ? 'ready' : 'waiting');

  const [registrySubmitted, setRegistrySubmitted] = useState(false);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState('');
  const [isBloodlinePopupOpen, setIsBloodlinePopupOpen] = useState(false);
  const [bloodlinePopupDismissed, setBloodlinePopupDismissed] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroDetailsVisible, setHeroDetailsVisible] = useState(false);
  const [heroIntroStarted, setHeroIntroStarted] = useState(false);
  const [heroProofStep, setHeroProofStep] = useState(0);
  const [autoplayDiscoPartyBaby, setAutoplayDiscoPartyBaby] = useState(false);

  useEffect(() => {
    if (!splashDone) return;

    const hero = document.querySelector('#hero-section');
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeroIntroStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.28 });

    observer.observe(hero);

    return () => observer.disconnect();
  }, [splashDone]);

  useEffect(() => {
    if (!splashDone) return;

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    window.history.scrollRestoration = 'manual';
    resetScroll();
    const raf = window.requestAnimationFrame(resetScroll);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [splashDone]);

  useEffect(() => {
    if (!heroIntroStarted) return;

    document.body.style.overflow = 'hidden';

    const revealWordmark = window.setTimeout(() => setHeroVisible(true), 120);
    const revealDetails = window.setTimeout(() => {
      setHeroDetailsVisible(true);
      document.body.style.overflow = '';
    }, 2050);

    return () => {
      window.clearTimeout(revealWordmark);
      window.clearTimeout(revealDetails);
      document.body.style.overflow = '';
    };
  }, [heroIntroStarted]);

  useEffect(() => {
    if (!heroDetailsVisible) return;

    setHeroProofStep(0);
    const timers = [1, 2, 3, 4].map((step) => (
      window.setTimeout(() => setHeroProofStep(step), step * 240)
    ));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [heroDetailsVisible]);

  useEffect(() => {
    if (!splashDone) return;
    if (registrySubmitted || bloodlinePopupDismissed) return;
    const hasSeenPopup = window.sessionStorage.getItem('bloodline-popup-seen') === 'true';
    if (hasSeenPopup) return;

    const target = document.querySelector('#about-section');
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsBloodlinePopupOpen(true);
        window.sessionStorage.setItem('bloodline-popup-seen', 'true');
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(target);

    return () => observer.disconnect();
  }, [bloodlinePopupDismissed, registrySubmitted, splashDone]);

  const closeBloodlinePopup = useCallback(() => {
    setIsBloodlinePopupOpen(false);
    setBloodlinePopupDismissed(true);
    window.sessionStorage.setItem('bloodline-popup-seen', 'true');
  }, []);

  useEffect(() => {
    if (!isBloodlinePopupOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeBloodlinePopup();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeBloodlinePopup, isBloodlinePopupOpen]);

  const submitRegistryEmail = useCallback(async (email: string) => {
    setRegistryError('');
    setRegistryLoading(true);
    try {
      const res = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Could not secure access.');
      }

      setRegistrySubmitted(true);
      setIsBloodlinePopupOpen(true);
    } catch (error) {
      setRegistryError(error instanceof Error ? error.message : 'Could not secure access.');
    } finally {
      setRegistryLoading(false);
    }
  }, []);

  const scrollToSection = useCallback((selector: string, behavior: ScrollBehavior = 'smooth') => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

  const completeSplash = useCallback(() => {
    window.localStorage.setItem('vampire-sex-splash-ts', String(Date.now()));
    setAutoplayDiscoPartyBaby(true);
    setSplashDone(true);
  }, []);

  const barcodeBars = useMemo(() => {
    return [...Array(24)].map((_, i) => ({
      width: ((i * 13 % 7) * 0.5 + 1) + 'px',
      height: ((i * 17 % 100) + 20) + '%'
    }));
  }, []);

  return (
    <main className="bg-[#0A0A0A] min-h-screen">
      {!splashDone && <SplashScreen onDone={completeSplash} />}

      <Navbar visible={heroDetailsVisible} />

      {/* SECTION 1 — HERO */}
      <section
        id="hero-section"
        data-zoom="in"
        className="bg-[#E8DCC8] text-[#1A1612] relative z-10"
      >
        <div className="parallax-bg bg-[#E8DCC8]"></div>
        <div className="section-inner relative z-10 pt-32 pb-10 flex flex-col min-h-screen">

          {/* Main Wordmark */}
          <div className="flex-grow flex flex-col justify-center items-center px-6 md:px-12 mt-12 mb-10">
            <div className={`w-full max-w-6xl flex items-center justify-center md:justify-between gap-6 text-[10px] tracking-[0.32em] uppercase mb-8 text-[#1A1612]/60 transition-all duration-700 ${
              heroDetailsVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-2 opacity-0 blur-[2px]'
            }`}>
              <span>Official Site</span>
              <span className="hidden md:inline">Press · Merch · Bookings</span>
              <span className="hidden md:inline">Proof On Request</span>
            </div>
            <h1
              id="hero-wordmark"
              className="font-sans text-[15vw] leading-[0.8] tracking-tighter text-[#1A1612] w-full text-center"
              style={{
                opacity: heroVisible ? 1 : 0,
                transition: 'opacity 0.9s ease',
              }}
            >
              <TextScramble text="VAMPIRE SEX" active={heroVisible} duration={1800} />
            </h1>

            <div
              id="hero-proof-panel"
              className={`w-full max-w-6xl mt-8 grid gap-8 transition-all duration-700 md:grid-cols-[1.4fr_0.8fr] md:items-end ${
                heroDetailsVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-4 opacity-0 blur-[2px]'
              }`}
            >
              <div className="max-w-2xl">
                <p className="text-base md:text-lg leading-relaxed tracking-[0.08em] uppercase text-[#1A1612]/80">
                  Miami minimal tech house duo with 2.71M streams, 44 chart placements, 300 DJ supports, and ADE 2025 on the record.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection('#epk-section')}
                    className="min-h-[48px] bg-[#1A1612] px-6 py-3 text-[#F2EDE4] font-sans text-xl tracking-[0.12em] uppercase transition-colors hover:bg-[#4A7C3F]"
                  >
                    Listen + Press
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(true)}
                    className="min-h-[48px] border-[1.5px] border-[#1A1612] px-6 py-3 font-sans text-xl tracking-[0.12em] uppercase transition-colors hover:border-[#4A7C3F] hover:text-[#4A7C3F]"
                  >
                    Book Now
                  </button>
                  <Link
                    href="/epk"
                    className="min-h-[48px] border-[1.5px] border-[#1A1612]/30 px-6 py-3 font-sans text-xl tracking-[0.12em] uppercase transition-colors hover:border-[#1A1612] hover:bg-[#1A1612] hover:text-[#F2EDE4]"
                  >
                    One-Sheet
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t-[1.5px] border-[#1A1612]/20 pt-6 md:border-t-0 md:border-l-[1.5px] md:pl-8">
                {[
                  ['2.71M', 'Streams'],
                  ['44', 'Charts'],
                  ['300', 'DJ Supports'],
                  ['ADE 2025', 'Booked'],
                ].map(([value, label], index) => {
                  const active = heroProofStep >= index + 1;
                  return (
                    <div
                      key={label}
                      className={`space-y-1 transition-all duration-500 ${
                        active ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-4 opacity-0 blur-[2px]'
                      }`}
                    >
                      <p className="font-sans text-3xl md:text-4xl tracking-tight">{active ? value : '—'}</p>
                      <p className="text-[10px] tracking-[0.28em] uppercase text-[#1A1612]/55">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Green Accent Bar */}
          <div className={`w-full bg-[#4A7C3F] text-[#F2EDE4] border-y-[1.5px] border-[#1A1612] py-3 px-6 md:px-12 flex items-center justify-center transition-all duration-700 ${
            heroDetailsVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-[2px]'
          }`}>
            <span className="text-center text-sm tracking-[0.24em] uppercase">Miami, FL — Minimal Tech House — Est. 2020</span>
          </div>

          {/* Bottom Right Elements */}
          <div className={`absolute bottom-6 right-6 md:right-12 items-end gap-6 hidden md:flex transition-all duration-700 ${
            heroDetailsVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-[2px]'
          }`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1612" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <div className="flex gap-[2px] h-12 items-end">
              {barcodeBars.map((style, i) => (
                <div key={i} className="bg-[#1A1612]" style={style}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NORMALIZE IT — typewriter text between blob and about */}
      <div id="normalize-section" className="relative z-[17] flex min-h-[420px] items-center justify-center overflow-hidden bg-[#E8DCC8] py-16 text-[#1A1612] md:min-h-[460px]">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.18]" aria-hidden="true">
          <svg className="h-full w-full max-w-[1500px]" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="normalize-e8-glow" cx="50%" cy="50%" r="52%">
                <stop offset="0%" stopColor="#4A7C3F" stopOpacity="0.48" />
                <stop offset="44%" stopColor="#8B0000" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#1A1612" stopOpacity="0" />
              </radialGradient>
              <pattern id="normalize-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1A1612" strokeOpacity="0.18" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="520" fill="url(#normalize-grid)" />
            <circle cx="600" cy="260" r="230" fill="url(#normalize-e8-glow)" />
            {[64, 104, 148, 194].map((radius) => (
              <circle key={radius} cx="600" cy="260" r={radius} fill="none" stroke="#1A1612" strokeOpacity="0.42" strokeWidth="1.5" />
            ))}
            {Array.from({ length: 24 }).map((_, index) => {
              const angle = (index / 24) * Math.PI * 2;
              const x1 = 600 + Math.cos(angle) * 64;
              const y1 = 260 + Math.sin(angle) * 64;
              const x2 = 600 + Math.cos(angle) * 194;
              const y2 = 260 + Math.sin(angle) * 194;
              return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A7C3F" strokeOpacity="0.34" strokeWidth="1" />;
            })}
            {Array.from({ length: 48 }).map((_, index) => {
              const ring = index % 3;
              const radius = [104, 148, 194][ring];
              const angle = (index / 48) * Math.PI * 2 + ring * 0.22;
              const x = 600 + Math.cos(angle) * radius;
              const y = 260 + Math.sin(angle) * radius;
              return <circle key={index} cx={x} cy={y} r={ring === 2 ? 3.5 : 2.5} fill={ring === 1 ? '#8B0000' : '#1A1612'} fillOpacity="0.58" />;
            })}
            <path d="M170 260 H1030" stroke="#1A1612" strokeOpacity="0.22" strokeWidth="1.5" />
            <path d="M600 30 V490" stroke="#1A1612" strokeOpacity="0.18" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#4A7C3F]/55 to-transparent" aria-hidden="true" />
        <h2 className="relative z-10 bg-[#E8DCC8]/72 px-6 font-sans text-[12vw] tracking-tight text-[#1A1612] backdrop-blur-[1px] md:text-[4vw]">
          <TypewriterText charDelay={0.06}>Normalize It</TypewriterText>
        </h2>
      </div>

      {/* HANDSTYLE MARK — short magnetic parallax flash after Normalize It */}
      <section data-zoom="neutral" data-compact className="magnetic-mark-section relative z-[18] flex h-[30vh] min-h-[220px] items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 text-[#F2EDE4] md:h-[34vh]">
        <div className="parallax-bg magnetic-mark-field flex items-center justify-center" aria-hidden="true">
          <Image
            src="/images/vampire-sex-red-handstyle-logo.jpeg"
            alt=""
            width={1024}
            height={1024}
            priority={false}
            className="magnetic-mark-logo h-auto w-[76vw] max-w-[680px] object-contain opacity-55 mix-blend-screen blur-[0.2px] saturate-[0.98] drop-shadow-[0_0_38px_rgba(139,0,0,0.42)]"
          />
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A7C3F]/55 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4A7C3F]/35 to-transparent" aria-hidden="true" />
      </section>

      {/* SECTION 2 — ABOUT / 4-QUADRANT GRID */}
      <section id="about-section" data-zoom="neutral" data-section-intro="bone" className="bg-[#E8DCC8] text-[#1A1612] border-y-[1.5px] border-[#1A1612] relative z-20 overflow-hidden">

        {/* Vertical dividing line.
            All positioning via inline style — [data-zoom]>* CSS forces
            position:relative on direct children (overrides Tailwind's `absolute`),
            so inline styles (highest specificity) are the only reliable escape. */}
        <div
          className="hidden md:block"
          style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', marginLeft: '-1px', zIndex: 10 }}
        >
          <div id="about-vline" style={{ width: '100%', height: '100%', backgroundColor: 'rgba(26,22,18,0.6)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Q1 — Globe: GSAP spin + mouse tilt + scroll burst */}
          <div className="about-quad p-12 md:p-24 flex flex-col items-center justify-center min-h-[320px] md:min-h-[380px]">
            <GlobeSymbol />
          </div>

          {/* Q2 — Three-part text: typewriter / slot machine / glitch */}
          <div className="about-quad p-12 md:p-24 flex items-center min-h-[320px] md:min-h-[380px]">
            <p className="text-lg md:text-xl leading-relaxed max-w-lg">
              <TypewriterText>
                Vampire Sex is a Miami minimal tech house duo built for packed rooms, heavy low end, and records that survive past the first weekend.
              </TypewriterText>
              <br /><br />
              <SlotMachineText>Streaming proof. Club proof.</SlotMachineText>
              {' '}
              <GlitchText>No filler.</GlitchText>
            </p>
          </div>

          {/* Horizontal dividing line — draws left→right, spans both columns */}
          <div className="md:col-span-2 overflow-hidden" style={{ height: '2px' }}>
            <div id="about-hline" className="w-full h-full" style={{ backgroundColor: 'rgba(26,22,18,0.6)' }} />
          </div>

          {/* Q3 — What we are */}
          <div className="about-quad p-12 md:p-24 flex items-center min-h-[280px] md:min-h-[340px]">
            <div className="space-y-5 max-w-md">
              <p className="text-[9px] tracking-[0.35em] opacity-40 uppercase">What we are</p>
              <p className="text-base leading-relaxed">
                An established act with real chart history, DJ support, and a catalog that already moved at scale. The site should feel like a home base, not a mystery exam.
              </p>
            </div>
          </div>

          {/* Q4 — The ethos */}
          <div className="about-quad p-12 md:p-24 flex items-center min-h-[280px] md:min-h-[340px]">
            <div className="space-y-5 max-w-md">
              <p className="text-[9px] tracking-[0.35em] opacity-40 uppercase">The ethos</p>
              <p className="text-base leading-relaxed">
                Dark taste still matters, but proof matters more. The best version of this world leads with music, bookings, and product, then lets the atmosphere deepen the story.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3 — MARQUEE TICKER */}
      <section data-zoom="neutral" data-compact data-section-intro="thin" className="bg-[#1A1612] text-[#F2EDE4] py-4 overflow-hidden border-b-[1.5px] border-[#4A7C3F] relative z-20">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center font-sans text-xl sm:text-3xl md:text-4xl tracking-wide">
              <span className="mx-6">VAMPIRE SEX</span>
              <span className="text-[#4A7C3F]">✦</span>
              <span className="mx-6">CRIMSON BLOODLINE</span>
              <span className="text-[#4A7C3F]">✦</span>
              <span className="mx-6">UNDERGROUND MUSIC</span>
              <span className="text-[#4A7C3F]">✦</span>
              <span className="mx-6">LIMITED 50 UNITS</span>
              <span className="text-[#4A7C3F]">✦</span>
              <span className="mx-6">NO RESTOCK</span>
              <span className="text-[#4A7C3F]">✦</span>
              <span className="mx-6">DROP 001</span>
              <span className="text-[#4A7C3F]">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — PRODUCT GRID */}
      <section id="products-section" data-zoom="out" data-section-intro="dark" className="bg-[#0A0A0A] text-[#F2EDE4] py-24 px-6 md:px-12 relative z-30">
        <div className="parallax-bg bg-[#0A0A0A]"></div>
        <div className="section-inner section-intro-content relative z-10 max-w-[1600px] mx-auto">
          <CrimsonHeader />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[0.5px] bg-[#1A1612] border-[0.5px] border-[#1A1612]">
            {/* Card 1 — top-left (2-col): zoom IN */}
            <div id="product-tl" className="md:col-span-2 bg-[#E8DCC8] text-[#1A1612] p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-transparent relative product-card">
              <div className="aspect-[4/3] relative mb-8 bg-[#0A0A0A]/5">
                <Image src="/images/vs_urban_tees_1776346145677.jpg" alt="Crimson Relic Tee" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-contain object-center mix-blend-multiply" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-sans text-5xl mb-2 tracking-tighter">CRIMSON RELIC TEE</h3>
                  <p className="text-sm opacity-60">BLOODLINE 01 — ED. OF 100</p>
                </div>
                <div className="text-xl">$45</div>
              </div>
            </div>

            {/* Card 2 — top-right: zoom OUT */}
            <div id="product-tr" className="bg-[#0A0A0A] p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-transparent relative product-card">
              <div className="aspect-square relative mb-8 bg-[#1A1612]">
                <Image src="/images/vs_urban_hoodies_1776346269547.jpg" alt="Void Covenant Hoodie" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-center opacity-80" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-sans text-4xl mb-2 tracking-tighter">VOID COVENANT HOODIE</h3>
                  <p className="text-sm opacity-60">BLOODLINE 01 — ED. OF 50</p>
                </div>
                <div className="text-xl">$85</div>
              </div>
            </div>

            {/* Card 3 — bottom-left: zoom OUT */}
            <div id="product-bl" className="bg-[#0A0A0A] p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-transparent relative product-card">
              <div className="absolute top-4 right-4 bg-[#4A7C3F] text-[#F2EDE4] text-xs px-2 py-1 z-10">LOW STOCK</div>
              <div className="aspect-square relative mb-8 bg-[#1A1612]">
                <Image src="/images/vs_studio_caps_1776346579559.jpg" alt="Nocturne Crown Snapback" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-center opacity-80" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-sans text-4xl mb-2 tracking-tighter">NOCTURNE CROWN SNAPBACK</h3>
                  <p className="text-sm opacity-60">BLOODLINE 01 — ED. OF 50</p>
                </div>
                <div className="text-xl">$35</div>
              </div>
            </div>

            {/* Card 4 — bottom-right (2-col): zoom IN */}
            <div id="product-br" className="md:col-span-2 bg-[#0A0A0A] p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-transparent relative product-card">
              <div className="aspect-[3/2] relative mb-8 bg-[#1A1612]">
                <Image src="/images/vs_studio_jackets_1776346376867.jpg" alt="Parish Cloak Jacket" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-contain object-center opacity-80" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-sans text-5xl mb-2 tracking-tighter">PARISH CLOAK JACKET</h3>
                  <p className="text-sm opacity-60">BLOODLINE 01 — ED. OF 25</p>
                </div>
                <div className="text-xl">$120</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HEX VENOM USB FEATURE */}
      <section id="usb-section" data-zoom="in" data-section-intro="green" className="bg-[#1A1612] text-[#F2EDE4] border-y-[1.5px] border-[#4A7C3F] relative z-40 overflow-hidden">
        <div className="section-intro-content grid grid-cols-1 md:grid-cols-12 max-w-[1600px] mx-auto min-h-[400px]">
          <div className="md:col-span-6 lg:col-span-5 relative h-[400px] md:h-auto border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-[#4A7C3F] overflow-hidden group">
            <Image
              src="/images/vs_hex_venom_usb_1776351651692.jpg"
              alt="Hex Venom USB Concept"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612] to-transparent opacity-60"></div>
          </div>
          <div className="md:col-span-6 lg:col-span-7 p-12 flex flex-col justify-center from-right bg-[#1A1612]/80 backdrop-blur-sm relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-[#4A7C3F] text-[#F2EDE4] text-[10px] tracking-[0.2em] px-2 py-1 uppercase">Physical Drop</span>
              <span className="text-[#4A7C3F] text-[10px] tracking-[0.2em] font-mono">ED. 001/050</span>
            </div>
            <h2 className="font-sans text-7xl tracking-tighter mb-6 leading-none italic uppercase">HEX VENOM USB</h2>
            <div className="space-y-4 max-w-lg mb-8">
              <p className="text-lg opacity-90 leading-relaxed font-light">
                Premium 32GB industrial-grade storage. Pre-loaded with <span className="text-[#4A7C3F]">The Unreleased Sex Tapes</span>, isolated stems, and exclusive Miami live sets.
              </p>
              <ul className="text-xs tracking-widest opacity-60 space-y-2 uppercase">
                <li>• Hand-numbered & Laser Engraved</li>
                <li>• Rugged Zinc Alloy Housing</li>
                <li>• Instant Access to High-Fidelity WAVs</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8 border-t border-[#4A7C3F]/30 pt-8">
              <div className="text-5xl font-sans tracking-tighter text-[#4A7C3F] italic">$75</div>
              <button
                type="button"
                onClick={() => scrollToSection('#bloodline-section')}
                className="bg-[#E8DCC8] text-[#1A1612] px-12 py-5 font-sans text-2xl tracking-[0.1em] hover:bg-[#4A7C3F] hover:text-[#F2EDE4] transition-all duration-300 w-full sm:w-auto uppercase italic"
              >
                Join the Waitlist
              </button>
            </div>

            {/* USB Contents & Specs */}
            <div className="grid grid-cols-2 gap-6 border-t border-[#4A7C3F]/30 pt-8 mt-8">
              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.35em] text-[#4A7C3F] uppercase">What&apos;s Loaded</p>
                <ul className="text-[11px] tracking-widest opacity-70 space-y-2 uppercase">
                  <li>12 Unreleased Tracks</li>
                  <li>8 Isolated Stems</li>
                  <li>3 Live Set Recordings</li>
                  <li>Exclusive DJ Tools</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.35em] text-[#4A7C3F] uppercase">Specs</p>
                <ul className="text-[11px] tracking-widest opacity-70 space-y-2 uppercase">
                  <li>32GB USB 3.0</li>
                  <li>Zinc Alloy Shell</li>
                  <li>WAV / 24-bit / 48kHz</li>
                  <li>Serialized 001–050</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#4A7C3F]/30 pt-6 mt-6 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] opacity-30 uppercase font-mono">Limited to 50 Units Worldwide</span>
              <span className="text-[10px] tracking-[0.3em] text-[#4A7C3F] uppercase">Ships Q3 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — BOOKINGS & EPK */}
      <section id="epk-section" data-zoom="neutral" data-section-intro="dark" className="bg-[#0A0A0A] text-[#F2EDE4] py-24 px-6 md:px-12 relative z-50 overflow-hidden">
        {/* Animated background texture */}
        <div className="epk-noise-wrap absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" className="opacity-[0.04]">
            <filter id="epk-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" result="noise">
                <animate attributeName="seed" values="0;100" dur="3s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#epk-noise)" />
          </svg>
        </div>
        <div className="section-intro-content max-w-[1600px] mx-auto from-bottom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 relative z-10">

            {/* Left Column: EPK & Media Player */}
            <div className="space-y-12">
              <div>
                <h2 className="font-sans text-6xl tracking-tighter mb-6">PRESS + ONE-SHEET</h2>
                <a
                  href="/epk"
                  className="inline-flex items-center gap-4 bg-[#E8DCC8] text-[#1A1612] px-8 py-4 font-sans text-2xl tracking-wide hover:bg-[#4A7C3F] hover:text-[#F2EDE4] transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  VIEW ONE-SHEET
                </a>
              </div>

              <MediaPlayer autoPlayOnMount={autoplayDiscoPartyBaby} />
            </div>

            {/* Right Column: Stats & Bookings */}
            <div className="space-y-12 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="font-sans text-5xl tracking-tighter">BOOK VAMPIRE SEX</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full text-left bg-[#1A1612] text-[#F2EDE4] border-[1.5px] border-[#4A7C3F] p-8 flex justify-between items-center group hover:bg-[#4A7C3F] transition-colors"
                >
                  <span className="font-sans text-3xl tracking-widest">MAKE AN OFFER</span>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="group-hover:translate-x-2 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCounter end={2.71} suffix="M" label="Total Streams" />
                <StatCounter end={44} label="Chart Placements" />
                <StatCounter end={300} label="DJ Supports" />
                <StatCounter end={9.9} suffix="M" label="Total Video Views" />
              </div>

            </div>

          </div>

          {/* EDITORIAL TYPE BLOCK */}
          <div id="editorial-block" className="mt-24 w-full border-[1.5px] border-[#4A7C3F] overflow-hidden bg-[#0A0A0A] flex flex-col justify-between px-8 md:px-16 py-12 md:py-16 gap-8">
            <div className="flex justify-between items-start">
              <span className="text-[9px] tracking-[0.35em] text-[#4A7C3F] uppercase">Underground Music & Streetwear</span>
              <span className="text-[9px] tracking-[0.25em] text-[#F2EDE4]/30 font-mono uppercase">Miami, FL</span>
            </div>
            <div className="overflow-hidden">
              <h2
                className="font-sans text-[13vw] md:text-[10vw] leading-[0.82] tracking-tighter text-[#F2EDE4] from-left"
                id="editorial-wordmark"
              >
                VAMPIRE<br />SEX
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-t-[1.5px] border-[#4A7C3F]/20 pt-6">
              <div className="max-w-md">
                <SplitFlapText
                  ref={splitFlapRef}
                  id="editorial-splitflap"
                  className="text-xs tracking-widest"
                  staggerMs={60}
                  flipOutStaggerMs={25}
                >
                  2.71M STREAMS · 44 CHARTS · 300 DJ SUPPORTS · ADE 2025
                </SplitFlapText>
              </div>
              <span className="border border-[#4A7C3F] text-[#E8DCC8] px-3 py-1 text-[9px] tracking-widest uppercase whitespace-nowrap">Aesthetic No.1</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — BLOODLINE REGISTRY */}
      <section id="bloodline-section" data-zoom="neutral" data-section-intro="blood" className="bg-[#0A0A0A] text-[#F2EDE4] py-36 px-6 md:px-12 relative z-50 overflow-hidden border-t-[1.5px] border-[#1A1612]">
        {/* Bloodline atmosphere — red signal without overwhelming the form */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" id="bloodline-ghost">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,0,0,0.32),rgba(120,0,0,0.15)_34%,rgba(10,10,10,0)_68%)]" />
          <div className="absolute left-1/2 top-1/2 h-[72vw] w-[72vw] max-w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF1A1A]/18 bg-[#8B0000]/10 blur-[1px]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#FF1A1A]/45 to-transparent" />
          <span
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 -rotate-6 border-[1.5px] border-[#FF1A1A]/35 px-6 py-3 font-sans text-[10vw] leading-none tracking-[0.04em] text-[#FF1A1A]/55 md:text-[7vw]"
            style={{
              WebkitTextFillColor: 'rgba(255, 26, 26, 0.55)',
              textShadow: '0 0 34px rgba(255, 0, 0, 0.34)',
            }}
          >
            BLOODLINE
          </span>
        </div>

        <div id="bloodline-content" className="section-intro-content relative z-10 mx-auto flex max-w-[1040px] flex-col items-center gap-8 border-[1.5px] border-[#FF1A1A]/20 bg-[#0A0A0A]/68 px-6 py-14 text-center shadow-[0_0_90px_rgba(139,0,0,0.24)] backdrop-blur-sm md:px-12">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C3F] animate-pulse"></div>
            <span className="text-[10px] tracking-[0.4em] text-[#4A7C3F] uppercase">Registry Open — 88 Spots Remaining</span>
          </div>

          <h2 className="font-sans text-[10vw] leading-none tracking-tighter from-left md:text-[8vw]">
            JOIN THE<br />BLOODLINE
          </h2>

          <div className="flex flex-col gap-2 max-w-xs">
            {['First access.', 'Exclusive unreleased.', 'No restock.', 'No exceptions.'].map((line, i) => (
              <p
                key={line}
                className="bloodline-line text-xs tracking-[0.2em] opacity-0 uppercase"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                {line}
              </p>
            ))}
          </div>

          {registrySubmitted ? (
            <div className="flex flex-col items-center gap-3 mt-2 from-left">
              <div className="flex items-center gap-3 border-[1.5px] border-[#4A7C3F] px-8 py-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C3F]"></div>
                <span className="text-xs tracking-[0.25em] text-[#4A7C3F] uppercase">Access Secured — You&apos;re In</span>
              </div>
              <span className="text-[10px] tracking-widest opacity-30">Watch your inbox.</span>
            </div>
          ) : (
            <>
              <form
                className="flex flex-col sm:flex-row gap-0 w-full max-w-lg from-left mt-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const email = new FormData(form).get('email') as string;
                  await submitRegistryEmail(email);
                }}
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="YOUR EMAIL ADDRESS"
                  className="flex-1 bg-transparent border-[1.5px] border-[#4A7C3F] sm:border-r-0 px-4 py-3 min-h-[44px] text-[#F2EDE4] text-xs tracking-widest placeholder:opacity-30 focus:outline-none focus:border-[#E8DCC8] transition-colors"
                />
                <button
                  type="submit"
                  disabled={registryLoading}
                  className="bg-[#4A7C3F] text-[#F2EDE4] px-8 py-4 font-sans text-xs tracking-[0.25em] uppercase hover:bg-[#E8DCC8] hover:text-[#1A1612] transition-all duration-300 border-[1.5px] border-[#4A7C3F] whitespace-nowrap"
                >
                  {registryLoading ? 'SECURING...' : 'SECURE ACCESS'}
                </button>
              </form>
              {registryError && (
                <p className="text-[10px] tracking-[0.18em] text-[#8B0000] uppercase">{registryError}</p>
              )}
              <div className="flex items-center gap-3 text-[10px] tracking-widest mt-2">
                <span className="font-mono text-[#4A7C3F]">412</span>
                <span className="opacity-30">/ 500 MEMBERS REGISTERED</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* SECTION 8 — STREAMING PLATFORMS STRIP */}
      <section data-zoom="neutral" data-compact className="bg-[#1A1612] text-[#F2EDE4] py-6 px-6 md:px-12 relative z-50 border-y-[1.5px] border-[#4A7C3F]/20">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[9px] tracking-[0.35em] opacity-30 uppercase shrink-0">Stream Everywhere</span>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[10px] tracking-[0.25em]">
            <a href="https://open.spotify.com/artist/2qP2zz3K0jWe9OP7v7KLVV" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:text-[#4A7C3F] transition-all">SPOTIFY</a>
            <span className="opacity-15">·</span>
            <a href="https://www.traxsource.com/artist/702904/vampire-sex" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:text-[#4A7C3F] transition-all">TRAXSOURCE</a>
            <span className="opacity-15">·</span>
            <a href="https://www.beatport.com/artist/vampire-sex/982055" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:text-[#4A7C3F] transition-all">BEATPORT</a>
          </div>
          <span className="text-[9px] tracking-[0.25em] opacity-20 font-mono shrink-0 uppercase">Sex Sells Rec.</span>
        </div>
      </section>

      {/* SECTION 9 — FOOTER */}
      <section data-zoom="neutral" data-compact data-section-intro="bone" className="bg-[#E8DCC8] text-[#1A1612] pt-20 pb-12 px-6 md:px-12 relative z-50 overflow-hidden">
        <footer className="max-w-[1600px] mx-auto">

          {/* Massive closing wordmark — fade in on scroll */}
          <div className="overflow-hidden mb-16 from-left" data-fade-in>
            <h2 className="font-sans text-[16vw] leading-[0.85] tracking-tighter text-[#1A1612]">
              VAMPIRE<br />SEX
            </h2>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t-[1.5px] border-[#1A1612] pt-12 mb-12">
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.3em] opacity-40 uppercase">Label</p>
              <p className="text-sm tracking-wider">Sex Sells Records</p>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.3em] opacity-40 uppercase">Based In</p>
              <p className="text-sm tracking-wider">Miami, FL</p>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.3em] opacity-40 uppercase">Bookings</p>
              <a
                href="mailto:vampiresexworldwide@gmail.com"
                className="text-sm tracking-wider hover:text-[#4A7C3F] transition-colors block"
              >
                vampiresexworldwide<br />@gmail.com
              </a>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.3em] opacity-40 uppercase">Follow</p>
              <div className="flex flex-col gap-1">
                <a href="https://instagram.com/vampiresexworldwide" className="text-sm tracking-wider hover:text-[#4A7C3F] transition-colors">Instagram</a>
                <a href="https://open.spotify.com/artist/2qP2zz3K0jWe9OP7v7KLVV" target="_blank" rel="noopener noreferrer" className="text-sm tracking-wider hover:text-[#4A7C3F] transition-colors">Spotify</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t-[1.5px] border-[#1A1612]/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-[9px] tracking-[0.3em] opacity-40 uppercase">© Vampire Sex 2026 — All Rights Reserved</span>
            <span className="text-[9px] tracking-[0.3em] opacity-30 font-mono uppercase">Drop 001 — Bloodline Collection</span>
          </div>
        </footer>
      </section>

      {/* MAKE OFFER MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A0A0A]/90 backdrop-blur-sm">
          <div className="bg-[#1A1612] border-[1.5px] border-[#4A7C3F] w-full max-w-2xl relative shadow-2xl">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute top-6 right-6 text-[#F2EDE4] hover:text-[#4A7C3F] transition-colors z-10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="p-8 md:p-12">
              <h3 className="font-sans text-4xl tracking-tighter text-[#F2EDE4] mb-8 border-b-[1.5px] border-[#4A7C3F] pb-4">SUBMIT AN OFFER</h3>
              {offerSubmitted ? (
                <div className="py-16 flex flex-col items-center gap-6 text-center">
                  <div className="w-2 h-2 rounded-full bg-[#4A7C3F]"></div>
                  <p className="font-sans text-3xl tracking-tighter text-[#F2EDE4]">Offer Received.</p>
                  <p className="text-xs tracking-[0.2em] opacity-50 uppercase">We&apos;ll be in touch at vampiresexworldwide@gmail.com</p>
                  <button
                    type="button"
                    onClick={() => { setIsOfferModalOpen(false); setOfferSubmitted(false); }}
                    className="mt-4 text-xs tracking-[0.25em] opacity-40 hover:opacity-100 transition-opacity uppercase"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  setOfferLoading(true);
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  try {
                    const res = await fetch('/api/offer', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        event: fd.get('event'),
                        date: fd.get('date'),
                        amount: fd.get('amount'),
                        context: fd.get('context'),
                      }),
                    });
                    if (res.ok) setOfferSubmitted(true);
                  } finally {
                    setOfferLoading(false);
                  }
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="offer-event" className="text-xs tracking-widest text-[#F2EDE4]/60 uppercase">Event Name / Promoter</label>
                      <input id="offer-event" name="event" type="text" required className="w-full bg-[#0A0A0A] border-[1.5px] border-[#4A7C3F] p-4 text-[#F2EDE4] focus:outline-none focus:border-[#E8DCC8] transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="offer-date" className="text-xs tracking-widest text-[#F2EDE4]/60 uppercase">Date & Location</label>
                      <input id="offer-date" name="date" type="text" required className="w-full bg-[#0A0A0A] border-[1.5px] border-[#4A7C3F] p-4 text-[#F2EDE4] focus:outline-none focus:border-[#E8DCC8] transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="offer-amount" className="text-xs tracking-widest text-[#F2EDE4]/60 uppercase">Offer Amount ($USD)</label>
                    <input id="offer-amount" name="amount" type="number" required placeholder="10000" className="w-full bg-[#0A0A0A] border-[1.5px] border-[#4A7C3F] p-4 text-[#F2EDE4] font-sans text-2xl tracking-widest focus:outline-none focus:border-[#E8DCC8] transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="offer-context" className="text-xs tracking-widest text-[#F2EDE4]/60 uppercase">Additional Context</label>
                    <textarea id="offer-context" name="context" rows={3} className="w-full bg-[#0A0A0A] border-[1.5px] border-[#4A7C3F] p-4 text-[#F2EDE4] focus:outline-none focus:border-[#E8DCC8] transition-colors"></textarea>
                  </div>
                  <button type="submit" disabled={offerLoading} className="w-full bg-[#E8DCC8] text-[#1A1612] py-4 font-sans text-2xl tracking-wide hover:bg-[#4A7C3F] hover:text-[#F2EDE4] transition-colors disabled:opacity-50">
                    {offerLoading ? 'SENDING...' : 'SEND OFFER'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BLOODLINE DISCOUNT OVERLAY */}
      {isBloodlinePopupOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6 bg-[#0A0A0A]/95 backdrop-blur-md"
          onClick={closeBloodlinePopup}
        >
          <div
            className="relative w-full max-w-xl overflow-hidden border-[1.5px] border-[#8B0000] bg-[#0A0A0A]/95 text-[#F2EDE4] shadow-[0_0_100px_rgba(139,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 pointer-events-none opacity-65 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.7),transparent_45%),linear-gradient(135deg,rgba(74,124,63,0.18),transparent_35%,rgba(139,0,0,0.24))]" />
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#4A7C3F] to-transparent" />
            <button
              type="button"
              aria-label="Close Bloodline discount"
              onClick={closeBloodlinePopup}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center border border-[#F2EDE4]/15 bg-[#0A0A0A]/70 text-[#F2EDE4]/70 transition-colors hover:border-[#4A7C3F] hover:text-[#4A7C3F]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="relative z-10 p-7 md:p-10">
              <div className="mb-6 flex items-center justify-between gap-4 pr-8">
                <span className="text-[10px] tracking-[0.36em] text-[#4A7C3F] uppercase">Bloodline Invite</span>
                <span className="border border-[#8B0000] px-3 py-1 font-mono text-[10px] tracking-[0.24em] text-[#F2EDE4]/70">20% OFF</span>
              </div>

              {registrySubmitted ? (
                <div className="py-8 text-center">
                  <p className="font-sans text-5xl md:text-6xl leading-none tracking-tighter">YOU&apos;RE IN.</p>
                  <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed tracking-[0.18em] text-[#F2EDE4]/60 uppercase">
                    Check your inbox for code <span className="text-[#4A7C3F]">fangclub</span>. Use it for 20% off any purchase over $55.
                  </p>
                  <button
                    type="button"
                    onClick={closeBloodlinePopup}
                    className="mt-8 border border-[#4A7C3F] px-7 py-3 font-sans text-xl tracking-[0.12em] text-[#4A7C3F] transition-colors hover:bg-[#4A7C3F] hover:text-[#0A0A0A]"
                  >
                    ENTER SITE
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-sans text-6xl md:text-7xl leading-[0.86] tracking-tighter">
                    JOIN THE<br />BLOODLINE
                  </h3>
                  <p className="mt-5 max-w-md text-sm leading-relaxed tracking-[0.08em] text-[#F2EDE4]/72 uppercase">
                    Get 20% off your first Vampire Sex purchase and early access to limited drops.
                  </p>

                  <form
                    className="mt-8 space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const email = new FormData(e.currentTarget).get('email') as string;
                      await submitRegistryEmail(email);
                    }}
                  >
                    <div className="flex flex-col gap-0 sm:flex-row">
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="YOUR EMAIL"
                        className="min-h-[50px] flex-1 border-[1.5px] border-[#4A7C3F] bg-[#1A1612] px-4 py-3 text-xs tracking-[0.2em] text-[#F2EDE4] placeholder:text-[#F2EDE4]/25 focus:border-[#E8DCC8] focus:outline-none sm:border-r-0"
                      />
                      <button
                        type="submit"
                        disabled={registryLoading}
                        className="min-h-[50px] bg-[#4A7C3F] px-7 py-3 font-sans text-xl tracking-[0.12em] text-[#F2EDE4] transition-colors hover:bg-[#E8DCC8] hover:text-[#1A1612] disabled:opacity-50"
                      >
                        {registryLoading ? 'SENDING' : 'GET CODE'}
                      </button>
                    </div>
                    {registryError && (
                      <p className="text-[10px] tracking-[0.18em] text-[#E8DCC8] uppercase">{registryError}</p>
                    )}
                    <p className="text-[9px] leading-relaxed tracking-[0.18em] text-[#F2EDE4]/40 uppercase">
                      Code: fangclub. Valid through June 2, 2026. Minimum purchase $55. One code per customer.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

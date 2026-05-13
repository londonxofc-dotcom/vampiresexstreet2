'use client';

import { useScrollAnimations } from '@/hooks/useScrollAnimations';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import CrimsonHeader from '@/components/CrimsonHeader';
import GlobeSymbol from '@/components/GlobeSymbol';
import TypewriterText from '@/components/TypewriterText';
import TextScramble from '@/components/TextScramble';
import Navbar from '@/components/Navbar';
import { MediaPlayer } from '@/components/MediaPlayer';
import VideoIntro from '@/components/VideoIntro';
import SoundToggle from '@/components/SoundToggle';
import SectionNav from '@/components/SectionNav';

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceIntro = params.has('intro') || params.has('fresh');
    if (!forceIntro && window.sessionStorage.getItem('vss-video-intro-seen') === 'true') {
      setIntroDone(true);
    }
  }, []);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  useScrollAnimations(introDone ? 'ready' : 'waiting');

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
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMobileState = () => setIsMobileViewport(media.matches);

    updateMobileState();
    media.addEventListener('change', updateMobileState);
    return () => media.removeEventListener('change', updateMobileState);
  }, []);

  useEffect(() => {
    if (!introDone) return;

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
  }, [introDone]);

  useEffect(() => {
    if (!introDone) return;

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    window.history.scrollRestoration = 'manual';
    resetScroll();
    const raf = window.requestAnimationFrame(resetScroll);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [introDone]);

  useEffect(() => {
    if (!heroIntroStarted) return;

    document.body.style.overflow = 'hidden';

    const wordmarkDelay = isMobileViewport ? 160 : 120;
    const detailsDelay = isMobileViewport ? 1450 : 2050;
    const revealWordmark = window.setTimeout(() => setHeroVisible(true), wordmarkDelay);
    const revealDetails = window.setTimeout(() => {
      setHeroDetailsVisible(true);
      document.body.style.overflow = '';
    }, detailsDelay);

    return () => {
      window.clearTimeout(revealWordmark);
      window.clearTimeout(revealDetails);
      document.body.style.overflow = '';
    };
  }, [heroIntroStarted, isMobileViewport]);

  useEffect(() => {
    if (!introDone) return;
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
  }, [bloodlinePopupDismissed, introDone, registrySubmitted]);

  const completeIntro = useCallback(() => {
    window.sessionStorage.setItem('vss-video-intro-seen', 'true');
    setIntroDone(true);
  }, []);

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

  const lightCtaClass = 'min-h-[54px] border-[1.5px] border-[#1A1612] bg-transparent px-7 py-4 text-center font-sans text-xl tracking-[0.12em] uppercase text-[#1A1612] transition-colors hover:border-[#4A7C3F] hover:bg-[#4A7C3F] hover:text-[#F2EDE4]';
  const darkCtaClass = 'min-h-[52px] border-[1.5px] border-[#4A7C3F] bg-transparent px-5 py-4 text-center font-sans text-xl uppercase tracking-[0.14em] text-[#F2EDE4] transition-colors hover:bg-[#4A7C3F] hover:text-[#F2EDE4]';

  return (
    <main className="min-h-[100dvh] bg-[#0A0A0A]">
      {!introDone && <VideoIntro onDone={completeIntro} />}

      <Navbar visible={introDone && (heroIntroStarted || heroDetailsVisible)} />
      <SectionNav visible={introDone && heroDetailsVisible} />
      <SoundToggle visible={introDone} />

      {/* SECTION 1 — HERO */}
      <section
        id="hero-section"
        data-zoom="in"
        className="bg-[#E8DCC8] text-[#1A1612] relative z-10"
      >
        <div className="parallax-bg bg-[#E8DCC8]"></div>
        <div className="section-inner relative z-10 flex min-h-[100dvh] flex-col pt-32 pb-10">

          {/* Main Wordmark */}
          <div className="flex-grow flex flex-col justify-center items-center px-6 md:px-12 mt-12 mb-10">
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
              className={`mt-10 flex w-full max-w-4xl flex-col justify-center gap-3 transition-all duration-500 sm:flex-row ${
                heroDetailsVisible ? 'hero-cta-sequence translate-y-0 opacity-100 blur-0' : 'translate-y-4 opacity-0 blur-[2px]'
              }`}
            >
              <button
                type="button"
                onClick={() => scrollToSection('#epk-section')}
                className={`${lightCtaClass} hero-cta-button hero-cta-listen`}
              >
                Listen
              </button>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className={`${lightCtaClass} hero-cta-button hero-cta-book`}
              >
                Book
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('#bloodline-section')}
                className={`${lightCtaClass} hero-cta-button hero-cta-bloodline`}
              >
                Join Bloodline
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* IDENTITY STRIPE — restored mobile/readability anchor */}
      <section
        id="identity-stripe"
        data-zoom="neutral"
        data-compact
        className="relative z-[16] border-y-[1.5px] border-[#1A1612] bg-[#4A7C3F] px-6 py-3 text-[#F2EDE4] md:px-12"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-1 text-center sm:flex-row sm:justify-between">
          <span className="text-[10px] tracking-[0.34em] uppercase">Underground Music</span>
          <span className="text-[10px] tracking-[0.24em] uppercase opacity-80">Miami, FL — Minimal Tech House — Est. 2020</span>
          <span className="text-[10px] tracking-[0.34em] uppercase">Streetwear</span>
        </div>
      </section>

      {/* SECTION 2 — PROOF / CONTEXT */}
      <section id="about-section" data-zoom="neutral" data-section-intro="bone" className="bg-[#E8DCC8] text-[#1A1612] border-y-[1.5px] border-[#1A1612] relative z-30 overflow-hidden">
        <div className="section-intro-content mx-auto grid max-w-[1600px] grid-cols-1 md:grid-cols-12">
          <div className="border-b-[1.5px] border-[#1A1612] p-8 md:col-span-5 md:border-b-0 md:border-r-[1.5px] md:p-14 lg:p-20">
            <p className="mb-6 text-[10px] uppercase tracking-[0.42em] opacity-45">Proof before myth</p>
            <h2 className="font-sans text-[17vw] leading-[0.78] tracking-tighter md:text-[7vw]">
              BUILT FOR<br />PACKED ROOMS
            </h2>
            <p className="mt-8 max-w-md text-lg normal-case leading-7 tracking-normal opacity-75">
              Vampire Sex is not a costume page. It is a Miami minimal tech house project with streaming proof, chart history, DJ support, and a world that can expand into products without becoming a standard merch store.
            </p>
          </div>

          <div className="grid grid-cols-2 md:col-span-7">
            <div className="border-b border-r border-[#1A1612]/40 p-7 md:p-10">
              <p className="font-sans text-6xl leading-none tracking-tighter md:text-7xl">2.71M</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] opacity-55">Total Streams</p>
            </div>
            <div className="border-b border-[#1A1612]/40 p-7 md:p-10">
              <p className="font-sans text-6xl leading-none tracking-tighter md:text-7xl">9.9M</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] opacity-55">Video Views</p>
            </div>
            <div className="border-r border-[#1A1612]/40 p-7 md:p-10">
              <p className="font-sans text-6xl leading-none tracking-tighter md:text-7xl">44</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] opacity-55">Chart Placements</p>
            </div>
            <div className="p-7 md:p-10">
              <p className="font-sans text-6xl leading-none tracking-tighter md:text-7xl">300</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] opacity-55">DJ Supports</p>
            </div>
          </div>
        </div>
      </section>

      {/* NORMALIZE BACKDROP — short atmospheric bridge into products */}
      <div id="normalize-section" className="relative z-[18] flex h-[62vh] min-h-[360px] items-center justify-center overflow-hidden bg-[#E8DCC8] py-16 text-[#1A1612] md:h-[72vh]">
        <div className="normalize-crosshair absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <video
            className="normalize-video h-full w-full object-contain opacity-90"
            src="/video/normalize-crosshair-loop.mp4"
            poster="/images/normalize-crosshair-flow.png"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
        <h2 className="normalize-title pointer-events-none relative z-10 bg-transparent px-6 font-sans text-[12vw] tracking-tight text-[#1A1612] md:text-[4vw]">
          <TypewriterText charDelay={0.06}>Normalize It</TypewriterText>
        </h2>
      </div>

      {/* LEGACY ABOUT GRID — temporarily hidden after the proof restructure */}
      <section id="about-archive-section" className="hidden bg-[#E8DCC8] text-[#1A1612] border-y-[1.5px] border-[#1A1612] relative z-40 overflow-hidden">

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
              <span>Streaming proof. Club proof. No filler.</span>
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
      <section data-zoom="neutral" data-compact data-section-intro="thin" className="bg-[#1A1612] text-[#F2EDE4] py-4 overflow-hidden border-b-[1.5px] border-[#8B0000] relative z-20">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center font-sans text-xl sm:text-3xl md:text-4xl tracking-wide">
              <span className="mx-6">VAMPIRE SEX</span>
              <span className="text-[#8B0000]">✦</span>
              <span className="mx-6">CRIMSON BLOODLINE</span>
              <span className="text-[#8B0000]">✦</span>
              <span className="mx-6">NEW MERCHANDISE COMING SOON</span>
              <span className="text-[#8B0000]">✦</span>
              <span className="mx-6">BLOODLINE EARLY ACCESS</span>
              <span className="text-[#8B0000]">✦</span>
              <span className="mx-6">VAMPIRE SEX WORLDWIDE</span>
              <span className="text-[#8B0000]">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — PRODUCT GRID */}
      <section id="products-section" data-zoom="out" data-section-intro="dark" className="bg-[#0A0A0A] text-[#F2EDE4] py-20 px-6 md:px-12 relative z-30">
        <div className="parallax-bg bg-[#0A0A0A]"></div>
        <div className="section-inner section-intro-content relative z-10 max-w-[1600px] mx-auto">
          <CrimsonHeader />
          <div className="mb-10 flex flex-col gap-4 border-y-[1.5px] border-[#4A7C3F]/35 py-8 text-center md:mb-12">
            <p className="text-[10px] tracking-[0.42em] text-[#4A7C3F] uppercase">Drop Archive / Preview</p>
            <h2 className="font-sans text-[12vw] leading-[0.9] tracking-tighter text-[#F2EDE4] md:text-7xl">
              New Merchandise In Development
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 normal-case tracking-normal text-[#F2EDE4]/62">
              Product studies from the Vampire Sex world. Not a store yet; these are artifacts being shaped for the Bloodline registry.
            </p>
          </div>

          <div className="mb-5 flex items-center justify-between gap-4 md:hidden">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#F2EDE4]/38">Swipe the archive</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4A7C3F]">01-04</span>
          </div>

          <div className="drop-archive grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {/* Card 1 — top-left (2-col): zoom IN */}
            <div id="product-tl" className="drop-card md:col-span-2 bg-[#E8DCC8] text-[#1A1612] p-5 md:p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-[#4A7C3F]/20 relative product-card overflow-hidden">
              <div className="aspect-[4/3] relative mb-6 overflow-hidden bg-[#F2EDE4] md:mb-8">
                <Image src="/images/vs_urban_tees_1776346145677.jpg" alt="Crimson Relic Tee" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-contain object-center p-4 md:p-6" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-sans text-[13vw] leading-[0.86] tracking-tighter sm:text-5xl">CRIMSON RELIC TEE</h3>
                  <p className="text-sm normal-case tracking-normal opacity-60">Registry preview. Final drop details pending.</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#4A7C3F]">Coming Soon</span>
              </div>
            </div>

            {/* Card 2 — top-right: zoom OUT */}
            <div id="product-tr" className="drop-card bg-[#14110E] p-5 md:p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-[#4A7C3F]/18 relative product-card overflow-hidden">
              <div className="aspect-square relative mb-6 overflow-hidden bg-[#E8DCC8]/7 md:mb-8">
                <Image src="/images/vs_urban_hoodies_1776346269547.jpg" alt="Void Covenant Hoodie" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-center p-4 md:p-5" />
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-sans text-[12vw] leading-[0.88] tracking-tighter sm:text-4xl">VOID COVENANT HOODIE</h3>
                  <p className="text-sm normal-case tracking-normal opacity-60">Registry preview. Final drop details pending.</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#4A7C3F]">Coming Soon</span>
              </div>
            </div>

            {/* Card 3 — bottom-left: zoom OUT */}
            <div id="product-bl" className="drop-card bg-[#14110E] p-5 md:p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-[#4A7C3F]/18 relative product-card overflow-hidden">
              <div className="aspect-square relative mb-6 overflow-hidden bg-[#E8DCC8]/7 md:mb-8">
                <Image src="/images/vs_studio_caps_1776346579559.jpg" alt="Nocturne Crown Snapback" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-center p-4 md:p-5" />
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-sans text-[12vw] leading-[0.88] tracking-tighter sm:text-4xl">NOCTURNE CROWN SNAPBACK</h3>
                  <p className="text-sm normal-case tracking-normal opacity-60">Registry preview. Final drop details pending.</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#4A7C3F]">Coming Soon</span>
              </div>
            </div>

            {/* Card 4 — bottom-right (2-col): zoom IN */}
            <div id="product-br" className="drop-card md:col-span-2 bg-[#14110E] p-5 md:p-8 group transition-colors duration-200 hover:border-[#4A7C3F] border-[1.5px] border-[#4A7C3F]/18 relative product-card overflow-hidden">
              <div className="aspect-[3/2] relative mb-6 overflow-hidden bg-[#E8DCC8]/7 md:mb-8">
                <Image src="/images/vs_studio_jackets_1776346376867.jpg" alt="Parish Cloak Jacket" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-contain object-center p-4 md:p-6" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-sans text-[13vw] leading-[0.86] tracking-tighter sm:text-5xl">PARISH CLOAK JACKET</h3>
                  <p className="text-sm normal-case tracking-normal opacity-60">Registry preview. Final drop details pending.</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#4A7C3F]">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HEX VENOM USB FEATURE */}
      <section id="usb-section" aria-hidden="true" className="hidden">
        <div className="section-intro-content grid grid-cols-1 md:grid-cols-12 max-w-[1600px] mx-auto min-h-[400px]">
          <div className="md:col-span-6 lg:col-span-5 relative h-[400px] md:h-auto border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-[#8B0000] overflow-hidden group">
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
              <span className="bg-[#8B0000] text-[#F2EDE4] text-[10px] tracking-[0.2em] px-2 py-1 uppercase">Artifact Study</span>
              <span className="text-[#4A7C3F] text-[10px] tracking-[0.2em] font-mono">ED. 001/050</span>
            </div>
            <h2 className="font-sans text-7xl tracking-tighter mb-6 leading-none italic uppercase">HEX VENOM USB</h2>
            <div className="space-y-4 max-w-lg mb-8">
              <p className="text-lg opacity-90 leading-relaxed font-light">
                Premium 32GB industrial-grade storage. Pre-loaded with <span className="text-[#F2EDE4]">The Unreleased Sex Tapes</span>, isolated stems, and exclusive Miami live sets.
              </p>
              <ul className="text-xs tracking-widest opacity-60 space-y-2 uppercase">
                <li>• Hand-numbered & Laser Engraved</li>
                <li>• Rugged Zinc Alloy Housing</li>
                <li>• Instant Access to High-Fidelity WAVs</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8 border-t border-[#8B0000]/40 pt-10">
              <button
                type="button"
                onClick={() => scrollToSection('#bloodline-section')}
                className="min-h-[58px] bg-[#E8DCC8] text-[#1A1612] px-12 py-5 font-sans text-2xl tracking-[0.1em] hover:bg-[#8B0000] hover:text-[#F2EDE4] transition-all duration-300 w-full sm:w-auto uppercase italic"
              >
                Join the Waitlist
              </button>
            </div>

            {/* USB Contents & Specs */}
            <div className="grid grid-cols-2 gap-6 border-t border-[#8B0000]/40 pt-8 mt-8">
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

            <div className="border-t border-[#8B0000]/40 pt-6 mt-6 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] opacity-30 uppercase font-mono">Limited to 50 Units Worldwide</span>
              <span className="text-[10px] tracking-[0.3em] text-[#4A7C3F] uppercase">Ships Q3 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — LISTEN / BOOKING ROUTES */}
      <section id="epk-section" data-zoom="neutral" data-section-intro="dark" className="bg-[#0A0A0A] text-[#F2EDE4] py-24 px-6 md:px-12 relative z-50 overflow-hidden">
        <div className="section-intro-content max-w-[1500px] mx-auto relative z-10">
          <div className="mb-12 grid grid-cols-1 gap-8 border-y-[1.5px] border-[#4A7C3F]/30 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.42em] text-[#4A7C3F]">Listen / Booking / Press</p>
              <h2 className="font-sans text-[16vw] leading-[0.82] tracking-tighter md:text-[7vw]">
                HEAR IT.<br />BOOK IT.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 normal-case tracking-normal text-[#F2EDE4]/68 md:text-lg">
              The homepage stays fast and direct. Full booking context, press copy, and deeper proof live on the one-sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <MediaPlayer />

            <div className="flex flex-col justify-between gap-5 border-[1.5px] border-[#4A7C3F]/45 bg-[#11100E] p-6 md:p-8">
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-[#4A7C3F]">Next Step</p>
                <h3 className="font-sans text-5xl leading-none tracking-tighter">PRESS KIT BELOW THE SURFACE.</h3>
                <p className="mt-5 text-sm leading-6 normal-case tracking-normal text-[#F2EDE4]/58">
                  Use the one-sheet for festival circuit positioning, press, and booking details. Use the offer form when the date is real.
                </p>
              </div>
              <div className="grid gap-3">
                <Link
                  href="/epk"
                  className={darkCtaClass}
                >
                  View One-Sheet
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className={darkCtaClass}
                >
                  Make An Offer
                </button>
              </div>
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
          <div className="mb-28 overflow-visible from-left" data-fade-in>
            <h2 className="retro-footer-wordmark mx-auto flex w-full flex-col items-center font-sans text-[18vw] leading-[0.82] tracking-tighter md:text-[16vw]">
              <span className="retro-3d-word" data-text="VAMPIRE">VAMPIRE</span>
              <span className="retro-3d-word retro-3d-word-offset" data-text="SEX">SEX</span>
            </h2>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-8 border-t-[1.5px] border-[#1A1612] pt-16 mb-12 sm:grid-cols-2 md:grid-cols-4">
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
                className="block break-words text-sm tracking-wider transition-colors hover:text-[#4A7C3F]"
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
                <span className="border border-[#8B0000] px-3 py-1 font-mono text-[10px] tracking-[0.24em] text-[#F2EDE4]/70">EARLY ACCESS</span>
              </div>

              {registrySubmitted ? (
                <div className="py-8 text-center">
                  <p className="font-sans text-5xl md:text-6xl leading-none tracking-tighter">YOU&apos;RE IN.</p>
                  <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed tracking-[0.18em] text-[#F2EDE4]/60 uppercase">
                    You&apos;re on the Bloodline list for early access to Vampire Sex merch.
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
                    Get early access to Vampire Sex merch before the next drop goes public.
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
                        {registryLoading ? 'JOINING' : 'JOIN'}
                      </button>
                    </div>
                    {registryError && (
                      <p className="text-[10px] tracking-[0.18em] text-[#E8DCC8] uppercase">{registryError}</p>
                    )}
                    <p className="text-[9px] leading-relaxed tracking-[0.18em] text-[#F2EDE4]/40 uppercase">
                      First access only. No spam. Bloodline updates go out before public merch announcements.
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

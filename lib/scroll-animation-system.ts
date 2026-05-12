import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Module-level ref so cleanup can remove the resize listener
let resizeHandler: (() => void) | null = null;
let blobSyncCleanup: (() => void) | null = null;

function shouldUseReducedScroll() {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(max-width: 767px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

// ─────────────────────────────────────────────
// CONSTANTS — tweak these to tune the feel
// ─────────────────────────────────────────────
const CONFIG = {
  zoom: {
    inFrom:    0.93,   // zoom-in starting scale
    outFrom:   1.07,   // zoom-out starting scale
    scrub:     1.05,   // scrub smoothness (higher = heavier)
    ease:      'none', // scrub handles easing
  },
  overlap: {
    yOffset:   '-5vh', // how much sections overlap each other
    zIndexBase: 20,    // must stay above blob (z-15) and hero (z-10)
  },
  parallax: {
    bg: {
      yFrom:  '-8%',
      yTo:    '8%',
      scrub:  1.55,
    },
    horizontal: {
      distance: 120,   // px — how far .from-left / .from-right start
      scrub:    1.2,
    },
  },
  intro: {
    lift: 40,
    sectionLift: 34,
    scrub: 1.25,
    overlap: '-10vh',
    compactOverlap: '-2vh',
  },
};

const INTRO_COLORS: Record<string, { bg: string; line: string; shadow: string }> = {
  bone:  { bg: '#E8DCC8', line: '#8B0000', shadow: 'rgba(26, 22, 18, 0.32)' },
  dark:  { bg: '#0A0A0A', line: '#8B0000', shadow: 'rgba(0, 0, 0, 0.58)' },
  green: { bg: '#1A1612', line: '#6EC960', shadow: 'rgba(5, 18, 7, 0.48)' },
  blood: { bg: '#140000', line: '#8B0000', shadow: 'rgba(20, 0, 0, 0.64)' },
  thin:  { bg: '#1A1612', line: '#8B0000', shadow: 'rgba(0, 0, 0, 0.42)' },
};

// ─────────────────────────────────────────────
// 1. SECTION ZOOM SYSTEM
// Reads data-zoom="in|out|neutral" per section.
// Uses scrub so motion is tied exactly to scroll.
// ─────────────────────────────────────────────
function initSectionZoom() {
  const sections = gsap.utils.toArray<HTMLElement>('[data-zoom]:not([data-section-intro])');

  sections.forEach((section, i) => {
    const mode = section.dataset.zoom;

    // neutral — register nothing
    if (mode === 'neutral' || !mode) return;

    const fromScale = mode === 'in'
      ? CONFIG.zoom.inFrom
      : CONFIG.zoom.outFrom;

    // Set will-change for GPU compositing
    gsap.set(section, { willChange: 'transform' });

    // Animate scale from → 1 as section enters viewport
    gsap.fromTo(section,
      { scale: fromScale },
      {
        scale: 1,
        ease: CONFIG.zoom.ease,
        scrollTrigger: {
          trigger: section,
          // start when top of section hits 90% of viewport
          start: 'top 90%',
          // end when top of section reaches top of viewport
          end: 'top top',
          scrub: CONFIG.zoom.scrub,
          // no pin — sections flow naturally
          invalidateOnRefresh: true,
        }
      }
    );
  });
}

// ─────────────────────────────────────────────
// 2. OVERLAPPING SECTION TRANSITIONS
// Sections are pulled up via negative margin so
// each one visually slides over the previous one.
// Combined with a subtle translateY for depth.
// #blob-section is excluded — it manages its own
// positioning via CSS sticky + initBlobScroll.
// ─────────────────────────────────────────────
function initSectionOverlap() {
  const sections = gsap.utils.toArray<HTMLElement>('[data-zoom]:not([data-section-intro]):not(#blob-section):not(#about-section):not(#magnetic-mark-section)');

  sections.forEach((section, i) => {
    // skip first section — nothing to overlap into
    if (i === 0) return;

    // Stack via z-index so later sections sit on top
    gsap.set(section, {
      position: 'relative',
      zIndex: CONFIG.overlap.zIndexBase + i,
      marginTop: CONFIG.overlap.yOffset,
    });

    // As section enters: it translates from slightly below
    // into position, reinforcing the "slide over" feel
    gsap.fromTo(section,
      { y: '3vh' },
      {
        y: '0vh',
        ease: CONFIG.zoom.ease,
        scrollTrigger: {
          trigger: section,
          start: 'top 95%',
          end: 'top 60%',
          scrub: 0.5,
          invalidateOnRefresh: true,
        }
      }
    );
  });
}

// ─────────────────────────────────────────────
// 3A. VERTICAL PARALLAX — Background layers
// Elements with .parallax-bg move slower than
// the scroll, creating depth separation.
// ─────────────────────────────────────────────
function initVerticalParallax() {
  const bgLayers = gsap.utils.toArray<HTMLElement>('.parallax-bg');

  bgLayers.forEach(el => {
    gsap.set(el, { willChange: 'transform' });

    gsap.fromTo(el,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-zoom]') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: CONFIG.parallax.bg.scrub,
          invalidateOnRefresh: true,
        }
      }
    );
  });
}

// ─────────────────────────────────────────────
// 3B. HORIZONTAL PARALLAX — .from-left / .from-right
// Elements slide in from ±120px as they enter
// the viewport. Tied to scroll via scrub.
// ─────────────────────────────────────────────
function initHorizontalParallax() {
  const d = CONFIG.parallax.horizontal.distance;
  const scrub = CONFIG.parallax.horizontal.scrub;

  // Elements entering from the left
  gsap.utils.toArray<HTMLElement>('.from-left').forEach(el => {
    // [data-fade-in] elements get a pure opacity fade — no horizontal slide
    if (el.hasAttribute('data-fade-in')) {
      gsap.fromTo(el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 40%',
            scrub,
            invalidateOnRefresh: true,
          }
        }
      );
      return;
    }

    gsap.set(el, { willChange: 'transform' });

    gsap.fromTo(el,
      { x: -d, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 30%',
          scrub,
          invalidateOnRefresh: true,
        }
      }
    );
  });

  // Elements entering from the right
  gsap.utils.toArray<HTMLElement>('.from-right').forEach(el => {
    gsap.set(el, { willChange: 'transform' });

    gsap.fromTo(el,
      { x: d, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 30%',
          scrub,
          invalidateOnRefresh: true,
        }
      }
    );
  });
}

// ─────────────────────────────────────────────
// SECTION INTRO SYSTEM
// Creates scene-like reveals without trapping users in long pinned
// sections. The whole section moves in as a slab, while a short
// veil/scan pass makes the transition feel authored instead of vertical.
// ─────────────────────────────────────────────
function initSectionIntros() {
  const sections = gsap.utils.toArray<HTMLElement>('[data-section-intro]');

  sections.forEach((section, i) => {
    if (section.id === 'hero-section') return;

    const mode = section.dataset.sectionIntro || 'dark';
    const colors = INTRO_COLORS[mode] || INTRO_COLORS.dark;
    const isCompact = section.hasAttribute('data-compact');
    const content =
      section.querySelector<HTMLElement>('.section-intro-content') ||
      section.querySelector<HTMLElement>('.section-inner') ||
      section.firstElementChild as HTMLElement | null;

    let veil = section.querySelector<HTMLElement>(':scope > .section-intro-veil');
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'section-intro-veil';
      veil.setAttribute('aria-hidden', 'true');
      section.prepend(veil);
    }

    let scan = section.querySelector<HTMLElement>(':scope > .section-intro-scan');
    if (!scan) {
      scan = document.createElement('div');
      scan.className = 'section-intro-scan';
      scan.setAttribute('aria-hidden', 'true');
      section.prepend(scan);
    }

    let overlay = section.querySelector<HTMLElement>(':scope > .section-cinematic-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'section-cinematic-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      section.prepend(overlay);
    }

    let edge = section.querySelector<HTMLElement>(':scope > .section-cinematic-edge');
    if (!edge) {
      edge = document.createElement('div');
      edge.className = 'section-cinematic-edge';
      edge.setAttribute('aria-hidden', 'true');
      section.prepend(edge);
    }

    gsap.set(section, {
      position: 'relative',
      zIndex: section.id === 'about-section' ? 46 : CONFIG.overlap.zIndexBase + i + 8,
      marginTop: i === 0 ? '-4vh' : (isCompact ? CONFIG.intro.compactOverlap : CONFIG.intro.overlap),
      transformStyle: 'preserve-3d',
    });

    gsap.set(overlay, {
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      pointerEvents: 'none',
      background: `
        linear-gradient(180deg, ${colors.shadow} 0%, rgba(0, 0, 0, 0) 18%, rgba(0, 0, 0, 0) 76%, ${colors.shadow} 100%),
        radial-gradient(circle at 50% 0%, ${colors.line}24 0%, rgba(0, 0, 0, 0) 42%)
      `,
      opacity: isCompact ? 0.28 : 0.48,
      willChange: 'opacity, transform',
    });

    gsap.set(edge, {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: isCompact ? 1 : 2,
      zIndex: 8,
      pointerEvents: 'none',
      background: `linear-gradient(90deg, transparent, ${colors.line}, transparent)`,
      opacity: isCompact ? 0.55 : 0.75,
      boxShadow: `0 18px ${isCompact ? 24 : 44}px ${colors.shadow}`,
      transformOrigin: 'left center',
      willChange: 'transform, opacity',
    });

    gsap.set(veil, {
      position: 'absolute',
      inset: 0,
      zIndex: 6,
      pointerEvents: 'none',
      background: colors.bg,
      transformOrigin: 'top center',
      willChange: 'transform, opacity',
    });

    gsap.set(scan, {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: isCompact ? 2 : 3,
      zIndex: 7,
      pointerEvents: 'none',
      background: colors.line,
      transformOrigin: 'left center',
      willChange: 'transform, opacity',
      opacity: 0.8,
    });

    const start = isCompact ? 'top 92%' : 'top 88%';
    const end = isCompact ? 'top 64%' : 'top 18%';
    const lift = isCompact ? 10 : CONFIG.intro.lift;
    const sectionLift = isCompact ? 8 : CONFIG.intro.sectionLift;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start,
        end,
        scrub: CONFIG.intro.scrub,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      section,
      {
        yPercent: sectionLift,
        scale: isCompact ? 1 : 0.972,
        clipPath: isCompact ? 'inset(0% 0% 0% 0%)' : 'inset(14% 0% 0% 0%)',
        opacity: isCompact ? 1 : 0.9,
      },
      {
        yPercent: 0,
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        ease: 'none',
        duration: 1,
      },
      0,
    );

    tl.fromTo(
      overlay,
      { opacity: isCompact ? 0.18 : 0.72, y: isCompact ? 0 : -18 },
      { opacity: isCompact ? 0.28 : 0.42, y: 0, ease: 'none', duration: 1 },
      0,
    );

    tl.fromTo(
      edge,
      { scaleX: 0.15, opacity: 0 },
      { scaleX: 1, opacity: isCompact ? 0.55 : 0.75, ease: 'none', duration: 0.35 },
      0,
    ).to(edge, { opacity: isCompact ? 0.42 : 0.28, ease: 'none', duration: 0.35 }, 0.65);

    tl.fromTo(
      veil,
      { yPercent: 0, opacity: isCompact ? 0.75 : 1 },
      { yPercent: -112, opacity: 0.92, ease: 'none', duration: 0.82 },
      0.02,
    );

    tl.fromTo(
      scan,
      { scaleX: 0, y: 0, opacity: 0 },
      { scaleX: 1, y: isCompact ? 14 : 72, opacity: 1, ease: 'none', duration: 0.42 },
      0.05,
    ).to(scan, { opacity: 0, ease: 'none', duration: 0.28 }, 0.68);

    if (content) {
      gsap.set(content, { willChange: 'transform, opacity' });
      tl.fromTo(
        content,
        { y: lift, opacity: isCompact ? 0.8 : 0.62 },
        { y: 0, opacity: 1, scale: 1, ease: 'none', duration: 1 },
        0.1,
      );
    }
  });
}

// ─────────────────────────────────────────────
// 4. REFRESH HANDLER
// Recalculate all triggers on resize /
// font-load / image-load to prevent drift.
// ─────────────────────────────────────────────
function initResizeHandler() {
  // Remove previous handler if re-initialized
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);

  let resizeTimer: NodeJS.Timeout;
  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  window.addEventListener('resize', resizeHandler);
}

// ─────────────────────────────────────────────
// 5. ABOUT SECTION — CROSS DIVIDERS + QUAD REVEAL
// Both lines draw simultaneously as user scrolls:
// vertical top→bottom, horizontal left→right.
// The cross appears first, then quads fade up.
// ─────────────────────────────────────────────
function initAboutSection() {
  const section = document.querySelector<HTMLElement>('#about-section');
  if (!section) return;

  const vline = section.querySelector<HTMLElement>('#about-vline');
  const hline = section.querySelector<HTMLElement>('#about-hline');
  const quads = gsap.utils.toArray<HTMLElement>('.about-quad');
  if (!hline || quads.length === 0) return;

  // Both lines start invisible, quads start hidden
  if (vline) gsap.set(vline, { scaleY: 0, opacity: 0, transformOrigin: 'top center' });
  gsap.set(hline, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
  gsap.set(quads, { opacity: 0, y: 28 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 72%',
      once: true,
    },
  });

  if (vline) tl.to(vline, { scaleY: 1, opacity: 1, ease: 'power2.out', duration: 0.45 }, 0);
  tl.to(hline, { scaleX: 1, opacity: 1, ease: 'power2.out', duration: 0.45 }, 0.05);
  quads.forEach((q, i) => {
    tl.to(q, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.45 }, 0.18 + i * 0.12);
  });
}

// ─────────────────────────────────────────────
// 6. CRIMSON COLLECTION — HEADER PARALLAX + CARD ANIMATIONS
//
// Header: subtle yPercent parallax scrubbed to scroll.
// Cards: diagonal zoom pairs — top-left/bottom-right zoom IN,
//        top-right/bottom-left zoom OUT. Both fade + scale
//        triggered once on enter, expo.out for silky feel.
// ─────────────────────────────────────────────
function initProductCards() {
  // Header scroll parallax (element lives in a React component)
  const header = document.querySelector<HTMLElement>('[data-crimson-header]');
  if (header) {
    gsap.to(header, {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: {
        trigger: header,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.0,
        invalidateOnRefresh: true,
      },
    });
  }

  // Diagonal zoom-in pair: top-left + bottom-right
  (['#product-tl', '#product-br'] as const).forEach(sel => {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return;
    gsap.fromTo(el,
      { scale: 0.86, opacity: 0 },
      {
        scale: 1, opacity: 1,
        duration: 1.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  // Diagonal zoom-out pair: top-right + bottom-left
  (['#product-tr', '#product-bl'] as const).forEach(sel => {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return;
    gsap.fromTo(el,
      { scale: 1.14, opacity: 0 },
      {
        scale: 1, opacity: 1,
        duration: 1.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

// ─────────────────────────────────────────────
// 7. BLOB PARALLAX JOURNEY
// Blob is position:fixed so GSAP can drive it independently of document flow.
// The page opens with Normalize It, then the hero, then this blob scene.
// ─────────────────────────────────────────────
function initBlobScroll() {
  const blob      = document.querySelector<HTMLElement>('#blob-section');
  const about     = document.querySelector<HTMLElement>('#about-section');
  const normalize = document.querySelector<HTMLElement>('#normalize-section');
  if (!blob || !about || !normalize) return;

  gsap.set(blob, {
    opacity: 0,
    y: '-7vh',
    scale: 0.9,
    filter: 'blur(2px) saturate(0.75)',
    mixBlendMode: 'multiply',
  });

  gsap.to(blob, {
    opacity: 0,
    y: '12vh',
    ease: 'none',
    scrollTrigger: {
      trigger: '#about-section',
      start: 'top 85%',
      end: 'top 25%',
      scrub: 1.55,
      invalidateOnRefresh: true,
    },
  });
}

// ─────────────────────────────────────────────
// 8. SECTION PINS — anchor/sticky scroll stops
// Each major section pins in place, animations
// play out via scrub, then releases. Gives every
// section focused screen time before moving on.
//
// Compact sections (marquee, streaming strip,
// footer) are excluded — they're thin transitions.
// About section is excluded — it has its own
// more complex pin in initAboutSection().
// ─────────────────────────────────────────────
function initSectionPins() {
  // Blob anchor pin: the 3D blob is position:fixed so it
  // can't be pinned directly. #blob-anchor is an invisible
  // spacer in document flow that pauses the scroll here,
  // giving users time to interact with the blob.
  //
  // During the pin, onUpdate writes splitProgress (0→1) to
  // blob-section's dataset. The Three.js BlobMesh reads this
  // in useFrame to drive the split-and-scatter animation.
  const blobAnchor = document.querySelector<HTMLElement>('#blob-anchor');
  const blob = document.querySelector<HTMLElement>('#blob-section');
  if (blobAnchor) {
    if (blobSyncCleanup) {
      blobSyncCleanup();
      blobSyncCleanup = null;
    }

    const setBlobScene = (progress: number) => {
      if (!blob) return;
      const clamped = Math.min(1, Math.max(0, progress));
      gsap.killTweensOf(blob);
      gsap.set(blob, {
        opacity: clamped,
        y: `${-7 + clamped * 7}vh`,
        scale: 0.9 + clamped * 0.1,
        filter: `blur(${2 - clamped * 2}px) saturate(${0.75 + clamped * 0.25})`,
        mixBlendMode: clamped > 0.72 ? 'normal' : 'multiply',
      });
    };
    const syncBlobToAnchor = () => {
      if (!blob) return;

      const rect = blobAnchor.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const sceneLine = viewportHeight * 0.68;
      const isBeforeAnchor = rect.top > sceneLine;
      const isInAnchorScene = rect.top <= sceneLine && rect.bottom >= sceneLine;
      const travel = Math.max(1, rect.height - sceneLine);
      const progress = Math.min(1, Math.max(0, (sceneLine - rect.top) / travel));

      if (isInAnchorScene) {
        blob.style.pointerEvents = 'auto';
        blob.dataset.splitProgress = String(progress);
        setBlobScene(progress);
        return;
      }

      if (isBeforeAnchor) {
        blob.style.pointerEvents = 'none';
        blob.dataset.splitProgress = '0';
        setBlobScene(0);
        return;
      }

      blob.style.pointerEvents = 'none';
      blob.dataset.splitProgress = '1';
      setBlobScene(1);
    };

    let syncFrame = 0;
    const requestBlobSync = () => {
      if (syncFrame) return;
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = 0;
        syncBlobToAnchor();
      });
    };

    ScrollTrigger.create({
      trigger: blobAnchor,
      start: 'top top',
      end: '+=58%',
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (blob) blob.dataset.splitProgress = String(self.progress);
        requestBlobSync();
      },
      onEnter: () => {
        if (blob) blob.style.pointerEvents = 'auto';
        syncBlobToAnchor();
      },
      onToggle: (self) => {
        if (self.isActive) syncBlobToAnchor();
      },
      onLeave: () => {
        if (blob) {
          blob.style.pointerEvents = 'none';
          blob.dataset.splitProgress = '1';
        }
        setBlobScene(1);
      },
      onEnterBack: () => {
        if (blob) blob.style.pointerEvents = 'auto';
        syncBlobToAnchor();
      },
      onLeaveBack: () => {
        if (blob) {
          blob.style.pointerEvents = 'none';
          blob.dataset.splitProgress = '0';
        }
        setBlobScene(0);
      },
    });

    syncBlobToAnchor();
    window.addEventListener('scroll', requestBlobSync, { passive: true });
    window.addEventListener('resize', requestBlobSync);
    blobSyncCleanup = () => {
      window.removeEventListener('scroll', requestBlobSync);
      window.removeEventListener('resize', requestBlobSync);
      if (syncFrame) {
        window.cancelAnimationFrame(syncFrame);
        syncFrame = 0;
      }
    };
  }

  const magneticMark = document.querySelector<HTMLElement>('#magnetic-mark-section');
  const magneticLogo = magneticMark?.querySelector<HTMLElement>('.magnetic-mark-logo');
  if (magneticMark && magneticLogo) {
    gsap.set(magneticMark, {
      position: 'relative',
      zIndex: 24,
      marginTop: 0,
      willChange: 'transform',
    });

    gsap.set(magneticLogo, {
      opacity: 0,
      scale: 0.88,
      y: '4vh',
      transformOrigin: 'center center',
      willChange: 'transform, opacity, filter',
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: magneticMark,
        start: 'top 92%',
        end: 'top 24%',
        scrub: 1.1,
        invalidateOnRefresh: true,
      },
    }).to(magneticLogo, {
      opacity: 0.62,
      scale: 1,
      y: '0vh',
      filter: 'blur(0px) saturate(1.05)',
      ease: 'none',
      duration: 1,
    });

    ScrollTrigger.create({
      trigger: magneticMark,
      start: 'top top',
      end: '+=140%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
  }

  const normalize = document.querySelector<HTMLElement>('#normalize-section');
  if (normalize) {
    gsap.set(normalize, {
      position: 'relative',
      zIndex: 40,
      marginTop: '-55vh',
    });

    ScrollTrigger.create({
      trigger: normalize,
      start: 'top top',
      end: '+=130%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
  }

  const products = document.querySelector<HTMLElement>('#products-section');
  if (products) {
    gsap.set(products, {
      position: 'relative',
      zIndex: 72,
      marginTop: '-42vh',
    });

    ScrollTrigger.create({
      trigger: products,
      start: 'top top',
      end: '+=115%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
  }
}

// ─────────────────────────────────────────────
// EDITORIAL FLIP-OUT + BLOODLINE DELAYED FADE-IN
// ─────────────────────────────────────────────
function initEditorialFlipOut() {
  const editorial = document.querySelector<HTMLElement>('#editorial-block');
  if (editorial) {
    ScrollTrigger.create({
      trigger: editorial,
      start: 'top 65%',
      once: true,
      onEnter: () => {
        const ref = (window as any).__splitFlapRef;
        if (ref?.current?.triggerFlipOut) {
          ref.current.triggerFlipOut();
        }
      },
    });
  }

  const bloodGhost = document.querySelector<HTMLElement>('#bloodline-ghost');
  const bloodContent = document.querySelector<HTMLElement>('#bloodline-content');
  const bloodSection = document.querySelector<HTMLElement>('#bloodline-section');

  if (bloodSection) {
    if (bloodGhost) {
      gsap.set(bloodGhost, {
        scale: 1,
        opacity: 1,
        clearProps: 'transform',
      });
    }

    if (bloodContent) {
      gsap.fromTo(bloodContent, {
        y: 48,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.95,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bloodSection,
          start: 'top 78%',
          once: true,
        },
      });
    }

    const lines = gsap.utils.toArray<HTMLElement>('.bloodline-line');
    if (lines.length) {
      gsap.fromTo(lines, {
        y: 14,
        opacity: 0,
      }, {
        y: 0,
        opacity: 0.7,
        stagger: 0.08,
        duration: 0.45,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bloodSection,
          start: 'top 70%',
          once: true,
        },
      });
    }
  }
}

// ─────────────────────────────────────────────
// MAIN INIT — call this once on mount
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// HERO FADE — content fades out as user scrolls
// down through the hero section. Scrub-driven so
// it tracks scroll position exactly.
// ─────────────────────────────────────────────
function initHeroFade() {
  const hero = document.querySelector<HTMLElement>('#hero-section');
  if (!hero) return;

  const inner = hero.querySelector<HTMLElement>('.section-inner');
  if (!inner) return;

  gsap.to(inner, {
    opacity: 0,
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });
}

export function initScrollAnimations() {
  // Kill any existing triggers before re-init (useful in React)
  ScrollTrigger.getAll().forEach(t => t.kill());

  initSectionZoom();
  initSectionOverlap();
  initVerticalParallax();
  initSectionIntros();
  initHorizontalParallax();
  initHeroFade();
  initAboutSection();
  initProductCards();
  initBlobScroll();
  if (!shouldUseReducedScroll()) {
    initSectionPins();
  }
  initEditorialFlipOut();
  initResizeHandler();

  // Final refresh after all triggers registered
  ScrollTrigger.refresh();
}

// ─────────────────────────────────────────────
// CLEANUP — call this in React useEffect cleanup
// ─────────────────────────────────────────────
export function cleanupScrollAnimations() {
  ScrollTrigger.getAll().forEach(t => t.kill());
  document.querySelectorAll('.section-intro-veil, .section-intro-scan, .section-cinematic-overlay, .section-cinematic-edge').forEach(el => el.remove());
  gsap.set('[data-zoom], [data-section-intro], .section-intro-content, .parallax-bg, .from-left, .from-right, .section-cinematic-overlay, .section-cinematic-edge, #blob-section, #blob-anchor, #hero-section .section-inner, #normalize-section, #magnetic-mark-section, .magnetic-mark-logo, #about-section, #about-vline, #about-hline, .about-quad, .product-card, [data-crimson-header], #editorial-block, #bloodline-ghost, #bloodline-content, .bloodline-line', {
    clearProps: 'all'
  });
  // Remove resize listener
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (blobSyncCleanup) {
    blobSyncCleanup();
    blobSyncCleanup = null;
  }
  // Reset blob pointer-events
  const blob = document.querySelector<HTMLElement>('#blob-section');
  if (blob) blob.style.pointerEvents = 'none';
}

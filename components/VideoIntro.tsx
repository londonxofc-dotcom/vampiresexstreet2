'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type VideoIntroProps = {
  onDone: () => void;
};

export default function VideoIntro({ onDone }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const doneRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const [exiting, setExiting] = useState(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    exitTimerRef.current = window.setTimeout(onDone, 620);
  }, [onDone]);

  useEffect(() => {
    const timeout = window.setTimeout(finish, 9000);
    const playFrame = window.requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {
        // Muted autoplay is usually allowed, but keep manual entry available.
      });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        finish();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(playFrame);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, [finish]);

  return (
    <div
      className={`fixed inset-0 z-[500] flex min-h-[100dvh] items-center justify-center overflow-hidden transition-colors duration-700 ${
        exiting ? 'bg-[#E8DCC8]' : 'bg-black'
      }`}
      role="dialog"
      aria-label="Vampire Sex intro"
      onClick={finish}
    >
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-500 md:object-contain ${
          exiting ? 'opacity-0' : 'opacity-100'
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      >
        <source src="/video/vssloading.mp4" type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          finish();
        }}
        className={`absolute right-5 top-[calc(env(safe-area-inset-top)+1.25rem)] border border-[#E8DCC8]/30 bg-black/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#E8DCC8]/70 backdrop-blur transition-all duration-300 hover:border-[#E8DCC8] hover:text-[#E8DCC8] ${
          exiting ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'
        }`}
      >
        Skip
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          finish();
        }}
        className={`absolute bottom-[calc(env(safe-area-inset-bottom)+2rem)] left-1/2 min-h-[52px] w-[min(82vw,320px)] -translate-x-1/2 border-[1.5px] border-[#E8DCC8] bg-[#E8DCC8] px-7 py-4 font-sans text-xl uppercase tracking-[0.16em] text-[#1A1612] shadow-[0_0_46px_rgba(232,220,200,0.22)] transition-all duration-300 hover:bg-[#8B0000] hover:text-[#F2EDE4] md:bottom-10 md:w-auto md:text-2xl ${
          exiting ? 'translate-y-2 opacity-0 blur-sm' : 'opacity-100 blur-0'
        }`}
      >
        Enter Site
      </button>

      <p className={`pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 w-full -translate-x-1/2 px-6 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-[#E8DCC8]/45 transition-opacity duration-300 md:bottom-4 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}>
        Tap anywhere / Enter / Esc
      </p>
    </div>
  );
}

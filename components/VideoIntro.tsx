'use client';

import { useCallback, useEffect, useRef } from 'react';

type VideoIntroProps = {
  onDone: () => void;
};

export default function VideoIntro({ onDone }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
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
    };
  }, [finish]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black"
      role="dialog"
      aria-label="Vampire Sex intro"
      onClick={finish}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
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
        className="absolute right-5 top-5 border border-[#E8DCC8]/30 bg-black/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#E8DCC8]/70 backdrop-blur transition-colors hover:border-[#E8DCC8] hover:text-[#E8DCC8]"
      >
        Skip
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          finish();
        }}
        className="absolute bottom-8 left-1/2 min-h-[52px] -translate-x-1/2 border-[1.5px] border-[#E8DCC8] bg-[#E8DCC8] px-8 py-4 font-sans text-2xl uppercase tracking-[0.16em] text-[#1A1612] shadow-[0_0_46px_rgba(232,220,200,0.22)] transition-colors hover:bg-[#8B0000] hover:text-[#F2EDE4] md:bottom-10"
      >
        Enter Site
      </button>

      <p className="pointer-events-none absolute bottom-3 left-1/2 w-full -translate-x-1/2 px-6 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-[#E8DCC8]/45 md:bottom-4">
        Tap anywhere / Enter / Esc
      </p>
    </div>
  );
}

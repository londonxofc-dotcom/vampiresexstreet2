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
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    exitTimerRef.current = window.setTimeout(onDone, 620);
  }, [onDone]);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || doneRef.current) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    video.play()
      .then(() => setPlaybackBlocked(false))
      .catch(() => setPlaybackBlocked(true));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.currentTime < 0.5) setPlaybackBlocked(true);
    }, 3500);
    const playFrame = window.requestAnimationFrame(attemptPlay);
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
  }, [attemptPlay, finish]);

  return (
    <div
      className={`fixed inset-0 z-[500] flex h-[100svh] min-h-[100dvh] items-center justify-center overflow-hidden transition-colors duration-700 ${
        exiting ? 'bg-[#E8DCC8]' : 'bg-black'
      }`}
      role="dialog"
      aria-label="Vampire Sex intro"
    >
      <video
        ref={videoRef}
        className={`h-auto max-h-[100svh] w-full object-contain object-center transition-opacity duration-500 ${
          exiting ? 'opacity-0' : 'opacity-100'
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        onCanPlay={attemptPlay}
        onEnded={finish}
        onError={finish}
        onClick={(event) => {
          event.stopPropagation();
          attemptPlay();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          attemptPlay();
        }}
      >
        <source src="/video/vssloading-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/video/vssloading.mp4" type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          finish();
        }}
        className={`absolute right-5 top-[calc(env(safe-area-inset-top)+1.25rem)] min-h-11 border border-[#E8DCC8]/30 bg-black/55 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#E8DCC8]/70 backdrop-blur transition-all duration-300 hover:border-[#E8DCC8] hover:text-[#E8DCC8] ${
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
        className={`absolute bottom-[calc(env(safe-area-inset-bottom)+1.15rem)] left-1/2 min-h-11 -translate-x-1/2 bg-transparent px-4 py-3 font-mono text-[10px] uppercase tracking-[0.36em] text-[#E8DCC8]/72 underline decoration-[#E8DCC8]/24 underline-offset-[6px] transition-all duration-300 hover:text-[#E8DCC8] hover:decoration-[#E8DCC8]/70 md:bottom-7 ${
          exiting ? 'translate-y-2 opacity-0 blur-sm' : 'opacity-100 blur-0'
        }`}
      >
        Enter
      </button>

      {playbackBlocked && !exiting && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            attemptPlay();
          }}
          className="absolute left-1/2 top-1/2 w-[min(78vw,300px)] -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-[#E8DCC8] bg-black/68 px-6 py-4 font-sans text-xl uppercase tracking-[0.16em] text-[#E8DCC8] backdrop-blur transition-colors hover:bg-[#E8DCC8] hover:text-[#1A1612]"
        >
          Play Intro
        </button>
      )}

    </div>
  );
}

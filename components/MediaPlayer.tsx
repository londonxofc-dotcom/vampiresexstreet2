'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const tracks = [
  { id: 1, title: 'Disco Party Baby', artist: 'Vampire Sex', url: '/audio/disco-party-baby.mp3', artwork: '/images/vs_urban_tees_1776346145677.jpg' },
  { id: 2, title: 'C\'mon Dance With Me', artist: 'Vampire Sex', url: '/audio/cmon-dance-with-me.mp3', artwork: '/images/vs_urban_hoodies_1776346269547.jpg' },
  { id: 3, title: 'That\'s Jack', artist: 'Vampire Sex', url: '/audio/thats-jack.mp3', artwork: '/images/vs_studio_caps_1776346579559.jpg' },
  { id: 4, title: 'Madonna', artist: 'Vampire Sex', url: '/audio/madonna.mp3', artwork: '/images/vs_studio_jackets_1776346376867.jpg' },
];

type MediaAudioWindow = Window & {
  __vampireSexLandingAudio?: HTMLAudioElement;
};

export function MediaPlayer({ autoPlayOnMount = false }: { autoPlayOnMount?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayAttemptedRef = useRef(false);

  const setAudioElement = (node: HTMLAudioElement | null) => {
    audioRef.current = node;
  };

  // Handle play/pause sync
  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.src !== new URL(tracks[currentTrack].url, window.location.href).href) {
        audioRef.current.src = tracks[currentTrack].url;
      }

      if (isPlaying) {
        audioRef.current.play()
          .then(() => setAutoplayBlocked(false))
          .catch(() => {
            setIsPlaying(false);
            setAutoplayBlocked(true);
          });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (!autoPlayOnMount || autoplayAttemptedRef.current) return;

    autoplayAttemptedRef.current = true;
    const staleLandingAudio = (window as MediaAudioWindow).__vampireSexLandingAudio;
    if (staleLandingAudio) {
      staleLandingAudio.pause();
      delete (window as MediaAudioWindow).__vampireSexLandingAudio;
    }

    const playFrame = window.requestAnimationFrame(() => setIsPlaying(true));

    return () => window.cancelAnimationFrame(playFrame);
  }, [autoPlayOnMount]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev < tracks.length - 1 ? prev + 1 : 0));
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev > 0 ? prev - 1 : tracks.length - 1));
    setIsPlaying(true);
  };

  return (
    <div className="bg-[#131210] border-[1.5px] border-[#4A7C3F]/30 p-8 w-full max-w-2xl text-[#F2EDE4] font-sans">
      <audio
        ref={setAudioElement}
        src={tracks[currentTrack].url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b-[1.5px] border-[#1A1612] pb-6">
        <div className="flex gap-6 items-end">
          <div className="w-24 h-24 relative border-[1.5px] border-[#1A1612]">
            <Image
              src={tracks[currentTrack].artwork}
              alt={tracks[currentTrack].title}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-xs tracking-widest opacity-60 mb-1 leading-none">NOW PLAYING</div>
            <h3 className="text-3xl tracking-tighter mb-1 leading-none">{tracks[currentTrack].title}</h3>
            <div className="text-sm opacity-60 font-mono tracking-widest">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 self-end">
          <button onClick={handlePrev} className="p-2 -m-2 hover:text-[#4A7C3F] transition-colors" aria-label="Previous track">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-[#E8DCC8] rounded-full flex items-center justify-center text-[#1A1612] hover:bg-[#4A7C3F] hover:text-[#F2EDE4] transition-colors shrink-0"
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
          <button onClick={handleNext} className="p-2 -m-2 hover:text-[#4A7C3F] transition-colors" aria-label="Next track">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className={`flex justify-between items-center p-3 min-h-[44px] cursor-pointer transition-colors ${currentTrack === i ? 'bg-[#1A1612] border-l-[3px] border-[#4A7C3F]' : 'hover:bg-[#1A1612]/50 border-l-[3px] border-transparent'}`}
            onClick={() => {
              if (currentTrack === i) {
                setIsPlaying(!isPlaying);
              } else {
                setCurrentTrack(i);
                setIsPlaying(true);
              }
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-xs opacity-40 w-4">{i + 1}</span>
              <div className="w-8 h-8 relative border border-[#1A1612] hidden sm:block">
                <Image src={track.artwork} alt={track.title} fill sizes="32px" className="object-cover" />
              </div>
              <div>
                <p className={`text-sm ${currentTrack === i ? 'text-[#4A7C3F]' : ''}`}>{track.title}</p>
                <p className="text-xs opacity-60">{track.artist}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {autoplayBlocked && (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="mt-5 w-full border border-[#4A7C3F]/45 px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.24em] text-[#E8DCC8]/75 transition-colors hover:bg-[#4A7C3F]/15 hover:text-[#E8DCC8]"
        >
          Audio blocked by browser. Tap to start Disco Party Baby.
        </button>
      )}
    </div>
  );
}

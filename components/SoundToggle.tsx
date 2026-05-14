'use client';

import { useEffect, useState } from 'react';

type SoundWindow = Window & {
  __vampireSexMuted?: boolean;
};

export default function SoundToggle({ visible = true }: { visible?: boolean }) {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('vss-sound-muted') === 'true';
  });

  useEffect(() => {
    const saved = window.sessionStorage.getItem('vss-sound-muted') === 'true';
    (window as SoundWindow).__vampireSexMuted = saved;

    document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
      media.muted = saved || media.muted;
      if (saved && media.tagName === 'AUDIO') media.pause();
    });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    (window as SoundWindow).__vampireSexMuted = nextMuted;
    window.sessionStorage.setItem('vss-sound-muted', String(nextMuted));
    setMuted(nextMuted);

    document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
      media.muted = nextMuted;
      if (nextMuted && media.tagName === 'AUDIO') media.pause();
    });
    window.dispatchEvent(new Event('vss:sound-muted'));
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={muted}
      aria-label={muted ? 'Turn sound on' : 'Mute site sound'}
      className={`sound-signal-toggle fixed bottom-[calc(env(safe-area-inset-bottom)+11.25rem)] right-5 z-[210] min-h-9 border border-[#1A1612]/25 bg-[#0A0A0A]/20 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.28em] text-[#1A1612]/60 backdrop-blur-[2px] transition-all duration-700 hover:border-[#1A1612]/45 hover:bg-[#E8DCC8]/20 hover:text-[#1A1612] hover:tracking-[0.32em] md:bottom-6 md:right-6 ${
        entered ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-2 opacity-0 blur-[2px]'
      }`}
    >
      Sound {muted ? 'Off' : 'On'}
    </button>
  );
}

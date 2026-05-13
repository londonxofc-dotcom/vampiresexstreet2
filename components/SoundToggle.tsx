'use client';

import { useEffect, useState } from 'react';

type SoundWindow = Window & {
  __vampireSexMuted?: boolean;
};

export default function SoundToggle({ visible = true }: { visible?: boolean }) {
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
      className="fixed bottom-20 right-5 z-[210] min-h-11 border-[1.5px] border-[#8B0000]/65 bg-[#0A0A0A]/78 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F2EDE4] shadow-[0_0_34px_rgba(139,0,0,0.24)] backdrop-blur transition-colors hover:bg-[#8B0000] md:bottom-6 md:right-6"
    >
      Sound {muted ? 'Off' : 'On'}
    </button>
  );
}

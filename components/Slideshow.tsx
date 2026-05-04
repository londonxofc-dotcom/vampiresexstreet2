'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const SLIDES = [
  // 16:9 landscape — fills perfectly
  { src: '/images/slideshow/vs_photo_2.jpg', alt: 'Vampire Sex', pos: 'object-center' },
  // Tall portrait — top keeps faces in frame
  { src: '/images/slideshow/vs_photo_3.jpg', alt: 'Vampire Sex', pos: 'object-top' },
  // 4:3 landscape
  { src: '/images/slideshow/IMG_3765.jpg',   alt: 'Vampire Sex', pos: 'object-center' },
  // Square
  { src: '/images/slideshow/vs_photo_1.jpg', alt: 'Vampire Sex', pos: 'object-center' },
  // Tall portrait — top keeps faces in frame
  { src: '/images/slideshow/vs_photo_4.jpg', alt: 'Vampire Sex', pos: 'object-top' },
  // Square
  { src: '/images/slideshow/vs_photo_5.jpg', alt: 'Vampire Sex', pos: 'object-center' },
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent(c => (c + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 5000);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <div className="w-full h-full relative">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="100vw"
          // Active slide sits on top (z-10) so it fades IN over the outgoing
          // — no dark background bleed-through during the crossfade.
          // brightness-[1.08]: boost vibrancy since photos shoot dark.
          className={`object-cover ${slide.pos} transition-opacity duration-500 brightness-[1.08] ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          priority={i === 0}
        />
      ))}

      {/* Slide counter */}
      <div className="absolute top-6 left-6 text-[10px] tracking-[0.25em] text-[#E8DCC8]/50 font-mono z-20 select-none">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-[#E8DCC8]'
                : 'w-[6px] bg-[#E8DCC8]/30 hover:bg-[#E8DCC8]/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

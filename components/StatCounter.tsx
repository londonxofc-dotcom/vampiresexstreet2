'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, useMotionValue, useSpring } from 'motion/react';

interface StatCounterProps {
  end: number;
  label: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function StatCounter({ end, label, suffix = '', prefix = '', duration = 2 }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(end);
    }
  }, [isInView, end, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        // Format with M, K, etc if needed, or let suffix handle it.
        // We'll format the number nicely.
        let formatted = Intl.NumberFormat('en-US', {
          maximumFractionDigits: end % 1 === 0 ? 0 : 2
        }).format(latest);
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
  }, [springValue, end, prefix, suffix]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0A0A0A] border-[1.5px] border-[#4A7C3F] relative overflow-hidden group">
      <div className="absolute inset-0 bg-[#4A7C3F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="font-sans text-5xl md:text-7xl tracking-tighter text-[#F2EDE4] mb-2 relative z-10" ref={ref}>
        {prefix}0{suffix}
      </div>
      <div className="text-xs tracking-widest text-[#F2EDE4]/60 uppercase relative z-10">{label}</div>
    </div>
  );
}

import { useEffect } from 'react';
import { initScrollAnimations, cleanupScrollAnimations } from '@/lib/scroll-animation-system';

/**
 * @param key — pass route path or unique key
 *   to re-trigger animations on page transitions
 */
export function useScrollAnimations(key: string | number = 'default') {
  useEffect(() => {
    // Skip init while splash screen is showing (main content not in DOM)
    if (key === 'waiting') return;

    // Small delay lets DOM paint before GSAP measures
    const timer = setTimeout(() => {
      initScrollAnimations();
    }, 60);

    return () => {
      clearTimeout(timer);
      cleanupScrollAnimations();
    };
  }, [key]);
}

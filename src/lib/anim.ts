import type { Variants } from 'framer-motion';

/** Shared easing curve — used everywhere so screens feel like one family. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR = {
  short: 0.3,
  mid: 0.45,
  hero: 0.6,
} as const;

/**
 * Container variant for phase-level screens.
 * Children stagger in 90ms apart on enter, 50ms apart on exit (reversed).
 */
export const screen: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DUR.mid, ease: EASE, staggerChildren: 0.09 },
  },
  exit: {
    opacity: 0,
    transition: { duration: DUR.short, ease: EASE, staggerChildren: 0.05, staggerDirection: -1 },
  },
};

/** Standard child: fade + small upward slide. Reverse-slide out. */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.mid, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: DUR.short, ease: EASE } },
};

/** Hero variant: subtle scale-in for centerpiece elements (logo, title). */
export const hero: Variants = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1, transition: { duration: DUR.hero, ease: EASE } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: DUR.short, ease: EASE } },
};

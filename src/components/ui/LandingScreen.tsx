'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

/**
 * Warm cream Vesak welcome screen. Shown during both the `presents` and
 * `intro` phases — collapses them into one cultural landing. Tapping the
 * CTA fades to dark and enters the 3D walking scene.
 */
export function LandingScreen() {
  const phase = useAppStore((s) => s.phase);
  const completePresents = useAppStore((s) => s.completePresents);
  const completeIntro = useAppStore((s) => s.completeIntro);
  const [exiting, setExiting] = useState(false);

  const visible = phase === 'presents' || phase === 'intro';

  const handleBegin = () => {
    setExiting(true);
    // Let the fade play, then collapse both opening phases at once so the
    // scene below is already in the walking state by the time we're gone.
    setTimeout(() => {
      completePresents(); // presents → intro
      completeIntro();    // intro → walking
    }, 400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-6 py-10"
          style={{
            background: '#ffffff',
            minHeight: '100svh',
            paddingTop: 'calc(2.5rem + var(--safe-top))',
            paddingBottom: 'calc(2.5rem + var(--safe-bottom))',
          }}
        >
          {/* Subtle corner ornaments */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 15%, #c8851f 0%, transparent 40%), radial-gradient(circle at 80% 85%, #c8851f 0%, transparent 40%)',
            }}
          />

          {/* Hero — Buddha Rashmi logo + Sinhala tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex w-full max-w-md flex-col items-center text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/budda%20rashmi%20logo.png"
              alt="Buddha Rashmi"
              className="mb-8 h-32 w-auto object-contain md:h-48"
            />

            <p
              className="px-2 text-base font-medium leading-relaxed md:text-2xl"
              style={{ color: '#3a2a1a', fontFamily: 'var(--font-sinhala), sans-serif' }}
            >
              ගංගාරාම බුද්ධරශ්මී වෙසක් කලාපයට
              <br />
              ඔබව බැතිසිතින් පිළිගමු.
            </p>
          </motion.div>

          {/* Flex spacer */}
          <div className="min-h-[2rem] max-h-[5rem] flex-1" />

          {/* Sponsor block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <p
              className="mb-3 text-xs uppercase tracking-[0.2em] md:text-sm"
              style={{ color: '#7a5a3a', fontFamily: 'var(--font-sinhala), sans-serif' }}
            >
              ප්‍රධාන දායකත්වය
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/Commercial_Bank_logo.svg"
              alt="Commercial Bank of Ceylon"
              className="h-12 w-auto object-contain md:h-16"
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 w-full max-w-sm"
          >
            <button
              onClick={handleBegin}
              disabled={exiting}
              className="h-14 w-full rounded-full text-base font-medium tracking-wide shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60 md:text-lg"
              style={{
                background: 'linear-gradient(180deg, #d89530 0%, #b87216 100%)',
                color: '#fdf6e9',
                fontFamily: 'var(--font-sinhala), sans-serif',
                boxShadow: '0 8px 24px -8px rgba(184, 114, 22, 0.5)',
              }}
            >
              වීදියට පිවිසෙන්න
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

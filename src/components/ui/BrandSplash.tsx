'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { EASE, fadeUp, hero, screen } from '@/lib/anim';

const AUTO_DISMISS_MS = 5000;

export function BrandSplash() {
  const phase = useAppStore((s) => s.phase);
  const language = useAppStore((s) => s.language);
  const completePresents = useAppStore((s) => s.completePresents);
  const t = useStrings(language);

  useEffect(() => {
    if (phase !== 'presents') return;
    const timer = setTimeout(completePresents, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [phase, completePresents]);

  return (
    <AnimatePresence>
      {phase === 'presents' && (
        <motion.div
          className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center bg-night-900 px-6"
          onClick={completePresents}
          variants={screen}
          initial="initial"
          animate="animate"
          exit="exit"
          role="button"
          aria-label="Continue"
        >
          <motion.div
            variants={fadeUp}
            className="mb-8 text-xs uppercase tracking-[0.35em] text-flame-200/55 md:mb-10 md:text-sm"
          >
            {t.brand_presents}
          </motion.div>

          <motion.div variants={hero} className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/Commercial_Bank_logo.svg"
              alt="Commercial Bank of Ceylon"
              className="h-28 w-auto object-contain md:h-40"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 text-center text-base italic text-flame-200/70 md:mt-12 md:text-xl"
          >
            {t.brand_gift}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="absolute bottom-14 text-[10px] uppercase tracking-widest text-flame-200/40 md:bottom-16"
          >
            Tap to continue
          </motion.div>

          {/* Progress bar — fills over AUTO_DISMISS_MS so the user can see why
              the splash is about to disappear. */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-flame-300/40"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: AUTO_DISMISS_MS / 1000, ease: 'linear' },
              opacity: { duration: 0.3, ease: EASE },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

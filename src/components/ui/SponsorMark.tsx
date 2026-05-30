'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Persistent sponsor credit shown in the bottom-right during the walk.
 * Sinhala line "බැතිබර අනුග්‍රහය" (devotional patronage) sits above the
 * Commercial Bank wordmark — quiet, calm, non-interactive.
 */
export function SponsorMark() {
  const phase = useAppStore((s) => s.phase);

  return (
    <AnimatePresence>
      {phase === 'walking' && (
        <motion.div
          className="ui-chrome pointer-events-none fixed bottom-4 right-4 z-30 hidden flex-col items-end gap-1.5 md:flex md:bottom-6 md:right-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        >
          <div
            className="text-[11px] tracking-wider text-flame-200/75 lg:text-lg"
            style={{ fontFamily: 'var(--font-sinhala), serif' }}
          >
            ප්‍රධාන අනුග්‍රහය
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/Commercial_Bank_logo.svg"
            alt="Commercial Bank of Ceylon"
            className="h-7 w-auto object-contain opacity-90 lg:h-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

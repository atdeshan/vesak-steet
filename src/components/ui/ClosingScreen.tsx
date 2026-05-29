'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, STREET_LENGTH } from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { fadeUp, screen } from '@/lib/anim';

export function ClosingScreen() {
  const { position, phase, language, restart } = useAppStore();
  const t = useStrings(language);

  // Show when reaching ~95% of street
  const reachedEnd = position >= STREET_LENGTH - 16;
  const show = phase === 'walking' && reachedEnd;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center
                     bg-gradient-to-b from-night-900/0 via-night-900/80 to-night-900
                     text-flame-200 px-6 pointer-events-auto"
          variants={screen}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-6xl font-light text-flame-300 text-center tracking-wide"
          >
            {t.closing_title}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-sm md:text-base text-flame-200/70 tracking-wide text-center max-w-md"
          >
            {t.closing_subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={restart}
              className="btn-flame px-8 py-3 text-sm"
            >
              {t.closing_restart}
            </button>
          </motion.div>

          {/* Share */}
          <motion.div variants={fadeUp} className="mt-8 flex gap-2">
            <ShareButton platform="facebook" />
            <ShareButton platform="twitter" />
            <ShareButton platform="whatsapp" />
          </motion.div>

          {/* Commercial Bank sign-off */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex w-4/5 max-w-[460px] flex-col items-center gap-3 border-t border-flame-300/[0.12] pt-8"
          >
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/Commercial_Bank_logo.svg"
                alt="Commercial Bank of Ceylon"
                className="h-14 w-auto object-contain md:h-16"
              />
            </div>
            <div className="mt-2 text-center text-sm italic text-flame-200/65 md:text-base">
              {t.brand_blessing}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareButton({ platform }: { platform: 'facebook' | 'twitter' | 'whatsapp' }) {
  const url = typeof window !== 'undefined' ? window.location.href : 'https://vesakstreet.com';
  const text = 'Vesak Lanterns of Colombo — virtual experience';

  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  };

  const labels = {
    facebook: 'f',
    twitter: '𝕏',
    whatsapp: 'W',
  };

  return (
    <a
      href={links[platform]}
      target="_blank"
      rel="noopener"
      className="w-10 h-10 rounded-full border border-flame-300/25 text-flame-300
                 hover:bg-flame-300/10 transition-colors
                 flex items-center justify-center text-sm font-medium"
      aria-label={`Share on ${platform}`}
    >
      {labels[platform]}
    </a>
  );
}

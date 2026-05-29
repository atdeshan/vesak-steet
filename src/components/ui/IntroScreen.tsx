'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { fadeUp, hero, screen } from '@/lib/anim';

export function IntroScreen() {
  const phase = useAppStore((s) => s.phase);
  const completeIntro = useAppStore((s) => s.completeIntro);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useStrings(language);

  return (
    <AnimatePresence>
      {phase === 'intro' && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900 text-flame-200 px-6"
          variants={screen}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Single lantern symbol */}
          <motion.div variants={hero} className="relative mb-12">
            <div className="w-24 h-32 rounded-2xl bg-gradient-to-b from-flame-500 via-flame-600 to-flame-700 shadow-[0_0_80px_rgba(255,133,51,0.6)]">
              <div className="w-full h-full rounded-2xl bg-flame-300/20 backdrop-blur-sm" />
            </div>
            <div className="absolute inset-0 -m-12 rounded-full bg-flame-500/15 blur-3xl animate-flicker" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl md:text-7xl font-light text-flame-300 tracking-wider text-center"
            style={{ fontFamily: 'var(--font-sinhala), serif' }}
          >
            {t.intro_title}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-sm md:text-base text-flame-200/60 tracking-widest uppercase text-center max-w-md"
          >
            {t.intro_subtitle}
          </motion.p>

          {/* Language selector */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex gap-1 p-1 rounded-full control-pill"
          >
            {(['en', 'si', 'ta'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`btn-flame px-4 py-2 text-xs ${language === lang ? 'active' : ''}`}
              >
                {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
              </button>
            ))}
          </motion.div>

          <motion.button
            variants={fadeUp}
            onClick={completeIntro}
            className="mt-8 btn-flame px-8 py-3 text-sm font-medium hover:scale-[1.03] active:scale-[0.98]"
          >
            {t.intro_cta}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

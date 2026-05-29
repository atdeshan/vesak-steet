'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, STREET_LENGTH } from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { QualityToggle } from './QualityToggle';
import { MobileSettingsDrawer } from './MobileSettingsDrawer';

export function Controls() {
  const { phase, mode, walking, speed, position, audioEnabled, language, focusedLanternIdx } = useAppStore();
  const { setMode, setWalking, setSpeed, toggleAudio, restart } = useAppStore();
  const t = useStrings(language);

  if (phase !== 'walking') return null;

  const progressFrac = position / (STREET_LENGTH - 15);
  const pct = Math.round(progressFrac * 100);

  const handleManualPress = (vel: number) => {
    (window as Window & { __setManualVelocity?: (v: number) => void }).__setManualVelocity?.(vel);
  };

  return (
    <>
      {/* Top bar */}
      <div className="ui-chrome pointer-events-none absolute top-0 inset-x-0 z-30 p-3 md:p-6 flex items-start justify-between">
        {/* LEFT: logo + title */}
        <motion.div
          className="flex items-center gap-2 md:gap-3 min-w-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/budda%20rashmi%20logo.png"
            alt="Buddha Rashmi"
            className="h-8 w-auto object-contain shrink-0 md:h-12 lg:h-44"
          />
          {/* Mobile title — compact one-liner */}
          <div className="min-w-0 md:hidden">
            <div className="text-[13px] font-medium text-flame-200 whitespace-nowrap tracking-wider uppercase">
              {t.intro_title}
            </div>
            <div
              className="text-[11px] text-flame-200/55 whitespace-nowrap tracking-wide truncate"
              style={{ fontFamily: 'var(--font-sinhala), serif' }}
            >
              වෙසක් වීදිය
            </div>
          </div>
          {/* Desktop title — bilingual + subtitle */}
          <div className="hidden md:block">
            <div className="text-xs md:text-sm text-flame-200/75 tracking-widest uppercase">
              වෙසක් වීදිය · {t.intro_title}
            </div>
            <div className="text-[10px] md:text-xs text-flame-200/50 tracking-wide mt-0.5">
              {t.intro_subtitle}
            </div>
          </div>
        </motion.div>

        {/* CENTER: mode toggle (desktop only) */}
        <motion.div
          className="pointer-events-auto hidden gap-1 p-1 rounded-full control-pill absolute left-1/2 -translate-x-1/2 lg:flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            onClick={() => setMode('auto')}
            className={`btn-flame px-3 md:px-4 py-1.5 text-[10px] md:text-xs ${mode === 'auto' ? 'active' : ''}`}
          >
            {t.auto}
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`btn-flame px-3 md:px-4 py-1.5 text-[10px] md:text-xs ${mode === 'manual' ? 'active' : ''}`}
          >
            {t.manual}
          </button>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className="flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Mobile: settings drawer trigger only */}
          <div className="md:hidden">
            <MobileSettingsDrawer />
          </div>
          {/* Desktop: full inline cluster */}
          <div className="pointer-events-auto hidden items-center gap-2 md:flex md:gap-3">
            <QualityToggle />
            <button
              onClick={toggleAudio}
              className={`btn-flame w-8 h-8 flex items-center justify-center text-sm ${audioEnabled ? 'active' : ''}`}
              aria-label={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? '♫' : '♪'}
            </button>
            <div className="text-xs text-flame-200/70 tabular-nums tracking-wider">
              {pct}%
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/Ganagarama%20Logo.png"
              alt="Gangaramaya"
              className="h-10 w-auto object-contain md:h-16 lg:h-32"
            />
          </div>
        </motion.div>
      </div>

      {/* MOBILE BOTTOM — sponsor strip + big action bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        {/* Sponsor strip — passive, full-width band */}
        <div className="px-3 pb-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className="text-[10px] uppercase tracking-wider text-flame-200/70"
              style={{ fontFamily: 'var(--font-sinhala), serif' }}
            >
              ප්‍රදාන අනුග්‍රහය
            </div>
            <div className="bg-[#003d7a] rounded-md px-4 py-1.5 flex items-center gap-2 shadow-lg">
              <span className="text-white text-[11px] font-semibold tracking-wider">
                COMMERCIAL BANK
              </span>
            </div>
          </div>
        </div>

        {/* Action bar — large buttons */}
        <div className="px-3 pb-3 pointer-events-auto">
          <div className="flex gap-2 max-w-md mx-auto">
            <button
              onClick={() => setWalking(true)}
              className={`flex-1 rounded-full py-3 text-sm font-medium uppercase tracking-wide min-h-[52px] flex items-center justify-center gap-2 backdrop-blur-md transition-colors ${
                walking && focusedLanternIdx === null
                  ? 'bg-flame-300/25 text-flame-200'
                  : 'bg-flame-300/15 text-flame-200 active:bg-flame-300/25'
              }`}
              aria-label={t.walk}
            >
              ▶ {t.walk}
            </button>
            <button
              onClick={() => setWalking(false)}
              className={`flex-1 rounded-full py-3 text-sm font-medium uppercase tracking-wide min-h-[52px] flex items-center justify-center gap-2 backdrop-blur-md transition-colors ${
                !walking
                  ? 'bg-black/70 text-flame-200'
                  : 'bg-black/50 text-flame-200 active:bg-black/70'
              }`}
              aria-label={t.pause}
            >
              ⏸ {t.pause}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP BOTTOM — original Walk/Pause/Speed/Restart bar */}
      <AnimatePresence mode="wait">
        {mode === 'auto' && (
          <motion.div
            key="auto-controls"
            className="ui-chrome pointer-events-auto absolute bottom-4 md:bottom-6 left-4 md:left-6 z-30 lg:left-1/2 lg:-translate-x-1/2
                       hidden md:flex items-center gap-1 p-1.5 rounded-full control-pill"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setWalking(true)}
              className={`btn-flame px-3 md:px-4 py-1.5 text-[10px] md:text-xs ${walking && focusedLanternIdx === null ? 'active' : ''}`}
            >
              ▶ {t.walk}
            </button>
            <button
              onClick={() => setWalking(false)}
              className={`btn-flame px-3 md:px-4 py-1.5 text-[10px] md:text-xs ${!walking ? 'active' : ''}`}
            >
              {t.pause}
            </button>
            <div className="flex items-center gap-2 px-2 md:px-3 text-[10px] text-flame-300/70 tracking-wider">
              <span>{t.speed}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={(speed / 0.15) * 100}
                onChange={(e) => setSpeed((parseInt(e.target.value) / 100) * 0.15)}
                className="w-16 md:w-20 accent-flame-300"
              />
            </div>
            <button
              onClick={restart}
              className="btn-flame px-2 py-1.5 text-sm leading-none"
              aria-label={t.restart}
            >
              ↺
            </button>
          </motion.div>
        )}

        {mode === 'manual' && (
          <motion.div
            key="manual-controls"
            className="ui-chrome pointer-events-auto absolute bottom-4 md:bottom-6 left-4 md:left-6 z-30 lg:left-1/2 lg:-translate-x-1/2
                       hidden md:flex items-center gap-1 p-1.5 rounded-full control-pill"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <button
              className="btn-flame px-3 py-1.5 text-sm leading-none"
              onPointerDown={() => handleManualPress(-0.1)}
              onPointerUp={() => handleManualPress(0)}
              onPointerLeave={() => handleManualPress(0)}
              aria-label="Back"
            >
              ◄
            </button>
            <div className="px-3 md:px-4 text-[10px] text-flame-300/70 tracking-wider">
              {t.manual_hint}
            </div>
            <button
              className="btn-flame px-3 py-1.5 text-sm leading-none"
              onPointerDown={() => handleManualPress(0.12)}
              onPointerUp={() => handleManualPress(0)}
              onPointerLeave={() => handleManualPress(0)}
              aria-label="Forward"
            >
              ►
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

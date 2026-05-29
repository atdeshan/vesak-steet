'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, STREET_LENGTH } from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { QualityToggle } from './QualityToggle';

export function Controls() {
  const { phase, mode, walking, speed, position, audioEnabled, language, focusedLanternIdx } = useAppStore();
  const { setMode, setWalking, setSpeed, toggleAudio, restart } = useAppStore();
  const t = useStrings(language);

  if (phase !== 'walking') return null;

  const progressFrac = position / (STREET_LENGTH - 15);
  const pct = Math.round(progressFrac * 100);

  const handleManualPress = (vel: number) => {
    (window as any).__setManualVelocity?.(vel);
  };

  return (
    <>
      {/* Top: title, progress, audio, mode toggle */}
      <div className="ui-chrome pointer-events-none absolute top-0 inset-x-0 z-30 p-4 md:p-6 flex items-start justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/budda%20rashmi%20logo.png"
            alt="Buddha Rashmi"
            className="h-28 w-auto object-contain md:h-44"
          />
          <div>
            <div className="text-xs md:text-sm text-flame-200/75 tracking-widest uppercase">
              වෙසක් වීදිය · {t.intro_title}
            </div>
            <div className="text-[10px] md:text-xs text-flame-200/50 tracking-wide mt-0.5">
              {t.intro_subtitle}
            </div>
          </div>
        </motion.div>

        {/* Mode toggle — top center */}
        <motion.div
          className="pointer-events-auto flex gap-1 p-1 rounded-full control-pill absolute left-1/2 -translate-x-1/2"
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

        <motion.div
          className="pointer-events-auto flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
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
            className="h-20 w-auto object-contain md:h-32"
          />
        </motion.div>
      </div>

      {/* Bottom controls — auto mode */}
      <AnimatePresence mode="wait">
        {mode === 'auto' && (
          <motion.div
            key="auto-controls"
            className="ui-chrome pointer-events-auto absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30
                       flex items-center gap-1 p-1.5 rounded-full control-pill"
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

        {/* Bottom controls — manual mode */}
        {mode === 'manual' && (
          <motion.div
            key="manual-controls"
            className="ui-chrome pointer-events-auto absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30
                       flex items-center gap-1 p-1.5 rounded-full control-pill"
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

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import {
  isFirstVisit,
  markVisited,
  hasClickedLantern,
  markClickedLantern,
  hasDragged,
  markDragged,
} from '@/lib/firstVisit';

type Cue = 'drag' | 'click' | 'controls' | 'done';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FADE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: 0.6, ease: EASE },
};

const INITIAL_DELAY = 800;
const DRAG_TIMEOUT = 4500;
const CLICK_TIMEOUT = 5500;
const CONTROLS_DURATION = 4000;
const DRAG_THRESHOLD_SQ = 64; // ~8px

export function HintOverlay() {
  const phase = useAppStore((s) => s.phase);
  const language = useAppStore((s) => s.language);
  const focusedLanternIdx = useAppStore((s) => s.focusedLanternIdx);

  const [active, setActive] = useState(false);
  const [cue, setCue] = useState<Cue | null>(null);

  const clickedRef = useRef(false);
  const draggedRef = useRef(false);

  // Activate once when a fresh visitor first enters the walk.
  useEffect(() => {
    if (phase !== 'walking') return;
    if (!isFirstVisit()) return;
    markVisited();
    clickedRef.current = hasClickedLantern();
    draggedRef.current = hasDragged();
    setActive(true);
  }, [phase]);

  // Decide what to show next based on what's still unlearned.
  const decideNext = (from: 'start' | Cue): Cue => {
    if (from === 'start') {
      if (!draggedRef.current) return 'drag';
      if (!clickedRef.current) return 'click';
      return 'controls';
    }
    if (from === 'drag') {
      if (!clickedRef.current) return 'click';
      return 'controls';
    }
    if (from === 'click') return 'controls';
    return 'done';
  };

  // Sequencer — drives cue transitions with auto-timeouts.
  useEffect(() => {
    if (!active) return;

    if (cue === null) {
      const t = setTimeout(() => setCue(decideNext('start')), INITIAL_DELAY);
      return () => clearTimeout(t);
    }
    if (cue === 'done') return;

    const duration =
      cue === 'drag' ? DRAG_TIMEOUT :
      cue === 'click' ? CLICK_TIMEOUT :
      CONTROLS_DURATION;

    const t = setTimeout(() => {
      if (cue === 'drag') {
        draggedRef.current = true;
        markDragged();
      }
      if (cue === 'click') {
        clickedRef.current = true;
        markClickedLantern();
      }
      setCue(decideNext(cue));
    }, duration);
    return () => clearTimeout(t);
  }, [active, cue]);

  // Advance the moment a lantern is opened.
  useEffect(() => {
    if (focusedLanternIdx === null) return;
    if (clickedRef.current) return;
    clickedRef.current = true;
    markClickedLantern();
    if (cue === 'click') setCue(decideNext('click'));
  }, [focusedLanternIdx, cue]);

  // Advance the moment the user actually drags.
  useEffect(() => {
    if (!active || draggedRef.current) return;
    let startX = 0;
    let startY = 0;
    let down = false;

    const onDown = (e: PointerEvent) => {
      down = true;
      startX = e.clientX;
      startY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) {
        draggedRef.current = true;
        markDragged();
        if (cue === 'drag') setCue(decideNext('drag'));
      }
    };
    const onUp = () => {
      down = false;
    };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [active, cue]);

  if (phase !== 'walking' || !active || cue === null || cue === 'done') return null;

  const dragLabel =
    language === 'si' ? 'වටපිට බැලීමට ඇදගන්න'
    : language === 'ta' ? 'சுற்றிப் பார்க்க இழுக்கவும்'
    : 'Drag to look around';

  const clickLabel =
    language === 'si' ? 'කථාවක් සඳහා කූඩුවක් ක්ලික් කරන්න'
    : language === 'ta' ? 'கதைக்கு ஒரு விளக்கை கிளிக் செய்யவும்'
    : 'Tap a lantern for its story';

  const controlsLabel =
    language === 'si' ? 'වේගය හා දිශාව පාලනය කරන්න'
    : language === 'ta' ? 'வேகம் மற்றும் திசையைக் கட்டுப்படுத்துங்கள்'
    : 'Control speed & direction';

  return (
    <div className="ui-chrome pointer-events-none fixed inset-0 z-30">
      <AnimatePresence mode="wait">
        {cue === 'drag' && (
          <motion.div
            key="drag"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="control-pill absolute left-1/2 top-1/3 flex -translate-x-1/2 flex-col items-center gap-4 rounded-3xl px-6 py-5"
          >
            <div className="relative flex h-10 w-32 items-center justify-center">
              <div className="absolute left-2 right-2 top-1/2 h-px bg-flame-300/25" />
              <svg
                className="absolute left-0 h-3 w-3 text-flame-300/55"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 2L3 6L8 10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                className="absolute right-0 h-3 w-3 text-flame-300/55"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 2L9 6L4 10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <motion.div
                className="absolute h-3 w-3 rounded-full bg-flame-300 shadow-[0_0_12px_rgba(245,210,138,0.85)]"
                animate={{ x: [-44, 44, -44] }}
                transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
              />
            </div>
            <div className="text-xs uppercase tracking-widest text-flame-200/85">
              {dragLabel}
            </div>
          </motion.div>
        )}

        {cue === 'click' && (
          <motion.div
            key="click"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="control-pill absolute left-1/2 top-[45%] flex -translate-x-1/2 flex-col items-center gap-4 rounded-3xl px-6 py-5"
          >
            <div className="relative h-14 w-14">
              <motion.div
                className="absolute inset-2 rounded-full border border-flame-300/70"
                animate={{ scale: [1, 2.2, 2.2], opacity: [0.7, 0, 0] }}
                transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-flame-300/70"
                animate={{ scale: [1, 2.2, 2.2], opacity: [0.7, 0, 0] }}
                transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity, delay: 0.9 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-flame-300 shadow-[0_0_16px_rgba(245,210,138,0.9)]" />
              </div>
            </div>
            <div className="max-w-[18ch] text-center text-xs uppercase tracking-widest text-flame-200/85">
              {clickLabel}
            </div>
          </motion.div>
        )}

        {cue === 'controls' && (
          <motion.div
            key="controls"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="control-pill absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-3xl px-5 py-3 md:bottom-28"
          >
            <div className="text-xs uppercase tracking-widest text-flame-200/85">
              {controlsLabel}
            </div>
            <motion.svg
              className="h-4 w-4 text-flame-300/80"
              viewBox="0 0 16 16"
              fill="none"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
              aria-hidden
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

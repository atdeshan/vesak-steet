'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { LANTERNS } from '@/data/lanterns';
import { COLOR_PALETTE } from '@/data/types';
import { getVideoUrl } from '@/lib/config';

/**
 * Side panel shown when a lantern is clicked.
 * Plays the lantern's video, shows the story in current language.
 *
 * Dismissal: backdrop click, ESC key, or the close X. Body scroll is locked
 * while the panel is open so the page behind doesn't rubber-band on iOS.
 */
export function LanternPanel() {
  const focusedIdx = useAppStore((s) => s.focusedLanternIdx);
  const focusLantern = useAppStore((s) => s.focusLantern);
  const language = useAppStore((s) => s.language);
  const t = useStrings(language);

  const lantern = focusedIdx !== null ? LANTERNS[focusedIdx] : null;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video when panel opens
  useEffect(() => {
    if (!lantern || !videoRef.current) return;
    videoRef.current.play().catch(() => { /* autoplay may fail; UI shows play button below */ });
  }, [lantern]);

  // ESC closes the panel.
  useEffect(() => {
    if (!lantern) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') focusLantern(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lantern, focusLantern]);

  // Lock body scroll while the panel is open.
  useEffect(() => {
    if (!lantern) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [lantern]);

  const name = lantern ? (
    language === 'si' ? lantern.name_si :
    language === 'ta' ? (lantern.name_ta ?? lantern.name) :
    lantern.name
  ) : '';

  const story = lantern ? (
    language === 'si' ? lantern.story_si :
    language === 'ta' ? (lantern.story_ta ?? lantern.story_en) :
    lantern.story_en
  ) : '';

  const colorLabel = lantern ? COLOR_PALETTE[lantern.color].label : '';
  const sizeLabel = lantern ? t[`size_${lantern.size}` as const] : '';

  return (
    <AnimatePresence>
      {lantern && (
        <motion.div
          key="lantern-panel-backdrop"
          className="fixed inset-0 z-50 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => focusLantern(null)}
        >
          <motion.aside
            className="panel-glass panel-scroll absolute top-0 right-0 bottom-0
                       w-full sm:w-[360px] md:w-[400px] overflow-y-auto"
            style={{ touchAction: 'pan-y' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-6 md:p-8"
              style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
            >
              <button
                onClick={() => focusLantern(null)}
                className="absolute right-3 w-11 h-11 rounded-full
                           border border-flame-300/30 text-flame-300 text-lg
                           hover:bg-flame-300/10 transition-colors
                           flex items-center justify-center"
                style={{ top: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
                aria-label={t.close}
              >
                ×
              </button>

              {/* Title */}
              <div className="mb-4 pr-12">
                <h2 className="text-xl md:text-2xl font-light text-flame-300 mb-1">
                  {name}
                </h2>
                <div className="text-[10px] tracking-widest uppercase text-flame-200/60">
                  {lantern.location} · {colorLabel}
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-5">
                <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full
                                 bg-flame-300/10 border border-flame-300/20 text-flame-300">
                  {sizeLabel}
                </span>
                <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full
                                 bg-flame-300/10 border border-flame-300/20 text-flame-300">
                  {lantern.zone}
                </span>
              </div>

              {/* Video */}
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-5
                              border border-flame-300/15 bg-gradient-to-br from-flame-900 via-amber-900/40 to-flame-900
                              flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={getVideoUrl(lantern.video)}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  loop
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute text-flame-200/40 text-xs">▶ video plays here</div>
              </div>

              {/* Sinhala name (if not Sinhala mode) */}
              {language !== 'si' && lantern.name_si && (
                <div className="font-serif italic text-flame-200/70 text-sm mb-3">
                  {lantern.name_si}
                </div>
              )}

              {/* Story */}
              <p className="text-sm leading-relaxed text-flame-200/80">
                {story}
              </p>

              {/* Credits */}
              {(lantern.artist || lantern.sponsor) && (
                <div className="mt-6 pt-4 border-t border-flame-300/15 space-y-1">
                  {lantern.artist && (
                    <div className="text-xs text-flame-200/60">
                      <span className="uppercase tracking-wider text-[10px]">Artist</span>{' '}
                      {lantern.artist}
                    </div>
                  )}
                  {lantern.sponsor && (
                    <div className="text-xs text-flame-200/60">
                      <span className="uppercase tracking-wider text-[10px]">Sponsor</span>{' '}
                      {lantern.sponsor}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

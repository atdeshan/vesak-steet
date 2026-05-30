'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store';
import type { Language, QualityLevel } from '@/lib/store';

/* ─── Inline SVG icons (matches the existing HintOverlay inline pattern) ── */

function SettingsIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CloseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function VolumeOnIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeOffIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

/* ─── Settings drawer ────────────────────────────────────────────────── */

const QUALITY_OPTIONS: QualityLevel[] = ['low', 'medium', 'high'];
const LANGUAGE_OPTIONS: [Language, string][] = [
  ['en', 'EN'],
  ['si', 'සි'],
  ['ta', 'த'],
];

/**
 * Mobile-only settings sheet. Trigger button sits in the top bar (`md:hidden`).
 *
 * Three structural fixes vs the prior version:
 *   • Portaled to document.body — escapes any parent `pointer-events-none`,
 *     so the backdrop and close button always receive taps.
 *   • Backdrop is its own absolutely-positioned div with its own onClick —
 *     no event swallowing from sibling elements.
 *   • Content area is a flex-1 div with `overflow-y: auto` + `touch-action:
 *     pan-y` + `-webkit-overflow-scrolling: touch`. With `overflow: hidden`
 *     on body, this is the only place a vertical drag can scroll.
 */
export function MobileSettingsDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const quality = useAppStore((s) => s.quality);
  const setQuality = useAppStore((s) => s.setQuality);
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  const toggleAudio = useAppStore((s) => s.toggleAudio);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const speed = useAppStore((s) => s.speed);
  const setSpeed = useAppStore((s) => s.setSpeed);
  const restart = useAppStore((s) => s.restart);

  // Portal mount guard so SSR doesn't try to render to document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll only while drawer is open; restore prior overflow on close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes the drawer (a11y / desktop preview)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const trigger = (
    <button
      onClick={() => setOpen(true)}
      className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-flame-300/20 bg-black/40 text-flame-200 backdrop-blur-md md:hidden"
      aria-label="Open settings"
      style={{ pointerEvents: 'auto' }}
    >
      <SettingsIcon />
    </button>
  );

  const drawer =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000] md:hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Backdrop — own element, owns its own click */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            {/* Drawer panel */}
            <div
              className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl border-t border-flame-300/15 bg-[#0a0610]"
              style={{
                maxHeight: '85vh',
                paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
              }}
            >
              {/* Sticky header */}
              <div className="flex shrink-0 items-center justify-between border-b border-flame-300/15 p-4">
                <h2 className="text-base font-medium text-flame-200">Settings</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="-m-2 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center p-2 text-flame-200/85"
                  aria-label="Close settings"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Scrollable content — the one place a vertical drag is permitted */}
              <div
                className="flex-1 space-y-5 overflow-y-auto p-4"
                style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
              >
                {/* Quality */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-flame-200/60">
                    Quality
                  </label>
                  <div className="flex gap-1 rounded-full bg-black/40 p-1">
                    {QUALITY_OPTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`min-h-[44px] flex-1 rounded-full px-3 py-2.5 text-xs uppercase tracking-wide ${
                          quality === q
                            ? 'bg-flame-300/20 text-flame-200'
                            : 'text-flame-200/60'
                        }`}
                      >
                        {q === 'medium' ? 'Med' : q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed slider */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-flame-200/60">
                    Speed: {(speed * 20).toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min={0.02}
                    max={0.15}
                    step={0.01}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="min-h-[44px] w-full accent-flame-300"
                  />
                </div>

                {/* Audio */}
                <button
                  onClick={toggleAudio}
                  className="flex min-h-[52px] w-full items-center justify-between rounded-xl bg-black/40 px-4 py-3 text-flame-200"
                >
                  <span className="text-sm">Background Music</span>
                  {audioEnabled ? (
                    <VolumeOnIcon />
                  ) : (
                    <VolumeOffIcon className="h-5 w-5 text-flame-200/55" />
                  )}
                </button>

                {/* Language */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-flame-200/60">
                    Language
                  </label>
                  <div className="flex gap-1 rounded-full bg-black/40 p-1">
                    {LANGUAGE_OPTIONS.map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => setLanguage(code)}
                        className={`min-h-[44px] flex-1 rounded-full px-3 py-2.5 text-xs ${
                          language === code
                            ? 'bg-flame-300/20 text-flame-200'
                            : 'text-flame-200/60'
                        }`}
                        style={
                          code === 'si'
                            ? { fontFamily: 'var(--font-sinhala), sans-serif' }
                            : undefined
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Restart */}
                <button
                  onClick={() => {
                    restart();
                    setOpen(false);
                  }}
                  className="min-h-[52px] w-full rounded-xl bg-flame-300/15 px-4 py-3 text-sm text-flame-200 active:bg-flame-300/25"
                >
                  Restart Walk
                </button>

                {/* Bottom spacer so the last button isn't flush against home indicator */}
                <div className="h-2" />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {trigger}
      {drawer}
    </>
  );
}

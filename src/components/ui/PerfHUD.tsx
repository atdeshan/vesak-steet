'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { loadStoredVisible, usePerfStore } from '@/lib/perfStore';

const TAP_ZONE_PX = 60;
const TAP_RESET_MS = 1200;
const TAPS_TO_TOGGLE = 4;

const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

/**
 * Live perf overlay. Hidden by default; persisted in localStorage.
 *   • Desktop: Shift+D toggles.
 *   • Mobile:  4 rapid taps in the top-left 60×60 corner toggle.
 *
 * Renders nothing when hidden, and the sampler that feeds it is conditionally
 * mounted in Scene.tsx so the cost when off is one keydown listener + one
 * passive touchstart listener — both negligible.
 */
export function PerfHUD() {
  const visible = usePerfStore((s) => s.visible);
  const metrics = usePerfStore((s) => s.metrics);
  const log = usePerfStore((s) => s.log);
  const toggle = usePerfStore((s) => s.toggle);
  const setVisible = usePerfStore((s) => s.setVisible);
  const quality = useAppStore((s) => s.quality);

  const tapCount = useRef(0);
  const tapTimer = useRef<number | null>(null);

  // Hydrate the persisted visibility flag AFTER mount so the server and the
  // first client render agree (both show hidden HUD). Skipping this step
  // causes a hydration mismatch when the user had the HUD on previously.
  useEffect(() => {
    if (loadStoredVisible()) setVisible(true);
  }, [setVisible]);

  // Shift+D toggle (desktop). Always attached.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  // 4-tap top-left toggle (mobile). Passive listener so we never block
  // any normal scene interaction.
  useEffect(() => {
    if (!isTouchDevice) return;
    const handler = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > TAP_ZONE_PX || t.clientY > TAP_ZONE_PX) return;
      tapCount.current += 1;
      if (tapTimer.current !== null) window.clearTimeout(tapTimer.current);
      tapTimer.current = window.setTimeout(() => {
        tapCount.current = 0;
      }, TAP_RESET_MS);
      if (tapCount.current >= TAPS_TO_TOGGLE) {
        toggle();
        tapCount.current = 0;
      }
    };
    window.addEventListener('touchstart', handler, { passive: true });
    return () => window.removeEventListener('touchstart', handler);
  }, [toggle]);

  const copyLog = async () => {
    try {
      const json = JSON.stringify(log, null, 2);
      await navigator.clipboard.writeText(json);
    } catch {
      // ignore — clipboard may be unavailable on insecure origins
    }
  };

  if (!visible) return null;

  return (
    <div
      className="ui-chrome pointer-events-auto fixed top-2 left-2 z-[100] rounded-md bg-black/80 p-2 font-mono text-[9px] leading-tight text-flame-200/90 shadow-lg backdrop-blur-sm md:top-auto md:bottom-2 md:text-[10px]"
      style={{ minWidth: 160 }}
    >
      <div className="mb-1 flex items-center justify-between gap-3 border-b border-flame-300/15 pb-1">
        <span className="font-bold uppercase tracking-wider text-flame-300/80">Perf</span>
        <span className="text-flame-200/55">
          {quality} · {isTouchDevice ? 'mobile' : 'desktop'}
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-3 tabular-nums">
        <span>fps</span>      <span className="text-right">{metrics.fps}</span>
        <span>frame ms</span> <span className="text-right">{metrics.frameMs}</span>
        <span>draws</span>    <span className="text-right">{metrics.drawCalls}</span>
        <span>tris</span>     <span className="text-right">{metrics.triangles.toLocaleString()}</span>
        <span>geoms</span>    <span className="text-right">{metrics.geometries}</span>
        <span>tex</span>      <span className="text-right">{metrics.textures}</span>
        <span>videos</span>   <span className="text-right">{metrics.activeVideos}</span>
        <span>heap MB</span>  <span className="text-right">{metrics.heapMB ?? 'n/a'}</span>
      </div>

      <button
        type="button"
        onClick={copyLog}
        className="mt-2 w-full rounded bg-flame-300/15 px-2 py-1 text-[9px] uppercase tracking-wider text-flame-200/85 transition-colors hover:bg-flame-300/25"
      >
        Copy log ({log.length})
      </button>
    </div>
  );
}

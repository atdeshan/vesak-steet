'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAppStore, loadStoredQuality, type QualityLevel } from '@/lib/store';

interface NetworkConnection {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorWithExtras extends Navigator {
  connection?: NetworkConnection;
  deviceMemory?: number;
}

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Pick an initial quality tier based on:
 * - Touch devices default to `medium` (mobile GPUs are weaker than desktop dGPUs,
 *   so `high` is rarely a good choice on phones regardless of RAM/cores)
 * - Slow networks or save-data flag force `low`
 * - Very low RAM (≤2GB) or cores (≤2) force `low` on any device
 * - Desktop gets `high` by default
 */
function detectInitialQuality(): QualityLevel {
  if (typeof navigator === 'undefined') return 'medium';
  const nav = navigator as NavigatorWithExtras;
  const conn = nav.connection;
  const memory = nav.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const touch = isTouchDevice();

  // Hard floor: very weak hardware or slow network → low, regardless of touch
  if (conn?.saveData) return 'low';
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return 'low';
  if (memory !== undefined && memory <= 2) return 'low';
  if (cores !== undefined && cores <= 2) return 'low';

  // Touch device → medium ceiling (phones with high RAM still have weak GPUs)
  if (touch) {
    if (conn?.effectiveType === '3g') return 'low';
    return 'medium';
  }

  // Desktop: 3G connection still gets medium
  if (conn?.effectiveType === '3g') return 'medium';

  return 'high';
}

/**
 * Adaptive FPS thresholds. Mobile expectations are softer because
 * 22fps still feels reasonable on a phone display.
 */
function adaptiveFpsThreshold(): number {
  return isTouchDevice() ? 22 : 30;
}
const ADAPTIVE_SAMPLE_SECONDS = 4;
const ADAPTIVE_DOWNGRADE_COOLDOWN_MS = 8000;

/**
 * Lives inside the Canvas — watches FPS while quality is still auto-detected
 * and drops one tier if FPS stays below threshold for ADAPTIVE_SAMPLE_SECONDS.
 * Does not upgrade back up; once we downgrade for the session, we stay there.
 */
function AdaptiveDowngrader() {
  const quality = useAppStore((s) => s.quality);
  const qualityAutoDetected = useAppStore((s) => s.qualityAutoDetected);
  const setQuality = useAppStore((s) => s.setQuality);

  const lastFrameRef = useRef(performance.now());
  const lowFpsAccumRef = useRef(0); // accumulated seconds spent below threshold
  const lastDowngradeRef = useRef(0);

  useFrame(() => {
    if (!qualityAutoDetected) return; // user override — never touch
    if (quality === 'low') return;    // can't downgrade further

    const now = performance.now();
    const dtMs = now - lastFrameRef.current;
    lastFrameRef.current = now;
    // Skip tab-switch / first-frame anomalies
    if (dtMs <= 0 || dtMs > 1000) return;

    const fps = 1000 / dtMs;
    const threshold = adaptiveFpsThreshold();

    if (fps < threshold) {
      lowFpsAccumRef.current += dtMs / 1000;
    } else {
      // Decay accumulator while FPS holds up — single brief stutter shouldn't downgrade.
      lowFpsAccumRef.current = Math.max(0, lowFpsAccumRef.current - dtMs / 1000);
    }

    if (
      lowFpsAccumRef.current >= ADAPTIVE_SAMPLE_SECONDS &&
      now - lastDowngradeRef.current > ADAPTIVE_DOWNGRADE_COOLDOWN_MS
    ) {
      const next: QualityLevel = quality === 'high' ? 'medium' : 'low';
      // eslint-disable-next-line no-console
      console.log(
        `[adaptive] downgrading ${quality} → ${next} after ${ADAPTIVE_SAMPLE_SECONDS}s below ${threshold}fps`,
      );
      setQuality(next, { fromAutoDetect: true });
      lowFpsAccumRef.current = 0;
      lastDowngradeRef.current = now;
    }
  });

  return null;
}

/**
 * On mount, picks the initial quality tier (touch-aware), and mounts the
 * adaptive downgrader inside the Canvas so it can sample FPS via useFrame.
 *
 * MUST be mounted inside <Canvas>. A persisted user choice always wins
 * over auto-detection.
 */
export function ConnectionDetector() {
  const setQuality = useAppStore((s) => s.setQuality);

  useEffect(() => {
    const stored = loadStoredQuality();
    if (stored) {
      setQuality(stored, { fromAutoDetect: false });
      return;
    }
    setQuality(detectInitialQuality(), { fromAutoDetect: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AdaptiveDowngrader />;
}

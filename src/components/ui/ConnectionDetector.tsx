'use client';

import { useEffect } from 'react';
import { useAppStore, loadStoredQuality, type QualityLevel } from '@/lib/store';

interface NetworkConnection {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorWithExtras extends Navigator {
  connection?: NetworkConnection;
  deviceMemory?: number;
}

function detectQuality(): QualityLevel {
  if (typeof navigator === 'undefined') return 'high';
  const nav = navigator as NavigatorWithExtras;

  const conn = nav.connection;
  if (conn?.saveData || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
    return 'low';
  }

  const memory = nav.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  if (
    conn?.effectiveType === '3g' ||
    (memory !== undefined && memory <= 2) ||
    (cores !== undefined && cores <= 2)
  ) {
    return 'medium';
  }

  return 'high';
}

/**
 * On mount, picks an initial quality tier. A persisted user choice wins;
 * otherwise the device's connection + RAM + core count are used to choose
 * 'low' / 'medium' / 'high'. Runs once.
 */
export function ConnectionDetector() {
  const setQuality = useAppStore((s) => s.setQuality);

  useEffect(() => {
    const stored = loadStoredQuality();
    if (stored) {
      setQuality(stored, { fromAutoDetect: false });
      return;
    }
    setQuality(detectQuality(), { fromAutoDetect: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

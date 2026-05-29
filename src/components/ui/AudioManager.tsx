'use client';

import { useEffect, useRef } from 'react';
import { useAppStore, STREET_LENGTH } from '@/lib/store';

/**
 * Audio system.
 * Layers ambient pirith + bhakti gee + street ambience.
 * Volume fades based on whether a lantern panel is open (duck audio when reading).
 *
 * Audio files to drop into /public/audio/:
 *   ambience.mp3   — base street ambience (loops)
 *   pirith.mp3     — pirith chanting layer (loops)
 *   bhakti.mp3     — bhakti gee music layer (loops)
 *
 * If any file is missing, that layer silently does nothing.
 */
export function AudioManager() {
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  const focused = useAppStore((s) => s.focusedLanternIdx);
  const position = useAppStore((s) => s.position);

  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const pirithRef = useRef<HTMLAudioElement | null>(null);
  const bhaktiRef = useRef<HTMLAudioElement | null>(null);

  // Lazy-create audio elements
  useEffect(() => {
    if (!ambienceRef.current) {
      ambienceRef.current = new Audio('/audio/ambience.mp3');
      ambienceRef.current.loop = true;
      ambienceRef.current.volume = 0;
    }
    if (!pirithRef.current) {
      pirithRef.current = new Audio('/audio/pirith.mp3');
      pirithRef.current.loop = true;
      pirithRef.current.volume = 0;
    }
    if (!bhaktiRef.current) {
      bhaktiRef.current = new Audio('/audio/bhakti.mp3');
      bhaktiRef.current.loop = true;
      bhaktiRef.current.volume = 0;
    }
  }, []);

  // Play/pause based on toggle
  useEffect(() => {
    const all = [ambienceRef.current, pirithRef.current, bhaktiRef.current];
    if (audioEnabled) {
      all.forEach((a) => {
        a?.play().catch(() => { /* user-gesture needed if first time */ });
      });
    } else {
      all.forEach((a) => a?.pause());
    }
  }, [audioEnabled]);

  // Volume mixing — pirith fades up over the walk, bhakti is constant, ducks all when panel open
  useEffect(() => {
    if (!audioEnabled) return;
    const progress = position / STREET_LENGTH;
    const duck = focused !== null ? 0.3 : 1.0;

    if (ambienceRef.current) ambienceRef.current.volume = 0.4 * duck;
    if (pirithRef.current) pirithRef.current.volume = (0.2 + progress * 0.3) * duck;
    if (bhaktiRef.current) bhaktiRef.current.volume = 0.3 * duck;
  }, [audioEnabled, position, focused]);

  return null;
}

'use client';

import { useEffect, useRef } from 'react';
import { useAppStore, STREET_LENGTH } from '@/lib/store';

const AUDIO_SRC = '/audio/ambient-music.mp3';
const TARGET_VOLUME = 0.18;
const FADE_DURATION_MS = 1000;
const LOOP_GAP_MS = 5000;
const NEAR_END_THRESHOLD = 0.9;

export function AmbientMusicPlayer() {
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  const phase = useAppStore((s) => s.phase);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.preload = 'auto';
    audio.volume = 0;
    audio.loop = false;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fadeTo = (target: number, durationMs: number, onComplete?: () => void) => {
      if (!audioRef.current) return;
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      const startVolume = audioRef.current.volume;
      const startTime = performance.now();

      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) return;
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / durationMs, 1);
        audioRef.current.volume = startVolume + (target - startVolume) * t;

        if (t >= 1) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          onComplete?.();
        }
      }, 30);
    };

    const isNearEnd = () => {
      const pos = useAppStore.getState().position;
      return pos / STREET_LENGTH >= NEAR_END_THRESHOLD;
    };

    const playOnce = () => {
      const a = audioRef.current;
      if (!a || !isActiveRef.current) return;

      a.currentTime = 0;
      a.volume = 0;

      a.play()
        .then(() => {
          if (!isActiveRef.current) {
            a.pause();
            return;
          }
          fadeTo(TARGET_VOLUME, FADE_DURATION_MS);
        })
        .catch(() => {
          // Autoplay blocked — next state change after a user gesture will retry
        });
    };

    const handleTrackEnd = () => {
      if (!isActiveRef.current) return;
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);

      loopTimerRef.current = setTimeout(() => {
        if (!isActiveRef.current) return;
        if (isNearEnd()) return;
        playOnce();
      }, LOOP_GAP_MS);
    };

    const shouldPlay = audioEnabled && phase === 'walking';

    if (shouldPlay && !isActiveRef.current) {
      isActiveRef.current = true;
      audio.addEventListener('ended', handleTrackEnd);
      playOnce();
    } else if (!shouldPlay && isActiveRef.current) {
      isActiveRef.current = false;
      audio.removeEventListener('ended', handleTrackEnd);
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      fadeTo(0, FADE_DURATION_MS, () => {
        audioRef.current?.pause();
      });
    }

    return () => {
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [audioEnabled, phase]);

  return null;
}

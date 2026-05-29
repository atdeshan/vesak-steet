'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/lib/store';
import { usePerfStore } from '@/lib/perfStore';

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number };
}

/**
 * Lives inside the Canvas. Conditionally mounted by Scene.tsx based on the
 * HUD visibility flag — so when the HUD is hidden there is zero per-frame
 * cost from this module.
 *
 * Samples renderer.info every 500ms and writes to the perf store. Also
 * pushes a snapshot to a rolling 30-second log.
 */
export function PerfHudSampler() {
  const { gl } = useThree();
  const setMetrics = usePerfStore((s) => s.setMetrics);
  const pushSample = usePerfStore((s) => s.pushSample);

  const frames = useRef(0);
  const lastTime = useRef(performance.now());
  const lastSample = useRef(performance.now());
  const accumulatedMs = useRef(0);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    accumulatedMs.current += delta;
    frames.current += 1;
    lastTime.current = now;

    if (now - lastSample.current < 500) return;

    const elapsed = (now - lastSample.current) / 1000;
    const fps = frames.current / elapsed;
    const frameMs = accumulatedMs.current / Math.max(frames.current, 1);

    const activeVideos =
      typeof document !== 'undefined'
        ? Array.from(document.querySelectorAll('video')).filter((v) => !v.paused).length
        : 0;

    const perf = performance as PerformanceWithMemory;
    const heap = perf.memory?.usedJSHeapSize;
    const heapMB = heap !== undefined ? Math.round(heap / 1048576) : null;

    const metrics = {
      fps: Math.round(fps),
      frameMs: Math.round(frameMs * 10) / 10,
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      activeVideos,
      heapMB,
    };
    setMetrics(metrics);
    pushSample({
      ts: Date.now(),
      fps: metrics.fps,
      drawCalls: metrics.drawCalls,
      triangles: metrics.triangles,
      activeVideos: metrics.activeVideos,
      heapMB: metrics.heapMB,
      qualityTier: useAppStore.getState().quality,
    });

    frames.current = 0;
    accumulatedMs.current = 0;
    lastSample.current = now;
  });

  return null;
}

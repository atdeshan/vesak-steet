'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { Environment } from './Environment';
import { WalkingCamera } from './WalkingCamera';
import { Lantern } from './Lantern';
import { Decorations, BUNTING_POLE_ZS } from './Decorations';
import { StreetLights } from './StreetLights';
import { PerfHudSampler } from './PerfHudSampler';
import { StartupLog } from './StartupLog';
import { LANTERNS } from '@/data/lanterns';
import { useAppStore, STREET_LENGTH } from '@/lib/store';
import { useQualitySettings } from '@/lib/quality';
import { usePerfStore } from '@/lib/perfStore';
import { SIZE_SCALE } from '@/data/types';

/**
 * Computes lantern positions along the street.
 * Lanterns are spaced evenly across STREET_LENGTH, alternating sides, with
 * size affecting distance from the road centerline.
 *
 * Any lantern that would naturally sit inside POLE_AVOID_DZ of a bunting
 * anchor pole gets nudged away from that pole — forward (more negative) if
 * it's ahead of the pole, backward if it's behind. Keeps the scene visually
 * clean without trying to also re-distribute every other lantern.
 */
const POLE_AVOID_DZ = 3.0;

function nudgeAwayFromPoles(z: number): number {
  for (const poleZ of BUNTING_POLE_ZS) {
    const diff = z - poleZ;
    if (Math.abs(diff) < POLE_AVOID_DZ) {
      const sign = diff >= 0 ? 1 : -1;
      return poleZ + sign * POLE_AVOID_DZ;
    }
  }
  return z;
}

function getLanternPositions() {
  const N = LANTERNS.length;
  return LANTERNS.map((data, i) => {
    const baseZ = -(i / (N - 1)) * (STREET_LENGTH - 25) - 12;
    const z = nudgeAwayFromPoles(baseZ);
    const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
    const scale = SIZE_SCALE[data.size];
    const distFromCenter = 8 + scale * 1.5;
    const x = side * distFromCenter;
    return { position: [x, 0, z] as [number, number, number], side, data, index: i };
  });
}

export function Scene() {
  const focusedLanternIdx = useAppStore((s) => s.focusedLanternIdx);
  const focusLantern = useAppStore((s) => s.focusLantern);
  const settings = useQualitySettings();
  const perfHudVisible = usePerfStore((s) => s.visible);

  // TEMPORARY DIAGNOSTIC — counts Scene re-renders. Remove after perf check.
  const sceneRenderCount = useRef(0);
  sceneRenderCount.current++;
  if (sceneRenderCount.current % 30 === 0) {
    // eslint-disable-next-line no-console
    console.log('[Scene] renders so far:', sceneRenderCount.current);
  }

  const lanternPositions = useMemo(() => getLanternPositions(), []);

  return (
    <Canvas
      camera={{ position: [0, 2.2, 0], fov: 72, near: 0.1, far: 300 }}
      dpr={[1, settings.pixelRatioCap]}
      gl={{ antialias: settings.antialias, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: '#050308', touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <StartupLog />
        {perfHudVisible && <PerfHudSampler />}
        <Environment />
        <Decorations />
        <StreetLights />
        <WalkingCamera />

        {lanternPositions.map(({ position: pos, side, data, index }) => (
          <Lantern
            key={data.id}
            data={data}
            index={index}
            position={pos}
            side={side}
            focused={focusedLanternIdx === index}
            onSelect={focusLantern}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}

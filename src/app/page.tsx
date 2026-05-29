'use client';

import dynamic from 'next/dynamic';
import { LandingScreen } from '@/components/ui/LandingScreen';
import { Controls } from '@/components/ui/Controls';
import { HintOverlay } from '@/components/ui/HintOverlay';
import { LanternPanel } from '@/components/ui/LanternPanel';
import { ClosingScreen } from '@/components/ui/ClosingScreen';
import { AudioManager } from '@/components/ui/AudioManager';
import { SponsorMark } from '@/components/ui/SponsorMark';
import { PerfHUD } from '@/components/ui/PerfHUD';

// Lazy-load the 3D scene to avoid blocking initial render
const Scene = dynamic(() => import('@/components/scene/Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-night-900 text-flame-300/60 text-xs tracking-widest uppercase">
      Lighting the lanterns
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-night-900">
      <Scene />
      <Controls />
      <HintOverlay />
      <LanternPanel />
      <ClosingScreen />
      <AudioManager />
      <LandingScreen />
      <SponsorMark />
      <PerfHUD />
    </main>
  );
}

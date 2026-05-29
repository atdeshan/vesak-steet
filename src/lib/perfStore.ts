import { create } from 'zustand';

export interface Metrics {
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  activeVideos: number;
  heapMB: number | null;
}

export interface PerfSample {
  ts: number;
  fps: number;
  drawCalls: number;
  triangles: number;
  activeVideos: number;
  heapMB: number | null;
  qualityTier: string;
}

const ZERO_METRICS: Metrics = {
  fps: 0,
  frameMs: 0,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  activeVideos: 0,
  heapMB: null,
};

const STORAGE_KEY = 'vesak.perfHud';
const MAX_LOG = 60;

/** Read the persisted visibility flag. Safe to call client-only. */
export function loadStoredVisible(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistVisible(v: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    // Storage blocked — fail silently
  }
}

interface PerfState {
  visible: boolean;
  metrics: Metrics;
  log: PerfSample[];
  toggle: () => void;
  setVisible: (v: boolean) => void;
  setMetrics: (m: Metrics) => void;
  pushSample: (s: PerfSample) => void;
  clearLog: () => void;
}

export const usePerfStore = create<PerfState>((set) => ({
  // SSR-safe default. The persisted value is read post-mount inside PerfHUD
  // so the server and the first client render agree (hidden by default).
  visible: false,
  metrics: ZERO_METRICS,
  log: [],
  toggle: () =>
    set((state) => {
      const next = !state.visible;
      persistVisible(next);
      return { visible: next };
    }),
  setVisible: (v) => {
    persistVisible(v);
    set({ visible: v });
  },
  setMetrics: (m) => set({ metrics: m }),
  pushSample: (s) =>
    set((state) => ({
      log: state.log.length >= MAX_LOG ? [...state.log.slice(1), s] : [...state.log, s],
    })),
  clearLog: () => set({ log: [] }),
}));

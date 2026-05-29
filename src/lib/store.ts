import { create } from 'zustand';

export type Mode = 'auto' | 'manual';
export type Language = 'en' | 'si' | 'ta';
export type Phase = 'presents' | 'intro' | 'walking' | 'closing';
export type QualityLevel = 'high' | 'medium' | 'low';

const QUALITY_STORAGE_KEY = 'vesak.quality';

export function loadStoredQuality(): QualityLevel | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(QUALITY_STORAGE_KEY);
    if (v === 'high' || v === 'medium' || v === 'low') return v;
    return null;
  } catch {
    return null;
  }
}

function persistQuality(q: QualityLevel): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUALITY_STORAGE_KEY, q);
  } catch {
    // Storage blocked (private mode, quota) — fail silently
  }
}

interface AppState {
  // Walk state
  position: number;
  walking: boolean;
  speed: number;
  mode: Mode;
  focusedLanternIdx: number | null;

  // Audio
  audioEnabled: boolean;

  // UI
  language: Language;
  phase: Phase;
  quality: QualityLevel;
  /** True when the current value came from auto-detection (not a user override). */
  qualityAutoDetected: boolean;
  introComplete: boolean;

  // Actions
  setPosition: (p: number) => void;
  setWalking: (w: boolean) => void;
  setSpeed: (s: number) => void;
  setMode: (m: Mode) => void;
  focusLantern: (idx: number | null) => void;
  toggleAudio: () => void;
  setLanguage: (l: Language) => void;
  setPhase: (p: Phase) => void;
  setQuality: (q: QualityLevel, opts?: { fromAutoDetect?: boolean }) => void;
  completePresents: () => void;
  completeIntro: () => void;
  restart: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  position: 0,
  walking: true,
  speed: 0.05,
  mode: 'auto',
  focusedLanternIdx: null,
  audioEnabled: false,
  language: 'en',
  phase: 'presents',
  quality: 'medium',
  qualityAutoDetected: false,
  introComplete: false,

  setPosition: (p) => set({ position: p }),
  setWalking: (w) => set({ walking: w }),
  setSpeed: (s) => set({ speed: s }),
  setMode: (m) => set((state) => ({
    mode: m,
    walking: m === 'auto' ? state.walking : false,
  })),
  focusLantern: (idx) => set((state) => ({
    focusedLanternIdx: idx,
    walking: idx !== null ? false : state.walking,
  })),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setLanguage: (l) => set({ language: l }),
  setPhase: (p) => set({ phase: p }),
  setQuality: (q, opts) => {
    const autoDetected = opts?.fromAutoDetect ?? false;
    if (!autoDetected) persistQuality(q);
    set({ quality: q, qualityAutoDetected: autoDetected });
  },
  completePresents: () => set({ phase: 'intro' }),
  completeIntro: () => set({ introComplete: true, phase: 'walking' }),
  restart: () => set({
    position: 0,
    walking: true,
    focusedLanternIdx: null,
    phase: 'walking',
  }),
}));

/** Street length in 3D units, exposed for components to compute progress */
export const STREET_LENGTH = 500;

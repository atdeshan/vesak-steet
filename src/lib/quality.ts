import { useAppStore, type QualityLevel } from './store';

export interface QualitySettings {
  // Lantern
  lanternFacets: number;
  tasselCount: number;
  showSeams: boolean;
  showTierBands: boolean;
  /** Below this distance lanterns render full detail (tassels, seams, bulbs). */
  lodNearDistance: number;
  /** Below this distance lanterns render body + rims + roof but no small parts. */
  lodMidDistance: number;
  // Moon
  moonSegments: number;
  moonHaloLayers: 2 | 3;
  // Video
  loadVideos: boolean;
  videoLoadDistance: number;
  // Scene
  starCount: number;
  pixelRatioCap: number;
  antialias: boolean;
  /** Render the pandol arches, hanging banners and bunting along the street. */
  showDecorations: boolean;
  /** Render the overhead LED light strings. Cheap — always one draw call. */
  showStreetLights: boolean;
  /** How many light strings cross / run along the street. */
  streetLightStrings: number;
  /** Bulbs per string — controls overall fill-rate cost (additive blending). */
  lightsPerString: number;
  /** Whether the bulbs gently twinkle (vertex shader, ~0 CPU cost). */
  streetLightTwinkle: boolean;
}

export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  high: {
    lanternFacets: 8,
    tasselCount: 32,
    showSeams: true,
    showTierBands: true,
    lodNearDistance: 40,
    lodMidDistance: 90,
    moonSegments: 64,
    moonHaloLayers: 3,
    loadVideos: true,
    videoLoadDistance: 30,
    starCount: 1500,
    pixelRatioCap: 1.25,
    antialias: true,
    showDecorations: true,
    showStreetLights: true,
    streetLightStrings: 10,
    lightsPerString: 60,
    streetLightTwinkle: true,
  },
  medium: {
    lanternFacets: 8,
    tasselCount: 16,
    showSeams: false,
    showTierBands: true,
    lodNearDistance: 30,
    lodMidDistance: 70,
    moonSegments: 32,
    moonHaloLayers: 3,
    loadVideos: true,
    videoLoadDistance: 20,
    starCount: 800,
    pixelRatioCap: 1.0,
    antialias: true,
    showDecorations: true,
    showStreetLights: true,
    streetLightStrings: 8,
    lightsPerString: 45,
    streetLightTwinkle: true,
  },
  low: {
    lanternFacets: 6,
    tasselCount: 0,
    showSeams: false,
    showTierBands: false,
    lodNearDistance: 20,
    lodMidDistance: 50,
    moonSegments: 24,
    moonHaloLayers: 2,
    loadVideos: false,
    videoLoadDistance: 0,
    starCount: 400,
    pixelRatioCap: 0.85,
    antialias: false,
    showDecorations: false,
    showStreetLights: true,
    streetLightStrings: 5,
    lightsPerString: 30,
    streetLightTwinkle: false,
  },
};

export function useQualitySettings(): QualitySettings {
  const quality = useAppStore((s) => s.quality);
  return QUALITY_PRESETS[quality];
}

/**
 * Vesak Lantern Data Types
 *
 * This is the schema the client should fill in for each of the 100 lanterns.
 * One entry per lantern in src/data/lanterns.ts.
 */

export type LanternSize = 'small' | 'medium' | 'large' | 'massive';

export type LanternColor =
  | 'saffron'
  | 'gold'
  | 'vermillion'
  | 'crimson'
  | 'sky'
  | 'sacred-green'
  | 'violet'
  | 'moonlight'
  | 'coral'
  | 'indigo';

export type Zone =
  | 'Fort'
  | 'Pettah'
  | 'Kollupitiya'
  | 'Bambalapitiya'
  | 'Wellawatte'
  | 'Dehiwala'
  | 'Galle Face'
  | 'Marine Drive';

export interface Lantern {
  /** Unique ID, e.g. "001", "002" — used in URLs and analytics */
  id: string;

  /** Display name in English */
  name: string;

  /** Display name in Sinhala (Unicode) */
  name_si: string;

  /** Optional Tamil name */
  name_ta?: string;

  /** Location description, e.g. "Gangaramaya Temple" */
  location: string;

  /** Zone — determines where on the street this appears */
  zone: Zone;

  /** Visual size of the lantern in the 3D scene */
  size: LanternSize;

  /** Tint color — determines lantern body color and glow */
  color: LanternColor;

  /** 2–3 sentence story in English */
  story_en: string;

  /** Story in Sinhala */
  story_si: string;

  /** Optional Tamil story */
  story_ta?: string;

  /** Path to the video file under public/lanterns/ (e.g. "001.mp4") */
  video: string;

  /** Optional thumbnail/poster for the video */
  thumbnail?: string;

  /** Optional artist or sponsor credit */
  artist?: string;

  /** Optional sponsor */
  sponsor?: string;

  /** Year created, defaults to current Vesak year */
  year?: number;
}

/** Color palette — used by the 3D renderer */
export const COLOR_PALETTE: Record<LanternColor, { tint: number; glow: number; label: string }> = {
  saffron:        { tint: 0xff8533, glow: 0xff8533, label: 'Saffron' },
  gold:           { tint: 0xffd86b, glow: 0xffd86b, label: 'Gold' },
  vermillion:     { tint: 0xff6b35, glow: 0xff6b35, label: 'Vermillion' },
  crimson:        { tint: 0xe94560, glow: 0xe94560, label: 'Crimson' },
  sky:            { tint: 0xb0e0e6, glow: 0xb0e0e6, label: 'Sky' },
  'sacred-green': { tint: 0x88c8a0, glow: 0x88c8a0, label: 'Sacred Green' },
  violet:         { tint: 0xc890e0, glow: 0xc890e0, label: 'Violet' },
  moonlight:      { tint: 0xfff0c0, glow: 0xfff0c0, label: 'Moonlight' },
  coral:          { tint: 0xff9a8b, glow: 0xff9a8b, label: 'Coral' },
  indigo:         { tint: 0x6ba3d6, glow: 0x6ba3d6, label: 'Indigo' },
};

/** Size scale factor used in 3D scene */
export const SIZE_SCALE: Record<LanternSize, number> = {
  small: 0.65,
  medium: 1.0,
  large: 1.5,
  massive: 2.2,
};

/** Zone order on the street, with normalized start position (0-1) */
export const ZONES: { name: Zone; start: number }[] = [
  { name: 'Fort',          start: 0      },
  { name: 'Pettah',        start: 0.125  },
  { name: 'Kollupitiya',   start: 0.25   },
  { name: 'Bambalapitiya', start: 0.375  },
  { name: 'Wellawatte',    start: 0.50   },
  { name: 'Dehiwala',      start: 0.625  },
  { name: 'Galle Face',    start: 0.75   },
  { name: 'Marine Drive',  start: 0.875  },
];

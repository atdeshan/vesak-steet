import type { Lantern, LanternSize, LanternColor, Zone } from './types';

/**
 * 100 lanterns dataset.
 *
 * This file currently contains PLACEHOLDER data — the client fills this in
 * with real lantern names, stories, and video filenames.
 *
 * To replace: edit each entry below, and drop the matching video file
 * into public/lanterns/ (e.g. video: '001.mp4' → public/lanterns/001.mp4).
 *
 * See LANTERN_DATA_GUIDE.md in the project root for the schema explanation.
 */

const LANTERN_COUNT = 100;

const COLORS: LanternColor[] = [
  'saffron', 'gold', 'vermillion', 'crimson', 'sky',
  'sacred-green', 'violet', 'moonlight', 'coral', 'indigo',
];

// Distribute sizes for visual variety — bias toward medium/large,
// fewer small and massive (massive are the "wow" moments). 20-entry
// cycle gives roughly 30/30/20/20 medium/large/small/massive across 100.
const SIZES: LanternSize[] = [
  'medium', 'large', 'small', 'massive', 'medium',
  'large', 'small', 'medium', 'massive', 'large',
  'medium', 'small', 'large', 'medium', 'massive',
  'small', 'large', 'medium', 'large', 'massive',
];

// Zones in order along the walker's path. The order is also reflected
// in the ZONES export from ./types for the in-walk zone label.
function getZone(idx: number, total: number): Zone {
  const frac = idx / total;
  if (frac < 0.125) return 'Fort';
  if (frac < 0.25)  return 'Pettah';
  if (frac < 0.375) return 'Kollupitiya';
  if (frac < 0.50)  return 'Bambalapitiya';
  if (frac < 0.625) return 'Wellawatte';
  if (frac < 0.75)  return 'Dehiwala';
  if (frac < 0.875) return 'Galle Face';
  return 'Marine Drive';
}

const PLACEHOLDER_STORIES = [
  'A motorized rotating lantern, hand-painted across illuminated panels depicting scenes from the life of the Buddha.',
  'A community-built rotating lantern, lit from within with hundreds of bulbs. Built by neighbourhood volunteers over six weeks.',
  'A spinning Vesak lantern, panels depicting scenes from Buddhist Jataka tradition. A returning annual centrepiece.',
  'A large rotating display lantern, the centrepiece of this stretch of road. Designed by a local artisan collective.',
  'A craftsman-built rotating lantern, decades of skill in every panel. The same family has built one here for three generations.',
  'A modern Vesak lantern combining traditional craft with LED illumination. Designed by university students.',
  'A sponsored lantern from a local temple, depicting the Wheel of Dhamma turning across rotating panels.',
];

const PLACEHOLDER_NAMES = [
  'Pradeepa', 'Mangala', 'Karuna', 'Maitri', 'Saddha',
  'Bodhi', 'Vesak', 'Pandol', 'Nirvana', 'Dhamma',
];

export const LANTERNS: Lantern[] = Array.from({ length: LANTERN_COUNT }, (_, i) => {
  const id = String(i + 1).padStart(3, '0');
  const name = `${PLACEHOLDER_NAMES[i % PLACEHOLDER_NAMES.length]} ${i + 1}`;
  const color = COLORS[i % COLORS.length];
  const size = SIZES[i % SIZES.length];
  const zone = getZone(i, LANTERN_COUNT);
  const story = PLACEHOLDER_STORIES[i % PLACEHOLDER_STORIES.length];

  return {
    id,
    name,
    name_si: `[Sinhala ${i + 1}]`, // Client fills in
    name_ta: `[Tamil ${i + 1}]`,   // Client fills in
    location: `${zone}`,
    zone,
    size,
    color,
    story_en: story,
    story_si: `[Sinhala story ${i + 1}]`, // Client fills in
    story_ta: `[Tamil story ${i + 1}]`,   // Client fills in
    video: `${id}.mp4`, // Expected file path: public/lanterns/001.mp4
    year: 2026,
  };
});

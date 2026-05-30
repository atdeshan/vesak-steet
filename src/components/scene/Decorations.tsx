'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useQualitySettings } from '@/lib/quality';
import {
  getBuddhistFlagBanner,
  getBuntingPennantTexture,
  getCombankVerticalBanner,
} from '@/lib/textures';

/* ─── Layout ──────────────────────────────────────────────────────────── */

const VERT_POLE_HEIGHT = 5;
const VERT_POLE_RADIUS = 0.15;
const VERT_POLE_X = 7;       // pole anchored right at the road edge (curb line)
const VERT_ARM_LENGTH = 1.5; // short inward arm so the banner hangs just over the road
const BANNER_WIDTH = 1.2;
const BANNER_HEIGHT = 2.2;

type VerticalKind = 'combank' | 'buddhist';

// Each location gets a TRIO of flags in this order, centered on the location's z.
const FLAG_PATTERN: VerticalKind[] = ['buddhist', 'combank', 'buddhist'];
const FLAG_GROUP_SPACING_Z = 2.8; // gap between adjacent flags within a trio

// Z values are pre-nudged to keep clearance from the nearest same-side
// lantern (lanterns are 4.798 units apart and alternate sides, so same-side
// spacing is ~9.6 units). Each entry below produces 3 flags via FLAG_PATTERN,
// clustered around its z with FLAG_GROUP_SPACING_Z apart.
const FLAG_GROUP_LOCATIONS: { z: number; side: -1 | 1 }[] = [
  { z:  -22, side:  1 },
  { z:  -65, side: -1 },
  { z: -117, side:  1 },
  { z: -160, side: -1 },
  { z: -204, side:  1 },
  { z: -247, side: -1 },
  { z: -300, side:  1 },
  { z: -343, side: -1 },
  { z: -386, side:  1 },
  { z: -439, side: -1 },
  { z: -482, side:  1 },
];

// Flattened per-flag list — every renderer below iterates this. Three flags
// per location, centered on each location's z (offset = (i - 1) * spacing).
const VERTICAL_BANNERS: { z: number; side: -1 | 1; kind: VerticalKind }[] =
  FLAG_GROUP_LOCATIONS.flatMap((loc) =>
    FLAG_PATTERN.map((kind, i) => ({
      z: loc.z + (i - (FLAG_PATTERN.length - 1) / 2) * FLAG_GROUP_SPACING_Z,
      side: loc.side,
      kind,
    })),
  );

// Bunting Z values pre-nudged to fall mid-gap between adjacent lanterns
// (lanterns are 4.798 units apart; these sit ~2.4 units from either neighbour
// so the bunting + its anchor poles aren't crammed beside a lantern body).
const BUNTINGS: { z: number }[] = [
  { z: -119.95 }, // between lantern 22 (-117.56) and 23 (-122.34)
  { z: -259.10 }, // between lantern 51 (-256.70) and 52 (-261.50)
  { z: -398.18 }, // between lantern 80 (-395.78) and 81 (-400.58)
];

/** Exported so Scene.tsx can nudge any lantern that would otherwise sit right
 *  next to a bunting anchor pole — bunting poles at x=±8.5 are close enough
 *  to the lantern x positions that z-clearance matters for visual cleanness. */
export const BUNTING_POLE_ZS: number[] = BUNTINGS.map((b) => b.z);

const BUNTING_POLE_HEIGHT = 8.5; // bunting attaches at y=8, fitting just above
const BUNTING_POLE_X = 8.5;       // just outside the pennant span of x ±8

// PLACEHOLDER COLORS — exact Commercial Bank brand blues to be confirmed
// once the official brand kit lands.
const BUNTING_COLORS: number[] = [
  0x0055a5, // CB blue
  0xffffff, // white
  0x003d7a, // darker brand blue
  0xe8f0fa, // soft pale blue (almost white)
];

/* ─── Flat banner ─────────────────────────────────────────────────────── */

// Client agreed to keep banners flat (no wave / swing).
function FlatBanner({
  position,
  size,
  texture,
}: {
  position: [number, number, number];
  size: [number, number];
  texture: THREE.Texture;
}) {
  return (
    <mesh position={position} raycast={() => null}>
      <planeGeometry args={[size[0], size[1]]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function verticalTexture(kind: VerticalKind): THREE.Texture {
  switch (kind) {
    case 'combank':  return getCombankVerticalBanner();
    case 'buddhist': return getBuddhistFlagBanner();
  }
}

/* ─── Vertical banners ────────────────────────────────────────────────── */

function VerticalPoles() {
  return (
    <Instances limit={VERTICAL_BANNERS.length} raycast={() => null}>
      <cylinderGeometry args={[VERT_POLE_RADIUS, VERT_POLE_RADIUS, VERT_POLE_HEIGHT, 8]} />
      <meshBasicMaterial color={0x4a3010} />
      {VERTICAL_BANNERS.map((b, i) => (
        <Instance
          key={i}
          position={[b.side * VERT_POLE_X, VERT_POLE_HEIGHT / 2, b.z]}
        />
      ))}
    </Instances>
  );
}

function VerticalArms() {
  return (
    <Instances limit={VERTICAL_BANNERS.length} raycast={() => null}>
      <boxGeometry args={[VERT_ARM_LENGTH, 0.08, 0.08]} />
      <meshBasicMaterial color={0x4a3010} />
      {VERTICAL_BANNERS.map((b, i) => (
        <Instance
          key={i}
          position={[
            b.side * (VERT_POLE_X - VERT_ARM_LENGTH / 2),
            VERT_POLE_HEIGHT - 0.2,
            b.z,
          ]}
        />
      ))}
    </Instances>
  );
}

function VerticalBanners() {
  return (
    <>
      {VERTICAL_BANNERS.map((b, i) => {
        const armEndX = b.side * (VERT_POLE_X - VERT_ARM_LENGTH);
        const bannerCenterY = VERT_POLE_HEIGHT - 0.3 - BANNER_HEIGHT / 2;
        return (
          <FlatBanner
            key={i}
            position={[armEndX, bannerCenterY, b.z]}
            size={[BANNER_WIDTH, BANNER_HEIGHT]}
            texture={verticalTexture(b.kind)}
          />
        );
      })}
    </>
  );
}

/* ─── Bunting ─────────────────────────────────────────────────────────── */

function Bunting({ z }: { z: number }) {
  const COUNT = 30;
  const positions = useMemo<[number, number, number][]>(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const t = i / (COUNT - 1);
      const x = -8 + t * 16;
      // Catenary-ish sag — droops most in the middle, anchors at the ends.
      const sag = Math.sin(t * Math.PI) * 0.7;
      return [x, 8 - sag, z];
    });
  }, [z]);

  return (
    <Instances limit={COUNT} raycast={() => null}>
      <planeGeometry args={[0.4, 0.6]} />
      <meshBasicMaterial
        map={getBuntingPennantTexture()}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
        alphaTest={0.05}
      />
      {positions.map((p, i) => (
        <Instance key={i} position={p} color={BUNTING_COLORS[i % BUNTING_COLORS.length]} />
      ))}
    </Instances>
  );
}

function Buntings() {
  return (
    <>
      {BUNTINGS.map((b, i) => (
        <Bunting key={i} z={b.z} />
      ))}
    </>
  );
}

function BuntingPoles() {
  // Two poles per bunting string — one at each end so the rope reads as anchored.
  const positions = useMemo<[number, number, number][]>(
    () =>
      BUNTINGS.flatMap((b) => [
        [-BUNTING_POLE_X, BUNTING_POLE_HEIGHT / 2, b.z],
        [ BUNTING_POLE_X, BUNTING_POLE_HEIGHT / 2, b.z],
      ]),
    [],
  );

  return (
    <Instances limit={positions.length} raycast={() => null}>
      <cylinderGeometry args={[0.12, 0.15, BUNTING_POLE_HEIGHT, 8]} />
      <meshBasicMaterial color={0x4a3010} />
      {positions.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────── */

export function Decorations() {
  const settings = useQualitySettings();
  const rootRef = useRef<THREE.Group>(null);

  // Disable per-mesh frustum culling on every Mesh/Sprite under the
  // decorations root. The renderer skips a few thousand cull checks per
  // camera move; the meshes that result are cheap to draw anyway.
  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.Sprite).isSprite) {
        obj.frustumCulled = false;
      }
    });
  });

  if (!settings.showDecorations) return null;

  return (
    <group ref={rootRef}>
      <VerticalPoles />
      <VerticalArms />
      <VerticalBanners />
      <BuntingPoles />
      <Buntings />
    </group>
  );
}

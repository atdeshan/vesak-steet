'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

// Z values are pre-nudged to keep at least 4 units of clearance from the
// nearest same-side lantern (lanterns are 4.798 units apart and alternate
// sides, so same-side spacing is ~9.6 units).
const VERTICAL_BANNERS: { z: number; side: -1 | 1; kind: VerticalKind }[] = [
  { z:  -22, side:  1, kind: 'buddhist' },
  { z:  -65, side: -1, kind: 'buddhist' },
  { z: -117, side:  1, kind: 'combank'  },
  { z: -160, side: -1, kind: 'buddhist' },
  { z: -204, side:  1, kind: 'buddhist' },
  { z: -247, side: -1, kind: 'combank'  },
  { z: -300, side:  1, kind: 'buddhist' },
  { z: -343, side: -1, kind: 'buddhist' },
  { z: -386, side:  1, kind: 'combank'  },
  { z: -439, side: -1, kind: 'buddhist' },
  { z: -482, side:  1, kind: 'buddhist' },
];

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

/* ─── Wave shader ─────────────────────────────────────────────────────── */

const WAVE_VERTEX = /* glsl */`
  uniform float uTime;
  uniform float uAmplitude;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // uv.y = 1.0 at top (anchored), 0.0 at bottom (free)
    float anchor = uv.y;
    float wave = sin(pos.y * 0.5 + uTime * 1.5 + pos.x * 0.3) * uAmplitude * (1.0 - anchor);
    pos.z += wave;
    pos.x += wave * 0.3;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const WAVE_FRAGMENT = /* glsl */`
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uMap, vUv);
  }
`;

function WaveBanner({
  position,
  size,
  texture,
  amplitude,
}: {
  position: [number, number, number];
  size: [number, number];
  texture: THREE.Texture;
  amplitude: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMap: { value: texture },
      uAmplitude: { value: amplitude },
    }),
    [texture, amplitude],
  );

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh position={position} raycast={() => null}>
      <planeGeometry args={[size[0], size[1], 8, 16]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={WAVE_VERTEX}
        fragmentShader={WAVE_FRAGMENT}
        side={THREE.DoubleSide}
      />
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
          <WaveBanner
            key={i}
            position={[armEndX, bannerCenterY, b.z]}
            size={[BANNER_WIDTH, BANNER_HEIGHT]}
            texture={verticalTexture(b.kind)}
            amplitude={0.06}
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

'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STREET_LENGTH } from '@/lib/store';
import { useQualitySettings } from '@/lib/quality';
import { getFairyLightBulbTexture } from '@/lib/textures';

const STRING_HEIGHT = 16;
const DROOP = 0.3;
// lightsPerString is now driven by quality settings — see settings.lightsPerString.
const Y_JITTER = 0.3; // ±0.15 per bulb — organic irregularity

// Warm festival colors — gold, warm white, soft red, soft green, amber
const COLORS: [number, number, number][] = [
  [1.0, 0.85, 0.4 ], // warm gold
  [1.0, 0.95, 0.75], // warm white
  [1.0, 0.5 , 0.35], // soft red
  [0.6, 1.0 , 0.55], // soft green
  [1.0, 0.7 , 0.3 ], // amber
];

const VERTEX_SHADER = /* glsl */`
  attribute float size;
  attribute float seed;
  attribute float brightnessBase;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vBrightness;
  uniform float uTime;
  uniform float uTwinkle;
  uniform float uPixelRatio;
  void main() {
    vColor = color;
    // Each bulb's twinkle phase is offset by its seed — no synchronized pulses.
    float twinkleFactor = 0.7 + 0.3 * sin(uTime * 1.5 + seed);
    // brightnessBase varies 0.5–1.0 so some bulbs are dimmer than others.
    vBrightness = mix(1.0, twinkleFactor, uTwinkle) * brightnessBase;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * 240.0 * uPixelRatio / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */`
  varying vec3 vColor;
  varying float vBrightness;
  uniform sampler2D uMap;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    // 1.2× boost compensates for the bulb-shape texture being slightly less
    // bright than the pure-glow sprite it replaced.
    gl_FragColor = vec4(vColor * vBrightness * 1.2, tex.a);
  }
`;

/**
 * Overhead LED light strings — a single THREE.Points buffer for all bulbs.
 * Wires (longitudinal + crisscross) are not rendered; bulbs alone read as
 * strung lights against the night sky. Twinkle runs in the vertex shader.
 */
export function StreetLights() {
  const settings = useQualitySettings();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const stringCount = settings.streetLightStrings;
  const lightsPerString = settings.lightsPerString;
  const twinkleOn = settings.streetLightTwinkle;

  // Longitudinal strings only — each runs the full street length, evenly
  // spread across the road width. Both endpoints sit at STRING_HEIGHT so no
  // string ever angles down toward the lanterns or ground.
  const stringLayouts = useMemo(() => {
    const layouts: { start: [number, number, number]; end: [number, number, number] }[] = [];
    for (let i = 0; i < stringCount; i++) {
      const t = stringCount === 1 ? 0.5 : i / (stringCount - 1);
      const xOffset = (t - 0.5) * 24; // x = -12 .. +12 — spans the lantern zone
      layouts.push({
        start: [xOffset, STRING_HEIGHT, -5],
        end:   [xOffset, STRING_HEIGHT, -STREET_LENGTH + 5],
      });
    }
    return layouts;
  }, [stringCount]);

  // Combine all strings into a single set of buffers (one draw call).
  const buffers = useMemo(() => {
    const total = stringLayouts.length * lightsPerString;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const seeds = new Float32Array(total);
    const brightnesses = new Float32Array(total);

    // Hard floor — no bulb is ever allowed below this y, regardless of jitter
    // or math edge cases. Keeps the canopy unambiguously above the lanterns.
    const yFloor = STRING_HEIGHT - DROOP;

    let idx = 0;
    stringLayouts.forEach((s, si) => {
      for (let i = 0; i < lightsPerString; i++) {
        const t = i / (lightsPerString - 1);
        const x = s.start[0] + (s.end[0] - s.start[0]) * t;
        const z = s.start[2] + (s.end[2] - s.start[2]) * t;
        // Catenary droop — same endpoint heights, gentle sag in the middle.
        const droop = -DROOP * 4 * t * (1 - t);
        const yJitter = (Math.random() - 0.5) * Y_JITTER;
        const yRaw = s.start[1] + droop + yJitter;
        const y = Math.max(yRaw, yFloor);

        positions[idx * 3    ] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        const c = COLORS[(si + i) % COLORS.length];
        colors[idx * 3    ] = c[0];
        colors[idx * 3 + 1] = c[1];
        colors[idx * 3 + 2] = c[2];

        sizes[idx] = 0.5 + Math.random() * 0.6;       // 0.5–1.1, wider variation
        seeds[idx] = Math.random() * 100;
        brightnesses[idx] = 0.5 + Math.random() * 0.5; // 0.5–1.0 per-bulb baseline
        idx++;
      }
    });

    return { positions, colors, sizes, seeds, brightnesses, total };
  }, [stringLayouts, lightsPerString]);

  // Wire geometry — grid mesh canopy:
  //   • Longitudinal: each consecutive bulb pair within a string.
  //   • Horizontal:   each bulb index connected across adjacent strings,
  //                   so the canopy reads as a wired mesh rather than
  //                   parallel isolated strings.
  // Both pass directions are concatenated into a single BufferGeometry → one
  // draw call covers every wire in the scene.
  const wireGeometry = useMemo(() => {
    const positions = buffers.positions;
    const S = stringLayouts.length;

    const longSegments = S * (lightsPerString - 1);
    const crossSegments = (S - 1) * lightsPerString;
    const totalSegments = longSegments + crossSegments;

    const wirePositions = new Float32Array(totalSegments * 6);
    let segIdx = 0;

    const writeSegment = (a: number, b: number) => {
      wirePositions[segIdx * 6 + 0] = positions[a * 3 + 0];
      wirePositions[segIdx * 6 + 1] = positions[a * 3 + 1];
      wirePositions[segIdx * 6 + 2] = positions[a * 3 + 2];
      wirePositions[segIdx * 6 + 3] = positions[b * 3 + 0];
      wirePositions[segIdx * 6 + 4] = positions[b * 3 + 1];
      wirePositions[segIdx * 6 + 5] = positions[b * 3 + 2];
      segIdx++;
    };

    // Longitudinal — along each string
    for (let s = 0; s < S; s++) {
      const base = s * lightsPerString;
      for (let i = 0; i < lightsPerString - 1; i++) {
        writeSegment(base + i, base + i + 1);
      }
    }

    // Horizontal — connect corresponding bulbs across adjacent strings
    for (let i = 0; i < lightsPerString; i++) {
      for (let s = 0; s < S - 1; s++) {
        writeSegment(s * lightsPerString + i, (s + 1) * lightsPerString + i);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(wirePositions, 3));
    return geo;
  }, [stringLayouts, buffers, lightsPerString]);

  // Stable uniforms reference so the material doesn't rebuild every frame.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTwinkle: { value: twinkleOn ? 1.0 : 0.0 },
      uPixelRatio: { value: dpr },
      uMap: { value: getFairyLightBulbTexture() },
    }),
    // Recreate only when twinkle flips or dpr changes (rare).
    [twinkleOn, dpr],
  );

  useFrame((state) => {
    if (!twinkleOn) return;
    const mat = materialRef.current;
    if (mat) mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (!settings.showStreetLights) return null;

  return (
    <>
      {/* Wires — dark warm-brown line segments connecting consecutive bulbs */}
      <lineSegments geometry={wireGeometry} raycast={() => null}>
        <lineBasicMaterial
          color={0x1a1208}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </lineSegments>

      {/* Bulbs — single Points buffer, bulb-shape sprite + twinkle in shader */}
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position"        args={[buffers.positions,    3]} />
          <bufferAttribute attach="attributes-color"           args={[buffers.colors,       3]} />
          <bufferAttribute attach="attributes-size"            args={[buffers.sizes,        1]} />
          <bufferAttribute attach="attributes-seed"            args={[buffers.seeds,        1]} />
          <bufferAttribute attach="attributes-brightnessBase"  args={[buffers.brightnesses, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

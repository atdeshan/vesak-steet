'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { STREET_LENGTH } from '@/lib/store';
import { useQualitySettings } from '@/lib/quality';
import { getRoadDarknessGradient, getRoadTexture } from '@/lib/textures';
import { Moon } from './Moon';

/**
 * Static environment: road, edges, starfield.
 * No buildings (per client preference).
 */
export function Environment() {
  const settings = useQualitySettings();
  const nearStarCount = settings.starCount;
  const farStarCount = Math.floor(settings.starCount * 0.53);

  const stars = useMemo(() => {
    const positions = new Float32Array(nearStarCount * 3);
    for (let i = 0; i < nearStarCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 250;
      positions[i * 3 + 1] = 8 + Math.random() * 70;
      positions[i * 3 + 2] = -Math.random() * (STREET_LENGTH * 1.2) + 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [nearStarCount]);

  const farStars = useMemo(() => {
    const positions = new Float32Array(farStarCount * 3);
    for (let i = 0; i < farStarCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 350;
      positions[i * 3 + 1] = 10 + Math.random() * 80;
      positions[i * 3 + 2] = -Math.random() * (STREET_LENGTH * 1.6) - 50;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [farStarCount]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.65} color={0x281c20} />

      {/* Fog */}
      <fogExp2 attach="fog" args={[0x141d3a, 0.008]} />

      {/* Hero moon at end of street */}
      <Moon />

      {/* Road — raised slightly so it sits on top of the sidewalk plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -STREET_LENGTH / 2]}>
        <planeGeometry args={[14, STREET_LENGTH]} />
        <meshBasicMaterial map={getRoadTexture()} color={0xffffff} toneMapped={false} />
      </mesh>

      {/* Road darkness gradient — fades road to black at distance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -STREET_LENGTH / 2]}>
        <planeGeometry args={[14, STREET_LENGTH]} />
        <meshBasicMaterial
          map={getRoadDarknessGradient()}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Sidewalk zones — where the lanterns sit. Slightly darker than road. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -STREET_LENGTH / 2]}>
        <planeGeometry args={[34, STREET_LENGTH]} />
        <meshBasicMaterial color={0x0d0610} />
      </mesh>

      {/* Far ground — extends out to the fog horizon so darkness doesn't drop
          off sharply at the road edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, -STREET_LENGTH / 2]}>
        <planeGeometry args={[200, STREET_LENGTH + 100]} />
        <meshBasicMaterial color={0x07050a} />
      </mesh>

      {/* Road edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7, 0.02, -STREET_LENGTH / 2]}>
        <planeGeometry args={[0.08, STREET_LENGTH]} />
        <meshBasicMaterial color={0xf5d28a} transparent opacity={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.02, -STREET_LENGTH / 2]}>
        <planeGeometry args={[0.08, STREET_LENGTH]} />
        <meshBasicMaterial color={0xf5d28a} transparent opacity={0.12} />
      </mesh>

      {/* Stars */}
      <points geometry={stars}>
        <pointsMaterial color={0xf5d28a} size={0.14} transparent opacity={0.55} />
      </points>
      <points geometry={farStars}>
        <pointsMaterial color={0x9aa5d6} size={0.08} transparent opacity={0.4} />
      </points>
    </>
  );
}

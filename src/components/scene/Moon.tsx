'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getGlowTexture, getSoftGlowTexture, getMoonTexture } from '@/lib/textures';

/**
 * Vesak harvest moon — deep amber/orange, follows the camera so it stays at
 * a fixed direction in the sky. The amber colour lives in getMoonTexture()
 * itself; the body's tint is pure white so nothing shifts the surface hue.
 *
 * Layer order (bottom → top):
 *   1) wide sky aura  — warm amber bleed into the upper sky
 *   2) medium aura    — closer warm halo
 *   3) close rim halo — tight bright ring at the moon's edge
 *   4) moon body      — amber sphere with the textured surface
 *   5) haze veil      — soft warm wash in front of the body to soften its edges
 */
export function Moon() {
  const groupRef = useRef<THREE.Group>(null);
  const MOON_OFFSET = { x: 0, y: 28, z: -110 };

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.position.set(
      camera.position.x + MOON_OFFSET.x,
      camera.position.y + MOON_OFFSET.y,
      camera.position.z + MOON_OFFSET.z,
    );
  });

  return (
    <group ref={groupRef}>
      {/* 1) Wide soft sky aura — subtle amber bleed */}
      <sprite scale={[200, 200, 1]} renderOrder={0}>
        <spriteMaterial
          map={getSoftGlowTexture()}
          color={0xd87830}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* 2) Medium warm aura */}
      <sprite scale={[60, 60, 1]} renderOrder={1}>
        <spriteMaterial
          map={getSoftGlowTexture()}
          color={0xe89545}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* 3) Close rim halo */}
      <sprite scale={[24, 24, 1]} renderOrder={2}>
        <spriteMaterial
          map={getGlowTexture()}
          color={0xf0a050}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* 4) Moon body — amber surface, white tint so the texture passes through */}
      <mesh renderOrder={3}>
        <sphereGeometry args={[9, 64, 64]} />
        <meshBasicMaterial
          map={getMoonTexture()}
          color={0xffffff}
          toneMapped={false}
        />
      </mesh>

      {/* 5) Atmospheric haze veil — softens the moon's surface, hints at thin clouds */}
      <sprite scale={[20, 20, 1]} renderOrder={4}>
        <spriteMaterial
          map={getSoftGlowTexture()}
          color={0xd87830}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMoonTexture } from '@/lib/textures';

/**
 * Vesak harvest moon — deep amber/orange, follows the camera so it stays at
 * a fixed direction in the sky. The amber colour lives in getMoonTexture()
 * itself; the body's tint is pure white so nothing shifts the surface hue.
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
      <mesh>
        <sphereGeometry args={[9, 64, 64]} />
        <meshBasicMaterial
          map={getMoonTexture()}
          color={0xffffff}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

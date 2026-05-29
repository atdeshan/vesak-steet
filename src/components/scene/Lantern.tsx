'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { Lantern as LanternData, COLOR_PALETTE, SIZE_SCALE } from '@/data/types';
import {
  getGlowTexture,
  makePanelTexture,
  makeVideoTexture,
} from '@/lib/textures';
import { useQualitySettings } from '@/lib/quality';

type DetailTier = 'near' | 'mid' | 'far';

interface LanternProps {
  data: LanternData;
  index: number;
  position: [number, number, number];
  side: -1 | 1;
  focused: boolean;
  onSelect: (idx: number) => void;
}

/**
 * A single 3-tier rotating Vesak lantern with distance-based LOD.
 *
 * Tiers:
 *   near — full detail (tassels, seam posts, base bulbs, full roof)
 *   mid  — body + rims + roof + plinth, glow halos; no tassels/seams/bulbs
 *   far  — body + bottom cap + halos + inner light only (silhouette)
 *
 * Repeated small parts (seam posts, tassel strings, tassel beads, base bulbs)
 * are rendered via InstancedMesh so each near lantern collapses ~90 draw calls
 * into a handful.
 */
export function Lantern({ data, index, position, side, focused, onSelect }: LanternProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spinnerRef = useRef<THREE.Group>(null);
  const haloInnerRef = useRef<THREE.Sprite>(null);
  const haloOuterRef = useRef<THREE.Sprite>(null);
  const coreRef = useRef<THREE.Sprite>(null);

  const settings = useQualitySettings();
  const FACETS = settings.lanternFacets;

  // TEMPORARY DIAGNOSTIC — counts Lantern re-renders. Remove after perf check.
  const lanternRenderCount = useRef(0);
  lanternRenderCount.current++;
  if (lanternRenderCount.current > 5 && index === 0) {
    // eslint-disable-next-line no-console
    console.log(`[Lantern 0] render #${lanternRenderCount.current}`);
  }

  const scale = SIZE_SCALE[data.size];
  const { tint, glow } = COLOR_PALETTE[data.color];
  const glowTexture = useMemo(() => getGlowTexture(), []);

  const heightVariation = 0.85 + ((index * 0.13) % 0.4);
  const mainHeight = 4.5 * scale * heightVariation;
  const mainRadius = 1.3 * scale;

  const spinSpeed = useMemo(() => {
    const base =
      data.size === 'massive' ? 0.003 :
      data.size === 'large'   ? 0.005 :
      data.size === 'medium'  ? 0.007 : 0.010;
    return index % 2 === 1 ? -base : base;
  }, [data.size, index]);

  const [panelTexture, setPanelTexture] = useState<THREE.Texture>(() => makePanelTexture(index));
  const [videoActive, setVideoActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoActive) return;

    let cancelled = false;
    const { texture, video } = makeVideoTexture(`/lanterns/${data.video}`);
    videoRef.current = video;

    const onCanPlay = () => {
      if (cancelled) return;
      setPanelTexture(texture);
      void video.play().catch(() => {
        // Autoplay blocked — will retry on the next user gesture
      });
    };
    const onError = () => {};

    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('error', onError, { once: true });

    return () => {
      cancelled = true;
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.pause();
      video.src = '';
    };
  }, [videoActive, data.video]);

  const tiers = useMemo(() => {
    const tierCount = 3;
    const tierGap = 0.05 * scale;
    const tierHeight = (mainHeight - tierGap * (tierCount - 1)) / tierCount;
    return Array.from({ length: tierCount }, (_, t) => ({
      radius: mainRadius * (1 - t * 0.04),
      height: tierHeight,
      y: -mainHeight / 2 + tierHeight / 2 + t * (tierHeight + tierGap),
      gapY: -mainHeight / 2 + (t + 1) * tierHeight + t * tierGap + tierGap / 2,
      showGap: t < tierCount - 1,
      tierGap,
    }));
  }, [mainHeight, mainRadius, scale]);

  const tierHeight = tiers[0].height;

  const bulbs = useMemo(() => {
    const count =
      data.size === 'massive' ? 16 :
      data.size === 'large'   ? 12 :
      data.size === 'medium'  ? 10 : 8;
    return Array.from({ length: count }, (_, b) => {
      const a = (b / count) * Math.PI * 2;
      return {
        x: Math.cos(a) * mainRadius * 1.4,
        z: Math.sin(a) * mainRadius * 1.4,
        color: b % 2 === 0 ? 0xffa244 : 0xf5d28a,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [data.size, mainRadius]);

  // Pre-compute seam-post world positions (3 tiers × FACETS facets).
  const seamPositions = useMemo<[number, number, number][]>(
    () =>
      tiers.flatMap((t) =>
        Array.from({ length: FACETS }, (_, f) => {
          const a = (f / FACETS) * Math.PI * 2;
          return [Math.cos(a) * t.radius, t.y, Math.sin(a) * t.radius] as [number, number, number];
        }),
      ),
    [tiers, FACETS],
  );

  // Pre-compute tassel string positions + lengths, plus bead positions for every 3rd.
  const tassels = useMemo(() => {
    const count = settings.tasselCount;
    if (count === 0) return { strings: [] as { pos: [number, number, number]; len: number }[], beads: [] as [number, number, number][] };
    const tasselY = -mainHeight / 2;
    const tasselRadius = mainRadius * 1.05;
    const strings: { pos: [number, number, number]; len: number }[] = [];
    const beads: [number, number, number][] = [];
    for (let s = 0; s < count; s++) {
      const angle = (s / count) * Math.PI * 2;
      const x = Math.cos(angle) * tasselRadius;
      const z = Math.sin(angle) * tasselRadius;
      // Cap length so the bead tip stays above the ground for any lantern size.
      // Spinner sits at world y = mainHeight/2 + 0.63, tassel top at world y = 0.63.
      // length must be < 0.55 to keep the bead tip above y = 0.08.
      const length = Math.min(0.55, mainHeight * 0.16) + Math.sin(s * 0.7) * 0.03;
      strings.push({ pos: [x, tasselY - length / 2, z], len: length });
      if (s % 3 === 0) beads.push([x, tasselY - length, z]);
    }
    return { strings, beads };
  }, [mainHeight, mainRadius, settings.tasselCount]);

  // Initial detail tier picked synchronously from the current camera position
  // so the first paint already has the correct LOD (no popping at mount).
  const camera = useThree((s) => s.camera);
  const initialTier = useMemo<DetailTier>(() => {
    const dx = camera.position.x - position[0];
    const dz = camera.position.z - position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < settings.lodNearDistance) return 'near';
    if (dist < settings.lodMidDistance) return 'mid';
    return 'far';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [tier, setTier] = useState<DetailTier>(initialTier);
  const tierRef = useRef<DetailTier>(initialTier);
  const frameCounterRef = useRef(0);

  useFrame((state) => {
    // Spinner rotation runs every frame.
    if (spinnerRef.current) {
      spinnerRef.current.rotation.y += spinSpeed;
    }
    const t = state.clock.elapsedTime;
    if (haloInnerRef.current) {
      const baseOp = focused ? 0.55 : 0.165;
      haloInnerRef.current.material.opacity = baseOp * (0.85 + Math.sin(t * 2 + index) * 0.15);
    }
    if (haloOuterRef.current) {
      const baseOp = focused ? 0.25 : 0.075;
      haloOuterRef.current.material.opacity = baseOp * (0.8 + Math.sin(t * 1.5 + index) * 0.2);
    }
    if (coreRef.current) {
      coreRef.current.material.opacity = focused ? 0.9 : 0.4;
    }

    // LOD distance check is throttled — every 30th frame (~2× per second at
    // 60fps), staggered per lantern by index so we never check all 100 in the
    // same frame. The video-load decision rides on this same gate.
    frameCounterRef.current++;
    if ((frameCounterRef.current + index) % 30 !== 0) return;
    const dx = state.camera.position.x - position[0];
    const dz = state.camera.position.z - position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const next: DetailTier =
      dist < settings.lodNearDistance ? 'near' :
      dist < settings.lodMidDistance ? 'mid' : 'far';
    if (next !== tierRef.current) {
      tierRef.current = next;
      setTier(next);
    }
    if (!settings.loadVideos) {
      if (videoActive) setVideoActive(false);
    } else {
      const shouldLoad = dist < settings.videoLoadDistance;
      if (shouldLoad !== videoActive) setVideoActive(shouldLoad);
    }
  });

  // Re-disable per-mesh frustum culling whenever the LOD tier changes, since
  // a tier transition spawns/destroys child meshes (seam posts, tassels,
  // bulbs). Three.js would otherwise frustum-check each new mesh every camera
  // move — and with 100 lanterns × ~30 meshes that's 3000+ checks per frame.
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.Sprite).isSprite) {
        obj.frustumCulled = false;
      }
    });
  }, [tier]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(index);
  };

  // Plinth top sits at world y = 0.8 (cylinder centered at 0.4, height 0.8).
  // Lantern body bottom sits at y = 0.95 — a 0.15-unit air gap above the
  // plinth top, killing the z-fight at the body-plinth seam and letting the
  // body's bottom cap hide inside the plinth's silhouette.
  const spinnerY = mainHeight / 2 + 0.95;
  const showRimsAndTrim = tier !== 'far';
  const showNearDetail = tier === 'near';

  return (
    <group ref={groupRef} position={position} rotation={[0, -side * Math.PI / 8, 0]}>
      {/* Plinth — drop entirely at far tier (small, ground level) */}
      {showRimsAndTrim && (
        <>
          {/* Plinth — taller (h=0.8) with a tighter top (1.4·R) so the lantern
              body's bottom slots into it. Bottom flare unchanged. */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[mainRadius * 1.4, mainRadius * 1.7, 0.8, FACETS]} />
            <meshBasicMaterial color={0x1a0e08} />
          </mesh>
          {/* Plinth gold band — at the top edge, slightly outside the plinth's
              top radius (open-ended so the flat top face doesn't read as a disc). */}
          <mesh position={[0, 0.78, 0]}>
            <cylinderGeometry args={[mainRadius * 1.43, mainRadius * 1.43, 0.06, FACETS, 1, true]} />
            <meshBasicMaterial
              color={0xc89048}
              toneMapped={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        </>
      )}

      {/* Spinner (rotating part) */}
      <group ref={spinnerRef} position={[0, spinnerY, 0]}>
        {/* Inner light core — every tier, this is what makes the lantern glow */}
        <sprite scale={[mainRadius * 2.5, mainHeight * 0.9, 1]}>
          <spriteMaterial
            map={glowTexture}
            color={0xffeebb}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* Ornate stepped roof — near + mid only */}
        {showRimsAndTrim && (
          <>
            <mesh position={[0, mainHeight / 2 + mainHeight * 0.08, 0]}>
              <coneGeometry args={[mainRadius * 1.2, mainHeight * 0.16, FACETS]} />
              <meshBasicMaterial color={0x3a2410} toneMapped={false} />
            </mesh>
            <mesh position={[0, mainHeight / 2 + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[mainRadius * 1.205, 0.05 * scale, 6, FACETS]} />
              <meshBasicMaterial
                color={0xf5d28a}
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </mesh>
            <mesh position={[0, mainHeight / 2 + mainHeight * 0.18, 0]}>
              <coneGeometry args={[mainRadius * 0.7, mainHeight * 0.1, FACETS]} />
              <meshBasicMaterial color={0x4a2810} toneMapped={false} />
            </mesh>
            <mesh position={[0, mainHeight / 2 + mainHeight * 0.24, 0]}>
              <sphereGeometry args={[0.12 * scale, 12, 12]} />
              <meshBasicMaterial color={0xf5d28a} toneMapped={false} />
            </mesh>
            <mesh position={[0, mainHeight / 2 + mainHeight * 0.34, 0]}>
              <coneGeometry args={[0.06 * scale, mainHeight * 0.2, 8]} />
              <meshBasicMaterial color={0xf5d28a} toneMapped={false} />
            </mesh>
          </>
        )}

        {/* Tiers — body cylinders always show (the lantern silhouette) */}
        {tiers.map((t, ti) => (
          <group key={ti}>
            <mesh position={[0, t.y, 0]}>
              <cylinderGeometry
                args={[t.radius, t.radius * 1.01, t.height, FACETS, 1, true]}
              />
              <meshBasicMaterial
                map={panelTexture}
                color={tint}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>

            {/* Gold rim at top of every tier — near + mid */}
            {showRimsAndTrim && (
              <mesh
                position={[0, t.y + t.height / 2, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[t.radius * 1.005, 0.04 * scale, 6, FACETS]} />
                <meshBasicMaterial
                  color={0xf5d28a}
                  toneMapped={false}
                  polygonOffset
                  polygonOffsetFactor={-1}
                  polygonOffsetUnits={-1}
                />
              </mesh>
            )}

            {/* Divider band + decorative gold ring between tiers — near + mid */}
            {showRimsAndTrim && t.showGap && (
              <>
                <mesh position={[0, t.gapY, 0]}>
                  <cylinderGeometry
                    args={[t.radius * 1.07, t.radius * 1.07, t.tierGap * 1.5, FACETS]}
                  />
                  <meshBasicMaterial
                    color={0x2a1a08}
                    polygonOffset
                    polygonOffsetFactor={-1}
                    polygonOffsetUnits={-1}
                  />
                </mesh>
                {settings.showTierBands && (
                  <mesh
                    position={[0, t.gapY + t.tierGap * 0.75, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                  >
                    <torusGeometry args={[t.radius * 1.085, 0.025 * scale, 6, FACETS]} />
                    <meshBasicMaterial
                      color={0xf5d28a}
                      toneMapped={false}
                      polygonOffset
                      polygonOffsetFactor={-2}
                      polygonOffsetUnits={-2}
                    />
                  </mesh>
                )}
              </>
            )}
          </group>
        ))}

        {/* Bottom cap — kept at all tiers so the lantern has a defined base */}
        <mesh
          position={[0, -mainHeight / 2 - mainHeight * 0.04, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[mainRadius * 1.15, mainHeight * 0.08, FACETS]} />
          <meshBasicMaterial color={0x3a2410} toneMapped={false} />
        </mesh>

        {/* Seam posts — near only, instanced (1 draw call for all 24 posts) */}
        {showNearDetail && settings.showSeams && seamPositions.length > 0 && (
          <Instances key={`seams-${seamPositions.length}`} limit={seamPositions.length}>
            <boxGeometry args={[0.025 * scale, tierHeight * 0.95, 0.025 * scale]} />
            <meshBasicMaterial color={0x4a2810} toneMapped={false} />
            {seamPositions.map((pos, i) => (
              <Instance key={i} position={pos} />
            ))}
          </Instances>
        )}

        {/* Tassel strings — near only, instanced. Per-instance Y-scale carries
            the varying length. */}
        {showNearDetail && tassels.strings.length > 0 && (
          <Instances key={`tassels-${tassels.strings.length}`} limit={tassels.strings.length}>
            <boxGeometry args={[0.018 * scale, 1, 0.018 * scale]} />
            <meshBasicMaterial color={0xa06028} toneMapped={false} />
            {tassels.strings.map((s, i) => (
              <Instance key={i} position={s.pos} scale={[1, s.len, 1]} />
            ))}
          </Instances>
        )}

        {/* Tassel beads — near only, instanced */}
        {showNearDetail && tassels.beads.length > 0 && (
          <Instances key={`beads-${tassels.beads.length}`} limit={tassels.beads.length}>
            <sphereGeometry args={[0.04 * scale, 6, 6]} />
            <meshBasicMaterial color={0xffd86b} toneMapped={false} />
            {tassels.beads.map((pos, i) => (
              <Instance key={i} position={pos} />
            ))}
          </Instances>
        )}
      </group>

      {/* Glow halos — every tier (these are what make distant lanterns visible) */}
      <sprite ref={coreRef} position={[0, spinnerY, 0]} scale={[mainRadius * 2.0, mainRadius * 2.0, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={0xffeebb}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite ref={haloInnerRef} position={[0, spinnerY, 0]} scale={[mainRadius * 5, mainRadius * 5, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={glow}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite ref={haloOuterRef} position={[0, spinnerY, 0]} scale={[mainRadius * 11, mainRadius * 11, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={glow}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Click hitbox — invisible material, kept at all tiers */}
      <mesh
        position={[0, spinnerY, 0]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <cylinderGeometry args={[mainRadius * 1.3, mainRadius * 1.3, mainHeight + 1, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Ground glow pool — near + mid (small, ground level) */}
      {showRimsAndTrim && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[
            data.size === 'massive' ? 8 :
            data.size === 'large'   ? 6 :
            data.size === 'medium'  ? 4 : 2.5,
            32,
          ]} />
          <meshBasicMaterial
            map={glowTexture}
            color={glow}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Base ring bulbs — near only. Spheres are instanced (1 draw call);
          per-bulb sprite glows stay individual so each can pulse independently. */}
      {showNearDetail && bulbs.length > 0 && (
        <>
          <Instances key={`bulbs-${bulbs.length}`} position={[0, 0.85, 0]} limit={bulbs.length}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshBasicMaterial />
            {bulbs.map((b, i) => (
              <Instance key={i} position={[b.x, 0, b.z]} color={b.color} />
            ))}
          </Instances>
          {bulbs.map((b, i) => (
            <BulbGlow key={i} x={b.x} z={b.z} color={b.color} />
          ))}
        </>
      )}
    </group>
  );
}

function BulbGlow({ x, z, color }: { x: number; z: number; color: number }) {
  // Per-bulb pulse was previously animated via useFrame (1200+ callbacks per
  // frame across all near lanterns). Static opacity reads identically against
  // the LED canopy and skips that entire per-frame cost.
  const glowTexture = useMemo(() => getGlowTexture(), []);
  return (
    <sprite position={[x, 0.85, z]} scale={[0.5, 0.5, 1]}>
      <spriteMaterial
        map={glowTexture}
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, STREET_LENGTH } from '@/lib/store';

/**
 * First-person walking camera.
 * Handles both auto and manual movement, plus drag-to-look.
 */
export function WalkingCamera() {
  const { camera, gl } = useThree();
  const dragYaw = useRef(0);
  const dragPitch = useRef(0);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const manualVel = useRef(0);
  const keys = useRef<Record<string, boolean>>({});

  const { position, walking, speed, mode, setPosition, setWalking, focusedLanternIdx } = useAppStore();

  // Pointer controls
  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      targetYaw.current -= dx * 0.003;
      targetPitch.current -= dy * 0.003;
      targetPitch.current = Math.max(-0.4, Math.min(0.8, targetPitch.current));
    };
    const onUp = () => { dragging.current = false; };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl.domElement]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Animation loop
  useFrame(() => {
    let pos = position;

    if (mode === 'auto' && walking && focusedLanternIdx === null) {
      pos += speed;
    } else if (mode === 'manual') {
      let v = manualVel.current;
      if (keys.current['w'] || keys.current['arrowup']) v = 0.12;
      if (keys.current['s'] || keys.current['arrowdown']) v = -0.1;
      pos += v;
    }

    if (pos > STREET_LENGTH - 15) {
      pos = STREET_LENGTH - 15;
      if (walking) setWalking(false);
    }
    if (pos < 0) pos = 0;

    if (Math.abs(pos - position) > 0.001) {
      setPosition(pos);
    }

    camera.position.z = -pos;
    camera.position.y = 2.2;

    dragYaw.current += (targetYaw.current - dragYaw.current) * 0.1;
    dragPitch.current += (targetPitch.current - dragPitch.current) * 0.1;

    const lookX = Math.sin(dragYaw.current) * 5;
    const lookY = 2.2 + dragPitch.current * 5;
    const lookZ = camera.position.z - 5 * Math.cos(dragYaw.current);
    camera.lookAt(lookX, lookY, lookZ);
  });

  // Expose manual velocity for button controls
  useEffect(() => {
    (window as any).__setManualVelocity = (v: number) => {
      manualVel.current = v;
    };
    return () => {
      delete (window as any).__setManualVelocity;
    };
  }, []);

  return null;
}

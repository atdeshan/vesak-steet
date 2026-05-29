'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useAppStore } from '@/lib/store';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/**
 * Lives inside the Canvas; runs once on mount and emits a single console
 * line with the static device + WebGL context info. Useful for triage when
 * a tester reports "the scene runs badly on my phone".
 *
 * The quality tier is logged with a small delay so ConnectionDetector has
 * had a chance to auto-pick before we read it.
 */
export function StartupLog() {
  const { gl } = useThree();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let webglRenderer = 'n/a';
      let webglVendor = 'n/a';
      try {
        const ctx = gl.getContext();
        const ext = ctx.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          webglRenderer = String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL));
          webglVendor = String(ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL));
        }
      } catch {
        // some browsers block this extension — leave as 'n/a'
      }

      const nav = navigator as NavigatorWithMemory;
      // eslint-disable-next-line no-console
      console.log('[VESAK PERF]', {
        userAgent: navigator.userAgent,
        deviceMemory: nav.deviceMemory ?? 'n/a',
        hardwareConcurrency: navigator.hardwareConcurrency,
        pixelRatio: window.devicePixelRatio,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        detectedQualityTier: useAppStore.getState().quality,
        isTouchDevice: 'ontouchstart' in window,
        webglVendor,
        webglRenderer,
      });
    }, 300);

    return () => window.clearTimeout(timer);
    // gl is stable across the Canvas lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

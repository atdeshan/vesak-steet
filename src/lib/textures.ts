import * as THREE from 'three';

/**
 * Generates a radial-gradient sprite texture used for all glow/halo effects.
 * Generated once, reused across all lanterns + bulbs.
 */
let _glowTexture: THREE.Texture | null = null;

export function getGlowTexture(): THREE.Texture {
  if (_glowTexture) return _glowTexture;
  if (typeof document === 'undefined') {
    // SSR safety — return null texture, won't render until client
    return new THREE.Texture();
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.08, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.15)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.04)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  _glowTexture = new THREE.CanvasTexture(canvas);
  _glowTexture.minFilter = THREE.LinearFilter;
  _glowTexture.magFilter = THREE.LinearFilter;
  return _glowTexture;
}

/**
 * Soft radial-gradient sprite texture for large auras / sky bloom.
 * Falls off slower and fainter than getGlowTexture() so it doesn't show
 * a visible halo ring at large scales.
 */
let _softGlowTexture: THREE.Texture | null = null;

export function getSoftGlowTexture(): THREE.Texture {
  if (_softGlowTexture) return _softGlowTexture;
  if (typeof document === 'undefined') return new THREE.Texture();

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.00, 'rgba(255,255,255,1)');
  g.addColorStop(0.05, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.15, 'rgba(255,255,255,0.35)');
  g.addColorStop(0.30, 'rgba(255,255,255,0.15)');
  g.addColorStop(0.50, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.012)');
  g.addColorStop(1.00, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  _softGlowTexture = new THREE.CanvasTexture(canvas);
  _softGlowTexture.minFilter = THREE.LinearFilter;
  _softGlowTexture.magFilter = THREE.LinearFilter;
  return _softGlowTexture;
}

/**
 * Procedural translucent-paper Vesak lantern panel — used until the real
 * client video texture loads. 1024x512, four motif variants selected by seed.
 */
export function makePanelTexture(seed: number): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture();

  const w = 1024, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Translucent paper base — warm cream → soft gold
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fff4d6');
  bg.addColorStop(0.5, '#ffe9b8');
  bg.addColorStop(1, '#fdd98a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Paper grain — 20 faint vertical streaks
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 20; i++) {
    const x = (i / 20) * w + ((seed * 17) % 8);
    ctx.fillRect(x, 0, 1, h);
  }

  // Ornate multi-layer border
  ctx.strokeStyle = 'rgba(120,60,20,0.6)';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.strokeStyle = 'rgba(180,90,30,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, w - 64, h - 64);
  ctx.strokeStyle = 'rgba(120,60,20,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, w - 88, h - 88);

  // Corner ornaments — quarter-circle arc + filled dot at each corner
  const corners: Array<[number, number, number]> = [
    [16, 16, 0],
    [w - 16, 16, Math.PI / 2],
    [w - 16, h - 16, Math.PI],
    [16, h - 16, -Math.PI / 2],
  ];
  ctx.strokeStyle = 'rgba(120,60,20,0.6)';
  ctx.lineWidth = 2;
  for (const [cx, cy, rot] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 18, rot, rot + Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(120,60,20,0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central motif — one of four Buddhist designs
  const cx = w / 2, cy = h / 2;
  const variant = seed % 4;
  ctx.strokeStyle = 'rgba(120,60,20,0.7)';
  ctx.fillStyle = 'rgba(120,60,20,0.55)';

  if (variant === 0) {
    // Lotus medallion
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.stroke();
    for (let p = 0; p < 8; p++) {
      const a = (p / 8) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -55, 18, 40, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,200,80,0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
  } else if (variant === 1) {
    // Dhamma wheel
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (let s = 0; s < 8; s++) {
      const a = (s / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 25, cy + Math.sin(a) * 25);
      ctx.lineTo(cx + Math.cos(a) * 85, cy + Math.sin(a) * 85);
      ctx.stroke();
    }
  } else if (variant === 2) {
    // Bodhi leaf — heart-shape via two bezier curves
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 90);
    ctx.bezierCurveTo(cx + 80, cy - 80, cx + 70, cy + 60, cx, cy + 90);
    ctx.bezierCurveTo(cx - 70, cy + 60, cx - 80, cy - 80, cx, cy - 90);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 90);
    ctx.lineTo(cx, cy + 90);
    ctx.stroke();
  } else {
    // Geometric mandala — 4 concentric circles + 8-pointed star at center
    ctx.lineWidth = 2;
    for (const r of [20, 40, 60, 80]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(180,90,30,0.5)';
    ctx.beginPath();
    for (let s = 0; s < 16; s++) {
      const a = (s / 16) * Math.PI * 2 - Math.PI / 2;
      const r = s % 2 === 0 ? 35 : 15;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Two rows of 32 decorative dots, top + bottom
  ctx.fillStyle = 'rgba(120,60,20,0.6)';
  for (let d = 0; d < 32; d++) {
    const x = 30 + (d * (w - 60)) / 31;
    ctx.beginPath();
    ctx.arc(x, 70, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, h - 70, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Procedural moon surface — deep amber/orange harvest moon, the colour of a
 * Sri Lankan Vesak full moon low in the sky. Maria patches + small craters
 * baked into the texture itself; the material applies a white tint so the
 * canvas colour comes through untouched.
 */
let _moonTexture: THREE.Texture | null = null;

export function getMoonTexture(): THREE.Texture {
  if (_moonTexture) return _moonTexture;
  if (typeof window === 'undefined') return new THREE.Texture();

  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;

  // Base — deep amber/orange harvest moon, brightest at upper-left
  const baseGrad = ctx.createRadialGradient(
    size * 0.42, size * 0.42, 0,
    size / 2, size / 2, size * 0.55,
  );
  baseGrad.addColorStop(0.0, '#FFC472'); // brightest highlight
  baseGrad.addColorStop(0.4, '#F0A04A'); // mid amber
  baseGrad.addColorStop(0.8, '#D87830'); // edge
  baseGrad.addColorStop(1.0, '#A85820'); // outer rim darker
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Lunar maria — large brown-orange smears
  const maria = [
    { x: 0.38, y: 0.32, r: 0.18, opacity: 0.35 },
    { x: 0.55, y: 0.42, r: 0.22, opacity: 0.40 },
    { x: 0.42, y: 0.55, r: 0.16, opacity: 0.30 },
    { x: 0.65, y: 0.58, r: 0.14, opacity: 0.32 },
    { x: 0.48, y: 0.68, r: 0.12, opacity: 0.28 },
    { x: 0.35, y: 0.45, r: 0.10, opacity: 0.25 },
  ];
  maria.forEach((m) => {
    const cx = m.x * size;
    const cy = m.y * size;
    const r = m.r * size;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,   `rgba(120, 60, 20, ${m.opacity})`);
    g.addColorStop(0.5, `rgba(140, 75, 30, ${m.opacity * 0.6})`);
    g.addColorStop(1,   'rgba(180, 100, 50, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Small darker crater shadows — sparse, kept inside the visible disc
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const dx = x - size / 2;
    const dy = y - size / 2;
    if (Math.sqrt(dx * dx + dy * dy) > size * 0.48) continue;
    const r = 3 + Math.random() * 12;
    const opacity = 0.1 + Math.random() * 0.15;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(100, 50, 15, ${opacity})`);
    g.addColorStop(1, 'rgba(150, 80, 30, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Upper-left bright highlight — catches the implicit "sun" direction
  const highlight = ctx.createRadialGradient(
    size * 0.35, size * 0.30, 0,
    size * 0.35, size * 0.30, size * 0.25,
  );
  highlight.addColorStop(0, 'rgba(255, 220, 160, 0.3)');
  highlight.addColorStop(1, 'rgba(255, 220, 160, 0)');
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, size, size);

  // Subtle warm-wash overlay — unifies the surface tonally
  ctx.fillStyle = 'rgba(220, 120, 50, 0.06)';
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  _moonTexture = tex;
  return tex;
}

/**
 * Creates a VideoTexture from a video file path.
 * Used in production when real client video files are present.
 *
 * @param src - path under /public, e.g. "/lanterns/001.mp4"
 * @param muted - mute the video element (required for autoplay)
 */
export function makeVideoTexture(src: string, muted = true): { texture: THREE.VideoTexture; video: HTMLVideoElement } {
  const video = document.createElement('video');
  video.src = src;
  // No crossOrigin — videos live in /public and are same-origin. Setting
  // crossOrigin='anonymous' forces a CORS handshake that Next.js's static
  // handler doesn't satisfy, which can silently break video loads.
  video.loop = true;
  video.muted = muted;
  video.playsInline = true;
  video.preload = 'metadata';

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return { texture, video };
}

/* ─────────────────────────────────────────────────────────────────────────
   Decorative banner textures
   PLACEHOLDER — all Combank-branded textures here are procedural stand-ins.
   Replace with official assets when the client supplies brand files.
   ───────────────────────────────────────────────────────────────────────── */

function makeBannerCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function makeBannerTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let _vertCombank: THREE.Texture | null = null;
/** PLACEHOLDER — vertical Combank banner. */
export function getCombankVerticalBanner(): THREE.Texture {
  if (_vertCombank) return _vertCombank;
  if (typeof document === 'undefined') return new THREE.Texture();
  const { canvas, ctx } = makeBannerCanvas(256, 512);

  // Cream field — clean ground for the real wordmark to read against
  ctx.fillStyle = '#fff7e6';
  ctx.fillRect(0, 0, 256, 512);

  // Double gold border
  ctx.strokeStyle = '#c89048';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 496);
  ctx.strokeStyle = 'rgba(200,144,72,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, 220, 476);

  // VESAK 2026 caption at the bottom (in CB navy)
  ctx.fillStyle = '#003d7a';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VESAK 2026', 128, 460);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  _vertCombank = tex;

  // The actual Combank logo paints onto the canvas once it loads. Until
  // then the banner shows the cream backdrop + VESAK caption alone.
  const img = new Image();
  img.onload = () => {
    const targetW = 200;
    const targetH = (img.height / img.width) * targetW;
    const x = (256 - targetW) / 2;
    const y = 200 - targetH / 2; // centered above the VESAK caption
    ctx.drawImage(img, x, y, targetW, targetH);
    tex.needsUpdate = true;
  };
  img.src = '/logo/Commercial_Bank_logo.svg';

  return tex;
}

let _flagBuddhist: THREE.Texture | null = null;
/**
 * Buddhist flag (Bauddha Dhvaja) — 1885 design by Henry Steel Olcott and
 * J.R. de Silva, recognised internationally. Five vertical color stripes —
 * Nila, Pita, Lohita, Odata, Manjesta — plus a sixth composite stripe with
 * the same five colors stacked as horizontal bands.
 */
export function getBuddhistFlagBanner(): THREE.Texture {
  if (_flagBuddhist) return _flagBuddhist;
  if (typeof window === 'undefined') return new THREE.Texture();

  const W = 256, H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  const colors = ['#1F4FA0', '#FFCC00', '#D7281F', '#FFFFFF', '#FF9933'];
  const stripeWidth = W / 6;

  // First five vertical stripes — each one color
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, H);
  });

  // Sixth stripe — composite: the five colors stacked horizontally
  const compositeX = 5 * stripeWidth;
  const bandHeight = H / 5;
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(compositeX, i * bandHeight, stripeWidth, bandHeight);
  });

  // Hemmed-edge feel
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // Very subtle fabric grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let i = 0; i < 200; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  _flagBuddhist = tex;
  return tex;
}

let _pennantVesak: THREE.Texture | null = null;
/** Decorative warm Vesak pennant with a lotus motif and VESAK wordmark. */
export function getVesakPennantBanner(): THREE.Texture {
  if (_pennantVesak) return _pennantVesak;
  if (typeof document === 'undefined') return new THREE.Texture();
  const { canvas, ctx } = makeBannerCanvas(256, 512);

  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#ffd24a');
  bg.addColorStop(1, '#ff8533');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 512);

  ctx.strokeStyle = 'rgba(120,60,20,0.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 232, 488);

  // Lotus medallion
  const cx = 128, cy = 200;
  ctx.strokeStyle = 'rgba(120,60,20,0.7)';
  ctx.lineWidth = 4;
  for (let p = 0; p < 8; p++) {
    const a = (p / 8) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -50, 18, 38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#ffeebb';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  // VESAK wordmark
  ctx.fillStyle = '#3a1f0a';
  ctx.font = 'bold 64px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VESAK', 128, 380);
  ctx.font = '32px serif';
  ctx.fillText('2026', 128, 430);

  _pennantVesak = makeBannerTexture(canvas);
  return _pennantVesak;
}

let _roadTexture: THREE.Texture | null = null;
/** Procedural dark asphalt with subtle grain + a faint warm centerline. */
export function getRoadTexture(): THREE.Texture {
  if (_roadTexture) return _roadTexture;
  if (typeof window === 'undefined') return new THREE.Texture();

  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  // Base dark asphalt
  ctx.fillStyle = '#15101a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle noise grain — speckled asphalt
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = Math.random() * 1.5;
    const lightness = 8 + Math.random() * 18;
    ctx.fillStyle = `rgba(${lightness * 2}, ${lightness * 1.6}, ${lightness * 1.4}, 0.5)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Slightly lighter patches for variation
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const radius = 80 + Math.random() * 120;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(40, 32, 50, 0.15)');
    grad.addColorStop(1, 'rgba(40, 32, 50, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Faint warm centerline pickup (picks up the LED canopy color overhead)
  const centerGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  centerGrad.addColorStop(0.0,  'rgba(255, 180, 80, 0)');
  centerGrad.addColorStop(0.45, 'rgba(255, 180, 80, 0.04)');
  centerGrad.addColorStop(0.5,  'rgba(255, 200, 120, 0.07)');
  centerGrad.addColorStop(0.55, 'rgba(255, 180, 80, 0.04)');
  centerGrad.addColorStop(1.0,  'rgba(255, 180, 80, 0)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Dashed painted center line — warm off-white, semi-transparent. Tiles
  // along with the rest of the road texture so it reads as continuous.
  const lineColor = 'rgba(245, 220, 170, 0.55)';
  const lineWidth = 8;
  const lineCenterX = 512;
  const dashLength = 60;
  const gapLength = 40;
  ctx.fillStyle = lineColor;
  for (let y = 0; y < 1024; y += dashLength + gapLength) {
    ctx.fillRect(lineCenterX - lineWidth / 2, y, lineWidth, dashLength);
  }
  // Weather it slightly — overlay noise only on the line itself
  ctx.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 200; i++) {
    const x = lineCenterX - 6 + Math.random() * 12;
    const y = Math.random() * 1024;
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
    ctx.fillRect(x, y, 1, 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // Plane's V axis runs along STREET_LENGTH after the -PI/2 X-rotation, so
  // tile the texture along V to keep grain density consistent.
  tex.repeat.set(1, 8);
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  _roadTexture = tex;
  return tex;
}

let _roadDarkness: THREE.Texture | null = null;
/** Long-axis darkness gradient overlaid on the road — fades near road to
 *  full road texture, far end into night. */
export function getRoadDarknessGradient(): THREE.Texture {
  if (_roadDarkness) return _roadDarkness;
  if (typeof window === 'undefined') return new THREE.Texture();

  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0,  'rgba(0, 0, 0, 0)');    // near = no darkening
  grad.addColorStop(0.3,  'rgba(0, 0, 0, 0.2)');
  grad.addColorStop(0.6,  'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(1.0,  'rgba(0, 0, 0, 0.95)'); // far end = nearly black
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 8, 512);

  const tex = new THREE.CanvasTexture(c);
  // flipY=false so canvas y=0 (top, "near" in our gradient stops) maps to
  // UV V=0, which after the road plane's -PI/2 X-rotation is the world-z=0
  // (camera-side) edge. Without this the gradient is mirrored end-for-end.
  tex.flipY = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  _roadDarkness = tex;
  return tex;
}

let _fairyBulb: THREE.Texture | null = null;
/** Hanging fairy-light bulb — soft halo with a bright teardrop body baked in
 *  the centre. Used for the overhead LED canopy. */
export function getFairyLightBulbTexture(): THREE.Texture {
  if (_fairyBulb) return _fairyBulb;
  if (typeof window === 'undefined') return new THREE.Texture();

  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;

  // Outer soft glow halo
  const halo = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  halo.addColorStop(0,    'rgba(255, 255, 255, 0.95)');
  halo.addColorStop(0.15, 'rgba(255, 255, 255, 0.7)');
  halo.addColorStop(0.4,  'rgba(255, 255, 255, 0.25)');
  halo.addColorStop(0.8,  'rgba(255, 255, 255, 0.05)');
  halo.addColorStop(1,    'rgba(255, 255, 255, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // Bulb body — short vertical teardrop
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.beginPath();
  ctx.ellipse(0, 2, size * 0.10, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hot specular pip
  ctx.beginPath();
  ctx.ellipse(-1, 0, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  _fairyBulb = tex;
  return tex;
}

let _bulbSprite: THREE.Texture | null = null;
/** Plain radial glow — legacy, kept for any caller that still needs it. */
export function getBulbSpriteTexture(): THREE.Texture {
  if (_bulbSprite) return _bulbSprite;
  if (typeof document === 'undefined') return new THREE.Texture();

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.15)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  _bulbSprite = new THREE.CanvasTexture(canvas);
  _bulbSprite.minFilter = THREE.LinearFilter;
  _bulbSprite.magFilter = THREE.LinearFilter;
  return _bulbSprite;
}

let _buntingPennant: THREE.Texture | null = null;
/** White triangular pennant on transparent background — tinted per-instance. */
export function getBuntingPennantTexture(): THREE.Texture {
  if (_buntingPennant) return _buntingPennant;
  if (typeof document === 'undefined') return new THREE.Texture();
  const { canvas, ctx } = makeBannerCanvas(128, 192);

  ctx.clearRect(0, 0, 128, 192);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(128, 0);
  ctx.lineTo(64, 192);
  ctx.closePath();
  ctx.fill();

  _buntingPennant = makeBannerTexture(canvas);
  return _buntingPennant;
}

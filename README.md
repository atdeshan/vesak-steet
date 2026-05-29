# Vesak Street · Lanterns of Colombo

A virtual walk through the Vesak lantern displays of Colombo, Sri Lanka.
Built with Next.js 15 + React Three Fiber + TypeScript.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# → http://localhost:3000
```

## What you'll see

A first-person walk down a stylized Colombo street at night, with 50 rotating
Vesak lanterns flanking the road. Click any lantern to see its video and story.
Toggle between Auto walk and Manual walk modes. Three languages supported
(English, Sinhala, Tamil).

The lantern bodies show **placeholder textures** until real client videos are
dropped into `public/lanterns/`. See `LANTERN_DATA_GUIDE.md` for the data spec.

## Tech stack

- **Next.js 15** (App Router, React Server Components where applicable)
- **React 19**
- **TypeScript** (strict)
- **React Three Fiber** + **drei** — declarative Three.js
- **Three.js r169**
- **Framer Motion** — UI transitions
- **Tailwind CSS** — utility styling
- **Zustand** — app state
- **Vercel** — recommended hosting

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   └── page.tsx            # Home page wrapper, lazy-loads Scene
├── components/
│   ├── scene/              # 3D components (R3F)
│   │   ├── Scene.tsx       # Main canvas + lantern placement
│   │   ├── Environment.tsx # Road, stars, fog
│   │   ├── Lantern.tsx     # Single rotating lantern (the core)
│   │   └── WalkingCamera.tsx # First-person camera + controls
│   └── ui/                 # 2D UI overlays
│       ├── IntroScreen.tsx
│       ├── Controls.tsx    # Top + bottom UI bars
│       ├── LanternPanel.tsx # Story side panel
│       ├── ClosingScreen.tsx
│       ├── AudioManager.tsx
│       └── ConnectionDetector.tsx # Auto lite mode
├── data/
│   ├── types.ts            # TypeScript types + palette constants
│   └── lanterns.ts         # The 50-lantern dataset (PLACEHOLDER)
├── lib/
│   ├── store.ts            # Zustand global state
│   ├── i18n.ts             # English / Sinhala / Tamil strings
│   └── textures.ts         # Glow + panel + video texture factories
└── styles/
    └── globals.css
```

## Critical files for the client to update

1. **`src/data/lanterns.ts`** — the 50 lantern entries (names, stories, video filenames).
   This is the single source of truth. See LANTERN_DATA_GUIDE.md.

2. **`public/lanterns/`** — drop the 50 `.mp4` video files here. Filenames must match
   the `video` field in `lanterns.ts` (defaults to `001.mp4` through `050.mp4`).

3. **`public/audio/`** — drop ambience.mp3, pirith.mp3, bhakti.mp3 (any subset works).

4. **`src/lib/i18n.ts`** — Sinhala and Tamil UI translations.

## Deployment

```bash
# Build
npm run build

# Preview
npm run start

# Deploy to Vercel
npx vercel
```

Set this on Vercel project settings:
- Node.js version: 20+
- Framework preset: Next.js (auto-detected)
- Build command: `npm run build`
- Output directory: `.next` (default)

## Performance notes

- The 3D scene uses sprite-based glow (additive blending) instead of
  geometry-based halos. ~50× fewer triangles, looks better.
- Video textures are only loaded for lanterns within 60 units of the camera.
  Far lanterns show procedural placeholder textures (cheap).
- Lite mode (auto-detected on slow connections / low-end devices) disables
  all video textures.
- Recommended video specs: H.264 MP4, 480p–720p, ~10 seconds, ~500kbps.

## Known v1 limits

These are scoped OUT of v1 by agreement:
- No Tamil translation beyond UI scaffolding (translator can fill `src/lib/i18n.ts`)
- No CMS (content edits require code changes + redeploy)
- No share card image generation (basic Twitter/FB/WhatsApp links only)
- No analytics dashboard for client (Plausible/PostHog integration is one-line)
- Lantern geometry is unified placeholder shape — to be updated when client
  provides reference photos of actual lanterns

## License

Built for client. All rights reserved.

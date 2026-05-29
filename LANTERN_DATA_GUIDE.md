# Lantern Data Guide

Everything the client needs to fill in to make the site real.
This is the **single source of truth** — fill this in correctly and the
site updates automatically.

## What to send

### 1. Lantern data spreadsheet

50 rows, one per lantern. Send as Google Sheets, Excel, or CSV with these columns:

| Column        | Required | Example                                  | Notes |
|---------------|----------|------------------------------------------|-------|
| `id`          | Yes      | `001`, `002`, ... `050`                  | 3-digit, zero-padded |
| `name`        | Yes      | `Pradeepa Atapattam`                     | English name |
| `name_si`     | Yes      | `ප්‍රදීපා අටපට්ටම`                          | Sinhala (Unicode) |
| `name_ta`     | Optional | `பிரதீபா அட்டபட்டம்`                          | Tamil (Unicode) |
| `location`    | Yes      | `Gangaramaya Temple`                     | Where this lantern is |
| `zone`        | Yes      | `Pettah`                                 | One of: `Pettah`, `Fort`, `Galle Face`, `Kollupitiya`, `Bambalapitiya` |
| `size`        | Yes      | `large`                                  | One of: `small`, `medium`, `large`, `massive` |
| `color`       | Yes      | `saffron`                                | See color list below |
| `story_en`    | Yes      | 2–3 sentences about the lantern          | The story shown when clicked |
| `story_si`    | Yes      | Sinhala translation of story_en          | |
| `story_ta`    | Optional | Tamil translation of story_en            | |
| `video`       | Yes      | `001.mp4`                                | Filename (must match the file you upload) |
| `artist`      | Optional | `Sunil Perera & community`               | Credit |
| `sponsor`     | Optional | `Gangaramaya Temple`                     | Credit |

### 2. Video files

50 video files. Drop them into `/public/lanterns/`.

**Recommended specs:**
- Format: **MP4 (H.264)**
- Resolution: **720p** (1280×720) for hero shots, **480p** acceptable
- Length: **8–15 seconds**, looping seamlessly
- Frame rate: **24–30 fps**
- Bitrate: **500–800 kbps** (we'll re-encode if needed)
- File size: **target under 2 MB per file**
- Audio: **strip the audio track** (we layer our own audio)

**File naming:** must match the `video` column from the spreadsheet.
If `id` is `001`, the file should be `001.mp4`.

If the raw footage is too long or too large, we will trim/transcode it.

### 3. Audio files

Drop into `/public/audio/`:

| File           | Length     | Purpose                                  |
|----------------|------------|------------------------------------------|
| `ambience.mp3` | 1–2 min loop | Soft street ambience — crowd murmur, distant traffic |
| `pirith.mp3`   | 2–3 min loop | Buddhist pirith chanting, mid-level mix |
| `bhakti.mp3`   | 2–3 min loop | Bhakti gee, ambient devotional music   |

All optional. If you can only send one, send `ambience.mp3`.

**Specs:**
- Format: **MP3, 128–192 kbps**
- All loops should seamlessly fade end → start

### 4. Reference photos (sooner the better)

Even rough phone photos of the lanterns being built will let us match
the 3D shapes more accurately. Send 3–5 reference images via WhatsApp/email.

---

## Color palette

When choosing a `color` for each lantern, use one of these. Mix it up
across the 50 so the street has variety.

| Value          | Color           | Best for                              |
|----------------|-----------------|---------------------------------------|
| `saffron`      | Bright orange   | Traditional, monastic feel            |
| `gold`         | Warm yellow     | Most common, premium look             |
| `vermillion`   | Red-orange      | Bold accents                          |
| `crimson`      | Deep red        | Festive, dramatic                     |
| `sky`          | Pale blue       | Calm, ethereal                        |
| `sacred-green` | Buddhist green  | Spiritual, peaceful                   |
| `violet`       | Soft purple     | Modern, gentle                        |
| `moonlight`    | Cream-white     | Subtle, elegant                       |
| `coral`        | Soft pink-orange| Warm contrast                         |
| `indigo`       | Deep blue       | Night-time depth                      |

## Size guide

- **small** — modest lanterns, 3–4 metres if real
- **medium** — the default, 5–6 metres
- **large** — major lanterns, 8 metres
- **massive** — spectacle pieces, 12+ metres ("wow" moments — use sparingly, max 8 of 50)

## How to update content

Once data + videos are delivered:

1. We update `/src/data/lanterns.ts` with the real data
2. Drop videos into `/public/lanterns/`
3. Run `npm run build` and redeploy

Total update turnaround once data is in hand: **2–4 hours**.

---

## Delivery deadline

Final data + videos needed by: **(set with client)**.

Without these, the site cannot launch — it will only show placeholder content.

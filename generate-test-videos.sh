#!/usr/bin/env bash
# Generate 50 test-pattern videos for Vesak Street development.
# Each video is unique enough to verify the system handles distinct files.
# Total size: ~10 MB. Run time: ~2 minutes.

set -e

OUTPUT_DIR="public/lanterns"
mkdir -p "$OUTPUT_DIR"

# Check ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

echo "Generating 50 test videos in $OUTPUT_DIR/..."
echo ""

# Use 5 different test patterns rotated through the 50 slots
# so we can visually verify each lantern gets a different texture
PATTERNS=(
  "testsrc2=size=720x720:rate=24:duration=10"
  "mandelbrot=size=720x720:rate=24:end_pts=10"
  "life=size=720x720:rate=24:mold=10:r=24:ratio=0.5:death_color=#C83232:life_color=#00ff00"
  "cellauto=size=720x720:rate=24"
  "smptebars=size=720x720:rate=24:duration=10"
)

# Different hue rotations to make each video visually distinct
HUES=(0 30 60 90 120 150 180 210 240 270 300 330)

for i in $(seq 1 50); do
  num=$(printf "%03d" $i)
  pattern_idx=$(( (i - 1) % ${#PATTERNS[@]} ))
  hue_idx=$(( (i - 1) % ${#HUES[@]} ))
  pattern="${PATTERNS[$pattern_idx]}"
  hue="${HUES[$hue_idx]}"

  echo "[$num/050] Generating with pattern $pattern_idx, hue $hue..."

  ffmpeg -y -f lavfi -i "$pattern" \
    -vf "hue=h=${hue},scale=720:720" \
    -c:v libx264 -preset fast -crf 28 \
    -t 10 -r 24 \
    -pix_fmt yuv420p -movflags +faststart \
    -an \
    "$OUTPUT_DIR/${num}.mp4" \
    -loglevel error 2>&1 || {
      # If a pattern doesn't work on this ffmpeg build, fall back to testsrc2
      echo "  ↳ pattern failed, using fallback testsrc2"
      ffmpeg -y -f lavfi -i "testsrc2=size=720x720:rate=24:duration=10" \
        -vf "hue=h=${hue}" \
        -c:v libx264 -preset fast -crf 28 \
        -t 10 -r 24 \
        -pix_fmt yuv420p -movflags +faststart \
        -an \
        "$OUTPUT_DIR/${num}.mp4" \
        -loglevel error
    }
done

echo ""
echo "✅ Done. Generated $(ls $OUTPUT_DIR/*.mp4 | wc -l | tr -d ' ') videos."
echo "📦 Total size: $(du -sh $OUTPUT_DIR | cut -f1)"
echo ""
echo "Now run: npm run dev"
echo "Walk down the street — each lantern should show a different animated pattern."

#!/usr/bin/env bash
# Transcode downloaded stock videos into Vesak Street format.
# Drop raw .mp4/.mov files into ./raw_videos/, run this script, get production-ready
# 720×720 square clips in public/lanterns/.

set -e

INPUT_DIR="raw_videos"
OUTPUT_DIR="public/lanterns"
START_NUM=${1:-1}  # First slot to write to (default 1). Pass arg to start at different position.

if ! command -v ffmpeg &> /dev/null; then
  echo "❌ ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

if [ ! -d "$INPUT_DIR" ]; then
  echo "❌ $INPUT_DIR/ not found. Create it and put your downloaded videos there."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Collect all video files in raw_videos/
shopt -s nullglob
FILES=("$INPUT_DIR"/*.{mp4,mov,MP4,MOV,webm,WEBM,mkv,MKV})
shopt -u nullglob

if [ ${#FILES[@]} -eq 0 ]; then
  echo "❌ No video files found in $INPUT_DIR/"
  exit 1
fi

echo "Found ${#FILES[@]} videos in $INPUT_DIR/"
echo "Transcoding to $OUTPUT_DIR/ starting at slot $START_NUM..."
echo ""

i=$START_NUM
for f in "${FILES[@]}"; do
  num=$(printf "%03d" $i)
  filename=$(basename "$f")
  echo "[$num] $filename → ${num}.mp4"

  # Get input duration to decide trim length (max 10s, or full clip if shorter)
  duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo "10")
  duration_int=$(printf "%.0f" "$duration")
  trim=$([ "$duration_int" -lt 10 ] && echo "$duration_int" || echo "10")

  ffmpeg -y -i "$f" \
    -vf "scale=720:720:force_original_aspect_ratio=increase,crop=720:720,setsar=1" \
    -c:v libx264 -preset slow -crf 28 \
    -r 24 -t "$trim" \
    -an -movflags +faststart -pix_fmt yuv420p \
    "$OUTPUT_DIR/${num}.mp4" \
    -loglevel error -stats 2>&1 | tail -1

  i=$((i+1))
  if [ $i -gt 50 ]; then
    echo ""
    echo "⚠️  Reached slot 050. Stopping."
    break
  fi
done

echo ""
echo "✅ Transcoded $((i - START_NUM)) videos."
echo "📦 public/lanterns/ now contains: $(ls $OUTPUT_DIR/*.mp4 2>/dev/null | wc -l | tr -d ' ') files"
echo ""
echo "Sizes:"
du -h "$OUTPUT_DIR"/*.mp4 | sort -h | tail -5
echo ""
echo "If any file is over 2 MB, consider increasing -crf to 30 or 32 to compress more."

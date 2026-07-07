#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  npm run media:ingest -- <asset-slug> <input-mp4>
  npm run media:ingest -- --force <asset-slug> <input-mp4>

Asset slugs:
  hero-night-run-social-world
  scene-night-run
  scene-public-plan-plaza
  scene-court-dispatch
  scene-citywalk-case
  scene-weekend-trip
  partner-arrival-value
  vision-arrival-network

Example:
  npm run media:ingest -- hero-night-run-social-world ~/Downloads/runway-hero.mp4

Output:
  public/videos/home-v5/<asset-slug>.mp4
  public/videos/home-v5/<asset-slug>.webm
  public/images/home-v5/<asset-slug>-poster.jpg
EOF
}

force=0
if [[ "${1:-}" == "--force" ]]; then
  force=1
  shift
fi

if [[ "$#" -ne 2 ]]; then
  usage
  exit 64
fi

slug="$1"
input="$2"

case "$slug" in
  hero-night-run-social-world|scene-night-run|scene-public-plan-plaza|scene-court-dispatch|scene-citywalk-case|scene-weekend-trip|partner-arrival-value|vision-arrival-network)
    ;;
  *)
    echo "Unknown asset slug: $slug" >&2
    usage
    exit 64
    ;;
esac

if [[ ! -f "$input" ]]; then
  echo "Input file does not exist: $input" >&2
  exit 66
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but was not found in PATH." >&2
  exit 69
fi

video_dir="public/videos/home-v5"
image_dir="public/images/home-v5"
mkdir -p "$video_dir" "$image_dir"

mp4="$video_dir/$slug.mp4"
webm="$video_dir/$slug.webm"
poster="$image_dir/$slug-poster.jpg"

for output in "$mp4" "$webm" "$poster"; do
  if [[ -e "$output" && "$force" -ne 1 ]]; then
    echo "Output already exists: $output" >&2
    echo "Re-run with --force to replace this asset intentionally." >&2
    exit 73
  fi
done

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

normalized="$tmp_dir/$slug-normalized.mp4"

echo "Normalizing $input -> $normalized"
ffmpeg -y -i "$input" \
  -t 6 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24,format=yuv420p" \
  -an \
  -c:v libx264 \
  -preset slow \
  -crf 22 \
  -movflags +faststart \
  "$normalized"

echo "Writing MP4 -> $mp4"
cp "$normalized" "$mp4"

echo "Writing WebM -> $webm"
ffmpeg -y -i "$normalized" \
  -c:v libvpx-vp9 \
  -b:v 0 \
  -crf 34 \
  -row-mt 1 \
  -deadline good \
  -cpu-used 2 \
  -an \
  "$webm"

echo "Writing poster -> $poster"
ffmpeg -y -ss 00:00:01 -i "$normalized" \
  -vframes 1 \
  -q:v 2 \
  "$poster"

cat <<EOF

Done.

Add this to the matching media asset only after visual QA:

poster: "/images/home-v5/$slug-poster.jpg",
video: "/videos/home-v5/$slug.webm",

Keep MP4 as fallback/archive:
"/videos/home-v5/$slug.mp4"
EOF

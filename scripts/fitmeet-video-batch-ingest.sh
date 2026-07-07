#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/fitmeet-video-batch-ingest.sh [--force] [--verify] [--downloads <dir>]

Default downloads directory:
  output/runway-downloads/home-v5

Expected downloaded filenames:
  <asset-slug>.mp4
  <asset-slug>.mov
  or any file containing <asset-slug> with .mp4/.mov extension

Supported asset slugs:
  hero-night-run-social-world
  partner-arrival-value
  scene-public-plan-plaza
  vision-arrival-network
  scene-court-dispatch
  scene-citywalk-case
  scene-night-run
  scene-weekend-trip

Examples:
  bash scripts/fitmeet-video-batch-ingest.sh --force
  bash scripts/fitmeet-video-batch-ingest.sh --force --verify
  bash scripts/fitmeet-video-batch-ingest.sh --downloads ~/Downloads/fitmeet-runway-final --force

Notes:
  --verify runs npm run typecheck and npm run build after at least one asset is ingested.
  This script does not decide whether a video is good enough. Only put visually accepted MP4/MOV files in the downloads directory.
USAGE
}

force=0
verify=0
downloads_dir="output/runway-downloads/home-v5"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --force)
      force=1
      shift
      ;;
    --verify)
      verify=1
      shift
      ;;
    --downloads)
      downloads_dir="${2:-}"
      if [[ -z "$downloads_dir" ]]; then
        echo "--downloads requires a directory" >&2
        exit 64
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 64
      ;;
  esac
done

if [[ ! -d "$downloads_dir" ]]; then
  echo "Downloads directory does not exist: $downloads_dir" >&2
  echo "Create it and place accepted Runway/Pika MP4/MOV files there." >&2
  exit 66
fi

slugs=(
  hero-night-run-social-world
  partner-arrival-value
  scene-public-plan-plaza
  vision-arrival-network
  scene-court-dispatch
  scene-citywalk-case
  scene-night-run
  scene-weekend-trip
)

find_candidate() {
  local slug="$1"
  local exact_mp4="$downloads_dir/$slug.mp4"
  local exact_mov="$downloads_dir/$slug.mov"
  if [[ -f "$exact_mp4" ]]; then
    printf '%s\n' "$exact_mp4"
    return 0
  fi
  if [[ -f "$exact_mov" ]]; then
    printf '%s\n' "$exact_mov"
    return 0
  fi
  find "$downloads_dir" -maxdepth 1 -type f \( -iname "*$slug*.mp4" -o -iname "*$slug*.mov" \) | sort | head -n 1
}

ingested=0
missing=()

for slug in "${slugs[@]}"; do
  candidate="$(find_candidate "$slug")"
  if [[ -z "$candidate" ]]; then
    missing+=("$slug")
    continue
  fi

  echo "Ingesting $slug from $candidate"
  if [[ "$force" -eq 1 ]]; then
    bash scripts/fitmeet-video-ingest.sh --force "$slug" "$candidate"
  else
    bash scripts/fitmeet-video-ingest.sh "$slug" "$candidate"
  fi
  ingested=$((ingested + 1))
done

if [[ "${#missing[@]}" -gt 0 ]]; then
  echo
  echo "Missing accepted downloads for:"
  printf '  - %s\n' "${missing[@]}"
fi

if [[ "$ingested" -eq 0 ]]; then
  echo "No accepted videos were ingested." >&2
  exit 66
fi

if [[ "$verify" -eq 1 ]]; then
  echo
  echo "Running typecheck..."
  npm run typecheck
  echo
  echo "Running build..."
  npm run build
fi

cat <<EOF

Batch ingest complete.
Ingested: $ingested
Downloads directory: $downloads_dir

Next required step:
Run Chrome desktop QA at 1366x900, 1440x1000, 1920x1080, plus reduced-motion at 1440x1000.
EOF

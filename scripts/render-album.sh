#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
MANIFEST_PATH="$ROOT_DIR/src/7thShadow/tracks.json"
output_dir=${1:-"$PWD/renders"}

if ! command -v jq >/dev/null 2>&1; then
  echo "Missing required command: jq" >&2
  exit 1
fi

while IFS= read -r track_id; do
  "$SCRIPT_DIR/render-track.sh" "$track_id" "$output_dir"
done < <(jq -r '.[].trackId' "$MANIFEST_PATH")

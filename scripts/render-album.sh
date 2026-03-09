#!/bin/bash

set -euo pipefail

usage() {
  echo "Usage: $0 [--project <project-id>] [output-dir]" >&2
  exit 1
}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

project_id="7thShadow"
args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --project." >&2
        exit 1
      fi
      project_id=$2
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        args+=("$1")
        shift
      done
      ;;
    *)
      args+=("$1")
      shift
      ;;
  esac
done

if [[ ${#args[@]} -gt 1 ]]; then
  usage
fi

if [[ $project_id == *".."* ]]; then
  echo "Project id must not contain '..'." >&2
  exit 1
fi

project_slug=${project_id//\//-}
default_output_dir="$PWD/renders"
if [[ $project_id != "7thShadow" ]]; then
  default_output_dir="$PWD/renders/$project_slug"
fi

MANIFEST_PATH="$ROOT_DIR/src/$project_id/tracks.json"
output_dir=${args[0]:-"$default_output_dir"}

if ! command -v jq >/dev/null 2>&1; then
  echo "Missing required command: jq" >&2
  exit 1
fi

if [[ ! -f $MANIFEST_PATH ]]; then
  echo "Track manifest not found: $MANIFEST_PATH" >&2
  exit 1
fi

echo "Project: $project_id"
echo "Output directory: $output_dir"

while IFS= read -r track_id; do
  "$SCRIPT_DIR/render-track.sh" --project "$project_id" "$track_id" "$output_dir"
done < <(jq -r '.[].trackId' "$MANIFEST_PATH")

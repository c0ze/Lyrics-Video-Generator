#!/bin/bash

set -euo pipefail

usage() {
  echo "Usage: $0 [--project <project-id>] <track-id> [output-dir]" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

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

if [[ ${#args[@]} -lt 1 || ${#args[@]} -gt 2 ]]; then
  usage
fi

if [[ $project_id == *".."* ]]; then
  echo "Project id must not contain '..'." >&2
  exit 1
fi

track_input=${args[0]}
project_slug=${project_id//\//-}
default_output_dir="$PWD/renders"
if [[ $project_id != "7thShadow" ]]; then
  default_output_dir="$PWD/renders/$project_slug"
fi
output_dir=${args[1]:-"$default_output_dir"}

if [[ $track_input =~ [^0-9] ]]; then
  echo "Track id must be numeric." >&2
  exit 1
fi

track_id=$(printf "%02d" "$((10#$track_input))")

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
MANIFEST_PATH="$ROOT_DIR/src/$project_id/tracks.json"

require_command jq
require_command npx
require_command ffmpeg
require_command ffprobe

if [[ ! -f $MANIFEST_PATH ]]; then
  echo "Track manifest not found: $MANIFEST_PATH" >&2
  exit 1
fi

track_json=$(jq -ce --arg track_id "$track_id" '.[] | select(.trackId == $track_id)' "$MANIFEST_PATH" || true)

if [[ -z $track_json ]]; then
  echo "Track $track_id was not found in $MANIFEST_PATH" >&2
  exit 1
fi

title=$(jq -r '.title' <<<"$track_json")
composition_id=$(jq -r '.compositionId' <<<"$track_json")
lyrics_file=$(jq -r '.lyricsFile' <<<"$track_json")
audio_file=$(jq -r '.audioFile' <<<"$track_json")

lyrics_path="$ROOT_DIR/public/$lyrics_file"
audio_path="$ROOT_DIR/public/$audio_file"

if [[ ! -f $lyrics_path ]]; then
  echo "Lyrics file not found: $lyrics_path" >&2
  exit 1
fi

if [[ ! -f $audio_path ]]; then
  echo "Audio file not found: $audio_path" >&2
  exit 1
fi

mkdir -p "$output_dir"

temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/${project_slug}-${track_id}.XXXXXX")
cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

safe_title=${title//\//-}
output_basename="$track_id - $safe_title"
silent_video_path="$temp_dir/$output_basename.silent.mp4"
aac_audio_path="$temp_dir/$output_basename.m4a"
final_output_path="$output_dir/$output_basename.mp4"

audio_duration=$(ffprobe \
  -v error \
  -show_entries format=duration \
  -of default=nokey=1:noprint_wrappers=1 \
  "$audio_path")

echo "Project: $project_id"
echo "Track: $track_id - $title"
echo "Composition: $composition_id"
echo "Lyrics: $lyrics_file"
echo "Audio: $audio_file"
echo "Audio duration (ffprobe): ${audio_duration}s"
echo "Final output: $final_output_path"

render_cmd=(
  npx
  remotion
  render
  src/index.ts
  "$composition_id"
  "$silent_video_path"
)

"${render_cmd[@]}"

ffmpeg \
  -y \
  -i "$audio_path" \
  -vn \
  -c:a aac \
  -b:a 256k \
  -movflags +faststart \
  "$aac_audio_path"

ffmpeg \
  -y \
  -i "$silent_video_path" \
  -i "$aac_audio_path" \
  -map 0:v:0 \
  -map 1:a:0 \
  -c:v copy \
  -c:a copy \
  -shortest \
  -movflags +faststart \
  "$final_output_path"

echo "Finished: $final_output_path"

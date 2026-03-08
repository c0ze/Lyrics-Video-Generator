# AGENTS.md

## Project Focus

This repository renders lyric videos for The Seventh Shadow album with Remotion plus shell wrappers around `ffprobe` and `ffmpeg`.

## Working Rules

- Keep `src/7thShadow/tracks.json` as the single source of truth for album tracks.
- Do not duplicate lyric text into TypeScript files. Track lyrics come from `.lrc` files in `public/7thShadow/`.
- Do not delete `src/PaganIntro.tsx`. It is a test board and should stay separate from the album pipeline.
- Use composition IDs in the form `SeventhShadow-01`, `SeventhShadow-02`, etc. Do not use `:` in composition IDs.
- Preserve safe handling of spaces in filenames and output paths when editing shell scripts.

## Render Pipeline

- `scripts/render-track.sh <track-id> [output-dir]` is the primary one-track entry point.
- The script must:
  1. Read the track from `src/7thShadow/tracks.json`.
  2. Validate the referenced `.lrc` and `.flac`.
  3. Use `ffprobe` to read audio duration.
  4. Render a silent Remotion MP4.
  5. Convert audio to AAC with `ffmpeg`.
  6. Mux AAC into the final MP4.
- Final outputs should be named `NN - Title.mp4`, matching the manifest title.

## File Tracking

- Keep `.lrc` files tracked.
- Ignore `.flac` source audio.
- Ignore rendered `.mp4` files and the `renders/` directory.

## Useful Commands

```bash
npm run dev
npm run lint
npm run render:track -- 01
npm run render:album
```

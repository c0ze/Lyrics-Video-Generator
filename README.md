# The Seventh Shadow Lyrics Video

This project is a [Remotion](https://www.remotion.dev/) lyric video pipeline for The Seventh Shadow album. Each track reads its own `.lrc` and `.flac`, derives the composition length from the song, renders a silent video, then muxes AAC audio into a YouTube-ready MP4.

## Requirements

- Node.js and npm
- `ffmpeg`
- `ffprobe`
- `jq`

## Setup

```bash
git clone git@github.com:c0ze/7thShadow-I-Yearn-Lyrics-Video.git
cd 7thShadow-I-Yearn-Lyrics-Video
npm install
```

## Project Layout

- `src/7thShadow/Composition.tsx`: Shared visual composition used by every track.
- `src/7thShadow/lyrics.ts`: LRC parsing and timing helpers.
- `src/7thShadow/tracks.json`: Album manifest shared by Remotion and shell scripts.
- `public/7thShadow/`: Cover art, `.lrc` files, and `.flac` masters.
- `scripts/render-track.sh`: One-track render and mux pipeline.
- `scripts/render-album.sh`: Batch render for the full album.
- `src/PaganIntro.tsx`: Test board only. It is not part of the album render pipeline.

## Preview

Open Remotion Studio:

```bash
npm run dev
```

Album compositions are named `SeventhShadow-01`, `SeventhShadow-02`, and so on. `PaganIntro` remains available in Studio for experiments.

## Render Workflow

Render one final track:

```bash
npm run render:track -- 01
```

By default this writes:

```text
renders/01 - I Yearn.mp4
```

The output file name matches the track number and title from the manifest. Paths with spaces are handled safely by the scripts.

Render one track to a custom output directory:

```bash
./scripts/render-track.sh 01 "/tmp/seventh-shadow exports"
```

Render the full album:

```bash
npm run render:album
```

## What The Track Script Does

`scripts/render-track.sh` performs this pipeline for the selected track:

1. Reads track metadata from `src/7thShadow/tracks.json`.
2. Validates the matching `.lrc` and `.flac`.
3. Uses `ffprobe` to read the source audio duration.
4. Calls Remotion to render a silent MP4 for that track composition.
5. Converts the FLAC to AAC audio with `ffmpeg`.
6. Muxes the AAC track into the silent video.

## Silent Render Only

If you want only the Remotion video without audio muxing:

```bash
npx remotion render src/index.ts SeventhShadow-01 out.mp4
```

## File Tracking

- `.lrc` files are tracked in git.
- `.flac` sources are ignored.
- Rendered `.mp4` files are ignored.
- Batch outputs go to `renders/` by default.

## Credits

- Music: The Seventh Shadow
- Fonts: Amstrong, Cinzel Decorative
- Video framework: Remotion

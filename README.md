# Multi-Project Lyrics Video Pipeline

This project is a [Remotion](https://www.remotion.dev/) lyric video pipeline that can host multiple artists and albums in one repo. Each track reads its own `.lrc` and `.flac`, derives the composition length from the song, renders a silent video, then muxes AAC audio into a YouTube-ready MP4.

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

- `src/lyricVideo/Composition.tsx`: Shared lyric video composition used by project definitions.
- `src/lyricVideo/lyrics.ts`: Generic LRC parsing and timing helpers.
- `src/projects.ts`: Registry of all lyric-video projects loaded into Remotion Studio.
- `src/7thShadow/tracks.json`: The Seventh Shadow track manifest.
- `src/Pagan/Acolytes/tracks.json`: Pagan / Acolytes track manifest.
- `public/7thShadow/`: The Seventh Shadow cover art, `.lrc` files, and `.flac` masters.
- `public/Pagan/Acolytes/`: Pagan / Acolytes cover art, `.lrc` files, and `.flac` masters.
- `scripts/render-track.sh`: One-track render and mux pipeline.
- `scripts/render-album.sh`: Batch render for the full album.
- `src/PaganIntro.tsx`: Test board only. It is not part of the album render pipeline.

## Adding a New Project

1. Add album assets under `public/<project>/...`.
2. Create `src/<project>/tracks.json` with `trackId`, `title`, `compositionId`, `lyricsFile`, `audioFile`, and `coverImageFile`.
3. Create `src/<project>/tracks.ts` that exports a `LyricVideoProject`.
4. Register that project in `src/projects.ts`.

Project IDs are path-like values such as `7thShadow` or `Pagan/Acolytes`. Composition IDs stay flat and colon-free, for example `PaganAcolytes-01`.

## Preview

Open Remotion Studio:

```bash
npm run dev
```

Current album compositions are named `SeventhShadow-01`, `SeventhShadow-02`, and `PaganAcolytes-01`, `PaganAcolytes-02`, and so on. `PaganIntro` remains available in Studio for experiments.

## Render Workflow

Render one final Seventh Shadow track using the default project:

```bash
npm run render:track -- 01
```

By default this writes:

```text
renders/01 - I Yearn.mp4
```

Render one Pagan / Acolytes track:

```bash
npm run render:track -- --project Pagan/Acolytes 01
```

By default non-default projects render into a project-specific output directory:

```text
renders/Pagan-Acolytes/01 - Acolytes.mp4
```

The output filename always matches the track number and title from the manifest. Paths with spaces are handled safely by the scripts.

Render one track to a custom output directory:

```bash
./scripts/render-track.sh --project Pagan/Acolytes 01 "/tmp/pagan exports"
```

Render the default album:

```bash
npm run render:album
```

Render a specific project:

```bash
npm run render:album -- --project Pagan/Acolytes
```

## What The Track Script Does

`scripts/render-track.sh` performs this pipeline for the selected track:

1. Reads track metadata from `src/<project-id>/tracks.json`.
2. Validates the matching `.lrc` and `.flac`.
3. Uses `ffprobe` to read the source audio duration.
4. Calls Remotion to render a silent MP4 for that track composition.
5. Converts the FLAC to AAC audio with `ffmpeg`.
6. Muxes the AAC track into the silent video.

## Silent Render Only

If you want only the Remotion video without audio muxing:

```bash
npx remotion render src/index.ts SeventhShadow-01 out.mp4
npx remotion render src/index.ts PaganAcolytes-01 out.mp4
```

## File Tracking

- `.lrc` files are tracked in git.
- `.flac` sources are ignored.
- Rendered `.mp4` files are ignored.
- Batch outputs go to `renders/` by default.

## Credits

- Music: The Seventh Shadow, Pagan
- Fonts: Amstrong, Cinzel Decorative
- Video framework: Remotion

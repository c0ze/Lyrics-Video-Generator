# The Seventh Shadow Lyrics Video

This project is a [Remotion](https://www.remotion.dev/) lyrics video pipeline for The Seventh Shadow album. It programmatically generates synchronized lyric videos for each track, then muxes AAC audio for a YouTube-ready MP4.

## Project Structure

- `src/7thShadow/Composition.tsx`: Main video composition logic.
- `src/7thShadow/lyrics.ts`: Shared lyric parsing and composition timing helpers.
- `src/7thShadow/tracks.json`: Track manifest used by both Remotion and the shell render scripts.
- `public/7thShadow/`: Static assets (cover art, lyrics files, FLAC masters).
- `scripts/render-track.sh`: Renders one track and muxes AAC audio.
- `scripts/render-album.sh`: Renders all tracks in the manifest.
- `public/fonts/`: Custom fonts (Amstrong, Cinzel Decorative).

## Prerequisites

- Node.js (v16+)
- npm

## Setup

1.  Clone the repository:

    ```bash
    git clone git@github.com:c0ze/7thShadow-I-Yearn-Lyrics-Video.git
    cd 7thShadow-I-Yearn-Lyrics-Video
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

### Preview

Start the Remotion Studio to preview the video in your browser:

```bash
npm run dev
```

### Render One Track

Render one final MP4 with AAC audio:

```bash
npm run render:track -- 01
```

That generates `renders/01 - I Yearn.mp4`.

### Render All Tracks

```bash
npm run render:album
```

### Render Silent Video Only

If you only want the silent Remotion render for a specific track:

```bash
npx remotion render src/index.ts SeventhShadow-01 out.mp4
```

## Credits

- **Music:** The Seventh Shadow
- **Fonts:**
  - Amstrong (Band Logo)
  - Cinzel Decorative (Lyrics)
- **Video Framework:** Remotion

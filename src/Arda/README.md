# Arda — lyric videos

AI-scene lyric videos for the **Arda** music project (Sindarin / Tengwar laments),
built on top of this multi-project Remotion pipeline. Three songs:
`Arda-01` Gwannad i-Lû, `Arda-02` I Dhae Odog, `Arda-03` I Dann Haer.
1920×1080 / 60 fps, YouTube-ready.

## What's here

- `ArdaComposition.tsx` — the composition: a timed scene track + Tengwar/English lyrics + effects.
- `scenes.json` — per-song scene breakdowns, Gemini image prompts, and the scene timeline.
- `theme.ts` — the three per-song moods (Twilight gold / Moonlit silver / Ember).
- `lyrics.data.ts` — **generated** timed lyrics (do not hand-edit; see Pipeline).
- `tracks.json` / `tracks.ts` — track manifest, registered in `../Root.tsx`.

Assets live outside `src/`: scenes in `public/Arda/scenes/<song>/NN.jpg`, audio in
`public/Arda/audio/<song>.flac`, `.lrc`s in `public/Arda/lyrics/`. Fonts:
Tengwar Annatar (`public/fonts/`, local) + Cinzel + Cormorant Garamond
(`@remotion/google-fonts`).

## Lyric logic (the part we tuned)

One line at a time in the lower third, **no vertical motion**:

- Tengwar **inks in left-to-right** (Tengwar's reading order) via an animated CSS
  mask sweep over `REVEAL` frames — this preserves tehtar placement, so do **not**
  split the glyphs into separate boxes. The reveal is cap-scaled to the line's
  window so short lines still finish and show their English.
- **English fades in only after** the Tengwar is fully drawn (`ENGLISH_IN`).
- The outgoing line just **fades out on its own tail** (`PREV_FADE`) before the
  next begins. There is intentionally **no separate "previous line" render** — an
  earlier version drew the old line again during the new line's entry, which
  caused a flash/overlap. Removing it gives a clean hand-off.
- A lower scrim plus per-element text-shadows keep everything legible over bright
  scenes; the active line glows in the theme accent.

All tuning constants are at the top of `ArdaComposition.tsx`
(`REVEAL`, `ENGLISH_IN`, `PREV_FADE`, `CROSSFADE`, `MAX_LINE_HOLD`).

## Scene track

Each scene spans a lyric section (`scenes[].startLineIndex`), shown full-frame
with slow Ken Burns (`motion`: zoom-in/out, pan-left/right/up) and a ~0.6 s
crossfade into the next. Scenes may reuse an `imageId` (e.g. chorus reprises).
The per-song colour grade comes from `theme.ts`.

## Pipeline

1. **Lyrics data** — `node scripts/build-arda-data.mjs` reads the Arda site
   (`/Users/arda/projects/arda/arda`: `data/songs.js` + `data/tengwar.js` +
   `lyrics/*.lrc`), zips by index, and writes `src/Arda/lyrics.data.ts`. Counts
   must match (21 / 17 / 29). Override the site path with `ARDA_SITE_DIR`.
2. **Scene images** —
   `set -a; . /Users/arda/projects/arda/arda/.env; set +a; node scripts/generate-scenes.mjs`
   (needs `GEMINI_API_KEY`). Uses **Imagen 4** (`imagen-4.0-generate-001`),
   `aspectRatio: 16:9`, idempotent (skips existing; `--force` to redo;
   `--song <id>` / `--only 01,02` to target). Imagen returns PNG bytes — convert
   to JPEG afterward: `ffmpeg -i NN.jpg -qscale:v 3 NN_c.jpg && mv NN_c.jpg NN.jpg`.
3. **Render** — `npm run render:track -- --project Arda 01` (one) or
   `npm run render:album -- --project Arda` (all) → `renders/Arda/`.

## Lessons / notes

- **No black bars:** avoid "cinematic / widescreen / film still" phrasing in
  scene prompts — Imagen bakes letterbox bars into the image. Use "full-bleed,
  fills the entire frame, no black bars, no letterbox". Spot bad ones by sampling
  top/bottom strip luminance (both near-black ⇒ baked bars).
- **Album render skipped a track:** `ffmpeg` inside the `while read` loop in
  `render-album.sh` consumed stdin and ate the next track id; fixed with
  `</dev/null` on the inner call.
- **Fonts:** load only the weights you use from `@remotion/google-fonts` (it
  fetches every weight/subset otherwise).
- **Audio:** masters were re-mastered on LANDR (Warm-Medium) — identical duration
  to the originals, so the synced lyrics still line up. The site plays lossless
  FLAC; the YouTube uploads use a high-bitrate AAC remux
  (`ffmpeg -i video.mp4 -i master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 384k`)
  so no re-render is needed when only the audio changes.

Design spec: `../../docs/superpowers/specs/2026-06-20-arda-lyric-videos-design.md`.

# Arda — lyric videos (Remotion + Gemini scenes)

**Date:** 2026-06-20
**Status:** design approved; build pending
**Repo:** `/Users/arda/projects/music/Lyrics-Video-generator` (extends the existing multi-project pipeline)
**Companion:** the Arda site/data lives at `/Users/arda/projects/arda/arda` (single source of truth for lyrics).

## 1. Goal

YouTube lyric videos for the three Arda songs (Sindarin / Tengwar laments), each
a sequence of **Alan-Lee-style painterly scenes** (AI-generated via the Gemini
API) with **Tengwar + English** lyrics, motion, and effects. 1920×1080 / 60 fps
H.264 + AAC MP4.

## 2. Scope & non-goals

- Three tracks: Gwannad i-Lû, I Dhae Odog, I Dann Haer.
- Extend the tool with an isolated `Arda` project; 7thShadow / Pagan untouched.
- **Non-goals:** vertical/Shorts cuts, per-word karaoke, animating the scenes
  themselves (motion is Ken Burns + transitions + overlays, not video gen),
  changing the shared `LyricVideoComposition`.

## 3. Architecture

```
src/Arda/
  ArdaComposition.tsx     scene track + Tengwar/English lyrics + effects
  scenes.ts               per-song scene breakdowns + Gemini prompts (authored)
  lyrics.data.ts          GENERATED: per-song [{ timeSec, teng, en, kind }]
  tracks.json             trackId / title / compositionId / lyricsFile / audioFile
  tracks.ts               exports ardaProject (LyricVideoProject-like)
  theme.ts                three per-song themes (gold / silver / ember)
public/Arda/
  audio/<id>.flac         from the WAV masters
  scenes/<id>/NN.jpg      GENERATED Gemini images
  cover.jpg               title-card art (optional)
public/fonts/
  tengwar-annatar-glaemunicode.ttf, Cormorant-*.ttf, Cinzel-*.ttf   (added)
scripts/
  build-arda-data.mjs     site data + LRC -> src/Arda/lyrics.data.ts
  generate-scenes.mjs     scenes.ts prompts -> Gemini -> public/Arda/scenes/
```

Register Arda in `src/Root.tsx` with its own `calculateMetadata` block (it needs
structured lyric data + scene images, not the shared `lyricsText` prop), so the
shared project flow is unchanged.

## 4. Data flow (single source of truth = the site)

`build-arda-data.mjs` reads, from the site repo:
- `data/songs.js` (`sin`, `en`, section `kind` per line, in order),
- `data/tengwar.js` (`sin → teng`),
- `lyrics/<id>.lrc` (timestamps),

zips by index → `src/Arda/lyrics.data.ts`:
```ts
export const ARDA_LYRICS = {
  "gwannad-i-lu": { lines: [{ timeSec, teng, en, kind }, …] }, …
};
```
Counts must match (21 / 17 / 29). Re-run if the site lyrics change. The script
loads the site path from `ARDA_SITE_DIR` (default `/Users/arda/projects/arda/arda`).

## 5. ArdaComposition

- **Scene track:** `scenes.ts` gives each scene a `startLineIndex`; its on-screen
  span runs from that line's `timeSec` to the next scene's start (last scene →
  end). Each scene = a full-frame `<Img>` with **slow Ken Burns** (scale 1.06→1.14
  + a gentle pan) and a **~0.6 s crossfade** into the next. Color-grade per theme
  (saturate / brightness / contrast / hue) like the shared composition.
- **Lyrics (lower third):** one line at a time — **Tengwar** (Tengwar Annatar,
  large, theme accent with the site's ignite glow) on top, **English** (Cormorant
  Garamond italic) beneath. Current line eases up + glows; previous line fades +
  blurs (reuse the shared timing approach). `maxLineDurationInSeconds` raised for
  these slow songs; long instrumental gaps simply show no line.
- **Chrome:** a small `Arda` wordmark + song title fade in (corner); a **title
  card** at the open (Tengwar title + English, over scene 1) and an **end card**
  at the close (wordmark + "lind.arda.tr").
- **Effects (per theme):** drifting particles (leaves = gold, ash/snow = silver,
  embers = ember), optional drifting mist, vignette, subtle film grain, and a
  gentle bloom/saturation lift on chorus lines. Honor a `reducedMotion` flag for
  cheap test renders. Reuse `DustParticles` / `MistLayer` / vignette patterns.
- **Duration:** from audio (`getAudioDurationInSeconds`) like the shared flow.

## 6. Per-song themes

| Song | Mood | accent (Tengwar/glow) | particles |
|---|---|---|---|
| Gwannad i-Lû | Twilight gold | `#e7c97e` / gold glow | falling leaves |
| I Dhae Odog | Moonlit silver | `#d2e4f0` / cool glow | drifting motes/snow |
| I Dann Haer | Ember | `#d07a5c` / ember glow | rising embers/ash |

Grading mirrors the site palettes (deep near-black fields, low saturation).

## 7. Scene breakdowns & Gemini prompts

**Style preamble (every prompt):** *"Alan Lee and John Howe style watercolour and
ink fantasy illustration, Tolkien Middle-earth, soft muted palette, delicate
linework, atmospheric, melancholic, cinematic wide composition, depth and mist,
no text, no lettering, no watermark, 16:9."* Plus a per-song palette clause.

### Gwannad i-Lû (Twilight gold) — 7 scenes
1. **V1** — an autumn forest at dusk, golden leaves falling onto cold grey earth, bare branches, low mist, muted gold light.
2. **V2** — a white elven ship moored at a grey stone harbour by a still sea under a pale sky (the Grey Havens), quiet, vast.
3. **Chorus** *(reused both choruses)* — a lone cloaked figure on a stone quay watching a luminous white ship sail westward over a wide grey sea, light on the water.
4. **V3** — dawn light breaking over distant mountains, a solitary figure reaching toward the sun's warm golden glow.
5. **V4** — ruined elven halls and broken statues in grey rain, crumbling carved stone, desolation.
6. **Bridge** — a vast ancient tree with deep furrowed bark beside dying embers in cold blue twilight, drifting ash.
7. **Outro** — the white ship vanishing into a radiant western horizon at last light, sea and sky merging into gold.

### I Dhae Odog (Moonlit silver) — 6 scenes
1. **V1** — an elven maiden alone by a moonlit marble fountain at night, waiting, pale silver light, long shadows.
2. **V2** — fading stars over a dark overgrown garden, faint fireflies, the maiden's still silhouette among shadows.
3. **Chorus** — a weeping night sky, the moon veiled in thin cloud, the maiden's pale form glimmering like a guttering candle.
4. **Bridge** — a storm-torn night sky rending open over a dark harbour and black water, desperate and vast.
5. **Chorus (reprise)** *(reuse scene 3)*.
6. **Outro** — the maiden dissolving into moonlight and shadow, fading, a single silver gleam remaining.

### I Dann Haer (Ember) — 7 scenes
1. **V1** — an immortal elf alone in a vast empty hall of fading tapestries and forgotten names, grey dawn light, dust.
2. **V2** — long silent grey halls, a single guttering candle, empty carved chairs, motes in still air.
3. **Chorus** *(reused all choruses)* — a lone figure beneath a cold vast night sky, the darkened world small below.
4. **V3** — a kneeling, weeping figure in falling grey rain, ashen muted tones, ruined garden.
5. **Bridge** — a figure kneeling in deep long-fading darkness beside dying embers, an unhealed glow.
6. **Refrain** — a single silhouette swallowed by encroaching shadow, almost gone.
7. **Outro** — the last figure in a darkening world, faint ember light sinking to black.

(≈ 20 distinct images; choruses reuse their scene image.)

## 8. Image generation

- SDK `@google/genai`; model **Imagen 4** (`imagen-4.0-generate-001`),
  `aspectRatio: "16:9"`, 1 image/scene, highest available resolution; Remotion
  `objectFit: cover` to 1920×1080. Fallback model `gemini-2.5-flash-image`.
- `generate-scenes.mjs` is **idempotent** (skips existing files), names outputs
  `public/Arda/scenes/<id>/NN.jpg`, and reads `GEMINI_API_KEY` from the env
  (run with the site `.env` sourced — see §11). Writes a `scenes.manifest.json`
  recording prompt + model per file for reproducibility.
- **Samples-first:** generate scenes 1–3 of Gwannad, get sign-off on the look,
  then generate the rest.

## 9. Audio & fonts

- Convert the three WAV masters → FLAC into `public/Arda/audio/` (the tool's
  convention; `render-track.sh` muxes FLAC→AAC).
- Add fonts to `public/fonts/`: Tengwar Annatar (copy from the site), Cormorant
  Garamond, Cinzel. Load via `@remotion/fonts` `loadFont` + `delayRender`.

## 10. Output / render

- Compositions `Arda-01/02/03`; `tracks.json` titles → `renders/Arda-*/NN - <title>.mp4`.
- Reuse `scripts/render-track.sh` (`--project Arda`); confirm it muxes our FLAC.
  Encode H.264 high, yuv420p, AAC, `+faststart` for YouTube.
- Thumbnails: export a still frame per song (optional, later).

## 11. Build sequence

1. Add fonts; convert WAV→FLAC into `public/Arda/audio/`.
2. `build-arda-data.mjs` → `src/Arda/lyrics.data.ts`; verify counts 21/17/29.
3. Author `scenes.ts` (prompts above) + `theme.ts`.
4. `ArdaComposition.tsx` with placeholder scene fills (gradients) so it previews
   keyless; register Arda in `Root.tsx` + `projects`/manifest.
5. Preview in Remotion Studio; tune lyric layout, motion, effects.
6. `generate-scenes.mjs`; run **samples** (Gwannad 1–3) → user sign-off.
7. Generate all scenes; re-preview with real images.
8. Render the three MP4s; spot-check; hand off.

## 12. Open items / gate

- `GEMINI_API_KEY` present in the site `.env` (✓). Run image gen as:
  `set -a; . /Users/arda/projects/arda/arda/.env; set +a; node scripts/generate-scenes.mjs`.
- Confirm the exact Imagen 4 model id / max resolution at call time; fall back to
  `gemini-2.5-flash-image` if needed.
- Style sign-off on the Gwannad samples before the full batch.

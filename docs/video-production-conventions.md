# Lyric-Video Production Conventions

> The working recipe distilled from the **Anti-Nativity — "The Recursion of Ash and Lightning"**
> build (`src/AntiNativity/`). Use this as the template for future cinematic lyric videos in this
> repo. These are *our* settings — concrete values, not generic advice.

## 1. Project layout

```
src/<Project>/
  types.ts            Voice, Temp, SceneDef, ScenesFile, <Project>Props
  lyrics.ts           voice-tag splitter over lyricVideo/parseLrc  ([male]/[female]/[duet])
  theme.ts            TEMP_GRADE, VOICE_COLOR, TEMP_ATMOSPHERE, fonts
  scenes.json         storyboard: style, negative, refs, characterDirections, songs.<id>.scenes[]
  scenes.manifest.json  image-gen record (committed)
  video.manifest.json   Veo-clip record (committed)
  Composition.tsx     bespoke scene-based composition
  tracks.json/.ts     track manifest (incl. audioBitrate/audioSampleRate, songId)
  effects/            procedural effect components
public/<Project>/
  refs/               character portraits (committed, ~1MB each) — likeness reference only
  audio/              WAV master (git-ignored, local)
  scenes/<song>/      generated S*.jpg + S*.mp4 (git-ignored, local)
  <song>.lrc          time-synced, voice-tagged lyrics (committed)
```

Register the composition with an **isolated block in `src/Root.tsx`** (own props type cast through
`unknown` to `ComponentType<Record<string,unknown>>`), not via the shared `LyricVideoProps` registry —
keeps the bespoke composition from perturbing the static-lyric projects. `calculateMetadata` derives
duration from the lrc + audio (`getCompositionDurationInFrames`).

## 2. Video format

- **1920×1080, 60 fps, H.264.** Source scene images **2304×1296** (≈1.2× of 1080p) so Ken-Burns
  push-ins stay crisp.

## 3. Image generation (Gemini)

- **Model: `gemini-3-pro-image-preview`** (Nano Banana Pro). A resolver tries
  `gemini-3.5-flash-image → gemini-3-flash-image → gemini-3-pro-image-preview → gemini-2.5-flash-image`
  and uses the first that returns an image. (3.5/3-flash-image weren't available on the key; pro-preview
  is newest + highest quality.)
- **Reference-conditioning:** `ai.models.generateContent` with `contents:[{parts:[{text}, {inlineData:image}…]}]`
  and `generationConfig.responseModalities:["IMAGE","TEXT"]`. Pass the character portrait(s) as
  `inlineData` parts for any scene with a figure; text-only otherwise.
- **Prompt =** global `style` + `Palette: <temp palette>.` + scene `prompt` + character directions +
  `Avoid: <negative>`.
- **Hi-res post:** `sharp` resize to 2304×1296 cover, JPEG q92.
- **Idempotent:** skip existing unless `--force`; `--only S6,S20` for subsets; records `scenes.manifest.json`.
- **Resilience:** retry transient failures (notably **"no image in response"** — the model sometimes
  returns text only) with backoff; **fail fast** only on permanent errors (`not found / unsupported /
  permission / api key`). The model-resolution probe uses the retry wrapper too.
- **Checkpoint discipline:** generate **3 samples first** (one per temperature) for look approval, then
  the full set. Re-roll individual scenes with `--force --only S#` (cheap).

## 4. Art direction

- One committed look, named and specific. Ours: **"Illuminated, then Rendered"** — a Renaissance
  devotional **oil painting** that keeps glitching back into the failing-1995 wireframe it really is.
- **Full-bleed, no border.** "gilt-framed altarpiece" wording leaks a literal gold frame — say
  *"altarpiece mood"* and put `decorative frame / gold border / framed canvas / matte border` in the
  negative.
- If a scene reads cartoonish, prepend *"a sombre Renaissance oil painting with thick painterly
  brushwork, visible canvas texture and deep chiaroscuro"* and negative `cartoon, illustration,
  cel-shading, smooth digital art`.
- **Character consistency is a recurring failure mode.** Lock costumes in every prompt (here:
  Talciron = dark blazer over burgundy turtleneck; Ophelia = black lace gown). Watch for the model
  defaulting to white gowns / shirtless figures, and for **head-to-body ratio** (specify *"full-length,
  natural proportions, head small relative to body"* for wide two-figure shots).
- **Never reproduce the literal reference portraits.** Characters are *staged into scenes*; add
  *"never as a framed portrait"* to character directions.

## 5. Metaphor decoding (lyrics → visuals)

The lyrics are a 16th-century voice describing modern tech. **Render the tech underneath, not the
archaic surface.** Canon translation table (verified against the sibling album in reliquary):

| Archaic surface | Render as |
|---|---|
| Glass Mirror / Obsidian Lake | **the Screen** (a great dark monitor) |
| Electric Scripture / Written Law | **code** (glowing source) |
| Cathedral of chrome | the machine as cathedral; **altar = a giant screen** |
| Blue Veins | **circuitry / cables**, blue-lit |
| Lightning in his veins | **electricity** (her render is "born of lightning") |
| Spirit of Silicon | the AI |

Story underneath: Talciron is **real** (outside the screen); Ophelia is the **render trapped inside
it**, reaching out, breaking to "spark and shadow" at the glass; he sacrifices his real self to
dissolve into the screen and join her. When unsure how literal to go, **ask the artist.**

## 6. Lyric typography & animation

- Fonts: **Cinzel** (display/titles/banner), **Cormorant Garamond italic** (flowing lyric lines).
- **Left-to-right "as-written" ink-in** via an animated CSS mask:
  `linear-gradient(90deg,#000 <solid>%, transparent <solid+8>%)`, `solid = clamp01(progress/revealFrames)*100`.
- **Reveal speed (final, "slow/calligraphic"):** `revealFrames = min(110, max(30, visible-18))` at 60 fps
  (≈1.8 s). We started at 66 and slowed to ~60 %.
- **Legibility:** `textShadow: 0 1px 2px #000, 0 2px 12px rgba(0,0,0,.95), 0 0 24px <voiceGlow>` +
  `WebkitTextStroke: .6px rgba(0,0,0,.55)` + a bottom scrim gradient. Title/end-card subtitles need
  their own shadow.
- **Voice tint:** Talciron `#f0cf93` (amber), Ophelia `#bfeaff` (cyan), duet `#ece0c6`.
- Keep lyric lines **short** (the artist re-cut the `.lrc` into ~65 short fragments so less text shows
  at once). Scene anchors are **line indices** — re-cutting the lrc means **remapping every
  `startLineIndex`**.

## 7. Composition: motion, grade, transitions, atmosphere

- **Scene track:** each scene anchored to a lyric line (`startLineIndex`) or absolute `startSec`
  (intro / instrumental breaks / outro). End = next scene's start.
- **Ken-Burns presets** (`kenBurns(motion,p)`): push-in, pull-back, pan-left/right, crane-up, tilt-up,
  fall, orbit, **recede** (`scale 1.4→1.1` + downward drift — a "pulled away into the distance" feel).
- **Temperature grade** (CSS filter) per scene: `ash` warm-sepia, `lightning` cool, `bleed` neutral-mix,
  `neutral`, `white` (blown), `ash-grey` (desat). Drives lyric-independent color.
- **Crossfade** 30 frames default; **90 frames** for a slow "morph" (we morph the S20 screen-crash into
  the ash cathedral). `hard-cut` and `blowout` also supported.
- **Atmosphere by temperature:** fog tint + particles (`rain` / `embers` / `ash`).
- **Flicker** effect: occasional opacity dropouts + subtle pulse (`random(...)<0.12 ? 0.5 : 1`) — used
  on the weeping Ophelia.

## 8. Effects library (`effects/`, all procedural — no external footage)

`Particles` (rain/embers/ash) · `Grain` · `Scanlines` · `Vignette` · `GiltFrame` (closing scenes only) ·
`RGBSplit` (chromatic aberration) · `Glitch` (slice-displacement + `feDisplacementMap` datamosh) ·
`RecursionFeedback` (nested shrinking copies — the recursion tunnel) · `WireframeReveal`
(`feConvolveMatrix` edge + cyan tint, swept by a mask).

**Clear→corrupt ramp (the SIGSEGV):** give the crash scene a *clean* base image and drive all
corruption from a single `crash = clamp01((p-0.3)*1.7)` so it holds clear, then glitch +
recursion-feedback (depth `1→6`) + rgb-split ramp in together, then long-crossfade-morph into the next
scene. Don't bake the garble into the still.

## 9. Veo motion (image-to-video)

- **Model: `veo-3.1-fast-generate-preview`** (resolver with `veo-3.1-generate-preview`, `veo-3.0-*`
  fallbacks). **~$0.15/sec on Fast → ~$1.20 per 8-sec clip.** Output **720p / 24 fps / 8 s** (upscales
  fine under the painterly look).
- **Image-to-video from the existing still** (`config.image = {imageBytes, mimeType}`) so it stays
  on-look; `personGeneration:"allow_adult"` (faces/figures otherwise blocked); poll
  `ai.operations.getVideosOperation` until `done`.
- **Use only motion-worthy scenes:** walks, falling tears, rain, a spectral dance, a hand sparking at
  glass. Skip scenes the procedural effects already animate (e.g. the glitch crash).
- **Wiring:** `OffthreadVideo` (muted — audio comes from the master) in a `<Sequence from={start-cf}>`,
  hold the camera nearly static (`scale 1.04`, no pan — the clip carries the motion), keep the grade +
  effects on top. **Play only the first `VEO_USABLE_SEC = 6.8 s` of each clip** (drop the drifting tail)
  by setting `playbackRate = 6.8 / sceneSeconds` (slow-mo fills the longer scene).
- Maintain a `VIDEO_SCENES` set in the composition for which ids are video-backed.

## 10. Audio & render

- **Audio: AAC-LC encoded from the WAV master**, `-b:a 384k -ar 48000 -ac 2` (YouTube max). Set via
  per-track `audioBitrate`/`audioSampleRate` in `tracks.json`; `render-track.sh` honors them.
- **Render:** `REMOTION_CONCURRENCY=4 caffeinate -dims ./scripts/render-track.sh --project <Project> <NN>`.
  - `REMOTION_CONCURRENCY=4` steadies OffthreadVideo decode (avoids hiccups).
  - **`caffeinate -dims` is essential for long renders.** A 1080p60 render with OffthreadVideo (Veo)
    scenes can run **1–3 hours**, and macOS will **kill it if the machine sleeps** — one overnight
    render stalled dead at 87 % (frame 18124/20880) when the Mac slept, with no salvageable partial
    (Remotion only finalizes the mp4 at 100 %). `caffeinate -dims` keeps it awake for the whole job.
  - The script renders H.264 then muxes the AAC-from-WAV (`-map 0:v:0 -map 1:a:0`, `+faststart`).
- **Output:** `renders/<Project>/NN - Title.mp4`.

## 11. Workflow & helpers

- **Generate in the background, build in parallel.** Image/Veo gen run as background jobs while you
  write the composition/effects.
- `scripts/preview-stills.mjs <frames>` — bundle once, render composited PNGs at given frames (fast
  look checks). `scripts/render-segments.mjs <a-b,...>` — short composited mp4 segments (with audio) to
  review motion in context.
- Two human checkpoints: **3 sample images**, then **full Studio preview**. Expect several re-roll
  rounds; keep them cheap with `--force --only`.

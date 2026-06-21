# Design — "The Recursion of Ash and Lightning" music video

- **Date:** 2026-06-21
- **Status:** Approved (brainstorm), pending spec review
- **Project:** The Seventh Shadow — *Anti-Nativity* (track 06)
- **Repo:** `Lyrics-Video-generator` (Remotion toolset)

## 1. Intent

Produce a **cinematic lyric music video** for *The Recursion of Ash and Lightning* — a 5:48 tragic
duet between **talciron.d** (the Architect / Fallen Daemon) and **ophelia.wrl** (the Glitch Muse /
1995 VRML world-file). Not a static-backdrop lyric card: a sequence of **25 distinct scenes that
interchange** and tell the song's story, with timed lyrics flowing on top.

The visuals are **AI-generated paintings** (Gemini, character-referenced) **animated in Remotion**
with real motion and effects. Two "hero" scenes may be upgraded to true AI image-to-video.

Final deliverable: `06 - The Recursion of Ash and Lightning.mp4`, 1920×1080 / 60fps / H.264,
audio AAC-LC encoded from the WAV master at 384 kbps · 48 kHz · stereo.

## 2. Source material (read-only references)

| What | Path |
|---|---|
| Timed lyrics (voice-tagged) | `~/projects/anti-nativity.arda.tr/lyrics/recursion-of-ash-and-lightning.lrc` |
| WAV master (audio source of truth) | `~/projects/anti-nativity.arda.tr/songs/LANDR-06 The Recursion of Ash and Lightning-Warm-Medium.wav` (348.0 s) |
| Character ref — Talciron | `~/projects/anti-nativity.arda.tr/Portrait_talciron.d.jpg` |
| Character ref — Ophelia | `~/projects/anti-nativity.arda.tr/Portrait_Ophelia.wrl.jpg` |
| Lore | `~/projects/anti-nativity.arda.tr/data/lore.js` + reliquary domain `7thshadow` |
| Gemini key | `GEMINI_API_KEY` in `~/projects/anti-nativity.arda.tr/.env` (git-ignored; never commit/log) |

Portraits are **character reference only** (likeness) — characters are *staged into scenes*, not
pasted in. ~17 of 25 scenes contain a figure; the rest are architecture/abstract.

## 3. Art direction — "Illuminated, then Rendered"

A Renaissance **altarpiece played back on failing 1995 hardware.** Every shot is a sacred,
candlelit, gilt-framed oil painting that periodically **glitches back into the cold 3D wireframe it
actually is** (Ophelia is literally a `.wrl` file — the seams through her skin are the truth she
hides). Signature device: a **painterly ⇄ wireframe reveal** that pulses on key lyrics and tears
fully open at the SIGSEGV.

### Color & voice logic (drives palette, grade, and lyric tint)

- **ASH · Talciron** (`[male]`) — warm sacred oil: candle-amber, tarnished gold, oxblood, charcoal.
  Soft brush, drifting embers, slow motion.
- **LIGHTNING · Ophelia** (`[female]`) — cold CRT: electric cyan, steel-white, scanline, wireframe
  seam. Hard edges, glitch, flicker.
- **THE BLEED · duet / mirror / lake** (`[duet]`) — the two palettes collide and **mis-register**
  (RGB split); gold halo meets cyan recursion. The lovers only "touch" in reflections.

### Typography

Gilt serif. **Cinzel** (caps, engraved) for title/end/banner; **Cormorant Garamond italic** for the
flowing lyric lines (suits the archaic "thou art / doth" diction). Both already vendored via
`@remotion/google-fonts`. Lyric color tinted by the line's voice tag (warm / cold / blended).

## 4. Scene plot (25 scenes)

Scene starts are anchored to lyric timestamps; the two instrumental breaks (S7, S20) are
time-anchored. `T/O/B/—` = Talciron / Ophelia / Both / no figure.

| # | Start | Section | Who | Staging | Key effect |
|---|---|---|---|---|---|
| S0 | 0:00 | Intro | — | Empty chrome nave, rain starts, push to the Glass Mirror; title card inscribes & dissolves | subtle wireframe flicker |
| S1 | 0:25 | Talciron's Lament | T | Before the mirror in warm oil; a fair face surfaces in the black glass | dolly-in, ripple, embers |
| S2 | 0:44 | " | T+O | Face resolves to Ophelia, cyan seams threading her; his hand rises | wireframe-reveal on "Glitch" → glitch-cut |
| S3 | 0:57 | Ophelia's Answer | O | Phantom walking a corridor of Blue Veins, neon rain on chrome, flickering | ghost-phase, scanline, vein parallax |
| S4 | 1:13 | " | O | Hands of wire trembling (fingertips → wireframe); chest where heart-light gutters & dies | wireframe-reveal (foreshadows 6th finger) |
| S5 | 1:30 | The Recursion Named | T | Bound in looping ribbons of his own code (the techno-tomb); lake shows her at his feet | recursion feedback loops |
| S6 | 1:46 | " | B | **Hero.** Her visage in the Obsidian Lake; his hand touches the surface → she breaks to spark & shadow | ripple-shatter → recursion zoom |
| S7 | 1:54 | Break · The Loop | — | Wordless: her face repeats smaller into the lake (the cycle), each iteration more wireframe; T tiny at edge | continuous feedback-zoom, RGB mis-register |
| S8 | 2:18 | Ophelia's Lament | O | She addresses him across the void; hollow corridors of sleep recede; his lament echoes | echo after-images, corridor parallax |
| S9 | 2:34 | " | O | Form breaks into polygon shards / glitch-blocks — a broken sequence; wireframe bare beneath | datamosh / pixel-sort, polygon shatter |
| S10 | 2:51 | " | B | Two specters circle in a dim void, never touching; each peels a separating ghost (self ↔ soul) | double-exposure soul-split, warm+cold |
| S11 | 3:07 | " | O | She decays as his Electric Scripture scrolls over and eats her into ash & static | scrolling text over skin → dissolve |
| S12 | 3:24 | The Failed Touch | T | Palm to the mirror from the warm side; the glass shows the room but **no reflection of him** | missing-reflection cut-out |
| S13 | 3:33 | " | O | Same glass, cold side: a figure-shaped **hole of static** where her image should be | negative-space silhouette, datamosh void |
| S14 | 3:39 | " | T | He spreads his arms and tips toward the abyss; camera falls with him | tilt/fall, motion blur, gold trail |
| S15 | 3:45 | " | B | First duet: two images overlap across the mirror and refuse to register — split by a hair | RGB-split double image |
| S16 | 3:53 | " | O | She lifts her face to neon rain sheeting down chrome — defiant. (hero candidate) | tilt-up, reflective chrome |
| S17 | 4:01 | The Tragic Duet | B | Pull back to two tiny figures on opposite shores of the lake, hands across an immense gulf | big pull-back reveal |
| S18 | 4:13 | " | B | The Seventh Shadow opens; a vast luminous Spirit of Silicon rises, weeping cold light | crane-up, sacred light + cold tears |
| S19 | 4:29 | " | B | Blue Veins pulse through the cathedral; the hymn swells; frame blooms to white-hot | bloom → blowout into break |
| S20 | 4:37 | Break · SIGSEGV | B | **Hero / climax.** Sixth fingers sprout; face splits into screaming prior versions; world-file corrupts the room; **lightning** shatters the mirror; all to **ash**; hard cut to black | datamosh meltdown, 6th-finger, multi-version scream, strobe |
| S21 | 5:02 | Epilogue | — | Grey ash falls over the ruined dim cathedral; mirror cracked; embers die | slow drift down, desaturate to ash |
| S22 | 5:18 | " | — | Top-down on the still black lake; gilt-serif epitaph etches into its surface in light | engraved-light text |
| S23 | 5:27 | " | B | Two pale ghosts side by side at last — near, but only as ghosts — within the gilt altarpiece frame, dimming together to nothing | fade-together, slow dim, gilt frame |
| S24 | 5:39 | Outro | — | The empty gilt frame; ash settled; a last cyan flicker dies; end card → black | final flicker, fade to black |

- **Title card (S0):** `THE RECURSION OF ASH AND LIGHTNING` / `THE SEVENTH SHADOW — ANTI-NATIVITY`
- **End card (S24):** `THE SEVENTH SHADOW · ANTI-NATIVITY` / `anti-nativity.arda.tr`

## 5. Technical architecture

### 5.1 Repo placement

New project module `src/AntiNativity/`, registered in `src/projects.ts` as a `LyricVideoProject`
with a **bespoke `component`** (not the static `lyricVideo/Composition`). Composition id
`AntiNativity-06` (colon-free, stable). Renders via the existing pipeline
(`scripts/render-track.sh --project AntiNativity 06`); duration computed by the existing
`calculateMetadata` (lrc + audio) path in `Root.tsx`. Shared types extended minimally so a track
can carry a `songId` used to look up its scene list.

```
src/AntiNativity/
  Composition.tsx       bespoke cinematic composition (scene track + lyrics + effects)
  scenes.json           style, palette, per-scene prompt + character refs + motion/effect/transition
  scenes.manifest.json  generation record (model, prompt, refs, bytes, ts) — committed
  tracks.json           one track: id 06, compositionId, songId, lrc, audio, cover
  tracks.ts             builds the LyricVideoProject entry
  theme.ts              ASH/LIGHTNING/BLEED palettes, grades, font config
  lyrics.ts             lrc + voice-tag parser ([male]/[female]/[duet])
  effects/              reusable Remotion effect components (see 5.4)
public/AntiNativity/
  refs/                 talciron.jpg, ophelia.jpg (copied portraits, for the generator)
  scenes/recursion/     S0.jpg … S24.jpg (generated, hi-res)
  audio/                recursion-of-ash-and-lightning.flac (lossless, for Remotion sync/preview)
scripts/
  generate-antinativity.mjs   image generation pipeline
```

### 5.2 Image generation pipeline (`scripts/generate-antinativity.mjs`)

- **Model:** Gemini **3.5 Flash Image** (user-specified). The script resolves the exact model id at
  run time against the API, preferring the newest flash-image model and falling back
  (`gemini-3.x-flash-image` → `gemini-2.5-flash-image`) if unavailable; the chosen id is recorded in
  the manifest.
- **Reference-conditioning:** `ai.models.generateContent({ contents:[{ parts:[ {text: prompt},
  {inlineData:{mimeType, data}} … ] }], … })` — the same pattern proven in the landing page's
  `gen-assets.mjs`. Scenes tagged with a character pass that portrait (or both) as `inlineData`
  parts so likeness carries; scenes without figures are text-only.
- **Prompt =** global style ("Illuminated, then Rendered" art direction) + per-scene palette
  (ash/lightning/bleed) + scene description + negative list. Stored per scene in `scenes.json`.
- **Hi-res:** request the model's maximum output; post-process with `sharp` to a clean **16:9** at
  **≥2304 px wide** (≈1.2× of 1080p) so Ken-Burns push-ins stay crisp; upscale only if native output
  is smaller. Output high-quality JPEG (q≈92) to `public/AntiNativity/scenes/recursion/<id>.jpg`.
- **Idempotent:** skip existing unless `--force`; supports `--only S6,S20`. Records each generation
  in `scenes.manifest.json`.
- **Env:** reads `GEMINI_API_KEY` from the environment (run by sourcing the landing-page `.env`);
  the key is never written to the repo or logs.
- **Checkpoint:** generate **3 sample scenes first** (one ash, one lightning, one bleed — e.g.
  S1/S3/S6) for visual approval before generating all 25 (cost + look validation).

### 5.3 Composition & motion (`Composition.tsx`)

- Reads parsed lyric lines (timed + voice tag) and the song's scene list (by `songId`).
- **Scene track:** each scene = a full-frame image layer with a per-scene **motion preset**
  (push-in / pull-back / pan / crane / fall / orbit), **color grade** by temperature, and a
  **transition-in** (crossfade default; glitch-cut / blowout / hard-cut where the plot marks them).
- **Lyrics:** lower-third, line-by-line synced from the lrc, fade in/out, Cormorant italic, tinted
  by voice. Title card during the intro; end card at the tail.
- 60 fps; fonts via `delayRender`/`continueRender`.

### 5.4 Effect systems (reusable Remotion components, procedural — no external footage)

`SceneLayer` (Ken Burns + grade + crossfade) · `NeonRain` · `Fog` (volumetric drift) ·
`Embers`/`Ash` particles · `Grain` · `Scanlines` · `Vignette` · `GiltFrame` overlay ·
`WireframeReveal` (animated mask between painterly image and a procedural edge/posterize+cyan
"wireframe" pass via SVG filters) · `RGBSplit` (chromatic offset) · `Glitch` (slice-displacement +
`feDisplacementMap` + scanline jitter, seeded per frame — the datamosh approximation) ·
`RecursionFeedback` (nested scaled copies of a layer, decreasing opacity + cyan tint — the recursion
tunnel) · `Bloom`/`Blowout`. Effects escalate across the film (subtle → catastrophic at S20 → calm).

### 5.5 True AI video — optional hero upgrade (S6, S20)

If the Gemini key has **Veo** access (`ai.models.generateVideos`, image-to-video from the generated
still), upgrade S6 and S20 to real moving footage muxed into the scene track. If unavailable, the
procedural motion in 5.4 already makes every scene live — **no hard dependency.** Verified at build.

### 5.6 Audio & render

- **Audio (authoritative):** encode AAC-LC **from the WAV master** —
  `-c:a aac -b:a 384k -ar 48000 -ac 2` (YouTube's max). A lossless FLAC copy lives in `public/` for
  Remotion's sync/preview only.
- **Render:** Remotion renders the H.264 video (1920×1080 / 60fps / `-crf` high quality / yuv420p).
  A final `ffmpeg` step muxes the video with the AAC-from-WAV audio
  (`-map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 384k -ar 48000 -ac 2 -movflags +faststart`),
  guaranteeing the audio is encoded straight from the master. Filenames with spaces are safely
  quoted (per repo convention).
- **Output:** `renders/AntiNativity/06 - The Recursion of Ash and Lightning.mp4`.

## 6. Build phases (detailed in the implementation plan)

1. Scaffold `src/AntiNativity/` + register; copy refs; vendor audio; lrc/voice parser.
2. Image generator script; **generate 3 sample scenes → review**; then all 25 hi-res.
3. Effect-system components; scene track + grade + transitions; lyrics + title/end cards.
4. Wire scenes ↔ timing; full-length preview pass; tune motion/effects/legibility.
5. (Optional) Veo hero upgrade for S6/S20.
6. Render H.264 → AAC-from-WAV mux → final 1080p60 mp4; QC pass.

## 7. Risks & decisions

- **Model id** for "3.5 Flash Image" resolved at run time with a documented fallback chain — not a
  blocker.
- **Cost/time:** 25 hi-res reference-conditioned generations + a 5:48 @ 1080p60 render with heavy
  effects is non-trivial. Mitigated by the 3-sample checkpoint, idempotent generation, and a
  preview pass before the final render.
- **Datamosh authenticity:** true datamosh isn't native to Remotion; we approximate with
  slice-displacement + SVG filters. Acceptable for the look; revisit only if it reads weak.
- **Branching:** implementation happens on a feature branch (`anti-nativity-recursion-video`), not
  `main`.

## 8. Out of scope (YAGNI)

Other *Anti-Nativity* songs; any changes to the landing-page site; reworking the existing
`7thShadow` (Alienation By Design) project; a generic reusable "music-video" framework (build for
this song; generalize later only if a second song is commissioned).

## 9. Success criteria

A finished `06 - The Recursion of Ash and Lightning.mp4` — 1080p60, AAC-384k-from-WAV — in which
the 25 scenes interchange in sync with the song, characters are recognizably Talciron/Ophelia
(from the references) staged into scenes (not pasted portraits), lyrics are legible and
voice-tinted, the effects escalate to the SIGSEGV and resolve into ash, and the whole reads as the
single coherent "Illuminated, then Rendered" art direction.

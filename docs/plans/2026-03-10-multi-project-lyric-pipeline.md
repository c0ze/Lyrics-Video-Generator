# Multi-Project Lyric Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generalize the lyric video pipeline so multiple artists and albums can coexist in one Remotion project and one shell render pipeline.

**Architecture:** Introduce a generic lyric-video composition and a project registry that can register multiple album manifests. Keep album track lists as JSON manifests under their own source folders, and make the shell scripts resolve manifests by project id instead of a single hardcoded album path.

**Tech Stack:** Remotion, React, TypeScript, Bash, `jq`, `ffprobe`, `ffmpeg`

---

### Task 1: Add generic lyric-video primitives

**Files:**
- Create: `src/lyricVideo/types.ts`
- Create: `src/lyricVideo/lyrics.ts`
- Create: `src/lyricVideo/Composition.tsx`

**Step 1:** Define generic project, track, theme, and composition prop types.

**Step 2:** Move reusable LRC parsing and duration logic into a generic helper module.

**Step 3:** Extract the current Seventh Shadow visual implementation into a reusable lyric-video component that accepts theme and artist props.

### Task 2: Register multiple projects

**Files:**
- Modify: `src/7thShadow/tracks.ts`
- Create: `src/Pagan/Acolytes/tracks.json`
- Create: `src/Pagan/Acolytes/tracks.ts`
- Create: `src/projects.ts`
- Modify: `src/Root.tsx`

**Step 1:** Convert Seventh Shadow exports into a project definition.

**Step 2:** Add a real Pagan/Acolytes manifest based on the files in `public/Pagan/Acolytes/`.

**Step 3:** Build a shared project registry and have `Root.tsx` register compositions for every project in the registry.

### Task 3: Make the shell pipeline project-aware

**Files:**
- Modify: `scripts/render-track.sh`
- Modify: `scripts/render-album.sh`

**Step 1:** Add `--project <project-id>` parsing to both scripts with `7thShadow` as the default.

**Step 2:** Resolve manifests from `src/<project-id>/tracks.json`.

**Step 3:** Preserve safe path handling and keep final filenames as `NN - Title.mp4`.

### Task 4: Update docs and verify

**Files:**
- Modify: `README.md`

**Step 1:** Rewrite the README around multi-project usage and document the new `--project` flag.

**Step 2:** Run `npm run lint`.

**Step 3:** Run one render-oriented verification command to confirm the new project registry resolves both albums.

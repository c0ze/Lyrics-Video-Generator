# Agent Instructions

## Package Manager
- Use `npm`: `npm install`, `npm run dev`, `npm run lint`

## File-Scoped Commands
| Task | Command |
|------|---------|
| Lint file | `npx eslint src/path/to/file.tsx` |
| Typecheck project | `npx tsc --noEmit` |
| List compositions | `npx remotion compositions src/index.ts` |
| Render one track | `./scripts/render-track.sh --project <project-id> <track-id>` |

## Commit Attribution
- AI commits MUST include:
```text
Co-Authored-By: Codex GPT-5 <noreply@openai.com>
```

## Key Conventions
- Multi-project registry lives in [src/projects.ts](/Users/arda/projects/Lyrics-Video-generator/src/projects.ts).
- Each album keeps its track manifest in `src/<project>/tracks.json`.
- Keep track assets under matching `public/<project>/...` paths.
- Do not duplicate lyric text into TypeScript; lyrics stay in tracked `.lrc` files.
- Do not delete `src/PaganIntro.tsx`; it remains a test board outside the album pipeline.
- Composition IDs must stay colon-free and stable, e.g. `SeventhShadow-01`, `PaganAcolytes-01`.
- Preserve safe shell quoting for filenames and output paths with spaces.

## Render Pipeline
- `scripts/render-track.sh` and `scripts/render-album.sh` accept `--project <project-id>`.
- Default project is `7thShadow` when `--project` is omitted.
- Final outputs must be named `NN - Title.mp4`, matching the manifest title.

## Available Projects
- `7thShadow`
- `Pagan/Acolytes`

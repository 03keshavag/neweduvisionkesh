# EduVision Video Generator

AI-powered, multilingual cultural learning video generator.
**Module owner:** Keshava — AI + Video Generation Lead.

## Pipeline

```
Topic + language
      ↓
Groq AI            (src/groq)      → structured educational lesson JSON
      ↓
Lesson processing  (src/lesson)    → validate/normalize lesson into scenes
      ↓
TTS / narration    (src/audio)     → per-scene narration audio
      ↓
Remotion           (src/remotion)  → animated educational video
      ↓
Renderer           (src/renderer)  → headless MP4 render & export
```

## Scope

This project is only the **AI + video generation module** of EduVision.
It does **not** include the frontend, community system, quiz system,
MIL verification system, authentication, database, or deployment.

## Status

- Initial project scaffold (Node.js + TypeScript + React + Remotion) ✅
- Groq lesson-generation system: `groq/` + `lesson/` ✅
  - Strict JSON output, validated with Zod before anything else sees it
  - Malformed JSON, missing fields, invalid scene durations, unsupported
    languages are rejected; `estimatedDuration` is normalized to the scene sum
- Reusable Remotion video engine ✅
  - `LessonVideo` — data-driven 1920×1080 composition (duration derives from the lesson)
  - Six scene templates presenting information in animated blocks/cards
  - Verified with Mysuru Dasara (Kannada), Silk Road (English), etc.
- TTS narration (`src/audio`) + audio embedded into the MP4 ✅
- End-to-end website (`src/server` + `public`) ✅
  - Form (topic/language/age) → Groq → TTS → Remotion → MP4 → inline player
  - Live progress **with elapsed time / ETA** shown on the page
  - Loading + human-readable error states

## Run the website

```bash
npm install
cp .env.example .env   # add GROQ_API_KEY (from https://console.groq.com/keys)
npm run serve          # starts http://localhost:4000
```

Open http://localhost:4000, enter a topic, pick a language and age group,
click **Generate Lesson**. The page shows live progress + time; when the MP4 is
ready it plays directly on the same page (with audio).

Other commands:
```bash
npm run studio                # Remotion preview (sample lesson)
npm run test:lesson           # generate a lesson to stdout (needs GROQ_API_KEY)
npm run typecheck
```

> If `GROQ_API_KEY` is missing, the pipeline uses a built-in mock lesson so the
> website → TTS → render → player flow can still be tested end-to-end.

## Project structure

```
src/
  groq/        ── Groq AI integration (lesson JSON generation) ✅
  lesson/      ── lesson schema + parser + validation ✅
  remotion/
    scenes/    ── reusable scene templates (Intro/Explanation/Image/Timeline/Fact/Outro)
    components/─ reusable visual components (AnimatedText, Subtitle, SceneImage…)
    animations/─ reusable animation utilities (fade, slide, scale, spring)
    LessonVideo.tsx   ── the data-driven composition
    sceneRegistry.ts  ── maps lesson scene type → scene component
    sampleLesson.ts   ── dev-only sample Lesson for preview
    Root.tsx          ── composition registry
  audio/       ── TTS / narration — future
  renderer/    ── headless MP4 rendering logic — future
  utils/       ── shared utilities
public/
  images/ audio/ fonts/ assets/   ── static assets for compositions
output/
  videos/ audio/ temporary/       ── generated media (gitignored)
```

## Preview the video engine

The composition is registered with a dev-only sample lesson (Mysuru Dasara in
Kannada) so the preview works without an API key.

```bash
npm run studio          # interactive Remotion Studio (hot reload)
npm run render:verification   # renders output/videos/verification.mp4 (84s)
npm run typecheck       # TypeScript check
```

> **Reusability:** the engine is fully data-driven. Rendering any other lesson
> means only swapping the `Lesson` object — e.g.
> `npx remotion still src/index.ts LessonVideo out.png --frame=240 --props="./my-lesson.json"`
> where the file contains `{ "lesson": { … } }`. No scene code changes.

## Environment variables (`.env`)

| Variable          | Description                      |
| ----------------- | -------------------------------- |
| `GROQ_API_KEY`    | Groq API key (required for generation) |
| `GROQ_MODEL`      | Optional model override (default `llama-3.3-70b-versatile`) |

## Generate a lesson

```bash
# Requires GROQ_API_KEY in .env
npm run test:lesson            # "Explain Mysuru Dasara in Kannada"
```

The generator accepts `{ topic, language, ageGroup? }` and returns a validated
`Lesson` (see `src/lesson/lessonTypes.ts` / `lessonSchema.ts`) that the TTS
and Remotion stages can consume directly.

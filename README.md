# EduVision Video Generator

AI-powered, multilingual cultural learning video generator.
**Module owner:** Keshava — AI + Video Generation Lead.

## Pipeline

```
Topic + language
      ↓
Groq AI            (src/groq)      → flexible AnimationPlan (elements + animations)
                                      (legacy structured lesson as fallback)
      ↓
Plan validation    (src/engine/plans) → tolerant Zod schema + normalization
      ↓
TTS / narration    (src/audio)     → per-scene narration audio
      ↓
Audio sync         (src/audio/mp3Duration + src/engine/timeline)
                                    → master timeline (frames match narration)
      ↓
Remotion           (src/engine)    → animated explainer (blocks, arrays, pointers,
                                      arrows, callouts) → EduVisionVideo MP4
```

> The flexible engine **produces videos in the style of a hand-built explainer
> (array blocks, LOW/MID/HIGH pointers, process cards, equations, physics
> diagrams)** — driven entirely by Groq's structured `AnimationPlan`, so ANY
> topic renders rich animations instead of a fixed slideshow. **Video length is
> flexible — it follows the topic and the real narration** (small topics
> ~20-40 s, rich topics up to ~2 minutes; nothing is padded or force-cut).
> Every plan is auto-enriched with section labels, decorative shapes and
> entrance animations, narration is never clipped (audio headroom), and if the
> plan still fails validation it falls back to the legacy strict-lesson engine
> so a video is always produced.

## Scope

This project is only the **AI + video generation module** of EduVision.
It does **not** include the frontend, community system, quiz system,
MIL verification system, authentication, database, or deployment.

## Status

- Initial project scaffold (Node.js + TypeScript + React + Remotion) ✅
- **Flexible animation engine** `src/engine` ✅ (NEW — produces videos like a
  hand-made explainer, driven by Groq's `AnimationPlan` JSON)
  - ~40 reusable primitives: array blocks, pointers, equations, numbers line,
    code blocks, physics objects/arrows, waves, info/step cards, progress-task
    lists, …
  - KINETIC animation engine: spring/bounce/blur entrances, cascade timing,
    move / pan / scale / zoom / rotate / morph / highlight / updateValue /
    drawArrow / hide actions, continuous idle motion (float/breathe/pulse),
    per-scene camera drift, floating particles, punchy transitions
  - AUTOMATIC CANVAS LAYOUT: every scene is clamped inside safe bounds
    (cleared of labels/narration/footer), overlapping blocks are pushed apart,
    and connector ARROWS are auto-drawn between related blocks in every scene
  - Audio-synced master timeline; every scene fully animated by default
  - Verified end-to-end: Groq plan → TTS → audio sync → MP4 (`scripts/e2e-flexible.ts`)
  - Registered composition `EduVisionVideo` (binary-search demo as defaultProps)
- Groq plan generator: `groq/planGenerator` + tolerant Zod validation
  (`engine/plans/planSchema`) with legacy-lesson fallback
- Groq lesson-generation system: `groq/` + `lesson/` ✅ (fallback engine)
  - Strict JSON output, validated with Zod before anything else sees it
  - Malformed JSON, missing fields, invalid scene durations, unsupported
    languages are rejected; `estimatedDuration` is normalized to the scene sum
- Reusable Remotion video engine ✅
  - `LessonVideo` — legacy data-driven 1920×1080 composition
  - Six scene templates presenting information in animated blocks/cards
- TTS narration (`src/audio`) + audio embedded into the MP4 ✅
- End-to-end website (`src/server` + `public`) ✅
  - Form (topic/language/age) → Groq → TTS → Remotion → MP4 → inline player
  - Live progress **with elapsed time / ETA** shown on the page (plan/lesson/tts/render stages)
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
npm run studio                # Remotion Studio preview (flexible demo + sample lesson)
npm run render:demo           # render the flexible binary-search demo → output/videos/flexible-demo.mp4
npm run test:plan             # generate a flexible AnimationPlan to stdout (needs GROQ_API_KEY)
npm run test:lesson           # generate a legacy lesson to stdout (needs GROQ_API_KEY)
npm run verify:flexible       # unit-checks the MP3 parser, plan schema, timeline, mock plan
npm run e2e:flexible          # full pipe: Groq plan → TTS → audio sync → MP4 (needs GROQ_API_KEY)
npm run typecheck
```

> If `GROQ_API_KEY` is missing, the pipeline uses a built-in mock plan (or mock
> lesson) so the website → TTS → render → player flow can still be tested
> end-to-end.

## Project structure

```
src/
  engine/      ── FLEXIBLE ANIMATION ENGINE ✅
    types/     ── AnimationPlan / element / animation instruction types
    plans/     ── tolerant Zod schema + normalization (planSchema.ts)
    primitives/─ reusable rendered blocks (array, pointer, cards, shapes, math, physics, cs, text)
    renderer/  ── CompositionRenderer + SceneRenderer (EduVisionVideo MP4)
    timeline/  ── master timeline builder (audio-synced frame layout)
    transitions/─ scene fade/slide/zoom/camera
    demos/     ── binary-search demo plan (the default preview)
  groq/        ── Groq AI integration (plan + legacy lesson generators, prompts)
  lesson/      ── legacy lesson schema + parser + validation (fallback engine) ✅
  remotion/
    scenes/    ── legacy scene templates (Intro/Explanation/Image/Timeline/Fact/Outro)
    components/─ reusable visual components (AnimatedText, Subtitle, SceneImage…)
    Root.tsx   ── composition registry (EduVisionVideo + LessonVideo)
  audio/       ── TTS / narration + pure-Node MP3 duration parser ✅
  renderer/    ── shared programmatic MP4 renderer + pipeline entry (generateVideo) ✅
scripts/
  e2e-flexible.ts / verify-flexible.ts   ── dev verification scripts
public/        ── vanilla website (form → jobs → inline player)
output/
  videos/ audio/      ── generated media (gitignored)
```

## Preview the video engine

Two compositions are registered so the preview works without an API key:

- **`EduVisionVideo`** — the flexible engine, defaultProps hold the binary-search
  demo (array blocks, LOW/MID/HIGH pointers, eliminated cells, step cards).
- **`LessonVideo`** — the legacy engine, defaultProps hold the Mysuru Dasara
  sample lesson (Kannada).

```bash
npm run studio          # interactive Remotion Studio (both compositions)
npm run render:demo     # renders output/videos/flexible-demo.mp4 (binary search, ~36s)
npm run render:verification   # renders the legacy sample lesson (84s)
npm run typecheck       # TypeScript check
```

> **Flexible engine input:** a video is fully described by an `AnimationPlan`
> JSON (scenes → elements → timed animations) — no code changes per topic. The
> demo plan lives at `src/engine/demos/binarySearchDemo.ts`.

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

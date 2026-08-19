# PolyYaps

PolyYaps is a mobile-first Progressive Web App for learning European Portuguese in 30 days. It combines active speaking, listening, practical travel/work scenarios, spaced repetition, progress tracking and calm, travel-oriented gamification.

## V1.0

PolyYaps V1.0 is the first complete webapp release.

- All **30 days** are playable.
- Normal days use one generic lesson engine: vocabulary → active recall → chunks → listening → microgrammar → speaking → test → result.
- Checkpoints on Days **5, 10, 15, 20, 25, 29 and 30** use practical scenario challenges.
- Item-level mastery is stored in IndexedDB with strength 0–100, mastery level 0–4 and automatic review dates.
- Smart Review prioritizes due/weak items and surfaces recurring language patterns.
- pt-PT playback uses browser speech synthesis; speaking exercises use browser speech recognition when available and fall back to guided self-assessment when it is not.
- XP, streaks, freezes, named levels, achievements and the Passaporte Português are functional.
- Course progress can be exported/imported as a local JSON backup.
- The PWA has a manifest, standalone Home Screen metadata and an offline service-worker app shell.
- GitHub Actions verifies `tsc -b && vite build`.
- A GitHub Pages deployment workflow is included for static hosting.

## Stack

- React
- TypeScript
- Vite
- IndexedDB for mastery/review data
- localStorage for compact course progress
- Web Speech APIs as progressive enhancement
- Service Worker + Web App Manifest

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Course content

The human-readable curriculum remains the editorial source of truth:

- `content/lessons/days-01-10.md`
- `content/lessons/days-11-20.md`
- `content/lessons/days-21-30.md`

Typed playable content lives under `src/data/`.

## Key application files

- `src/App.tsx` — app shell and routing between learning modes
- `src/components/LessonOverlayV1.tsx` — final generic lesson player
- `src/components/ScenarioChallengeOverlay.tsx` — generic checkpoint player
- `src/components/SmartReviewOverlay.tsx` — adaptive review
- `src/components/SpeechPractice.tsx` — speaking practice and fallback
- `src/lib/learningDb.ts` — mastery and spaced repetition
- `src/lib/progress.ts` — course progress, XP and streaks
- `src/lib/gamification.ts` — levels, achievements and passport
- `src/lib/dataPortability.ts` — backup/import/reset
- `public/sw.js` — offline app shell

## Documentation

- `docs/01-masterplan-stap-1-tm-5.md` — curriculum, learning method and gamification model
- `docs/06-app-design.md` — UX and visual system
- `docs/07-technical-architecture.md` — architecture
- `docs/09-v0.2-day1.md` — first playable lesson
- `docs/10-v0.3-learning-engine.md` — mastery/SRS engine
- `docs/11-v0.4-survival-phase.md` — Days 3–5
- `docs/12-v0.5-phase-two-gamification.md` — Days 6–10
- `docs/13-v1-release.md` — V0.6 through V1.0 release notes and known limitations

## Release history

1. ✅ V0.1 — app shell and navigation
2. ✅ V0.2 — first complete lesson
3. ✅ V0.3 — mastery, spaced repetition and Smart Review
4. ✅ V0.4 — Days 3–5 and Café Challenge
5. ✅ V0.5 — Days 6–10, Meet a Local and gamification
6. ✅ V0.6 — pt-PT speaking/listening progressive enhancement
7. ✅ V0.7 — installable/offline PWA foundation
8. ✅ V0.8 — full 30-day typed curriculum
9. ✅ V1.0 — QA, backup/import, final checkpoints and static deployment pipeline

## Known limitation

Speech recognition support differs between browsers and devices. PolyYaps therefore never makes microphone recognition a hard dependency: when it is unavailable, speaking practice remains usable through pt-PT playback and self-assessment. A future hosted version could replace this with a dedicated speech/pronunciation service and professionally recorded native pt-PT audio.

# PolyYaps

PolyYaps is a mobile-first Progressive Web App for learning European Portuguese in 30 days, with a strong focus on active speaking, listening, practical travel/work scenarios, spaced repetition, progress tracking, and gamification.

## Product direction

- Platform: PWA first, native iOS only if needed later
- Stack: React + TypeScript + Vite
- Storage: IndexedDB/local-first in V1
- Learning: data-driven lessons, mastery tracking, spaced repetition, Smart Review
- Gamification: XP, streaks, levels, stars, achievements, passport stamps, boss challenges
- UX direction: Airbnb-modern, warm, premium, travel-oriented

## Documentation

- `docs/01-masterplan-stap-1-tm-5.md` — learning goals, curriculum, learning method, testing, progress and gamification
- `docs/06-app-design.md` — information architecture, wireframes, visual identity and high-fidelity UI specification
- `docs/07-technical-architecture.md` — technical architecture and implementation roadmap

## Development

Requires Node 20 or newer.

```bash
npm install
npm run dev               # development server
npm run build             # typecheck + production build
npm run preview           # serve the production build
npm run typecheck         # types only
npm run build:content     # regenerate lesson data from content/lessons/*.md
npm run validate:content  # check the course content and generated data
npm run check             # validate content, then typecheck and build
```

The design reference viewport is 390 × 844 (iPhone). On wider screens the app
renders as a centred mobile column so the reference layout stays honest during
desktop development.

## Course content

`content/lessons/*.md` is the editorial source of truth for all 30 days. The app
never reads that Markdown: `npm run build:content` converts it into typed data
under `src/content/pt-PT/days/`, which is committed.

After editing a lesson, run `npm run build:content` and commit the regenerated
files. `npm run validate:content` fails if they are out of date, if an item is
missing a translation, if ids collide, or if a Brazilian form slips into the
European Portuguese course.

The parser is strict on purpose: an unrecognised `###` heading stops the build
rather than silently dropping material.

## Current status — V0.1 app shell + course content

The shell is in place with real navigation, the full design system and the
complete 30-day curriculum wired in: every day renders its own modules, words,
chunks, grammar notes, speaking assignments and checkpoint challenges from the
editorial content.

Still missing: exercises and answer checking, audio, the learning engines
(mastery, review, XP, streaks) and persistence — progress is still mock data.
Screens that will hold those show a placeholder block naming the version that
fills them in.

What exists:

- **Explore mode** (`AppShell`) with the four persistent tabs — Home, Learn,
  Review, Progress — plus Vocabulary, Passport, Achievements and Settings
- **Focus mode** (`FocusShell`) for the lesson detail, module player, daily
  result and boss challenges, with no bottom navigation
- **Design tokens** from `docs/06-app-design.md` as CSS custom properties in
  `src/styles/tokens.css`, referenced by every component
- **Course data** — all 30 days generated from the editorial Markdown: 560
  learning items across words and chunks, plus grammar notes, speaking
  assignments and the six boss challenges. A day's module list follows from its
  content rather than a fixed template.
- **Type contracts** for content and progress, matching sections 5–7 of the
  technical architecture
- **Mock progress** behind a `ProgressProvider`, so V0.3 can swap in an
  IndexedDB repository without touching screens
- **PWA manifest** and icons (the service worker follows in V0.7)

### Source layout

```text
content/lessons/       editorial Markdown, source of truth for the course
scripts/               content pipeline (build + validate)
src/
├── components/
│   ├── layout/        AppShell, FocusShell, TopBar, BottomNavigation
│   ├── ui/            Icon, Button
│   ├── cards/         DailyLessonCard, ActionCard, StatCard, DayCard
│   ├── progress/      ProgressBar, SkillBar
│   └── gamification/  StreakIndicator, XPIndicator, Stars
├── content/pt-PT/     course structure, module labels, generated days/
├── hooks/             useProgress (progress read model)
├── mock/              placeholder progress data for the shell
├── screens/           one directory per screen
├── styles/            tokens, global, utilities
└── types/             content and progress contracts
```

## Roadmap

1. ✅ V0.1 — app shell, Home, navigation, learning path
2. V0.2 — Lesson Player: content pipeline and all 30 days wired in; exercises,
   answer checking and feedback states still to come
3. V0.3 — local persistence with IndexedDB
4. V0.4 — mastery, Smart Review and spaced repetition
5. V0.5 — XP, streaks, levels and Passport
6. V0.6 — audio and speaking
7. V0.7 — offline PWA
8. V0.8 — full 30-day content
9. V1.0 — iPhone polish, QA and export/import

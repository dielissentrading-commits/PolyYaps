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
npm run dev        # development server
npm run build      # typecheck + production build
npm run preview    # serve the production build
npm run typecheck  # types only
```

The design reference viewport is 390 × 844 (iPhone). On wider screens the app
renders as a centred mobile column so the reference layout stays honest during
desktop development.

## Current status — V0.1 app shell

The shell is in place: real navigation, the full design system and mock
progress data. Lesson content, engines and persistence are not implemented yet;
screens that will hold them show a placeholder block saying which version fills
them in.

What exists:

- **Explore mode** (`AppShell`) with the four persistent tabs — Home, Learn,
  Review, Progress — plus Vocabulary, Passport, Achievements and Settings
- **Focus mode** (`FocusShell`) for the lesson detail, module player, daily
  result and boss challenges, with no bottom navigation
- **Design tokens** from `docs/06-app-design.md` as CSS custom properties in
  `src/styles/tokens.css`, referenced by every component
- **Course data** — the 30-day curriculum outline and the fixed seven-module
  lesson sequence as data, not hardcoded UI
- **Type contracts** for content and progress, matching sections 5–7 of the
  technical architecture
- **Mock progress** behind a `ProgressProvider`, so V0.3 can swap in an
  IndexedDB repository without touching screens
- **PWA manifest** and icons (the service worker follows in V0.7)

### Source layout

```text
src/
├── components/
│   ├── layout/        AppShell, FocusShell, TopBar, BottomNavigation
│   ├── ui/            Icon, Button
│   ├── cards/         DailyLessonCard, ActionCard, StatCard, DayCard
│   ├── progress/      ProgressBar, SkillBar
│   └── gamification/  StreakIndicator, XPIndicator, Stars
├── content/pt-PT/     course outline and lesson module definitions
├── hooks/             useProgress (progress read model)
├── mock/              placeholder progress data for the shell
├── screens/           one directory per screen
├── styles/            tokens, global, utilities
└── types/             content and progress contracts
```

## Roadmap

1. ✅ V0.1 — app shell, Home, navigation, learning path
2. V0.2 — Day 1 and Lesson Player
3. V0.3 — local persistence with IndexedDB
4. V0.4 — mastery, Smart Review and spaced repetition
5. V0.5 — XP, streaks, levels and Passport
6. V0.6 — audio and speaking
7. V0.7 — offline PWA
8. V0.8 — full 30-day content
9. V1.0 — iPhone polish, QA and export/import

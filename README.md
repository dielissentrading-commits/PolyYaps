# PolyYaps

PolyYaps is a mobile-first Progressive Web App for learning European Portuguese in 30 days, with a strong focus on active speaking, listening, practical travel/work scenarios, spaced repetition, progress tracking, and gamification.

## Product direction

- Platform: PWA first, native iOS only if needed later
- Stack: React + TypeScript + Vite
- Storage: IndexedDB/local-first in V1
- Learning: data-driven lessons, mastery tracking, spaced repetition, Smart Review
- Gamification: XP, streaks, levels, stars, achievements, passport stamps, boss challenges
- UX direction: Airbnb-modern, warm, premium, travel-oriented

## Course content

The complete human-readable European Portuguese course material lives in `content/`.

- `content/README.md` — content model and source-of-truth notes
- `content/lessons/days-01-10.md` — survival Portuguese and talking about yourself
- `content/lessons/days-11-20.md` — travel, past tense, future and plans
- `content/lessons/days-21-30.md` — social Portuguese, work, integration and final challenge

These Markdown files are the editorial source of truth and can later be converted into typed lesson data for the application.

## Documentation

- `docs/01-masterplan-stap-1-tm-5.md` — learning goals, curriculum, learning method, testing, progress and gamification
- `docs/06-app-design.md` — information architecture, wireframes, visual identity and high-fidelity UI specification
- `docs/07-technical-architecture.md` — technical architecture and implementation roadmap

## Roadmap

1. V0.1 — app shell, Home, navigation, learning path
2. V0.2 — Day 1 and Lesson Player
3. V0.3 — local persistence with IndexedDB
4. V0.4 — mastery, Smart Review and spaced repetition
5. V0.5 — XP, streaks, levels and Passport
6. V0.6 — audio and speaking
7. V0.7 — offline PWA
8. V0.8 — full 30-day content
9. V1.0 — iPhone polish, QA and export/import

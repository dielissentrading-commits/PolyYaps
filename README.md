# PolyYaps

PolyYaps is a mobile-first Progressive Web App for learning European Portuguese in 30 days, with a strong focus on active speaking, listening, practical travel/work scenarios, spaced repetition, progress tracking, and gamification.

## Product direction

- Platform: PWA first, native iOS only if needed later
- Stack: React + TypeScript + Vite
- Storage: local-first; IndexedDB for mastery and localStorage for compact course progress in the current prototype
- Learning: data-driven lessons, item-level mastery, spaced repetition, Smart Review
- Gamification: XP, streaks, levels, stars, achievements, passport stamps, boss challenges
- UX direction: Airbnb-modern, warm, premium, travel-oriented

## Current prototype

V0.3 is the current implementation milestone.

- Dag 1 is fully playable.
- Dag 2 is fully playable through the same generic lesson engine.
- Every learned word/chunk receives a mastery record with strength 0–100 and mastery level 0–4.
- Review dates are scheduled automatically.
- Smart Review mixes recognition, active recall and listening.
- Home, Review and Progress use real local mastery data.

## Course content

The complete human-readable European Portuguese course material lives in `content/`.

- `content/README.md` — content model and source-of-truth notes
- `content/lessons/days-01-10.md` — survival Portuguese and talking about yourself
- `content/lessons/days-11-20.md` — travel, past tense, future and plans
- `content/lessons/days-21-30.md` — social Portuguese, work, integration and final challenge

These Markdown files are the editorial source of truth. Playable lessons are converted into typed data under `src/data/`.

## Documentation

- `docs/01-masterplan-stap-1-tm-5.md` — learning goals, curriculum, learning method, testing, progress and gamification
- `docs/06-app-design.md` — information architecture, wireframes, visual identity and high-fidelity UI specification
- `docs/07-technical-architecture.md` — technical architecture and implementation roadmap
- `docs/09-v0.2-day1.md` — first complete playable lesson
- `docs/10-v0.3-learning-engine.md` — item mastery, IndexedDB, review scheduling and generic lessons

## Roadmap

1. ✅ V0.1 — app shell, Home, navigation, learning path
2. ✅ V0.2 — Day 1 and first real lesson flow
3. ✅ V0.3 — IndexedDB mastery, spaced repetition, Smart Review and Day 2
4. V0.4 — Day 3–5, weakness categories and first Café Challenge
5. V0.5 — deeper gamification: levels, Passport, achievements and anti-XP-farming
6. V0.6 — recorded pt-PT audio and automatic speaking assessment
7. V0.7 — full offline PWA and install polish
8. V0.8 — all 30 days converted to structured app data
9. V1.0 — iPhone polish, QA, import/export and release candidate

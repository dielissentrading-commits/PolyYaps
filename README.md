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

## Running the app

Requires Node 20.19+ or 22.12+ (`node -v` to check).

```bash
git clone https://github.com/dielissentrading-commits/PolyYaps.git
cd PolyYaps
git checkout claude/app-shell-prototype-1avlcz
npm install
npm run dev
```

Open the printed `localhost` address. The dev server also listens on the local
network, so the `Network:` address opens the app on a phone on the same wifi.

To try it the way it ships — service worker, offline, install prompt — build it
first:

```bash
npm run build
npm run preview
```

Installing to the home screen needs `localhost` or HTTPS. Over a plain
`http://192.168.x.x` address the app runs but the service worker will not
register, so offline and installing stay unavailable until it is served over
HTTPS.

## Development

```bash
npm run dev               # development server
npm run build             # typecheck, build, generate the service worker
npm run preview           # serve the production build
npm run typecheck         # types only
npm run test              # engine and storage tests
npm run build:content     # regenerate lesson data from content/lessons/*.md
npm run validate:content  # check the course content and generated data
npm run check             # validate content, run tests, then build
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

## Current status — V1.0

All twelve V1 success criteria from `docs/07-technical-architecture.md` §28 are
met, verified by driving the built app in a browser: install and service
worker, today's lesson, a full lesson end to end, pt-PT audio, speaking
practice, listening without text, XP and streak, per-item mastery, the right
Smart Review items the next day, the course offline, progress/passport/
challenges, and progress export.

What the app does:

- **Learns.** Each day runs its own modules — words, chunks, listening,
  micro-grammar, speaking, daily test — generated from the editorial content.
  Study a small batch, then retrieve it; recognition for new material, active
  production for anything seen before.
- **Corrects calmly.** A missing accent is an "almost" with a hint, not a
  mistake. A wrong answer shows both answers, offers the audio again and a
  mark-for-later, and never blocks progress.
- **Remembers.** Every answer runs through the mastery engine and is scheduled
  for review. Progress lives in IndexedDB behind a repository layer.
- **Comes back.** Smart Review builds a queue weakest-first, varied across
  categories, and picks the exercise that matches each item's mastery.
- **Rewards effort.** XP, streaks with freezes, stars, levels, ten achievements
  and eight passport stamps, all driven by real completions.
- **Speaks and listens.** Device speech synthesis until recorded pt-PT audio
  exists, microphone recording with playback and self-assessment behind a
  SpeechService interface a remote evaluator can replace.
- **Works offline.** Service worker with a content-hashed precache, self-hosted
  Manrope, and deep links that open offline.
- **Backs up.** JSON export and import of every store, with the import
  validated before anything is overwritten.

Known gaps:

- No recorded pt-PT audio assets yet: pronunciation comes from the device
  voice, whose quality varies by platform.
- Speaking is self-assessed. The interface for automatic evaluation exists but
  no provider is wired to it.
- The curriculum is thinner than the masterplan targets — 338 words against
  ~450, 222 chunks against ~250. `npm run validate:content` warns about this;
  closing the gap means adding material to `content/lessons/`.
- Weakness categories are defined and the engine works, but no content item is
  tagged with one yet, so Today's Focus never fires.

### Accessibility

Text meets WCAG AA. Two palette values are a shade darker than
`docs/06-app-design.md` specifies so they clear 4.5:1 — `--color-primary-dark`
and `--color-muted`, both noted in `src/styles/tokens.css`. The terracotta
identity is unchanged: `--color-primary` still carries it on fills, bars and
icons, where 3:1 is the bar for non-text elements.

### Source layout

```text
content/lessons/       editorial Markdown, source of truth for the course
scripts/               content pipeline (build + validate)
src/
├── audio/             playback provider, recorder, speech service interface
├── components/        layout, ui, cards, learning, progress, gamification, pwa
├── content/pt-PT/     course structure, catalogues, generated days/
├── engine/            answers, exercises, mastery, review, scoring, xp,
│                      streak, weakness, achievements, dates
├── hooks/             useProgress (the single read/write model)
├── pwa/               service worker registration and install prompt
├── screens/           one directory per screen
├── storage/           IndexedDB wrapper, repository, export/import
├── styles/            fonts, tokens, global, utilities
└── types/             content and progress contracts
```

## Roadmap

1. ✅ V0.1 — app shell, Home, navigation, learning path
2. ✅ V0.2 — content pipeline, lesson player, exercises and feedback
3. ✅ V0.3 — local persistence with IndexedDB
4. ✅ V0.4 — mastery, Smart Review and spaced repetition
5. ✅ V0.5 — XP, streaks, levels, achievements and Passport
6. ✅ V0.6 — audio, listening and speaking
7. ✅ V0.7 — offline PWA
8. ✅ V0.8 — all 30 days of content
9. ✅ V1.0 — export/import, accessibility and QA

Next, in rough order of value: recorded pt-PT audio to replace the device
voice, weakness tags on the content so Today's Focus fires, automatic speaking
evaluation behind the existing interface, and filling the curriculum out to the
planned word and chunk counts.

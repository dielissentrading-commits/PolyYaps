# PolyYaps — Stap 7 Technische Architectuur

## 1. Architectural goal

PolyYaps V1 should be:

- mobile-first
- installable as a PWA
- fast on iPhone
- usable offline for the core course
- simple enough to maintain as a solo project
- structured enough to support 30 lessons, hundreds of learning items and adaptive review
- backend-free for the first working version
- prepared for optional cloud sync and AI-assisted speaking later

The architecture deliberately avoids a native iOS codebase in V1.

---

# 2. Recommended stack

## Frontend

**React + TypeScript + Vite**

Why this combination for PolyYaps:

- component-based UI fits the repeated lesson and exercise patterns
- TypeScript makes learning-data and progress-state contracts explicit
- Vite keeps the development setup lightweight
- the codebase can still be shipped as a normal static web application / PWA

## Styling

**Plain CSS + CSS variables + component-level styles**

Avoid a large UI framework in V1.

Reasons:

- PolyYaps already has its own compact design system
- fewer dependencies
- easier control over the Airbnb-modern visual direction
- design tokens can map directly to CSS custom properties

## Routing

Use a lightweight client-side router.

Suggested routes:

```text
/
/learn
/lesson/:day
/lesson/:day/:module
/review
/progress
/progress/vocabulary
/passport
/achievements
/challenge/:id
/settings
```

## Local database

**IndexedDB**, accessed through a small repository layer.

A helper library such as Dexie may be used to simplify IndexedDB operations.

Do not use `localStorage` as the main progress database.

`localStorage` may be reserved for trivial UI preferences if useful.

---

# 3. No backend in V1

The first working version should not require:

- accounts
- login
- remote database
- server
- subscription system
- cloud sync

All course content ships with the application and all personal learning progress remains local on the device.

Benefits:

- simpler development
- offline core experience
- no authentication work
- no database hosting
- no user-data infrastructure required for the prototype

A backend can be added later behind clearly defined interfaces.

---

# 4. Repository structure

Recommended structure once implementation begins:

```text
PolyYaps/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
│
├── docs/
│   ├── 01-masterplan-stap-1-tm-5.md
│   ├── 06-app-design.md
│   └── 07-technical-architecture.md
│
├── public/
│   ├── manifest.webmanifest
│   ├── icons/
│   ├── images/
│   └── audio/
│       └── pt-PT/
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── learning/
│   │   ├── progress/
│   │   └── gamification/
│   │
│   ├── screens/
│   │   ├── Home/
│   │   ├── Learn/
│   │   ├── Lesson/
│   │   ├── Review/
│   │   ├── Progress/
│   │   ├── Passport/
│   │   └── Challenge/
│   │
│   ├── content/
│   │   └── pt-PT/
│   │       ├── course.ts
│   │       ├── achievements.ts
│   │       └── days/
│   │           ├── day-01.ts
│   │           ├── day-02.ts
│   │           └── ...
│   │
│   ├── engine/
│   │   ├── mastery.ts
│   │   ├── review.ts
│   │   ├── scoring.ts
│   │   ├── xp.ts
│   │   ├── streak.ts
│   │   └── weakness.ts
│   │
│   ├── storage/
│   │   ├── db.ts
│   │   ├── progressRepository.ts
│   │   └── exportImport.ts
│   │
│   ├── audio/
│   │   ├── playback.ts
│   │   ├── recorder.ts
│   │   └── speechAdapter.ts
│   │
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       └── utilities.css
│
└── tests/
    ├── engine/
    └── content/
```

---

# 5. Course content architecture

Course content must be data, not hardcoded UI.

A lesson screen should render a structured lesson object rather than contain Day 8-specific logic.

Example conceptual structure:

```ts
interface LearningItem {
  id: string;
  type: 'word' | 'chunk' | 'grammar' | 'listening' | 'scenario';
  portuguese: string;
  dutch?: string;
  dayIntroduced: number;
  category: string;
  priority: number;
  example?: string;
  audioPath?: string;
  weaknessCategory?: string;
}

interface LessonDay {
  day: number;
  title: string;
  description: string;
  phase: number;
  checkpoint: boolean;
  modules: LessonModule[];
}
```

This gives two advantages:

1. lesson UI stays reusable
2. the 30-day curriculum can later be edited without rewriting the application

---

# 6. Lesson module model

Normal lesson modules:

```text
review
vocabulary
chunks
listening
grammar
speaking
test
```

Each module should expose:

```text
id
lessonDay
type
estimatedMinutes
items
completionState
score
```

Checkpoint days can replace the normal sequence with a challenge definition.

---

# 7. Progress database model

## User profile

```ts
interface UserProgress {
  currentDay: number;
  totalXP: number;
  level: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  totalLearningMinutes: number;
  lastCompletedDate?: string;
}
```

## Item progress

```ts
interface ItemProgress {
  itemId: string;
  masteryLevel: 0 | 1 | 2 | 3 | 4;
  strength: number;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  lastReviewed?: string;
  nextReview?: string;
  spokenCorrect: number;
  usedSpontaneously: number;
  weaknessCategory?: string;
}
```

## Lesson progress

```ts
interface LessonProgress {
  day: number;
  completed: boolean;
  timeSpentMinutes: number;
  lessonScore: number;
  xpEarned: number;
  stars: 0 | 1 | 2 | 3;
  vocabularyScore?: number;
  listeningScore?: number;
  speakingScore?: number;
  pronunciationScore?: number;
  practicalScore?: number;
}
```

## Achievement progress

```ts
interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}
```

---

# 8. IndexedDB tables

Suggested tables:

```text
userProgress
itemProgress
lessonProgress
achievementProgress
passportStamps
reviewHistory
settings
```

The app should expose database access through repository functions rather than allowing components to query IndexedDB directly.

Example:

```text
UI
 ↓
progressRepository
 ↓
IndexedDB
```

This makes later migration to cloud sync much easier.

---

# 9. Mastery engine

Mastery and strength remain separate concepts.

## Mastery levels

```text
0 New
1 Recognised
2 Recalled
3 Produced
4 Active
```

## Strength

Continuous score:

```text
0–100
```

Exercise evidence receives different weights:

```text
PT → NL recognition       1
NL → PT production        2
Listening comprehension   2
Sentence production       3
Spoken production         3
Context response          4
Spontaneous conversation  5
```

The exact tuning constants should live in configuration rather than be scattered through UI components.

Example:

```ts
const EXERCISE_WEIGHTS = {
  recognition: 1,
  production: 2,
  listening: 2,
  sentence: 3,
  speaking: 3,
  context: 4,
  spontaneous: 5,
};
```

---

# 10. Review engine

Base review pattern:

```text
introduced
+1 day
+3 days
+7 days
+14 days
+30 days
```

But the actual next review date is adapted using:

- correctness
- current strength
- exercise difficulty
- repeated mistakes
- mastery level
- time since last review

## Initial V1 rule set

A deliberately simple implementation is preferable to an opaque algorithm.

Indicative intervals:

```text
strength < 30       → 1 day
30–49               → 3 days
50–69               → 7 days
70–84               → 14 days
85+                  → 30 days
```

Incorrect answers:

- lower strength
- schedule earlier review
- increment weakness-category count

Correct active-production answers should increase strength more than recognition answers.

---

# 11. Smart Review generation

When the user opens Review:

1. get all due items
2. sort weak / overdue items first
3. limit duplicates from the same category
4. choose the strongest suitable exercise type for the current mastery level
5. mix vocabulary, chunks, listening and contextual production

Example logic:

```text
mastery 0–1 → recognition + basic recall
mastery 2   → production + listening
mastery 3   → context + speaking
mastery 4   → spontaneous / difficult listening checks
```

The review queue should feel varied rather than like a list of identical flashcards.

---

# 12. Weakness engine

A mistake can optionally be tagged to a weakness category.

Examples:

```text
SER_VS_ESTAR
GOSTAR_DE
TER_AGE
PAST_TENSE
NUMBERS
LISTENING_REDUCED_VOWELS
PRONUNCIATION_R
```

Track a rolling mistake count per category.

When a category exceeds a configurable threshold:

- show it as Today's Focus
- inject extra related questions into Smart Review
- reduce frequency again after repeated successful answers

---

# 13. Daily score engine

A daily lesson score is composed from skill scores.

The exact weighting can depend on lesson type, but a normal lesson may use:

```text
Vocabulary       20%
Chunks           20%
Listening        20%
Speaking         15%
Pronunciation    10%
Practical/Test   15%
```

Checkpoint days can place more weight on speaking and practical scenarios.

Scores are stored separately so the Progress screen can show long-term skill trends.

---

# 14. XP engine

XP rewards completion and effort, not language mastery.

Indicative normal lesson:

```text
Review             15 XP
Vocabulary         20 XP
Listening           15 XP
Grammar             10 XP
Speaking            25 XP
Daily test          15 XP
-------------------------
Base               100 XP
```

Bonus:

```text
90%+ daily score    +10 XP
100% daily score     +5 XP
```

## Anti-farming

Repeat attempts on already-completed trivial questions should have declining or zero XP value.

Mastery may still improve even when no XP is awarded.

---

# 15. Streak engine

A streak is earned when the day's required lesson is completed.

Do not require a minimum score.

Core states:

```text
active streak
longest streak
last completion date
available streak freezes
```

Initial streak freeze rule:

- earn 1 freeze after a 5-day streak
- configure maximum storage limit later

Date calculations should be isolated in one utility/engine so timezone behavior is consistent.

---

# 16. Stars and challenges

Lesson star rules:

```text
1 star → lesson completed
2 stars → score >= 75
3 stars → score >= 90
```

Challenges can award:

- higher XP
- stars
- passport stamp
- achievement progression

No score should prevent the user from accessing the next curriculum day.

---

# 17. Audio architecture

Audio must be abstracted from lesson content.

Each relevant content item can reference:

```text
audioPath
```

Preferred long-term strategy:

1. curated / generated pt-PT audio assets for key words and chunks
2. cached locally by the PWA
3. optional device speech synthesis only as fallback

Why keep an adapter layer:

```text
Lesson Player
     ↓
AudioService
     ↓
static asset / fallback provider
```

The UI should never care where the audio came from.

---

# 18. Speaking architecture

Speaking has two levels.

## V1 — local speaking practice

- microphone permission
- record answer
- replay answer
- prompt user to compare with target audio
- store completion / attempt metadata

This requires no backend.

## V1.x / V2 — evaluated speaking

Add a provider interface for:

- speech-to-text
- answer comparison
- intelligibility feedback
- pronunciation hints
- conversational scenarios

Architecture:

```text
Speaking UI
    ↓
SpeechService interface
    ↓
LocalRecorderProvider      (V1)
RemoteSpeechProvider       (future)
```

Do not hardwire one third-party AI provider into lesson components.

---

# 19. Conversational scenario architecture

Scenarios should also be data-driven.

Example:

```ts
interface Scenario {
  id: string;
  title: string;
  location?: string;
  objective: string;
  turns: ScenarioTurn[];
  rewards: {
    xp: number;
    passportStamp?: string;
  };
}
```

For V1, scenarios can use deterministic branching or fixed dialogue.

Later the same UI can connect to an AI conversation service.

---

# 20. PWA and offline strategy

Cache categories:

## App shell

Always cache:

- HTML
- CSS
- JS bundles
- icons
- manifest

## Course content

Cache all text curriculum data.

## Audio

Use selective caching to avoid making first install unnecessarily heavy.

Recommended V1 approach:

- pre-cache core UI
- cache lesson audio on first use
- optionally provide a later 'Download course offline' action

The application should still open and provide text-based lessons, review and stored progress when offline.

---

# 21. Installation configuration

The PWA needs:

```text
manifest.webmanifest
service worker
app icons
standalone display mode
theme/background colors
```

Product name:

```text
PolyYaps
```

Initial language course:

```text
European Portuguese / pt-PT
```

---

# 22. Export and backup

Because V1 progress is local, add a manual data export early.

Export should create a JSON file containing:

- user progress
- item progress
- lesson progress
- achievements
- passport stamps
- settings

Also support importing the same format.

This protects user progress before cloud sync exists.

---

# 23. Future cloud architecture

Do not implement yet, but design storage interfaces so later we can add:

```text
local IndexedDB
       ↓
SyncService
       ↓
remote user database
```

Future capabilities:

- sign in
- backup across devices
- laptop ↔ iPhone sync
- multiple courses
- analytics
- remote lesson updates

Local-first should remain possible.

---

# 24. Testing strategy

The most important automated tests are not visual tests first.

Prioritise pure learning-engine logic:

## Review engine

- due-date calculations
- wrong answer schedules earlier
- strong items schedule later

## Mastery

- correct exercise updates strength
- exercise weights applied correctly
- mastery upgrades and downgrades

## XP

- normal rewards
- bonus thresholds
- no XP farming

## Streaks

- consecutive dates
- missed date
- freeze application

## Content validation

Every lesson item should have:

- unique ID
- valid day number
- correct type
- Portuguese target
- required translations/metadata

---

# 25. Privacy principles

V1 should collect as little user data as possible.

Default:

- learning data stays on device
- microphone recordings are temporary unless explicitly saved
- no account required
- no analytics required for the first personal prototype

If remote speech evaluation is later introduced, the UI and privacy model must make clear when audio leaves the device.

---

# 26. Performance principles

For V1:

- lazy-load screens
- avoid huge image libraries
- avoid bundling all audio into the first page load
- keep animations lightweight
- minimise external dependencies
- use responsive images where photography is introduced

The app should feel immediate on a normal iPhone connection and remain useful offline.

---

# 27. Implementation phases

## V0.1 — App shell

Build:

- React/TypeScript project
- design tokens
- Home
- bottom navigation
- Learning Path shell
- mock progress data

Goal:

**installable-looking mobile prototype with real navigation**

## V0.2 — Lesson engine

Build:

- content schema
- Day 1 real content
- flashcards
- active recall
- feedback states
- module progress

## V0.3 — Persistence

Build:

- IndexedDB
- lesson completion
- item progress
- app restart restores state

## V0.4 — Review engine

Build:

- mastery
- strength
- review dates
- Smart Review queue
- weakness tracking

## V0.5 — Gamification

Build:

- XP
- streaks
- stars
- levels
- achievements
- Passport

## V0.6 — Audio & speaking

Build:

- pt-PT audio playback
- listening exercises
- recording
- playback
- speaking flow

## V0.7 — PWA

Build:

- manifest
- service worker
- icons
- offline caching
- install flow

## V0.8 — Full curriculum

Add:

- Days 1–30
- checkpoints
- challenges
- final test

## V1.0

Polish:

- full responsive QA
- iPhone testing
- accessibility
- export/import
- bug fixes
- final onboarding

---

# 28. Definition of V1 success

V1 is successful when the user can:

1. open PolyYaps from an iPhone home screen
2. see today's lesson
3. complete a full lesson
4. hear pt-PT learning audio
5. practise speaking
6. complete a daily test
7. earn XP and maintain a streak
8. see item mastery update
9. return the next day and receive the correct Smart Review items
10. use the main 30-day curriculum offline for normal study
11. view Progress, Passport and challenges
12. export progress as a backup

---

# 29. Architecture decisions locked for Step 8

Unless implementation reveals a real blocker, Step 8 starts with these decisions:

```text
Application       PWA
Primary device    iPhone
Frontend          React + TypeScript
Build tool        Vite
Styling           CSS variables + lightweight component CSS
Persistence       IndexedDB
Backend V1        None
Content           Data-driven pt-PT lesson files
Offline           Yes, core course
Audio             Asset-first with provider abstraction
Speaking V1       Local recording + reusable SpeechService interface
Testing           Learning-engine logic first
```

This keeps PolyYaps simple enough to ship, but avoids architectural choices that would prevent it from becoming a more advanced language-learning product later.

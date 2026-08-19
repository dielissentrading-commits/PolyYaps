# PolyYaps — Stap 6 App Design

## 6A — Information architecture

PolyYaps uses four persistent primary tabs outside focus mode:

- **Home** — today, streak, XP and next action
- **Learn** — 30-day learning path
- **Review** — spaced repetition and weak items
- **Progress** — skills, mastery, achievements and passport

Speaking is intentionally embedded in lessons and challenges rather than being a separate main tab.

### Core user flow

```text
Open app
  ↓
Home
  ↓
Start day
  ↓
Review
  ↓
Vocabulary
  ↓
Chunks
  ↓
Listening
  ↓
Micro-grammar
  ↓
Speaking
  ↓
Daily test
  ↓
Results
  ↓
XP + streak + mastery updates
  ↓
Home
```

Checkpoint days use a challenge flow rather than the normal lesson flow.

---

## 6B — Low-fidelity screen set

V1 core views:

1. Home
2. Learning Path
3. Lesson Detail
4. Exercise / Flashcard
5. Listening
6. Speaking
7. Conversational Scenario
8. Smart Review
9. Daily Result
10. Progress
11. Passport
12. Boss Challenge

### Interaction modes

**Explore mode**
- bottom navigation visible
- used for Home, Learn, Review and Progress

**Focus mode**
- bottom navigation hidden
- used for lessons, quizzes, listening, speaking and challenges
- only back, close or continue actions remain

---

## 6C — Visual identity

Direction:

> **Airbnb-modern × Portugal × language learning**

Design qualities:

- warm
- modern
- calm
- travel-oriented
- premium
- adult rather than cartoonish

### Core palette

```text
Primary / Terracotta   #D95C45
Primary Dark           #C44E3A
Text                    #222222
Muted                   #737373
Background              #FAF9F7
Surface                 #FFFFFF
Portugal Green          #4F7658
Sand                    #EDE6DA
Border                  #E8E5E1
```

### Typography

Preferred family: **Manrope** with system-sans fallback.

Indicative hierarchy:

- H1: 32 / 38 / 700
- H2: 24 / 30 / 700
- H3: 18 / 24 / 650
- Body: 16 / 24 / 400
- Small: 13–14
- Portuguese learning targets: up to 36 px, 700

### Shape language

- large cards: 24 px radius
- smaller cards: 16–18 px radius
- buttons: 16 px radius
- pills/chips: full radius
- subtle borders and shadows only

### Gamification visual rule

Gamification is present but visually restrained.

Use:
- XP
- streaks
- stars
- achievements
- passport stamps
- boss challenges

Avoid:
- constant confetti
- aggressive error colors
- cartoon mascot
- noisy dashboards

---

## 6D — High-fidelity UI specifications

Primary iPhone design reference viewport:

```text
390 × 844 px
```

Responsive implementation is still required.

### Page layout

- page horizontal padding: 20 px
- common section spacing: 24–32 px
- primary button height: 54 px
- bottom navigation: approximately 78 px + safe-area inset

### Home hierarchy

1. PolyYaps wordmark / settings
2. greeting
3. streak and XP
4. dominant daily lesson card
5. smart review
6. focus item
7. bottom navigation

The dominant action must always be **Start lesson**.

### Lesson player

Focus mode with:

- close button
- module name
- current item counter
- thin progress bar
- one learning target at a time
- large Portuguese text
- audio control
- one dominant continuation / answer action

### Correct answer state

- small green success marker
- subtle motion
- optional +XP feedback
- no full-screen green takeover

### Incorrect answer state

- calm correction
- user's answer vs correct answer
- listen again
- mark item for later review
- no life loss or blocked progress

### Speaking screen

- scenario title
- short prompt card
- large microphone button
- subtle pulse while recording
- feedback on intelligibility, sentence structure and word choice
- retry or continue

### Progress screen

Show:

- day X / 30
- completion percentage
- streak
- XP
- level
- vocabulary
- listening
- speaking
- pronunciation
- practical Portuguese
- links to vocabulary, passport and achievements

### Passport

Passport is allowed to break slightly from the core UI:

- warm cream surface
- terracotta stamp accents
- travel-document feel
- collectible scenario stamps

---

## Design tokens

```css
:root {
  --color-primary: #D95C45;
  --color-primary-dark: #C44E3A;
  --color-text: #222222;
  --color-muted: #737373;
  --color-background: #FAF9F7;
  --color-surface: #FFFFFF;
  --color-border: #E8E5E1;
  --color-success: #4F7658;
  --color-sand: #EDE6DA;

  --radius-small: 12px;
  --radius-medium: 16px;
  --radius-large: 24px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  --page-padding: 20px;
  --button-height: 54px;
  --bottom-nav-height: 78px;
}
```

---

## V1 component set

### Layout
- AppShell
- FocusShell
- BottomNavigation
- TopBar

### Cards
- LessonCard
- ReviewCard
- FocusCard
- ChallengeCard
- StatCard

### Learning
- Flashcard
- AnswerInput
- AudioButton
- MicButton
- GrammarCard
- FeedbackSheet

### Progress
- ProgressBar
- SkillBar
- XPIndicator
- StreakIndicator
- MasteryBadge

### Gamification
- Achievement
- PassportStamp
- ChallengeResult
- LevelUp

### Actions
- PrimaryButton
- SecondaryButton
- TextButton

---

## UI rule of thumb

Every screen must answer within roughly one second:

> **What is the single most important action here?**

If that is unclear, the screen is too busy.

# PolyYaps lesson content

This directory is the human-readable source of truth for the European Portuguese (pt-PT) 30-day course content.

## Files

- `lessons/days-01-10.md` — survival Portuguese and talking about yourself
- `lessons/days-11-20.md` — travel, past tense, future and plans
- `lessons/days-21-30.md` — social Portuguese, work, integration and final challenge

## Content model

A normal lesson contains approximately:

- 15 core words
- 8 active chunks / sentences
- 1 grammar focus
- 1 practical speaking goal

Checkpoint days contain less new material and more integrated practice.

The content is intentionally European Portuguese (`pt-PT`). Brazilian Portuguese variants should not replace the European forms unless explicitly documented as a comparison.

## Future conversion

These Markdown files are the editorial source. During implementation, lesson content can be transformed into typed JSON/TypeScript data containing fields such as:

```text
id
type
portuguese
dutch
day
category
priority
example
audio_target
```

User-specific mastery/progress data must remain separate from the static course content.

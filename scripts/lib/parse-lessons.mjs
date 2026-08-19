import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Parses the editorial Markdown in content/lessons/ into structured lesson data.
 *
 * The Markdown is the source of truth (see content/README.md); this parser is
 * the "future conversion" that README describes. It is deliberately strict: an
 * unknown section heading throws rather than being silently dropped, so editing
 * the course cannot quietly lose material.
 */

/** Section heading -> what it contributes to a lesson day. */
const SECTION_KINDS = {
  Kernwoorden: { kind: 'items', itemType: 'word' },
  'Extra kernwoorden': { kind: 'items', itemType: 'word' },
  'Getallen 0–20': { kind: 'items', itemType: 'word' },
  Tijdwoorden: { kind: 'items', itemType: 'word' },

  'Actieve chunks': { kind: 'items', itemType: 'chunk' },
  'Survival-chunks': { kind: 'items', itemType: 'chunk' },
  'Essentiële conversation chunks': { kind: 'items', itemType: 'chunk' },

  Grammatica: { kind: 'note', noteType: 'grammar' },
  'Belangrijke verleden vormen': { kind: 'note', noteType: 'grammar' },
  'pt-PT focus': { kind: 'note', noteType: 'grammar' },
  Taalgebruik: { kind: 'note', noteType: 'grammar' },
  Gespreksformule: { kind: 'note', noteType: 'grammar' },

  Luisterfocus: { kind: 'note', noteType: 'listening' },

  Spreekopdracht: { kind: 'task', taskType: 'speaking' },
  Hoofdopdracht: { kind: 'task', taskType: 'speaking' },
  "Scenario's": { kind: 'task', taskType: 'speaking' },
  Dagdoel: { kind: 'task', taskType: 'speaking' },
};

/** Headings matched by prefix rather than exact text. */
const SECTION_PREFIXES = [
  { prefix: 'Checkpoint — ', kind: 'task', taskType: 'challenge' },
  { prefix: 'Scenario ', kind: 'task', taskType: 'speaking' },
  { prefix: 'Onderdeel ', kind: 'task', taskType: 'test' },
  { prefix: 'Beoordelingsmodel', kind: 'note', noteType: 'grammar' },
  { prefix: 'Mastery-referentie', kind: 'note', noteType: 'grammar' },
];

function classify(heading) {
  if (SECTION_KINDS[heading]) return SECTION_KINDS[heading];
  const prefixed = SECTION_PREFIXES.find((entry) => heading.startsWith(entry.prefix));
  if (prefixed) return prefixed;
  throw new Error(
    `Unknown lesson section heading: "${heading}".\n` +
      'Add it to SECTION_KINDS or SECTION_PREFIXES in scripts/lib/parse-lessons.mjs ' +
      'so the content is not silently dropped.',
  );
}

export function slug(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Strips Markdown emphasis so the app renders plain strings. */
function plain(value) {
  return value.replace(/\*\*(.+?)\*\*/g, '$1').trim();
}

function parseSectionBody(lines) {
  const bullets = [];
  const prose = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '---') continue;
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (bullet) bullets.push(plain(bullet[1]));
    else if (numbered) bullets.push(plain(numbered[1]));
    else prose.push(plain(line));
  }
  return { bullets, prose };
}

export function parseLessons(dir = 'content/lessons') {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => join(dir, name));

  if (files.length === 0) throw new Error(`No lesson files found in ${dir}`);

  const days = [];
  let current = null;
  let section = null;

  const flushSection = () => {
    if (!current || !section) return;
    const { heading, lines } = section;
    const type = classify(heading);
    const { bullets, prose } = parseSectionBody(lines);

    if (type.kind === 'items') {
      for (const bullet of bullets) {
        // Item bullets read "portuguese — dutch"; anything else is malformed.
        const parts = bullet.split(' — ');
        if (parts.length < 2) {
          throw new Error(
            `Day ${current.day}, section "${heading}": expected "portugees — nederlands" ` +
              `but found "${bullet}"`,
          );
        }
        current.items.push({
          type: type.itemType,
          portuguese: parts[0].trim(),
          dutch: parts.slice(1).join(' — ').trim(),
          section: heading,
        });
      }
    } else if (type.kind === 'note') {
      current.notes.push({
        noteType: type.noteType,
        title: heading,
        body: prose,
        points: bullets,
      });
    } else {
      current.tasks.push({
        taskType: type.taskType,
        title: heading,
        body: prose,
        steps: bullets,
      });
    }
    section = null;
  };

  for (const file of files) {
    for (const raw of readFileSync(file, 'utf8').split('\n')) {
      const dayHeading = raw.match(/^##\s+Dag\s+(\d+)\s+—\s+(.+)$/);
      if (dayHeading) {
        flushSection();
        current = {
          day: Number(dayHeading[1]),
          title: dayHeading[2].trim(),
          goal: '',
          items: [],
          notes: [],
          tasks: [],
          source: file,
        };
        days.push(current);
        continue;
      }

      const sectionHeading = raw.match(/^###\s+(.+)$/);
      if (sectionHeading) {
        flushSection();
        section = { heading: sectionHeading[1].trim(), lines: [] };
        continue;
      }

      if (!current) continue;

      const goal = raw.match(/^\*\*Doel:\*\*\s*(.+)$/);
      if (goal && !section) {
        current.goal = plain(goal[1]);
        continue;
      }

      if (section) section.lines.push(raw);
    }
    flushSection();
  }

  days.sort((a, b) => a.day - b.day);
  return days;
}

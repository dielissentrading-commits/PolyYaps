#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { generate } from './build-content.mjs';

/**
 * Content validation — docs/07-technical-architecture.md, section 24.
 *
 * Checks the editorial source and the generated data before anything ships:
 * every item needs a unique id, a valid day, a Portuguese target and a Dutch
 * translation, and the committed generated files must match the Markdown.
 */

const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const { files, days, itemCount, outDir } = generate();

// --- Curriculum shape -------------------------------------------------------

if (days.length !== 30) fail(`Expected 30 curriculum days, found ${days.length}`);

days.forEach((day, index) => {
  const expected = index + 1;
  if (day.day !== expected) fail(`Day out of sequence: expected ${expected}, found ${day.day}`);
  if (!day.title.trim()) fail(`Day ${day.day} has no title`);
  if (!day.goal.trim()) fail(`Day ${day.day} has no goal (**Doel:** line)`);
  if (day.generatedModules.length === 0) fail(`Day ${day.day} produced no modules`);
});

// --- Learning items ---------------------------------------------------------

// An item may appear on several days (a repeat is reinforcement), but every
// appearance must describe the same learning item.
const ids = new Map();

for (const day of days) {
  const seenToday = new Set();

  for (const item of day.generatedItems) {
    if (!item.portuguese.trim()) fail(`Day ${day.day}: item ${item.id} has no Portuguese target`);
    if (!item.dutch.trim()) fail(`Day ${day.day}: item ${item.id} has no Dutch translation`);
    if (!['word', 'chunk'].includes(item.type)) {
      fail(`Day ${day.day}: item ${item.id} has unexpected type "${item.type}"`);
    }
    if (item.dayIntroduced > day.day) {
      fail(`Item ${item.id} on day ${day.day} claims to be introduced on day ${item.dayIntroduced}`);
    }
    if (seenToday.has(item.id)) {
      fail(`Day ${day.day} lists item "${item.id}" twice`);
    }
    seenToday.add(item.id);

    const known = ids.get(item.id);
    if (!known) {
      ids.set(item.id, item);
    } else if (known.dayIntroduced !== item.dayIntroduced || known.type !== item.type) {
      fail(
        `Item "${item.id}" is inconsistent between day ${known.dayIntroduced} and day ${day.day}`,
      );
    }
  }
}

// --- European Portuguese ----------------------------------------------------
// content/README.md: Brazilian forms must not replace the European ones.

const BRAZILIAN_FORMS = [
  ['trem', 'comboio'],
  ['ônibus', 'autocarro'],
  ['celular', 'telemóvel'],
  ['café da manhã', 'pequeno-almoço'],
  ['banheiro', 'casa de banho'],
  ['geladeira', 'frigorífico'],
  ['sorvete', 'gelado'],
  ['grama', 'relva'],
];

for (const day of days) {
  for (const item of day.generatedItems) {
    const text = item.portuguese.toLowerCase();
    for (const [brazilian, european] of BRAZILIAN_FORMS) {
      if (new RegExp(`\\b${brazilian}\\b`).test(text)) {
        fail(
          `Day ${day.day}: "${item.portuguese}" uses the Brazilian form "${brazilian}" ` +
            `(pt-PT uses "${european}")`,
        );
      }
    }
  }
}

// --- Curriculum volume against the plan -------------------------------------
// Masterplan step 1 targets ~450 active words and ~250 chunks.

const unique = [...ids.values()];
const words = unique.filter((item) => item.type === 'word');
const chunks = unique.filter((item) => item.type === 'chunk');

if (words.length < 450) {
  warn(`${words.length} unique words; the masterplan targets about 450`);
}
if (chunks.length < 250) {
  warn(`${chunks.length} unique chunks; the masterplan targets about 250`);
}

// --- Generated files are in sync --------------------------------------------

for (const [name, contents] of files) {
  const path = join(outDir, name);
  if (!existsSync(path)) {
    fail(`Generated file missing: ${path} — run "npm run build:content"`);
    continue;
  }
  if (readFileSync(path, 'utf8') !== contents) {
    fail(`Generated file out of date: ${path} — run "npm run build:content"`);
  }
}

// --- Report -----------------------------------------------------------------

console.log(
  `Checked ${days.length} days, ${itemCount} learning items ` +
    `(${words.length} words, ${chunks.length} chunks)`,
);

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\n${errors.length} content error(s)`);
  process.exit(1);
}

console.log(warnings.length ? `OK with ${warnings.length} warning(s)` : 'OK');

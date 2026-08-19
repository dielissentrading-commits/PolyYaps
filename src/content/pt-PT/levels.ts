/**
 * Level titles — masterplan step 5. These are gamification names, not CEFR
 * levels, and the XP engine (V0.5) decides when each one is reached.
 */
export const levelTitles = [
  'Novato',
  'Principiante',
  'Explorador',
  'Viajante',
  'Comunicador',
  'Conversador',
  'Aventureiro',
  'Confiante',
  'Quase Português',
  'Desafio Completo',
];

/** XP needed to reach each level, index 0 being level 1. */
export const LEVEL_THRESHOLDS = [0, 300, 700, 1200, 1800, 2500, 3300, 4200, 5200, 6300];

export function levelForXP(xp: number): number {
  let level = 1;
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (xp >= LEVEL_THRESHOLDS[index]) level = index + 1;
  }
  return level;
}

export function levelTitle(level: number): string {
  return levelTitles[Math.min(level - 1, levelTitles.length - 1)] ?? levelTitles[0];
}

/** XP still needed for the next level, or null at the maximum. */
export function xpToNextLevel(xp: number): number | null {
  const next = LEVEL_THRESHOLDS.find((threshold) => threshold > xp);
  return next === undefined ? null : next - xp;
}

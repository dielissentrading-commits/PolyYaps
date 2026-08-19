import type { ProgressState } from './progress';

export const levels = [
  { level: 1, name: 'Novato', minXp: 0 },
  { level: 2, name: 'Principiante', minXp: 300 },
  { level: 3, name: 'Explorador', minXp: 700 },
  { level: 4, name: 'Viajante', minXp: 1200 },
  { level: 5, name: 'Comunicador', minXp: 1800 },
  { level: 6, name: 'Conversador', minXp: 2500 },
  { level: 7, name: 'Aventureiro', minXp: 3300 },
  { level: 8, name: 'Confiante', minXp: 4200 },
  { level: 9, name: 'Quase Português', minXp: 5200 },
  { level: 10, name: 'Desafio Completo', minXp: 6500 },
] as const;

export const achievements = [
  { id: 'primeiras-palavras', icon: '✦', title: 'Primeiras Palavras', description: 'Voltooi je eerste les.' },
  { id: 'um-cafe-por-favor', icon: '☕', title: 'Um café, por favor', description: 'Slaag voor de Café Challenge.' },
  { id: 'em-boa-forma', icon: '🔥', title: 'Em boa forma', description: 'Bouw een streak van 5 dagen.' },
  { id: 'cem-palavras', icon: '100', title: 'Cem palavras', description: 'Leer 100 unieke woorden.' },
  { id: 'estou-a-ouvir', icon: '◉', title: 'Estou a ouvir', description: 'Bouw sterke luister-mastery op.' },
  { id: 'sem-ingles', icon: '💬', title: 'Sem inglês', description: 'Slaag voor Meet a Local.' },
  { id: 'persistente', icon: '20', title: 'Persistente', description: 'Bereik een streak van 20 dagen.' },
  { id: 'boa-viagem', icon: '🚆', title: 'Boa viagem', description: 'Slaag later voor de Travel Day.' },
  { id: 'a-portuguesa', icon: '🍷', title: 'À portuguesa', description: 'Slaag later voor de culturele challenge.' },
  { id: 'negocios', icon: '💼', title: 'Negócios', description: 'Rond de zakelijke module af.' },
] as const;

export const passportStamps = [
  { id: 'cafe-lisboa', icon: '☕', city: 'Lisboa', title: 'Café', day: 5 },
  { id: 'conversa-coimbra', icon: '💬', city: 'Coimbra', title: 'Conversa', day: 10 },
  { id: 'travel-lisboa', icon: '🚆', city: 'Lisboa', title: 'Boa Viagem', day: 15 },
  { id: 'tempo-evora', icon: '⌛', city: 'Évora', title: 'Tempo', day: 20 },
  { id: 'cultura-porto', icon: '🍷', city: 'Porto', title: 'Cultura', day: 25 },
  { id: 'final-algarve', icon: '🇵🇹', city: 'Algarve', title: 'Desafio', day: 30 },
] as const;

export function getLevel(totalXp: number) {
  return [...levels].reverse().find((level) => totalXp >= level.minXp) ?? levels[0];
}

export function getNextLevel(totalXp: number) {
  const current = getLevel(totalXp);
  return levels.find((level) => level.level === current.level + 1);
}

export function getLevelProgress(totalXp: number) {
  const current = getLevel(totalXp);
  const next = getNextLevel(totalXp);
  if (!next) return 100;
  const span = next.minXp - current.minXp;
  return Math.max(0, Math.min(100, Math.round(((totalXp - current.minXp) / span) * 100)));
}

export function achievementDetails(progress: ProgressState) {
  return achievements.map((achievement) => ({
    ...achievement,
    unlocked: progress.achievements.includes(achievement.id),
  }));
}

export function stampDetails(progress: ProgressState) {
  return passportStamps.map((stamp) => ({
    ...stamp,
    unlocked: progress.passportStamps.includes(stamp.id),
  }));
}

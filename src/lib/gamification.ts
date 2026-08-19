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
  { id: 'estou-a-ouvir', icon: '◉', title: 'Estou a ouvir', description: 'Bereik 70% gemiddelde mastery over minstens 50 items.' },
  { id: 'sem-ingles', icon: '💬', title: 'Sem inglês', description: 'Slaag voor Meet a Local.' },
  { id: 'boa-viagem', icon: '🧳', title: 'Boa viagem', description: 'Slaag voor Portugal Travel Day.' },
  { id: 'tempo-completo', icon: '⏳', title: 'Ontem, Hoje, Amanhã', description: 'Slaag voor de tijdschallenge.' },
  { id: 'a-portuguesa', icon: '🍷', title: 'À portuguesa', description: 'Slaag voor Night Out in Portugal.' },
  { id: 'negocios', icon: '💼', title: 'Negócios', description: 'Rond de zakelijke module af.' },
  { id: 'persistente', icon: '20', title: 'Persistente', description: 'Bereik een streak van 20 dagen.' },
  { id: 'dia-completo', icon: '🗺️', title: 'Um dia em Portugal', description: 'Slaag voor de volledige dagsimulatie.' },
  { id: 'desafio-completo', icon: '🇵🇹', title: 'Desafio Completo', description: 'Slaag voor de finale op Dag 30.' },
] as const;

export const passportStamps = [
  { id: 'cafe-lisboa', icon: '☕', city: 'Lisboa', title: 'Café', day: 5 },
  { id: 'conversa-coimbra', icon: '💬', city: 'Coimbra', title: 'Conversa', day: 10 },
  { id: 'viagem-lisboa', icon: '🧳', city: 'Lisboa', title: 'Boa Viagem', day: 15 },
  { id: 'tempo-coimbra', icon: '⏳', city: 'Coimbra', title: 'Tempo', day: 20 },
  { id: 'noite-porto', icon: '🍷', city: 'Porto', title: 'Noite', day: 25 },
  { id: 'dia-lisboa', icon: '🗺️', city: 'Lisboa', title: 'Dia Inteiro', day: 29 },
  { id: 'final-portugal', icon: '🇵🇹', city: 'Portugal', title: 'Desafio', day: 30 },
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
  return achievements.map((achievement) => ({ ...achievement, unlocked: progress.achievements.includes(achievement.id) }));
}

export function stampDetails(progress: ProgressState) {
  return passportStamps.map((stamp) => ({ ...stamp, unlocked: progress.passportStamps.includes(stamp.id) }));
}

import type { Achievement } from '@/types';

/** Achievement catalogue — masterplan step 5. */
export const achievements: Achievement[] = [
  { id: 'primeiras-palavras', title: 'Primeiras Palavras', description: 'Je eerste 25 woorden geleerd.', icon: '✳︎' },
  { id: 'um-cafe', title: 'Um café, por favor', description: 'Café Challenge voltooid.', icon: '☕︎' },
  { id: 'cem-palavras', title: 'Cem Palavras', description: '100 woorden actief beheerst.', icon: '⌘' },
  { id: 'estou-a-ouvir', title: 'Estou a ouvir', description: '50 zinnen verstaan zonder tekst.', icon: '◍' },
  { id: 'sem-ingles', title: 'Sem Inglês', description: 'Een hele les zonder Engels afgerond.', icon: '∅' },
  { id: 'boa-viagem', title: 'Boa Viagem', description: 'Alle reisscenario’s voltooid.', icon: '✈' },
  { id: 'a-portuguesa', title: 'À Portuguesa', description: 'Cultuur- en eetscenario’s voltooid.', icon: '✦' },
  { id: 'negocios', title: 'Negócios', description: 'Zakelijke scenario’s voltooid.', icon: '▣' },
  { id: 'persistente', title: 'Persistente', description: '14 dagen streak volgehouden.', icon: '◆' },
  { id: 'desafio-30', title: 'Desafio dos 30 Dias', description: 'De volledige 30 dagen afgerond.', icon: '★' },
];

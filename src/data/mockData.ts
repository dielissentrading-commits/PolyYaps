export type Lesson = {
  day: number;
  title: string;
  phase: string;
  status: 'complete' | 'current' | 'upcoming' | 'challenge';
  stars?: 1 | 2 | 3;
  city?: string;
};

export const lessons: Lesson[] = [
  { day: 1, title: 'Begroeten & voorstellen', phase: 'De basis', status: 'complete', stars: 3, city: 'Porto' },
  { day: 2, title: 'Persoonlijke informatie', phase: 'De basis', status: 'complete', stars: 3 },
  { day: 3, title: 'Hoe gaat het?', phase: 'De basis', status: 'complete', stars: 2 },
  { day: 4, title: 'Café & drinken', phase: 'De basis', status: 'complete', stars: 3 },
  { day: 5, title: 'Café Challenge', phase: 'Checkpoint', status: 'challenge', stars: 3, city: 'Lisboa' },
  { day: 6, title: 'Familie & relaties', phase: 'Gesprekken', status: 'complete', stars: 2 },
  { day: 7, title: 'Werk', phase: 'Gesprekken', status: 'complete', stars: 3 },
  { day: 8, title: "Hobby's & vrije tijd", phase: 'Gesprekken', status: 'complete', stars: 2 },
  { day: 9, title: 'Mijn dagelijkse routine', phase: 'Gesprekken', status: 'current', city: 'Coimbra' },
  { day: 10, title: 'Meet a Local', phase: 'Checkpoint', status: 'upcoming', city: 'Coimbra' },
  { day: 11, title: 'Restaurant', phase: 'Reizen', status: 'upcoming' },
  { day: 12, title: 'Winkelen', phase: 'Reizen', status: 'upcoming' },
  { day: 13, title: 'De weg vragen', phase: 'Reizen', status: 'upcoming' },
  { day: 14, title: 'Openbaar vervoer', phase: 'Reizen', status: 'upcoming' },
  { day: 15, title: 'Portugal Travel Day', phase: 'Checkpoint', status: 'upcoming', city: 'Lisboa' },
  { day: 16, title: 'Gisteren', phase: 'Tijd', status: 'upcoming' },
  { day: 17, title: 'Een reis navertellen', phase: 'Tijd', status: 'upcoming' },
  { day: 18, title: 'Morgen', phase: 'Tijd', status: 'upcoming' },
  { day: 19, title: 'Plannen maken', phase: 'Tijd', status: 'upcoming' },
  { day: 20, title: 'Ontem, Hoje, Amanhã', phase: 'Checkpoint', status: 'upcoming', city: 'Évora' },
  { day: 21, title: 'Iemand leren kennen', phase: 'Sociaal', status: 'upcoming' },
  { day: 22, title: 'Eten, wijn & cultuur', phase: 'Sociaal', status: 'upcoming' },
  { day: 23, title: 'Reizen & ervaringen', phase: 'Sociaal', status: 'upcoming' },
  { day: 24, title: 'Nederland vs. Portugal', phase: 'Sociaal', status: 'upcoming' },
  { day: 25, title: 'Night Out in Portugal', phase: 'Checkpoint', status: 'upcoming', city: 'Porto' },
  { day: 26, title: 'Zakelijk kennismaken', phase: 'Werk', status: 'upcoming' },
  { day: 27, title: 'Zakelijk gesprek', phase: 'Werk', status: 'upcoming' },
  { day: 28, title: 'Problemen oplossen', phase: 'Integratie', status: 'upcoming' },
  { day: 29, title: 'Een volledige dag', phase: 'Integratie', status: 'upcoming', city: 'Algarve' },
  { day: 30, title: 'The Portuguese Challenge', phase: 'Finale', status: 'upcoming', city: 'Algarve' },
];

export const skills = [
  { name: 'Woordenschat', value: 74 },
  { name: 'Luisteren', value: 61 },
  { name: 'Spreken', value: 69 },
  { name: 'Uitspraak', value: 76 },
  { name: 'Praktijk', value: 81 },
];

export const reviewItems = [
  { portuguese: 'gostar de', dutch: 'houden van / leuk vinden', strength: 'weak' },
  { portuguese: 'normalmente', dutch: 'normaal gesproken', strength: 'medium' },
  { portuguese: 'depois', dutch: 'daarna', strength: 'medium' },
  { portuguese: 'trabalhar', dutch: 'werken', strength: 'strong' },
  { portuguese: 'Estou a aprender português.', dutch: 'Ik ben Portugees aan het leren.', strength: 'strong' },
];

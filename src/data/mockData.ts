export type Lesson = {
  day: number;
  title: string;
  phase: string;
  status: 'complete' | 'current' | 'upcoming' | 'challenge';
  stars?: 1 | 2 | 3;
  city?: string;
};

export const lessons: Lesson[] = [
  { day: 1, title: 'Begroeten & voorstellen', phase: 'De basis', status: 'upcoming', city: 'Porto' },
  { day: 2, title: 'Persoonlijke informatie', phase: 'De basis', status: 'upcoming' },
  { day: 3, title: 'Hoe gaat het?', phase: 'De basis', status: 'upcoming' },
  { day: 4, title: 'Café & drinken', phase: 'De basis', status: 'upcoming' },
  { day: 5, title: 'Café Challenge', phase: 'Checkpoint', status: 'challenge', city: 'Lisboa' },
  { day: 6, title: 'Familie & relaties', phase: 'Gesprekken', status: 'upcoming' },
  { day: 7, title: 'Werk', phase: 'Gesprekken', status: 'upcoming' },
  { day: 8, title: "Hobby's & vrije tijd", phase: 'Gesprekken', status: 'upcoming' },
  { day: 9, title: 'Mijn dagelijkse routine', phase: 'Gesprekken', status: 'upcoming', city: 'Coimbra' },
  { day: 10, title: 'Meet a Local', phase: 'Checkpoint', status: 'challenge', city: 'Coimbra' },
  { day: 11, title: 'Restaurant', phase: 'Reizen', status: 'upcoming' },
  { day: 12, title: 'Winkelen', phase: 'Reizen', status: 'upcoming' },
  { day: 13, title: 'De weg vragen', phase: 'Reizen', status: 'upcoming' },
  { day: 14, title: 'Openbaar vervoer', phase: 'Reizen', status: 'upcoming' },
  { day: 15, title: 'Portugal Travel Day', phase: 'Checkpoint', status: 'challenge', city: 'Lisboa' },
  { day: 16, title: 'Gisteren', phase: 'Tijd', status: 'upcoming' },
  { day: 17, title: 'Een reis navertellen', phase: 'Tijd', status: 'upcoming' },
  { day: 18, title: 'Morgen', phase: 'Tijd', status: 'upcoming' },
  { day: 19, title: 'Plannen maken', phase: 'Tijd', status: 'upcoming' },
  { day: 20, title: 'Ontem, Hoje, Amanhã', phase: 'Checkpoint', status: 'challenge', city: 'Coimbra' },
  { day: 21, title: 'Iemand leren kennen', phase: 'Sociaal', status: 'upcoming' },
  { day: 22, title: 'Eten, wijn & cultuur', phase: 'Sociaal', status: 'upcoming' },
  { day: 23, title: 'Reizen & bestemmingen', phase: 'Sociaal', status: 'upcoming' },
  { day: 24, title: 'Vergelijken', phase: 'Sociaal', status: 'upcoming' },
  { day: 25, title: 'Night Out in Portugal', phase: 'Checkpoint', status: 'challenge', city: 'Porto' },
  { day: 26, title: 'Zakelijk voorstellen', phase: 'Werk', status: 'upcoming' },
  { day: 27, title: 'Projecten & resultaten', phase: 'Werk', status: 'upcoming' },
  { day: 28, title: 'Problemen oplossen', phase: 'Integratie', status: 'upcoming' },
  { day: 29, title: 'Portugal Day Simulation', phase: 'Integratie', status: 'challenge', city: 'Lisboa' },
  { day: 30, title: 'Final Portuguese Challenge', phase: 'Finale', status: 'challenge', city: 'Portugal' },
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

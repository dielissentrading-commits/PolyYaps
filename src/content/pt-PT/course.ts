import type { Course, CoursePhase, LessonDay, PhaseDefinition } from '@/types';

/**
 * The 30-day curriculum outline from docs/01-masterplan-stap-1-tm-5.md, step 2.
 *
 * V0.1 ships the *structure* only: day titles, phases and checkpoints, so the
 * learning path is real. Each day's `modules` array stays empty until V0.2
 * fills in actual learning items, day by day.
 */

const PHASES: PhaseDefinition[] = [
  { phase: 1, title: 'Survival', dayRange: [1, 5] },
  { phase: 2, title: 'Over jezelf praten', dayRange: [6, 10] },
  { phase: 3, title: 'Reizen', dayRange: [11, 15] },
  { phase: 4, title: 'Tijd en verhalen', dayRange: [16, 20] },
  { phase: 5, title: 'Sociaal Portugees', dayRange: [21, 25] },
  { phase: 5, title: 'Werk en integratie', dayRange: [26, 30] },
];

interface DayOutline {
  title: string;
  description: string;
  /** Checkpoint days run a challenge flow instead of the normal modules. */
  challenge?: { id: string; title: string };
}

const DAY_OUTLINES: DayOutline[] = [
  { title: 'Begroeten & jezelf voorstellen', description: 'Olá, bom dia en je eerste zinnen over wie je bent.' },
  { title: 'Persoonlijke informatie', description: 'Naam, leeftijd, woonplaats en nationaliteit.' },
  { title: 'Hoe gaat het? / ser vs. estar', description: 'Het verschil tussen wie je bent en hoe je je voelt.' },
  { title: 'Café & drinken / queria', description: 'Beleefd bestellen met queria en um/uma.' },
  {
    title: 'Getallen, geld & tijd',
    description: 'Prijzen verstaan, afrekenen en de tijd zeggen.',
    challenge: { id: 'cafe-challenge', title: 'Café Challenge' },
  },
  { title: 'Familie & relaties', description: 'Over je gezin, familie en relaties praten.' },
  { title: 'Werk', description: 'Vertellen wat je doet en waar je werkt.' },
  { title: "Hobby's & vrije tijd", description: 'Gostar de en wat je graag doet.' },
  { title: 'Dagelijkse routine', description: 'Je dag beschrijven van ochtend tot avond.' },
  {
    title: 'Meningen & voorkeuren',
    description: 'Zeggen wat je vindt, wilt en liever hebt.',
    challenge: { id: 'meet-a-local', title: 'Meet a Local' },
  },
  { title: 'Restaurant', description: 'Een tafel vragen, bestellen en betalen.' },
  { title: 'Winkelen', description: 'Vragen naar maten, prijzen en betalen in de winkel.' },
  { title: 'De weg vragen', description: 'Richtingen vragen en begrijpen.' },
  { title: 'Openbaar vervoer', description: 'Trein, metro en bus zelfstandig gebruiken.' },
  {
    title: 'Hotel & accommodatie',
    description: 'Inchecken, vragen stellen en problemen melden.',
    challenge: { id: 'travel-day', title: 'Portugal Travel Day' },
  },
  { title: 'Gisteren / eerste verleden tijd', description: 'Je eerste pretérito perfeito-vormen.' },
  { title: 'Een reis navertellen', description: 'Een verhaal vertellen over wat je hebt gedaan.' },
  { title: 'Morgen / ir + infinitief', description: 'Praten over wat je gaat doen.' },
  { title: 'Plannen maken', description: 'Afspreken, voorstellen doen en tijden afstemmen.' },
  {
    title: 'Verleden + heden + toekomst',
    description: 'De drie tijden vloeiend door elkaar gebruiken.',
    challenge: { id: 'ontem-hoje-amanha', title: 'Ontem, Hoje, Amanhã' },
  },
  { title: 'Iemand leren kennen', description: 'Een gesprek openen en gaande houden.' },
  { title: 'Eten, wijn & cultuur', description: 'Praten over smaak, gerechten en Portugese cultuur.' },
  { title: 'Reizen en ervaringen', description: 'Vertellen over plekken waar je bent geweest.' },
  { title: 'Nederland vs. Portugal vergelijken', description: 'Verschillen en overeenkomsten benoemen.' },
  {
    title: 'Smalltalk',
    description: 'Weer, plannen, koetjes en kalfjes — zonder Engels.',
    challenge: { id: 'night-out', title: 'Night Out in Portugal' },
  },
  { title: 'Zakelijk kennismaken', description: 'Jezelf professioneel voorstellen.' },
  { title: 'Eenvoudig zakelijk gesprek', description: 'Afspraken, taken en beleefde vormen.' },
  { title: 'Problemen oplossen', description: 'Om herhaling, hulp en verduidelijking vragen.' },
  { title: 'Volledige dag in Portugal', description: 'Alle scenario’s achter elkaar in één dag.' },
  {
    title: 'Eindtoets',
    description: 'Een gesprek van 10–15 minuten grotendeels in het Portugees.',
    challenge: { id: 'the-portuguese-challenge', title: 'The Portuguese Challenge' },
  },
];

function phaseForDay(day: number): CoursePhase {
  const match = PHASES.find(({ dayRange }) => day >= dayRange[0] && day <= dayRange[1]);
  return match ? match.phase : 5;
}

const days: LessonDay[] = DAY_OUTLINES.map((outline, index) => {
  const day = index + 1;
  return {
    day,
    title: outline.title,
    description: outline.description,
    phase: phaseForDay(day),
    checkpoint: Boolean(outline.challenge),
    challengeId: outline.challenge?.id,
    modules: [],
  };
});

export const course: Course = {
  id: 'pt-PT-30-days',
  language: 'pt-PT',
  title: 'Europees Portugees in 30 dagen',
  totalDays: days.length,
  phases: PHASES,
  days,
};

export function getDay(day: number): LessonDay | undefined {
  return course.days.find((lessonDay) => lessonDay.day === day);
}

export function getPhaseTitle(day: number): string {
  const match = PHASES.find(({ dayRange }) => day >= dayRange[0] && day <= dayRange[1]);
  return match ? match.title : '';
}

export function getChallengeTitle(challengeId: string): string | undefined {
  return DAY_OUTLINES.find((outline) => outline.challenge?.id === challengeId)?.challenge?.title;
}

/** Passport stamp catalogue — masterplan step 5, "Portugees paspoort". */
export interface StampDefinition {
  id: string;
  title: string;
  scenario: string;
  /** The checkpoint day that awards this stamp, when one does. */
  awardedOnDay?: number;
}

/**
 * A stamp is earned by finishing the day that teaches its scenario, so the
 * passport reflects practical situations the learner can actually handle
 * rather than only the checkpoint days.
 */
export const stamps: StampDefinition[] = [
  { id: 'cafe', title: 'Café', scenario: 'Een koffie bestellen en afrekenen', awardedOnDay: 5 },
  { id: 'restaurante', title: 'Restaurante', scenario: 'Uit eten van tafel tot rekening', awardedOnDay: 11 },
  { id: 'cidade', title: 'Cidade', scenario: 'De weg vragen in de stad', awardedOnDay: 13 },
  { id: 'estacao', title: 'Estação', scenario: 'Een kaartje kopen en de trein halen', awardedOnDay: 14 },
  { id: 'hotel', title: 'Hotel', scenario: 'Inchecken en iets vragen', awardedOnDay: 15 },
  { id: 'cultura', title: 'Cultura', scenario: 'Praten over eten, wijn en cultuur', awardedOnDay: 22 },
  { id: 'conversa', title: 'Conversa', scenario: 'Smalltalk met een local', awardedOnDay: 25 },
  { id: 'trabalho', title: 'Trabalho', scenario: 'Een zakelijke kennismaking', awardedOnDay: 26 },
];

/** Stamps a completed day awards. */
export function stampsForDay(day: number): StampDefinition[] {
  return stamps.filter((stamp) => stamp.awardedOnDay === day);
}

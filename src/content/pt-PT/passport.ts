/** Passport stamp catalogue — masterplan step 5, "Portugees paspoort". */
export interface StampDefinition {
  id: string;
  title: string;
  scenario: string;
  /** The checkpoint day that awards this stamp, when one does. */
  awardedOnDay?: number;
}

export const stamps: StampDefinition[] = [
  { id: 'cafe', title: 'Café', scenario: 'Een koffie bestellen en afrekenen', awardedOnDay: 5 },
  { id: 'conversa', title: 'Conversa', scenario: 'Smalltalk met een local', awardedOnDay: 10 },
  { id: 'estacao', title: 'Estação', scenario: 'Een kaartje kopen en de trein halen', awardedOnDay: 15 },
  { id: 'cidade', title: 'Cidade', scenario: 'De weg vragen in de stad', awardedOnDay: 20 },
  { id: 'cultura', title: 'Cultura', scenario: 'Praten over eten, wijn en cultuur', awardedOnDay: 25 },
  { id: 'trabalho', title: 'Trabalho', scenario: 'Een zakelijke kennismaking', awardedOnDay: 30 },
  { id: 'restaurante', title: 'Restaurante', scenario: 'Uit eten van tafel tot rekening' },
  { id: 'hotel', title: 'Hotel', scenario: 'Inchecken en iets vragen' },
];

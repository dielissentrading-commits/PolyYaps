export type VocabularyItem = {
  id: string;
  portuguese: string;
  dutch: string;
  example?: string;
};

export type ChunkItem = {
  id: string;
  portuguese: string;
  dutch: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  answer: string;
  alternatives?: string[];
  options?: string[];
  type: 'input' | 'choice';
};

export const day1 = {
  day: 1,
  title: 'Begroeten & jezelf voorstellen',
  subtitle: 'Je eerste echte gesprek in het Portugees.',
  goal: 'Na deze les kun je iemand begroeten, je naam en herkomst noemen en vertellen dat je Portugees leert.',
  vocabulary: [
    { id: 'ola', portuguese: 'olá', dutch: 'hallo', example: 'Olá!' },
    { id: 'bom-dia', portuguese: 'bom dia', dutch: 'goedemorgen', example: 'Olá, bom dia.' },
    { id: 'boa-tarde', portuguese: 'boa tarde', dutch: 'goedemiddag' },
    { id: 'boa-noite', portuguese: 'boa noite', dutch: 'goedenavond / goedenacht' },
    { id: 'ate-logo', portuguese: 'até logo', dutch: 'tot later' },
    { id: 'adeus', portuguese: 'adeus', dutch: 'dag / vaarwel' },
    { id: 'obrigado', portuguese: 'obrigado', dutch: 'bedankt' },
    { id: 'por-favor', portuguese: 'por favor', dutch: 'alstublieft' },
    { id: 'sim', portuguese: 'sim', dutch: 'ja' },
    { id: 'nao', portuguese: 'não', dutch: 'nee / niet' },
    { id: 'eu', portuguese: 'eu', dutch: 'ik' },
    { id: 'tu', portuguese: 'tu', dutch: 'jij' },
    { id: 'ser', portuguese: 'ser', dutch: 'zijn' },
    { id: 'chamar-se', portuguese: 'chamar-se', dutch: 'heten' },
    { id: 'portugues', portuguese: 'português', dutch: 'Portugees' },
  ] as VocabularyItem[],
  chunks: [
    { id: 'c1', portuguese: 'Olá, bom dia.', dutch: 'Hallo, goedemorgen.' },
    { id: 'c2', portuguese: 'Como te chamas?', dutch: 'Hoe heet je?' },
    { id: 'c3', portuguese: 'Chamo-me Duran.', dutch: 'Ik heet Duran.' },
    { id: 'c4', portuguese: 'Sou neerlandês.', dutch: 'Ik ben Nederlands.' },
    { id: 'c5', portuguese: 'Sou dos Países Baixos.', dutch: 'Ik kom uit Nederland.' },
    { id: 'c6', portuguese: 'Estou a aprender português.', dutch: 'Ik ben Portugees aan het leren.' },
    { id: 'c7', portuguese: 'Falo um pouco de português.', dutch: 'Ik spreek een beetje Portugees.' },
    { id: 'c8', portuguese: 'Muito prazer.', dutch: 'Aangenaam.' },
  ] as ChunkItem[],
  grammar: {
    title: 'ser — zijn als identiteit',
    explanation: 'Gebruik ser wanneer je zegt wie of wat iemand is. Voor vandaag hoef je alleen eu sou en tu és actief te kennen.',
    examples: [
      ['Eu sou neerlandês.', 'Ik ben Nederlands.'],
      ['Tu és português?', 'Ben jij Portugees?'],
      ['Sou o Duran.', 'Ik ben Duran.'],
    ],
  },
  speaking: {
    title: 'Je eerste introductie',
    prompt: 'Zeg hardop minimaal drie zinnen: begroet iemand, vertel je naam en vertel dat je Nederlands bent of uit Nederland komt.',
    model: 'Olá, bom dia. Chamo-me Duran. Sou neerlandês. Estou a aprender português.',
  },
  quiz: [
    { id: 'q1', type: 'input', prompt: 'Hoe zeg je “hallo”?', answer: 'olá', alternatives: ['ola'] },
    { id: 'q2', type: 'input', prompt: 'Hoe zeg je “bedankt”?', answer: 'obrigado' },
    { id: 'q3', type: 'choice', prompt: 'Wat betekent “Como te chamas?”', answer: 'Hoe heet je?', options: ['Hoe heet je?', 'Hoe gaat het?', 'Waar woon je?'] },
    { id: 'q4', type: 'input', prompt: 'Maak af: “Chamo-___ Duran.”', answer: 'me' },
    { id: 'q5', type: 'choice', prompt: 'Welke zin betekent “Ik ben Nederlands”?', answer: 'Sou neerlandês.', options: ['Estou neerlandês.', 'Sou neerlandês.', 'Tenho neerlandês.'] },
    { id: 'q6', type: 'input', prompt: 'Hoe zeg je “Portugees”?', answer: 'português', alternatives: ['portugues'] },
    { id: 'q7', type: 'choice', prompt: 'Wat betekent “Muito prazer.”?', answer: 'Aangenaam.', options: ['Tot later.', 'Aangenaam.', 'Alstublieft.'] },
    { id: 'q8', type: 'input', prompt: 'Hoe zeg je “ja”?', answer: 'sim' },
    { id: 'q9', type: 'choice', prompt: 'Welke vorm gebruik je voor “ik ben” bij identiteit?', answer: 'sou', options: ['sou', 'estou', 'tenho'] },
    { id: 'q10', type: 'input', prompt: 'Vertaal: “Ik spreek een beetje Portugees.”', answer: 'falo um pouco de português', alternatives: ['falo um pouco de portugues', 'falo um pouco português', 'falo um pouco portugues'] },
  ] as QuizQuestion[],
};

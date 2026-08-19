import type { ChallengeContent } from '../types/learning';

export const day10Challenge: ChallengeContent = {
  day: 10,
  title: 'Meet a Local',
  city: 'Coimbra',
  subtitle: 'Voer een kort gesprek over werk, hobby’s, routine en voorkeuren — zonder terug te vallen op Engels.',
  goal: 'Je houdt een eenvoudige conversatie gaande door antwoord + uitbreiding + reden + wedervraag te combineren.',
  rewardXp: 180,
  stampId: 'conversa-coimbra',
  stampLabel: 'Conversa de Coimbra',
  toolkit: {
    vocabulary: [
      { id: 'achar', portuguese: 'achar', dutch: 'vinden / denken', weaknessCategory: 'AURW' },
      { id: 'porque', portuguese: 'porque', dutch: 'omdat', weaknessCategory: 'AURW' },
      { id: 'mas', portuguese: 'mas', dutch: 'maar', weaknessCategory: 'AURW' },
      { id: 'tambem', portuguese: 'também', dutch: 'ook', weaknessCategory: 'AURW' },
      { id: 'preferir', portuguese: 'preferir', dutch: 'verkiezen / liever hebben', weaknessCategory: 'PREFERENCES' },
      { id: 'interessante', portuguese: 'interessante', dutch: 'interessant' },
      { id: 'divertido', portuguese: 'divertido', dutch: 'leuk / grappig' },
      { id: 'bonito', portuguese: 'bonito', dutch: 'mooi' },
    ],
    chunks: [
      { id: 'c1', portuguese: 'Acho que sim.', dutch: 'Ik denk van wel.', weaknessCategory: 'AURW' },
      { id: 'c2', portuguese: 'Acho que não.', dutch: 'Ik denk van niet.', weaknessCategory: 'AURW' },
      { id: 'c3', portuguese: 'Acho que é interessante.', dutch: 'Ik vind het interessant.', weaknessCategory: 'AURW' },
      { id: 'c4', portuguese: 'Gosto porque é divertido.', dutch: 'Ik vind het leuk omdat het leuk is.', weaknessCategory: 'AURW' },
      { id: 'c5', portuguese: 'Prefiro viajar.', dutch: 'Ik reis liever.', weaknessCategory: 'PREFERENCES' },
      { id: 'c6', portuguese: 'Para mim, é importante.', dutch: 'Voor mij is het belangrijk.', weaknessCategory: 'AURW' },
      { id: 'c7', portuguese: 'Também acho.', dutch: 'Dat vind ik ook.', weaknessCategory: 'AURW' },
      { id: 'c8', portuguese: 'E tu?', dutch: 'En jij?', weaknessCategory: 'COUNTERQUESTION' },
    ],
    numberLines: [
      'A + U + R + W',
      'Antwoord → Uitbreiding → Reden → Wedervraag',
      'Voorbeeld: Gosto de viajar. Viajo muito. Gosto porque é interessante. E tu?'
    ],
  },
  steps: [
    {
      id: 's1', speaker: 'local', line: 'Olá! Como te chamas?',
      prompt: 'Stel jezelf kort voor.', type: 'input',
      answer: 'chamo-me duran', alternatives: ['chamo me duran'],
    },
    {
      id: 's2', speaker: 'local', line: 'O que fazes?',
      prompt: 'Vertel dat je in marketing werkt.', type: 'input',
      answer: 'trabalho em marketing',
    },
    {
      id: 's3', speaker: 'local', line: 'Gostas do teu trabalho?',
      prompt: 'Geef een mening en een korte reden.', type: 'choice',
      answer: 'Gosto porque é interessante.',
      options: ['Gosto porque é interessante.', 'Tenho trabalho.', 'Sou marketing.'],
      itemRef: { type: 'chunk', id: 'c4' },
    },
    {
      id: 's4', speaker: 'local', line: 'E no teu tempo livre, o que gostas de fazer?',
      prompt: 'Zeg dat je van reizen houdt.', type: 'input',
      answer: 'gosto de viajar',
    },
    {
      id: 's5', speaker: 'local', line: 'Eu gosto muito de cozinhar.',
      prompt: 'Reageer dat jij dat ook vindt.', type: 'choice',
      answer: 'Também acho.',
      options: ['Também acho.', 'Não percebo.', 'Tenho uma reunião.'],
      itemRef: { type: 'chunk', id: 'c7' },
    },
    {
      id: 's6', speaker: 'local', line: 'Normalmente, a que horas começas a trabalhar?',
      prompt: 'Zeg dat je om negen uur begint.', type: 'input',
      answer: 'começo a trabalhar às nove', alternatives: ['comeco a trabalhar as nove', 'começo às nove'],
    },
    {
      id: 's7', speaker: 'local', line: 'Preferes viajar ou ficar em casa?',
      prompt: 'Zeg dat je liever reist.', type: 'choice',
      answer: 'Prefiro viajar.',
      options: ['Prefiro viajar.', 'Viajar é nove.', 'Tenho viajar.'],
      itemRef: { type: 'chunk', id: 'c5' },
    },
    {
      id: 's8', speaker: 'local', line: 'Portugal é bonito, não achas?',
      prompt: 'Geef je mening en kaats de vraag terug.', type: 'choice',
      answer: 'Acho que sim. E tu?',
      options: ['Acho que sim. E tu?', 'Sim.', 'Portugal tenho bonito.'],
      itemRef: { type: 'chunk', id: 'c1' },
    },
  ],
};

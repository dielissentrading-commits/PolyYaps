export type VocabularyItem = {
  id: string;
  portuguese: string;
  dutch: string;
  example?: string;
  weaknessCategory?: string;
};

export type ChunkItem = {
  id: string;
  portuguese: string;
  dutch: string;
  weaknessCategory?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  answer: string;
  alternatives?: string[];
  options?: string[];
  type: 'input' | 'choice';
  itemRef?: { type: 'word' | 'chunk'; id: string };
};

export type LessonContent = {
  day: number;
  title: string;
  subtitle: string;
  goal: string;
  vocabulary: VocabularyItem[];
  chunks: ChunkItem[];
  grammar: {
    title: string;
    explanation: string;
    examples: [string, string][];
    rule: string;
  };
  speaking: {
    title: string;
    prompt: string;
    model: string;
    chunkIds?: string[];
  };
  quiz: QuizQuestion[];
};

export type ChallengeStep = {
  id: string;
  speaker: 'barista' | 'system';
  line?: string;
  prompt: string;
  type: 'input' | 'choice';
  answer: string;
  alternatives?: string[];
  options?: string[];
  itemRef?: { type: 'word' | 'chunk'; id: string };
};

export type ChallengeContent = {
  day: number;
  title: string;
  city: string;
  subtitle: string;
  goal: string;
  rewardXp: number;
  stampId: string;
  stampLabel: string;
  toolkit: {
    vocabulary: VocabularyItem[];
    chunks: ChunkItem[];
    numberLines: string[];
  };
  steps: ChallengeStep[];
};

export type ItemType = 'word' | 'chunk';
export type EvidenceType = 'exposure' | 'recognition' | 'recall' | 'listening' | 'sentence' | 'speaking' | 'context' | 'spontaneous' | 'quiz';
export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export type ItemDescriptor = {
  key: string;
  itemId: string;
  day: number;
  itemType: ItemType;
  portuguese: string;
  dutch: string;
  weaknessCategory?: string;
};

export type MasteryRecord = ItemDescriptor & {
  masteryLevel: MasteryLevel;
  strength: number;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  lastReviewed?: string;
  nextReview?: string;
  lastEvidence?: EvidenceType;
  spokenCorrect: number;
  usedSpontaneously: number;
};

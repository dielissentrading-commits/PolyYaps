/**
 * Answer checking for production exercises.
 *
 * The rule of the course is "eerst communiceren, daarna corrigeren"
 * (masterplan, step 4), so a missing accent is not a wrong answer: it is a
 * correct answer with a note. Only a genuinely different word is wrong.
 */

export type AnswerVerdict = 'correct' | 'almost' | 'incorrect';

export interface AnswerCheck {
  verdict: AnswerVerdict;
  /** The accepted answer the input matched, when it matched one. */
  matched?: string;
  /** Why an "almost" was not a full correct, in the learner's language. */
  hint?: string;
}

/** Case, spacing and punctuation carry no meaning when checking an answer. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,!?;:()"'«»…]/g, ' ')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same as normalize, but also removes accents, so "nao" matches "não". */
function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Content lists alternatives with a slash: "dag / vaarwel", "um / uma".
 * Each alternative counts as a full answer on its own.
 */
export function acceptableAnswers(value: string): string[] {
  return value
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function checkAnswer(input: string, expected: string): AnswerCheck {
  const candidates = acceptableAnswers(expected);
  const given = normalize(input);

  if (!given) return { verdict: 'incorrect' };

  for (const candidate of candidates) {
    if (normalize(candidate) === given) {
      return { verdict: 'correct', matched: candidate };
    }
  }

  for (const candidate of candidates) {
    if (stripAccents(normalize(candidate)) === stripAccents(given)) {
      return {
        verdict: 'almost',
        matched: candidate,
        hint: 'Let op de accenten.',
      };
    }
  }

  return { verdict: 'incorrect' };
}

/** Whether a verdict counts as knowing the item, for mastery and scoring. */
export function isCorrect(verdict: AnswerVerdict): boolean {
  return verdict === 'correct' || verdict === 'almost';
}

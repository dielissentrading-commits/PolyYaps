import type { Recording } from './recorder';

/**
 * Speaking evaluation — architecture section 18.
 *
 * V1 records locally and lets the learner judge their own attempt against the
 * target audio. The interface is the point: a remote provider can be added
 * later without lesson components learning anything about it.
 */

export interface SpeechAttempt {
  recording: Recording;
  /** What the learner was asked to say. */
  target: string;
}

export interface SpeechFeedback {
  /** Whether the attempt counts as successful, for mastery. */
  accepted: boolean;
  /** Short feedback in the learner's language, when a provider can give it. */
  message?: string;
  /** Transcript, when a provider produces one. */
  transcript?: string;
}

export interface SpeechService {
  readonly name: string;
  /** True when this provider can evaluate without the learner judging. */
  readonly automatic: boolean;
  evaluate(attempt: SpeechAttempt, selfAssessment?: boolean): Promise<SpeechFeedback>;
}

/**
 * The V1 provider: no evaluation, the learner compares their recording with
 * the target audio and says whether it matched.
 */
export const localRecorderProvider: SpeechService = {
  name: 'local-recorder',
  automatic: false,
  async evaluate(_attempt, selfAssessment = false) {
    return {
      accepted: selfAssessment,
      message: selfAssessment
        ? 'Mooi. Blijf hardop oefenen.'
        : 'Luister nog eens naar het origineel en probeer opnieuw.',
    };
  },
};

let provider: SpeechService = localRecorderProvider;

export function getSpeechService(): SpeechService {
  return provider;
}

/** Swaps in another provider, e.g. a remote evaluator in a later version. */
export function setSpeechService(next: SpeechService): void {
  provider = next;
}

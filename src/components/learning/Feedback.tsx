import { Icon } from '@/components/ui/Icon';
import type { AnswerCheck } from '@/engine/answers';
import './learning.css';

interface FeedbackProps {
  check: AnswerCheck;
  /** What the learner answered, shown next to the correct form when wrong. */
  given: string;
  expected: string;
  xp?: number;
  onListen?: () => void;
  onMarkForReview?: () => void;
  marked?: boolean;
}

/**
 * Correct and incorrect states from docs/06-app-design.md: a small success
 * marker rather than a full-screen takeover, and a calm correction that shows
 * both answers without losing a life or blocking progress.
 */
export function Feedback({
  check,
  given,
  expected,
  xp,
  onListen,
  onMarkForReview,
  marked,
}: FeedbackProps) {
  if (check.verdict === 'incorrect') {
    return (
      <section className="feedback feedback--wrong" role="status">
        <p className="feedback__title">Bijna niet — kijk even mee</p>

        <dl className="feedback__compare">
          {given.trim() && (
            <div className="feedback__row">
              <dt>Jouw antwoord</dt>
              <dd className="feedback__given">{given}</dd>
            </div>
          )}
          <div className="feedback__row">
            <dt>Correct</dt>
            <dd className="feedback__expected" lang="pt-PT">
              {expected}
            </dd>
          </div>
        </dl>

        <div className="feedback__actions">
          {onListen && (
            <button type="button" className="feedback__action" onClick={onListen}>
              <Icon name="sound" size={18} />
              <span>Nog eens horen</span>
            </button>
          )}
          {onMarkForReview && (
            <button
              type="button"
              className={marked ? 'feedback__action feedback__action--on' : 'feedback__action'}
              onClick={onMarkForReview}
              aria-pressed={marked}
            >
              <Icon name="review" size={18} />
              <span>{marked ? 'Staat in review' : 'Later herhalen'}</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="feedback feedback--right" role="status">
      <span className="feedback__mark">
        <Icon name="check" size={16} />
      </span>
      <p className="feedback__title">
        {check.verdict === 'almost' ? 'Goed — ' + check.hint : 'Correct'}
      </p>
      {typeof xp === 'number' && xp > 0 && <span className="feedback__xp">+{xp} XP</span>}
    </section>
  );
}

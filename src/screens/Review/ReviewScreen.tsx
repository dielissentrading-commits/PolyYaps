import { TopBar } from '@/components/layout/TopBar';
import { ButtonLink } from '@/components/ui/Button';
import { StatCard } from '@/components/cards/StatCard';
import { useProgress } from '@/hooks/useProgress';
import './ReviewScreen.css';

export function ReviewScreen() {
  const { review, vocabulary } = useProgress();
  const hasWork = review.dueCount > 0;

  return (
    <>
      <TopBar title="Smart Review" subtitle="Spaced repetition en zwakke items" />

      <div className="page">
        <section className="card review__hero">
          <span className="eyebrow">{hasWork ? 'Klaar om te herhalen' : 'Nog niets te herhalen'}</span>
          <p className="review__count">{review.dueCount} items</p>
          <p className="muted small">
            {hasWork
              ? `± ${review.estimatedMinutes} minuten · gemengd woorden, chunks en luisteren`
              : 'Rond eerst een les af. Wat je leert komt hier vanzelf terug.'}
          </p>
          {hasWork ? (
            <ButtonLink to="/review/session" fullWidth>
              Start review
            </ButtonLink>
          ) : (
            <span className="btn btn--primary btn--full review__disabled" aria-disabled="true">
              Start review
            </span>
          )}
        </section>

        <section className="section--tight review__stats">
          <StatCard label="Zwakke items" value={review.weakCount} />
          <StatCard label="Actieve woorden" value={vocabulary.itemsActive} />
        </section>

        {review.focusLabel && (
          <section className="section">
            <div className="section-header">
              <h2 className="eyebrow">Focus vandaag</h2>
            </div>
            <div className="card review__focus">
              <div className="review__focus-head">
                <span className="chip chip--primary">{review.focusCategory}</span>
              </div>
              <h3 className="review__focus-title">{review.focusLabel}</h3>
              <p className="muted small">{review.focusHint}</p>
            </div>
          </section>
        )}


      </div>
    </>
  );
}

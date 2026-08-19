import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { ButtonLink } from '@/components/ui/Button';
import { ExercisePlayer } from '@/components/learning/ExercisePlayer';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { buildReviewSteps } from '@/engine/exercises';
import { getItem } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import type { AnswerResult } from '@/types';
import './ReviewSessionScreen.css';

/**
 * Smart Review — architecture section 11.
 *
 * The queue decides what comes back and in what order; this screen only runs
 * it. Answers feed the same mastery and scheduling engines a lesson uses, so
 * reviewing genuinely moves items forward.
 */
export function ReviewSessionScreen() {
  const { reviewQueue, recordAnswers, user } = useProgress();
  const [summary, setSummary] = useState<{ answered: number; correct: number } | null>(null);

  // The queue is captured when the session starts: answering updates item
  // progress, and the session must not reshuffle underneath the learner.
  const [steps] = useState(() => {
    const entries = reviewQueue
      .map((progress) => ({ progress, item: getItem(progress.itemId) }))
      .filter(
        (entry): entry is { progress: (typeof reviewQueue)[number]; item: NonNullable<typeof entry.item> } =>
          Boolean(entry.item),
      );

    return buildReviewSteps(entries, { seed: `review-${user.currentDay}` });
  });

  if (steps.length === 0 && !summary) {
    return <Navigate to="/review" replace />;
  }

  const finish = (results: AnswerResult[]) => {
    recordAnswers(results);
    setSummary({
      answered: results.length,
      correct: results.filter((result) => result.correct).length,
    });
  };

  if (summary) {
    const score = summary.answered
      ? Math.round((summary.correct / summary.answered) * 100)
      : 0;

    return (
      <FocusShell
        title="Review afgerond"
        closeTo="/review"
        footer={
          <ButtonLink to="/" fullWidth>
            Terug naar home
          </ButtonLink>
        }
      >
        <div className="review-done">
          <p className="review-done__score">{score}%</p>
          <p className="muted small">
            {summary.correct} van {summary.answered} goed
          </p>
          <div className="review-done__bar">
            <ProgressBar value={score} label="Reviewscore" tone={score >= 75 ? 'success' : 'primary'} />
          </div>
          <p className="muted small review-done__note">
            Items die je fout had komen morgen terug. De rest schuift verder vooruit.
          </p>
        </div>
      </FocusShell>
    );
  }

  return (
    <ExercisePlayer
      title="Smart Review"
      steps={steps}
      closeTo="/review"
      finishLabel="Afronden"
      onFinish={finish}
      currentDay={user.currentDay}
    />
  );
}

export default ReviewSessionScreen;

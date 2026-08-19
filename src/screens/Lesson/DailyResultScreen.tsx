import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { ButtonLink } from '@/components/ui/Button';
import { Stars } from '@/components/gamification/Indicators';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { getDay } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import type { StarCount } from '@/types';
import './DailyResultScreen.css';

/** Star thresholds — architecture section 16. */
function starsFor(score: number): StarCount {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  return 1;
}

/**
 * Daily result — screen 9 in docs/06-app-design.md.
 * Shows what the learner actually answered in this session.
 */
export function DailyResultScreen() {
  const { day } = useParams();
  const { session, clearSession } = useProgress();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;

  const summary = useMemo(() => {
    const answers = session?.answers ?? [];
    if (answers.length === 0) return undefined;

    const totalWeight = answers.reduce((sum, answer) => sum + answer.weight, 0);
    const earned = answers
      .filter((answer) => answer.correct)
      .reduce((sum, answer) => sum + answer.weight, 0);

    return {
      answered: answers.length,
      correct: answers.filter((answer) => answer.correct).length,
      score: totalWeight ? Math.round((earned / totalWeight) * 100) : 0,
    };
  }, [session]);

  // The session belongs to this screen now; leaving starts a fresh one.
  useEffect(() => clearSession, [clearSession]);

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  return (
    <FocusShell
      title={`Dag ${lesson.day}`}
      closeTo="/"
      footer={
        <ButtonLink to="/" fullWidth>
          Terug naar home
        </ButtonLink>
      }
    >
      <div className="result">
        {summary ? (
          <>
            <div className="result__hero">
              <Stars count={starsFor(summary.score)} />
              <p className="result__score">{summary.score}%</p>
              <p className="muted small">
                {summary.correct} van {summary.answered} goed beantwoord
              </p>
            </div>

            <div className="result__bar">
              <ProgressBar
                value={summary.score}
                label="Dagscore"
                tone={summary.score >= 75 ? 'success' : 'primary'}
              />
            </div>
          </>
        ) : (
          <div className="result__hero">
            <p className="result__score">—</p>
            <p className="muted small">
              Nog geen antwoorden in deze les. Werk een module af om een score te zien.
            </p>
          </div>
        )}

        <div className="placeholder result__note">
          <span className="placeholder__title">Nog niet opgeslagen</span>
          Deze score verdwijnt als je de app sluit. Opslag, mastery, XP en streak komen in de
          volgende versies.
        </div>
      </div>
    </FocusShell>
  );
}

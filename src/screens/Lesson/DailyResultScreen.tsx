import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { ButtonLink } from '@/components/ui/Button';
import { Stars } from '@/components/gamification/Indicators';
import { SkillBar } from '@/components/progress/SkillBar';
import { getDay } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import type { LessonProgress, SkillKey } from '@/types';
import './DailyResultScreen.css';

const SKILL_LABELS: Array<[keyof LessonProgress, SkillKey, string]> = [
  ['vocabularyScore', 'vocabulary', 'Woordenschat'],
  ['listeningScore', 'listening', 'Luisteren'],
  ['speakingScore', 'speaking', 'Spreken'],
  ['practicalScore', 'practical', 'Praktisch Portugees'],
];

/**
 * Daily result — screen 9 in docs/06-app-design.md.
 * Completing the lesson happens here: it is the moment the day is finished.
 */
export function DailyResultScreen() {
  const { day } = useParams();
  const { session, completeLesson, clearSession, lessonProgressFor, user, persistent } =
    useProgress();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;

  const [record, setRecord] = useState<LessonProgress | undefined>();
  const submitted = useRef(false);

  // Finish the day exactly once, however often this screen re-renders.
  useEffect(() => {
    if (submitted.current || !lesson) return;
    if (!session || session.answers.length === 0) {
      setRecord(lessonProgressFor(lesson.day));
      return;
    }
    submitted.current = true;

    void completeLesson(lesson.day).then((result) => {
      setRecord(result);
      clearSession();
    });
  }, [lesson, session, completeLesson, clearSession, lessonProgressFor]);

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  const skills = record
    ? SKILL_LABELS.filter(([field]) => typeof record[field] === 'number')
    : [];

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
        {record ? (
          <>
            <div className="result__hero">
              <Stars count={record.stars} />
              <p className="result__score">{record.lessonScore}%</p>
              <p className="muted small">{lesson.title}</p>
            </div>

            <div className="result__rewards">
              <span className="chip chip--primary">+{record.xpEarned} XP</span>
              <span className="chip">Streak {user.streak}</span>
              <span className="chip">{record.timeSpentMinutes} min</span>
            </div>

            {skills.length > 0 && (
              <section className="section--tight">
                <h2 className="eyebrow">Vaardigheden vandaag</h2>
                <div className="stack--4 stack result__skills">
                  {skills.map(([field, key, label]) => (
                    <SkillBar key={key} label={label} score={record[field] as number} />
                  ))}
                </div>
              </section>
            )}

            {!persistent && (
              <div className="placeholder result__note">
                <span className="placeholder__title">Niet opgeslagen</span>
                Deze browser staat geen lokale opslag toe, dus je voortgang verdwijnt als je de
                app sluit.
              </div>
            )}
          </>
        ) : (
          <div className="result__hero">
            <p className="result__score">—</p>
            <p className="muted small">
              Nog geen antwoorden in deze les. Werk een module af om een score te zien.
            </p>
          </div>
        )}
      </div>
    </FocusShell>
  );
}

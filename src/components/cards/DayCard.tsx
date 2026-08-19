import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Stars } from '@/components/gamification/Indicators';
import type { LessonDay, LessonProgress } from '@/types';
import './DayCard.css';

export type DayState = 'completed' | 'current' | 'locked';

interface DayCardProps {
  lesson: LessonDay;
  state: DayState;
  progress?: LessonProgress;
}

/** One row in the 30-day learning path. */
export function DayCard({ lesson, state, progress }: DayCardProps) {
  const to =
    lesson.checkpoint && lesson.challengeId
      ? `/challenge/${lesson.challengeId}`
      : `/lesson/${lesson.day}`;

  const content = (
    <>
      <span className={`day-card__marker day-card__marker--${state}`}>
        {state === 'completed' ? (
          <Icon name="check" size={18} />
        ) : state === 'locked' ? (
          <Icon name="lock" size={16} />
        ) : (
          lesson.day
        )}
      </span>

      <span className="day-card__body">
        <span className="day-card__head">
          <span className="day-card__day">Dag {lesson.day}</span>
          {lesson.checkpoint && <span className="day-card__checkpoint">Challenge</span>}
        </span>
        <span className="day-card__title">{lesson.title}</span>
        {state === 'completed' && progress && (
          <span className="day-card__result">
            <Stars count={progress.stars} />
            <span className="day-card__score">{progress.lessonScore}%</span>
          </span>
        )}
      </span>

      {state !== 'locked' && (
        <Icon name="chevron-right" size={20} className="day-card__chevron" />
      )}
    </>
  );

  if (state === 'locked') {
    return (
      <div className="day-card day-card--locked" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link to={to} className={`day-card day-card--${state}`}>
      {content}
    </Link>
  );
}

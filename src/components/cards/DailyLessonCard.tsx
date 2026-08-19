import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getPhaseTitle } from '@/content/pt-PT/course';
import type { LessonDay } from '@/types';
import './DailyLessonCard.css';

interface DailyLessonCardProps {
  lesson: LessonDay;
  totalDays: number;
}

/**
 * The dominant action on Home — docs/06-app-design.md, section 6D:
 * "The dominant action must always be Start lesson."
 */
export function DailyLessonCard({ lesson, totalDays }: DailyLessonCardProps) {
  return (
    <article className="daily-card">
      <div className="daily-card__top">
        <span className="daily-card__eyebrow">
          Dag {lesson.day} van {totalDays} · {getPhaseTitle(lesson.day)}
        </span>
        {lesson.checkpoint && <span className="daily-card__badge">Checkpoint</span>}
      </div>

      <h2 className="daily-card__title">{lesson.title}</h2>
      <p className="daily-card__description">{lesson.description}</p>

      <div className="daily-card__meta">
        <span className="daily-card__meta-item">≈ 60 min</span>
        <span className="daily-card__meta-dot" aria-hidden="true" />
        <span className="daily-card__meta-item">7 modules</span>
        <span className="daily-card__meta-dot" aria-hidden="true" />
        <span className="daily-card__meta-item">100 XP</span>
      </div>

      <ButtonLink
        to={lesson.checkpoint && lesson.challengeId
          ? `/challenge/${lesson.challengeId}`
          : `/lesson/${lesson.day}`}
        fullWidth
        trailing={<Icon name="chevron-right" size={20} />}
      >
        {lesson.checkpoint ? 'Start challenge' : 'Start les'}
      </ButtonLink>
    </article>
  );
}

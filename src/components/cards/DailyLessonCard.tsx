import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { countItems, countMinutes } from '@/content/pt-PT/course';
import type { CourseDay } from '@/types';
import './DailyLessonCard.css';

interface DailyLessonCardProps {
  lesson: CourseDay;
  totalDays: number;
}

/**
 * The dominant action on Home — docs/06-app-design.md, section 6D:
 * "The dominant action must always be Start lesson."
 */
export function DailyLessonCard({ lesson, totalDays }: DailyLessonCardProps) {
  const items = countItems(lesson);
  const minutes = countMinutes(lesson);

  return (
    <article className="daily-card">
      <div className="daily-card__top">
        <span className="daily-card__eyebrow">
          Dag {lesson.day} van {totalDays} · {lesson.phaseTitle}
        </span>
        {lesson.checkpoint && <span className="daily-card__badge">Checkpoint</span>}
      </div>

      <h2 className="daily-card__title">{lesson.title}</h2>
      <p className="daily-card__description">{lesson.goal}</p>

      <div className="daily-card__meta">
        <span className="daily-card__meta-item">≈ {minutes} min</span>
        <span className="daily-card__meta-dot" aria-hidden="true" />
        <span className="daily-card__meta-item">{lesson.modules.length} modules</span>
        {items > 0 && (
          <>
            <span className="daily-card__meta-dot" aria-hidden="true" />
            <span className="daily-card__meta-item">{items} items</span>
          </>
        )}
      </div>

      <ButtonLink
        to={
          lesson.checkpoint && lesson.challengeId
            ? `/challenge/${lesson.challengeId}`
            : `/lesson/${lesson.day}`
        }
        fullWidth
        trailing={<Icon name="chevron-right" size={20} />}
      >
        {lesson.checkpoint ? 'Start challenge' : 'Start les'}
      </ButtonLink>
    </article>
  );
}

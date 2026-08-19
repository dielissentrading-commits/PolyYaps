import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getDay, getPhaseTitle } from '@/content/pt-PT/course';
import { LESSON_MODULES } from '@/content/pt-PT/modules';
import './LessonScreen.css';

/**
 * Lesson detail — the module sequence for one day.
 * V0.1 renders the sequence and navigates it; V0.2 fills the modules with
 * real learning items.
 */
export function LessonScreen() {
  const { day } = useParams();
  const navigate = useNavigate();
  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  const totalMinutes = LESSON_MODULES.reduce((sum, module) => sum + module.estimatedMinutes, 0);

  return (
    <FocusShell
      title={`Dag ${lesson.day}`}
      closeTo="/learn"
      footer={
        <Button
          fullWidth
          trailing={<Icon name="chevron-right" size={20} />}
          onClick={() => navigate(`/lesson/${lesson.day}/${LESSON_MODULES[0].type}`)}
        >
          Start met {LESSON_MODULES[0].label}
        </Button>
      }
    >
      <div className="lesson">
        <span className="eyebrow">{getPhaseTitle(lesson.day)}</span>
        <h1 className="lesson__title">{lesson.title}</h1>
        <p className="lesson__description muted">{lesson.description}</p>

        <div className="lesson__meta">
          <span className="chip">≈ {totalMinutes} min</span>
          <span className="chip">{LESSON_MODULES.length} modules</span>
          <span className="chip chip--primary">100 XP</span>
        </div>

        <ol className="lesson__modules">
          {LESSON_MODULES.map((module, index) => (
            <li key={module.type}>
              <button
                type="button"
                className="lesson__module"
                onClick={() => navigate(`/lesson/${lesson.day}/${module.type}`)}
              >
                <span className="lesson__module-index">{index + 1}</span>
                <span className="lesson__module-body">
                  <span className="lesson__module-label">{module.label}</span>
                  <span className="lesson__module-description">{module.description}</span>
                </span>
                <span className="lesson__module-minutes">{module.estimatedMinutes}m</span>
                <Icon name="chevron-right" size={18} className="lesson__module-chevron" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </FocusShell>
  );
}

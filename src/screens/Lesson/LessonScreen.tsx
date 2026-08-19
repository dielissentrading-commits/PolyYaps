import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { countItems, countMinutes, getDay } from '@/content/pt-PT/course';
import { getModuleDefinition } from '@/content/pt-PT/modules';
import type { LessonModule } from '@/types';
import './LessonScreen.css';

/** How much material a module holds, for the row subtitle. */
function moduleSummary(module: LessonModule): string {
  if (module.items.length) return `${module.items.length} items`;
  if (module.notes?.length) return module.notes.map((note) => note.title).join(' · ');
  if (module.tasks?.length) return module.tasks.map((task) => task.title).join(' · ');
  return '';
}

/** Lesson detail — the module sequence for one day, driven by its content. */
export function LessonScreen() {
  const { day } = useParams();
  const navigate = useNavigate();
  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  const first = lesson.modules[0];
  const firstLabel = first ? (getModuleDefinition(first.type)?.label ?? first.type) : '';

  return (
    <FocusShell
      title={`Dag ${lesson.day}`}
      closeTo="/learn"
      footer={
        first && (
          <Button
            fullWidth
            trailing={<Icon name="chevron-right" size={20} />}
            onClick={() => navigate(`/lesson/${lesson.day}/${first.type}`)}
          >
            Start met {firstLabel}
          </Button>
        )
      }
    >
      <div className="lesson">
        <span className="eyebrow">{lesson.phaseTitle}</span>
        <h1 className="lesson__title">{lesson.title}</h1>
        <p className="lesson__description muted">{lesson.goal}</p>

        <div className="lesson__meta">
          <span className="chip">≈ {countMinutes(lesson)} min</span>
          <span className="chip">{lesson.modules.length} modules</span>
          {countItems(lesson) > 0 && <span className="chip">{countItems(lesson)} items</span>}
        </div>

        <ol className="lesson__modules">
          {lesson.modules.map((module, index) => {
            const definition = getModuleDefinition(module.type);
            return (
              <li key={module.id}>
                <button
                  type="button"
                  className="lesson__module"
                  onClick={() => navigate(`/lesson/${lesson.day}/${module.type}`)}
                >
                  <span className="lesson__module-index">{index + 1}</span>
                  <span className="lesson__module-body">
                    <span className="lesson__module-label">
                      {definition?.label ?? module.type}
                    </span>
                    <span className="lesson__module-description">{moduleSummary(module)}</span>
                  </span>
                  <span className="lesson__module-minutes">{module.estimatedMinutes}m</span>
                  <Icon name="chevron-right" size={18} className="lesson__module-chevron" />
                </button>
              </li>
            );
          })}
        </ol>

        <p className="lesson__hint muted small">
          Herhaling van eerdere dagen staat apart onder Review, zodat die zich aanpast aan wat
          je nog niet vasthoudt.
        </p>
      </div>
    </FocusShell>
  );
}

import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ExercisePlayer } from '@/components/learning/ExercisePlayer';
import { SpeakingModule } from './SpeakingModule';
import { buildListeningSteps, buildSteps, buildTestSteps } from '@/engine/exercises';
import { getDay } from '@/content/pt-PT/course';
import { getModuleDefinition } from '@/content/pt-PT/modules';
import { useProgress } from '@/hooks/useProgress';
import type { AnswerResult, LessonNote, LessonTask } from '@/types';
import './ModuleScreen.css';

/**
 * One module of a lesson.
 *
 * Modules with learning items run the shared player; grammar, listening and
 * speaking modules present their material and continue.
 */
export function ModuleScreen() {
  const { day, module } = useParams();
  const navigate = useNavigate();
  const { user, recordAnswers } = useProgress();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;
  const current = lesson?.modules.find((entry) => entry.type === module);

  const steps = useMemo(() => {
    if (!current) return [];
    // Listening asks the same question with the text hidden, so it needs its
    // own builder rather than the study-then-recall sequence.
    if (current.type === 'listening') {
      return buildListeningSteps(current.items, { seed: current.id });
    }
    if (current.type === 'test') {
      return buildTestSteps(current.items, { seed: current.id });
    }
    if (current.type === 'speaking') return [];
    return buildSteps(current.items, { currentDay: user.currentDay, seed: current.id });
  }, [current, user.currentDay]);

  if (!lesson || !current) {
    return <Navigate to={lesson ? `/lesson/${lesson.day}` : '/learn'} replace />;
  }

  const definition = getModuleDefinition(current.type);
  const moduleIndex = lesson.modules.findIndex((entry) => entry.id === current.id);
  const nextModule = lesson.modules[moduleIndex + 1];
  const nextLabel = nextModule
    ? (getModuleDefinition(nextModule.type)?.label ?? nextModule.type)
    : undefined;
  const finishLabel = nextLabel ? `Verder naar ${nextLabel}` : 'Naar resultaat';

  const finish = (results: AnswerResult[]) => {
    recordAnswers(results);
    navigate(
      nextModule ? `/lesson/${lesson.day}/${nextModule.type}` : `/lesson/${lesson.day}/result`,
    );
  };

  if (current.type === 'speaking' && (current.items.length > 0 || current.tasks?.length)) {
    return (
      <SpeakingModule
        title={definition?.label ?? current.type}
        tasks={current.tasks ?? []}
        items={current.items}
        closeTo={`/lesson/${lesson.day}`}
        finishLabel={finishLabel}
        onFinish={finish}
      />
    );
  }

  if (steps.length > 0) {
    return (
      <ExercisePlayer
        title={definition?.label ?? current.type}
        steps={steps}
        closeTo={`/lesson/${lesson.day}`}
        finishLabel={finishLabel}
        onFinish={finish}
        currentDay={lesson.day}
      />
    );
  }

  return (
    <FocusShell
      title={definition?.label ?? current.type}
      closeTo={`/lesson/${lesson.day}`}
      footer={
        <Button
          fullWidth
          onClick={() => finish([])}
          trailing={<Icon name="chevron-right" size={20} />}
        >
          {finishLabel}
        </Button>
      }
    >
      <div className="module">
        {current.notes?.map((note) => <NoteCard key={note.title} note={note} />)}
        {current.tasks?.map((task) => <TaskCard key={task.title} task={task} />)}
      </div>
    </FocusShell>
  );
}

function NoteCard({ note }: { note: LessonNote }) {
  return (
    <section className="module__panel">
      <h2 className="module__panel-title">{note.title}</h2>
      {note.body.map((paragraph) => (
        <p className="module__panel-body" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {note.points.length > 0 && (
        <ul className="module__points">
          {note.points.map((point) => (
            <li className="module__point" key={point} lang="pt-PT">
              {point}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TaskCard({ task }: { task: LessonTask }) {
  return (
    <section className="module__panel">
      <h2 className="module__panel-title">{task.title}</h2>
      {task.body.map((paragraph) => (
        <p className="module__panel-body" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {task.steps.length > 0 && (
        <ol className="module__steps">
          {task.steps.map((entry, position) => (
            <li className="module__step" key={entry}>
              <span className="module__step-index">{position + 1}</span>
              <span>{entry}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

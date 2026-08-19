import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getDay } from '@/content/pt-PT/course';
import { getModuleDefinition } from '@/content/pt-PT/modules';
import type { LearningItem, LessonNote, LessonTask } from '@/types';
import './ModuleScreen.css';

/**
 * Lesson player — docs/06-app-design.md, "Lesson player".
 *
 * It walks one module at a time: item modules step through their learning
 * items, note and task modules are a single screen. Exercises, answer checking
 * and audio are still to come; this presents the material and the flow.
 */
export function ModuleScreen() {
  const { day, module } = useParams();
  const navigate = useNavigate();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;
  const current = lesson?.modules.find((entry) => entry.type === module);

  const [step, setStep] = useState(1);

  // Moving to another module restarts the counter.
  useEffect(() => {
    setStep(1);
  }, [module]);

  if (!lesson || !current) {
    return <Navigate to={lesson ? `/lesson/${lesson.day}` : '/learn'} replace />;
  }

  const definition = getModuleDefinition(current.type);
  const totalSteps = Math.max(1, current.items.length);
  const isLastStep = step >= totalSteps;

  const moduleIndex = lesson.modules.findIndex((entry) => entry.id === current.id);
  const nextModule = lesson.modules[moduleIndex + 1];
  const nextLabel = nextModule
    ? (getModuleDefinition(nextModule.type)?.label ?? nextModule.type)
    : undefined;

  const advance = () => {
    if (!isLastStep) {
      setStep((value) => value + 1);
      return;
    }
    if (nextModule) {
      navigate(`/lesson/${lesson.day}/${nextModule.type}`);
    } else {
      navigate(`/lesson/${lesson.day}/result`);
    }
  };

  const item = current.items[step - 1];

  return (
    <FocusShell
      title={definition?.label ?? current.type}
      step={current.items.length ? step : undefined}
      totalSteps={current.items.length ? totalSteps : undefined}
      closeTo={`/lesson/${lesson.day}`}
      footer={
        <Button fullWidth onClick={advance} trailing={<Icon name="chevron-right" size={20} />}>
          {isLastStep ? (nextLabel ? `Verder naar ${nextLabel}` : 'Naar resultaat') : 'Volgende'}
        </Button>
      }
    >
      <div className="module">
        {item && <ItemCard item={item} lessonDay={lesson.day} />}
        {!item && current.notes?.map((note) => <NoteCard key={note.title} note={note} />)}
        {!item && current.tasks?.map((task) => <TaskCard key={task.title} task={task} />)}

        <div className="placeholder module__note">
          <span className="placeholder__title">Nog geen oefening</span>
          Je ziet de lesstof; actief ophalen, antwoordcontrole en audio komen in de volgende stap.
        </div>
      </div>
    </FocusShell>
  );
}

function ItemCard({ item, lessonDay }: { item: LearningItem; lessonDay: number }) {
  // An item introduced on an earlier day is reinforcement, not new material.
  const isRepeat = item.dayIntroduced < lessonDay;

  return (
    <div className="module__target">
      <p className="module__prompt muted small">
        {isRepeat
          ? `Herhaling uit dag ${item.dayIntroduced}`
          : item.type === 'chunk'
            ? 'Zin'
            : 'Woord'}
      </p>
      <p className="module__portuguese" lang="pt-PT">
        {item.portuguese}
      </p>
      <p className="module__translation muted">{item.dutch}</p>

      <button type="button" className="module__audio" disabled>
        <Icon name="sound" size={20} />
        <span>Luister</span>
      </button>
    </div>
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
          {task.steps.map((step, index) => (
            <li className="module__step" key={step}>
              <span className="module__step-index">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

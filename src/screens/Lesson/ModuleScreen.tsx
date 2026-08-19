import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StudyCard } from '@/components/learning/StudyCard';
import { ChoiceExercise } from '@/components/learning/ChoiceExercise';
import { InputExercise } from '@/components/learning/InputExercise';
import { Feedback } from '@/components/learning/Feedback';
import { playAudio } from '@/audio/playback';
import { checkAnswer, isCorrect, type AnswerCheck } from '@/engine/answers';
import { buildSteps } from '@/engine/exercises';
import { getDay } from '@/content/pt-PT/course';
import { getModuleDefinition } from '@/content/pt-PT/modules';
import { useProgress } from '@/hooks/useProgress';
import type { LessonNote, LessonTask } from '@/types';
import './ModuleScreen.css';

/** XP for a correct answer, before the XP engine takes over the real numbers. */
const XP_PER_CORRECT = 2;

/**
 * Lesson player — docs/06-app-design.md, "Lesson player".
 *
 * Item modules run a study-then-recall sequence; note and task modules are a
 * single screen. One learning target at a time, one dominant action, and a
 * correction that never blocks progress.
 */
export function ModuleScreen() {
  const { day, module } = useParams();
  const navigate = useNavigate();
  const { user, recordAnswers } = useProgress();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;
  const current = lesson?.modules.find((entry) => entry.type === module);

  const steps = useMemo(
    () =>
      current
        ? buildSteps(current.items, { currentDay: user.currentDay, seed: current.id })
        : [],
    [current, user.currentDay],
  );

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [check, setCheck] = useState<AnswerCheck | null>(null);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<
    Array<{ itemId: string; correct: boolean; weight: number }>
  >([]);

  const listen = useCallback((text: string) => {
    void playAudio({ text });
  }, []);

  if (!lesson || !current) {
    return <Navigate to={lesson ? `/lesson/${lesson.day}` : '/learn'} replace />;
  }

  const definition = getModuleDefinition(current.type);
  const hasSteps = steps.length > 0;
  const step = hasSteps ? steps[index] : undefined;
  const isExercise = step?.kind === 'exercise';
  const answered = check !== null;

  const moduleIndex = lesson.modules.findIndex((entry) => entry.id === current.id);
  const nextModule = lesson.modules[moduleIndex + 1];
  const nextLabel = nextModule
    ? (getModuleDefinition(nextModule.type)?.label ?? nextModule.type)
    : undefined;
  const isLastStep = !hasSteps || index >= steps.length - 1;

  const leaveModule = () => {
    recordAnswers(results);
    if (nextModule) {
      navigate(`/lesson/${lesson.day}/${nextModule.type}`);
    } else {
      navigate(`/lesson/${lesson.day}/result`);
    }
  };

  const submit = (given: string) => {
    if (!isExercise || answered) return;
    const verdict = checkAnswer(given, step.exercise.expected);
    setAnswer(given);
    setCheck(verdict);
    setResults((previous) => [
      ...previous,
      {
        itemId: step.exercise.itemId,
        correct: isCorrect(verdict.verdict),
        weight: step.exercise.weight,
      },
    ]);
  };

  const advance = () => {
    if (isLastStep) {
      leaveModule();
      return;
    }
    setIndex((value) => value + 1);
    setAnswer('');
    setCheck(null);
  };

  const toggleMark = () => {
    if (!isExercise) return;
    setMarked((previous) => {
      const next = new Set(previous);
      if (next.has(step.exercise.itemId)) next.delete(step.exercise.itemId);
      else next.add(step.exercise.itemId);
      return next;
    });
  };

  // The dominant action changes with the state of the current step.
  const primaryLabel = (() => {
    if (!isExercise) {
      return isLastStep ? (nextLabel ? `Verder naar ${nextLabel}` : 'Naar resultaat') : 'Volgende';
    }
    if (!answered) return 'Controleer';
    return isLastStep ? (nextLabel ? `Verder naar ${nextLabel}` : 'Naar resultaat') : 'Volgende';
  })();

  const primaryDisabled =
    isExercise && !answered && !step.exercise.options && answer.trim().length === 0;

  const onPrimary = () => {
    if (isExercise && !answered) submit(answer);
    else advance();
  };

  return (
    <FocusShell
      title={definition?.label ?? current.type}
      step={hasSteps ? index + 1 : undefined}
      totalSteps={hasSteps ? steps.length : undefined}
      closeTo={`/lesson/${lesson.day}`}
      footer={
        <Button
          fullWidth
          onClick={onPrimary}
          disabled={primaryDisabled}
          trailing={<Icon name="chevron-right" size={20} />}
        >
          {primaryLabel}
        </Button>
      }
    >
      <div className="module">
        {step?.kind === 'study' && (
          <StudyCard
            item={step.item}
            isRepeat={step.item.dayIntroduced < lesson.day}
            onListen={() => listen(step.item.portuguese)}
          />
        )}

        {step?.kind === 'exercise' && step.exercise.options && (
          <ChoiceExercise
            exercise={step.exercise}
            answered={answered ? answer : undefined}
            onChoose={submit}
          />
        )}

        {step?.kind === 'exercise' && !step.exercise.options && (
          <InputExercise
            exercise={step.exercise}
            value={answer}
            onChange={setAnswer}
            onSubmit={() => submit(answer)}
            locked={answered}
          />
        )}

        {isExercise && check && (
          <Feedback
            check={check}
            given={answer}
            expected={step.exercise.expected}
            xp={isCorrect(check.verdict) ? XP_PER_CORRECT : 0}
            onListen={() => listen(step.item.portuguese)}
            onMarkForReview={toggleMark}
            marked={marked.has(step.exercise.itemId)}
          />
        )}

        {!hasSteps && current.notes?.map((note) => <NoteCard key={note.title} note={note} />)}
        {!hasSteps && current.tasks?.map((task) => <TaskCard key={task.title} task={task} />)}
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

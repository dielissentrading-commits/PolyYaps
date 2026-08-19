import { useCallback, useEffect, useState } from 'react';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StudyCard } from './StudyCard';
import { ChoiceExercise } from './ChoiceExercise';
import { InputExercise } from './InputExercise';
import { Feedback } from './Feedback';
import { playAudio } from '@/audio/playback';
import { checkAnswer, isCorrect, type AnswerCheck } from '@/engine/answers';
import type { LessonStep } from '@/engine/exercises';
import type { AnswerResult } from '@/types';

/** XP shown per correct answer; the XP engine settles the real total. */
const XP_PER_CORRECT = 2;

interface ExercisePlayerProps {
  title: string;
  steps: LessonStep[];
  closeTo: string;
  /** Label for the final action, e.g. "Naar resultaat". */
  finishLabel: string;
  /** Called once, with everything answered, when the last step is done. */
  onFinish: (results: AnswerResult[]) => void;
  /** Day the material is being practised on, to label repeats. */
  currentDay: number;
}

/**
 * The lesson and review player.
 *
 * Both run the same loop — one target at a time, one dominant action, a calm
 * correction — so a review never behaves differently from a lesson.
 */
export function ExercisePlayer({
  title,
  steps,
  closeTo,
  finishLabel,
  onFinish,
  currentDay,
}: ExercisePlayerProps) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [check, setCheck] = useState<AnswerCheck | null>(null);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<AnswerResult[]>([]);

  // A different set of steps is a different session.
  useEffect(() => {
    setIndex(0);
    setAnswer('');
    setCheck(null);
    setResults([]);
  }, [steps]);

  const listen = useCallback((text: string) => {
    void playAudio({ text });
  }, []);

  const step = steps[index];
  const isExercise = step?.kind === 'exercise';

  // A listening exercise should sound as soon as it appears; the learner can
  // replay it, but should not have to press play to start.
  useEffect(() => {
    if (step?.kind === 'exercise' && step.exercise.audioOnly) {
      void playAudio({ text: step.item.portuguese });
    }
  }, [step]);
  const answered = check !== null;
  const isLastStep = index >= steps.length - 1;

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
        exerciseType: step.exercise.type,
        itemType: step.item.type,
      },
    ]);
  };

  const advance = () => {
    if (isLastStep) {
      onFinish(results);
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

  // Choosing an option submits it, so before answering the footer has nothing
  // to confirm on a choice question and nothing to check on an empty typed one.
  const primaryDisabled =
    isExercise &&
    !answered &&
    (Boolean(step.exercise.options) || answer.trim().length === 0);

  const primaryLabel = (() => {
    if (isExercise && !answered) {
      return step.exercise.options ? 'Kies een antwoord' : 'Controleer';
    }
    return isLastStep ? finishLabel : 'Volgende';
  })();

  return (
    <FocusShell
      title={title}
      step={index + 1}
      totalSteps={steps.length}
      closeTo={closeTo}
      footer={
        <Button
          fullWidth
          onClick={() => (isExercise && !answered ? submit(answer) : advance())}
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
            isRepeat={step.item.dayIntroduced < currentDay}
            onListen={() => listen(step.item.portuguese)}
          />
        )}

        {isExercise && step.exercise.options && (
          <ChoiceExercise
            exercise={step.exercise}
            answered={answered ? answer : undefined}
            onChoose={submit}
            onListen={() => listen(step.item.portuguese)}
          />
        )}

        {isExercise && !step.exercise.options && (
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
      </div>
    </FocusShell>
  );
}

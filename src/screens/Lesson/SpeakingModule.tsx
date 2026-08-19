import { useState } from 'react';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SpeakingPractice } from '@/components/learning/SpeakingPractice';
import { EXERCISE_WEIGHTS } from '@/engine/exercises';
import type { AnswerResult, LearningItem, LessonTask } from '@/types';
import './ModuleScreen.css';

interface SpeakingModuleProps {
  title: string;
  /** The day's speaking assignment, shown before practising. */
  tasks: LessonTask[];
  /** Sentences to say aloud, taken from the day's chunks. */
  items: LearningItem[];
  closeTo: string;
  finishLabel: string;
  onFinish: (results: AnswerResult[]) => void;
}

/**
 * Speaking module: read the assignment, then say the day's sentences aloud and
 * compare each attempt with the target audio.
 */
export function SpeakingModule({
  title,
  tasks,
  items,
  closeTo,
  finishLabel,
  onFinish,
}: SpeakingModuleProps) {
  const steps = [...(tasks.length ? ['task' as const] : []), ...items.map(() => 'say' as const)];
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);

  const isLastStep = index >= steps.length - 1;
  const kind = steps[index];
  const item = kind === 'say' ? items[index - (tasks.length ? 1 : 0)] : undefined;

  const advance = () => {
    if (isLastStep) {
      onFinish(results);
      return;
    }
    setIndex((value) => value + 1);
  };

  const assess = (accepted: boolean) => {
    if (!item) return;
    setResults((previous) => [
      ...previous.filter((result) => result.itemId !== item.id),
      {
        itemId: item.id,
        correct: accepted,
        weight: EXERCISE_WEIGHTS.speaking,
        exerciseType: 'speaking',
        itemType: item.type,
      },
    ]);
  };

  return (
    <FocusShell
      title={title}
      step={index + 1}
      totalSteps={steps.length}
      closeTo={closeTo}
      footer={
        <Button fullWidth onClick={advance} trailing={<Icon name="chevron-right" size={20} />}>
          {isLastStep ? finishLabel : 'Volgende'}
        </Button>
      }
    >
      <div className="module">
        {kind === 'task' &&
          tasks.map((task) => (
            <section className="module__panel" key={task.title}>
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
          ))}

        {item && (
          <SpeakingPractice
            key={item.id}
            target={item.portuguese}
            hint={item.dutch}
            onAssess={assess}
          />
        )}
      </div>
    </FocusShell>
  );
}

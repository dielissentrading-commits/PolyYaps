import type { Exercise } from '@/engine/exercises';
import './learning.css';

interface ChoiceExerciseProps {
  exercise: Exercise;
  /** Set once the learner has answered; disables further choices. */
  answered?: string;
  onChoose: (option: string) => void;
}

/** Recognition: read the Portuguese, choose the meaning. */
export function ChoiceExercise({ exercise, answered, onChoose }: ChoiceExerciseProps) {
  return (
    <div className="learn-card">
      <p className="learn-card__label muted small">Wat betekent dit?</p>
      <p className="learn-card__target" lang={exercise.promptLang}>
        {exercise.prompt}
      </p>

      <ul className="choices">
        {exercise.options?.map((option) => {
          const isChosen = answered === option;
          const isAnswer = option === exercise.expected;
          const state = !answered
            ? ''
            : isAnswer
              ? ' choice--correct'
              : isChosen
                ? ' choice--wrong'
                : ' choice--dimmed';

          return (
            <li key={option}>
              <button
                type="button"
                className={`choice${state}`}
                disabled={Boolean(answered)}
                onClick={() => onChoose(option)}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

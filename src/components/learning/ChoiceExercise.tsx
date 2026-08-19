import { Icon } from '@/components/ui/Icon';
import type { Exercise } from '@/engine/exercises';
import './learning.css';

interface ChoiceExerciseProps {
  exercise: Exercise;
  /** Set once the learner has answered; disables further choices. */
  answered?: string;
  onChoose: (option: string) => void;
  onListen?: () => void;
}

/**
 * Recognition: read the Portuguese and choose the meaning — or, in a listening
 * exercise, hear it with the text hidden until it has been answered.
 */
export function ChoiceExercise({
  exercise,
  answered,
  onChoose,
  onListen,
}: ChoiceExerciseProps) {
  const hideText = Boolean(exercise.audioOnly) && !answered;

  return (
    <div className="learn-card">
      <p className="learn-card__label muted small">
        {exercise.audioOnly ? 'Wat hoor je?' : 'Wat betekent dit?'}
      </p>

      {hideText ? (
        <button type="button" className="learn-card__listen" onClick={onListen}>
          <Icon name="sound" size={28} />
          <span>Speel af</span>
        </button>
      ) : (
        <p className="learn-card__target" lang={exercise.promptLang}>
          {exercise.prompt}
        </p>
      )}

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
